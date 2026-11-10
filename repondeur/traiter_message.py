#!/usr/bin/env python3
"""Transforme un appel enregistre en fiche dans la base locale.

Appele par Asterisk a la fin de chaque appel :
    traiter_message.py <dossier_de_l_appel> <numero_appelant>

Le dossier contient un fichier par question (1_nom.wav, 2_motif.wav...).
Tout se passe sur la machine du cabinet : transcription, resume, stockage.
"""
import json
import os
import sqlite3
import sys
import urllib.request
from datetime import datetime

import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recu_le TEXT NOT NULL,
    numero TEXT,
    nom TEXT, motif TEXT, praticien TEXT, rappel TEXT,
    resume TEXT,
    categorie TEXT,
    dossier TEXT UNIQUE,
    statut TEXT NOT NULL DEFAULT 'a traiter',
    pris_par TEXT,
    note TEXT,
    maj_le TEXT,
    transcription TEXT
)"""


def ouvrir_base():
    os.makedirs(os.path.dirname(config.BASE), exist_ok=True)
    base = sqlite3.connect(config.BASE)
    base.row_factory = sqlite3.Row
    base.execute(SCHEMA)
    colonnes = [c["name"] for c in base.execute("PRAGMA table_info(messages)")]
    if "transcription" not in colonnes:  # base creee avant l'agent vocal
        base.execute("ALTER TABLE messages ADD COLUMN transcription TEXT")
    return base


_modele = None


def transcrire(chemin):
    """Texte d'un fichier son. Un .txt voisin prime (tests, correction)."""
    texte = os.path.splitext(chemin)[0] + ".txt"
    if os.path.exists(texte):
        with open(texte, encoding="utf-8") as f:
            return f.read().strip()
    global _modele
    if _modele is None:
        from faster_whisper import WhisperModel
        _modele = WhisperModel(config.WHISPER_MODELE, device="cpu",
                               compute_type="int8")
    segments, _ = _modele.transcribe(chemin, language="fr", vad_filter=True)
    return " ".join(s.text.strip() for s in segments).strip()


def resumer(reponses):
    """Resume d'une ligne + categorie, par le modele local. Jamais bloquant."""
    repli = (reponses.get("motif", ""), "autre")
    if not config.OLLAMA_URL or not reponses.get("motif"):
        return repli
    consigne = (
        "Tu classes un message laisse sur le repondeur d'un cabinet dentaire.\n"
        "Reponds en JSON : {\"resume\": \"...\", \"categorie\": \"...\"}.\n"
        "- resume : une phrase factuelle reprenant la demande, sans rien ajouter.\n"
        f"- categorie : une seule parmi {config.CATEGORIES}.\n"
        "Tu n'evalues ni l'urgence ni la gravite, tu ne donnes aucun conseil.\n\n"
        f"Message : {reponses['motif']}"
    )
    try:
        requete = urllib.request.Request(
            config.OLLAMA_URL.rstrip("/") + "/api/generate",
            data=json.dumps({"model": config.OLLAMA_MODELE, "prompt": consigne,
                             "format": "json", "stream": False}).encode(),
            headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(requete, timeout=120) as r:
            sortie = json.loads(json.loads(r.read())["response"])
        categorie = sortie.get("categorie")
        if categorie not in config.CATEGORIES:
            categorie = "autre"
        return (str(sortie.get("resume") or repli[0]), categorie)
    except Exception as erreur:  # le message doit arriver meme sans resume
        print(f"resume indisponible : {erreur}", file=sys.stderr)
        return repli


def prevenir(identifiant, categorie, recu_le):
    if not config.WEBHOOK:
        return
    try:
        requete = urllib.request.Request(
            config.WEBHOOK,
            data=json.dumps({"id": identifiant, "categorie": categorie,
                             "recu_le": recu_le}).encode(),
            headers={"Content-Type": "application/json"})
        urllib.request.urlopen(requete, timeout=10).close()
    except Exception as erreur:
        print(f"webhook injoignable : {erreur}", file=sys.stderr)


def traiter(dossier, numero=""):
    dossier = os.path.abspath(dossier)
    reponses = {}
    for rang, etape in enumerate(config.ETAPES, 1):
        son = os.path.join(dossier, f"{rang}_{etape}.wav")
        if os.path.exists(son) or os.path.exists(son[:-4] + ".txt"):
            try:
                reponses[etape] = transcrire(son)
            except Exception as erreur:
                # Le son reste ecoutable dans le tableau : on ne perd rien.
                print(f"transcription de {son} : {erreur}", file=sys.stderr)
                reponses[etape] = "(a ecouter)"
    if not reponses:
        return None  # l'appelant a raccroche avant la premiere question

    resume, categorie = resumer(reponses)
    return enregistrer(dossier, numero, reponses, resume, categorie)


def enregistrer(dossier, numero, reponses, resume, categorie, transcription=None):
    """Cree la fiche. Sert au repondeur guide comme a l'agent vocal."""
    recu_le = datetime.now().isoformat(timespec="seconds")
    base = ouvrir_base()
    with base:
        curseur = base.execute(
            "INSERT OR IGNORE INTO messages (recu_le, numero, nom, motif, "
            "praticien, rappel, resume, categorie, dossier, maj_le, "
            "transcription) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (recu_le, numero, reponses.get("nom"), reponses.get("motif"),
             reponses.get("praticien"), reponses.get("rappel"), resume,
             categorie, os.path.abspath(dossier), recu_le, transcription))
    if not curseur.rowcount:
        return None  # appel deja traite
    prevenir(curseur.lastrowid, categorie, recu_le)
    return curseur.lastrowid


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    numero = sys.argv[2] if len(sys.argv) > 2 else ""
    print(traiter(sys.argv[1], numero))

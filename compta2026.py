#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
compta2026.py — Controle de completude des pieces comptables 2026
=================================================================
SELARL TIGHZA / TGS France.  Python 3, bibliotheque standard uniquement.

Ce script ne remplace pas le rapprochement 2025 (qui partait d'une liste de
reclamations TGS).  Ici la logique est inversee : on tient un REGISTRE au fil
de l'eau et le script verifie qu'il ne manque rien AVANT que le comptable ne
le demande.

Il repond a quatre questions :

  1. Les noms de fichiers respectent-ils la convention ?
  2. Manque-t-il un mois sur un fournisseur recurrent ?
  3. Y a-t-il des doublons ?
  4. Que reste-t-il a renommer ou a deposer sur le portail ?

USAGE
  python3 compta2026.py                      # lit registre_2026.csv
  python3 compta2026.py --registre autre.csv
  python3 compta2026.py --export suivi.csv   # CSV pour Google Sheets

Les regex de la convention de nommage sont en haut du fichier, commentees,
pour etre modifiables sans toucher au reste.
"""

import csv
import re
import sys
import argparse
from collections import defaultdict

# ---------------------------------------------------------------------------
#  LA CONVENTION DE NOMMAGE
# ---------------------------------------------------------------------------
#  AAAA-MM-JJ_FOURNISSEUR_TYPE_MONTANT_REFERENCE[_Pdebut-au-fin][_DUPLICATA].pdf
#
#  Exemple :
#  2026-03-17_MUTUALEASE_FACTURE_182.30_020-FL-30525487_P2026-04-01-au-2026-06-30.pdf
#
#  Pour modifier la convention, c'est ici et nulle part ailleurs.
# ---------------------------------------------------------------------------

TYPES_VALIDES = (
    # pieces comptables courantes
    "FACTURE", "AVOIR", "TICKET", "CONTRAT", "RELEVE", "ATTESTATION",
    # courriers, ajoutes le 02/09/2026
    "RELANCE", "INDU", "AFFILIATION", "AR",
    # ajoute pour 2026
    "RECU",
)

REGEX_NOM = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2})"          # date de la piece
    r"_(?P<fournisseur>[A-Z0-9][A-Z0-9-]*)"  # MAJUSCULES, tirets autorises
    r"_(?P<type>" + "|".join(TYPES_VALIDES) + r")"
    r"(?:_(?P<montant>\d+\.\d{2}))?"         # montant TTC, POINT decimal, facultatif
    r"(?:_(?P<reference>[^_]+))?"            # n de piece
    r"(?:_P(?P<periode>\d{4}-\d{2}-\d{2}-au-\d{4}-\d{2}-\d{2}))?"
    r"(?:_(?P<duplicata>DUPLICATA))?"
    r"\.pdf$"
)

# Etats possibles d'une piece, dans l'ordre du circuit.
ETATS = ("MANQUANT", "RECU", "RENOMME", "DEPOSE", "A_VERIFIER")

# ---------------------------------------------------------------------------
#  LES RECURRENTS  —  c'est ce tableau qui permet de detecter les trous
# ---------------------------------------------------------------------------
#  periodicite : "mensuel" (12 pieces/an) ou "trimestriel" (4/an)
#  debut / fin : bornes de l'abonnement dans l'exercice, format AAAA-MM.
#                Mettre None pour "toute l'annee".
# ---------------------------------------------------------------------------

RECURRENTS = {
    "COFICA":            {"periodicite": "mensuel",     "montant": "1353.76", "debut": None,      "fin": None},
    "GOOGLE-WORKSPACE":  {"periodicite": "mensuel",     "montant": "91.08",   "debut": None,      "fin": None},
    "ANTHROPIC":         {"periodicite": "mensuel",     "montant": "108.00",  "debut": "2026-02", "fin": None},
    "CANVA":             {"periodicite": "mensuel",     "montant": "12.00",   "debut": None,      "fin": None},
    "CMV-MEDIFORCE":     {"periodicite": "mensuel",     "montant": "80.00",   "debut": None,      "fin": None},
    "ARIES":             {"periodicite": "mensuel",     "montant": "990.00",  "debut": None,      "fin": None},
    "MUTUALEASE":        {"periodicite": "trimestriel", "montant": "182.30",  "debut": None,      "fin": None},
    "LA-FRAISE":         {"periodicite": "mensuel",     "montant": "119.00",  "debut": None,      "fin": None},
}
# MACSF n'y figure pas volontairement : l'avis d'echeance annuel est UNE piece,
# les 19,11 EUR mensuels sont des prelevements, pas douze factures.

ANNEE = "2026"

# On ne reclame pas une piece d'un mois qui n'est pas encore echu.  Un mois
# n'est considere comme du qu'une fois le mois SUIVANT commence : une facture
# de septembre arrive debut octobre.
import datetime
_auj = datetime.date.today()
DERNIER_MOIS_EXIGIBLE = (_auj.replace(day=1) - datetime.timedelta(days=1)).strftime("%Y-%m")


# ---------------------------------------------------------------------------
#  LECTURE DU REGISTRE
# ---------------------------------------------------------------------------

def lire_registre(chemin):
    """Lit le registre CSV (separateur ;).  Lignes vides et # ignorees."""
    pieces = []
    with open(chemin, encoding="utf-8-sig") as f:
        for num, brut in enumerate(f, start=1):
            ligne = brut.rstrip("\n")
            if not ligne.strip() or ligne.lstrip().startswith("#"):
                continue
            champs = [c.strip() for c in ligne.split(";")]
            if champs[0].lower() == "date_piece":       # en-tete
                continue
            if len(champs) < 7:
                print(f"  [!] ligne {num} mal formee, ignoree : {ligne[:60]}")
                continue
            while len(champs) < 9:
                champs.append("")
            pieces.append({
                "ligne":        num,
                "date":         champs[0],
                "fournisseur":  champs[1].upper(),
                "type":         champs[2].upper(),
                "montant":      champs[3],
                "reference":    champs[4],
                "periode":      champs[5],
                "etat":         champs[6].upper(),
                "emplacement":  champs[7],
                "note":         champs[8],
            })
    return pieces


def nom_attendu(p):
    """Reconstruit le nom de fichier que la piece DEVRAIT porter."""
    bouts = [p["date"], p["fournisseur"], p["type"]]
    if p["montant"]:
        bouts.append(p["montant"])
    if p["reference"]:
        bouts.append(p["reference"])
    nom = "_".join(bouts)
    if p["periode"]:
        nom += "_P" + p["periode"]
    return nom + ".pdf"


# ---------------------------------------------------------------------------
#  LES TROIS CONTROLES
# ---------------------------------------------------------------------------

def controler_nommage(pieces):
    """Verifie que chaque nom reconstruit passe la regex de la convention."""
    fautifs = []
    for p in pieces:
        if p["etat"] in ("MANQUANT", "A_VERIFIER"):
            continue                      # rien a nommer tant que la piece n'est pas la
        nom = nom_attendu(p)
        if not REGEX_NOM.match(nom):
            fautifs.append((p, nom))
    return fautifs


def mois_couverts(pieces, fournisseur):
    """Renvoie l'ensemble des mois AAAA-MM couverts par un fournisseur.
    On prend le mois de DEBUT DE PERIODE quand elle existe (c'est la periode
    qui compte, pas la date d'emission : lecon du bilan 2025), sinon le mois
    de la date de piece."""
    mois = set()
    for p in pieces:
        if p["fournisseur"] != fournisseur:
            continue
        if p["etat"] == "MANQUANT":
            continue
        ref = p["periode"][:7] if p["periode"] else p["date"][:7]
        if ref.startswith(ANNEE):
            mois.add(ref)
    return mois


def detecter_trous(pieces):
    """Pour chaque recurrent, liste les mois (ou trimestres) sans piece."""
    trous = {}
    for fournisseur, regle in RECURRENTS.items():
        presents = mois_couverts(pieces, fournisseur)
        if not presents:
            continue                      # fournisseur absent du registre : on ne suppose rien

        if regle["periodicite"] == "mensuel":
            attendus = [f"{ANNEE}-{m:02d}" for m in range(1, 13)]
        else:                             # trimestriel : janvier, avril, juillet, octobre
            attendus = [f"{ANNEE}-{m:02d}" for m in (1, 4, 7, 10)]

        if regle["debut"]:
            attendus = [m for m in attendus if m >= regle["debut"]]
        if regle["fin"]:
            attendus = [m for m in attendus if m <= regle["fin"]]
        # On ignore les mois pas encore echus : sinon le script reclame en
        # septembre les factures de novembre.
        attendus = [m for m in attendus if m <= DERNIER_MOIS_EXIGIBLE]

        manquants = [m for m in attendus if m not in presents]
        if manquants:
            trous[fournisseur] = manquants
    return trous


def detecter_doublons(pieces):
    """Deux pieces qui partagent fournisseur + montant + reference sont
    presque surement le meme document (cas Bredent 2025, depose 3 fois)."""
    index = defaultdict(list)
    for p in pieces:
        if p["etat"] == "MANQUANT" or not p["reference"]:
            continue
        cle = (p["fournisseur"], p["montant"], p["reference"])
        index[cle].append(p)
    return {k: v for k, v in index.items() if len(v) > 1}


# ---------------------------------------------------------------------------
#  AFFICHAGE
# ---------------------------------------------------------------------------

def euros(txt):
    """'1353.76' -> '1 353,76'."""
    try:
        v = float(txt)
    except (TypeError, ValueError):
        return ""
    ent, cent = divmod(round(v * 100), 100)
    return f"{ent:,}".replace(",", " ") + f",{cent:02d}"


def recap(pieces, trous, doublons, fautifs):
    print()
    print("=" * 72)
    print(f"  REGISTRE COMPTABLE {ANNEE}  —  SELARL TIGHZA")
    print("=" * 72)

    par_etat = defaultdict(list)
    for p in pieces:
        par_etat[p["etat"]].append(p)

    print(f"\n  Pieces au registre : {len(pieces)}\n")
    for e in ETATS:
        lot = par_etat.get(e, [])
        if not lot:
            continue
        total = sum(float(p["montant"]) for p in lot if p["montant"])
        print(f"    {e:<12} {len(lot):>3} piece(s)   {euros(str(total)):>12} EUR")

    a_faire = par_etat.get("RECU", []) + par_etat.get("RENOMME", [])
    if a_faire:
        print(f"\n  >>> {len(a_faire)} piece(s) pas encore sur le portail TGS")

    if fautifs:
        print(f"\n  NOMMAGE NON CONFORME ({len(fautifs)}) :")
        for p, nom in fautifs:
            print(f"    ligne {p['ligne']:>3} : {nom}")

    if trous:
        print("\n  TROUS SUR LES RECURRENTS :")
        for fournisseur, mois in sorted(trous.items()):
            regle = RECURRENTS[fournisseur]
            print(f"    {fournisseur} ({regle['periodicite']}, {euros(regle['montant'])} EUR) :")
            print(f"        manque {', '.join(mois)}")

    if doublons:
        print(f"\n  DOUBLONS PROBABLES ({len(doublons)}) :")
        for (f, m, r), lot in doublons.items():
            print(f"    {f} {euros(m)} EUR ref {r} — {len(lot)} occurrences "
                  f"(lignes {', '.join(str(p['ligne']) for p in lot)})")

    if not (fautifs or trous or doublons):
        print("\n  Aucune anomalie.")

    print("\n" + "=" * 72 + "\n")


def exporter(chemin, pieces):
    """CSV reimportable dans Google Sheets."""
    with open(chemin, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Fait", "Date piece", "Fournisseur", "Type", "Montant",
                    "Reference", "Periode", "Etat", "Nom de fichier attendu",
                    "Emplacement", "Note"])
        for p in pieces:
            w.writerow([
                "TRUE" if p["etat"] == "DEPOSE" else "FALSE",
                p["date"], p["fournisseur"], p["type"],
                euros(p["montant"]), p["reference"], p["periode"], p["etat"],
                nom_attendu(p) if p["etat"] != "MANQUANT" else "",
                p["emplacement"], p["note"],
            ])
    print(f"  Export -> {chemin}")


def main():
    ap = argparse.ArgumentParser(description="Controle des pieces comptables 2026")
    ap.add_argument("--registre", default="registre_2026.csv")
    ap.add_argument("--export", help="ecrit un CSV pour Google Sheets")
    args = ap.parse_args()

    try:
        pieces = lire_registre(args.registre)
    except FileNotFoundError:
        print(f"Registre introuvable : {args.registre}")
        return 1

    print(f"Registre : {args.registre}  ->  {len(pieces)} pieces")

    fautifs = controler_nommage(pieces)
    trous = detecter_trous(pieces)
    doublons = detecter_doublons(pieces)
    recap(pieces, trous, doublons, fautifs)

    if args.export:
        exporter(args.export, pieces)
    return 0


if __name__ == "__main__":
    sys.exit(main())

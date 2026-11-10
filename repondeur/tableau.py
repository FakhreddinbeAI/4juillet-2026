#!/usr/bin/env python3
"""Tableau des messages du repondeur, consultable depuis les postes du cabinet.

    tableau.py            lance le tableau (http://<machine>:8080)
    tableau.py --purger   efface sons et fiches clos depuis trop longtemps

La boucle : a traiter -> pris par quelqu'un -> clos. Rien ne disparait tant
que ce n'est pas clos, et ce qui attend trop longtemps passe en retard.
"""
import html
import json
import os
import shutil
import sys
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import config
from traiter_message import ouvrir_base

STYLE = """
body{font-family:system-ui,sans-serif;margin:0;background:#f4f5f7;color:#1c2330}
header{background:#1c2330;color:#fff;padding:12px 16px;display:flex;gap:16px;align-items:baseline;flex-wrap:wrap}
header a{color:#cfd6e4}h1{font-size:18px;margin:0}
main{padding:16px;max-width:900px;margin:auto}
.fiche{background:#fff;border-radius:8px;padding:14px 16px;margin-bottom:12px;border-left:6px solid #8a94a6}
.fiche.retard{border-left-color:#c62828}.fiche.pris{border-left-color:#2e7d32}
.haut{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px;color:#566074}
.resume{font-size:17px;margin:6px 0}.champ{margin:2px 0;font-size:14px}
.champ b{display:inline-block;min-width:90px;color:#566074;font-weight:600}
.etiquette{background:#e6e9f0;border-radius:10px;padding:1px 8px}
.retard .etiquette.age{background:#c62828;color:#fff}
form{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
input[type=text]{flex:1;min-width:160px;padding:6px}select,button{padding:6px 10px}
details{margin-top:6px;font-size:14px}pre{white-space:pre-wrap;font-family:inherit;margin:6px 0}
audio{height:28px;vertical-align:middle;max-width:220px}
"""


def e(valeur):
    return html.escape(str(valeur or ""))


def age_heures(ligne):
    recu = datetime.fromisoformat(ligne["recu_le"])
    return (datetime.now() - recu).total_seconds() / 3600


def en_retard(ligne):
    return ligne["statut"] == "a traiter" and age_heures(ligne) > config.RETARD_HEURES


def fiche(ligne, ouverte):
    classes = "fiche" + (" retard" if en_retard(ligne) else "") + \
        (" pris" if ligne["statut"] == "pris" else "")
    recu = datetime.fromisoformat(ligne["recu_le"])
    heures = age_heures(ligne)
    age = f"{int(heures * 60)} min" if heures < 1 else f"{int(heures)} h"
    champs = ""
    for rang, etape in enumerate(config.ETAPES, 1):
        son = f"{rang}_{etape}.wav"
        lecteur = ""
        if os.path.exists(os.path.join(ligne["dossier"], son)):
            lecteur = (f' <audio controls preload="none" '
                       f'src="/son/{ligne["id"]}/{son}"></audio>')
        if ligne[etape] or lecteur:
            champs += (f'<div class="champ"><b>{e(etape.capitalize())}</b> '
                       f'{e(ligne[etape])}{lecteur}</div>')
    if os.path.exists(os.path.join(ligne["dossier"], "appel.wav")):
        champs += (f'<div class="champ"><b>Appel</b> <audio controls preload="none" '
                   f'src="/son/{ligne["id"]}/appel.wav"></audio></div>')
    if ligne["transcription"]:
        champs += (f'<details><summary>Conversation</summary>'
                   f'<pre>{e(ligne["transcription"])}</pre></details>')
    suivi = ""
    if ligne["pris_par"]:
        suivi += f'<div class="champ"><b>Pris par</b> {e(ligne["pris_par"])}</div>'
    if ligne["note"]:
        suivi += f'<div class="champ"><b>Note</b> {e(ligne["note"])}</div>'
    actions = ""
    if ouverte:
        equipe = "".join(f"<option>{e(p)}</option>" for p in config.EQUIPE)
        actions = f"""<form method="post" action="/maj">
<input type="hidden" name="id" value="{ligne['id']}">
<select name="pris_par" required><option value="">Qui ?</option>{equipe}</select>
<input type="text" name="note" placeholder="Note (rappele, RDV pose...)" value="{e(ligne['note'])}">
<button name="statut" value="pris">Je prends</button>
<button name="statut" value="clos">Clos</button></form>"""
    return f"""<div class="{classes}"><div class="haut">
<span>{recu:%a %d/%m %H:%M} &middot; {e(ligne['numero']) or 'numero masque'}</span>
<span><span class="etiquette">{e(ligne['categorie'])}</span>
<span class="etiquette age">{e(ligne['statut'])} &middot; {age}</span></span></div>
<div class="resume">{e(ligne['resume'])}</div>{champs}{suivi}{actions}</div>"""


def page(base, clos=False):
    if clos:
        lignes = base.execute("SELECT * FROM messages WHERE statut='clos' "
                              "ORDER BY maj_le DESC LIMIT 100").fetchall()
        titre, lien = "Messages clos", '<a href="/">Messages ouverts</a>'
    else:
        lignes = base.execute("SELECT * FROM messages WHERE statut!='clos' "
                              "ORDER BY recu_le").fetchall()
        titre, lien = f"Messages a traiter ({len(lignes)})", '<a href="/clos">Clos</a>'
    corps = "".join(fiche(l, not clos) for l in lignes) or "<p>Aucun message.</p>"
    rafraichir = "" if clos else '<meta http-equiv="refresh" content="60">'
    return f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">{rafraichir}
<title>Repondeur</title><style>{STYLE}</style></head><body>
<header><h1>{titre}</h1>{lien}</header><main>{corps}</main></body></html>"""


def synthese(base):
    """Chiffres pour le brief du matin et les relances N8N. Aucun nom."""
    lignes = base.execute("SELECT * FROM messages WHERE statut!='clos'").fetchall()
    par_categorie = {}
    for l in lignes:
        par_categorie[l["categorie"]] = par_categorie.get(l["categorie"], 0) + 1
    return {"a_traiter": sum(l["statut"] == "a traiter" for l in lignes),
            "pris": sum(l["statut"] == "pris" for l in lignes),
            "en_retard": sum(en_retard(l) for l in lignes),
            "par_categorie": par_categorie}


class Tableau(BaseHTTPRequestHandler):
    def repondre(self, code, corps, genre="text/html; charset=utf-8"):
        if isinstance(corps, str):
            corps = corps.encode()
        self.send_response(code)
        self.send_header("Content-Type", genre)
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_GET(self):
        chemin = urlparse(self.path).path
        base = ouvrir_base()
        if chemin == "/":
            self.repondre(200, page(base))
        elif chemin == "/clos":
            self.repondre(200, page(base, clos=True))
        elif chemin == "/synthese.json":
            self.repondre(200, json.dumps(synthese(base)), "application/json")
        elif chemin.startswith("/son/"):
            self.son(base, chemin.split("/")[2:])
        else:
            self.repondre(404, "Introuvable")

    def son(self, base, morceaux):
        # Seuls les fichiers prevus par les etapes sont servis : pas de chemin libre.
        permis = {f"{r}_{etape}.wav" for r, etape in enumerate(config.ETAPES, 1)}
        permis.add("appel.wav")
        if len(morceaux) != 2 or not morceaux[0].isdigit() or morceaux[1] not in permis:
            return self.repondre(404, "Introuvable")
        ligne = base.execute("SELECT dossier FROM messages WHERE id=?",
                             (morceaux[0],)).fetchone()
        fichier = os.path.join(ligne["dossier"], morceaux[1]) if ligne else ""
        if not os.path.isfile(fichier):
            return self.repondre(404, "Introuvable")
        with open(fichier, "rb") as f:
            self.repondre(200, f.read(), "audio/wav")

    def do_POST(self):
        if urlparse(self.path).path != "/maj":
            return self.repondre(404, "Introuvable")
        taille = int(self.headers.get("Content-Length") or 0)
        champs = {k: v[0] for k, v in parse_qs(self.rfile.read(taille).decode()).items()}
        if champs.get("statut") not in ("pris", "clos") or not champs.get("id", "").isdigit():
            return self.repondre(400, "Demande incomplete")
        base = ouvrir_base()
        with base:
            base.execute("UPDATE messages SET statut=?, pris_par=?, note=?, maj_le=? WHERE id=?",
                         (champs["statut"], champs.get("pris_par", ""), champs.get("note", ""),
                          datetime.now().isoformat(timespec="seconds"), champs["id"]))
        self.send_response(303)
        self.send_header("Location", "/")
        self.end_headers()

    def log_message(self, *args):  # pas de journal d'acces : il contiendrait des heures d'appel
        pass


def purger():
    limite = (datetime.now() - timedelta(days=config.CONSERVATION_JOURS)).isoformat()
    base = ouvrir_base()
    vieux = base.execute("SELECT id, dossier FROM messages WHERE statut='clos' "
                         "AND maj_le < ?", (limite,)).fetchall()
    for ligne in vieux:
        shutil.rmtree(ligne["dossier"], ignore_errors=True)
    with base:
        base.execute("DELETE FROM messages WHERE statut='clos' AND maj_le < ?", (limite,))
    print(f"{len(vieux)} message(s) efface(s)")


if __name__ == "__main__":
    if "--purger" in sys.argv:
        purger()
    else:
        print(f"Tableau sur le port {config.PORT_TABLEAU}")
        ThreadingHTTPServer(("0.0.0.0", config.PORT_TABLEAU), Tableau).serve_forever()

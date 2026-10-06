#!/usr/bin/env python3
"""
Contre-expertise de l index : on ne lui fait PAS confiance.

POURQUOI. Deux fois le 6 octobre l index a rate des pieces pourtant deposees,
les deux fois pour la meme raison — une lettre ou un tiret au milieu de la
reference casse la suite de chiffres dans le nom du fichier
(« 020-FC-01179765 » depose en « 020 FC 01179765 », « 04753-52817600 » depose
en « 04753 52817600 »). Chaque trou m a fait annoncer un faux chiffre.

Corriger au coup par coup ne vaut rien : il faut un controle qui ne repose pas
sur la meme heuristique. Celui-ci jette donc un filet TRES large et rend des
CANDIDATS a lire a l oeil, pas un verdict. Trop de bruit est acceptable ; un
silence qui cache une piece deposee ne l est pas.

TROIS FILETS, independants l un de l autre :
  - par NOM de fournisseur (mot de 4 lettres ou plus du libelle registre)
  - par CHIFFRES, seuil abaisse a 4 et chaque groupe pris isolement
  - par MONTANT, ecrit comme dans les noms de fichiers (1353.76, 1353 76...)
"""

import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_portail import lignes
from index_portail import charger, chiffres_de, plat

# Mots trop courants pour designer un fournisseur : ils ramenent tout.
BRUIT = {"facture", "factures", "releve", "releves", "copie", "scan", "pdf",
         "euros", "euro", "paye", "regle", "reglee", "virement", "cheque",
         "france", "dental", "dentaire", "cabinet", "selarl", "tighza",
         "avoir", "relance", "attestation", "bnp", "lcl", "compta", "mois",
         "invoice", "receipt", "document", "jpg", "xlsx", "note"}


def mots_de(s):
    return {m for m in re.split(r"[^a-z0-9]+", plat(s))
            if len(m) >= 4 and not m.isdigit() and m not in BRUIT}


def variantes_montant(m):
    """Un montant tel qu il peut etre ecrit dans un nom de fichier."""
    if not m:
        return set()
    try:
        v = float(m)
    except ValueError:
        return set()
    if v <= 0:
        return set()
    s = "%.2f" % v
    e, d = s.split(".")
    return {s, e + " " + d, e + "," + d, e + d, e}


def main(reg, *hist):
    depots = []
    for f in hist:
        depots.extend(charger(f))
    vus = {}
    for d in depots:
        if d["nom"] not in vus or d["statut"]:
            vus[d["nom"]] = d
    depots = list(vus.values())
    for d in depots:
        d["plat"] = plat(d["nom"])
        d["mots"] = mots_de(d["nom"])
        d["chiffres"] = chiffres_de(d["nom"]) | set(
            re.findall(r"\d{4,}", plat(d["nom"])))

    print("Contre-expertise : %d depots, filet large, candidats a lire.\n"
          % len(depots))

    for p in lignes(reg):
        etat = (p.get("etat") or "").strip().upper()
        if etat.startswith("DEPOSEE") or etat.startswith("HORS"):
            continue
        ref = (p.get("reference") or "").strip()
        fou = p["fournisseur"]
        mf = mots_de(fou)
        groupes = set(re.findall(r"\d{4,}", ref))
        if ref:
            colle = re.sub(r"\D", "", ref)
            if len(colle) >= 4:
                groupes.add(colle)
        groupes = {g for g in groupes
                   if not re.match(r"(19|20)\d\d$", g)}
        vm = variantes_montant(p.get("montant"))

        cands = []
        for d in depots:
            pourquoi = []
            if mf & d["mots"]:
                pourquoi.append("nom:" + ",".join(sorted(mf & d["mots"]))[:24])
            inter = {g for g in groupes
                     if g in d["chiffres"]
                     or any(k.startswith(g) or k.endswith(g)
                            for k in d["chiffres"] if len(g) >= 5)}
            if inter:
                pourquoi.append("num:" + ",".join(sorted(inter))[:28])
            hit = {x for x in vm if x in d["plat"]}
            if hit and len(max(hit, key=len)) >= 6:
                pourquoi.append("montant")
            if pourquoi:
                cands.append((d, pourquoi))

        print("=" * 78)
        print("%s  ref=%s  montant=%s  etat=%s"
              % (fou, ref or "(aucune)", p.get("montant") or "-", p["etat"]))
        if not cands:
            print("   aucun candidat sur les trois filets.")
        for d, pq in cands[:12]:
            print("   %-54s %-22s %s"
                  % (d["nom"][:54], d["statut"] or "-", " | ".join(pq)))
        if len(cands) > 12:
            print("   ... et %d autres candidats" % (len(cands) - 12))
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

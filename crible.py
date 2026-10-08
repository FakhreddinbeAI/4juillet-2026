#!/usr/bin/env python3
"""
Passe les pieces « a trier » au crible de TOUT le libelle du debit.

POURQUOI. Le 08/10/2026 j ai decouvert que chaque prelevement Cofica porte
« BASDD<AAAAMMJJ> » dans sa REF.CLIENT, et que ces huit chiffres sont la date
de la facture payee. Pendant deux jours j avais ecrit que les dix
prelevements Cofica etaient inappariables parce qu ils font tous 1 353,76 au
centime. Je ne lisais que le DEBUT du libelle.

Ce script lit tout. Pour chaque piece dont le paiement n est pas prouve, il
cherche dans l integralite des libelles de debit :
  - la REFERENCE de la piece, par suites de chiffres de 5 et plus
  - sa DATE, sous les formes AAAAMMJJ, JJMMAAAA et AAMMJJ
  - son MONTANT

Il NE TRANCHE PAS. Il rend des candidats a lire, avec ce qui a declenche la
correspondance et le libelle entier. C est a l oeil de conclure — mais a
l oeil sur des candidats, pas sur 203 debits.
"""

import csv
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index_portail import cherche, construire


def lignes(chemin):
    brut = [l for l in io.open(chemin, encoding="utf-8")
            if l.strip() and not l.startswith("#")]
    return list(csv.DictReader(brut, delimiter=";"))


def main(reg, lcl, *hist):
    debits = [x for x in csv.DictReader(io.open(lcl, encoding="utf-8"),
                                        delimiter=";") if x.get("debit")]
    for d in debits:
        d["chiffres"] = re.sub(r"\D", "", d["libelle_complet"])
        d["m"] = round(float(d["debit"]), 2)

    trouves, rien = [], []
    for p in lignes(reg):
        if (p.get("cycle") or "").strip() != "A_TRIER":
            continue
        ref = re.sub(r"\D", "", p.get("reference") or "")
        d8 = (p.get("date_piece") or "").replace("-", "")
        try:
            mt = round(float(p["montant"]), 2)
        except (ValueError, KeyError, TypeError):
            mt = None

        # les cles a chercher, de la plus probante a la moins
        cles = []
        if len(ref) >= 5:
            cles.append((ref, "reference %s" % ref))
            for g in re.findall(r"\d{5,}", p.get("reference") or ""):
                if g != ref:
                    cles.append((g, "fragment de reference %s" % g))
        if len(d8) == 8:
            cles.append((d8, "date AAAAMMJJ"))
            cles.append((d8[6:8] + d8[4:6] + d8[0:4], "date JJMMAAAA"))
            # PAS la forme AAMMJJ : elle est CONTENUE dans AAAAMMJJ, donc
            # elle ne constitue pas un second indice. Comptee a part, elle
            # faisait passer 13 coincidences pour des correspondances
            # solides — un seul fait compte deux fois.

        cands = []
        for d in debits:
            pq = [q for k, q in cles if k and k in d["chiffres"]]
            if mt and d["m"] == mt:
                pq.append("montant %.2f" % mt)
            if pq:
                cands.append((d, pq))
        # Un candidat ne vaut que si le DEBIT EST BIEN CELUI DE CE
        # FOURNISSEUR. Une date commune entre fournisseurs differents est une
        # coincidence : un prelevement MACSF ne paie pas une facture Argoat,
        # et c est ce que le premier jet affirmait de treize pieces.
        mots = [m for m in re.split(r"[^a-z0-9]+", p["fournisseur"].lower())
                if len(m) >= 4]
        def meme_fournisseur(d):
            lib = d["libelle_complet"].lower()
            return any(m in lib for m in mots)

        forts = []
        for d, pq in cands:
            ref_pleine = any(q == "reference %s" % ref for q in pq)
            # la reference complete suffit seule ; tout le reste exige que le
            # debit soit celui du fournisseur, ET deux indices.
            if ref_pleine or (meme_fournisseur(d) and len(pq) >= 2):
                forts.append((d, pq))
        if forts:
            trouves.append((p, forts))
        else:
            rien.append((p, cands))

    print("=== CRIBLE DES PIECES « A TRIER » ===")
    print("%d a trier. %d ont au moins un candidat solide, %d n en ont aucun.\n"
          % (len(trouves) + len(rien), len(trouves), len(rien)))

    print("--- CANDIDATS A LIRE : %d ---\n" % len(trouves))
    for p, forts in trouves:
        print("%s %s  %s EUR  (%s)"
              % (p["fournisseur"], p.get("reference") or "(sans ref)",
                 p.get("montant") or "-", p.get("date_piece") or "sans date"))
        for d, pq in forts[:3]:
            print("   rel %-3s %-6s %9.2f  <- %s"
                  % (d["releve"], d["date"], d["m"], " + ".join(pq)))
            print("      %s" % d["libelle_complet"][:150])
        if len(forts) > 3:
            print("   ... et %d autres debits" % (len(forts) - 3))
        print()

    print("--- AUCUN CANDIDAT SOLIDE : %d ---" % len(rien))
    for p, cands in rien:
        print("  %-16s %-22s %9s  %s"
              % (p["fournisseur"], (p.get("reference") or "(sans ref)")[:22],
                 p.get("montant") or "-",
                 "%d candidat(s) faible(s)" % len(cands) if cands
                 else "rien au releve"))
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

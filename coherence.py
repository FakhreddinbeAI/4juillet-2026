#!/usr/bin/env python3
"""
Controle de coherence du dossier. Cherche MES erreurs, pas celles du Dr.

POURQUOI CE FICHIER. Le 6 octobre 2026 j ai accumule les fautes : des pieces
annoncees manquantes qui etaient deposees, un controle affirme sans etre fait,
des colonnes de Sheet devinees, des montants faux, des abonnements reclames
alors qu ils etaient resilies. Toutes avaient un point commun : rien ne les
contredisait automatiquement.

Ce script les contredit. Il ne raconte rien, il compare des sources :
  registre_2026.csv        ce que je crois
  historique_portail*.txt  ce que TGS a recu (fait foi)
  lcl_2026.csv             ce que la banque a paye (fait foi)

Toute divergence est une erreur a corriger, la mienne le plus souvent.
Sortie vide = dossier coherent. C est le seul resultat acceptable.
"""

import csv
import io
import os
import re
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index_portail import cherche, construire


def pieces(chemin):
    brut = [l for l in io.open(chemin, encoding="utf-8")
            if l.strip() and not l.startswith("#")]
    return list(csv.DictReader(brut, delimiter=";"))


def debits(chemin):
    d = defaultdict(list)
    for x in csv.DictReader(io.open(chemin, encoding="utf-8"), delimiter=";"):
        if x.get("debit"):
            d[round(float(x["debit"]), 2)].append(x)
    return d


def main(reg, lcl, *hist):
    P = pieces(reg)
    tous, par_chiffres = construire(list(hist))
    D = debits(lcl)
    pbs = []

    def pb(cat, p, quoi):
        pbs.append((cat, "%s %s" % (p.get("fournisseur", "?"),
                                    p.get("reference") or "(sans ref)"), quoi))

    # 1. etat et presence au portail doivent concorder
    for p in P:
        ref = (p.get("reference") or "").strip()
        au_portail = bool(ref) and bool(cherche(ref, tous, par_chiffres))
        etat = (p.get("etat") or "").strip().upper()
        cycle = (p.get("cycle") or "").strip().upper()
        if au_portail and etat not in ("DEPOSEE", "HORS PERIMETRE", "A_VENIR"):
            pb("AU PORTAIL MAIS PAS MARQUEE DEPOSEE", p,
               "etat=%s, trouvee comme '%s'"
               % (etat, cherche(ref, tous, par_chiffres)[0][:46]))
        if etat == "DEPOSEE" and ref and not au_portail:
            # Acceptable SI la note nomme le depot et que ce nom existe.
            cites = re.findall(r"'([^']{6,90})'", p.get("note") or "")
            atteste = [c for c in cites
                       if any(c.lower() in n.lower() for n in tous)]
            if not atteste:
                pb("MARQUEE DEPOSEE SANS PREUVE", p,
                   "ni le numero ni un nom de depot cite dans la note ne se "
                   "retrouvent dans l historique"
                   + (" (noms cites : %s)" % "; ".join(c[:40] for c in cites)
                      if cites else " (aucun nom cite)"))
        if cycle == "ENVOYE_TGS" and etat not in ("DEPOSEE", "HORS PERIMETRE",
                                                  "A_VENIR") and not au_portail:
            pb("CYCLE ET ETAT EN DESACCORD", p, "cycle=ENVOYE_TGS, etat=%s" % etat)

    # 2. un montant du registre doit exister au releve, sinon il est suspect
    for p in P:
        try:
            m = round(float(p["montant"]), 2)
        except (ValueError, KeyError, TypeError):
            continue
        if m <= 0:
            continue
        if m in D:
            continue
        # tolerance : un montant peut etre paye groupe, ou pas encore paye
        if (p.get("cycle") or "").strip().upper() == "PAYE":
            pb("MARQUEE PAYE MAIS LE MONTANT N EXISTE PAS AU RELEVE", p,
               "%.2f introuvable parmi les debits" % m)

    # 3. deux lignes ne peuvent pas porter la meme reference
    vus = defaultdict(list)
    for p in P:
        ref = (p.get("reference") or "").strip()
        if ref and ref not in ("", "(aucune)"):
            vus[ref].append(p)
    for ref, l in vus.items():
        if len(l) > 1:
            pbs.append(("REFERENCE EN DOUBLE AU REGISTRE", ref,
                        "%d lignes : %s" % (len(l),
                        ", ".join(x["fournisseur"] for x in l))))

    # 4. un etat doit faire partie des etats connus
    connus = {"RENOMME", "RECU", "MANQUANT", "DEPOSEE", "A_VERIFIER",
              "HORS PERIMETRE", "A_VENIR", "SANS OBJET"}
    for p in P:
        e = (p.get("etat") or "").strip()
        if e and e.upper() not in connus:
            pb("ETAT INCONNU", p, "'%s'" % e)

    # 5. defauts de STRUCTURE des fichiers sources. Celui-la vient d une
    # faute reelle : un « cat >> » sur un fichier sans retour a la ligne final
    # a COLLE la premiere ligne ajoutee sur la derniere existante, et le nom
    # d une facture Aries s est retrouve avale dans le champ statut. L index
    # ne la voyait plus, et le controle d etat l annoncait absente du portail.
    for h in hist:
        brut = io.open(h, encoding="utf-8").read()
        if brut and not brut.endswith("\n"):
            pbs.append(("FICHIER SANS RETOUR A LA LIGNE FINAL", h,
                        "le prochain ajout collera sur la derniere ligne"))
        for num, ligne in enumerate(brut.split("\n"), 1):
            if ligne.count(".pdf") > 1 or ligne.count("|") > 2:
                pbs.append(("LIGNE COLLEE DANS L HISTORIQUE",
                            "%s:%d" % (h, num), ligne[:80]))

    print("=== CONTROLE DE COHERENCE ===")
    print("%d pieces au registre, %d depots indexes, %d montants de debit "
          "distincts.\n" % (len(P), len(tous), len(D)))
    if not pbs:
        print("*** AUCUNE DIVERGENCE. ***")
        return 0
    cats = defaultdict(list)
    for c, q, d in pbs:
        cats[c].append((q, d))
    for c in sorted(cats, key=lambda c: -len(cats[c])):
        print("--- %s : %d ---" % (c, len(cats[c])))
        for q, d in cats[c][:40]:
            print("  %-34s %s" % (q[:34], d[:90]))
        if len(cats[c]) > 40:
            print("  ... et %d autres" % (len(cats[c]) - 40))
        print()
    print("%d divergences au total. Chacune est a trancher." % len(pbs))
    return 1


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

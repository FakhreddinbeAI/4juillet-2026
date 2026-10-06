#!/usr/bin/env python3
"""
Confronte CHAQUE piece du registre a l historique des depots du portail.

C est le controle que j aurais du faire avant toute annonce de piece
manquante. Il repond a une seule question, par piece : TGS l a-t-il deja ?

Trois reponses possibles, et la troisieme est la plus importante :
  DEJA     — la reference se retrouve dans un nom depose. Rien a faire.
  ABSENTE  — reference exploitable, introuvable au portail. A deposer.
  MUETTE   — pas de reference, ou trop courte pour conclure. On ne tranche
             PAS : on ne peut ni l affirmer ni l infirmer, et le dire est
             plus utile que de deviner.
"""

import csv
import io
import os
import sys

# python -I retire le dossier du script de sys.path. On y remet CE
# dossier-la, et lui seul, pour importer index_portail.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from collections import defaultdict

from index_portail import cherche, construire, plat


def lignes(chemin):
    brut = [l for l in io.open(chemin, encoding="utf-8")
            if l.strip() and not l.startswith("#")]
    return list(csv.DictReader(brut, delimiter=";"))


def main(reg, *hist):
    tous, par_chiffres = construire(list(hist))
    pieces = lignes(reg)

    # Un nom depose peut aussi se reconnaitre au FOURNISSEUR seul quand la
    # piece n a pas de reference : « MADE IN LABS .pdf » ne porte aucun
    # numero. On prepare donc l index par mot du fournisseur.
    par_mot = defaultdict(list)
    for n in tous:
        for mot in plat(n).replace(".", " ").split():
            if len(mot) >= 4:
                par_mot[mot].append(n)

    # Une piece tranchee A LA MAIN sort du lot avant toute recherche : son
    # etat est une decision, pas une deduction, et l index ne doit pas la
    # contredire. DEPOSEE = vue au portail a l oeil. HORS PERIMETRE = ne
    # concerne pas la SELARL (l Ormco du Dr Angibaud).
    tranchees, deja, absentes, muettes = [], [], [], []
    for p in pieces:
        etat = (p.get("etat") or "").strip().upper()
        if etat.startswith("DEPOSEE") or etat.startswith("HORS"):
            tranchees.append(p)
            continue
        ref = (p.get("reference") or "").strip()
        t = cherche(ref, tous, par_chiffres) if ref else []
        if t:
            deja.append((p, t[0]))
        elif ref and len(''.join(c for c in ref if c.isdigit())) >= 4:
            absentes.append(p)
        else:
            muettes.append(p)

    def montant(p):
        try:
            return float(p["montant"])
        except (ValueError, KeyError, TypeError):
            return 0.0

    print("=== LE REGISTRE CONFRONTE AU PORTAIL ===")
    print("%d pieces au registre, %d depots au portail.\n"
          % (len(pieces), len(tous)))

    print("--- 0. DEJA TRANCHEES A LA MAIN : %d pieces, %.2f EUR ---"
          % (len(tranchees), sum(montant(p) for p in tranchees)))
    for p in sorted(tranchees, key=lambda x: -montant(x)):
        print("  %-16s %-14s %10.2f  %-9s %s"
              % (p["fournisseur"], (p["reference"] or "")[:14], montant(p),
                 p["etat"][:9], (p.get("note") or "")[:46]))

    print("\n--- 1. DEJA AU PORTAIL : %d pieces, %.2f EUR — RIEN A FAIRE ---"
          % (len(deja), sum(montant(p) for p, _ in deja)))
    for p, n in sorted(deja, key=lambda x: -montant(x[0])):
        print("  %-16s %-12s %10.2f  %s  ->  %s"
              % (p["fournisseur"], p["reference"][:12], montant(p),
                 p["etat"][:9].ljust(9), n[:52]))

    print("\n--- 2. ABSENTES DU PORTAIL : %d pieces, %.2f EUR — A DEPOSER ---"
          % (len(absentes), sum(montant(p) for p in absentes)))
    for p in sorted(absentes, key=lambda x: -montant(x)):
        print("  %-16s %-14s %10.2f  %-9s %s"
              % (p["fournisseur"], p["reference"][:14], montant(p),
                 p["etat"][:9], (p.get("note") or "")[:40]))

    print("\n--- 3. SANS REFERENCE EXPLOITABLE : %d pieces, %.2f EUR ---"
          % (len(muettes), sum(montant(p) for p in muettes)))
    print("    On ne peut PAS conclure. A verifier a l oeil sur le portail.")
    for p in sorted(muettes, key=lambda x: -montant(x)):
        print("  %-16s %-14s %10.2f  %-9s"
              % (p["fournisseur"], (p["reference"] or "(aucune)")[:14],
                 montant(p), p["etat"][:9]))
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]) if len(sys.argv) > 2 else
             main("registre_2026.csv", "hist_a.txt", "hist_b.txt"))

#!/usr/bin/env python3
"""
Les pieces absentes du portail, groupees par fournisseur et par emplacement.

Pourquoi groupees ainsi et pas par montant : on depose en ouvrant un dossier,
pas en suivant un classement decroissant. Dix factures Google Workspace du
meme dossier se deposent d un geste ; les egrener entre une Cofica et une
Argoat fait rouvrir dix fois le meme endroit.
"""

import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_portail import lignes
from index_portail import cherche, construire


def court(emplacement):
    """L emplacement en trois mots : c est un repere, pas une adresse."""
    e = emplacement or "(inconnu)"
    for long, bref in (
            ("Drive partage > Lucie - Lisa : factures reglees", "SD / reglees"),
            ("Drive partage > Lisa - Lucie : factures a regler", "SD / a regler"),
            ("Drive partage > Brother", "SD / Brother"),
            ("Drive partage", "SD"),
            ("Drive > Downloads (miroir du PC)", "PC / Downloads"),
            ("Drive > Desktop (miroir du PC)", "PC / Desktop"),
            ("Drive > FACTURATION", "Drive / FACTURATION"),
    ):
        if e.startswith(long):
            return bref
    return e[:22]


def main(reg, *hist):
    tous, par_chiffres = construire(list(hist))
    groupes, aobtenir = defaultdict(list), []
    for p in lignes(reg):
        etat = (p.get("etat") or "").strip().upper()
        if (etat.startswith("DEPOSEE") or etat.startswith("HORS")
                or etat.startswith("A_VENIR")):
            continue
        ref = (p.get("reference") or "").strip()
        if not ref or len("".join(c for c in ref if c.isdigit())) < 4:
            continue
        if cherche(ref, tous, par_chiffres):
            continue
        # Une piece MANQUANTE ne se depose pas : on ne l a pas. Elle se
        # reclame. Les melanger produisait des lots contenant des fichiers
        # inexistants — exactement ce qui a fait echouer la tentative du
        # 06/10, quatre fichiers sur cinq introuvables.
        if (p.get("etat") or "").strip().upper() == "MANQUANT":
            aobtenir.append(p)
            continue
        groupes[p["fournisseur"]].append(p)

    def m(p):
        try:
            return float(p["montant"])
        except (ValueError, KeyError, TypeError):
            return 0.0

    total, n = 0.0, 0
    ordre = sorted(groupes.items(), key=lambda kv: -sum(m(p) for p in kv[1]))
    for fou, ps in ordre:
        st = sum(m(p) for p in ps)
        total += st
        n += len(ps)
        lieux = sorted({court(p.get("emplacement")) for p in ps})
        print("\n%s — %d piece(s), %.2f EUR   [%s]"
              % (fou, len(ps), st, ", ".join(lieux)))
        for p in sorted(ps, key=lambda x: -m(x)):
            print("    %-22s %9.2f  %-9s %s"
                  % (p["reference"][:22], m(p), p["etat"][:9], p["date_piece"]))
    print("\n%d fournisseurs, %d pieces A DEPOSER, %.2f EUR"
          % (len(groupes), n, total))
    if aobtenir:
        ta = sum(m(p) for p in aobtenir)
        print("\n--- ET %d PIECES A OBTENIR, PAS A DEPOSER : %.2f EUR ---"
              % (len(aobtenir), ta))
        print("    On ne les a pas. Elles se reclament au fournisseur.")
        for p in sorted(aobtenir, key=lambda x: -m(x)):
            paye = " (paiement PROUVE au releve)" if (
                p.get("cycle") or "").strip() == "PAYE" else ""
            print("  %-16s %-22s %9.2f%s"
                  % (p["fournisseur"], (p["reference"] or "(sans ref)")[:22],
                     m(p), paye))
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

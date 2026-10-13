#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cherche au portail les pieces NON deposees sous un nom porteur du MONTANT.

POURQUOI CE SCRIPT EXISTE
Le 13/10/2026, deux factures GACD annoncees « rien au portail » par une
recherche par numero y etaient depuis le 24/06, avec le statut « Depot OK ».
Lucie les avait deposees sous « GACD 629 25 .pdf » et « GACD 28 76 1 .pdf » :
le MONTANT, pas le numero. Mes deux fichiers d historique les contenaient
depuis le debut — c est la recherche qui etait aveugle, pas la donnee qui
manquait.
397 des 1 370 noms de depot, soit 29 %, portent un montant sans aucun numero
long. L angle mort couvrait donc pres d un tiers du portail.

CE QUE LE SCRIPT FAIT, ET CE QU IL NE FAIT PAS
Pour chaque piece du registre qui n est PAS marquee DEPOSEE, il cherche les
noms de depot contenant son montant ecrit « entier espace centimes », la forme
que produit le portail en remplacant la virgule. Il exige EN PLUS que le nom
contienne le nom du fournisseur, sinon « 12 00 » ramenerait la moitie du
portail.
IL NE CONCLUT RIEN ET NE MODIFIE RIEN. Il produit des CANDIDATS a verifier un
par un, parce qu un montant identique ne fait pas un doublon — c est la regle
du dossier, posee apres que j aie pris trois fois des pieces distinctes pour
des copies.
"""

import csv
import io
import re
import sys


def noms_portail(fichiers):
    out = {}
    for f in fichiers:
        for l in io.open(f, encoding="utf-8"):
            p = [x.strip() for x in l.split("|")]
            if p[0]:
                out.setdefault(p[0], p[1] if len(p) > 1 else "")
    return out


def main(reg, *hist):
    depots = noms_portail(hist)
    lignes = io.open(reg, encoding="utf-8").read().splitlines()
    rows = [next(csv.reader([l], delimiter=";"))
            for l in lignes if l.strip() and not l.startswith("#")]
    h = rows[0]
    i = {c: h.index(c) for c in h}

    trouves = []
    for r in rows[1:]:
        if r[i["etat"]].strip().upper() in ("DEPOSEE", "HORS PERIMETRE",
                                            "SANS OBJET", "A_VENIR"):
            continue
        m = r[i["montant"]].strip().lstrip("-")
        if not m or "." not in m:
            continue
        ent, cent = m.split(".")
        forme = r"\b%s %s\b" % (re.escape(ent), re.escape(cent))
        f = r[i["fournisseur"]].strip().lower()
        mots = [x for x in re.split(r"[^a-z0-9]+", f) if len(x) > 2]
        cand = []
        for nom, statut in depots.items():
            n = nom.lower()
            if not re.search(forme, n):
                continue
            if mots and not any(w in n for w in mots):
                continue
            # LE RESSERREMENT QUI REND CE CRIBLE UTILE : on ne garde que les
            # depots dont le nom NE PORTE AUCUN NUMERO LONG. Si le nom en
            # contient un, la recherche par numero l a deja couvert, et un
            # numero different veut dire une AUTRE facture — c est le cas des
            # Cofica a 1 353,76 de chaque mois, des Anthropic a 108,00, des
            # Aries a 990,00. Sans ce filtre le crible ressort tous les mois
            # d un fournisseur a montant recurrent et ne sert a rien.
            if re.search(r"\d{6,}", n):
                continue
            cand.append((nom, statut))
        if cand:
            trouves.append((r[i["fournisseur"]], r[i["date_piece"]],
                            r[i["montant"]], r[i["reference"]],
                            r[i["etat"]], cand))

    if not trouves:
        print("*** AUCUN CANDIDAT. Aucune piece non deposee ne correspond a un")
        print("    nom de depot portant son montant ET son fournisseur. ***")
        return 0

    print("%d piece(s) non deposee(s) dont le montant ET le fournisseur se"
          % len(trouves))
    print("retrouvent dans un depot SANS AUCUN NUMERO dans son nom — donc")
    print("invisible a une recherche par numero. A VERIFIER UNE PAR UNE : un")
    print("montant identique ne fait pas un doublon.")
    print()
    for f, d, m, ref, etat, cand in trouves:
        print("%-16s %-11s %10s  %-16s %s" % (f, d or "(sans date)", m,
                                              ref or "(sans ref)", etat))
        for nom, statut in cand:
            print("      -> '%s'%s" % (nom, "  [%s]" % statut if statut else ""))
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

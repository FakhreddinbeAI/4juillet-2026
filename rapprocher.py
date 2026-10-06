#!/usr/bin/env python3
"""
Rapprochement des debits LCL avec les pieces du registre.

LE PARTI PRIS, ET IL EST DELIBERE. On ne cherche PAS a apparier chaque debit
a une facture precise. Dix prelevements Cofica font tous 1 353,76 EUR au
centime : un appariement un-a-un ne serait qu une suite de choix arbitraires,
et il aurait l air juste. On compare donc des TOTAUX PAR FOURNISSEUR — ce que
la banque a sorti contre ce que le registre justifie. L ecart est alors un
fait, pas une supposition.

Trois sorties, par ordre d utilite :
  1. les fournisseurs ou la banque a paye PLUS que ce qu on justifie
     -> ce sont les pieces qui manquent au bilan, chiffrees
  2. les debits dont le fournisseur est INCONNU du registre
     -> des charges entieres hors radar
  3. les pieces du registre sans aucun debit LCL correspondant
     -> soit payees par le BNP, soit impayees, soit a verifier

PERIMETRE. Tout sauf les virements CPAM, qui viennent de l export LOGOS.
Les prelevements, eux, sont DANS le perimetre : un prelevement URSSAF ou
MACSF reclame son justificatif comme une facture.
"""

import csv
import io
import re
import sys
from collections import defaultdict

# Libelle bancaire -> fournisseur du registre. Etabli en lisant les dix
# releves, pas devine. Anthropic a DEUX empreintes, MACSF deux flux.
CORRESPONDANCE = [
    (r"SCM Legesmile", "SCM-LEGESMILE"),
    (r"Made in labs", "MADE-IN-LABS"),
    (r"STraumann|Straumann", "STRAUMANN"),
    (r"Cofica Bail", "COFICA"),
    (r"\bROTEC\b", "ROTEC"),
    (r"ARIES CONSUL", "ARIES"),
    (r"GACD", "GACD"),
    (r"Ormco France", "ORMCO"),
    (r"Google Works", "GOOGLE-WORKSPACE"),
    (r"septodont", "SEPTODONT"),
    (r"LA FRAISE PRO", "LA-FRAISE"),
    (r"ANTHROPIC|CLAUDE\.AI", "ANTHROPIC"),
    (r"BRED Neohm|Neohm", "NEOHM"),
    (r"NOTRE ACCORD", "NOTRE-ACCORD"),
    (r"LA CASCADE", "LA-CASCADE"),
    (r"CANVA", "CANVA"),
    (r"MACSF-PREV", "MACSF-PREVOYANCE"),
    (r"MACSF-ASSU", "MACSF-ASSURANCES"),
    (r"URSSAF", "URSSAF"),
    (r"labo NTJ|\bNTJ\b", "NTJ"),
    (r"Bongert", "BONGERT"),
    (r"LIXXBAIL", "LIXXBAIL"),
    (r"CARCDSF", "CARCDSF"),
    (r"HARMONIE MUTUELLE", "HARMONIE-MUTUELLE"),
    (r"GIE AG2R|AG2R", "AG2R"),
    (r"LA MONDIALE", "LA-MONDIALE"),
    (r"GENERALI", "GENERALI"),
    (r"DOCTOLIB", "DOCTOLIB"),
    (r"RECEPT AI", "RECEPT-AI"),
    (r"\bIcare\b", "ICARE"),
    (r"IONOS", "IONOS"),
    (r"FREE MOBILE|Free Telecom", "FREE"),
    (r"AMAZON", "AMAZON"),
    (r"APPLE\.COM", "APPLE"),
    (r"OPENAI", "OPENAI"),
    (r"hostinger", "HOSTINGER"),
    (r"OSSEO shop", "OSSEO-SHOP"),
    (r"TGS France", "TGS-FRANCE"),
    (r"In Extenso", "IN-EXTENSO"),
    (r"RYDGE", "RYDGE-AVOCATS"),
    (r"BNP PARIBAS LEASE", "BNP-LEASE"),
    (r"CM-CIC Leasing", "CM-CIC-LEASING"),
    (r"henry Schein|Arcade dentaire", "HENRY-SCHEIN"),
    (r"PETRO-OUEST|STATION|esso|ETL AUTOS", "CARBURANT"),
    (r"Tighza perso", "TIGHZA-PERSO"),
    (r"Lucie Menanteau", "SALAIRE-LUCIE"),
    (r"LAURENT FIGARD", "FIGARD"),
    (r"NOILHETAS", "NOILHETAS"),
    (r"PRET 22913265", "PRET-22913265"),
    (r"PRET 22813156", "PRET-22813156"),
    (r"PRET 24921149", "PRET-24921149"),
    (r"CHQ IRREGUL", "CHQ-IRREGULIER"),
    (r"BLOCAGE", "BLOCAGE"),
    (r"FORFAIT MENSUEL MONETIQUE|COTIS |COMMISSIONS|FRAIS ", "FRAIS-BANCAIRES"),
]

HORS_PERIMETRE = re.compile(r"CPAM|MSA |ENIM|REMISE CB|REM CHQ|VIR SEPA MUTUELLE")


def fournisseur_de(libelle):
    for motif, nom in CORRESPONDANCE:
        if re.search(motif, libelle, re.I):
            return nom
    return None


def charger_debits(chemin):
    d = defaultdict(lambda: [0, 0.0, []])
    inconnus = defaultdict(lambda: [0, 0.0, []])
    for x in csv.DictReader(io.open(chemin, encoding="utf-8"), delimiter=";"):
        if not x["debit"]:
            continue
        lib = x["libelle_complet"]
        if HORS_PERIMETRE.search(lib):
            continue
        m = float(x["debit"])
        tete = lib.split(" | ")[0][:60]
        f = fournisseur_de(lib)
        cible = d if f else inconnus
        cle = f or tete
        cible[cle][0] += 1
        cible[cle][1] += m
        if len(cible[cle][2]) < 3:
            cible[cle][2].append("%s %s %.2f" % (x["releve"], x["date"], m))
    return d, inconnus


def charger_registre(chemin):
    r = defaultdict(lambda: [0, 0.0])
    for l in io.open(chemin, encoding="utf-8"):
        if not l.strip() or l.startswith("#"):
            continue
        c = l.rstrip("\n").split(";")
        if len(c) < 4 or c[0] == "date_piece":
            continue
        fou, typ, mon = c[1], c[2], c[3]
        if typ not in ("FACTURE", "AVOIR", "RELANCE", "ATTESTATION", "INDU"):
            continue
        try:
            m = float(mon)
        except ValueError:
            continue
        # une relance ne justifie rien : elle signale une facture a obtenir
        if typ == "RELANCE":
            continue
        r[fou][0] += 1
        r[fou][1] += -m if typ == "AVOIR" else m
    return r


def main(f_lcl, f_reg):
    debits, inconnus = charger_debits(f_lcl)
    registre = charger_registre(f_reg)

    print("=== RAPPROCHEMENT LCL / REGISTRE 2026 ===")
    print("Perimetre : tous les debits sauf les virements CPAM (export LOGOS).\n")

    manque, couvert = [], []
    for f, (n, paye, ex) in sorted(debits.items(), key=lambda kv: -kv[1][1]):
        nj, justifie = registre.get(f, [0, 0.0])
        ecart = paye - justifie
        (manque if ecart > 1.0 else couvert).append((f, n, paye, nj, justifie, ecart))

    print("--- 1. PAYE PLUS QUE JUSTIFIE : les pieces qui manquent ---")
    print("%-22s %4s %12s %4s %12s %12s" %
          ("FOURNISSEUR", "mvt", "paye LCL", "pcs", "justifie", "MANQUE"))
    total = 0.0
    for f, n, paye, nj, justifie, ecart in manque:
        total += ecart
        print("%-22s %4d %12.2f %4d %12.2f %12.2f" % (f, n, paye, nj, justifie, ecart))
    print("%-22s %4s %12s %4s %12s %12.2f" % ("TOTAL", "", "", "", "", total))

    print("\n--- 2. DEBITS AU FOURNISSEUR INCONNU DU REGISTRE ---")
    ti = 0.0
    for lib, (n, m, ex) in sorted(inconnus.items(), key=lambda kv: -kv[1][1]):
        if m < 50:
            continue
        ti += m
        print("  %-52s %3d %10.2f" % (lib[:52], n, m))
    print("  %-52s %3s %10.2f" % ("TOTAL (lignes > 50 EUR)", "", ti))

    print("\n--- 3. COUVERT : rien a reclamer ---")
    for f, n, paye, nj, justifie, ecart in couvert:
        print("  %-22s paye %10.2f / justifie %10.2f  (%+.2f)" % (f, paye, justifie, ecart))

    print("\n--- 4. AU REGISTRE MAIS AUCUN DEBIT LCL ---")
    print("    (paye par le BNP, impaye, ou a verifier)")
    for f, (n, m) in sorted(registre.items(), key=lambda kv: -kv[1][1]):
        if f not in debits and m > 1.0:
            print("  %-22s %2d piece(s) %10.2f" % (f, n, m))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "lcl_2026.csv",
                  sys.argv[2] if len(sys.argv) > 2 else "registre_2026.csv"))

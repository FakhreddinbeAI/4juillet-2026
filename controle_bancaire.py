#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
controle_bancaire.py — CONTROLE PAR LE BAS : on part de la banque.

Le registre des pieces part des fournisseurs : il ne voit que ce qu on sait
deja chercher. Un releve bancaire est exhaustif, donc tout debit sans
justificatif est un trou par construction.

OU SONT LES RELEVES
    Sur l ORDINATEUR du cabinet. Pas sur le Drive.
    Les deux comptes existent : BNP 2112 et LCL. Ne jamais ecrire que LCL
    n existe pas — il n est simplement pas accessible depuis l assistant.
    Pour qu un releve entre ici, il faut soit le deposer sur le Drive, soit
    le faire lire par Claude in Chrome (PROMPT 4 de prompt_renommage.md).

PERIMETRE — decide par le Dr le 01/10/2026
    On ne suit QUE ce qui demande un justificatif a produire ou a classer :
        FACTURE, AVOIR, PRELEVEMENT, RETROCESSION
    Sont EXCLUS :
        - les virements CPAM, qui sont reconcilies par l export LOGOS
          (bilan). Ne jamais les saisir a la main : c est du temps perdu et
          une source d ecart.
        - les prelevements du gerant et les mouvements entre entites, qui ne
          se justifient pas par une piece fournisseur.
    Les mouvements hors perimetre restent dans les donnees ci-dessous, avec
    HORS, pour que le recalcul des soldes continue de prouver que la saisie
    est complete. Ils ne partent pas a l export.

    python3 controle_bancaire.py                 # controle
    python3 controle_bancaire.py --export f.csv  # CSV pour Google Sheets
"""

import argparse
import csv
from collections import defaultdict

# --- Les relevés -------------------------------------------------------------
# solde_debut et solde_fin sont lus sur le PDF : ils servent de controle.

RELEVES = {
    "26001": dict(id="1QZpzQbxAxV2UPEvcuinLbypK9y3vde7h",
                  periode="31/12/2025 au 31/01/2026", debut=972.60,  fin=1686.53),
    "26002": dict(id="1fKd3oLcTM0S-EuRjsAiHpfz2fd4Ldrzi",
                  periode="31/01/2026 au 28/02/2026", debut=1686.53, fin=2550.80),
    "26003": dict(id="1zmlNP8K2f2efV26TB3Fou-P9TzSlZ27r",
                  periode="28/02/2026 au 31/03/2026", debut=2550.80, fin=1693.37),
    "26004": dict(id="1Z2iD_eF6hHKVkto8csFWxTMpnu6A39Wy",
                  periode="31/03/2026 au 30/04/2026", debut=1693.37, fin=1019.63),
    "26005": dict(id="1vnIz1Wki0nbgXsA88h0fLcAY69aIW1x9",
                  periode="30/04/2026 au 31/05/2026", debut=1019.63, fin=334.12),
    "26006": dict(id="19Qe0SfRA-iKPuZa9_CJqT7SsV351GNwP",
                  periode="31/05/2026 au 30/06/2026", debut=334.12,  fin=1116.70),
    "26007": dict(id="1d1dCL-SpA8MQ1S8JnBpeGGFHQ_4y9_PY",
                  periode="30/06/2026 au 31/07/2026", debut=1116.70, fin=9550.55),
    "26008": dict(id="1e7KG3i3dV67F4VGyuGqhSWv5WDWpZUaw",
                  periode="31/07/2026 au 31/08/2026", debut=9550.55, fin=6938.07),
}

BANQUE = "BNP 2112"   # compte pro, titulaire M. TIGHZA personne physique

# --- Categories de piece -----------------------------------------------------
FACTURE      = "FACTURE"
AVOIR        = "AVOIR"
PRELEVEMENT  = "PRELEVEMENT"
RETROCESSION = "RETROCESSION"
FLUX_JOHANNE = "FLUX JOHANNE hors retro"
HORS         = "HORS PERIMETRE"

DANS_LE_PERIMETRE = (FACTURE, AVOIR, PRELEVEMENT, RETROCESSION, FLUX_JOHANNE)

# --- Etats du justificatif ---------------------------------------------------
PRESENT   = "PRESENT"
A_OBTENIR = "A OBTENIR"

# --- Les mouvements ----------------------------------------------------------
# (releve, date, libelle, debit, credit, categorie, justificatif, etat, note)

RETRO_NOTE = "Note de retrocession d honoraires"
PRET_NOTE  = "Tableau d amortissement du pret"
ASSUR_NOTE = "Contrat BNP Protection du Foyer"
BANQUE_OK  = "Le releve fait foi"

M = [
 # ---- janvier
 ("26001","22/01/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO DECEMBRE",0,1399.44,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,"Couvre decembre 2025, encaissee en 2026."),
 ("26001","13/01/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,
  "6,00/mois. Verifier s il s agit d une assurance PRO ou PERSO."),
 ("26001","26/01/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,
  "636,01/mois. Sans le tableau, impossible de separer capital et interets."),
 ("26001","05/01/2026","COMMISSIONS facture 20260101007763048",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- fevrier
 ("26002","10/02/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JANVIER",0,1549.78,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,""),
 ("26002","09/02/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26002","26/02/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26002","03/02/2026","COMMISSIONS facture 20260201018633206",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- mars
 ("26003","05/03/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO FEVRIER",0,1964.08,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,""),
 ("26003","17/03/2026","VIR CPTE A CPTE EMIS - SALAIRE PERSO",2000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26003","09/03/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26003","26/03/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26003","03/03/2026","COMMISSIONS facture 20260301029162684",179.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,
  "179,50 au lieu de 43,50 : trimestrialite ou operation particuliere."),

 # ---- avril
 ("26004","16/04/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO MARS",0,2011.77,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,""),
 ("26004","20/04/2026","VIR SCT INST EMIS - PERSO",2000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26004","09/04/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26004","27/04/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26004","02/04/2026","COMMISSIONS facture 20260401040294964",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- mai : aucun encaissement, la retro d avril arrive le 1er juin
 ("26005","12/05/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26005","26/05/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26005","05/05/2026","COMMISSIONS facture 20260501050345918",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- juin
 ("26006","01/06/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO AVRIL",0,2297.28,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,""),
 ("26006","04/06/2026","VIR RECU LOISEAU JOHANNE (EI) - SALAIRE ANNE MARIE",0,3170.81,
  FLUX_JOHANNE,"Convention de refacturation + bulletin de paie",A_OBTENIR,
  "N EST PAS une retrocession. Ne pas agreger aux honoraires."),
 ("26006","05/06/2026","VIR SEPA INSTANT EMIS - PERSO MAISON",4000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26006","08/06/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26006","26/06/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26006","02/06/2026","COMMISSIONS facture 20260601053492198",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- juillet
 ("26007","06/07/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO MAI",0,7896.79,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,
  "Changement d echelle : 7 896,79 contre environ 2 000 les mois precedents."),
 ("26007","17/07/2026","VIR RECU LOISEAU JOHANNE (EI) - REMBT ERREUR DE CAISSE",0,603.20,
  FLUX_JOHANNE,"Note explicative de l erreur de caisse",A_OBTENIR,
  "Un patient a regle Johanne au lieu du Dr. N EST PAS une retrocession."),
 ("26007","31/07/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUIN 1",0,5709.37,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,
  "Juin regle en deux fois. Voir la 2e partie au releve 26008."),
 ("26007","09/07/2026","VIR SEPA INSTANT EMIS - VERS COMPTE PERSO",5000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26007","08/07/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26007","27/07/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26007","02/07/2026","COMMISSIONS facture 20260701070281632",133.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),

 # ---- aout
 ("26008","03/08/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUIN 2EME PARTIE",0,5709.37,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,
  "Meme montant au centime que la 1re partie : ce N EST PAS un doublon, "
  "les libelles et les relevés sont differents."),
 ("26008","24/08/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUILLET",0,13363.66,
  RETROCESSION,RETRO_NOTE,A_OBTENIR,""),
 ("26008","03/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",5000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26008","06/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",4000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26008","18/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",2000.00,0,
  HORS,"",A_OBTENIR,"Prelevement du gerant."),
 ("26008","26/08/2026","VIREMENT SEPA EMIS - BNP PRO - BEN SELARL TIGHZA",10000.00,0,
  HORS,"",A_OBTENIR,
  "Mouvement entre entites. Hors perimetre du suivi des pieces, mais c est "
  "le plus gros mouvement de l exercice et il n est justifie par rien : "
  "apport, remboursement de compte courant ? A qualifier avec le comptable."),
 ("26008","10/08/2026","PRLV SEPA BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  PRELEVEMENT,ASSUR_NOTE,A_OBTENIR,""),
 ("26008","26/08/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  PRELEVEMENT,PRET_NOTE,A_OBTENIR,""),
 ("26008","04/08/2026","COMMISSIONS facture 20260701080593796",43.50,0,
  PRELEVEMENT,BANQUE_OK,PRESENT,""),
]

EN_TETE = ["banque", "releve", "date", "libelle", "debit", "credit",
           "categorie", "justificatif_attendu", "etat", "lien_releve",
           "depose_tgs", "horodatage_depot", "note"]

# Ligne d attente pour LCL, le temps que les relevés arrivent.
LIGNE_LCL = ["LCL", "", "", "RELEVES LCL A SAISIR — ils sont sur l ordinateur",
             "", "", "A SAISIR",
             "Releves LCL 2026, du 6 d un mois au 5 du suivant", A_OBTENIR, "",
             "FALSE", "",
             "C est LCL qui porte les reglements fournisseurs : COFICA, Aries, "
             "Mediforce, Mutualease, Google, Anthropic, Canva, La Fraise. "
             "Aucun de ces debits n apparait sur le BNP. Les virements CPAM de "
             "ce compte ne se saisissent PAS ici : ils viennent de l export LOGOS."]


def lignes(perimetre_seul=True):
    for rel, date, lib, deb, cred, cat, just, etat, note in M:
        if perimetre_seul and cat not in DANS_LE_PERIMETRE:
            continue
        r = RELEVES[rel]
        yield [BANQUE, rel, date, lib,
               f"{deb:.2f}" if deb else "",
               f"{cred:.2f}" if cred else "",
               cat, just, etat,
               f"https://drive.google.com/file/d/{r['id']}/view",
               "FALSE", "", note]


def controle_des_soldes():
    """Le solde de fin doit etre le solde de debut plus les credits moins les
    debits. On utilise TOUS les mouvements, y compris hors perimetre : c est
    la seule facon de prouver que la saisie est complete."""
    par_releve = defaultdict(lambda: [0.0, 0.0])
    for rel, _, _, deb, cred, *_ in M:
        par_releve[rel][0] += deb
        par_releve[rel][1] += cred
    ecarts = []
    for rel in sorted(RELEVES):
        deb, cred = par_releve[rel]
        r = RELEVES[rel]
        calcule = round(r["debut"] + cred - deb, 2)
        if abs(calcule - r["fin"]) > 0.005:
            ecarts.append((rel, calcule, r["fin"]))
    return ecarts


def chainage():
    ruptures = []
    clefs = sorted(RELEVES)
    for a, b in zip(clefs, clefs[1:]):
        if abs(RELEVES[a]["fin"] - RELEVES[b]["debut"]) > 0.005:
            ruptures.append((a, b, RELEVES[a]["fin"], RELEVES[b]["debut"]))
    return ruptures


def euro(x):
    return f"{x:>12,.2f}".replace(",", " ")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--export", metavar="FICHIER",
                    help="CSV a importer dans Google Sheets (perimetre seul)")
    ap.add_argument("--tout", action="store_true",
                    help="avec --export, inclut aussi le hors perimetre")
    args = ap.parse_args()

    if args.export:
        rangs = list(lignes(perimetre_seul=not args.tout))
        with open(args.export, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(EN_TETE)
            w.writerows(rangs)
            w.writerow(LIGNE_LCL)
        print(f"{len(rangs)} mouvements dans le perimetre, plus la ligne LCL, "
              f"ecrits dans {args.export}")
        return

    ecarts, ruptures = controle_des_soldes(), chainage()

    print()
    print("=" * 74)
    print(f"  CONTROLE BANCAIRE 2026  —  {BANQUE}")
    print("=" * 74)
    print()
    print(f"  Mouvements saisis : {len(M)} sur {len(RELEVES)} relevés")
    print()

    if ecarts:
        print("  !! UN RELEVE NE TOMBE PAS JUSTE — il manque un mouvement :")
        for rel, calcule, lu in ecarts:
            print(f"     {rel} : calcule {calcule:.2f}, lu sur le PDF {lu:.2f}")
    else:
        print("  Les soldes de chaque relevé se recalculent exactement.")
    if ruptures:
        print("  !! RUPTURE DE CHAINAGE :")
        for a, b, fin, debut in ruptures:
            print(f"     {a} ferme a {fin:.2f} mais {b} ouvre a {debut:.2f}")
    else:
        print("  Le chainage est continu d un relevé au suivant.")

    print()
    print("  PERIMETRE SUIVI — facture, avoir, prelevement, retrocession :")
    par_cat = defaultdict(lambda: [0, 0.0])
    hors = [0, 0.0]
    for _, _, _, deb, cred, cat, _, _, _ in M:
        if cat in DANS_LE_PERIMETRE:
            par_cat[cat][0] += 1
            par_cat[cat][1] += deb + cred
        else:
            hors[0] += 1
            hors[1] += deb + cred
    for cat in sorted(par_cat, key=lambda c: -par_cat[c][1]):
        n, tot = par_cat[cat]
        print(f"    {euro(tot)} EUR  sur {n:>2} mouvement(s)  {cat}")
    print(f"\n    Hors perimetre, non exporte : {hors[0]} mouvement(s), "
          f"{euro(hors[1]).strip()} EUR")
    print("    (prelevements du gerant et virement vers la SELARL)")

    print()
    print("  JUSTIFICATIFS A OBTENIR, dans le perimetre :")
    manq = defaultdict(lambda: [0, 0.0])
    for _, _, _, deb, cred, cat, just, etat, _ in M:
        if cat in DANS_LE_PERIMETRE and etat == A_OBTENIR:
            manq[just][0] += 1
            manq[just][1] += deb + cred
    for just, (n, tot) in sorted(manq.items(), key=lambda kv: -kv[1][1]):
        print(f"    {euro(tot)} EUR  sur {n:>2} mouvement(s)  {just}")

    print()
    print("  LCL : les relevés sont sur l ORDINATEUR, pas sur le Drive.")
    print("  Il faut les y deposer, ou les faire lire par Claude in Chrome,")
    print("  pour que les reglements fournisseurs entrent dans ce controle.")
    print("  Les virements CPAM ne se saisissent PAS : export LOGOS.")
    print()
    print("=" * 74)
    print()


if __name__ == "__main__":
    main()

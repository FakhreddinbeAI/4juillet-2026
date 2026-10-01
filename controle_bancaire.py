#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
controle_bancaire.py — CONTROLE PAR LE BAS : on part de la banque.

Le registre des pieces part des fournisseurs. Il ne voit donc que ce qu on
sait deja chercher. Un releve bancaire, lui, est exhaustif : tout debit sans
justificatif est un trou, par construction.

Une ligne = un mouvement bancaire. En face : la nature comptable, le
justificatif attendu, son etat, le lien vers le relevé, et deux colonnes pour
le depot sur le portail TGS.

Les mouvements ci-dessous ont ete releves un par un dans les PDF. Les totaux
de chaque relevé sont recalcules a l execution : si un mouvement est oublie
ou mal saisi, le controle le dit.

    python3 controle_bancaire.py                 # controle
    python3 controle_bancaire.py --export f.csv  # CSV pour Google Sheets
"""

import argparse
import csv
from collections import defaultdict

# --- Les relevés -------------------------------------------------------------
# solde_debut et solde_fin sont lus sur le PDF, ils servent de controle.

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

# --- Etats du justificatif ---------------------------------------------------
PRESENT    = "PRESENT"      # la piece existe et on sait ou elle est
A_OBTENIR  = "A OBTENIR"    # il faut la reclamer ou la produire
SANS_OBJET = "SANS OBJET"   # mouvement qui n appelle pas de piece fournisseur

# --- Les mouvements ----------------------------------------------------------
# (releve, date, libelle, debit, credit, nature, justificatif, etat, note)

M = [
 # ---- janvier
 ("26001","22/01/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO DECEMBRE",0,1399.44,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,
  "Couvre decembre 2025 mais encaissee en 2026."),
 ("26001","13/01/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,
  "6,00/mois. Verifier s il s agit d une assurance PRO ou PERSO."),
 ("26001","26/01/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,
  "636,01/mois. Sans le tableau, impossible de separer capital et interets."),
 ("26001","05/01/2026","COMMISSIONS facture 20260101007763048",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- fevrier
 ("26002","10/02/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JANVIER",0,1549.78,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,""),
 ("26002","09/02/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26002","26/02/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26002","03/02/2026","COMMISSIONS facture 20260201018633206",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- mars
 ("26003","05/03/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO FEVRIER",0,1964.08,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,""),
 ("26003","17/03/2026","VIR CPTE A CPTE EMIS - SALAIRE PERSO",2000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,
  "Remuneration ou compte courant d associe : traitement a confirmer."),
 ("26003","09/03/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26003","26/03/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26003","03/03/2026","COMMISSIONS facture 20260301029162684",179.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,
  "179,50 au lieu de 43,50 : trimestrialite ou operation particuliere."),

 # ---- avril
 ("26004","16/04/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO MARS",0,2011.77,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,""),
 ("26004","20/04/2026","VIR SCT INST EMIS - PERSO",2000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26004","09/04/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26004","27/04/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26004","02/04/2026","COMMISSIONS facture 20260401040294964",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- mai : aucun encaissement, la retro d avril arrive le 1er juin
 ("26005","12/05/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26005","26/05/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26005","05/05/2026","COMMISSIONS facture 20260501050345918",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- juin
 ("26006","01/06/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO AVRIL",0,2297.28,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,""),
 ("26006","04/06/2026","VIR RECU LOISEAU JOHANNE (EI) - SALAIRE ANNE MARIE",0,3170.81,
  "Refacturation de salaire","Convention de refacturation + bulletin",A_OBTENIR,
  "N EST PAS une retrocession. Ne pas agreger aux recettes d honoraires."),
 ("26006","05/06/2026","VIR SEPA INSTANT EMIS - PERSO MAISON",4000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26006","08/06/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26006","26/06/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26006","02/06/2026","COMMISSIONS facture 20260601053492198",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- juillet
 ("26007","06/07/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO MAI",0,7896.79,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,
  "Changement d echelle : 7 896,79 contre environ 2 000 les mois precedents."),
 ("26007","17/07/2026","VIR RECU LOISEAU JOHANNE (EI) - REMBT ERREUR DE CAISSE",0,603.20,
  "Divers","Note explicative de l erreur de caisse",A_OBTENIR,
  "Un patient a regle Johanne au lieu du Dr. N EST PAS une retrocession."),
 ("26007","31/07/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUIN 1",0,5709.37,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,
  "Juin regle en deux fois. Voir la 2e partie au relevé 26008."),
 ("26007","09/07/2026","VIR SEPA INSTANT EMIS - VERS COMPTE PERSO",5000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26007","08/07/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26007","27/07/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26007","02/07/2026","COMMISSIONS facture 20260701070281632",133.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),

 # ---- aout
 ("26008","03/08/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUIN 2EME PARTIE",0,5709.37,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,
  "Meme montant au centime que la 1re partie : ce N EST PAS un doublon, les "
  "libelles et les relevés sont differents."),
 ("26008","24/08/2026","VIR RECU LOISEAU JOHANNE (EI) - RETRO JUILLET",0,13363.66,
  "RECETTE retrocession","Note de retrocession d honoraires",A_OBTENIR,""),
 ("26008","03/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",5000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26008","06/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",4000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26008","18/08/2026","VIR SEPA INSTANT EMIS - SALAIRE PERSO",2000.00,0,
  "Prelevement du gerant","Aucune piece fournisseur",SANS_OBJET,""),
 ("26008","26/08/2026","VIREMENT SEPA EMIS - BNP PRO - BEN SELARL TIGHZA",10000.00,0,
  "Mouvement entre entites","Justification du flux vers la SELARL",A_OBTENIR,
  "10 000 verses a la SELARL. Apport, remboursement de compte courant ou "
  "autre : a qualifier, c est le gros mouvement de l exercice."),
 ("26008","10/08/2026","PRLV BNP PARIBAS - BNP PROT. DU FOYER",6.00,0,
  "Assurance","Contrat BNP Protection du Foyer",A_OBTENIR,""),
 ("26008","26/08/2026","ECHEANCE PRET 00271 61671310",636.01,0,
  "Emprunt","Tableau d amortissement du pret",A_OBTENIR,""),
 ("26008","04/08/2026","COMMISSIONS facture 20260701080593796",43.50,0,
  "Frais bancaires","Le relevé fait foi",PRESENT,""),
]

EN_TETE = ["banque", "releve", "date", "libelle", "debit", "credit",
           "nature", "justificatif_attendu", "etat", "lien_relevé",
           "depose_tgs", "horodatage_depot", "note"]


def lignes():
    for rel, date, lib, deb, cred, nat, just, etat, note in M:
        r = RELEVES[rel]
        yield [BANQUE, rel, date, lib,
               f"{deb:.2f}" if deb else "",
               f"{cred:.2f}" if cred else "",
               nat, just, etat,
               f"https://drive.google.com/file/d/{r['id']}/view",
               "FALSE", "", note]


def controle_des_soldes():
    """Le solde de fin doit etre le solde de debut plus les credits moins les
    debits. Si un mouvement manque, ca se voit ici et nulle part ailleurs."""
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
    return par_releve, ecarts


def chainage():
    """Le solde de cloture d un mois doit ouvrir le suivant."""
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
                    help="ecrit le CSV a importer dans Google Sheets")
    args = ap.parse_args()

    toutes = list(lignes())

    if args.export:
        with open(args.export, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(EN_TETE)
            w.writerows(toutes)
        print(f"{len(toutes)} mouvements ecrits dans {args.export}")
        return

    par_releve, ecarts = controle_des_soldes()
    ruptures = chainage()

    print()
    print("=" * 74)
    print(f"  CONTROLE BANCAIRE 2026  —  {BANQUE}")
    print("=" * 74)
    print()
    print(f"  Mouvements releves : {len(M)} sur {len(RELEVES)} relevés")
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
    par_etat = defaultdict(lambda: [0, 0.0])
    for _, _, _, deb, cred, _, _, etat, _ in M:
        par_etat[etat][0] += 1
        par_etat[etat][1] += deb + cred
    for etat in (A_OBTENIR, PRESENT, SANS_OBJET):
        if etat in par_etat:
            n, tot = par_etat[etat]
            print(f"    {etat:<12} {n:>3} mouvement(s) {euro(tot)} EUR")

    print()
    manquants = defaultdict(lambda: [0, 0.0])
    for _, _, _, deb, cred, _, just, etat, _ in M:
        if etat == A_OBTENIR:
            manquants[just][0] += 1
            manquants[just][1] += deb + cred
    print("  JUSTIFICATIFS A OBTENIR, par nature :")
    for just, (n, tot) in sorted(manquants.items(), key=lambda kv: -kv[1][1]):
        print(f"    {euro(tot)} EUR  sur {n:>2} mouvement(s)  {just}")

    print()
    print("  LE COMPTE LCL EST ABSENT. Aucun relevé LCL n existe dans le Drive.")
    print("  C est pourtant lui qui porte les reglements fournisseurs : COFICA,")
    print("  Aries, Mediforce, Google, Anthropic n apparaissent pas ci-dessus.")
    print("  Tant qu il manque, ce controle ne couvre qu une partie du dossier.")
    print()
    print("=" * 74)
    print()


if __name__ == "__main__":
    main()

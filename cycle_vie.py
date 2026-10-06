#!/usr/bin/env python3
"""
Donne a chaque piece son etat dans le CIRCUIT : a trier, a payer, paye,
envoye a TGS.

POURQUOI UNE COLONNE DE PLUS. Le registre avait deja une colonne « etat »
(RENOMME, RECU, MANQUANT, DEPOSEE...) mais elle repond a une autre question :
ai-je le fichier, et sous quel nom ? Elle ne dit pas ou la piece en est du
circuit. Je confondais les deux, et c est pour ca que j ai bati des lots de
depot avec des factures impayees — alors que le mode d emploi dit « Lucie
regle, PUIS renomme, PUIS depose ».

LES QUATRE ETATS SONT LES QUATRE DOSSIERS du drive partage. Le dossier EST
l etat : c est toute l astuce du systeme, et il suffit de la lire.

  A_TRIER      « 4 - A TRIER » — montant illisible, piece douteuse. On y met
               un fichier PLUTOT QUE DE DEVINER. C est le defaut, pas un echec.
  A_PAYER      « Lisa - Lucie : factures a regler » — Lucie gere. On n y
               touche pas, on n en depose rien.
  PAYE         « Lucie - Lisa : factures reglees » — reglee, en attente de
               depot. C EST LA SEULE SOURCE DES LOTS DE DEPOT.
  ENVOYE_TGS   « 3 - DEPOSEES TGS » ou vue dans l historique du portail.

LA CHAINE NE S INCREMENTE QUE SUR PREUVE — consigne du Dr le 06/10 :
« c est une chaine a suivre donc sauf si toi tu vois que c est paye sur le
releve de compte du lcl, on n incremente pas ».

Donc deux preuves, et DEUX SEULEMENT :

 1. ENVOYE_TGS : la piece est dans l historique du portail. Il fait foi, le
    mode d emploi le dit.
 2. PAYE : je retrouve CE paiement au releve LCL, soit parce que le libelle
    du debit porte la reference de la piece, soit parce que son montant ne
    correspond qu a un seul debit ET qu a une seule piece du registre.

Ce qui NE suffit PAS, et c est le coeur de la consigne :
  - le dossier « factures reglees » ou Lucie l a rangee. C est une
    affirmation, pas une preuve. Si la banque ne la montre pas, on
    n incremente pas.
  - le fait que le fournisseur soit preleve. « Cofica est preleve » ne dit
    pas QUELLE echeance est payee : dix prelevements Cofica font tous
    1 353,76 au centime.

Tout le reste reste A_TRIER, et le dire est le resultat utile : A_TRIER
signifie « je ne peux pas prouver », pas « c est perdu ».
"""

import csv
import io
import os
import re
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index_portail import cherche, construire, plat

CHAMPS = ["date_piece", "fournisseur", "type", "montant", "reference",
          "periode", "etat", "emplacement", "note", "cycle"]


def debits_du_releve(chemin_lcl):
    """
    Les debits du LCL, indexes de deux facons : par montant, et en un seul
    texte ou chercher une reference.
    """
    par_montant, textes = defaultdict(list), []
    try:
        lignes = csv.DictReader(io.open(chemin_lcl, encoding="utf-8"),
                                delimiter=";")
    except IOError:
        return {}, []
    for x in lignes:
        if not x.get("debit"):
            continue
        d = {"releve": x["releve"], "date": x["date"],
             "libelle": x["libelle_complet"],
             "montant": round(float(x["debit"]), 2)}
        par_montant[d["montant"]].append(d)
        textes.append(d)
    return par_montant, textes


def paiement_prouve(p, par_montant, textes, montants_registre):
    """
    Rend le debit qui paie CETTE piece, ou None. Deux preuves acceptees.

    La seconde est volontairement etroite : le montant ne prouve que s il est
    unique DES DEUX COTES. Si deux pieces du registre valent 1 353,76 et que
    dix debits valent 1 353,76, aucun appariement n est fonde — c est le piege
    Cofica, et il a deja produit un faux resultat ce matin.
    """
    # preuve 1 : la reference figure dans le libelle du debit
    ref = re.sub(r"\D", "", (p.get("reference") or ""))
    if len(ref) >= 5:
        for d in textes:
            if ref in re.sub(r"\D", "", d["libelle"]):
                return d, "reference %s lue dans le libelle" % ref

    # preuve 2 : montant unique d un cote comme de l autre
    try:
        m = round(float(p["montant"]), 2)
    except (ValueError, KeyError, TypeError):
        return None, ""
    if m <= 0:
        return None, ""
    cands = par_montant.get(m, [])
    if len(cands) == 1 and montants_registre.get(m, 0) == 1:
        return cands[0], "montant %.2f unique au releve et au registre" % m
    return None, ""


def cycle_de(p, tous, par_chiffres, par_montant, textes, mreg):
    """Rend (etat_du_cycle, la preuve qui le fonde)."""
    e = (p.get("emplacement") or "")
    el = plat(e)
    etat = (p.get("etat") or "").strip().upper()

    # 1. le portail fait foi
    # On ne croit plus un EMPLACEMENT qui affirme « depose le ... » : la
    # Mutualease 020-FL-32158803 portait cette mention alors que son numero
    # est absent de l historique. Seuls l etat DEPOSEE — qui exige une preuve,
    # cf. coherence.py — et le dossier « 3 - DEPOSEES TGS » comptent.
    # Une piece HORS PERIMETRE n est pas dans le circuit : ni a trier, ni
    # payee, ni envoyee. Sans ce test elle retombait en PAYE des que son
    # debit se retrouvait au releve — c est ce qui arrivait aux trois pieces
    # de decembre 2025, qui relevent du bilan 2025.
    if etat.startswith("HORS"):
        return "HORS_PERIMETRE", "ne releve pas de l exercice 2026"
    if etat.startswith("DEPOSEE") or "DEPOSEES TGS" in e:
        return "ENVOYE_TGS", "etat DEPOSEE ou dossier 3 - DEPOSEES TGS"
    ref = (p.get("reference") or "").strip()
    if ref and cherche(ref, tous, par_chiffres):
        return "ENVOYE_TGS", "trouvee dans l historique du portail"

    # 2. le paiement retrouve au releve LCL — la SEULE preuve de paiement
    d, pq = paiement_prouve(p, par_montant, textes, mreg)
    if d:
        return "PAYE", "releve %s du %s, %s" % (d["releve"], d["date"], pq)

    # 3. rien de prouve. L emplacement ne fait que nuancer le message.
    if "factures a regler" in el:
        return "A_PAYER", "dossier 'factures a regler', Lucie gere"
    if "factures reglees" in el:
        return "A_TRIER", "dans 'reglees' MAIS paiement introuvable au releve"
    return "A_TRIER", "paiement introuvable au releve"


def main(reg, lcl, *hist):
    tous, par_chiffres = construire(list(hist))
    par_montant, textes = debits_du_releve(lcl)

    # combien de pieces du registre portent chaque montant : sert a refuser
    # un appariement par montant des qu il y a ambiguite d un cote ou de
    # l autre.
    mreg = defaultdict(int)
    for l in io.open(reg, encoding="utf-8"):
        c = l.rstrip("\n").split(";")
        if len(c) < 9 or c[0] in ("date_piece",) or l.startswith("#"):
            continue
        try:
            mreg[round(float(c[3]), 2)] += 1
        except ValueError:
            pass

    brut = io.open(reg, encoding="utf-8").read().split("\n")
    sortie, compte, preuves = [], defaultdict(int), defaultdict(list)
    entete_vue = False
    for l in brut:
        if not l or l.startswith("#") or ";" not in l:
            sortie.append(l)
            continue
        c = l.split(";")
        if c[0] == "date_piece":
            sortie.append(";".join(CHAMPS))
            entete_vue = True
            continue
        if len(c) < 9:
            sortie.append(l)
            continue
        p = dict(zip(CHAMPS, c[:9]))
        cy, pq = cycle_de(p, tous, par_chiffres, par_montant,
                          textes, mreg)
        compte[cy] += 1
        preuves[cy + " / " + pq].append(p["fournisseur"])
        sortie.append(";".join(c[:9] + [cy]))
    if not entete_vue:
        print("ATTENTION : en-tete introuvable, rien ecrit.")
        return 1
    io.open(reg, "w", encoding="utf-8").write("\n".join(sortie))

    print("=== LE CIRCUIT, PIECE PAR PIECE ===\n")
    for cy in ("ENVOYE_TGS", "PAYE", "A_PAYER", "A_TRIER",
               "HORS_PERIMETRE"):
        print("  %-12s %3d pieces" % (cy, compte[cy]))
    print("\n--- sur quelle preuve ---")
    for k in sorted(preuves, key=lambda k: -len(preuves[k])):
        print("  %-62s %3d" % (k[:62], len(preuves[k])))
    print("\nSEULES les %d pieces PAYE alimentent les lots de depot."
          % compte["PAYE"])
    print("A_TRIER ne veut pas dire perdu : il veut dire que je ne peux pas")
    print("prouver le paiement au releve, donc la chaine ne s incremente pas.")
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

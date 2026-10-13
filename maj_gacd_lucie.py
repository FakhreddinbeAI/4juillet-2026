#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les deux GACD ecartees le 13/10 sont DEJA au portail. Et la raison est
une faille de methode qu il faut corriger pour de bon.

LUCIE NOMME SES DEPOTS PAR LE MONTANT, PAS PAR LE NUMERO
C est la decouverte importante du jour, et elle vaut bien plus que ces deux
pieces. Le 24/06/2026 Lucie a depose :
  « GACD 629 25 .pdf »     pour la facture 2402336461
  « GACD 28 76 1 .pdf »    pour la facture 2402321857
Aucun de ces deux noms ne contient le numero de facture. CONSEQUENCE : la
verification anti-doublon par NUMERO, qui est la premiere regle de tous mes
prompts de depot, NE PEUT PAS LES VOIR. Elle a repondu « rien au portail » sur
deux pieces qui y etaient.
LA REGLE QUI EN DECOULE : tout controle anti-doublon doit chercher AUSSI PAR
MONTANT, et pas seulement par numero. Pour toute piece passee par les mains de
Lucie, le montant est la cle, pas la reference.

LA PREUVE, PAR DEUX CHEMINS INDEPENDANTS
Chrome a constate que les fichiers sources de Lucie dans « Reglements Mai »
sont identiques OCTET POUR OCTET a nos telechargements.
Je l ai corrobore sans lui, avec les tailles relevees dans mes propres
lectures du 12 et du 13/10 :
  2402336461   « GACD : 629,25 »  151 464 o   notre fichier  151 464 o
  2402321857   « GACD - 28,76 »   110 941 o   notre fichier  110 941 o
Deux relevees separees, memes nombres.

CE QUE CETTE PREUVE NE COUVRE PAS, ET JE L ECRIS
La chaine est : notre fichier est identique a celui de Lucie, et le fichier de
Lucie a ete depose le 24/06. Le SECOND maillon est une inference tiree du nom
du depot, pas une lecture. Chrome n a PAS pu ouvrir ces deux depots : le portail
ne propose pas « Voir » et la demande du fichier renvoie une erreur HTTP 424.
Le nom « GACD 629 25 » est exactement ce que le portail produit a partir de
« GACD : 629,25 », donc l inference est solide — mais c est une inference.
POUR LA FERMER : Lucie peut confirmer, elle a fait ces deux depots. TGS aussi,
en ouvrant les deux pieces de son cote.

UNE PRECISION DE CHROME QUI COMPTE POUR LA SUITE
Il n a PAS acces au disque du portable. Il prend les fichiers dans le dossier
« Downloads » du DRIVE, ou ils portent les noms que je cite. Mes prompts
ecrivent « Mon ordinateur portable > Downloads » : c est le chemin Drive de la
sauvegarde du portable, et cela marche — mais cela veut dire que RIEN n est
deposable avant que la synchronisation Drive soit passee.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
HIST = "historique_portail.txt"

DEPOTS = {
    "2402336461": ("GACD 629 25 .pdf", "GACD : 629,25", "151 464"),
    "2402321857": ("GACD 28 76 1 .pdf", "GACD - 28,76", "110 941"),
}

NOTE = (
    " DEJA AU PORTAIL, ETABLI LE 13/10/2026 — ET LA RECHERCHE PAR NUMERO NE "
    "POUVAIT PAS LE VOIR. Lucie a depose cette facture le 24/06/2026 sous le "
    "nom '%s', qui ne contient PAS le numero de facture mais le MONTANT. "
    "PREUVE PAR DEUX CHEMINS INDEPENDANTS : son fichier source « %s » du "
    "dossier « Reglements Mai » est identique OCTET POUR OCTET a notre "
    "telechargement (constate par Chrome), et les deux fichiers pesent %s "
    "octets dans mes propres relevees des 12 et 13/10. "
    "CE QUE LA PREUVE NE COUVRE PAS : que le fichier de Lucie soit bien celui "
    "qui a ete televerse le 24/06 est une INFERENCE tiree du nom du depot, pas "
    "une lecture. Chrome n a pas pu ouvrir ce depot — le portail ne propose pas "
    "« Voir » et la demande du fichier renvoie HTTP 424. Le nom est exactement "
    "ce que le portail produit a partir du fichier source, donc l inference est "
    "solide, mais c en est une. A FERMER par Lucie, qui a fait le depot, ou par "
    "TGS en ouvrant la piece. "
    "NON REDEPOSEE : le compteur du portail est reste a 1 450.")

REGLE = (
    "#\n"
    "# --- REGLE DU 13/10/2026 : CHERCHER AUSSI PAR MONTANT ---------------\n"
    "# Lucie nomme ses depots par le MONTANT, pas par le numero de facture.\n"
    "# Le 24/06/2026 elle a depose « GACD 629 25 .pdf » et « GACD 28 76 1\n"
    "# .pdf » pour les factures 2402336461 et 2402321857. Aucun des deux noms\n"
    "# ne porte le numero.\n"
    "# CONSEQUENCE : la verification anti-doublon PAR NUMERO, qui est la\n"
    "# premiere regle de tous mes prompts de depot, est AVEUGLE a tout ce qui\n"
    "# est passe par ses mains. Elle a repondu « rien au portail » sur deux\n"
    "# pieces qui y etaient depuis quatre mois.\n"
    "# DESORMAIS : tout controle anti-doublon cherche AUSSI PAR MONTANT. Pour\n"
    "# une piece passee par Lucie, le montant est la cle, pas la reference.\n"
    "#\n")


def charger(chemin):
    lignes = io.open(chemin, encoding="utf-8").read().splitlines()
    index = []
    for n, l in enumerate(lignes):
        if not l.strip() or l.startswith("#"):
            continue
        index.append((n, next(csv.reader([l], delimiter=";"))))
    return lignes, index


def main():
    lignes, index = charger(FIC)
    h = index[0][1]
    i = {c: h.index(c) for c in h}
    par = {}
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d mal formee." % (n + 1))
        ref = r[i["reference"]].strip()
        if ref:
            par.setdefault(ref, []).append((n, r))

    journal, noms = [], []
    for ref, (depot, source, taille) in DEPOTS.items():
        c = par.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        r[i["etat"]] = "DEPOSEE"
        r[i["note"]] = (r[i["note"]].rstrip()
                        + (NOTE % (depot, source, taille))).replace(";", " -")
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()
        noms.append(depot)
        journal.append("  %-12s DEPOSEE le 24/06 par Lucie sous '%s'"
                       % (ref, depot))

    # la regle, en commentaire dans l en-tete du registre
    if "CHERCHER AUSSI PAR MONTANT" not in "\n".join(lignes):
        pos = next(k for k, l in enumerate(lignes) if not l.startswith("#"))
        lignes[pos:pos] = REGLE.rstrip("\n").split("\n")
        journal.append("  regle inscrite dans l en-tete du registre")

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    brut = io.open(HIST, encoding="utf-8").read()
    if not brut.endswith("\n"):
        raise SystemExit("%s ne finit pas par un retour a la ligne." % HIST)
    avant = len(brut.splitlines())
    deja = set(x.split("|")[0].strip() for x in brut.splitlines() if x.strip())
    ajouts = ["%s | Depose par Lucie | 2026-06-24" % x
              for x in noms if x not in deja]
    if ajouts:
        io.open(HIST, "a", encoding="utf-8", newline="\n").write(
            "\n".join(ajouts) + "\n")
    apres = len(io.open(HIST, encoding="utf-8").read().splitlines())

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("historique : %d -> %d lignes" % (avant, apres))
    print("%d pieces au registre." % (len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

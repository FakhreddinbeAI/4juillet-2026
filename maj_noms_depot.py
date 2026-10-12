#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Noms de fichiers avant depot — verification du 12/10/2026.

POURQUOI CE SCRIPT EXISTE
Le docteur a demande : « tu ne crois pas que tu devrais les renommer avant pour
eviter les doublons ? » J ai d abord repondu « 34 pieces a renommer, dont 25
interdites par ta regle ». CE CHIFFRE ETAIT FAUX. Je l avais tire de la colonne
`emplacement` du registre, qui DECRIT OU J AI TROUVE le fichier — pas comment il
s appelle aujourd hui. Trois des neuf pieces que j annoncais « a renommer »
etaient deja renommees depuis le 08/10.

LA REGLE QUI EN SORT
Pour savoir si un fichier est retrouvable, on lit SON NOM SUR LE DRIVE. Jamais
la colonne `emplacement`, qui est une description en clair et vieillit des qu on
renomme. Les deux colonnes ne repondent pas a la meme question.

CE QUE LE VRAI DECOMPTE DONNE, dossier par dossier, par lecture du Drive
  etape 3 (75 fichiers)   : normalises, verifie le 09/10
  factures reglees (6)    : normalises, tous renommes le 08-09/10
  factures a regler (31)  : 24 portent une reference connue du registre
                            4 sont des relances ou releves de solde — aucune
                              reference de facture n existe, un renommage n en
                              inventerait pas
                            3 sont muets et INTERDITS (regle du docteur)
                            1 corrige ici

LE PIEGE DE MON PROPRE TEST
J ai teste « le nom contient-il une reference du registre ? » avec un seuil de
6 caracteres alphanumeriques, pour eviter qu une date ou un montant ne matche
par hasard. Le seuil a rejete « id=36409.pdf » alors que 36409 EST la reference
de la facture MADE-IN-LABS du 31/08 (1 207,00 EUR). Un garde-fou contre les faux
positifs produit des faux negatifs : il faut lire ce qu il ecarte.

LES TROIS QUI RESTENT MUETS, ET POURQUOI ON N Y TOUCHE PAS
  « NTJ aout »             = NTJ du 01/08/2026, 341,00, ref 20240312
  « ntj septembre 2029 »   = NTJ du 30/09/2026, 295,00, ref 20240346
                             NB : le nom porte 2029, l annee est FAUSSE
  « MADE IN LABS JUILLET » = MADE-IN-LABS du 31/07/2026, 1 705,24, ref 36187
Tous trois dans « Lisa - Lucie : factures a regler ». Regle du docteur, mot pour
mot : « ne renomme pas pour les factures a regler ». Aucun double n existe
ailleurs sur le Drive — verifie le 12/10. Ils partiront donc sous ces noms.

CE QUI A ETE CORRIGE
« 14.04 straumann.pdf » existait en DEUX exemplaires de 27 648 octets : un chez
Lucie (intouchable) et un dans le dossier « Lucie » de MON DRIVE, que le docteur
possede et que sa regle ne couvre pas — elle nomme le dossier partage « factures
a regler ». Lu le 12/10 : c est la facture 9060079433 du 14/04/2026, 73,14 EUR,
client 15123197, livree chez Made in Labs. La copie de Mon Drive est renommee
« 2026-04-14_STRAUMANN_FACTURE_73.14_9060079433.pdf ». L original de Lucie n a
pas ete touche.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

NOTE_STRAUMANN = (
    " NOM DE FICHIER VERIFIE LE 12/10/2026. Cette facture existe en DEUX "
    "exemplaires de 27 648 octets, tous deux nommes « 14.04 straumann.pdf », "
    "nom qui ne porte aucun numero. L un est dans le dossier partage de Lucie "
    "(intouchable, regle du docteur). L AUTRE est dans le dossier « Lucie » de "
    "MON DRIVE, id 1wFFx0kYLtQIcYa1YUCVZaS0ObH_2zhnG, que sa regle ne couvre "
    "pas puisqu elle nomme « factures a regler ». Lu le 12/10 : facture "
    "9060079433 du 14/04/2026, 73,14 EUR, client 15123197, livraison chez "
    "Laboratoire Made in Labs. Cette copie est RENOMMEE "
    "« 2026-04-14_STRAUMANN_FACTURE_73.14_9060079433.pdf ». "
    "C EST ELLE QU IL FAUT DEPOSER, pas celle de Lucie : deposer un fichier "
    "sans numero rend la piece introuvable au portail, et c est exactement ce "
    "qui a fait echouer le lot 3 du 09/10.")

MUETS = {
    "20240312": ("NTJ aout", "NTJ du 01/08/2026, 341,00"),
    "20240346": ("ntj septembre 2029", "NTJ du 30/09/2026, 295,00"),
    "36187": ("MADE IN LABS JUILLET", "MADE-IN-LABS du 31/07/2026, 1 705,24"),
}

NOTE_MUET = (
    " NOM DE FICHIER NON RETROUVABLE, ET ON N Y TOUCHE PAS. Le fichier "
    "s appelle « %s » et ne porte ni numero ni reference : une recherche par "
    "numero au portail ne le verra jamais. Sa reference au registre est bien "
    "connue (%s), un renommage la restituerait. MAIS il est dans « Lisa - "
    "Lucie : factures a regler » et la regle du docteur est : « ne renomme pas "
    "pour les factures a regler ». Verifie le 12/10/2026 : AUCUN double de ce "
    "fichier n existe ailleurs sur le Drive, contrairement a la facture "
    "Straumann 9060079433 — il n y a donc pas de copie a renommer a la place. "
    "Il sera depose sous ce nom. A la prochaine recherche de doublon, le "
    "chercher par FOURNISSEUR + DATE + MONTANT, pas par numero.")

NOTE_2029 = (
    " ERREUR DANS LE NOM DU FICHIER, A SIGNALER A LUCIE : il est intitule "
    "« ntj septembre 2029 » alors que la piece est de septembre 2026. L annee "
    "est fausse de trois ans. Je ne corrige pas — dossier de Lucie.")


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
    par_ref = {}
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d mal formee." % (n + 1))
        ref = r[i["reference"]].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))

    touche, journal = {}, []

    def ajoute(ref, bout):
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (ref, len(c)))
        n, r = c[0]
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        touche[n] = r
        return r

    ajoute("9060079433", NOTE_STRAUMANN)
    journal.append("  9060079433   copie renommee signalee, c est elle a deposer")

    for ref, (nom, ident) in MUETS.items():
        bout = NOTE_MUET % (nom, ident)
        if ref == "20240346":
            bout += NOTE_2029
        ajoute(ref, bout)
        journal.append("  %-12s muet, intouchable, consigne de recherche posee"
                       % ref)

    for n, r in touche.items():
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()
    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("%d ligne(s) completee(s), %d pieces au registre."
          % (len(touche), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Straumann, retour du portail du 09/10/2026 — fin de l affaire des avoirs.

MA PISTE « EXC » ETAIT FAUSSE
J avais vu « No de commande EXC 2300813341 » sur l avoir 9060040628 et j en
avais deduit que les avoirs etaient classes sous des commandes d echange
distinctes. Non : EXC est la « Reference du client » des commandes DEJA
parcourues. EXC 2300813341 = commande eShop 3038176486 du 13/02/2026, 1 834,34
EUR, qui ne porte qu un seul document, la facture 9060032068. L avoir n y est
pas.

CE QUE LE PORTAIL A DONNE A LA PLACE : LES NUMEROS DE RETOUR
L eShop a un « Historique des Retours » (menu du compte, « Mes retours et
incidents ») ou chaque avoir a une ligne « RE Retours » a sa date exacte. Ces
numeros sont un identifiant interne que Straumann peut suivre — bien plus
solide qu une date dans une reclamation.
Le lien de ces lignes ouvre le BORDEREAU DE RETOUR, celui qu on joint au colis,
pas l avoir.

LA COLONNE « Ref. PDF » DE LA FEUILLE N A JAMAIS ETE FAUSSE
Verifie le 09/10/2026 : c est l IDENTIFIANT INTERNE DU DOCUMENT chez Straumann,
et le portail nomme le fichier « 0<identifiant>.pdf ». 11 concordances sur 11
testables.
Et la correlation sur les avoirs est parfaite : le SEUL avoir qui avait sa
propre reference (9060106911, 982024193) est le SEUL dont le PDF soit au
portail. Les huit autres portaient 977638795, qui est l identifiant de la
facture d origine 9050178334 — le bordereau de retour l ecrit d ailleurs
« 977638795/000031 ». La colonne disait donc exactement la verite : cet avoir
n a pas de PDF a lui, voici celui de sa facture d origine.
J ai accuse cette colonne trois fois — recapitulatif, remplissage a la va-vite,
defaut du portail. Elle avait raison les trois fois.

REGLE REUTILISABLE QUI EN DECOULE
Chez Straumann, un avoir dont la « Ref. PDF » est egale a l identifiant de sa
facture d origine N A PAS de PDF telechargeable. La colonne predit la
disponibilite : inutile de chercher, il faut reclamer.

IL EXISTE UN PRECEDENT, ET IL A MARCHE
Le dossier « Duplicata Straumann (demande TGS) » du bureau contient une
trentaine de pieces creees le 09/07/2026, dont l avoir 9060040628 et la facture
9060017570. Son nom dit « demande TGS » : ces documents ont ete obtenus par une
reclamation precedente. Straumann fournit donc des duplicata quand on les
demande. C est pour ca que 9060040628 est au Drive sans etre au portail.

AMBIGUITE ASSUMEE, NON TRANCHEE
Les avoirs 9060063384 et 9060063944 sont tous les deux du 26/03/2026 et font
tous les deux 305,72. Deux lignes de retour existent ce jour-la, 65320684 et
65321641, et AUCUNE n affiche de numero d avoir. On ne peut pas dire laquelle
va avec laquelle. Les deux numeros sont donc inscrits sur les DEUX lignes, avec
la mention de l ambiguite. On ne devine pas.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

COMMUN = (
    " VOIE DE RECUPERATION EPUISEE AU PORTAIL LE 09/10/2026. Ma piste des "
    "commandes « EXC » etait FAUSSE : EXC est la « Reference du client » des "
    "commandes deja parcourues, pas un numero de commande d echange distinct. "
    "EXC 2300813341 = commande eShop 3038176486 du 13/02/2026, qui ne porte "
    "que la facture 9060032068. "
    "EN REVANCHE l eShop a un « Historique des Retours » (« Mes retours et "
    "incidents ») ou cet avoir a une ligne « RE Retours » a sa date exacte. Le "
    "lien ouvre le BORDEREAU DE RETOUR, pas l avoir. "
    "POURQUOI SON PDF N EXISTE PAS AU PORTAIL : sa « Ref. PDF » dans la "
    "feuille de suivi vaut 977638795, qui est l identifiant de la FACTURE "
    "D ORIGINE 9050178334 — le bordereau de retour l ecrit « 977638795/000031 "
    "». Verifie le 09/10 : cette colonne est l identifiant interne du document "
    "chez Straumann et le portail nomme ses fichiers « 0<identifiant>.pdf », "
    "11 concordances sur 11. Le seul avoir qui avait sa PROPRE reference, le "
    "9060106911, est le seul dont le PDF soit au portail. La colonne n a jamais "
    "menti : elle disait que cet avoir n a pas de PDF a lui. "
    "PRECEDENT ENCOURAGEANT : le dossier « Duplicata Straumann (demande TGS) » "
    "du bureau contient une trentaine de pieces obtenues le 09/07/2026 par une "
    "reclamation precedente, dont l avoir 9060040628. Straumann fournit des "
    "duplicata quand on les demande. "
    "DEMANDE PREPAREE LE 09/10/2026 en brouillon Gmail, de "
    "contact@implantologielege.com vers commandes.fr@straumann.com — la seule "
    "adresse affichee dans le compte, blocs « Service client » et « Factures et "
    "paiements ». NON ENVOYEE : c est le docteur qui decide.")

RETOURS = {
    "9060011986": "65195207",
    "9060034033": "65245062",
    "9060059451": "65310237",
    "9060084611": "65367071",
    "9060102694": "65417162",
}

AMBIGUS = ["9060063384", "9060063944"]
NOTE_AMBIGU = (
    " NUMERO DE RETOUR AMBIGU, NON TRANCHE : deux lignes « RE Retours » "
    "existent le 26/03/2026, 65320684 et 65321641, et aucune n affiche de "
    "numero d avoir. Les avoirs 9060063384 et 9060063944 sont tous deux de ce "
    "jour et font tous deux 305,72 : impossible de dire lequel va avec lequel. "
    "Les DEUX numeros sont donc cites pour les DEUX avoirs dans la "
    "reclamation, en disant l ambiguite. On ne devine pas.")


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

    for ref, retour in RETOURS.items():
        ajoute(ref, COMMUN + " LIGNE DE RETOUR AU PORTAIL : « RE Retours » "
               + retour + ", a citer dans toute reclamation — c est "
               "l identifiant que Straumann peut suivre.")
        journal.append("  %-12s retour %s inscrit" % (ref, retour))

    for ref in AMBIGUS:
        ajoute(ref, COMMUN + NOTE_AMBIGU)
        journal.append("  %-12s deux retours possibles, ambiguite inscrite"
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

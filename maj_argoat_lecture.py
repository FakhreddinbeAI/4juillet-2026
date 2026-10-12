#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ARGOAT : les quatre factures ouvertes et lues le 12/10/2026 au soir.

LES NEUF TELECHARGEMENTS NE SONT QUE QUATRE DOCUMENTS
Chrome a telecharge « Dr TIGHZA - Facture Mars » trois fois, « Mai », « Juin »
et « Juillet » deux fois chacune. Les tailles le disent : 108 565 pour les
trois Mars, 108 826 pour les deux Mai, 108 512 pour les deux Juin, 108 212 pour
les deux Juillet. Quatre documents, neuf fichiers.

ET CES QUATRE DOCUMENTS SONT DEJA AU DRIVE
Les fichiers de « Mon Drive > FACTURATION » ont EXACTEMENT les memes tailles :
  ARG12031  108 565  2026-04-01_ARGOAT_FACTURE_45.00_ARG12031_P2026-03-01...
  ARG12869  108 826  2026-06-01_ARGOAT_FACTURE_38.00_ARG12869_P2026-05-01...
  ARG13312  108 512  2026-07-01_ARGOAT_FACTURE_32.00_ARG13312_P2026-06-01...
  ARG13747  108 212  2026-07-31_ARGOAT_FACTURE_45.00_ARG13747_P2026-07-01...
Les neuf telechargements n apportent donc RIEN. Ils sont nommes _DOUBLON et
peuvent etre supprimes.

CE QUE LA LECTURE CONFIRME — aucune correction, pour une fois
  ARG12031  date 01/04/2026  45,00  facturation du 01/03 au 31/03
  ARG12869  date 01/06/2026  38,00  facturation du 01/05 au 31/05
  ARG13312  date 01/07/2026  32,00  facturation du 01/06 au 30/06
  ARG13747  date 31/07/2026  45,00  facturation du 01/07 au 31/07
N° client TIGHZA-100492, n° comptable C626.

LE TABLEAU D ENCOURS, ET LA PREUVE DE MON ERREUR DU MATIN
Les cinq valeurs se lisent dans cet ordre : TOTAL, puis > 30 j, > 60 j,
> 90 j, > 120 j. Les trois factures se decomposent ainsi :
  au 01/06  total  45,00 =                                  45,00 (>60 j)
  au 01/07  total  83,00 = 38,00 (>30 j) +                  45,00 (>90 j)
  au 31/07  total 115,00 = 32,00 (>30 j) + 38,00 (>60 j) +  45,00 (>120 j)
Le 45,00 qui vieillit de tranche en tranche est ARG12031, la facture de MARS.
Le 12/10 au matin j avais ecrit que ce 45,00 a « >120 jours » etait ARG13747 et
que ARG12031 « etait reglee ». C est l inverse, et la decomposition le prouve :
ARG13747 est emise le 31/07, elle ne peut figurer dans AUCUNE tranche
d anciennete de sa propre facture. Cause de l erreur : j avais apparie les
montants PAR VALEUR au lieu de PAR POSITION, dans un tableau ou 45,00 apparait
deux fois. La lecture par position est la seule methode.
L encours de 115,00 EXCLUT la facture en cours : le du total au 31/07 est donc
115,00 + 45,00 = 160,00.

UNE DIVERGENCE DE TEXTE LEGAL, NON TRANCHEE
Les quatre factures impriment « Exoneration de TVA Article 264-4-1 du CGI ».
Mes notes de dossier ecrivent 261-4-1°, qui est la reference habituelle de
l exoneration des prothesistes dentaires. L un des deux se trompe, et ce n est
pas a moi d en decider : a signaler a TGS, sans rien corriger ici.

ARG12869 : CE QUE CETTE LECTURE NE PROUVE PAS
Le doublon suppose au portail (« argoat Mai .pdf » du 24/06) reste non tranche.
Le test par comparaison d octets que j avais prescrit NE PEUT PAS marcher : le
fichier « argoat - Mai » du dossier de Lucie pese 106 459 octets, contre 108 826
pour notre PDF d ARG12869. Deux PDF differents de la MEME facture. Le seul test
valable est d OUVRIR le depot du 24/06 au portail et d y lire le numero.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

LU = {
    "ARG12031": ("2026-04-01", "45.00"),
    "ARG12869": ("2026-06-01", "38.00"),
    "ARG13312": ("2026-07-01", "32.00"),
    "ARG13747": ("2026-07-31", "45.00"),
}

NOTE = (
    " OUVERTE ET LUE LE 12/10/2026. Date, montant et periode releves DANS LE "
    "DOCUMENT : conformes au registre, aucune correction. N° client "
    "TIGHZA-100492, n° comptable C626. Le document imprime « Exoneration de TVA "
    "Article 264-4-1 du CGI » alors que mes notes citent 261-4-1° : divergence "
    "signalee, non tranchee, c est a TGS de dire laquelle vaut. "
    "LE TELECHARGEMENT DEPUIS ftighza EST UN DOUBLON : il a la taille exacte du "
    "fichier deja present dans « Mon Drive > FACTURATION », il est nomme "
    "_DOUBLON dans Telechargements et peut etre supprime.")

NOTE_ENCOURS = (
    " TABLEAU D ENCOURS DECOMPOSE LE 12/10/2026, ce qui corrige definitivement "
    "mon erreur du matin. Les cinq valeurs se lisent TOTAL, >30 j, >60 j, >90 j, "
    ">120 j. Au 01/06 : 45,00 total dont 45,00 a plus de 60 jours. Au 01/07 : "
    "83,00 = 38,00 a plus de 30 j + 45,00 a plus de 90 j. Au 31/07 : 115,00 = "
    "32,00 + 38,00 + 45,00 a plus de 120 j. Le 45,00 qui vieillit de tranche en "
    "tranche est ARG12031, la facture de MARS. J avais ecrit que c etait "
    "ARG13747 et que ARG12031 etait reglee : c est l inverse. ARG13747 est "
    "emise le 31/07, elle ne peut figurer dans aucune tranche d anciennete de "
    "sa propre facture. J avais apparie les montants PAR VALEUR au lieu de PAR "
    "POSITION, dans un tableau ou 45,00 figure deux fois. "
    "L encours EXCLUT la facture en cours : du total au 31/07 = 115,00 + 45,00 "
    "= 160,00.")

NOTE_12869 = (
    " DOUBLON AU PORTAIL TOUJOURS NON TRANCHE, ET LE TEST QUE J AVAIS PRESCRIT "
    "EST INVALIDE. Je demandais de comparer octet pour octet le fichier "
    "« argoat - Mai » du dossier de Lucie avec le depot « argoat Mai .pdf » du "
    "24/06. Or « argoat - Mai » pese 106 459 octets et notre PDF d ARG12869 en "
    "pese 108 826 : ce sont DEUX PDF DIFFERENTS DE LA MEME FACTURE, donc aucune "
    "comparaison binaire ne conclura. LE SEUL TEST VALABLE : ouvrir le depot du "
    "24/06 au portail et y lire le numero de facture.")


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

    touche, journal = {}, []
    for ref, (d, m) in LU.items():
        c = par.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        if (r[i["date_piece"]], r[i["montant"]]) != (d, m):
            raise SystemExit(
                "%s : le registre dit %s / %s, le document %s / %s. "
                "Je m arrete, c est a regarder." % (
                    ref, r[i["date_piece"]], r[i["montant"]], d, m))
        bout = NOTE
        if ref == "ARG13747":
            bout += NOTE_ENCOURS
        if ref == "ARG12869":
            bout += NOTE_12869
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        touche[n] = r
        journal.append("  %-10s %s  %6s  conforme, aucune correction"
                       % (ref, d, m))

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
    print("%d lignes completees, %d pieces au registre."
          % (len(touche), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

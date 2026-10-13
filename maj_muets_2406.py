#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les depots muets du 24/06/2026 : cinq pieces identifiees par les SOURCES.

LE PORTAIL REFUSE DE LES OUVRIR, LES SOURCES NON
Chrome a tente d ouvrir les neuf depots muets du 24/06 : 0 sur 9. Tous
repondent HTTP 424, « la recuperation du document a echoue », et aucun ne
propose de bouton « Voir ». Il a aussi constate que trois des neuf noms
existent EN DOUBLE au portail — « NTJ 1 », « NTJ Avril 2026 2 » et
« MIL 04 2026 1 » — soit 12 depots pour 9 noms.
Sa seconde piste etait la bonne, et je pouvais la suivre moi-meme : LIRE LES
FICHIERS SOURCES de Lucie dans « Reglements Mai ». C est ce qui avait resolu
les deux GACD la veille.

CINQ PIECES IDENTIFIEES, TOUTES DEJA AU PORTAIL
  depot « argoat Mai .pdf »              <- « argoat - Mai »
      ARG12869, 01/06/2026, 38,00
  depot « NTJ 1 .pdf »                   <- « NTJ »
      20240293, 01/06/2026, 151,00
  depot « NTJ Avril 2026 2 .pdf »        <- « NTJ  Avril 2026.pdf »
      20240280, 04/05/2026, 578,00
  depot « Paycenter Straumann Group 1 »  <- « Paycenter Straumann Group »
  depot « Paycenter Straumann Group 2 »     9060024519 (297,84) et
                                            9060036137 (61,20), lus le 12/10
DEUX DE CES CINQ ETAIENT EN A_VERIFIER : je croyais ne pas detenir les
fichiers de 20240280 et 20240293. Ils etaient chez Lucie, et deposes depuis
quatre mois.

LA LIMITE DE CETTE PREUVE, ECRITE UNE FOIS POUR TOUTES
La chaine est : le fichier source porte tel numero (lu), et son nom correspond
a celui du depot (« argoat - Mai » -> « argoat Mai .pdf »). Le SECOND maillon
est une correspondance de NOM, pas une lecture du depot — impossible, 424.
Elle est solide parce que le portail nomme un depot d apres le fichier
televerse et suffixe « 1 », « 2 » les homonymes, ce qu on observe exactement.
Mais c est une inference. A fermer par Lucie, qui a fait ces depots.

UNE TROISIEME CONFIRMATION SUR LE TEXTE DE TVA
Les deux factures NTJ impriment « Exoneration de TVA - Article 261-4-1° du
CGI ». Avec ZFX lu le 13/10, cela fait DEUX fournisseurs dentaires contre un
pour cette reference. La coquille est donc bien chez ARGOAT, qui ecrit
264-4-1. Je le note sans le trancher pour TGS.

CE QUE LES FACTURES NTJ CONTIENNENT, ET QUI N EST PAS UN PROBLEME
Elles nomment les patients (ORDONNEAU, RAM, DA SILVA, AUPIED, MAZY, OGERON)
parce qu une facture de laboratoire dentaire designe ses travaux par patient.
C est inherent a la piece et ces factures sont deja au portail. A NE PAS
CONFONDRE avec le cas de la note d honoraires 2825, retenue parce que la
donnee patient — nom, date de naissance d une mineure, NIR — y est l objet
meme du document. Une facture de labo est une piece comptable normale.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

RESOLU = {
    "ARG12869":   ("argoat Mai .pdf", "argoat - Mai",
                   "ARG12869, facture MAI 2026, date 01/06/2026, 38,00, "
                   "facturation du 01/05 au 31/05, client TIGHZA-100492"),
    "20240293":   ("NTJ 1 .pdf", "NTJ",
                   "20240293, date 01/06/2026, 151,00 TTC exonere, mai 2026, "
                   "bons 4991-1 et 5021-1"),
    "20240280":   ("NTJ Avril 2026 2 .pdf", "NTJ  Avril 2026.pdf",
                   "20240280, date 04/05/2026, 578,00 TTC exonere, avril 2026, "
                   "six bons de livraison"),
    "9060024519": ("Paycenter Straumann Group 1 .pdf ou 2 .pdf",
                   "Paycenter Straumann Group (34 816 octets)",
                   "9060024519, date 03/02/2026, 297,84 TTC, mention "
                   "Reimpression, compte 15123197"),
    "9060036137": ("Paycenter Straumann Group 1 .pdf ou 2 .pdf",
                   "Paycenter Straumann Group (27 648 octets)",
                   "9060036137, date 19/02/2026, 61,20 TTC, compte 15123197"),
}

NOTE = (
    " DEJA AU PORTAIL DEPUIS LE 24/06/2026, ETABLI LE 13/10 PAR LA SOURCE ET "
    "NON PAR LE DEPOT. Le portail refuse d ouvrir ce depot : pas de bouton "
    "« Voir », et la demande du fichier renvoie HTTP 424. Chrome a essaye les "
    "neuf depots muets du 24/06, zero sur neuf. "
    "IDENTIFICATION PAR LE FICHIER SOURCE de Lucie dans « Reglements Mai », "
    "nomme « %s », ouvert et lu : %s. "
    "Le depot correspondant s appelle « %s ». "
    "LIMITE DE LA PREUVE : le rattachement du fichier source au depot est une "
    "correspondance de NOM, pas une lecture du depot. Elle est solide — le "
    "portail nomme un depot d apres le fichier televerse et suffixe « 1 », "
    "« 2 » les homonymes, ce qu on observe — mais c en est une. A fermer par "
    "Lucie, qui a fait ces depots. NON REDEPOSEE.")

LOC = "Drive partage > Lisa - Lucie : factures a regler > Reglements Mai"


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

    journal = []
    for ref, (depot, source, lu) in RESOLU.items():
        c = par.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        avant = r[i["etat"]]
        r[i["etat"]] = "DEPOSEE"
        if avant == "A_VERIFIER":
            r[i["emplacement"]] = LOC
        r[i["note"]] = (r[i["note"]].rstrip()
                        + (NOTE % (source, lu, depot))).replace(";", " -")
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()
        journal.append("  %-12s %-10s -> DEPOSEE   via '%s'"
                       % (ref, avant, depot[:34]))

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")
    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("%d pieces au registre." % (len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

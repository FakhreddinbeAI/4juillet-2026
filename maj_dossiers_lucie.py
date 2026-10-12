#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Depouillement des dossiers de Lucie, 12/10/2026, apres validation du partage.

CE QUE LE PARTAGE NE CHANGE PAS
Le deplacement d un fichier dans le drive partage reste REFUSE. Teste a neuf le
12/10 sur un fichier que je venais de creer moi-meme : « The caller does not
have permission ». Et cette fois la cause est PROUVEE, plus seulement supposee :
contact@implantologielege.com est fileOrganizer sur « 3 - DEPOSEES TGS » ET sur
« Lisa - Lucie : factures a regler », role qui suffit dans le modele Google pour
deplacer un fichier a l interieur d un drive partage. Les droits sont donc la et
l appel echoue quand meme : LA LIMITE EST DANS MON OUTIL. Aucun partage n y
changera rien, Chrome reste la seule voie.

CE QUE LE PARTAGE OUVRE : la lecture complete des deux dossiers de Lucie.

TROIS PIECES QUE LE REGISTRE IGNORAIT, lues dans leur PDF
  BONGERT 24517077  30/06/2026  317,70  exoneree art. 261-4-1 CGI
  BONGERT 24517520  31/07/2026  289,05  exoneree art. 261-4-1 CGI
  NTJ     20240346  30/09/2026  295,00  exoneree art. 261-4-1 CGI
Les deux Bongert prolongent une serie dont le registre s arretait a 24516832.
La NTJ comble le trou de septembre dans une serie mensuelle complete par
ailleurs. Aucune n est au classeur de l assistante ni a la feuille Straumann :
c est le partage de Lucie qui les a fait apparaitre.

DEUX MONTANTS COMBLES, lus dans le PDF
  NTJ 20240280  578,00  (facture du 04/05/2026, periode Avril 2026)
  NTJ 20240293  151,00  (facture du 01/06/2026, periode Mai 2026)
Les deux lignes existaient au registre sans montant.

LA CHAINE DES SOLDES NTJ, qui se recoupe
  04/05  solde precedent 1 037,00  +578,00  = a regler 1 615,00
  01/06  solde precedent 1 615,00  +151,00  = a regler 1 766,00
  30/09  solde precedent 1 316,00  +295,00  = a regler 1 611,00
Le 1 615 du 01/06 egale le « a regler » du 04/05 : RIEN n a ete paye entre mai
et juin. Entre juin et septembre : 1 766 + 747 (20240304) + 341 (20240312) =
2 854, contre un solde precedent de 1 316 au 30/09, donc 1 538,00 EUR REGLES
dans l intervalle. C est un MONTANT, pas une facture identifiee : aucun cycle
n est touche. A recouper avec les debits NTJ du releve LCL.

DEUX FICHIERS DONT LE NOM MENT, et qu il fallait ouvrir
  « Statement TIGHZA-100492.pdf » n est pas une piece inconnue : c est la
  facture ARGOAT ARG13747 de juillet, deja au registre. TIGHZA-100492 est le
  NUMERO DE CLIENT, pas une reference.
  « ntj septembre 2029 » est la facture NTJ 20240346 du 30/09/2026.

L ENCOURS ARGOAT AU 31/07/2026 : 115,00 EUR, soit exactement 32,00 (ARG13312)
+ 38,00 (ARG12869) + 45,00 (ARG13747). Ces trois factures etaient donc bien
impayees a cette date, ce qui confirme leur cycle A_TRIER.

« REGLEMENTS MARS » NE CONTIENT QUE DES RACCOURCIS, sept, pas des fichiers. Ce
sont des marqueurs de paiement de Lucie : ROTEC 5110778, 5110828 et 5110950
« V1 LE 06/03 », ARGOAT 02/2026 « VIREMENT LE 06/03 », MADE IN LABS « VIREMENT
LE 06/03/2026 », plus deux NTJ de l exercice 2025 (20240232 du 29/12/2025 et
20240177 du 01/09/2025) qui expliquent une partie du solde reporte.
Le 06/03/2026 est une date de virement a chercher au releve LCL. Les trois
ROTEC de janvier sont deja ENVOYE_TGS au registre, et l une d elles, la
5110950, porte deja un signalement de double paiement : cette date est une
piece du dossier.

AUCUNE DONNEE PATIENT N EST RECOPIEE ICI. Les factures Bongert et NTJ portent
des noms de patients ; ils restent dans les PDF. C est de la compta pure.

ON NE RENOMME RIEN dans « factures a regler » : regle posee par le Dr.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
LUCIE = "Drive partage > Lisa - Lucie : factures a regler"
LU = ("Lue dans le PDF le 12/10/2026, apres la validation du partage des "
      "dossiers de Lucie. Montant releve dans le document, pas dans son nom.")
SOLDES = (" CHAINE DES SOLDES NTJ, recoupee le 12/10/2026 : 04/05 solde "
          "precedent 1 037,00 + 578,00 = 1 615,00 a regler - 01/06 solde "
          "precedent 1 615,00 + 151,00 = 1 766,00 - 30/09 solde precedent "
          "1 316,00 + 295,00 = 1 611,00. Le 1 615 du 01/06 egale le « a "
          "regler » du 04/05, donc RIEN n a ete paye entre mai et juin. Entre "
          "juin et septembre, 1 766 + 747 + 341 = 2 854 contre 1 316 de solde "
          "precedent : 1 538,00 EUR ont ete regles. C est un MONTANT, pas une "
          "facture identifiee — aucun cycle n est touche, a recouper avec les "
          "debits NTJ du releve LCL.")

NOUVELLES = [
    ["2026-06-30", "BONGERT", "FACTURE", "317.70", "24517077", "", "RECU",
     LUCIE,
     "AJOUTEE AU REGISTRE LE 12/10/2026. ABSENTE JUSQUE-LA : ni le classeur de "
     "l assistante ni mes depouillements ne l avaient vue, c est la lecture "
     "complete du dossier « factures a regler » de Lucie qui l a fait "
     "apparaitre. " + LU + " Fichier « FACTURE_24517077.pdf », id "
     "1c4nLdaEDH3JfKM15ZvQgI68CSmfd7CNH. Facture Bongert du 30/06/2026, client "
     "C0009322, deux prestations de planification implantaire et guide "
     "chirurgical. TOTAL 317,70 EUR, EXONERE DE TVA au titre de l article "
     "261-4-1 du CGI (protheses dentaires) : il n y a pas de TVA a recuperer. "
     "Elle prolonge une serie dont le registre s arretait a 24516832. "
     "Non payee : elle est dans le dossier « a regler ». ON NE LA RENOMME PAS, "
     "regle posee pour ce dossier.",
     "A_PAYER"],
    ["2026-07-31", "BONGERT", "FACTURE", "289.05", "24517520", "", "RECU",
     LUCIE,
     "AJOUTEE AU REGISTRE LE 12/10/2026. ABSENTE JUSQUE-LA, apparue par la "
     "lecture du dossier « factures a regler » de Lucie. " + LU + " Fichier "
     "« FACTURE_24517520.pdf », id 110elZrjWIQgwzpl_cJLQQ_bVDGN_D7sg. Facture "
     "Bongert du 31/07/2026, client C0009322 : planification implantaire et "
     "guide chirurgical, appareil resine transitoire 6 dents, deux arcades 3D. "
     "TOTAL 289,05 EUR, EXONERE DE TVA art. 261-4-1 CGI. Non payee, dossier "
     "« a regler ». ON NE LA RENOMME PAS.",
     "A_PAYER"],
    ["2026-09-30", "NTJ", "FACTURE", "295.00", "20240346", "", "RECU",
     LUCIE,
     "AJOUTEE AU REGISTRE LE 12/10/2026. ABSENTE JUSQUE-LA, et elle comblait "
     "le trou de SEPTEMBRE dans une serie NTJ mensuelle complete par ailleurs "
     "de fevrier a aout. " + LU + " Fichier « ntj septembre 2029 » — le nom "
     "porte une faute de frappe sur l annee — id "
     "1jy9LtKUc9uFf7q_iWyWyJOY_GOzXKavE. Facture du 30/09/2026, periode "
     "septembre. TOTAL 295,00 EUR, EXONERE DE TVA art. 261-4-1 CGI. Non payee, "
     "dossier « a regler ». ON NE LA RENOMME PAS." + SOLDES,
     "A_PAYER"],
]

# reference -> (montant lu, note)
MONTANTS = {
    "20240280": ("578.00",
        " MONTANT LU DANS LE PDF LE 12/10/2026 : TOTAL TTC 578,00 EUR, "
        "exonere de TVA art. 261-4-1 CGI. La ligne existait sans montant. "
        "Fichier « NTJ  Avril 2026.pdf », id "
        "1_qH5Cko9Lz3itBZqlInnzf4Ci0oSa3HZ, dans « Reglements Mai » chez "
        "Lucie. Facture du 04/05/2026, periode AVRIL 2026 : la date de la "
        "piece est bien le 04/05, la periode est avril." + SOLDES),
    "20240293": ("151.00",
        " MONTANT LU DANS LE PDF LE 12/10/2026 : TOTAL TTC 151,00 EUR, "
        "exonere de TVA art. 261-4-1 CGI. La ligne existait sans montant. "
        "Fichier nomme simplement « NTJ », id "
        "1gs4trFC3777gKsJQZwS8qMvB-aG5O7ep, dans « Reglements Mai » chez "
        "Lucie. Facture du 01/06/2026, periode MAI 2026." + SOLDES),
}

# notes a completer sans rien changer d autre
NOTES = {
    "ARG13747": (
        " LE 12/10/2026, FICHIER IDENTIFIE : « Statement TIGHZA-100492.pdf » "
        "dans « factures a regler » de Lucie, id "
        "13cNHkB1YgXebyoJbce7MnGnUQSJDTKLX. Son nom ne dit rien de la piece — "
        "TIGHZA-100492 est le NUMERO DE CLIENT Argoat, pas une reference. "
        "J ai failli la compter comme une piece inconnue. "
        "ENCOURS ARGOAT AU 31/07/2026, lu sur cette facture : 115,00 EUR, soit "
        "exactement 32,00 (ARG13312) + 38,00 (ARG12869) + 45,00 (ARG13747). "
        "Ces trois factures etaient donc impayees a cette date, ce qui confirme "
        "leur cycle. ARG12031 de mars, elle, etait reglee."),
    "ARG13312": (" ENCOURS ARGOAT AU 31/07/2026 : cette facture fait partie des "
                 "115,00 EUR encore dus a cette date (32,00 + 38,00 + 45,00), "
                 "lu sur la facture ARG13747. Impayee au 31/07, confirme."),
    "ARG12869": (" ENCOURS ARGOAT AU 31/07/2026 : cette facture fait partie des "
                 "115,00 EUR encore dus a cette date (32,00 + 38,00 + 45,00), "
                 "lu sur la facture ARG13747. Impayee au 31/07, confirme."),
    "5110778": (" MARQUEUR DE PAIEMENT TROUVE LE 12/10/2026 : un raccourci "
                "nomme « ROTEC - 5110778 - 14-01-2026. V1 LE 06/03 » est dans "
                "« Reglements Mars » chez Lucie. Un virement du 06/03/2026 est "
                "donc a chercher au releve LCL. Ce n est qu un NOM DE "
                "RACCOURCI, pas une preuve : on n incremente rien sans voir le "
                "debit."),
    "5110828": (" MARQUEUR DE PAIEMENT TROUVE LE 12/10/2026 : raccourci "
                "« ROTEC- 5110828 - 15-01-2026. V1 LE 06/03 » dans "
                "« Reglements Mars » chez Lucie. Virement du 06/03/2026 a "
                "chercher au releve LCL. Nom de raccourci, pas une preuve."),
    "5110950": (" MARQUEUR DE PAIEMENT TROUVE LE 12/10/2026 : raccourci "
                "« ROTEC- 5110950 - 16-01-2026. VI LE 06/03 » dans "
                "« Reglements Mars » chez Lucie. CETTE FACTURE PORTE DEJA UN "
                "SIGNALEMENT DE DOUBLE PAIEMENT : la date du 06/03/2026 est "
                "donc une piece du dossier, a confronter a l autre debit "
                "releve. Nom de raccourci, pas une preuve."),
}


def charger(chemin):
    lignes = io.open(chemin, encoding="utf-8").read().splitlines()
    index = []
    for n, l in enumerate(lignes):
        if not l.strip() or l.startswith("#"):
            continue
        index.append((n, next(csv.reader([l], delimiter=";"))))
    return lignes, index


def serialiser(champs):
    s = io.StringIO()
    csv.writer(s, delimiter=";", lineterminator="").writerow(champs)
    return s.getvalue()


def main():
    lignes, index = charger(FIC)
    h = index[0][1]
    i = {c: h.index(c) for c in h}
    par_ref = {}
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d mal formee. Rien n a ete ecrit." % (n+1))
        ref = r[i["reference"]].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))

    touche, journal = {}, []

    def seule(ref):
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1. Rien n a ete ecrit."
                             % (ref, len(c)))
        return c[0]

    # 1. les montants combles
    for ref, (montant, note) in MONTANTS.items():
        n, r = seule(ref)
        if r[i["montant"]].strip():
            raise SystemExit("%s porte deja un montant (%s). Rien n a ete "
                             "ecrit." % (ref, r[i["montant"]]))
        r[i["montant"]] = montant
        r[i["note"]] = (r[i["note"]].rstrip() + note).replace(";", " -")
        touche[n] = r
        journal.append("  %-12s montant %s EUR lu dans le PDF" % (ref, montant))

    # 2. les notes completees
    for ref, note in NOTES.items():
        n, r = seule(ref)
        r[i["note"]] = (r[i["note"]].rstrip() + note).replace(";", " -")
        touche[n] = r
        journal.append("  %-12s note completee" % ref)

    # 3. les pieces nouvelles
    nouvelles = []
    for ligne in NOUVELLES:
        ref = ligne[i["reference"]]
        if ref in par_ref:
            raise SystemExit("%s est deja au registre. Rien n a ete ecrit."
                             % ref)
        if len(ligne) != len(h):
            raise SystemExit("nouvelle ligne %s mal formee." % ref)
        nouvelles.append([c.replace(";", " -") for c in ligne])
        journal.append("  %-12s AJOUTEE  %-12s %9s EUR"
                       % (ref, ligne[i["fournisseur"]], ligne[i["montant"]]))

    for n, r in touche.items():
        lignes[n] = serialiser(r)
    sortie = lignes + [serialiser(r) for r in nouvelles]
    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(sortie) + "\n")

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("%d ligne(s) modifiee(s), %d ajoutee(s), %d pieces au registre."
          % (len(touche), len(nouvelles), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

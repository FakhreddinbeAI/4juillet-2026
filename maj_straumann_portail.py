#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Retour du portail Straumann, 09/10/2026. Lecture des documents eux-memes.

MES DEUX QUESTIONS OUVERTES SONT TRANCHEES, ET J AVAIS TORT SUR LA SECONDE.

1) 9060109581 EST UNE FACTURE, pas un echeancier separe.
   Le PDF est intitule « Facture », 6 pages, l echeancier est un TABLEAU DANS
   la facture. Aucun autre numero de facture n y est cite : il n y a donc PAS
   de facture supplementaire a reclamer. C etait ma crainte principale, elle
   tombe.
   Arithmetique recoupee : net 18 148,00 a 20 % + 510,00 a 5,5 % = 18 658,00,
   TVA 3 629,60 + 28,05 = 3 657,65, total 22 315,65. Et 5 x 4 463,13 =
   22 315,65 exactement. Les deux taux tombent juste separement.

2) 977638795 N EST NI UN AVOIR NI UN RECAPITULATIF.
   J avais propose deux hypotheses : un document qui regroupe les huit avoirs,
   ou une colonne remplie a la va-vite. LES DEUX ETAIENT FAUSSES.
   C est la FACTURE 9050178334 du 17/09/2025, 18 906,72 EUR, avec son propre
   echeancier (4 x 3 781,34 + 3 781,36 = 18 906,72, recoupe). Paycenter
   rattache a tort ce meme lien a huit avoirs : c est un DEFAUT DU PORTAIL.
   Consequence : la colonne « Ref. PDF » de la feuille Straumann est FAUSSE
   pour ces huit lignes, et elle n a jamais ete remplie a la main. On ne lui
   fait plus confiance sans ouvrir le document.
   Avoir ouvert le document une fois avant de conclure a servi exactement a
   ca.

CE QUE LE PORTAIL REVELE EN PLUS
   9060156693  30/07/2026   0,00 EUR        facture inconnue du registre
   9060200897  08/10/2026  -1 528,62 EUR    AVOIR inconnu, sans PDF, d hier
   L avoir 9060106911 porte « ECHANGE SUR FACTURE 9060106903 du 26.05.2026 »,
   ce qui confirme l appariement de la feuille.

CE QUI NE COLLE PAS AVEC MA LISTE
   9060131185 : le PDF dit 24/06/2026, mon registre disait 19/06/2026.
   Le PDF fait foi. Total 0,00 confirme.

LES NEUF INTROUVABLES
   Les 8 avoirs existent comme LIGNES dans l extrait Paycenter mais leur lien
   ouvre la facture 9050178334 : aucun PDF valide, ni sur Paycenter ni dans
   l eShop. Ils passent de A_VERIFIER a MANQUANT — ce n est plus « a
   localiser », c est « a reclamer ».
   9060125749 reste introuvable, et ce n est PAS une erreur de ma part : le
   relevé de compte du 24/07 ET la deuxieme relance Straumann l affirment tous
   les deux. Straumann la reclame et ne la fournit pas.

LES ETATS NE PASSENT PAS A RECU
   Chrome a clique « telecharger » mais n a PAS d acces au disque depuis son
   panneau : il n a pu ni creer le dossier demande, ni verifier que les
   fichiers sont arrives, ni sous quel nom. Mon instruction etait impossible a
   tenir, c est ma faute. Les montants sont desormais LUS DANS LES PDF, ce qui
   est un vrai gain, mais on ne detient pas la preuve du fichier local. Etats
   inchanges, et une verification du dossier Telechargements reste a faire.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
SRC = ("Lu sur le portail Straumann le 09/10/2026 (eShop et Paycenter), "
       "document ouvert et total releve dans le PDF.")
PAS_RECU = (" ETAT NON PASSE A RECU : le telechargement a ete lance mais "
            "l acces au disque manquait, donc l arrivee du fichier dans le "
            "dossier Telechargements n est pas verifiee. Le montant, lui, "
            "vient du document.")

# reference -> (nom du fichier au portail, note)
LUS = {
    "9060109581": ("0982080281.pdf",
        "QUESTION TRANCHEE LE 09/10/2026 : C EST UNE FACTURE, pas un "
        "echeancier separe. Le PDF est intitule « Facture », 6 pages, et "
        "l echeancier est un TABLEAU A L INTERIEUR de la facture. AUCUN AUTRE "
        "NUMERO DE FACTURE N Y EST CITE : il n y a donc pas de facture "
        "supplementaire a reclamer, contrairement a ce que je craignais. "
        "Reference de paiement ecrite : 15123197 / 9060109581. "
        "TVA DETAILLEE : 18 148,00 a 20 % = 3 629,60 et 510,00 a 5,5 % = "
        "28,05. Net 18 658,00 + TVA 3 657,65 = 22 315,65, recoupe au centime, "
        "et les deux taux tombent juste separement. 5 x 4 463,13 = 22 315,65. "
        "CINQ ECHEANCES, AUCUNE PAYEE, toutes en « Creances non reglees » sur "
        "Paycenter avec 4 463,13 restant chacune : 27/06/2026, 27/07/2026, "
        "26/08/2026, 25/09/2026, 25/10/2026, numerotees 9060109581-001 a -005. "
        "Paycenter n a pas de PDF pour elle (« Impossible de lier ce poste a "
        "la facture correspondante ») : elle est dans l eShop, commande "
        "3039597959 du 28/05/2026. C est la plus grosse charge Straumann de "
        "l exercice et elle est integralement due."),
    "9060121791": ("0982326076.pdf",
        "PDF OUVERT LE 09/10/2026 : total 134,34 confirme, date 10/06/2026 "
        "confirmee. LE DOCUMENT PORTE LA MENTION « REIMPRESSION » : c est un "
        "duplicata, pas l original. A signaler si TGS tique. Rappel : la "
        "9060128654 du 19/06 fait AUSSI 134,34 — deux factures distinctes, ne "
        "jamais les fusionner."),
    "9060006689": ("0979639418.pdf", None),
    "9060017570": ("0979893945.pdf", None),
    "9060032068": ("0980241683.pdf", None),
    "9060048851": ("0980624610.pdf", None),
    "9060051289": ("0980696921.pdf",
        "ATTENTION : la 9060051290 du MEME JOUR fait AUSSI 305,72. Deux "
        "factures distinctes, numeros de document differents."),
    "9060051290": ("0980696922.pdf",
        "ATTENTION : la 9060051289 du MEME JOUR fait AUSSI 305,72. Deux "
        "factures distinctes, numeros de document differents."),
    "9060083085": ("0981409565.pdf", None),
    "9060102693": ("0981912113.pdf", None),
    "9060106903": ("0982024106.pdf",
        "L avoir 9060106911 qui l annule porte la mention « ECHANGE SUR "
        "FACTURE 9060106903 du 26.05.2026 », ce qui confirme l appariement "
        "donne par la feuille de suivi."),
    "9060109569": ("0982080182.pdf", None),
    "9060109572": ("0982080204.pdf", None),
}

# le seul avoir dont le PDF a ete obtenu
AVOIR_OBTENU = ("9060106911", "5e9d87c0-a6fd-4459-ad50-0534095b3397",
    "PDF OBTENU LE 09/10/2026, total -305,72 confirme, date 26/05/2026 "
    "confirmee. Le document porte « ECHANGE SUR FACTURE 9060106903 du "
    "26.05.2026 » : il nomme lui-meme la facture qu il annule. C est le SEUL "
    "des neuf avoirs dont le PDF ait pu etre recupere. Nom de fichier au "
    "portail : un identifiant aleatoire sans numero, a renommer avant depot.")

# date corrigee d apres le PDF
DATE_CORRIGEE = ("9060131185", "2026-06-24", "0982562201.pdf",
    "DATE CORRIGEE LE 09/10/2026 : mon registre disait 19/06/2026, le PDF dit "
    "24/06/2026. LE DOCUMENT FAIT FOI. La feuille de suivi Straumann disait "
    "19/06 elle aussi : les deux sources secondaires se trompaient de la meme "
    "facon, ce qui ne les rend pas justes. Total 0,00 confirme dans le PDF.")

# les huit avoirs sans PDF : A_VERIFIER -> MANQUANT
SANS_PDF = ["9060011986", "9060034033", "9060040628", "9060059451",
            "9060063384", "9060063944", "9060084611", "9060102694"]
NOTE_SANS_PDF = (
    " AUCUN PDF, CONSTATE LE 09/10/2026. Cet avoir existe bien comme LIGNE "
    "dans l extrait de compte Paycenter, mais son lien « Ref. PDF » ouvre la "
    "FACTURE 9050178334 du 17/09/2025 — un defaut du portail, pas un "
    "recapitulatif. Il n est pas davantage dans les commandes eShop de janvier "
    "a juin 2026. ETAT A_VERIFIER -> MANQUANT : ce n est plus une piece a "
    "localiser, c est une piece A RECLAMER a Straumann. La colonne « Ref. PDF "
    "» de la feuille de suivi est FAUSSE pour cet avoir et pour sept autres : "
    "ne plus s y fier sans ouvrir le document.")

NOTE_125749 = (
    " INTROUVABLE AU PORTAIL, CONSTATE LE 09/10/2026 : absente des creances "
    "Paycenter, absente de l extrait de compte, absente de toutes les "
    "commandes eShop de janvier a juin 2026. Absente aussi de la feuille de "
    "suivi Straumann. CE N EST PAS UNE ERREUR DE MA PART, et j ai verifie "
    "avant de l ecrire : le relevé de compte Straumann du 24/07 la porte avec "
    "son echeance au 16/07, et la deuxieme relance Straumann la liste comme "
    "ligne impayee. STRAUMANN LA RECLAME ET NE LA FOURNIT PAS. A exiger "
    "explicitement, en citant ces deux documents.")

# pieces revelees par le portail, inconnues du registre et de la feuille
NOUVELLES = [
    ["2025-09-17", "STRAUMANN", "FACTURE", "18906.72", "9050178334", "",
     "A_VERIFIER", "A OBTENIR - portail Straumann Paycenter",
     "AJOUTEE AU REGISTRE LE 09/10/2026. " + SRC + " C EST LE DOCUMENT QUE LA "
     "FEUILLE DE SUIVI DESIGNAIT PAR « Ref. PDF 977638795 » POUR HUIT AVOIRS. "
     "J avais pose deux hypotheses, un recapitulatif d avoirs ou une colonne "
     "remplie a la va-vite : LES DEUX ETAIENT FAUSSES. C est une facture a "
     "part entiere du 17/09/2025, 4 pages, total 18 906,72 EUR, avec son "
     "propre echeancier : 4 x 3 781,34 puis 3 781,36, du 17/10/2025 au "
     "14/02/2026, recoupe au centime. Paycenter rattache a tort ce lien a huit "
     "avoirs 2026. PIECE DE L EXERCICE 2025, donc hors perimetre d un registre "
     "2026 — MAIS SES DEUX DERNIERES ECHEANCES TOMBENT EN 2026 (janvier et "
     "14/02/2026) : ces reglements apparaissent sur les releves LCL 2026 et ne "
     "doivent pas etre pris pour le paiement d une facture 2026. Nom au "
     "portail : identifiant aleatoire 5076367e-0258-4b07-9efa-423b699a6299, "
     "sans numero.", "HORS_PERIMETRE"],
    ["2026-07-30", "STRAUMANN", "FACTURE", "0.00", "9060156693", "",
     "A_VERIFIER", "A OBTENIR - eShop Straumann, commande 3039597959",
     "AJOUTEE AU REGISTRE LE 09/10/2026. " + SRC + " REVELEE PAR LE PORTAIL, "
     "inconnue de mon registre ET de la feuille de suivi Straumann — qui "
     "s arrete au 19/06/2026. Facture du 30/07/2026, total 0,00, fichier "
     "0983178925.pdf, troisieme facture de la commande eShop 3039597959 (les "
     "deux autres etant 9060109581 et 9060131185). Non telechargee. Un total a "
     "0,00 demande une lecture : c est souvent un remplacement sous garantie "
     "ou un envoi gratuit, et le document reste un justificatif a deposer.",
     "A_TRIER"],
    ["2026-10-08", "STRAUMANN", "AVOIR", "-1528.62", "9060200897", "",
     "MANQUANT", "A RECLAMER - aucun PDF au portail",
     "AJOUTEE AU REGISTRE LE 09/10/2026. " + SRC + " REVELEE PAR PAYCENTER, "
     "inconnue de mon registre ET de la feuille de suivi Straumann. AVOIR DU "
     "08/10/2026, soit HIER, de -1 528,62 EUR. Affiche dans Paycenter SANS "
     "PDF. C est le plus gros avoir de l exercice et on ne sait pas encore ce "
     "qu il annule : aucune facture 2026 du registre ne porte ce montant, donc "
     "il ne s apparie pas comme les neuf autres. A RECLAMER a Straumann en "
     "demandant explicitement quelle facture il vient annuler.",
     "A_TRIER"],
]


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


def sans_pv(t):
    return t.replace(";", " -")


def main():
    lignes, index = charger(FIC)
    h = index[0][1]
    i = {c: h.index(c) for c in h}
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d mal formee. Rien n a ete ecrit." % (n+1))

    par_ref = {}
    for n, r in index[1:]:
        ref = r[i["reference"]].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))

    def seule(ref):
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("reference %s : %d ligne(s), attendu 1. Rien n a "
                             "ete ecrit." % (ref, len(c)))
        return c[0]

    touche, journal = {}, []

    # 1. les documents lus dans le PDF
    for ref, (fichier, note) in LUS.items():
        n, r = seule(ref)
        bout = " " + SRC + " Nom du fichier au portail : " + fichier + "."
        if note:
            bout += " " + note
        bout += PAS_RECU
        r[i["note"]] = sans_pv(r[i["note"]].rstrip() + bout)
        touche[n] = r
        journal.append("  %-12s lu dans le PDF, fichier %s" % (ref, fichier))

    # 2. l avoir obtenu
    ref, fichier, note = AVOIR_OBTENU
    n, r = seule(ref)
    r[i["note"]] = sans_pv(r[i["note"]].rstrip() + " " + SRC
                           + " Nom du fichier au portail : " + fichier + ". "
                           + note + PAS_RECU)
    touche[n] = r
    journal.append("  %-12s AVOIR obtenu, le seul des neuf" % ref)

    # 3. la date corrigee par le document
    ref, bonne_date, fichier, note = DATE_CORRIGEE
    n, r = seule(ref)
    avant = r[i["date_piece"]]
    r[i["date_piece"]] = bonne_date
    r[i["note"]] = sans_pv(r[i["note"]].rstrip() + " " + SRC
                           + " Nom du fichier au portail : " + fichier + ". "
                           + note + PAS_RECU)
    touche[n] = r
    journal.append("  %-12s date %s -> %s, d apres le PDF"
                   % (ref, avant, bonne_date))

    # 4. les huit avoirs sans PDF
    for ref in SANS_PDF:
        n, r = seule(ref)
        if r[i["etat"]] != "A_VERIFIER":
            raise SystemExit("avoir %s : etat %s, attendu A_VERIFIER."
                             % (ref, r[i["etat"]]))
        r[i["etat"]] = "MANQUANT"
        r[i["emplacement"]] = "A RECLAMER - aucun PDF au portail Straumann"
        r[i["note"]] = sans_pv(r[i["note"]].rstrip() + NOTE_SANS_PDF)
        touche[n] = r
        journal.append("  %-12s AVOIR sans PDF, A_VERIFIER -> MANQUANT" % ref)

    # 5. la facture que Straumann reclame sans la fournir
    n, r = seule("9060125749")
    r[i["note"]] = sans_pv(r[i["note"]].rstrip() + NOTE_125749)
    touche[n] = r
    journal.append("  9060125749   introuvable au portail, provenance "
                   "confirmee, reste MANQUANT")

    # 6. les pieces revelees par le portail
    nouvelles = []
    for ligne in NOUVELLES:
        ref = ligne[i["reference"]]
        if ref in par_ref:
            raise SystemExit("%s est deja au registre. Rien n a ete ecrit."
                             % ref)
        if len(ligne) != len(h):
            raise SystemExit("nouvelle ligne %s mal formee." % ref)
        nouvelles.append([sans_pv(c) for c in ligne])
        journal.append("  %-12s AJOUTEE (%s %s)"
                       % (ref, ligne[i["type"]], ligne[i["montant"]]))

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

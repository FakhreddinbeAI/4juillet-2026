#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Correction du 09/10/2026 : j avais tort sur le « defaut du portail ».

CE QUE J AVAIS ECRIT, IL Y A DIX MINUTES
« Paycenter rattache a tort ce meme lien a huit avoirs : c est un DEFAUT DU
PORTAIL. » Et j avais mis les huit avoirs en MANQUANT sur cette base.

CE QUE LE DOCUMENT DIT
L avoir 9060040628 etait dans le Drive, dans un dossier nomme « Autres pieces
Straumann (hors liste TGS) ». Lu le 09/10/2026, il porte en clair :
    « No de facture orig. 9050178334   Date de fact. orig. 17 sept. 25 »
PAYCENTER N A AUCUN DEFAUT. Il affiche la FACTURE ORIGINALE que l avoir
lui-meme designe. Chacun de ces avoirs est un « ECHANGE » dont le champ
« facture originale » pointe vers la 9050178334 de septembre 2025. La colonne
« Ref. PDF » de la feuille donne donc le PDF de la facture originale, pas celui
de l avoir. C est deroutant, ce n est pas une erreur.

Troisieme explication, et la bonne. Mes deux premieres hypotheses — un
recapitulatif d avoirs, une colonne remplie a la va-vite — etaient fausses, et
la troisieme aussi. Elle ne vient pas du comportement du portail mais de la
LECTURE du document.

CE QUE LA LECTURE CORRIGE AUSSI
  9060040628  etait au Drive : MANQUANT -> RECU. Total -1 834,34 confirme,
              « ECHANGE SUR FACTURE 9060032068 du 14.02.2026 » confirme
              l appariement. Porte « Reimpression ».
  9060017570  etait au Drive aussi : A_VERIFIER -> RECU. Total 917,17
              confirme, net 764,31 + TVA 152,86. Porte « Reimpression ».
  9050178334  est DEJA DEPOSEE AU PORTAIL TGS, trouvee par coherence.py sous
              le nom « straumann 9050178334 5 echances sur cette fact ». Elle
              n est pas a obtenir, et son fichier est au Drive.
  Les SEPT autres avoirs restent MANQUANT : cherches par titre ET par contenu
  dans tout le Drive, ils n y sont pas. Seul 9060040628 y etait.

L AVOIR MYSTERE DE 1 528,62 S EXPLIQUE
Je m etais demande si l avoir 9060200897 du 08/10 (-1 528,62) etait lie a
quelque chose, parce que 1 528,62 est aussi la valeur NETTE de l avoir
9060040628. Ce n est pas un lien : ces implants coutent 349,00 avec -27 % de
remise, soit 254,77 l unite, et 6 x 254,77 = 1 528,62. C est une quantite.
Note comme tel, sans conclusion.

LE DOSSIER EST MAL NOMME
« Autres pieces Straumann (hors liste TGS) » contient des pieces 2026 qui sont
bel et bien sur la liste TGS : 9060017570 et 9060040628. Son nom fait croire
qu on peut l ignorer. Signale.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
LU = "Lu dans le PDF le 09/10/2026."

FAUX = ("son lien « Ref. PDF » ouvre la FACTURE 9050178334 du 17/09/2025 — un "
        "defaut du portail, pas un recapitulatif.")
VRAI = ("son lien « Ref. PDF » ouvre la FACTURE 9050178334 du 17/09/2025. "
        "CORRECTION DU 09/10/2026 : j avais ecrit que c etait un defaut du "
        "portail. C EST FAUX. L avoir 9060040628, lu dans le Drive, porte en "
        "clair « No de facture orig. 9050178334 - Date de fact. orig. 17 "
        "sept. 25 ». Paycenter affiche donc la facture ORIGINALE que l avoir "
        "lui-meme designe : chacun de ces avoirs est un ECHANGE rattache a "
        "cette facture de septembre 2025. Deroutant, mais exact. La colonne "
        "« Ref. PDF » de la feuille donne le PDF de la facture originale, pas "
        "celui de l avoir — elle n est donc pas fausse, elle repond a une "
        "autre question que la mienne.")

CORR = {
    "9060040628": dict(
        etat="RECU",
        emplacement="Drive partage > Autres pieces Straumann (hors liste TGS)",
        note=" RETROUVE AU DRIVE LE 09/10/2026, je l avais mis en MANQUANT a "
             "tort dix minutes plus tot : fichier « Avoir 9060040628.pdf », id "
             "1E8BDsi9TXgtq4JjrqBW0dUBZH2GJsN3M, dans le dossier « Autres "
             "pieces Straumann (hors liste TGS) » — un dossier dont le NOM "
             "FAIT CROIRE qu il est hors sujet alors qu il contient des pieces "
             "2026 de la liste TGS. " + LU + " Total -1 834,34 confirme, net "
             "1 528,62 + TVA 305,72. Date 26/02/2026 confirmee. Le document "
             "porte « ECHANGE SUR FACTURE 9060032068 du 14.02.2026 » : il "
             "nomme lui-meme la facture qu il annule, ce qui confirme "
             "l appariement de la feuille. Il porte aussi « Reimpression » et "
             "la mention « Il s agit d une note de credit et nous vous prions "
             "de ne pas la payer ». ET SURTOUT il porte « No de facture orig. "
             "9050178334 - Date de fact. orig. 17 sept. 25 », ce qui explique "
             "le lien Paycenter des huit avoirs. Deux lignes de 3 implants a "
             "349,00 remises a -27 %."),
    "9060017570": dict(
        etat="RECU",
        emplacement="Drive partage > Autres pieces Straumann (hors liste TGS)",
        note=" FICHIER RETROUVE AU DRIVE LE 09/10/2026 : « 9060017570.pdf », "
             "id 1VlQFyffUfErfX_L4iXDdvU8boB7gbAPb, dans « Autres pieces "
             "Straumann (hors liste TGS) ». Je la croyais seulement au portail. "
             + LU + " Total 917,17 confirme, net 764,31 + TVA 152,86. Date "
             "28/01/2026 et echeance 27/02/2026 confirmees. Trois implants "
             "Bone Level Tapered a 349,00 remises a -27 %. Le document porte "
             "« Reimpression » : c est un duplicata. Etat A_VERIFIER -> RECU."),
    "9050178334": dict(
        etat="DEPOSEE",
        emplacement="Drive partage > Autres pieces Straumann (hors liste TGS)",
        note=" DEJA DEPOSEE AU PORTAIL TGS, trouvee par coherence.py des l "
             "ajout de la ligne, sous le nom « straumann 9050178334 5 echances "
             "sur cette fact » — le nom du depot mentionne lui-meme "
             "l echeancier. Elle n est donc PAS a obtenir, contrairement a ce "
             "que je venais d ecrire. FICHIER AU DRIVE : « 9050178334.pdf », id "
             "1wd6Yu-1XZYDIIOVetm1eikN4Rhm7iGpX, 244 836 octets, dans « Autres "
             "pieces Straumann (hors liste TGS) ». Etat A_VERIFIER -> DEPOSEE. "
             "Reserve honnete : le fichier telecharge aujourd hui par le "
             "portail pour ce meme numero pese 66 560 octets, soit un quart de "
             "celui du Drive. Deux rendus differents du meme document, ou deux "
             "documents differents ? Non tranche, a lire cote a cote."),
    "9060200897": dict(
        note=" PISTE ECARTEE LE 09/10/2026 : je m etais demande si ce montant "
             "de -1 528,62 etait lie a l avoir 9060040628, dont la valeur "
             "NETTE vaut exactement 1 528,62. Ce n est pas un lien. Ces "
             "implants coutent 349,00 avec -27 % de remise, soit 254,77 "
             "l unite, et 6 x 254,77 = 1 528,62 : c est une quantite, pas une "
             "correspondance. Chez ce fournisseur les montants se repetent "
             "parce que les prix unitaires sont les memes — raison de plus "
             "pour n identifier un document que par son numero."),
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
            raise SystemExit("ligne %d mal formee." % (n + 1))
        ref = r[i["reference"]].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))

    touche, journal = {}, []

    # 1. les corrections ciblees
    for ref, champs in CORR.items():
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (ref, len(c)))
        n, r = c[0]
        avant = r[i["etat"]]
        for cle, val in champs.items():
            if cle == "note":
                r[i["note"]] = (r[i["note"]].rstrip() + val).replace(";", " -")
            else:
                r[i[cle]] = val.replace(";", " -")
        touche[n] = r
        if "etat" in champs:
            journal.append("  %-12s etat %s -> %s"
                           % (ref, avant, champs["etat"]))
        else:
            journal.append("  %-12s note completee" % ref)

    # 2. la phrase fausse, remplacee partout ou elle apparait
    remplaces = 0
    for n, r in index[1:]:
        if FAUX in r[i["note"]]:
            r[i["note"]] = r[i["note"]].replace(FAUX, VRAI)
            touche[n] = r
            remplaces += 1
    journal.append("  %d note(s) ou la phrase « defaut du portail » est "
                   "corrigee" % remplaces)
    if remplaces != 8:
        raise SystemExit("attendu 8 notes a corriger, %d trouvee(s). Rien n a "
                         "ete ecrit." % remplaces)

    for n, r in touche.items():
        lignes[n] = serialiser(r)
    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    reste = sum(1 for _, r in verif[1:] if FAUX in r[hv.index("note")])
    if reste:
        raise SystemExit("relecture : %d note(s) portent encore la phrase "
                         "fausse." % reste)

    print("\n".join(journal))
    print()
    print("%d ligne(s) corrigee(s), %d pieces au registre."
          % (len(touche), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

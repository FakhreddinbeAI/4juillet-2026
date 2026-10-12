#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GACD : quatorze factures OUVERTES ET LUES le 12/10/2026 au soir.

LA CONSIGNE QUI A TOUT CHANGE
« Tu ouvres, tu lis, tu renommes. » J avais commence a renommer les fichiers
telecharges depuis ftighza@gmail.com en recopiant les valeurs DU REGISTRE sur
les noms de fichiers. C etait la mauvaise methode : le registre s etait deja
trompe quatre fois dans la journee. En ouvrant les documents, il s est trompe
une cinquieme et une sixieme fois.

CE QUE LA LECTURE A CORRIGE
1. 2402336462 : mon registre disait 31/05/2026 pour 57,75 EUR. LE DOCUMENT DIT
   15/05/2026 pour 14,38 EUR. J avais colle sur ce numero la date et le montant
   d une AUTRE facture, la 2402351133, que le registre ne connaissait pas. Et la
   ligne etait marquee DEPOSEE. Le fichier de Lucie s appelait pourtant
   « 2402336462 GACD 14,38 » : le nom disait la verite, mon registre non.
2. 240235574 : neuf chiffres, alors que toutes les references GACD en ont dix.
   La vraie est 2402352574. Meme famille d erreur que « 85700444 » pour 8570444
   le matin meme : un chiffre perdu a la saisie.

CINQ PIECES QUE LE REGISTRE NE CONNAISSAIT PAS DU TOUT
   2402351133  31/05/2026    57,75
   2402353440  03/06/2026   132,50
   2402367929  22/06/2026    62,21
   2402378736  06/07/2026   509,78
   2402380268  08/07/2026   -38,54  AVOIR
Soit 724,10 EUR de charges et un avoir, invisibles jusqu a ce soir.

L AVOIR 2402380268 PORTE UN MONTANT NEGATIF, regle du 09/10. Il se rattache a
la facture 2402323175 (« N° de reference externe 2402323175 » sur le document).

DEUX OBSERVATIONS AU PASSAGE
Les factures 2402321857 et 2402336462 portent « Facture acquittee par CB ».
Elles n apparaitront donc jamais comme prelevement SEPA au releve : c est une
piste pour la question ouverte de la carte Mastercard •••• 0422.
Toutes les factures GACD portent « Adresse mail : assistante@implantologie
lege.com » : c est bien cette adresse qui est au dossier chez le fournisseur,
ce qui confirme que ftighza n est qu une boite de reexpedition.

CE QUI N A PAS ETE LU
Quatre GACD deja deposees : 2402323175, 2402328280, 2402331992, 2402379458.
Vu ce qu a donne 2402336462, elles meritent le meme controle, mais elles ne
bloquent aucun depot. A faire au prochain passage.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

LU = (" OUVERTE ET LUE LE 12/10/2026. Date et montant releves DANS LE DOCUMENT, "
      "pas recopies du registre. Fichier telecharge depuis ftighza@gmail.com et "
      "renomme sur le Drive, dossier Telechargements.")

# reference -> (date, montant) lus dans le document
LUS = {
    "2402318938": ("2026-04-21", "14.15"),
    "2402321857": ("2026-04-27", "28.76"),
    "2402336461": ("2026-05-15", "629.25"),
    "2402358750": ("2026-06-09", "147.73"),
    "2402359883": ("2026-06-10", "20.32"),
    "2402361965": ("2026-06-12", "370.95"),
    "2402363184": ("2026-06-15", "12.54"),
    "2402365910": ("2026-06-18", "431.37"),
}

CORRIGE_462 = (
    " ERREUR DE MON REGISTRE, CORRIGEE LE 12/10/2026 PAR LECTURE DU DOCUMENT. "
    "J avais inscrit 31/05/2026 et 57,75 EUR. Le document dit 15/05/2026 et "
    "14,38 EUR (11,98 HT + 2,40 TVA), commande 1700066137, acquittee par CB. "
    "Les 31/05 et 57,75 que j avais mis ici sont en realite ceux de la facture "
    "2402351133, que le registre ignorait completement. J ai donc colle les "
    "valeurs d une facture sur le numero d une autre. Le fichier de Lucie "
    "s appelait « 2402336462 GACD 14,38 » : le nom portait la bonne valeur "
    "depuis le debut. ATTENTION : cette ligne est marquee DEPOSEE — il faut "
    "verifier au portail QUEL document a ete depose sous ce numero.")

CORRIGE_REF = (
    " REFERENCE CORRIGEE LE 12/10/2026 PAR LECTURE : « 240235574 » n a que neuf "
    "chiffres alors que toutes les references GACD en ont dix. Le document porte "
    "2402352574, du 02.06.2026, 56,01 EUR TTC (46,68 HT + 9,33 TVA). Date et "
    "montant que j avais etaient justes, seul le numero etait ampute. Meme "
    "famille d erreur que « 85700444 » pour 8570444 le matin meme.")

NOUVELLES = [
    ("2026-05-31", "GACD", "FACTURE", "57.75", "2402351133",
     "commande 1700139288, livraison 801767301"),
    ("2026-06-03", "GACD", "FACTURE", "132.50", "2402353440",
     "commande 1700139288, livraison 801779121, un seul article GC EQUIA FORTE"),
    ("2026-06-22", "GACD", "FACTURE", "62.21", "2402367929",
     "commande 1700169570, livraison 801825193"),
    ("2026-07-06", "GACD", "FACTURE", "509.78", "2402378736",
     "commande 1700201638, livraison 801856819, quatorze lignes"),
    ("2026-07-08", "GACD", "AVOIR", "-38.54", "2402380268",
     "AVOIR. Se rattache a la facture 2402323175, citee sur le document comme "
     "« N° de reference externe ». Montant NEGATIF, regle du 09/10/2026"),
]

NOTE_NEUVE = (
    " PIECE AJOUTEE AU REGISTRE LE 12/10/2026, INCONNUE JUSQUE-LA. Trouvee en "
    "depouillant les telechargements de ftighza@gmail.com, ouverte et lue. %s. "
    "Date et montant releves dans le document. Fichier renomme sur le Drive, "
    "dossier Telechargements. A DEPOSER AU PROCHAIN LOT.")


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

    def une(ref):
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (ref, len(c)))
        return c[0]

    def note(r, bout):
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")

    for ref, (d, m) in LUS.items():
        n, r = une(ref)
        avant = (r[i["date_piece"]], r[i["montant"]])
        r[i["date_piece"]], r[i["montant"]] = d, m
        note(r, LU)
        touche[n] = r
        chg = "" if avant == (d, m) else "  (etait %s / %s)" % avant
        journal.append("  %-12s %s  %9s%s" % (ref, d, m, chg))

    n, r = une("2402336462")
    r[i["date_piece"]], r[i["montant"]] = "2026-05-15", "14.38"
    note(r, CORRIGE_462)
    touche[n] = r
    journal.append("  2402336462   2026-05-15      14.38  *** CORRIGE : etait "
                   "2026-05-31 / 57.75 ***")

    n, r = une("240235574")
    r[i["reference"]] = "2402352574"
    r[i["date_piece"]], r[i["montant"]] = "2026-06-02", "56.01"
    note(r, CORRIGE_REF)
    touche[n] = r
    journal.append("  240235574 -> 2402352574  *** un chiffre manquait ***")

    for n, r in touche.items():
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()

    # les cinq nouvelles, a la fin du fichier
    for d, f, t, m, ref, det in NOUVELLES:
        if ref in par_ref:
            raise SystemExit("%s existe deja." % ref)
        ligne = [""] * len(h)
        ligne[i["date_piece"]] = d
        ligne[i["fournisseur"]] = f
        ligne[i["type"]] = t
        ligne[i["montant"]] = m
        ligne[i["reference"]] = ref
        ligne[i["etat"]] = "RENOMME"
        ligne[i["emplacement"]] = "Mon ordinateur portable > Downloads"
        ligne[i["note"]] = (NOTE_NEUVE % det).replace(";", " -")
        ligne[i["cycle"]] = "A_TRIER"
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(ligne)
        lignes.append(s.getvalue())
        journal.append("  %-12s AJOUTEE  %s  %9s  %s" % (ref, d, m, t))

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("%d lignes modifiees, %d ajoutees, %d pieces au registre."
          % (len(touche), len(NOUVELLES), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

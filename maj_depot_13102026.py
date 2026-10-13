#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Depot du 13/10/2026 : 20 pieces deposees, 5 laissees de cote.

LA RECONCILIATION EST EXACTE
Mes quatre lots contenaient 25 pieces : 14 (lot A) + 6 (B) + 2 (C) + 3 (D).
20 deposees + 5 laissees = 25. ARG12869 n a jamais ete dans un lot, il etait
dans le tableau des interdits.
MON INTITULE ANNONCAIT 24 PIECES. C ETAIT FAUX : j avais calcule 30 deposables
moins 3 retenues moins 3 exclues, sans voir que le lot C contenait la mise en
demeure ZFX, qui n est pas une piece du registre. Le titre etait faux, les
tableaux justes.

LE COMPTEUR : 1 430 -> 1 450, SOIT +20 POUR 20 PIECES, EXACTEMENT 1:1
L ecart de douze constate hier (1 377 -> 1 429 pour 40 pieces) n est donc PAS
un comportement systematique du portail. Il reste inexplique, mais il etait
ponctuel. A ne plus presenter comme une regle du portail.

LA MISE EN DEMEURE ZFX N AVAIT PAS DE LIGNE AU REGISTRE
Je l avais mise dans le prompt de depot sans jamais la creer comme piece. Elle
est donc partie au portail en etant invisible chez moi. Ligne creee ici.
SON MONTANT EST LAISSE VIDE, ET C EST DELIBERE : le cabinet reclame 298,32,
dont 253,99 sont la facture R-2602.52453 DEJA au registre. Inscrire 298,32
compterait cette facture une seconde fois. Le seul supplement est 40,00
d indemnite + 4,33 d interets = 44,33, et il n est ni paye ni acquis. Le detail
est dans la note, la qualification appartient a TGS.

CINQ PIECES LAISSEES DE COTE, DONT DEUX QUE JE NE M EXPLIQUE PAS
  20240312      NTJ aout            prudence demandee sur la date : normal
  9060024519    Paycenter Straumann verification au portail demandee : normal
  9060036137    Paycenter Straumann idem
  2402336461    GACD 629,25         AUCUNE CONSIGNE NE LE PREVOYAIT
  2402321857    GACD 28,76          AUCUNE CONSIGNE NE LE PREVOYAIT
Les deux dernieres etaient au lot A sans reserve. Chrome dit que ses raisons
etaient dans son rapport precedent, celui qui n est jamais arrive. ON NE LES
PASSE DONC NI A DEPOSEE NI A AUTRE CHOSE : la question est posee, pas tranchee.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
HIST = "historique_portail.txt"
STATUT = "En cours de traitement"
JOUR = "2026-10-13"

# reference au registre -> nom affiche par le portail
PAR_REF = {
    "FRIN25-02861493": "2026 10 08 doctolib facture 149 00 frin25 02861493 p2026 10 01 au 2026 10 31.pdf",
    "B-33156":         "2026 08 31 adf inscription congres 389 00 b 33156.pdf",
    "FA2026-008162":   "osseo shop 219 5 .pdf",
    "2402280246":      "gacd 2402280246 v1.pdf",
    "8570444":         "fak18 12 205622 18719137 8570444 20260512 112815692arcade .pdf",
    "2402380268":      "2026 07 08 gacd avoir 38 54 2402380268.pdf",
    "2402378736":      "2026 07 06 gacd facture 509 78 2402378736.pdf",
    "2402367929":      "2026 06 22 gacd facture 62 21 2402367929.pdf",
    "2402365910":      "2026 06 18 gacd facture 431 37 2402365910.pdf",
    "2402363184":      "2026 06 15 gacd facture 12 54 2402363184.pdf",
    "2402361965":      "2026 06 12 gacd facture 370 95 2402361965.pdf",
    "2402359883":      "2026 06 10 gacd facture 20 32 2402359883.pdf",
    "2402358750":      "2026 06 09 gacd facture 147 73 2402358750.pdf",
    "2402353440":      "2026 06 03 gacd facture 132 50 2402353440.pdf",
    "2402352574":      "2026 06 02 gacd facture 56 01 2402352574.pdf",
    "2402351133":      "2026 05 31 gacd facture 57 75 2402351133.pdf",
    "2402318938":      "2026 04 21 gacd facture 14 15 2402318938.pdf",
}

# les deux pieces sans reference propre, reperees autrement
PAR_TRIPLET = {
    ("ONCD", "2026-08-06", "462.00"):
        "2026 08 06 oncd attestation reglement 462 00 262785280708.pdf",
    ("EXECOM", "2026-10-08", "334.80"):
        "2026 10 08 execom relance 2 334 80 fa006127.pdf",
}

NOM_ZFX = ("2026 10 09 as creances recouvrement mise en demeure 298 32 "
           "zfx dossier 12783.pdf")

NOTE = (" DEPOSEE AU PORTAIL TGS LE 13/10/2026, categorie « Je ne sais pas ou "
        "deposer ce document / Equipe comptable », statut « En cours de "
        "traitement ». Compteur du portail passe de 1 430 a 1 450 : +20 pour "
        "20 pieces, soit exactement un depot par piece. NOM DU DEPOT AU "
        "PORTAIL : '%s'.")

ESPACES = (" NB SUR LE NOM : l ecran du portail reduit les espaces multiples a "
           "un seul. Les donnees brutes en contiennent plusieurs dans ce nom ; "
           "pour « osseo shop 219 5 .pdf » il y en a trois avant « .pdf », et "
           "pour « gacd 2402280246 v1.pdf » trois puis deux, sans que leur "
           "position exacte soit etablie. Le nom est donc enregistre sous sa "
           "forme AFFICHEE. Une recherche par numero ne s en trouve pas "
           "genee ; une recherche par nom exact, si.")

LAISSEE = (" NON DEPOSEE LE 13/10/2026, ET LA RAISON M EST INCONNUE. Cette "
           "piece etait au lot A du prompt sans aucune reserve, et Chrome l a "
           "ecartee volontairement en indiquant que ses motifs figuraient dans "
           "un rapport qui ne m est jamais parvenu. JE NE CHANGE DONC NI SON "
           "ETAT NI SON CYCLE : la question est posee, pas tranchee. A "
           "redemander avant tout nouveau depot — si le motif etait un montant "
           "qui differe, c est le document qui a raison, pas le registre.")

ZFX = (
    "2026-10-09", "ZFX", "MISE-EN-DEMEURE", "", "AS-12783", "", "DEPOSEE",
    "PIECE CREEE AU REGISTRE LE 13/10/2026, APRES SON PROPRE DEPOT : je l avais "
    "mise dans le prompt de depot sans jamais lui creer de ligne, elle est donc "
    "partie au portail en etant invisible ici. "
    "Mise en demeure par LRAR du cabinet AS CREANCES RECOUVREMENT, 7 allee Paul "
    "Emile Victor 95360 Montmagny, pour le compte de SAS ZFX LYON, dossier "
    "12783, gestionnaire Sabine ALLIEL. Un premier envoi date du 09/10/2026 et "
    "un second du 12/10. Delai : HUITAINE a compter du 09/10, soit vers le "
    "17/10, avant transmission au contentieux. "
    "LE MONTANT EST VIDE, ET C EST DELIBERE : le cabinet reclame 298,32 = "
    "253,99 de solde + 40,00 d indemnite forfaitaire + 4,33 d interets echus. "
    "Or les 253,99 sont la facture R-2602.52453, DEJA au registre et deja "
    "deposee : inscrire 298,32 ici compterait cette facture une seconde fois. "
    "Le seul supplement possible est 44,33, et il n est ni paye ni acquis. La "
    "qualification comptable appartient a TGS. "
    "AUCUNE AUTRE PIECE ZFX NE MANQUE : la mise en demeure ne porte que sur "
    "cette seule facture, verifie en la lisant le 12/10.")


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
    par_ref, par_trip = {}, {}
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d mal formee." % (n + 1))
        ref = r[i["reference"]].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))
        par_trip.setdefault(
            (r[i["fournisseur"]].strip(), r[i["date_piece"]].strip(),
             r[i["montant"]].strip()), []).append((n, r))

    touche, journal, noms = {}, [], []

    def pose(n, r, nom, ref):
        r[i["etat"]] = "DEPOSEE"
        bout = NOTE % nom
        if nom in ("osseo shop 219 5 .pdf", "gacd 2402280246 v1.pdf"):
            bout += ESPACES
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        touche[n] = r
        noms.append(nom)
        journal.append("  %-16s DEPOSEE" % ref)

    for ref, nom in PAR_REF.items():
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (ref, len(c)))
        pose(c[0][0], c[0][1], nom, ref)

    for trip, nom in PAR_TRIPLET.items():
        c = par_trip.get(trip, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (trip, len(c)))
        pose(c[0][0], c[0][1], nom, "%s %s" % (trip[0], trip[2]))

    for ref in ("2402336461", "2402321857"):
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        r[i["note"]] = (r[i["note"]].rstrip() + LAISSEE).replace(";", " -")
        touche[n] = r
        journal.append("  %-16s NON deposee, motif inconnu — etat inchange" % ref)

    for n, r in touche.items():
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()

    d, f, t, m, ref, per, etat, note = ZFX
    if ref in par_ref:
        raise SystemExit("%s existe deja." % ref)
    l = [""] * len(h)
    l[i["date_piece"]], l[i["fournisseur"]], l[i["type"]] = d, f, t
    l[i["montant"]], l[i["reference"]], l[i["periode"]] = m, ref, per
    l[i["etat"]] = etat
    l[i["emplacement"]] = "Mon ordinateur portable > Downloads"
    l[i["note"]] = (note + (NOTE % NOM_ZFX)).replace(";", " -")
    l[i["cycle"]] = "ENVOYE_TGS"
    s = io.StringIO()
    csv.writer(s, delimiter=";", lineterminator="").writerow(l)
    lignes.append(s.getvalue())
    noms.append(NOM_ZFX)
    journal.append("  %-16s CREEE et DEPOSEE (mise en demeure ZFX)" % ref)

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    # l historique
    brut = io.open(HIST, encoding="utf-8").read()
    if not brut.endswith("\n"):
        raise SystemExit("%s ne finit pas par un retour a la ligne." % HIST)
    avant = len(brut.splitlines())
    deja = set(x.split("|")[0].strip() for x in brut.splitlines() if x.strip())
    ajouts = ["%s | %s | %s" % (x, STATUT, JOUR) for x in noms if x not in deja]
    io.open(HIST, "a", encoding="utf-8", newline="\n").write(
        "\n".join(ajouts) + "\n")
    apres = len(io.open(HIST, encoding="utf-8").read().splitlines())
    if apres != avant + len(ajouts):
        raise SystemExit("historique : %d attendu, %d trouve."
                         % (avant + len(ajouts), apres))

    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d mal formee." % (n + 1))
    print("\n".join(journal))
    print()
    print("historique : %d -> %d lignes (+%d)" % (avant, apres, len(ajouts)))
    print("%d pieces au registre." % (len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

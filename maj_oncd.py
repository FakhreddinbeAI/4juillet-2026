#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ONCD : les deux 462 EUR sont normaux. Question close, piece manquante ouverte.

CE QUE LE DOCTEUR A EXPLIQUE, ET QUE LE DOCUMENT CONFIRME MOT POUR MOT
Il y a DEUX cotisations ordinales de 462,00 EUR : une pour le praticien, une
pour la societe. L appel de janvier le dit lui-meme :
« les societes doivent s acquitter d une cotisation entiere. Le versement de
celle-ci n exonere pas chaque praticien membre de la societe d exercice du
reglement de sa cotisation personnelle qui doit etre reglee separement. »
La question « 462 payes deux fois ? », ouverte le 06/10 et mise en attente, est
donc CLOSE : ce n est pas un double paiement, ce sont deux redevables.

LES DEUX APPELS, IDENTIFIES
  266020689680  COTISATION ORDINALE SOCIETE 2026   SELARL TIGHZA
                n° national R044/226, Paris le 26/01/2026, 462,00,
                a regler avant le 31 mars. DOCUMENT EN MAIN, DEPOSE.
  262785280708  cotisation du PRATICIEN
                n° national 66298. Nous n avons que la RELANCE du 23/07/2026
                et l ATTESTATION de reglement du 06/08/2026.

LA PIECE QUI MANQUE
L APPEL A COTISATION PERSONNEL de janvier 2026 n est pas au dossier. Il a du
etre emis en meme temps que celui de la societe, fin janvier, sous le numero
262785280708 et le n° national 66298. On en a la relance et la preuve de
paiement, pas l appel initial. A RECLAMER : il se telecharge depuis
cotisation.ordre-chirurgiens-dentistes.fr avec le numero d appel.

CE QUE LE RELEVE DIT DES PAIEMENTS
Deux cheques de 462,00 encaisses le 07/08/2026, CHQ. 8430662 et CHQ. 8430663 :
un par cotisation. Les deux ont ete payees en RETARD, l echeance etait le
31 mars.
RESTE UN POINT NON RESOLU, mineur : le cheque 8430738, dont un scan a ete
depose au portail le 06/02/2026, n apparait nulle part au releve LCL, et aucun
mouvement de 462 n a lieu en fevrier. Il a probablement ete emis puis non
encaisse, les deux cheques d aout le remplacant. Je ne l affirme pas.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

SOCIETE = (
    " DOCUMENT OUVERT ET LU LE 12/10/2026. C est la COTISATION ORDINALE "
    "SOCIETE 2026, au nom de la SELARL TIGHZA, n° national R044/226, emise a "
    "Paris le 26 janvier 2026, 462,00 EUR, a regler avant le 31 mars. Le "
    "document porte le bareme complet : praticien en activite 462, societe 462, "
    "SPFPL 462, praticien retraite 126. "
    "ET IL TRANCHE LA QUESTION DES DEUX 462 : « les societes doivent "
    "s acquitter d une cotisation entiere. Le versement de celle-ci n exonere "
    "pas chaque praticien membre de la societe d exercice du reglement de sa "
    "cotisation personnelle qui doit etre reglee separement. » Deux redevables, "
    "deux cotisations, pas un double paiement.")

PRATICIEN = (
    " RATTACHEMENT ETABLI LE 12/10/2026 : cet appel 262785280708 porte le "
    "n° national 66298 et concerne LE PRATICIEN, pas la societe. La cotisation "
    "societe est l appel 266020689680, n° national R044/226, lu le meme jour. "
    "LA QUESTION DES DEUX 462 EST CLOSE : l appel societe ecrit noir sur blanc "
    "que la cotisation de la societe n exonere pas celle du praticien. "
    "IL MANQUE UNE PIECE : l APPEL A COTISATION PERSONNEL de janvier 2026. "
    "Nous n avons que cette relance du 23/07 et l attestation de reglement du "
    "06/08. L appel initial se telecharge depuis "
    "cotisation.ordre-chirurgiens-dentistes.fr avec le numero d appel. "
    "PAIEMENTS : deux cheques de 462,00 encaisses le 07/08/2026, CHQ. 8430662 "
    "et CHQ. 8430663, un par cotisation — toutes deux payees en retard, "
    "l echeance etait le 31 mars. Reste mineur et non resolu : le cheque "
    "8430738 scanne et depose au portail le 06/02/2026 n apparait nulle part au "
    "releve, et aucun mouvement de 462 n a lieu en fevrier ; probablement emis "
    "puis non encaisse, remplace par les deux d aout — non affirme.")

MANQUANTE = (
    "2026-01-26", "ONCD", "FACTURE", "462.00", "66298-appel-janvier", "",
    "MANQUANT",
    " PIECE MANQUANTE IDENTIFIEE LE 12/10/2026 : l APPEL A COTISATION ORDINALE "
    "PERSONNELLE 2026 du Dr Tighza, n° national 66298. Il a du etre emis fin "
    "janvier 2026 comme celui de la societe (26/01), sous le numero d appel "
    "262785280708. Nous detenons la RELANCE du 23/07/2026 et l ATTESTATION de "
    "reglement du 06/08/2026, mais PAS l appel initial. "
    "LA DATE 2026-01-26 EST UNE HYPOTHESE, celle de l appel societe lu le "
    "meme jour : a corriger des que le document sera en main. "
    "OU LE TROUVER : cotisation.ordre-chirurgiens-dentistes.fr, se munir du "
    "numero d appel 262785280708. L attestation et le caducee y sont deja "
    "disponibles, donc l appel devrait l etre aussi.")


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
    for ref, bout in (("266020689680", SOCIETE), ("262785280708", PRATICIEN)):
        c = par.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()
        journal.append("  %-14s note completee" % ref)

    d, f, t, m, ref, per, etat, note = MANQUANTE
    if ref in par:
        raise SystemExit("%s existe deja." % ref)
    l = [""] * len(h)
    l[i["date_piece"]], l[i["fournisseur"]], l[i["type"]] = d, f, t
    l[i["montant"]], l[i["reference"]], l[i["periode"]] = m, ref, per
    l[i["etat"]] = etat
    l[i["emplacement"]] = "a reclamer sur cotisation.ordre-chirurgiens-dentistes.fr"
    l[i["note"]] = note.strip().replace(";", " -")
    l[i["cycle"]] = "A_TRIER"
    s = io.StringIO()
    csv.writer(s, delimiter=";", lineterminator="").writerow(l)
    lignes.append(s.getvalue())
    journal.append("  %-14s AJOUTEE MANQUANT  appel personnel de janvier" % ref)

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

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fin du depouillement des telechargements ftighza, 12/10/2026 au soir.

TROIS PIECES NOUVELLES, UNE PIECE QUI N EN EST PAS UNE, UN FAIT BANCAIRE.

1. LE « CEGID » N EST PAS CEGID
Le mail venait de noreply@cegid.cloud, mais Cegid n est que le logiciel de
facturation. Le creancier est SASU EXECOM, 69 rue du Champ Fleuri, Les
Sorinieres. C est une 2e relance sur la facture FA006127 du 30/06/2026,
334,80 EUR, qui est DEJA au registre et DEJA deposee. Pas une charge nouvelle :
l information utile est qu elle reste IMPAYEE au 08/10/2026.

2. LE « CAD- » DE L ONCD N EST PAS UN DOCUMENT COMPTABLE
C est le CADUCEE, la vignette professionnelle, RPPS 10100455004. 386 950 octets
parce que c est une image. Il n a rien a faire chez TGS. Renomme
« NON-COMPTABLE » pour qu on ne le depose jamais par erreur.

3. CE QUE L ATTESTATION ONCD PROUVE, ET CE QU ELLE N EXPLIQUE PAS
L attestation certifie que la cotisation 2026 de 462,00 EUR, appel
262785280708, n° national 66298, a ete REGLEE LE 06/08/2026.
Or le releve LCL montre DEUX cheques de 462,00 encaisses le 07/08/2026 :
CHQ. 8430662 et CHQ. 8430663. L attestation n en couvre qu un.
ET le cheque 8430738, dont un scan a ete depose au portail le 06/02/2026 sous
le nom « ONCD chq 8430738 », N APPARAIT NULLE PART au releve : les neuf
cheques de l annee sont 8430653, 8430655, 8430656, 8430658, 8430659, 8430661,
8430662, 8430663 et un CHQ IRREGUL. Aucun mouvement de 462 EUR en fevrier.
CE QUI RESTE A EXPLIQUER : le second cheque de 462,00 du 07/08, et le sort du
cheque 8430738. Je ne conclus NI a un double paiement NI a son contraire.

UNE FAUTE DE METHODE A NE PAS REFAIRE
J ai d abord cherche les 462 EUR avec un filtre sur la chaine « 462.00 ». Il
n a rien rendu : le releve ecrit « 462.0 ». Les deux cheques etaient la depuis
le debut. NE JAMAIS FILTRER UN MONTANT COMME UNE CHAINE DE CARACTERES — le
comparer comme un nombre. C est la meme famille d erreur que la reference
amputee d un chiffre : une comparaison textuelle sur une donnee numerique.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

NOUVELLES = [
    ("2026-10-08", "DOCTOLIB", "FACTURE", "149.00", "FRIN25-02861493",
     "2026-10-01-au-2026-10-31", "RENOMME",
     "Duplicata de facture, compte A00399835, souscription A-S00407485, "
     "Doctolib Gestion de Patientele, 124,17 HT + 24,83 TVA. Prelevement SEPA, "
     "RUM B843X34. Le document porte la mention DUPLICATA mais fait "
     "justificatif. Derniere Doctolib au registre avant celle-ci : "
     "FRIN25-02696811 du 09/09"),
    ("2026-10-08", "EXECOM", "RELANCE", "334.80", "FA006127-relance-2", "",
     "RENOMME",
     "DEUXIEME RELANCE sur la facture FA006127 du 30/06/2026, 334,80, qui est "
     "deja au registre et deja deposee. Le mail venait de noreply@cegid.cloud "
     "mais Cegid n est que le logiciel : le creancier est SASU EXECOM. "
     "L information utile est que FA006127 RESTE IMPAYEE au 08/10/2026"),
    ("2026-08-06", "ONCD", "ATTESTATION", "462.00", "ATT-262785280708", "",
     "RENOMME",
     "ATTESTATION DE REGLEMENT emise par la tresorerie du Conseil National. "
     "Elle certifie que la cotisation 2026 de 462,00, appel 262785280708, "
     "n° national 66298, a ete REGLEE LE 06/08/2026 et que le Dr Tighza est a "
     "jour. C est une PREUVE DE PAIEMENT, pas un appel"),
]

NOTE_NEUVE = (" PIECE AJOUTEE AU REGISTRE LE 12/10/2026 AU SOIR, en depouillant "
              "les telechargements de ftighza@gmail.com. Ouverte, lue, "
              "renommee dans « Mon ordinateur portable > Downloads ». %s.")

NOTE_ONCD = (
    " PAIEMENT ECLAIRCI ET QUESTION DEPLACEE, LE 12/10/2026. L attestation "
    "ONCD du 06/08/2026 certifie que la cotisation 2026 de 462,00 (appel "
    "262785280708, n° national 66298) EST REGLEE. MAIS le releve LCL montre "
    "DEUX cheques de 462,00 encaisses le 07/08/2026, CHQ. 8430662 et CHQ. "
    "8430663 : l attestation n en couvre qu un seul. ET le cheque 8430738, "
    "dont le scan a ete depose au portail le 06/02/2026, N APPARAIT NULLE PART "
    "au releve — les neuf cheques de l annee sont 8430653, 8430655, 8430656, "
    "8430658, 8430659, 8430661, 8430662, 8430663 et un CHQ IRREGUL, et il n y "
    "a aucun mouvement de 462 en fevrier. Restent a expliquer : le SECOND "
    "cheque du 07/08, et le sort du cheque 8430738. Je ne conclus ni au double "
    "paiement ni a son contraire — c est une question pour TGS ou pour la "
    "banque.")

NOTE_EXECOM = (
    " TOUJOURS IMPAYEE AU 08/10/2026 : une deuxieme relance EXECOM est arrivee "
    "ce jour-la, ajoutee au registre le 12/10. Le creancier est SASU EXECOM, "
    "pas Cegid — Cegid n est que son logiciel de facturation.")


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

    for ref, bout in (("262785280708", NOTE_ONCD), ("FA006127", NOTE_EXECOM)):
        c = par.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s)." % (ref, len(c)))
        n, r = c[0]
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(r)
        lignes[n] = s.getvalue()
        journal.append("  %-18s note completee" % ref)

    for d, f, t, m, ref, per, etat, det in NOUVELLES:
        if ref in par:
            raise SystemExit("%s existe deja." % ref)
        l = [""] * len(h)
        l[i["date_piece"]], l[i["fournisseur"]], l[i["type"]] = d, f, t
        l[i["montant"]], l[i["reference"]], l[i["periode"]] = m, ref, per
        l[i["etat"]] = etat
        l[i["emplacement"]] = "Mon ordinateur portable > Downloads"
        l[i["note"]] = (NOTE_NEUVE % det).replace(";", " -")
        l[i["cycle"]] = "A_TRIER"
        s = io.StringIO()
        csv.writer(s, delimiter=";", lineterminator="").writerow(l)
        lignes.append(s.getvalue())
        journal.append("  %-18s AJOUTEE  %s  %9s  %s" % (ref, d, m, t))

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

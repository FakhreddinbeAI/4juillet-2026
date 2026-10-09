#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rapprochement STRAUMANN du 09/10/2026 : la feuille « Suivi factures
Straumann 2026 » contre le registre.

CE QUI A ETE LU, ET NON SUPPOSE
Quatre PDF ouverts un par un dans le Drive :
  9060024519  297,84  03/02  « Paycenter Straumann Group » (Reimpression)
  9060036137   61,20  19/02  « Paycenter Straumann Group »
  9060082089   98,34  17/04  « Straumann 98,34 »
  9060079433   73,14  14/04  « 14.04 straumann.pdf »   <-- ABSENTE DU REGISTRE
  9060084270   73,14  21/04  « Straumann 9060084270 - 73,14 »

LE PIEGE EVITE
9060079433 et 9060084270 font TOUTES LES DEUX 73,14 EUR et leurs fichiers
pesent TOUS LES DEUX 27648 octets. Ce sont deux factures differentes :
commandes 104098a et 104786A, articles L 1600-1-SF et L 1600-2-SC, echeances
14/05 et 21/05. La regle « meme montant n est pas meme piece » a servi ici pour
de bon : une fusion aurait perdu 73,14 EUR et un justificatif.
Idem pour 9060121791 et 9060128654, toutes deux a 134,34 EUR.

CE QUE LA FEUILLE APPREND
Elle est arithmetiquement juste, recalculee au centime : factures 31689,29,
avoirs -7337,36, net 24351,93, et la somme des lignes « Non reglee » vaut
exactement ce net. Les neuf factures « Soldee » sont chacune annulee par un
avoir du meme montant, d ou un net nul.
19 documents de la feuille manquent au registre : 10 factures et 9 avoirs.
Un seul deplace la charge 2026 : 9060079433, +73,14 EUR. Les 18 autres sont
neuf paires facture/avoir qui se neutralisent — mais TGS a besoin des DEUX
pieces de chaque paire, donc elles entrent au registre.

CE QUE LE REGISTRE APPREND A LA FEUILLE
La feuille s arrete au 19/06/2026 et ignore huit pieces que je detiens :
9060036699, 9060107688, 9060125749, 9060131185, 9060136144, 9060181129,
9060182966, 9060183030, plus la relance du 24/07. Les deux sources sont
complementaires, aucune ne fait autorite seule.

PRUDENCE
Les 18 lignes ajoutees depuis la feuille le sont en A_VERIFIER : la feuille
prouve que le document EXISTE, pas qu on le detienne. Meme regle que pour le
classeur de l assistante. Chacune porte sa « Ref. PDF », qui est la voie de
telechargement sur le portail Straumann.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
SRC = ("Source : feuille « Suivi factures Straumann 2026 » du Drive, id "
       "1juxcddu_3wrT3Hluxsd_AbYO4XNU8ZDcePHAxbbu5Vc, lue le 09/10/2026.")
GARDE = ("LA FEUILLE SEULE NE FAIT PAS FOI : elle prouve que le document "
         "existe, pas qu on le detienne. A telecharger sur le portail "
         "Straumann avec la Ref. PDF ci-dessus, puis relire le montant dans "
         "le fichier avant de le considerer acquis.")

# --- les trois factures dont le montant vient d etre LU dans le PDF
LUES = {
    "9060024519": (
        "1BG-MiNYNgHrWJY-H_nE1uJsqRSDDH1Bi",
        "MONTANT LU DANS LE PDF LE 09/10/2026 : Total 297,84 EUR, confirme "
        "deux fois dans le document (corps et coupon cheque). Valeur nette "
        "248,20 + TVA 49,64. Trois lignes de vis pour pilier 023.4750 et "
        "023.4749, remise client -27 %. Le PDF porte la mention "
        "« Reimpression » : c est un duplicata, pas l original. Echeance "
        "05/03/2026, reference de paiement 15123197 / 9060024519. La feuille "
        "Straumann la donne « Non reglee ». Etat A_VERIFIER -> RECU : on "
        "detient le fichier ET le montant vient du document."),
    "9060036137": (
        "1ZNIPTZIH7HTab5KhRGlWIiS7GbVpiDfK",
        "MONTANT LU DANS LE PDF LE 09/10/2026 : Total 61,20 EUR, confirme "
        "deux fois. Valeur nette 51,00 + TVA 10,20, frais d expedition 0,00. "
        "Une base en titane L 1610-1-SF. Livree au LABORATOIRE MADE IN LABS "
        "a Paris 18, facturee au cabinet. Echeance 21/03/2026. La feuille "
        "Straumann la donne « Non reglee ». Etat A_VERIFIER -> RECU."),
    "9060082089": (
        "1l3pvasF53noV_qAWX9ifjGGYWA6I8lOL",
        "MONTANT LU DANS LE PDF LE 09/10/2026 : Total 98,34 EUR, confirme "
        "deux fois. Valeur nette 72,00 + frais d expedition 9,95 + TVA 16,39. "
        "Un analogue d implant L 80-CS et une base en titane L 1600-1-SF. "
        "Livree au LABORATOIRE MADE IN LABS. Echeance 17/05/2026. La note "
        "precedente disait le montant non visible et interdisait de le "
        "recopier depuis le nom du fichier : il vient d etre lu dans le "
        "document, et il confirme le nom. Etat A_VERIFIER -> RECU."),
}

# --- la facture que le registre ignorait
NOUVELLE = [
    "2026-04-14", "STRAUMANN", "FACTURE", "73.14", "9060079433", "",
    "RECU",
    "Drive partage > Lisa - Lucie : factures a regler > Reglements Mai",
    "AJOUTEE AU REGISTRE LE 09/10/2026. ABSENTE JUSQUE-LA : ni le classeur de "
    "l assistante ni mes depouillements ne l avaient vue. " + SRC + " "
    "LUE DANS LE PDF, deux fichiers identiques au Drive : « 14.04 "
    "straumann.pdf » id 1wFFx0kYLtQIcYa1YUCVZaS0ObH_2zhnG et une seconde "
    "copie id 1ytVhrSnUsqoMDERjzCIvAf7e8qe1TuwD dans « factures a regler ». "
    "Facture 9060079433 creee le 14/04/2026, echeance 14/05/2026, commande "
    "104098a, une base en titane L 1600-1-SF. Valeur nette 51,00 + frais 9,95 "
    "+ TVA 12,19 = Total 73,14 EUR, confirme deux fois dans le document. "
    "ATTENTION, DEUX FACTURES A 73,14 EUR : celle-ci du 14/04 (commande "
    "104098a, article L 1600-1-SF) et la 9060084270 du 21/04 (commande "
    "104786A, article L 1600-2-SC). Leurs fichiers pesent TOUS LES DEUX 27648 "
    "octets. Ce ne sont PAS des doublons et il ne faut jamais les fusionner. "
    "La feuille Straumann les liste separement avec des Ref. PDF distinctes, "
    "981303417 et 981425243. Ref. PDF de celle-ci : 981303417. La feuille la "
    "donne « Non reglee ». Non payee au 22/09, derniere date couverte par les "
    "releves LCL.",
    "A_PAYER",
]

# --- les 18 documents de la feuille que le registre ignore
#     (date, type, montant, reference, ref_pdf, doc_lie, statut)
FEUILLE = [
    ("2026-01-14", "FACTURE",   "611.45", "9060006689", "979639418", "9060011986", "Soldee"),
    ("2026-01-21", "AVOIR",     "611.45", "9060011986", "977638795", "9060006689", "Avoir emis"),
    ("2026-01-28", "FACTURE",   "917.17", "9060017570", "979893945", "9060034033", "Soldee"),
    ("2026-02-14", "FACTURE",  "1834.34", "9060032068", "980241683", "9060040628", "Soldee"),
    ("2026-02-17", "AVOIR",     "917.17", "9060034033", "977638795", "9060017570", "Avoir emis"),
    ("2026-02-26", "AVOIR",    "1834.34", "9060040628", "977638795", "9060032068", "Avoir emis"),
    ("2026-03-06", "FACTURE",  "1222.90", "9060048851", "980624610", "9060059451", "Soldee"),
    ("2026-03-11", "FACTURE",   "305.72", "9060051289", "980696921", "9060063384", "Soldee"),
    ("2026-03-11", "FACTURE",   "305.72", "9060051290", "980696922", "9060063944", "Soldee"),
    ("2026-03-20", "AVOIR",    "1222.90", "9060059451", "977638795", "9060048851", "Avoir emis"),
    ("2026-03-26", "AVOIR",     "305.72", "9060063384", "977638795", "9060051289", "Avoir emis"),
    ("2026-03-26", "AVOIR",     "305.72", "9060063944", "977638795", "9060051290", "Avoir emis"),
    ("2026-04-21", "FACTURE",   "917.17", "9060083085", "981409565", "9060084611", "Soldee"),
    ("2026-04-22", "AVOIR",     "917.17", "9060084611", "977638795", "9060083085", "Avoir emis"),
    ("2026-05-19", "FACTURE",   "917.17", "9060102693", "981912113", "9060102694", "Soldee"),
    ("2026-05-19", "AVOIR",     "917.17", "9060102694", "977638795", "9060102693", "Avoir emis"),
    ("2026-05-26", "FACTURE",   "305.72", "9060106903", "982024106", "9060106911", "Soldee"),
    ("2026-05-26", "AVOIR",     "305.72", "9060106911", "982024193", "9060106903", "Avoir emis"),
]

# --- la voie de recuperation des cinq encore introuvables
REF_PDF_MANQUANTES = {
    "9060109569": "982080182",
    "9060109572": "982080204",
    "9060109581": "voir Paycenter",
    "9060121791": "982326076",
    "9060128654": "982494040",
}


def charger(chemin):
    """Le registre porte des commentaires INTERCALES dans les donnees, pas
    seulement en tete : des blocs « # --- COFICA BAIL --- » expliquent un
    fournisseur au milieu de ses lignes. On garde donc chaque ligne a sa place
    et on ne parse que les lignes de donnees. Ecrire le fichier entier avec un
    csv.writer les detruirait toutes."""
    lignes = io.open(chemin, encoding="utf-8").read().splitlines()
    index = []          # (numero de ligne, champs) pour les seules donnees
    for n, l in enumerate(lignes):
        if not l.strip() or l.startswith("#"):
            continue
        champs = next(csv.reader([l], delimiter=";"))
        index.append((n, champs))
    if not index:
        raise SystemExit("registre_2026.csv : aucune ligne de donnees.")
    return lignes, index


def verifier(index, h):
    """Un point-virgule dans une note casse une ligne en silence. On refuse
    d ecrire plutot que de produire un registre faux."""
    mauvaises = [n + 1 for n, r in index[1:] if len(r) != len(h)]
    if mauvaises:
        raise SystemExit("registre_2026.csv : %d ligne(s) au mauvais nombre de "
                         "champs, lignes %s. Un point-virgule dans une note ?"
                         % (len(mauvaises), mauvaises[:10]))


def serialiser(champs):
    s = io.StringIO()
    csv.writer(s, delimiter=";", lineterminator="").writerow(champs)
    return s.getvalue()


def sans_pv(txt):
    """Aucun point-virgule ne doit entrer dans un champ."""
    return txt.replace(";", " -")


def main():
    lignes, index = charger(FIC)
    h = index[0][1]
    verifier(index, h)
    iref, ietat, inote = h.index("reference"), h.index("etat"), h.index("note")
    ifour, imt = h.index("fournisseur"), h.index("montant")

    # les lignes de donnees, en gardant leur numero de ligne d origine
    data = index[1:]
    rows = [r for _, r in data]
    ligne_de = {id(r): n for n, r in data}
    nouvelles = []

    connues = {r[iref].strip() for r in rows if r[iref].strip()}
    journal = []

    # 1. les trois montants lus dans les PDF
    for ref, (fid, note) in LUES.items():
        trouve = [r for r in rows
                  if r[iref].strip() == ref and r[ifour] == "STRAUMANN"]
        if len(trouve) != 1:
            raise SystemExit("STRAUMANN %s : %d ligne(s) au registre, attendu "
                             "1. Rien n a ete ecrit." % (ref, len(trouve)))
        r = trouve[0]
        avant = r[ietat]
        r[ietat] = "RECU"
        r[inote] = sans_pv(r[inote].rstrip() + " " + note
                           + " Fichier id " + fid + ".")
        journal.append("  %s  etat %s -> RECU, montant %s lu dans le PDF"
                       % (ref, avant, r[imt]))

    # 2. la facture absente
    if NOUVELLE[iref] in connues:
        raise SystemExit("9060079433 est deja au registre. Rien n a ete ecrit.")
    nouvelles.append([sans_pv(c) for c in NOUVELLE])
    journal.append("  9060079433  AJOUTEE, 73.14 EUR, RECU, A_PAYER")

    # 3. les 18 documents de la feuille
    ajoutes = 0
    for date, typ, mt, ref, refpdf, lie, statut in FEUILLE:
        if ref in connues:
            journal.append("  %s  deja au registre, laissee telle quelle" % ref)
            continue
        note = (("AJOUTEE AU REGISTRE LE 09/10/2026 par maj_straumann.py. "
                 + SRC + " Ref. PDF %s. Document lie : %s. Statut dans la "
                 "feuille : %s. ") % (refpdf, lie, statut))
        if typ == "AVOIR":
            note += ("C est l avoir qui annule la facture %s du meme montant. "
                     "La paire se neutralise comptablement, mais TGS a besoin "
                     "des DEUX pieces : un avoir sans sa facture ne justifie "
                     "rien. Ne jamais deposer l une sans l autre. " % lie)
        else:
            note += ("Facture « Soldee » NON PAR UN PAIEMENT mais par l avoir "
                     "%s du meme montant. Aucun euro n est sorti. Ne pas la "
                     "compter comme payee ni chercher sa trace au releve LCL. "
                     % lie)
        note += GARDE
        nouvelles.append([sans_pv(x) for x in
                          [date, "STRAUMANN", typ, mt, ref, "", "A_VERIFIER",
                           "A OBTENIR - portail Straumann, Ref. PDF " + refpdf,
                           note, "A_TRIER"]])
        ajoutes += 1
        connues.add(ref)
    journal.append("  %d document(s) de la feuille ajoute(s) en A_VERIFIER"
                   % ajoutes)

    # 4. la Ref. PDF inscrite sur les cinq encore introuvables
    for ref, refpdf in REF_PDF_MANQUANTES.items():
        for r in rows:
            if r[iref].strip() == ref and r[ifour] == "STRAUMANN":
                if "Ref. PDF" in r[inote]:
                    continue
                r[inote] = sans_pv(
                    r[inote].rstrip() + " VOIE DE RECUPERATION, inscrite le "
                    "09/10/2026 depuis la feuille Straumann : Ref. PDF "
                    + refpdf + ". C est l identifiant du document sur le "
                    "portail Straumann, a utiliser pour le telecharger.")
                journal.append("  %s  Ref. PDF %s inscrite" % (ref, refpdf))

    # --- controle AVANT d ecrire, sur les lignes modifiees et les nouvelles
    for r in rows + nouvelles:
        if len(r) != len(h):
            raise SystemExit("une ligne a %d champs au lieu de %d. Rien n a "
                             "ete ecrit." % (len(r), len(h)))

    # --- ecriture : on reecrit EN PLACE les seules lignes de donnees et on
    # ajoute les nouvelles a la fin. Les commentaires intercales ne bougent pas.
    for r in rows:
        lignes[ligne_de[id(r)]] = serialiser(r)
    sortie = lignes + [serialiser(r) for r in nouvelles]
    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(sortie) + "\n")

    # --- relecture : le fichier ecrit doit se recharger sans divergence
    _, verif = charger(FIC)
    verifier(verif, verif[0][1])
    if len(verif) - 1 != len(rows) + len(nouvelles):
        raise SystemExit("relecture : %d pieces relues, %d attendues."
                         % (len(verif) - 1, len(rows) + len(nouvelles)))

    print("\n".join(journal))
    print()
    print("%d pieces au registre, relues et verifiees." % (len(verif) - 1))


if __name__ == "__main__":
    sys.exit(main())

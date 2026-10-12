#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Retour du depot du 12/10/2026 : 40 pieces deposees, 13 retenues.

CE QUE CE SCRIPT ENREGISTRE
Le portail est passe de 1 377 a 1 429 depots. Les 40 pieces du jour sont toutes
dans « Je ne sais pas ou deposer ce document / Equipe comptable », en cours de
traitement. Henry Schein a ete depose seul, en dernier, a 11:39:14.

QUATRE CORRECTIONS OU LE DOCUMENT A BATTU MA LISTE
  2402280246  GACD      date 16/02/2026, pas 26/02. Montant 427,78 juste.
  85700444    ARCADE    la reference n existe pas : la facture est 8570444.
                        J avais huit chiffres au lieu de sept. Et 18719136,
                        que j avais pris pour une reference de facture, est le
                        NUMERO DE COMMANDE ; la facture de cette piece-la est
                        8570332.
  20240312    NTJ       date 02/08/2026, pas 01/08.
  C-30800     ADF       cette reference n apparait NULLE PART dans le document.
                        La piece est une inscription au Congres ADF n° B-33156,
                        au nom de Lucie Menanteau, payee par la SELARL.

LA LECON DE CES QUATRE CAS
Trois sur quatre viennent de la meme faute : j avais pris pour reference de
facture un numero qui n en est pas un — numero de commande, code client,
numero d inscription. Le registre doit porter le numero QUE LE FOURNISSEUR
APPELLE « facture », pas le premier identifiant lisible. Deux autres cas
confirmes le meme jour : « 1034064 » est le numero de COMPTE CLIENT Septodont,
« C012667 » est un CODE CLIENT Rotec. Ces deux-la sont deposees et le portail
les retrouvera, mais la colonne reference ne dit pas ce qu elle promet.

UNE DEUXIEME PIECE D UN CONFRERE DANS LE DOSSIER
La relance Straumann du 24/07 (112,68) est adressee a « SELARL TIGHZA LOISEAU
JOHANNE », compte 15133626. Le compte du Dr Tighza est 15123197, verifie sur
trois factures le 12/10. Cette piece n est pas a nous. C est le second cas
apres l ORMCO de 1 348,66 du Dr ANGIBAUD. A EXCLURE.
Elle contenait l avoir 9060136144, deja retenu parce que son fichier n est que
la page 2 sur 2 — ce qui s explique maintenant : ce n etait pas notre document.

DEUX IDENTIFICATIONS QUE J AI FAITES MOI-MEME
Les deux fichiers « Paycenter Straumann Group » de « Reglements Mai », que je
decrivais depuis trois jours comme illisibles, sont :
  27 648 o  id 1ZNIPTZIH7HTab5KhRGlWIiS7GbVpiDfK  facture 9060036137, 61,20
  34 816 o  id 1BG-MiNYNgHrWJY-H_nE1uJsqRSDDH1Bi  facture 9060024519, 297,84
Lus le 12/10, deux pages chacun, montants conformes au registre, compte
15123197. Il suffisait de les ouvrir.

CE QUI RESTE OUVERT, ET LE TEST QUI LE TRANCHERAIT
Le portail porte deux depots nommes « Paycenter Straumann Group 1 » et « ... 2 »
depuis le 24/06. Comme le portail nomme un depot d apres le fichier televerse,
et comme ces deux fichiers sont les seuls du Drive a porter ce nom, ce sont tres
probablement eux. TRES PROBABLEMENT N EST PAS UNE PREUVE : il faut ouvrir les
deux depots du portail et lire le numero de facture. Tant que ce n est pas fait,
on ne redepose pas et on ne coche pas.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"

DEPOSEES = [
    "90049585", "90056020", "90056093", "90060529", "1034064",
    "90041207", "24516832", "24517077", "24517520", "BIOF2607056018",
    "BIOF2607056019", "2402386339", "2402391923", "2402331992",
    "retour-cheque", "331172674", "331173068", "331173646", "18719136",
    "C012667", "5123110", "R-2602.52453",
    "9060079433", "9060082089", "9060084270",
    "9060128654", "35684", "36409",
    "20240346", "ARG12031", "ARG13312",
    "ARG13747", "LOT466", "2606534061",
    "527258240324", "26009", "266020689680", "262785280708",
    "7904376-52", "compte-226502",
]

NOTE_DEPOT = (
    " DEPOSEE AU PORTAIL TGS LE 12/10/2026, categorie « Je ne sais pas ou "
    "deposer ce document / Equipe comptable », statut « En cours de "
    "traitement ». Verification anti-doublon faite avant depot : aucun depot "
    "anterieur ne portait ce numero. Le portail est passe de 1 377 a 1 429 "
    "depots ce jour.")

# deja au portail, prouve le 12/10 (pas redepose)
DEJA = {
    "36187": (" DEJA AU PORTAIL, PROUVE LE 12/10/2026 : le fichier du Drive est "
              "identique OCTET POUR OCTET au depot « MADE IN LABS JUILLET.pdf » "
              "du 06/10/2026. 31/07/2026, 1 705,24. Preuve par comparaison "
              "binaire, pas par ressemblance de montant. NON REDEPOSEE."),
    "433539": (" DEJA AU PORTAIL, VERIFIE LE 12/10/2026 : depot « V1 19 05 2026 "
               "PHARMACIE .pdf » du 08/10/2026, contenu relu, c est bien la "
               "facture 433 539. NON REDEPOSEE."),
}

# le document a battu ma liste : (ancienne, nouvelle, colonne, note)
CORRECTIONS = [
    ("2402280246", "date_piece", "2026-02-16",
     " DATE CORRIGEE LE 12/10/2026 : le document porte le 16/02/2026, j avais "
     "ecrit 26/02. Montant 427,78 confirme. NON DEPOSEE ce jour, en attente de "
     "ce controle ; a deposer au prochain lot."),
    ("20240312", "date_piece", "2026-08-02",
     " DATE CORRIGEE LE 12/10/2026 : la facture est du 02/08/2026, j avais "
     "ecrit 01/08. Montant 341,00 confirme. NON DEPOSEE ce jour, a deposer au "
     "prochain lot. Nom de fichier toujours muet (« NTJ aout »), dossier de "
     "Lucie, on n y touche pas."),
]

REFS = [
    ("85700444", "8570444",
     " REFERENCE CORRIGEE LE 12/10/2026. « 85700444 » n existe pas : la facture "
     "est le 8570444, du 12/05/2026, 160,00, commande 18719137. J avais mis "
     "huit chiffres la ou il y en a sept. A RAPPROCHER d une autre faute du "
     "meme jour : pour l ARCADE de 123,99 j avais pris « 18719136 » pour une "
     "reference de facture alors que c est le NUMERO DE COMMANDE — la facture "
     "y est 8570332. Chez ARCADE, lire le numero que le document appelle "
     "« facture », jamais le numero de commande. NON DEPOSEE, feu vert demande."),
    ("C-30800", "B-33156",
     " REFERENCE CORRIGEE LE 12/10/2026, ET NATURE DE LA PIECE CORRIGEE. "
     "« C-30800 » n apparait NULLE PART dans le document : ce n est pas une "
     "facture ADF mais une CONFIRMATION D INSCRIPTION AU CONGRES ADF n° "
     "B-33156, du 31/08/2026, 389,00, au nom de Lucie Menanteau, payee par la "
     "SELARL. Charge de formation reelle et deductible, mais le document porte "
     "la date de naissance et le telephone de la salariee. NON DEPOSEE ce jour."),
]

IDENT = {
    "9060036137": (
        " FICHIER IDENTIFIE LE 12/10/2026, par lecture. C est l un des deux "
        "« Paycenter Straumann Group » de « Reglements Mai », celui de 27 648 "
        "octets, id 1ZNIPTZIH7HTab5KhRGlWIiS7GbVpiDfK. Facture complete, deux "
        "pages, 19/02/2026, total 61,20 (net 51,00 + TVA 10,20), compte client "
        "15123197, livraison chez Laboratoire Made in Labs. Montant conforme au "
        "registre. Je decrivais ce fichier comme illisible depuis trois jours : "
        "il suffisait de l ouvrir."),
    "9060024519": (
        " FICHIER IDENTIFIE LE 12/10/2026, par lecture. C est l autre "
        "« Paycenter Straumann Group » de « Reglements Mai », celui de 34 816 "
        "octets, id 1BG-MiNYNgHrWJY-H_nE1uJsqRSDDH1Bi. Facture complete, deux "
        "pages, 03/02/2026, total 297,84 (net 248,20 + TVA 49,64), compte "
        "15123197, mention « Reimpression ». Montant conforme au registre."),
}

NOTE_PAYCENTER = (
    " NON DEPOSEE LE 12/10/2026, ET ON NE TRANCHE PAS SUR UNE PROBABILITE. Le "
    "portail porte deux depots « Paycenter Straumann Group 1 » et « ... 2 » "
    "depuis le 24/06/2026. Le portail nommant un depot d apres le fichier "
    "televerse, et ces deux fichiers etant les seuls du Drive a porter ce nom, "
    "ce sont tres probablement eux — mais ce n est pas une preuve. TEST A "
    "FAIRE : ouvrir les deux depots du 24/06 au portail et lire le numero de "
    "facture. Tant que ce n est pas fait, ni redepot ni cochage.")

EXCLUS_NOTE = (
    " PIECE EXCLUE LE 12/10/2026 : ELLE N EST PAS A NOUS. La relance est "
    "adressee a « SELARL TIGHZA LOISEAU JOHANNE », compte client 15133626. Le "
    "compte du Dr Tighza est 15123197, verifie le 12/10 sur les factures "
    "9060024519, 9060036137 et 9060079433. C est le compte du Dr Loiseau. "
    "SECOND CAS DE PIECE D UN CONFRERE dans le dossier, apres l ORMCO de "
    "1 348,66 du Dr ANGIBAUD. Elle contenait l avoir 9060136144, retenu le "
    "12/10 parce que son fichier n etait que la page 2 sur 2 : l explication "
    "est la, ce n etait pas notre document. NE PAS DEPOSER, NE PAS COMPTER.")

RETENUES_NOTE = {
    "2825": (" RETENUE LE 12/10/2026, ET ELLE NE PARTIRA PAS. Montant 232,00 et "
             "date 07/05 conformes, mais le document porte le NOM, la DATE DE "
             "NAISSANCE d une patiente MINEURE et son NIR. Regle du dossier : "
             "aucune donnee patient ne transite, c est de la compta pure. TGS a "
             "besoin du montant, pas de la patiente. A fournir autrement si "
             "TGS la reclame : montant et date seuls, ou document anonymise. "
             "LIEN TROUVE LE 12/10 : l indu CPAM de 96,75 (lot 466) correspond "
             "EXACTEMENT a la base de remboursement de cette note, et les "
             "pieces justificatives n ont jamais ete envoyees a la CPAM. Ce n "
             "est donc pas un indu mais un dossier incomplet — 96,75 "
             "recuperables."),
    "2842-1119-2935": (" NON DEPOSEE LE 12/10/2026, et c est juste : c est le "
                       "RECU DE PAIEMENT de la facture HKTDOLB4-0007, laquelle "
                       "est deja au portail. Un recu n est pas un justificatif "
                       "de charge quand la facture y est deja. Verifie le "
                       "12/10 : aucun recu Anthropic n a jamais ete depose, "
                       "seules les factures 0001 a 0009."),
    "FA2026-008162": (" NON DEPOSEE LE 12/10/2026, A DEPOSER AU PROCHAIN LOT. "
                      "Le depot existant s appelle « osseo shop VIRMENT 01 2026 "
                      "de 219 50 » et ne s ouvre pas au portail. Un justificatif "
                      "de VIREMENT n est pas la facture, meme pour le meme "
                      "montant — regle du dossier : un montant identique ne "
                      "fait pas un doublon. La facture doit etre deposee."),
    "ARG12869": (" NON DEPOSEE LE 12/10/2026, DOUBLON A PROUVER. Le fichier "
                 "« argoat - Mai » du Drive est bien ARG12869, et un depot "
                 "« argoat Mai .pdf » existe depuis le 24/06. C est probable, "
                 "pas prouve. TEST A FAIRE, celui qui a marche pour MADE IN "
                 "LABS 36187 le meme jour : comparer les deux fichiers octet "
                 "pour octet. Ni redepot ni cochage avant."),
}


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

    for ref in DEPOSEES:
        n, r = une(ref)
        r[i["etat"]] = "DEPOSEE"
        note(r, NOTE_DEPOT)
        touche[n] = r
    journal.append("  %d pieces passees DEPOSEE" % len(DEPOSEES))

    for ref, bout in DEJA.items():
        n, r = une(ref)
        r[i["etat"]] = "DEPOSEE"
        note(r, bout)
        touche[n] = r
    journal.append("  %d pieces deja au portail, prouvees" % len(DEJA))

    for ref, col, val, bout in CORRECTIONS:
        n, r = une(ref)
        anc = r[i[col]]
        r[i[col]] = val
        note(r, bout)
        touche[n] = r
        journal.append("  %-14s %s : %s -> %s" % (ref, col, anc or "(vide)", val))

    for anc, nou, bout in REFS:
        n, r = une(anc)
        r[i["reference"]] = nou
        note(r, bout)
        touche[n] = r
        journal.append("  reference      %s -> %s" % (anc, nou))

    for ref, bout in IDENT.items():
        n, r = une(ref)
        note(r, bout + NOTE_PAYCENTER)
        touche[n] = r
        journal.append("  %-14s fichier identifie, depot a prouver" % ref)

    for ref, bout in RETENUES_NOTE.items():
        n, r = une(ref)
        note(r, bout)
        touche[n] = r
        journal.append("  %-14s retenue, motif inscrit" % ref)

    # la relance Loiseau n a pas de reference : on la trouve autrement
    cibles = [(n, r) for n, r in index[1:]
              if r[i["fournisseur"]].strip() == "STRAUMANN"
              and r[i["montant"]].strip() == "112.68"]
    if len(cibles) != 1:
        raise SystemExit("relance 112,68 : %d ligne(s), attendu 1." % len(cibles))
    n, r = cibles[0]
    r[i["etat"]] = "EXCLUE"
    note(r, EXCLUS_NOTE)
    touche[n] = r
    journal.append("  STRAUMANN 112,68  EXCLUE — compte du Dr Loiseau")

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
    print("%d ligne(s) modifiee(s), %d pieces au registre."
          % (len(touche), len(verif) - 1))
    return 0


if __name__ == "__main__":
    sys.exit(main())

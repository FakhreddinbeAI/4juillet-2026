#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les 40 depots du 12/10/2026 : historique + nom de depot dans chaque note.

POURQUOI CE SCRIPT
Apres avoir passe 42 pieces a DEPOSEE, coherence.py a crie « MARQUEE DEPOSEE
SANS PREUVE : 42 ». Il avait raison : l historique local est arrete au
09/10/2026, les depots du jour n y sont pas, et le controle refuse de me croire
sur parole. C est exactement le garde-fou qu on avait pose apres le 06/10, ou
j avais pris l absence d une piece dans un historique perime pour une preuve de
non-depot. On ne desactive pas le controle : on lui donne la donnee.

PROVENANCE DE CES 40 LIGNES — A NE PAS CONFONDRE AVEC UN EXPORT
Elles ne viennent PAS d un export du portail. Elles viennent d une relecture du
portail faite dans Chrome le 12/10/2026, qui a rapporte le nom exact affiche
pour chaque depot. C est pour cela qu elles portent toutes le statut « En cours
de traitement » et la date 2026-10-12 : le format « nom | statut | date » du
fichier sert ici a dater la source. Au prochain vrai export, ces lignes seront
remplacees par les lignes officielles.

POURQUOI ON INSCRIT AUSSI LE NOM DU DEPOT DANS LA NOTE
Le controle cherche la reference de la piece DANS le nom du depot, ou a defaut
un nom de depot cite dans la note. Or sept des quarante depots portent un nom
qui ne contient pas la reference :
  266020689680  ->  « cotisations ordinales 2026.pdf »
  9060082089    ->  « Straumann 98 34.pdf »
  9060128654    ->  « invoice 0982494040.pdf »
  20240346      ->  « ntj septembre 2029.pdf »   (annee fausse dans le nom)
  35684         ->  « id 35684 MIL.pdf »
  7904376-52    ->  « macsf assurance 2026 2027.pdf »
  8570332       ->  « FAK18 ... ARCADE.pdf »
Sans le nom dans la note, ces pieces resteront introuvables par numero pour
toujours. C est la raison d etre de la regle « rapporte quel nom de fichier
correspond a quel numero » du prompt de depot.

UNE CONFIRMATION AU PASSAGE
Le depot de la facture 9060128654 s appelle « invoice 0982494040.pdf ». 982494040
est sa « Ref. PDF » dans la feuille de suivi Straumann. La regle posee le 09/10
tient donc une fois de plus : cette colonne est l identifiant interne du
document chez Straumann, et le portail nomme ses fichiers « 0<identifiant> ».
C est la douzieme concordance.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
HIST = "historique_portail.txt"
STATUT = "En cours de traitement"
JOUR = "2026-10-12"

# reference au registre -> nom EXACT affiche par le portail apres depot
NOMS = {
    "90049585":       "2026 06 25 SEPTODONT FACTURE 359 02 90049585.pdf",
    "90056020":       "2026 07 28 SEPTODONT FACTURE 383 63 90056020.pdf",
    "90056093":       "2026 07 28 SEPTODONT FACTURE 364 73 90056093.pdf",
    "90060529":       "2026 09 03 SEPTODONT FACTURE 15 40 90060529.pdf",
    "1034064":        "2026 09 11 SEPTODONT RELANCE 763 76 1034064.pdf",
    "90041207":       "Facture 90041207.pdf",
    "24516832":       "FACTURE 24516832.pdf",
    "24517077":       "FACTURE 24517077.pdf",
    "24517520":       "FACTURE 24517520.pdf",
    "BIOF2607056018": "BIOF2607056018.pdf",
    "BIOF2607056019": "BIOF2607056019.pdf",
    "2402386339":     "2402386339.pdf",
    "2402391923":     "2402391923.pdf",
    "2402331992":     "2402331992 GACD 28.pdf",
    "retour-cheque":  "2026 04 01 ORMCO AR 19 20 retour cheque.pdf",
    "331172674":      "ORMCO 331172674 V1.pdf",
    "331173068":      "ORMCO 331173068 V1.pdf",
    "331173646":      "ORMCO 331173646 04 2026 V1.pdf",
    "18719136":       "FAK18 12 205622 18719136 8570332 20260512 082012456ARCADE.pdf",
    "C012667":        "2026 02 18 ROTEC RELANCE 1004 50 C012667.pdf",
    "5123110":        "Facture client 5123110 01 08 2026.pdf",
    "R-2602.52453":   "2026 02 13 ZFX FACTURE 253 99 R 2602 52453.pdf",
    "9060079433":     "2026 04 14 STRAUMANN FACTURE 73 14 9060079433.pdf",
    "9060082089":     "Straumann 98 34.pdf",
    "9060084270":     "Straumann 9060084270 73 14.pdf",
    "9060128654":     "invoice 0982494040.pdf",
    "35684":          "id 35684 MIL.pdf",
    "36409":          "id 36409.pdf",
    "20240346":       "ntj septembre 2029.pdf",
    "ARG12031":       "2026 04 01 argoat facture 45 00 arg12031 p2026 03 01 au 2026 03 31.pdf",
    "ARG13312":       "2026 07 01 argoat facture 32 00 arg13312 p2026 06 01 au 2026 06 30.pdf",
    "ARG13747":       "2026 07 31 argoat facture 45 00 arg13747 p2026 07 01 au 2026 07 31.pdf",
    "LOT466":         "2026 06 15 cpam vendee relance 96 75 lot466.pdf",
    "2606534061":     "2026 08 06 cpam vendee indu 96 75 2606534061.pdf",
    "527258240324":   "2026 08 07 urssaf affiliation 527258240324.pdf",
    "26009":          "2026 09 30 bnp 2112 releve 26009.pdf",
    "266020689680":   "cotisations ordinales 2026.pdf",
    "262785280708":   "2026 07 23 oncd relance 462 00 262785280708.pdf",
    "7904376-52":     "macsf assurance 2026 2027.pdf",
    "compte-226502":  "2026 10 05 henry schein relance 1071 75 compte 226502.pdf",
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
    # --- 1. l historique -----------------------------------------------------
    brut = io.open(HIST, encoding="utf-8").read()
    if not brut.endswith("\n"):
        raise SystemExit(
            "%s ne finit pas par un retour a la ligne : un ajout souderait "
            "deux noms. C est l erreur du 06/10, on s arrete." % HIST)
    avant = len(brut.splitlines())
    deja = set(l.split("|")[0].strip() for l in brut.splitlines() if l.strip())

    ajouts = []
    for ref, nom in sorted(NOMS.items()):
        if nom in deja:
            print("  deja dans l historique, non reajoute : %s" % nom)
            continue
        ajouts.append("%s | %s | %s" % (nom, STATUT, JOUR))

    io.open(HIST, "a", encoding="utf-8", newline="\n").write(
        "\n".join(ajouts) + "\n")

    apres_brut = io.open(HIST, encoding="utf-8").read()
    apres = len(apres_brut.splitlines())
    if apres != avant + len(ajouts):
        raise SystemExit("historique : %d lignes attendues, %d trouvees."
                         % (avant + len(ajouts), apres))
    # aucun nom n a ete soude : chaque nom ajoute doit se retrouver seul
    noms_apres = [l.split("|")[0].strip() for l in apres_brut.splitlines()]
    for nom in NOMS.values():
        if noms_apres.count(nom) < 1:
            raise SystemExit("nom introuvable apres ajout : %s" % nom)

    # --- 2. le nom du depot dans chaque note ---------------------------------
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

    touche = {}
    muets = []
    for ref, nom in NOMS.items():
        c = par_ref.get(ref, [])
        if len(c) != 1:
            raise SystemExit("%s : %d ligne(s), attendu 1." % (ref, len(c)))
        n, r = c[0]
        porte = ref.replace("-", "").replace(".", "").lower() in \
            nom.replace(" ", "").replace("-", "").replace(".", "").lower()
        bout = (" NOM DU DEPOT AU PORTAIL : « %s ». Releve sur le portail le "
                "12/10/2026." % nom)
        if not porte:
            bout += (" ATTENTION, CE NOM NE CONTIENT PAS LA REFERENCE %s : une "
                     "recherche par numero au portail ne retrouvera JAMAIS "
                     "cette piece. La chercher par ce nom, ou par fournisseur "
                     "+ date + montant." % ref)
            muets.append((ref, nom))
        r[i["note"]] = (r[i["note"]].rstrip() + bout).replace(";", " -")
        touche[n] = r

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

    print()
    print("historique : %d -> %d lignes (+%d)" % (avant, apres, len(ajouts)))
    print("registre   : %d notes completees du nom de depot" % len(touche))
    print()
    print("%d depots dont le NOM NE PORTE PAS la reference :" % len(muets))
    for ref, nom in sorted(muets):
        print("  %-14s %s" % (ref, nom))
    return 0


if __name__ == "__main__":
    sys.exit(main())

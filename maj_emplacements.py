#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Emplacements du registre apres le rangement du Drive du 09/10/2026.

CE QUI A ETE RANGE
Les 75 fichiers poses a plat a la racine de « 3 - DEPOSEES TGS » sont partis
dans ses sous-dossiers annee puis mois. Verifie par mes propres lectures du
Drive, pas sur parole :
  racine            0 fichier, seuls les deux dossiers 2025 et 2026 restent
  2026 / 01         4    2026 / 02    8    2026 / 03    4
  2026 / 04         2    2026 / 05    2
  2026 / 10, 11, 12 vides, comme prevu
Chaque prefixe de nom correspond a son dossier : aucun fichier mal classe.

LE PIEGE EVITE
Deux pieces ont une date_piece en janvier 2026 mais un FICHIER date de
decembre 2025, parce que leur periode couvre 2026 :
  COFICA     750004695244     fichier « 2025-12-24_... »
  MUTUALEASE 020-FL-31694851  fichier « 2025-12-15_... »
Le rangement suit la DATE DU FICHIER. Elles sont donc dans « 2025 », pas dans
« 2026 / 01 - Janvier ». Deduire le dossier de la date_piece aurait ecrit deux
emplacements faux. On lit, on ne deduit pas. Verifie par une recherche dans le
dossier 2025, les trois fichiers y sont.

CE QUE LE RANGEMENT A REVELE
Sept pieces marquees DEPOSEE portaient l emplacement « 3 - DEPOSEES TGS ou
Reglements Mai » — je ne savais pas laquelle des deux. Aucune n avait de
fichier a la racine de l etape 3 : elles sont TOUTES dans « Reglements Mai »,
chez Lucie. Verifie fichier par fichier dans ce dossier.
C est un ecart au mode d emploi, qui veut qu une piece deposee descende dans
l etape 3. On ne le corrige pas ici : deplacer un fichier du drive partage
m est refuse, et ce dossier est celui de Lucie.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
BASE = "Drive partage > 3 - DEPOSEES TGS"
LUCIE = ("Drive partage > Lisa - Lucie : factures a regler > "
         "Reglements Mai : Factures de 03 a 2026")

RANGE = ("RANGE LE 09/10/2026 : le fichier etait a plat a la racine de "
         "l etape 3, il est maintenant dans %s. Verifie par lecture du Drive, "
         "dossier par dossier.")

DATE_FICHIER = (" ATTENTION : la date_piece de cette ligne est en 2026 mais le "
                "FICHIER est nomme %s, donc de l exercice 2025. Le rangement "
                "suit la date du fichier, pas la date de la piece : il est "
                "dans « 2025 » et non dans un mois de 2026. Ne pas le chercher "
                "ailleurs.")

CHEZ_LUCIE = (" EMPLACEMENT TRANCHE LE 09/10/2026 : la note disait « 3 - "
              "DEPOSEES TGS ou Reglements Mai », sans savoir laquelle. Le "
              "rangement a leve le doute — aucun fichier de cette piece n etait "
              "a la racine de l etape 3. Le fichier est dans « Reglements Mai », "
              "chez Lucie. ECART AU MODE D EMPLOI : une piece deposee devrait "
              "descendre dans l etape 3. Non corrige, car deplacer un fichier "
              "du drive partage m est refuse et ce dossier est celui de Lucie.")

# reference -> (sous-dossier, remarque eventuelle)
DANS_ETAPE_3 = {
    "24514532":        ("2026 > 01 - Janvier",  None),
    "24514784":        ("2026 > 01 - Janvier",  None),
    "34755":           ("2026 > 01 - Janvier",  None),
    "2402261254":      ("2026 > 01 - Janvier",  None),
    "34968":           ("2026 > 02 - Fevrier",  " Deux fichiers y sont : "
                        "l original et sa copie marquee _DOUBLON."),
    "FR156786":        ("2026 > 02 - Fevrier",  None),
    "2402275693":      ("2026 > 02 - Fevrier",  None),
    "750004695244":    ("2025", DATE_FICHIER % "2025-12-24"),
    "020-FL-31694851": ("2025", (DATE_FICHIER % "2025-12-15")
                        + " Deux fichiers y sont : l original et sa copie "
                        "marquee _DOUBLON."),
    "90005673":        ("2025", None),
}

# pieces dont le fichier est en realite chez Lucie, pas dans l etape 3
CHEZ_LUCIE_REFS = ["2402298317", "2402302237", "2402323175", "2402328280",
                   "2402336462", "8570251", "90021319"]


def charger(chemin):
    """Les commentaires sont INTERCALES dans les donnees. On garde chaque ligne
    a sa place et on ne reecrit que les lignes de donnees modifiees."""
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


def sans_pv(txt):
    return txt.replace(";", " -")


def main():
    lignes, index = charger(FIC)
    h = index[0][1]
    iref, iempl, inote = (h.index("reference"), h.index("emplacement"),
                          h.index("note"))
    ifour = h.index("fournisseur")

    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d : %d champs au lieu de %d. Rien n a ete "
                             "ecrit." % (n + 1, len(r), len(h)))

    par_ref = {}
    for n, r in index[1:]:
        ref = r[iref].strip()
        if ref:
            par_ref.setdefault(ref, []).append((n, r))

    journal, touche = [], {}

    # 1. les pieces rangees dans l etape 3
    for ref, (dossier, remarque) in DANS_ETAPE_3.items():
        cibles = par_ref.get(ref, [])
        if len(cibles) != 1:
            raise SystemExit("reference %s : %d ligne(s) au registre, attendu "
                             "1. Rien n a ete ecrit." % (ref, len(cibles)))
        n, r = cibles[0]
        chemin = BASE + " > " + dossier
        r[iempl] = chemin
        r[inote] = sans_pv(r[inote].rstrip() + " " + (RANGE % chemin)
                           + (remarque or ""))
        touche[n] = r
        journal.append("  %-16s %-14s -> %s" % (r[ifour], ref, dossier))

    # 2. les pieces dont le fichier est chez Lucie
    for ref in CHEZ_LUCIE_REFS:
        cibles = par_ref.get(ref, [])
        if len(cibles) != 1:
            raise SystemExit("reference %s : %d ligne(s) au registre, attendu "
                             "1. Rien n a ete ecrit." % (ref, len(cibles)))
        n, r = cibles[0]
        if "3 - DEPOSEES TGS" not in r[iempl]:
            journal.append("  %-16s %-14s deja sans ambiguite, laissee"
                           % (r[ifour], ref))
            continue
        r[iempl] = LUCIE
        r[inote] = sans_pv(r[inote].rstrip() + CHEZ_LUCIE)
        touche[n] = r
        journal.append("  %-16s %-14s -> chez Lucie (Reglements Mai)"
                       % (r[ifour], ref))

    for n, r in touche.items():
        lignes[n] = serialiser(r)

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    # relecture : plus aucune ligne ne doit dire « ou Reglements Mai »,
    # ni « (racine) » pour l etape 3
    _, verif = charger(FIC)
    hv = verif[0][1]
    for n, r in verif[1:]:
        if len(r) != len(hv):
            raise SystemExit("relecture : ligne %d a %d champs au lieu de %d."
                             % (n + 1, len(r), len(hv)))
    flous = [r[hv.index("reference")] for _, r in verif[1:]
             if len(r) == len(hv)
             and ("3 - DEPOSEES TGS ou" in r[hv.index("emplacement")]
                  or "3 - DEPOSEES TGS (racine)" in r[hv.index("emplacement")])]
    if flous:
        raise SystemExit("relecture : %d emplacement(s) encore flou(s) : %s"
                         % (len(flous), flous))

    print("\n".join(journal))
    print()
    print("%d ligne(s) mise(s) a jour, %d piece(s) au registre."
          % (len(touche), len(verif) - 1))
    print("Plus aucun emplacement « (racine) » ni « ou Reglements Mai ».")
    return 0


if __name__ == "__main__":
    sys.exit(main())

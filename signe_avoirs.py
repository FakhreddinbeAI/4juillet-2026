#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Un avoir porte un montant NEGATIF. Correction du 09/10/2026.

LE DEFAUT
En ajoutant les neuf avoirs Straumann de la feuille de suivi, je les ai
stockes en montant POSITIF. La vue annoncait alors 44 287,90 EUR « a
localiser » alors que 7 337,36 EUR de ce total sont des avoirs, qui
DIMINUENT la charge au lieu de l augmenter. L erreur vaut deux fois le
montant des avoirs, soit 14 674,72 EUR.

POURQUOI LE REGISTRE N AVAIT PAS DE CONVENTION
Avant aujourd hui le registre comptait UN SEUL avoir, le 9060136144 a
+88,80, stocke positif. Et deux documents ARCADE a montant negatif
(-123,99 et -110,00) typés FACTURE. Aucune regle, donc, et la somme de la
colonne ne voulait rien dire des que des avoirs entraient.

LA CONVENTION RETENUE
La colonne montant porte le SIGNE COMPTABLE du document. Un avoir reduit la
charge, il est donc negatif. C est ce que fait la feuille Straumann
(-611,45), c est ce que font deja les deux lignes ARCADE, et c est la seule
convention sous laquelle additionner la colonne a un sens.

CE QUE CE SCRIPT FAIT
Il passe en negatif tout montant d une ligne de type AVOIR qui ne l est pas
deja, y compris le 9060136144 preexistant. Il ne touche a rien d autre : les
deux lignes ARCADE sont typees FACTURE et gardent leur signe, qui est deja
le bon.
"""

import csv
import io
import sys

FIC = "registre_2026.csv"
NOTE = (" SIGNE CORRIGE LE 09/10/2026 par signe_avoirs.py : le montant etait "
        "stocke positif. Un avoir porte un montant NEGATIF, car il reduit la "
        "charge. Stocke positif, il la doublait dans tous les totaux.")


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
    ityp, imt, inote = h.index("type"), h.index("montant"), h.index("note")
    iref, ifour = h.index("reference"), h.index("fournisseur")

    corriges, deja = [], []
    for n, r in index[1:]:
        if len(r) != len(h):
            raise SystemExit("ligne %d : %d champs au lieu de %d. Rien n a ete "
                             "ecrit." % (n + 1, len(r), len(h)))
        if r[ityp] != "AVOIR":
            continue
        mt = r[imt].strip()
        if not mt:
            continue
        if mt.startswith("-"):
            deja.append((r[ifour], r[iref], mt))
            continue
        try:
            v = float(mt)
        except ValueError:
            raise SystemExit("AVOIR %s : montant « %s » illisible. Rien n a "
                             "ete ecrit." % (r[iref], mt))
        if v == 0:
            continue
        r[imt] = "%.2f" % (-v)
        r[inote] = (r[inote].rstrip() + NOTE).replace(";", " -")
        lignes[n] = serialiser(r)
        corriges.append((r[ifour], r[iref], mt, r[imt]))

    if not corriges:
        print("Aucun avoir a corriger.")
        return 0

    io.open(FIC, "w", encoding="utf-8", newline="\n").write(
        "\n".join(lignes) + "\n")

    # relecture : aucun avoir ne doit plus etre positif
    _, verif = charger(FIC)
    hv = verif[0][1]
    restants = [r[hv.index("reference")] for _, r in verif[1:]
                if len(r) == len(hv) and r[hv.index("type")] == "AVOIR"
                and r[hv.index("montant")].strip()
                and not r[hv.index("montant")].startswith("-")
                and float(r[hv.index("montant")]) != 0]
    if restants:
        raise SystemExit("relecture : %d avoir(s) encore positif(s) : %s"
                         % (len(restants), restants))

    for four, ref, avant, apres in corriges:
        print("  %-12s %-12s %10s -> %10s" % (four, ref, avant, apres))
    if deja:
        print("  (%d avoir(s) deja negatif(s), laisse(s) tel(s) quel(s))"
              % len(deja))
    somme = sum(float(a) for _, _, _, a in corriges)
    print()
    print("%d avoir(s) corrige(s), %.2f EUR desormais en diminution de charge."
          % (len(corriges), somme))
    print("L erreur dans les totaux valait %.2f EUR." % (-2 * somme))
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Index de ce que TGS DETIENT DEJA, construit sur l historique du portail.

POURQUOI CE FICHIER EXISTE. Trois fois le 6 octobre j ai annonce des pieces
manquantes qui etaient deja deposees : Ormco, Straumann, Rotec, NTJ, puis les
trois tableaux d amortissement des prets. Chaque fois la meme faute — j ai
lu le registre et pris son silence pour une absence, alors que le registre
n est qu une vue partielle et que c est l historique des depots qui fait foi.
Le mode d emploi du drive le dit, et je l ai oublie trois fois.

Donc : avant d ecrire qu une piece manque, on la cherche ICI.

LA METHODE. On ne compare pas des noms de fichiers — ils sont ecrits a la
main, avec des espaces a la place des tirets, des majuscules au hasard et
des numeros coupes (« 1144 05 » pour la facture 114405). On indexe donc les
CHIFFRES : pour chaque nom deposee, toutes les suites de 4 chiffres et plus,
espaces retires. Une reference du registre est jugee presente si sa suite de
chiffres se retrouve dans un nom depose.
"""

import re
import sys
import unicodedata
from collections import defaultdict


def plat(s):
    """minuscules, sans accents — pour la recherche par mot."""
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()


def chiffres_de(nom):
    """
    Toutes les suites de chiffres >= 4 d un nom, ET la concatenation des
    groupes separes par des espaces : « 1144 05 » doit matcher « 114405 ».
    """
    base = re.sub(r"\.pdf$|\.xlsx$|\.jpg$|\.png$", "", plat(nom))
    sortie = set()
    for bloc in re.findall(r"[\d ]{4,}", base):
        colle = bloc.replace(" ", "")
        if len(colle) >= 4:
            sortie.add(colle)
        for g in re.findall(r"\d{4,}", bloc):
            sortie.add(g)
    return sortie


def charger(chemin):
    """Noms deposes. Accepte « nom | statut | date » comme « nom » seul."""
    depots = []
    for l in open(chemin, encoding="utf-8"):
        l = l.strip()
        if not l:
            continue
        p = [x.strip() for x in l.split("|")]
        depots.append({"nom": p[0],
                       "statut": p[1] if len(p) > 1 else "",
                       "date": p[2] if len(p) > 2 else ""})
    return depots


def construire(fichiers):
    """nom -> depot, et suite-de-chiffres -> [noms]."""
    tous, par_chiffres = {}, defaultdict(list)
    for f in fichiers:
        for d in charger(f):
            n = d["nom"]
            # un meme nom peut apparaitre dans les deux listes : on garde
            # celui qui porte un statut, il est plus informatif.
            if n in tous and not d["statut"]:
                continue
            tous[n] = d
    for n in tous:
        for c in chiffres_de(n):
            par_chiffres[c].append(n)
    return tous, par_chiffres


def cherche(ref, tous, par_chiffres):
    """
    Les depots qui portent cette reference. Rend [] si la reference est trop
    courte pour prouver quoi que ce soit — mieux vaut ne rien dire que dire
    faux (c est la DLL renommee pour « A167 » qui m a appris ca).
    """
    c = re.sub(r"\D", "", ref)
    if len(c) < 4:
        return []
    # Une reference reduite a une annee ne prouve rien : « QP-2025 » tombait
    # sur « 2025 12 31 BNP 2112 RELEVE 25012.pdf » et je declarais la
    # quote-part SCM de 120 314,80 EUR deja deposee. Quatre chiffres qui
    # forment une annee plausible sont donc refuses.
    if len(c) == 4 and re.match(r"(19|20)\d\d$", c):
        return []
    if c in par_chiffres:
        return par_chiffres[c]
    # reference tronquee a la saisie : on accepte qu elle soit un prefixe ou
    # un suffixe d une suite plus longue, a partir de 6 chiffres.
    if len(c) >= 6:
        return [n for k, noms in par_chiffres.items()
                for n in noms if k.startswith(c) or k.endswith(c)]
    return []


def main(args):
    fichiers = [a for a in args if not a.startswith("-")]
    if not fichiers:
        print(__doc__)
        return 1
    tous, par_chiffres = construire(fichiers)
    print("%d depots indexes, %d references chiffrees distinctes.\n"
          % (len(tous), len(par_chiffres)))
    refs = [a[1:] for a in args if a.startswith("-")]
    for r in refs:
        t = cherche(r, tous, par_chiffres)
        if t:
            print("  %-18s DEJA DEPOSE : %s" % (r, t[0]))
            for n in t[1:4]:
                print("  %-18s              %s" % ("", n))
        else:
            print("  %-18s absent de l historique" % r)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

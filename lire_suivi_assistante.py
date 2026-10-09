#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
lire_suivi_assistante.py  —  depouille le classeur « Compta - suivi mensuel »
tenu par assistante@implantologielege.com, et le compare au registre.

POURQUOI CET OUTIL
Ce classeur a ete trouve le 09/10/2026, apres des jours passes a reconstituer
les montants en ouvrant les PDF un par un. Il contient, pour chaque facture :
le numero, la date, le montant, le mode de reglement, la date de reglement et
une colonne qui dit si la piece est bonne pour l envoi a TGS. C est la source
la plus riche du dossier et elle etait sous notre nez.

CE QU IL NE FAUT PAS EN FAIRE
Ce n est PAS une source qui fait foi. C est une saisie manuelle, et le
depouillement du 09/10/2026 y a releve des dates fausses (« 31/06/2026 »,
« 28/022026 », « 13/03/0206 »), des numeros douteux (« 5101378 » pour 5110778,
« 4 » pour une facture ROTEC) et une ligne Straumann portant deux fois le meme
numero pour deux echeances. On s en sert pour TROUVER et pour RECOUPER, jamais
pour affirmer seul. Un montant qui vient d ici et de nulle part ailleurs est
marque comme tel dans le registre.

STRUCTURE DU CLASSEUR
Chaque onglet est un mois. Un nom de fournisseur en colonne A ouvre un bloc ;
les lignes suivantes portent date / montant / numero en B / C / D. La colonne A
sert AUSSI a noter le total du bloc, d ou la necessite de distinguer un nom d un
nombre. Les colonnes suivantes changent de sens d un onglet a l autre :
« Mode de rgmt », « Date », « Envoi TGS », « OK POUR ENVOI TGS », « Date de
Reglement ». On les lit donc par leur en-tete, jamais par leur position.
"""
import csv
import os
import re
import sys
import unicodedata
from collections import defaultdict

FOURNISSEURS = [
    "MADE IN LABS", "ARGOAT", "NTJ", "BONGERT", "STRAUMANN", "ROTEC", "GACD",
    "BIOTECH", "EXECOM", "ORMCO", "SEPTODONT", "HENRY SCHEIN", "ONCD",
    "OSSEO SHOP", "BREDENT", "NEOHM", "COFICA", "MUTUALEASE", "ARIES",
    "MEDIFORCE", "ANTHROPIC", "GOOGLE", "ICARE", "LIXXBAIL",
    # LE 09/10/2026 : ces cinq manquaient, et leur absence FAUSSAIT
    # L ATTRIBUTION. Un bloc dont l en-tete n est pas reconnu n ouvre pas de
    # nouveau fournisseur : ses lignes restent rattachees au bloc precedent.
    # Les pieces d Arcade Dentaire — numeros 8569392, 18719136, 8570251... —
    # etaient donc comptees en Straumann, ce qui gonflait Straumann de pres de
    # 800 EUR et faisait disparaitre Arcade du rapport.
    # « NEHOM » est l orthographe du classeur pour NEOHM.
    "ARCADE", "ZIMVIE", "PHARMACIE", "DGFP", "NEHOM",
]

# Libelles de la colonne A qui NE SONT PAS des fournisseurs. Ils ne doivent ni
# ouvrir un bloc ni faire perdre le fournisseur courant.
#   « Nème échéance » : une echeance de la facture du bloc en cours. C est ainsi
#   que la facture Straumann 9060109581 apparait QUATRE fois a 4 463,13 EUR —
#   ce ne sont pas quatre factures, c est un echeancier.
PAS_UN_FOURNISSEUR = re.compile(
    r"^\s*(\d+\s*[eè]?m?e?\s*[ée]ch[ée]ance"
    r"|total|autres|compte\s*\d+"
    r"|.*\b[àa]\s+r[èe]gler\b.*"
    r"|r[èe]glement\s+d[ée]but.*"
    r"|fournisseurs?|colonne\s*\d+)\s*$", re.I)


def sansacc(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "")
                   if unicodedata.category(c) != "Mn")


def norm(s):
    return re.sub(r"[^0-9a-z]", "", sansacc(s or "").lower())


def est_fournisseur(cell):
    """Un nom de fournisseur, et pas un total ni un libelle de bloc."""
    z = norm(cell)
    if not z or z.isdigit():
        return None
    if PAS_UN_FOURNISSEUR.match(sansacc(cell or "").strip()):
        return None
    for f in FOURNISSEURS:
        if norm(f) in z or z in norm(f):
            return f
    return None


def est_echeance(cell):
    """« 3ème échéance » : une echeance, pas une facture de plus."""
    return bool(re.match(r"^\s*\d+\s*[eè]?m?e?\s*[ée]ch[ée]ance\s*$",
                         sansacc(cell or "").strip(), re.I))


def montant(cell):
    """« 1 705,24 » -> 1705.24. Rend None si ce n est pas un montant."""
    t = (cell or "").replace(" ", "").replace("\xa0", "").replace(" ", "")
    t = t.replace("€", "").replace(",", ".")
    if not re.fullmatch(r"-?\d+(\.\d+)?", t or ""):
        return None
    return float(t)


def reference(cell):
    t = re.sub(r"\s+", "", cell or "")
    # un numero de facture fait au moins 4 caracteres et contient un chiffre.
    # « 4 » tout seul, qu on trouve sur une ligne ROTEC, n en est pas un.
    if len(t) < 4 or not re.search(r"\d", t):
        return ""
    return t


def date_fr(cell):
    """Rend la date telle quelle, et dit si elle est aberrante."""
    t = (cell or "").strip()
    m = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})", t)
    if not m:
        return t, bool(t)
    j, mo, a = int(m.group(1)), int(m.group(2)), m.group(3)
    mauvais = not (1 <= j <= 31 and 1 <= mo <= 12) or len(a) == 3
    return t, mauvais


def lire_onglet(chemin):
    lignes = list(csv.reader(open(chemin, encoding="utf-8"), delimiter=";"))
    # on repere la ligne d en-tete pour savoir ce que disent les colonnes E a H
    entetes, i_ent = {}, None
    for i, l in enumerate(lignes[:12]):
        if any(norm(c) == "numerofacture" for c in l):
            i_ent = i
            for j, c in enumerate(l):
                if norm(c):
                    entetes[j] = c.strip()
            break
    pieces, courant = [], None
    for l in lignes[(i_ent + 1) if i_ent is not None else 0:]:
        if not any(c.strip() for c in l):
            continue
        a = l[0] if l else ""
        f = est_fournisseur(a)
        if f:
            courant = f
        d, d_mauvaise = date_fr(l[1] if len(l) > 1 else "")
        mt = montant(l[2] if len(l) > 2 else "")
        ref = reference(l[3] if len(l) > 3 else "")
        if mt is None and not ref:
            continue
        extra = {}
        for j in range(4, min(len(l), 9)):
            if l[j].strip() and j in entetes:
                extra[entetes[j]] = l[j].strip()
            elif l[j].strip():
                extra["col%d" % j] = l[j].strip()
        pieces.append({"fournisseur": courant or "?", "date": d,
                       "date_mauvaise": d_mauvaise, "montant": mt,
                       "reference": ref, "extra": extra,
                       "echeance": est_echeance(a),
                       "onglet": os.path.basename(chemin)})
    return pieces


def main(dossier, registre):
    fichiers = sorted(f for f in os.listdir(dossier)
                      if f.startswith("onglet_") and f.endswith(".csv"))
    toutes = []
    for f in fichiers:
        p = lire_onglet(os.path.join(dossier, f))
        toutes.extend(p)
        print("  %-34s %3d pieces" % (f[7:-4], len(p)))
    print("\n%d lignes de facture au total dans le classeur\n" % len(toutes))

    reg = [r for r in csv.DictReader(
        (l for l in open(registre, encoding="utf-8") if not l.startswith("#")),
        delimiter=";")]
    par_ref = {}
    for r in reg:
        k = norm(r.get("reference"))
        if len(k) >= 4:
            par_ref.setdefault(k, []).append(r)

    absentes, concordent, divergent, sans_ref = [], [], [], []
    for p in toutes:
        k = norm(p["reference"])
        if not k:
            sans_ref.append(p)
            continue
        if k not in par_ref:
            absentes.append(p)
            continue
        r = par_ref[k][0]
        mr = montant(r.get("montant"))
        if p["montant"] is None or mr is None:
            concordent.append((p, r))
        elif abs(p["montant"] - mr) < 0.005:
            concordent.append((p, r))
        else:
            divergent.append((p, r))

    print("=" * 72)
    print("MONTANTS QUI DIVERGENT ENTRE LE CLASSEUR ET LE REGISTRE : %d"
          % len(divergent))
    print("=" * 72)
    for p, r in sorted(divergent, key=lambda x: -abs(
            (x[0]["montant"] or 0) - (montant(x[1].get("montant")) or 0))):
        print("  %-14s %-16s classeur %10.2f   registre %10.2f   ecart %9.2f"
              % (p["fournisseur"][:14], p["reference"][:16], p["montant"],
                 montant(r.get("montant")), p["montant"]
                 - montant(r.get("montant"))))
        print("        onglet %s, cycle du registre : %s"
              % (p["onglet"][7:-4], (r.get("cycle") or "").strip()))

    print()
    print("=" * 72)
    print("DANS LE CLASSEUR, ABSENTES DU REGISTRE : %d" % len(absentes))
    print("=" * 72)
    par_f = defaultdict(list)
    for p in absentes:
        par_f[p["fournisseur"]].append(p)
    total2026 = 0.0
    for f in sorted(par_f):
        print("\n  --- %s ---" % f)
        for p in sorted(par_f[f], key=lambda x: x["date"]):
            d2026 = "2026" in p["date"]
            if d2026 and p["montant"]:
                total2026 += p["montant"]
            print("    %-11s %10s  %-16s %s%s"
                  % (p["date"] or "(sans date)",
                     ("%.2f" % p["montant"]) if p["montant"] is not None else "?",
                     p["reference"][:16],
                     p["onglet"][7:-4],
                     "   DATE ABERRANTE" if p["date_mauvaise"] else ""))
            if p["extra"]:
                print("           %s" % "  ".join(
                    "%s=%s" % (k[:18], v[:28]) for k, v in p["extra"].items()))
    print("\n  total des lignes datees 2026 et absentes du registre : %.2f EUR"
          % total2026)

    print()
    print("=" * 72)
    print("LIGNES DU CLASSEUR SANS NUMERO DE FACTURE : %d" % len(sans_ref))
    print("=" * 72)
    for p in sans_ref:
        print("  %-14s %-11s %10s   %s%s"
              % (p["fournisseur"][:14], p["date"] or "(sans date)",
                 ("%.2f" % p["montant"]) if p["montant"] is not None else "?",
                 p["onglet"][7:-4],
                 "   DATE ABERRANTE" if p["date_mauvaise"] else ""))

    print()
    print("concordent : %d    divergent : %d    absentes du registre : %d"
          "    sans numero : %d"
          % (len(concordent), len(divergent), len(absentes), len(sans_ref)))
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

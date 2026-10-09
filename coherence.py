#!/usr/bin/env python3
"""
Controle de coherence du dossier. Cherche MES erreurs, pas celles du Dr.

POURQUOI CE FICHIER. Le 6 octobre 2026 j ai accumule les fautes : des pieces
annoncees manquantes qui etaient deposees, un controle affirme sans etre fait,
des colonnes de Sheet devinees, des montants faux, des abonnements reclames
alors qu ils etaient resilies. Toutes avaient un point commun : rien ne les
contredisait automatiquement.

Ce script les contredit. Il ne raconte rien, il compare des sources :
  registre_2026.csv        ce que je crois
  historique_portail*.txt  ce que TGS a recu (fait foi)
  lcl_2026.csv             ce que la banque a paye (fait foi)

Toute divergence est une erreur a corriger, la mienne le plus souvent.
Sortie vide = dossier coherent. C est le seul resultat acceptable.
"""

import csv
import io
import os
import re
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from index_portail import cherche, construire


def norm(s):
    """Reduit a l essentiel comparable : minuscules, chiffres et lettres.
    Le portail remplace les ponctuations par des espaces, donc « FRIN25-01 »
    y devient « FRIN25 01 » : sans cette reduction, rien ne se rattache."""
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def pieces(chemin):
    brut = [l for l in io.open(chemin, encoding="utf-8")
            if l.strip() and not l.startswith("#")]
    return list(csv.DictReader(brut, delimiter=";"))


def debits(chemin):
    d = defaultdict(list)
    for x in csv.DictReader(io.open(chemin, encoding="utf-8"), delimiter=";"):
        if x.get("debit"):
            d[round(float(x["debit"]), 2)].append(x)
    return d


def main(reg, lcl, *hist):
    P = pieces(reg)
    tous, par_chiffres = construire(list(hist))
    D = debits(lcl)
    pbs = []

    def pb(cat, p, quoi):
        pbs.append((cat, "%s %s" % (p.get("fournisseur", "?"),
                                    p.get("reference") or "(sans ref)"), quoi))

    # 1. etat et presence au portail doivent concorder
    for p in P:
        ref = (p.get("reference") or "").strip()
        au_portail = bool(ref) and bool(cherche(ref, tous, par_chiffres))
        etat = (p.get("etat") or "").strip().upper()
        cycle = (p.get("cycle") or "").strip().upper()
        if au_portail and etat not in ("DEPOSEE", "HORS PERIMETRE", "A_VENIR"):
            pb("AU PORTAIL MAIS PAS MARQUEE DEPOSEE", p,
               "etat=%s, trouvee comme '%s'"
               % (etat, cherche(ref, tous, par_chiffres)[0][:46]))
        if etat == "DEPOSEE" and ref and not au_portail:
            # Acceptable SI la note nomme le depot et que ce nom existe.
            cites = re.findall(r"'([^']{6,90})'", p.get("note") or "")
            atteste = [c for c in cites
                       if any(c.lower() in n.lower() for n in tous)]
            if not atteste:
                pb("MARQUEE DEPOSEE SANS PREUVE", p,
                   "ni le numero ni un nom de depot cite dans la note ne se "
                   "retrouvent dans l historique"
                   + (" (noms cites : %s)" % "; ".join(c[:40] for c in cites)
                      if cites else " (aucun nom cite)"))
        if cycle == "ENVOYE_TGS" and etat not in ("DEPOSEE", "HORS PERIMETRE",
                                                  "A_VENIR") and not au_portail:
            pb("CYCLE ET ETAT EN DESACCORD", p, "cycle=ENVOYE_TGS, etat=%s" % etat)
        # Une piece sortie du perimetre ou pas encore emise ne doit pas
        # reapparaitre dans le circuit : sans ce test, les trois pieces de
        # decembre 2025 restaient marquees PAYE parce que leur debit figure
        # au releve.
        if etat in ("HORS PERIMETRE", "A_VENIR", "SANS OBJET") and cycle in (
                "PAYE", "A_PAYER", "A_TRIER"):
            pb("HORS CIRCUIT MAIS ENCORE DANS LE CIRCUIT", p,
               "etat=%s mais cycle=%s" % (etat, cycle))

    # 2. un montant du registre doit exister au releve, sinon il est suspect
    for p in P:
        try:
            m = round(float(p["montant"]), 2)
        except (ValueError, KeyError, TypeError):
            continue
        if m <= 0:
            continue
        if m in D:
            continue
        # tolerance : un montant peut etre paye groupe, ou pas encore paye.
        # Un REGLEMENT GROUPE PROUVE est justement le cas ou le montant de la
        # piece n apparait PAS au releve : c est leur somme qui y figure. La
        # note doit alors citer la ligne de releve ; cf. les cinq Bongert 2026
        # soldees par un virement de 670,15 le 11/06.
        groupe = "REGLEMENT GROUPE PROUVE" in (p.get("note") or "").upper()
        if (p.get("cycle") or "").strip().upper() == "PAYE" and not groupe:
            pb("MARQUEE PAYE MAIS LE MONTANT N EXISTE PAS AU RELEVE", p,
               "%.2f introuvable parmi les debits" % m)

    # 3. deux lignes ne peuvent pas porter la meme reference
    vus = defaultdict(list)
    for p in P:
        ref = (p.get("reference") or "").strip()
        if ref and ref not in ("", "(aucune)"):
            vus[ref].append(p)
    for ref, l in vus.items():
        if len(l) > 1:
            pbs.append(("REFERENCE EN DOUBLE AU REGISTRE", ref,
                        "%d lignes : %s" % (len(l),
                        ", ".join(x["fournisseur"] for x in l))))

    # 4. un etat doit faire partie des etats connus
    connus = {"RENOMME", "RECU", "MANQUANT", "DEPOSEE", "A_VERIFIER",
              "HORS PERIMETRE", "A_VENIR", "SANS OBJET"}
    for p in P:
        e = (p.get("etat") or "").strip()
        if e and e.upper() not in connus:
            pb("ETAT INCONNU", p, "'%s'" % e)

    # 4 bis. LE CONTROLE DANS L AUTRE SENS. Les controles ci-dessus vont du
    # registre vers le portail : chaque piece que je connais est-elle bien
    # deposee. Ils ne pouvaient PAS voir l inverse — un depot de 2026 qui ne
    # correspond a aucune piece du registre. Le 08/10/2026 le Dr a compte les
    # depots a la main et trouve 15 pieces deposees que je ne suivais pas,
    # dont les DIX releves LCL de l exercice. Un controle a sens unique ne
    # voit jamais ce qu on ne lui a pas dit d attendre.
    refs_c = [norm(p.get("reference") or "") for p in P]
    refs_c = [r for r in refs_c if len(r) >= 5]
    paires = []
    for p in P:
        f = [m for m in re.split(r"[^a-z0-9]+",
             (p.get("fournisseur") or "").lower()) if len(m) >= 4]
        try:
            m = norm("%.2f" % float(p["montant"]))
        except (ValueError, KeyError, TypeError):
            m = ""
        if f and m:
            paires.append((f, m))
    cites_c = set()
    for p in P:
        for c in re.findall(r"'([^']{6,90})'", p.get("note") or ""):
            if len(norm(c)) >= 8:
                cites_c.add(norm(c))
    d2026 = re.compile(r"^\s*2026[\s_-]?(0[1-9]|1[0-2])")
    # LE 09/10/2026 : ce controle ne regardait que le NOM du depot, et neuf
    # pieces de l exercice 2026 lui ont echappe — Bongert 24514532 et 24514784,
    # Made in Labs 34755 et 34968, GACD 2402261254 et 2402275693, Cofica
    # 750004695244, Mutualease 020-FL-31694851 — parce qu elles avaient ete
    # deposees sous des noms sans date ni numero : « BONGERT 13 03 2026.pdf »,
    # « MIL 01 2026 V1 le 06 03 2026.pdf », « GACd virement le 06 03 2026.pdf ».
    # 10 936,22 EUR de charges 2026 absentes du registre.
    # D ou le second critere : la DATE DE DEPOT. On ne l applique qu a la
    # campagne en cours, sinon on reflagerait les centaines de pieces 2025
    # deposees en 2026 pour le bilan precedent — et un controle qui crie tout
    # le temps ne sert plus a rien.
    campagne = re.compile(r"^\s*\d{2}/(1[0-2])/2026\s*$")
    # Les pieces de l exercice 2025 deposees pendant la campagne d octobre
    # n ont rien a faire dans un registre 2026. Sans cette liste le controle
    # les signalerait a chaque lancement, et un controle qui crie tout le temps
    # n est plus lu : la seule valeur de coherence.py est que son silence
    # veuille dire quelque chose. On n y inscrit un depot qu APRES l avoir
    # ouvert, avec le motif.
    exclus = set()
    try:
        for l in open("hors_perimetre_portail.txt", encoding="utf-8"):
            l = l.split("#")[0].strip()
            if l:
                exclus.add(norm(l))
    except OSError:
        pass

    for nom in tous:
        if not (d2026.match(nom)
                or campagne.match(tous[nom].get("date") or "")):
            continue
        if norm(nom) in exclus:
            continue
        z = norm(nom)
        if any(r in z for r in refs_c):
            continue
        if any(c in z or z in c for c in cites_c):
            continue
        # une piece sans reference se rattache par fournisseur + montant
        if any(m in z and any(w in nom.lower() for w in f)
               for f, m in paires):
            continue
        pbs.append(("DEPOSE AU PORTAIL MAIS ABSENT DU REGISTRE", nom[:34],
                    "depot date de 2026 sans piece correspondante"))

    # 5. defauts de STRUCTURE des fichiers sources. Celui-la vient d une
    # faute reelle : un « cat >> » sur un fichier sans retour a la ligne final
    # a COLLE la premiere ligne ajoutee sur la derniere existante, et le nom
    # d une facture Aries s est retrouve avale dans le champ statut. L index
    # ne la voyait plus, et le controle d etat l annoncait absente du portail.
    for h in hist:
        brut = io.open(h, encoding="utf-8").read()
        if brut and not brut.endswith("\n"):
            pbs.append(("FICHIER SANS RETOUR A LA LIGNE FINAL", h,
                        "le prochain ajout collera sur la derniere ligne"))
        for num, ligne in enumerate(brut.split("\n"), 1):
            if ligne.count(".pdf") > 1 or ligne.count("|") > 2:
                pbs.append(("LIGNE COLLEE DANS L HISTORIQUE",
                            "%s:%d" % (h, num), ligne[:80]))

    print("=== CONTROLE DE COHERENCE ===")
    print("%d pieces au registre, %d depots indexes, %d montants de debit "
          "distincts." % (len(P), len(tous), len(D)))

    # LE 09/10/2026 : j ai ecrit dans l audit du drive que la Cofica
    # 750004848906 etait rangee dans « 3 - DEPOSEES TGS » SANS AVOIR ETE
    # DEPOSEE. C etait faux : elle avait ete deposee le 08/10/2026, « Depot OK ».
    # Mon historique local s arretait au 06/10, et j ai pris cette absence pour
    # une preuve de non-depot. Le mode d emploi du drive dit que l historique
    # des depots fait foi — a condition qu il soit a jour.
    # Donc l outil annonce desormais sa propre date d arret. Tout ce qui est
    # poste apres cette date lui est invisible, et aucune affirmation du type
    # « pas encore deposee » ne vaut au-dela.
    dates = []
    for d in tous.values():
        m = re.match(r"\s*(\d{2})/(\d{2})/(\d{4})", d.get("date") or "")
        if m:
            dates.append((m.group(3), m.group(2), m.group(1)))
    if dates:
        a, mo, j = max(dates)
        print("Historique arrete au %s/%s/%s : un depot posterieur est "
              "INVISIBLE ici." % (j, mo, a))
    print()
    if not pbs:
        print("*** AUCUNE DIVERGENCE. ***")
        return 0
    cats = defaultdict(list)
    for c, q, d in pbs:
        cats[c].append((q, d))
    for c in sorted(cats, key=lambda c: -len(cats[c])):
        print("--- %s : %d ---" % (c, len(cats[c])))
        for q, d in cats[c][:40]:
            print("  %-34s %s" % (q[:34], d[:90]))
        if len(cats[c]) > 40:
            print("  ... et %d autres" % (len(cats[c]) - 40))
        print()
    print("%d divergences au total. Chacune est a trancher." % len(pbs))
    return 1


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))

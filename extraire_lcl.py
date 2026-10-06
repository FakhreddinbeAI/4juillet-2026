#!/usr/bin/env python3
"""
Extraction des releves LCL du compte 07480070666 (SELARL TIGHZA).

POURQUOI UN EXTRACTEUR ET PAS UNE SAISIE A LA MAIN. Le controle ne vaut que
s'il est exhaustif : le solde de fin se recalcule a partir de TOUS les
mouvements, et si une seule ligne manque, le recalcul ne prouve plus rien.
Une saisie manuelle de dix releves perd forcement une ligne.

TROIS CHOSES APPRISES SUR CES PDF, toutes payees d'un faux resultat :

 1. Le LCL n ecrit pas « NOUVEAU SOLDE » : la cloture s appelle « SOLDE EN
    EUROS ». Il imprime aussi un « SOLDE INTERMEDIAIRE A FIN <MOIS> » a la
    coupure d exercice, qui n est PAS la cloture.

 2. Le texte pivote de la page laisse parfois un point parasite apres le
    montant (« 862,38      . »). Un $ strict rejetait la ligne : quatre
    echeances de pret disparaissaient sur le seul releve 46, soit 4 461,40 EUR.

 3. Debit ou credit se lit a la POSITION du montant, qui est aligne a DROITE.
    Les en-tetes DEBIT et CREDIT ne sont pas un repere : leur abscisse change
    d une page a l autre (119/140, 123/146, 115/136...) alors que les montants
    tombent toujours aux memes colonnes. On apprend donc le seuil des donnees
    elles-memes, en mettant en commun les dix releves — meme gabarit bancaire,
    donc meme geometrie.

TROIS CONTROLES INDEPENDANTS, et ce sont eux qui comptent :
  1. par releve : ancien solde + credits - debits == solde en euros
  2. contre les TOTAUX imprimes par la banque (dont la colonne credit
     comprend l ancien solde)
  3. chainage : la cloture d un releve est l ouverture du suivant
Si les trois passent sur les dix releves, aucun mouvement n a ete oublie.
"""

import csv
import glob
import os
import re
import sys

from pypdf import PdfReader

MONTANT = r"-?\d{1,3}(?: \d{3})*,\d{2}"
RE_ANCIEN = re.compile(r"ANCIEN SOLDE\s+(" + MONTANT + r")")
RE_CLOTURE = re.compile(r"SOLDE EN EUROS\s+(" + MONTANT + r")")
RE_TOTAUX = re.compile(r"TOTAUX\s+(" + MONTANT + r")\s+(" + MONTANT + r")")
# ^\s+ et non ^\s : l indentation des lignes de mouvement n est pas constante.
# La page 4 du releve 47 met DEUX espaces avant la date la ou les autres pages
# en mettent un seul — vingt lignes perdues, dont les virements Straumann de
# 5 228,03 et Ormco de 2 805,11.
RE_MVT = re.compile(
    r"^\s+(\d{2}\.\d{2})\s+(\S.*?)\s+(\d{2}\.\d{2}\.\d{2})\s+("
    + MONTANT + r")[^\d]*$")
RE_NUM = re.compile(r"N°\s*(\d+)")
RE_PERIODE = re.compile(r"du (\d{2}\.\d{2}\.\d{4}) au (\d{2}\.\d{2}\.\d{4})")

IGNORER = re.compile(r"^(Credit Lyonnais|Crédit Lyonnais|DATE\b|Page |TOTAUX)")


def nombre(s):
    return float(s.replace(" ", "").replace(",", "."))


def texte_de(chemin):
    r = PdfReader(chemin)
    return "\n".join(p.extract_text(extraction_mode="layout") or ""
                     for p in r.pages)


def brut(texte):
    """Mouvements d un releve, SANS encore trancher debit/credit."""
    mvts = []
    for ligne in texte.split("\n"):
        m = RE_MVT.match(ligne)
        if m:
            date, libelle, valeur, montant = m.groups()
            mvts.append({
                "date": date,
                "libelle": libelle.strip(),
                "montant": nombre(montant),
                # abscisse de FIN du montant : les colonnes sont alignees a droite
                "fin": ligne.rfind(montant) + len(montant),
            })
            continue
        # Ligne de continuation : LIBELLE:, REF.CLIENT:, ID.CREANCIER:...
        # On ne la jette pas : c est la qu on trouve MDT/980750019180, qui dit
        # QUEL loyer Cofica a ete paye.
        nu = ligne.strip()
        if (mvts and nu and not IGNORER.match(nu)
                and len(ligne) - len(ligne.lstrip()) >= 8):
            mvts[-1]["libelle"] += " | " + nu
    return mvts


def seuil(fins):
    """
    Abscisse qui separe la colonne debit de la colonne credit, apprise des
    donnees : on cherche le plus grand vide entre deux positions observees.
    """
    u = sorted(set(fins))
    if len(u) < 2:
        return None
    ecarts = [(b - a, a, b) for a, b in zip(u, u[1:])]
    taille, a, b = max(ecarts)
    if taille < 6:            # pas de vide franc : geometrie non reconnue
        return None
    return (a + b) / 2.0


def lire(chemin):
    texte = texte_de(chemin)
    num = RE_NUM.search(texte)
    per = RE_PERIODE.search(texte)
    tot = RE_TOTAUX.search(texte)
    anciens = RE_ANCIEN.findall(texte)
    clotures = RE_CLOTURE.findall(texte)
    return {
        "numero": int(num.group(1)) if num else None,
        "periode": (per.group(1), per.group(2)) if per else (None, None),
        # le PREMIER ancien solde, la DERNIERE cloture : un releve de
        # plusieurs pages repete ses en-tetes.
        "ancien": nombre(anciens[0]) if anciens else None,
        "cloture": nombre(clotures[-1]) if clotures else None,
        "totaux": (nombre(tot.group(1)), nombre(tot.group(2))) if tot else None,
        "mvts": brut(texte),
        "fichier": os.path.basename(chemin),
    }


def main(motif, sortie):
    fichiers = sorted(glob.glob(motif))
    if not fichiers:
        print("Aucun fichier pour", motif)
        return 1

    releves = [lire(f) for f in fichiers]
    releves.sort(key=lambda r: r["numero"] or 0)

    # Seuil appris sur les DIX releves a la fois : meme gabarit bancaire.
    toutes = [m["fin"] for r in releves for m in r["mvts"]]
    s = seuil(toutes)
    if s is None:
        print("Geometrie des colonnes non reconnue : controle impossible.")
        return 1
    print("Seuil debit/credit appris des donnees : colonne %.1f" % s)
    print("  (debits jusqu a %d, credits a partir de %d)\n"
          % (max(f for f in toutes if f < s), min(f for f in toutes if f > s)))

    for r in releves:
        for m in r["mvts"]:
            est_debit = m["fin"] < s
            m["debit"] = m["montant"] if est_debit else ""
            m["credit"] = "" if est_debit else m["montant"]

    with open(sortie, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh, delimiter=";")
        w.writerow(["releve", "date", "libelle_complet", "debit", "credit"])
        for r in releves:
            for m in r["mvts"]:
                w.writerow([r["numero"], m["date"], m["libelle"],
                            m["debit"], m["credit"]])

    print("=== CONTROLE — LCL 07480070666 ===\n")
    ecarts, td_tot, tc_tot, n = 0, 0.0, 0.0, 0
    for r in releves:
        d = sum(m["debit"] for m in r["mvts"] if m["debit"] != "")
        c = sum(m["credit"] for m in r["mvts"] if m["credit"] != "")
        td_tot += d
        tc_tot += c
        n += len(r["mvts"])
        anc, clo = r["ancien"], r["cloture"]

        if anc is None or clo is None:
            print("  releve %-4s SOLDES ILLISIBLES (%s)" % (r["numero"], r["fichier"]))
            ecarts += 1
            continue

        calcule = anc + c - d
        ok1 = abs(calcule - clo) < 0.01
        detail = ""
        if not ok1:
            ecarts += 1
            detail = "  solde calcule %.2f contre %.2f, ecart %+.2f" % (
                calcule, clo, calcule - clo)
        print("  releve %-4s %s au %s  %3d mvts  D %10.2f  C %10.2f  %s%s"
              % (r["numero"], r["periode"][0], r["periode"][1], len(r["mvts"]),
                 d, c, "OK" if ok1 else "ECART", detail))

        if r["totaux"]:
            ptd, ptc = r["totaux"]
            # la colonne credit des TOTAUX comprend l ancien solde
            ed, ec = d - ptd, c - (ptc - anc)
            if abs(ed) > 0.01 or abs(ec) > 0.01:
                ecarts += 1
                print("              TOTAUX banque %.2f / %.2f -> "
                      "ecart debit %+.2f, credit %+.2f" % (ptd, ptc, ed, ec))

    print("\n--- CHAINAGE ---")
    for a, b in zip(releves, releves[1:]):
        if a["cloture"] is None or b["ancien"] is None:
            print("  %s -> %s : non verifiable" % (a["numero"], b["numero"]))
            ecarts += 1
        elif abs(a["cloture"] - b["ancien"]) < 0.01:
            print("  %s -> %s : continu (%.2f)" % (a["numero"], b["numero"], a["cloture"]))
        else:
            print("  %s -> %s : RUPTURE %.2f puis %.2f (%+.2f)"
                  % (a["numero"], b["numero"], a["cloture"], b["ancien"],
                     b["ancien"] - a["cloture"]))
            ecarts += 1

    print("\n%d mouvements, debits %.2f, credits %.2f." % (n, td_tot, tc_tot))
    print("CSV ecrit :", sortie)
    print("\n*** %s ***" % ("AUCUN ECART : la saisie est prouvee complete"
                            if not ecarts else
                            "%d ECART(S) — la saisie n est PAS prouvee complete" % ecarts))
    return 0 if not ecarts else 2


if __name__ == "__main__":
    motif = sys.argv[1] if len(sys.argv) > 1 else "*LCL-70666*.pdf"
    sortie = sys.argv[2] if len(sys.argv) > 2 else "lcl_2026.csv"
    sys.exit(main(motif, sortie))

# -*- coding: utf-8 -*-
"""Verifie qu un bloc a coller couvre EXACTEMENT ce qui manque au Sheet.

Ecrit apres avoir failli perdre l Argoat 02/2026 : ma cle de deduplication
(reference, sinon fournisseur+montant) fusionnait deux pieces reellement
distinctes parce que ni l une ni l autre n a de numero ni de montant.
Une cle qui collisionne fait disparaitre une piece en silence."""
import io, csv, re, subprocess, sys
from collections import Counter

def nz(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())

def lignes(txt, sep=','):
    return list(csv.reader(io.StringIO(txt), delimiter=sep))

def main(vue, bloc, commit_vue_initiale, colle):
    v0 = lignes(subprocess.run(['git', 'show', commit_vue_initiale],
                capture_output=True, text=True).stdout)[1:]
    c1 = [l.rstrip('\n').split('\t') for l in
          io.open(colle, encoding='utf-8') if l.strip()]
    c2 = [l.rstrip('\n').split('\t') for l in
          io.open(bloc, encoding='utf-8') if l.strip()]
    cour = lignes(io.open(vue, encoding='utf-8').read())[1:]

    # On compare sur la LIGNE ENTIERE, pas sur une cle : c est le seul moyen
    # de ne pas fusionner deux pieces qui se ressemblent.
    def sig(x):
        return "|".join(nz(x[i]) for i in (3, 4, 5, 6, 7, 8, 9))
    au_sheet = Counter(sig(x) for x in v0 + c1 + c2)
    attendu = Counter(sig(x) for x in cour)

    manquant = attendu - au_sheet
    en_trop = au_sheet - attendu
    print("vue courante : %d lignes" % len(cour))
    print("au Sheet apres collage : %d lignes" % sum(au_sheet.values()))
    print("MANQUANT : %d" % sum(manquant.values()))
    for s, n in manquant.items():
        print("   x%d  %s" % (n, s[:80]))
    print("EN TROP : %d" % sum(en_trop.values()))
    for s, n in en_trop.items():
        print("   x%d  %s" % (n, s[:80]))
    return 0 if not manquant and not en_trop else 1

if __name__ == '__main__':
    sys.exit(main(*sys.argv[1:]))

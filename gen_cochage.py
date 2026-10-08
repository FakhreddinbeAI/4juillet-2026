# -*- coding: utf-8 -*-
"""Regenere cocher_deposes.gs depuis le registre.
A relancer apres chaque depot : les REFS doivent rester le reflet exact
des pieces dont la presence au portail est prouvee."""
import io, csv, sys
L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]
env = [p for p in P if p['cycle'] == 'ENVOYE_TGS']
refs = sorted({p['reference'].strip() for p in env if p['reference'].strip()})
pairs = sorted({(p['fournisseur'].strip(), p['montant'].strip()) for p in env
                if not p['reference'].strip() and p['montant'].strip()})
hors = [p['fournisseur'] for p in env
        if not p['reference'].strip() and not p['montant'].strip()]

def groupe(items, larg=72):
    out, cur = [], ""
    for it in items:
        add = (", " if cur else "") + it
        if len(cur) + len(add) > larg:
            out.append(cur + ","); cur = it
        else:
            cur += add
    if cur: out.append(cur)
    return out

rl = groupe(['"%s"' % x.replace('"', '') for x in refs])
pl = groupe(['["%s", %s]' % (f, m) for f, m in pairs])
corps = io.open('cocher_deposes.gs', encoding='utf-8').read()
corps = 'function norm_' + corps.split('function norm_', 1)[1]
tete = '''/**
 * cocherDeposes() — coche en colonne A les pieces reellement deposees sur
 * le portail TGS, d apres l index local des depots du portail.
 * N ECRIT QU EN A ET B. Ne touche JAMAIS K (vigilance) ni L (liens).
 * Genere par gen_cochage.py : %d references + %d couples fournisseur/montant.
 */

var REFS = [
  %s
];

var COUPLES = [
  %s
];

''' % (len(refs), len(pairs), "\n  ".join(rl), "\n  ".join(pl))
io.open('cocher_deposes.gs', 'w', encoding='utf-8').write(tete + corps)
tot = len(refs) + len(pairs)
print("%d pieces cochables (%d refs + %d couples) / %d ENVOYE_TGS"
      % (tot, len(refs), len(pairs), len(env)))
if hors:
    print("exclues faute de reference ET de montant : %s" % ", ".join(hors))

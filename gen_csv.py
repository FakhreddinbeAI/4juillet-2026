# -*- coding: utf-8 -*-
"""Fabrique le CSV de la vue TGS depuis le registre.
Le registre est la SOURCE, le Sheet n est qu une VUE : on le refabrique, on
ne le repare pas. Aucun Apps Script, aucun copier-coller."""
import io, csv, sys
L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]

def net(v):
    v = (v or '').strip()
    return '' if v.lower() in ('none', 'nan') else v

ORDRE = {"ENVOYE_TGS": 0, "PAYE": 1, "A_PAYER": 2, "A_TRIER": 3,
         "HORS_PERIMETRE": 4}
P.sort(key=lambda p: (ORDRE.get(p['cycle'], 9), net(p['fournisseur']),
                      net(p['date_piece'])))

# La colonne « Nom de fichier » est retiree de la vue : elle se deduit
# mecaniquement des autres et pesait 13 Ko a elle seule. Le registre la garde.
def nomfic(p):
    d, f, t = net(p['date_piece']), net(p['fournisseur']), net(p['type'])
    m, ref, per = net(p['montant']), net(p['reference']), net(p['periode'])
    if not (d and f):
        return ''
    b = [d, f, t or 'FACTURE']
    if m: b.append(m)
    if ref: b.append(ref)
    n = '_'.join(b)
    return n + ('_P' + per if per else '') + '.pdf'

out = io.StringIO()
w = csv.writer(out, lineterminator='\n')
# La vue ne porte PAS mes notes : elles font 20 Ko, et une note tronquee a
# 150 signes informe moins qu une consigne de trois mots. Le registre garde
# tout ; la vue dit QUOI FAIRE.
def action(p):
    if net(p['etat']).upper().startswith('MANQUANT'):
        return "A OBTENIR"
    return {"ENVOYE_TGS": "RIEN", "PAYE": "A DEPOSER",
            "A_PAYER": "LUCIE PAIE", "A_TRIER": "A TRIER",
            "HORS_PERIMETRE": "HORS 2026"}.get(p['cycle'], "A VOIR")

w.writerow(["Depose TGS", "Action", "Cycle", "Etat", "Date", "Fournisseur",
            "Type", "Montant", "Reference", "Periode"])
for p in P:
    w.writerow([
        "TRUE" if p['cycle'] == 'ENVOYE_TGS' else "FALSE",
        action(p), net(p['cycle']), net(p['etat']), net(p['date_piece']),
        net(p['fournisseur']), net(p['type']),
        net(p['montant']).replace('.', ','), net(p['reference']),
        net(p['periode']),
    ])
io.open('vue_tgs.csv', 'w', encoding='utf-8').write(out.getvalue())
n = len(P)
print("%d lignes, %d octets" % (n, len(out.getvalue().encode())))
from collections import Counter
for k, v in Counter(p['cycle'] for p in P).most_common():
    print("  %-16s %d" % (k, v))

# -*- coding: utf-8 -*-
"""Fabrique le CSV de la vue TGS depuis le registre.
Le registre est la SOURCE, le Sheet n est qu une VUE : on le refabrique, on
ne le repare pas. Aucun Apps Script, aucun copier-coller."""
import io, csv, sys
L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
# CHAMPS ATTENDUS : 10. Le 09/10/2026 une note que j ai ajoutee contenait un
# POINT-VIRGULE — le separateur du registre — et le champ s est scinde : le
# cycle de la piece NTJ 20240268 s est retrouve a contenir un bout de phrase,
# et la vue affichait une action « A VOIR » inventee. Le filtre « len >= len(h) »
# laissait passer la ligne au lieu de crier. On verifie l egalite, et on arrete
# tout : une vue silencieusement fausse est pire qu une erreur.
mauvaises = [i + 2 for i, x in enumerate(r[1:]) if len(x) != len(h)]
if mauvaises:
    raise SystemExit("registre_2026.csv : %d ligne(s) au mauvais nombre de "
                     "champs, lignes %s. Un point-virgule dans une note ?"
                     % (len(mauvaises), mauvaises[:10]))
P = [dict(zip(h, x)) for x in r[1:]]

def net(v):
    v = (v or '').strip()
    return '' if v.lower() in ('none', 'nan') else v

# CE QUI EST DEPOSE PASSE EN BAS. On ouvre la feuille pour savoir quoi
# faire, pas pour relire ce qui est deja fait : l actionnable en premier,
# le classe en dernier. Et l ACTION est prefixee d un chiffre, pour qu un
# tri A-Z dans le Sheet redonne TOUJOURS cet ordre — sans le chiffre,
# « HORS 2026 » se range entre « A TRIER » et « LUCIE PAIE », par accident
# alphabetique.
ORDRE = {"PAYE": 0, "A_PAYER": 1, "A_TRIER": 2, "HORS_PERIMETRE": 3,
         "ENVOYE_TGS": 4}
# LE 09/10/2026 : deux changements.
#   « A LOCALISER » est ajoute. Les pieces trouvees dans les classeurs de
#   suivi (celui de l assistante, celui de Straumann) sont en etat
#   A_VERIFIER : on SAIT que la facture existe, on n a pas le fichier. Ce
#   n est pas « a trier », c est une chasse au fichier ou une reclamation
#   au fournisseur. Les confondre, c est perdre 47 pieces dans le tas.
#   « RIEN » devient « FAIT ». La feuille doit montrer ce qui est fait
#   autant que ce qui reste : « RIEN » ne dit pas qu on a reussi.
RANG = {"A DEPOSER": "1", "A OBTENIR": "2", "A LOCALISER": "3",
        "LUCIE PAIE": "4", "A TRIER": "5", "HORS 2026": "6", "FAIT": "7"}
# Le tri suit le RANG DE L ACTION et non le cycle : trier par cycle
# entremelait « A DEPOSER » et « A OBTENIR », qui cohabitent dans PAYE.
# C est l action qu on lit, c est donc elle qui ordonne.

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
    e, c = net(p['etat']).upper(), p['cycle']
    if e.startswith('MANQUANT'):
        return "A OBTENIR"
    # l etat prime sur le cycle : une piece deja chez TGS est faite, meme si
    # son fichier reste a retrouver de notre cote.
    if e == 'A_VERIFIER' and c != 'ENVOYE_TGS':
        return "A LOCALISER"
    return {"ENVOYE_TGS": "FAIT", "PAYE": "A DEPOSER",
            "A_PAYER": "LUCIE PAIE", "A_TRIER": "A TRIER",
            "HORS_PERIMETRE": "HORS 2026"}.get(c, "A VOIR")

P.sort(key=lambda p: (RANG.get(action(p), "9"), net(p['fournisseur']),
                      net(p['date_piece'])))

w.writerow(["Depose TGS", "Action", "Cycle", "Etat", "Date", "Fournisseur",
            "Type", "Montant", "Reference", "Periode"])
for p in P:
    w.writerow([
        "TRUE" if p['cycle'] == 'ENVOYE_TGS' else "FALSE",
        RANG.get(action(p), "9") + " " + action(p), net(p['cycle']), net(p['etat']), net(p['date_piece']),
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

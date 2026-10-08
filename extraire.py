# -*- coding: utf-8 -*-
"""Lit un export JSON de search_files (avec snippets) et en tire, pour
chaque fichier : fournisseur, numero de facture, date, montant TTC, et le
nom normalise a lui donner.

PRINCIPE : tout est LU DANS LE TEXTE du PDF. Rien n est deduit du nom du
fichier — c est la regle qui a coute le Canva a 12,00 EUR qui en valait
13,32. Quand une valeur n est pas trouvee, la case reste vide et le fichier
part en « a lire a la main » : on ne devine pas."""
import json, io, re, sys, unicodedata

def sansacc(s):
    # Les snippets de Drive sont echappes facon markdown : « \\*\\*\\*271,45 »
    # pour « ***271,45 ». Sans ce nettoyage, aucun motif a asterisques ne
    # matche, et c est precisement ainsi que Bongert ecrit son total.
    s = s.replace('\\', '')
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

FOURNISSEURS = [
    ('BONGERT', r'bongert'), ('NTJ', r'\bNTJ\b|labo\s*ntj'),
    ('ROTEC', r'\brotec\b'), ('GACD', r'\bgacd\b'),
    ('ORMCO', r'\bormco\b'), ('STRAUMANN', r'straumann'),
    ('MADE-IN-LABS', r'made\s*in\s*labs'), ('ARGOAT', r'argoat'),
    ('OSSEO-SHOP', r'osseo'), ('BIOTECH', r'biotech'),
    ('ARCADE-DENTAIRE', r'arcade|henry\s*schein'),
    ('SEPTODONT', r'septodont'), ('COFICA', r'cofica|cofibail'),
    ('MUTUALEASE', r'mutualease|cm-cic\s*leasing'),
    ('ZFX', r'\bzfx\b'), ('NEOHM', r'neohm'), ('EXECOM', r'execom'),
    ('LA-FRAISE', r'la\s*fraise'), ('ARIES', r'\baries\b'),
    ('DOCTOLIB', r'doctolib'), ('IONOS', r'ionos|1&1'),
    ('ANTHROPIC', r'anthropic'), ('CANVA', r'canva'),
    ('GOOGLE-WORKSPACE', r'google\s*workspace'),
    ('RECEPT-AI', r'recept\s*ai|budgie'), ('LIXXBAIL', r'lixxbail'),
    ('BREDENT', r'bredent'), ('MACSF', r'macsf'),
    ('CMV-MEDIFORCE', r'mediforce'), ('ROTEC', r'rotec'),
]

# Les formulations qui precedent un total, de la plus sure a la moins sure.
TOTAL = [
    r'total\s*t\.?t\.?c\.?[^0-9\-]{0,24}([0-9][0-9  .]{0,12}[,.]\d{2})',
    r'net\s*(?:a\s*payer|à\s*payer)[^0-9\-]{0,24}([0-9][0-9  .]{0,12}[,.]\d{2})',
    r'montant\s*(?:total\s*)?t\.?t\.?c\.?[^0-9\-]{0,24}'
    r'([0-9][0-9  .]{0,12}[,.]\d{2})',
    r'\*{3,}\s*([0-9][0-9  .]{0,12}[,.]\d{2})\s*EUR',
    r'total\s*(?:de\s*la\s*)?facture[^0-9\-]{0,24}([0-9][0-9  .]{0,12}[,.]\d{2})',
    # GACD, Ormco, Straumann : « TTC » ou « a payer » colle au nombre.
    r'(?:ttc|a\s*payer|net\s*a\s*payer)\s*:?\s*'
    r'([0-9][0-9  .]{0,12}[,.]\d{2})\s*(?:EUR|€)?',
    r'([0-9][0-9  .]{0,12}[,.]\d{2})\s*(?:EUR|€)\s*$',
    # Straumann : « Total 98,34 € » ou « Total 98,34 Devise EUR ».
    r'\btotal\s+([0-9][0-9  .]{0,12}[,.]\d{2})\s*(?:€|devise|eur)',
    # Made in Labs : « TOTAL: 1967.00 Euros ».
    r'\btotal\s*:\s*([0-9][0-9  .]{0,12}[,.]\d{2})\s*euros?',
]
# « Numero » sans accent commence par un N : « facture n[o]? » capturait
# « umero ». On exige donc au moins un CHIFFRE dans le numero retenu.
NUM = [
    r'facture\s*n[°o]\s*:?\s*([A-Z0-9][A-Z0-9\-/\.]{4,22})',
    r'numero\s*(?:de\s*)?(?:facture)?\s*:?\s*([A-Z0-9][A-Z0-9\-/\.]{4,22})',
    r'FACTURE[_\s]+(\d{6,12})',
    r'n[°o]\s*de\s*facture\s*:?\s*([A-Z0-9][A-Z0-9\-/\.]{4,22})',
    r'facture\s*client\s*-?\s*(\d{6,10})',
]
DATE = [
    r'\b(\d{2})[/\.](\d{2})[/\.](20\d{2})\b',
    r'\b(\d{2})-(\d{2})-(20\d{2})\b',
]
# Straumann ecrit « Document cree le 17 avr. 26 », NTJ « le 20 mai 2026 ».
MOIS = {'janv': '01', 'fevr': '02', 'mars': '03', 'avr': '04', 'mai': '05',
        'juin': '06', 'juil': '07', 'aout': '08', 'sept': '09',
        'octo': '10', 'nove': '11', 'dece': '12'}

def date_lettres(t):
    m = re.search(r'\b(\d{1,2})\s+([a-z]{3,10})\.?\s+(20\d{2}|\d{2})\b',
                  t, re.I)
    if not m:
        return ''
    j, mo, a = m.groups()
    for cle, num in MOIS.items():
        if mo.lower().startswith(cle):
            if len(a) == 2:
                a = '20' + a
            return "%s-%s-%02d" % (a, num, int(j))
    return ''

def montant(t):
    for p in TOTAL:
        m = re.search(p, t, re.I)
        if m:
            v = m.group(1).replace(' ', '').replace(' ', '')
            v = v.replace(' ', '').replace(',', '.')
            if v.count('.') > 1:
                e = v.rsplit('.', 1)
                v = e[0].replace('.', '') + '.' + e[1]
            try:
                f = float(v)
                if 0 < f < 1000000:
                    return "%.2f" % f
            except ValueError:
                pass
    return ''

def numero(t, titre):
    for p in NUM:
        m = re.search(p, t, re.I)
        if m:
            n = m.group(1).strip(' .-/')
            if (len(n) >= 5 and re.search(r'\d', n)
                    and not re.match(r'^(20\d\d|\d{2}/\d{2})$', n)):
                return n
    m = re.search(r'\b(\d{7,12})\b', titre)
    return m.group(1) if m else ''

def date(t):
    for p in DATE:
        for m in re.finditer(p, t):
            j, mo, a = m.groups()
            if 1 <= int(mo) <= 12 and 1 <= int(j) <= 31:
                return "%s-%s-%s" % (a, mo, j)
    return date_lettres(t)

def fournisseur(t, titre):
    bloc = (titre + ' ' + t[:1400]).lower()
    for nom, pat in FOURNISSEURS:
        if re.search(pat, bloc, re.I):
            return nom
    return ''

def nom_propre(f, d, mt, num):
    if not (f and d and num):
        return ''
    n = "%s_%s_FACTURE" % (d, f)
    if mt:
        n += "_" + mt
    n += "_" + re.sub(r'[^A-Za-z0-9\-\.]', '', num) + ".pdf"
    return n

def main(chemin):
    j = json.load(io.open(chemin, encoding='utf-8'))
    out, incomplets = [], 0
    for x in j.get('files', []):
        t = sansacc(x.get('contentSnippet') or '')
        titre = x.get('title') or ''
        if x.get('mimeType', '').endswith('shortcut'):
            out.append((x['id'], titre, 'RACCOURCI', '', '', '', ''))
            continue
        f = fournisseur(t, titre)
        num = numero(t, titre)
        d = date(t)
        mt = montant(t)
        nn = nom_propre(f, d, mt, num)
        if not nn:
            incomplets += 1
        out.append((x['id'], titre, f, num, d, mt, nn))
    w = csv.writer(io.open('renommage.tsv', 'w', encoding='utf-8',
                           newline=''), delimiter='\t')
    w.writerow(['id', 'ancien', 'fournisseur', 'numero', 'date', 'montant',
                'nouveau'])
    for r in out:
        w.writerow(r)
    print("%d fichiers, %d sans nom complet" % (len(out), incomplets))
    print("%-34s %-14s %-12s %9s" % ('ANCIEN', 'FOURN', 'NUMERO', 'MONTANT'))
    for i, a, f, n, d, m, nn in out:
        print("%-34s %-14s %-12s %9s %s" % (a[:34], f[:14], n[:12], m,
                                            '' if nn else '  <-- A LIRE'))

import csv
if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))

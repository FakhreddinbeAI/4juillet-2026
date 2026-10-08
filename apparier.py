# -*- coding: utf-8 -*-
"""Apparie chaque piece du registre a un fichier Drive, par REFERENCE lue
dans le titre. Pas par ressemblance de nom : une reference exacte ou rien.
Un lien faux est pire qu un lien absent — il ouvre la mauvaise facture."""
import json, io, csv, glob, re

fich = []
for p in sorted(glob.glob('liens/p*.json')):
    fich += json.load(io.open(p, encoding='utf-8'))
vus = {}
for f in fich:
    vus.setdefault(f['id'], f)
fich = list(vus.values())

def nz(s):
    return re.sub(r'[^A-Z0-9]', '', (s or '').upper())

idx = {}
for f in fich:
    idx.setdefault(nz(f['t']), []).append(f)

L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]

trouve, rate, ambigu = {}, [], []
for i, p in enumerate(P):
    ref = nz(p['reference'])
    if len(ref) < 5:
        rate.append((i, p['fournisseur'], p['reference'] or '(sans ref)'))
        continue
    hits = [f for t, g in idx.items() if ref in t for f in g]
    # un titre peut contenir une reference qui en est le prefixe d une autre
    exacts = [f for f in hits
              if re.search(ref + r'(?![0-9])', nz(f['t']))]
    hits = exacts or hits
    if len(hits) == 1:
        trouve[i] = hits[0]
    elif len(hits) > 1:
        ambigu.append((i, p['fournisseur'], p['reference'],
                       [f['t'] for f in hits]))
    else:
        rate.append((i, p['fournisseur'], p['reference']))

print("fichiers Drive indexes : %d" % len(fich))
print("APPARIEES : %d / %d" % (len(trouve), len(P)))
print("ambigues  : %d" % len(ambigu))
print("sans lien : %d" % len(rate))
json.dump({str(k): v['id'] for k, v in trouve.items()},
          io.open('liens/apparies.json', 'w', encoding='utf-8'))
print("\n--- AMBIGUES (plusieurs fichiers pour une reference) ---")
for i, f, ref, ts in ambigu[:12]:
    print("  %-16s %-20s -> %s" % (f, ref, " | ".join(t[:46] for t in ts)))
print("\n--- SANS LIEN, avec une reference ---")
n = 0
for i, f, ref in rate:
    if len(nz(ref)) >= 5:
        print("  %-16s %s" % (f, ref)); n += 1
    if n > 25: print("  ..."); break

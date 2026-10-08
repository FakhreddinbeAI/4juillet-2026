# -*- coding: utf-8 -*-
"""AUDIT DANS LE SENS DE LA BANQUE.

coherence.py va du registre vers le portail. audit_lcl.py va du RELEVE vers
le registre : chaque debit du compte pro a-t-il son justificatif ?
C est le seul sens qui repond a « est-ce que tout est dans le Sheet ».

Il ne reclame pas de facture pour ce qui n en a pas : echeances de pret,
salaires, cotisations, impots, virements internes, frais bancaires. Ces
familles sont declarees et comptees a part, jamais confondues avec un
justificatif manquant."""
import io, csv, re, sys
from collections import defaultdict

def net(v):
    v = (v or '').strip()
    return '' if v.lower() in ('none', 'nan') else v

def nz(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())

# Ce qui n appelle PAS de facture fournisseur.
# ATTENTION A LA FRONTIERE. Un credit-bail (Lixxbail, BNP Lease, Icare,
# Mutualease) EMET une facture : il reste donc dans les manquants. Une prime
# d assurance, non : le justificatif est l attestation annuelle, pas chaque
# prelevement mensuel. Une echeance de pret non plus : c est le tableau
# d amortissement, deja chez TGS. Confondre les deux gonflait le manquant
# de 90 000 EUR et noyait les vrais trous.
HORS = [
    (r'ECHEANCE PRET|AMORTISSEMENT|PRET \d{6,}', 'echeance de pret'),
    (r'COTIS |URSSAF|CARPIMKO|CIPAV|AG2R|MALAKOFF|RETRAITE|CARCDSF',
     'cotisation obligatoire'),
    (r'MACSF|HARMONIE MUTUELLE|SWISSLIFE|AXA |ALLIANZ|GENERALI',
     'prime d assurance (justif = attestation annuelle)'),
    (r'IMPOT|DGFP|DGFIP|TVA|TRESOR PUBLIC|AMENDE|SIE ', 'impot ou taxe'),
    (r'VIR .*TIGHZA|VIR SEPA Tighza|COMPTE A COMPTE|SCM Legesmile',
     'interne : compte courant, quote-part SCM'),
    (r'COTISATION TRIMESTRIELLE|FRAIS |COMMISSION|AGIOS|INTERETS'
     r'|CARTE BANCAIRE|TENUE DE COMPTE', 'frais bancaires'),
    (r'SALAIRE|PAIE |REMUNERATION|ACOMPTE|Menanteau|FIGARD|NOILHETAS',
     'salaire ou remuneration (a confirmer)'),
    (r'BLOCAGE|SAISIE|OPPOSITION', 'saisie ou blocage'),
    (r'REMISE|VERSEMENT|CREDIT', 'encaissement'),
]

def famille(lib):
    for mot, nom in HORS:
        if re.search(mot, lib, re.I):
            return nom
    return None

def fournisseur_du_libelle(lib):
    """Extrait un nom lisible du debut du libelle, pour regrouper."""
    s = lib.split('|')[0]
    s = re.sub(r'^(CB97|CB\d*|VIR INST|VIR SEPA|PRLV SEPA|PRELEVEMENT'
               r'|VIR |PRLV )', '', s, flags=re.I).strip()
    s = re.sub(r'\d{2}/\d{2}/\d{2,4}.*$', '', s).strip()
    s = re.sub(r'\s+', ' ', s)
    return s[:34] or '(illisible)'

def main(reg, lcl):
    L = [l for l in io.open(reg, encoding='utf-8')
         if l.strip() and not l.startswith('#')]
    r = list(csv.reader(L, delimiter=';')); h = r[0]
    P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]

    refs = [(nz(net(p['reference'])), p) for p in P
            if len(nz(net(p['reference']))) >= 5]
    montants = defaultdict(list)
    for p in P:
        try:
            montants[round(float(p['montant']), 2)].append(p)
        except (ValueError, KeyError, TypeError):
            pass

    D = list(csv.DictReader(io.open(lcl, encoding='utf-8'), delimiter=';'))
    apparies, hors, orphelins = 0, defaultdict(lambda: [0, 0.0]), []
    for d in D:
        try:
            mt = round(float(d['debit']), 2)
        except (ValueError, TypeError):
            continue
        if mt <= 0:
            continue
        lib = d['libelle_complet'] or ''
        z = nz(lib)

        if any(ref and ref in z for ref, _ in refs):
            apparies += 1; continue
        cands = montants.get(mt, [])
        touche = False
        for p in cands:
            mots = [m for m in re.split(r'[^a-z0-9]+',
                    net(p['fournisseur']).lower()) if len(m) >= 4]
            if any(m in lib.lower() for m in mots):
                touche = True; break
        if touche:
            apparies += 1; continue
        f = famille(lib)
        if f:
            hors[f][0] += 1; hors[f][1] += mt; continue
        orphelins.append((fournisseur_du_libelle(lib), mt, d['releve'],
                          d['date'], lib))

    print("=== AUDIT DU RELEVE VERS LE REGISTRE ===")
    print("%d debits lus sur les releves %s a %s."
          % (len([x for x in D if net(x['debit'])]),
             D[0]['releve'], D[-1]['releve']))
    print("  avec un justificatif au registre : %d" % apparies)
    print("  hors champ (pas de facture attendue) :")
    for k in sorted(hors, key=lambda k: -hors[k][1]):
        print("     %-34s %3d debits  %10.2f EUR" % (k, hors[k][0],
                                                     hors[k][1]))
    print("  SANS JUSTIFICATIF : %d debits, %.2f EUR"
          % (len(orphelins), sum(x[1] for x in orphelins)))

    par = defaultdict(lambda: [0, 0.0, []])
    for nom, mt, rel, dt, lib in orphelins:
        par[nom][0] += 1; par[nom][1] += mt
        par[nom][2].append("%s/%s %.2f" % (dt, rel, mt))
    print("\n--- regroupes par fournisseur, du plus lourd au plus leger ---")
    for nom in sorted(par, key=lambda n: -par[nom := n][1])[:40]:
        c, s, det = par[nom]
        print("  %-34s %2d x  %9.2f EUR   %s"
              % (nom, c, s, ", ".join(det[:4])))
    return 0

if __name__ == '__main__':
    sys.exit(main(*sys.argv[1:]))

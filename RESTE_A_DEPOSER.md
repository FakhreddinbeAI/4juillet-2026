# Ce qui reste à déposer sur TGS

*Établi le 6 octobre 2026. Les 118 pièces du registre confrontées aux
**1 251 dépôts** de l'historique du portail, puis **chaque verdict relu
fournisseur par fournisseur** dans l'historique brut — parce que l'index
automatique s'est trompé trois fois dans la journée et que j'ai annoncé trois
chiffres différents avant celui-ci.*

## Le chiffre

| | pièces | montant |
|---|---|---|
| Déjà au portail (index) | 41 | 10 319 € |
| Déjà au portail (vérifié à l'œil) | 7 | 141 141 € |
| **Absentes — à déposer** | **53** | **16 566 €** |
| Sans référence exploitable | 17 | 12 703 € |

## Ce que la relecture à l'œil a corrigé

Cinq pièces que l'index déclarait absentes **sont déposées**. Toutes sous un
nom que nul index par référence ne pouvait atteindre :

| Pièce | Montant | Le dépôt qui la porte |
|---|---|---|
| COFICA 750004747696 | 1 353,76 € | `2026 03 27 Cofica Bail Facture Loyer.pdf` — aucun numéro, mais la date exacte |
| MADE IN LABS relance | 8 316,98 € | `2026 08 17 MADE IN LABS RELANCE 8316 98 solde debiteur.pdf` |
| SEPTODONT rappel | — | `SEPTODONT Rappel de paiement 27 08 2026.pdf` |
| DGFiP amende majorée | 75,00 € | `amende 75 .pdf` |
| ORMCO 331150973 | 19,20 € | `ORMCO Regle par chq le 13 03 2026.pdf` — titre faux, le chèque a été rejeté le 01/04 |

**Et deux trous dans l'index, de même nature :** une lettre ou un tiret au
milieu d'une référence casse la suite de chiffres dans le nom du fichier.
`020-FC-01179765` est déposé en `020 FC 01179765`, `04753-52817600` en
`04753 52817600`. Sept pièces de plus — la Mutualease et les six Canva —
étaient déposées sans que je les voie.

## Trois ressemblances que je ne tranche pas

Un dépôt ressemble, même période ou même objet, mais aucun numéro commun. **Il
faut ouvrir le fichier pour conclure.** Je ne les compte ni déposées ni
absentes :

- **MADE IN LABS 36187 — 1 705,24 €** contre `MADE IN LABS JUILLET.pdf`
- **MACSF 7904376-52 — 229,39 €** contre `Copie de macsf attestation assurance local`
- **ANTHROPIC 2842-1119-2935 — 108,00 €** contre `Receipt facture.pdf`

## Les 53 à déposer

Groupées par fournisseur et par emplacement, parce qu'on dépose en ouvrant un
dossier, pas en suivant un classement décroissant. Sortie complète :

```
python3 -I liste_depot.py registre_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
```

Les dix premiers groupes font 14 382 € des 16 566 € :

| Fournisseur | Pièces | Montant | Où |
|---|---|---|---|
| ARIES | 5 × 990 € | 4 950,00 € | Compta Cabinet Tighza |
| SEPTODONT | 5 | 1 886,54 € | SD / Brother + à régler |
| MADE IN LABS 36187 | 1 | 1 705,24 € | SD / à régler |
| COFICA 750004781830 | 1 | 1 353,76 € | SD |
| NEOHM FR159171 | 1 | 1 132,80 € | FACTURATION |
| ROTEC C012667 | 1 | 1 004,50 € | SD |
| GOOGLE WORKSPACE | 9 | 830,45 € | trois dossiers |
| GACD 2402391923 | 1 | 548,73 € | FACTURATION |
| ZFX | 2 | 507,98 € | SD / Brother |
| ONCD | 1 | 462,00 € | SD / Brother |

Puis ADF 389 €, EXECOM 334,80 €, LA FRAISE 238 €, note d'honoraires 232 €,
MACSF 229,39 €, STRAUMANN 189,54 €, ARGOAT 160 €, ANTHROPIC 108 €, CPAM
96,75 €, ORMCO 3 × ~20 €, ANTAI 50 €, DGFiP 22 €, et six lignes sans montant
(Mutualease FL, URSSAF, deux scans, relevé BNP 26009).

**Deux ne sont pas à déposer mais à obtenir** — elles n'existent pas
encore : ZFX R-2602.52453 et STRAUMANN 9060125749.

*(J'y comptais aussi l'attestation Madelin MACSF. À tort : le Dr l'a
déposée en septembre et l'historique le confirme — `Attestation Madelin
au 31 12 2025.pdf`, Dépôt OK le 21/09/2026. Ma propre note disait déjà
« fournie à TGS, confirmé le 25/09 ». Cette ligne du registre suit
l'attestation **2026**, qui ne peut exister qu'en janvier 2027 : elle est
passée en `A_VENIR` et sort des listes de travail.)*

## Les urgences, qui ne sont pas des montants

1. **DGFiP 22 €** — mise en demeure valant commandement, délai de 30 jours
   expiré depuis mars. Rien à vérifier : à payer.
2. **ONCD** — deux chèques de 462 € le 07/08. **Voir
   `A_VERIFIER_PLUS_TARD.md` : ce n'est probablement pas un double paiement.**
3. **`CHQ IRREGUL 2491605` — 2 440,25 €**, contrepartie introuvable.
4. **28 822 € de `VIR SEPA Tighza perso`** — compte courant d'associé ou
   rémunération ? Question pour Mme Daheron.

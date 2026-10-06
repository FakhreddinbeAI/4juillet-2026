# Ce qui reste vraiment à déposer sur TGS

*Établi le 6 octobre 2026 en confrontant les 118 pièces du registre aux
**1 251 dépôts** de l'historique du portail. Avant ce contrôle j'annonçais
136 703 € de retard ; c'était faux de bout en bout.*

## Le chiffre

| | pièces | montant | quoi faire |
|---|---|---|---|
| Déjà tranchées à la main | 3 | 131 450,81 € | rien |
| Déjà au portail | 34 | 10 246,74 € | rien |
| **Absentes du portail** | **62** | **18 011,38 €** | **déposer** |
| Sans référence exploitable | 19 | 21 020,07 € | vérifier à l'œil |

Le retard réel est donc de **18 011 €** de pièces identifiées, et non des
136 703 € que j'annonçais ce matin.

## Ce qui a fait fondre le chiffre

**130 102,15 € tenaient à un seul fichier déjà déposé.**
`SCM LEGESMILE - SCDF - Répartition charges au 31.03.2026.xlsx`, déposé le
21/09/2026, Dépôt OK. Il porte les deux montants en clair :

- ligne `755000 QP FRAIS GENERAUX A REINTEGRER`, colonne DR TIGHZA-SELARL :
  **120 314,80 €** — la quote-part 2025, au centime près du registre ;
- ligne `APPORTS ASSOCIES 2025`, même colonne, intitulée `solde CC` :
  **9 787,35 €** — le compte courant 45530000, que je cherchais comme une
  pièce séparée alors qu'il est dans ce fichier.

Le chiffre se recoupe d'ailleurs dans un second document déposé le même jour,
la liasse 2036 de la SCM au 31/12/2025 : ligne 9, « Remboursements par les
associés — 120 315 ».

**1 348,66 € sortis du périmètre** : l'Ormco 331190204 est à la charge du
Dr Angibaud, sur décision du Dr le 06/10.

## Pourquoi je me suis trompé quatre fois dans la journée

Ormco, Straumann, Rotec et NTJ ; puis les trois tableaux d'amortissement des
prêts ; puis la quote-part SCM. Chaque fois la même faute : **j'ai lu le
registre et pris son silence pour une absence.** Le registre n'est qu'une vue
partielle que j'ai construite moi-même ; c'est l'historique des dépôts qui
fait foi, et le mode d'emploi du drive le dit noir sur blanc.

La règle, désormais outillée : avant d'écrire qu'une pièce manque, la chercher
dans `historique_portail.txt` avec `audit_portail.py`.

## Le reste à déposer, par ordre de montant

Voir la sortie de `python3 -I audit_portail.py registre_2026.csv
historique_portail.txt historique_portail_statuts.txt`, section 2.

Les sept plus gros, qui font à eux seuls 8 530 € des 18 011 € :

| Fournisseur | Référence | Montant | État |
|---|---|---|---|
| MADE IN LABS | 36187 | 1 705,24 € | reçue |
| COFICA | 750004747696 | 1 353,76 € | reçue |
| COFICA | 750004781830 | 1 353,76 € | reçue |
| NEOHM | FR159171 | 1 132,80 € | renommée |
| ROTEC | C012667 | 1 004,50 € | relance niveau 3 |
| ARIES | 5 factures à 990 € | 4 950,00 € | renommées |
| SEPTODONT | 1034064 | 763,76 € | deuxième relance |

## Les quatre urgences, qui ne sont pas des montants

1. **DGFiP 22 €** — mise en demeure valant commandement, délai de 30 jours
   expiré depuis mars. Saisie possible pour 22 €.
2. **ONCD 462 €** — deux chèques 8430662 et 8430663 du même montant, plus un
   `BLOCAGE SUR PCE262923966` de 462 € passé **deux fois** au LCL. Risque de
   triple paiement d'une cotisation unique.
3. **CHQ IRREGUL 2 491 605 — 2 440,25 €** — contrepartie introuvable.
4. **28 822 € de virements `VIR SEPA Tighza perso`** — compte courant
   d'associé ou rémunération ? Le traitement fiscal n'est pas le même.
   Question pour Mme Daheron, pas une pièce à déposer.

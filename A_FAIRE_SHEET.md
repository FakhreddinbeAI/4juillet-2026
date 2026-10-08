# METTRE LE SHEET À JOUR — 08/10/2026

Feuille : **TGS 2026 — suivi des pièces (08-10)**
`https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU`

Deux gestes, dans cet ordre. Le second est le plus important.

## 1. COLLER LES 24 NOUVELLES LIGNES

Clic dans la **première cellule vide de la colonne A** (ligne 189 si tu as
bien collé les 15 précédentes), puis `Ctrl+V` du fichier
`a_coller_188.tsv`.

Elles portent `TRUE` en colonne A quand la pièce est déposée, donc **la date
de dépôt s'écrira toute seule** par `onEdit`. Comme ce sera la date du jour
et non la vraie, il faut ensuite :
1. sélectionner la colonne **K** sur les lignes collées et **supprimer** ;
2. relancer **`remplirDatesPortail`**, qui mettra les vraies dates du portail.

Les 24 lignes se répartissent ainsi :

| Action | Lignes | Quoi |
|---|---|---|
| A OBTENIR | 7 | les 6 factures Henry Schein impayées + Hostinger 2026 |
| LUCIE PAIE | 4 | ROTEC 5111168, 5113217, 5114472, 5124043 |
| A TRIER | 3 | la relance Henry Schein, Google GCFRD0011327141, Argoat 02/2026 |
| RIEN (déposées) | 10 | les 10 factures ROTEC déjà chez TGS |

## 2. CORRIGER DEUX LIGNES EXISTANTES — 2 000 €

Ces deux-là **existent déjà** au Sheet, avec un montant faux de mille euros
chacune. Il ne faut pas les recoller, il faut les rectifier.

Cherche la référence en colonne I (`Ctrl+F`) :

| Référence | Colonne | Avant | **Après** |
|---|---|---|---|
| **35195** | H Montant | 967,00 | **1 967,00** |
| | B Action | LUCIE PAIE | **A DEPOSER** |
| | C Cycle | A_PAYER | **PAYE** |
| **35435** | H Montant | 329,95 | **1 329,95** |
| | B Action | LUCIE PAIE | **A DEPOSER** |
| | C Cycle | A_PAYER | **PAYE** |

Les montants sont ceux lus dans les PDF **et** débités au relevé : 1 967,00 €
le 18/05 (« MIL avril 2026 ») et 1 329,95 € le 11/06 (« Made in labs
avril »). Le PDF et la banque disent la même chose.

En changeant l'Action, la ligne passera de bleu à vert : c'est normal, ces
deux factures sont payées et attendent d'être déposées.

## CE QUE J'AI VÉRIFIÉ AVANT DE TE DONNER CE BLOC

`verif_sheet.py` compare **ligne entière par ligne entière** ce que le Sheet
contient, ce que le bloc ajoute, et ce que le registre dit. Il doit rendre
`MANQUANT : 0` et `EN TROP : 0`.

Je l'ai écrit parce que ma première méthode, qui comparait sur une clé
(référence, ou fournisseur + montant à défaut), **avait silencieusement perdu
l'Argoat 02/2026** : cette pièce n'a ni numéro ni montant, donc sa clé était
identique à celle d'une autre Argoat. Une clé qui collisionne fait
disparaître une pièce sans rien dire.

C'est aussi ce contrôle qui a vu que les deux Made in Labs n'étaient pas à
ajouter mais à corriger. Une comparaison sur la clé aurait dit « déjà
présentes » et laissé les 2 000 € d'erreur en place.

## APRÈS

Le total doit être de **211 lignes de données**, ligne 2 à ligne 212.
Répartition attendue : 123 déposées, 17 payées à déposer, 21 chez Lucie,
38 à trier, 12 hors 2026.

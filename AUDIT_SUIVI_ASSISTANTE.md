# Dépouillement du classeur de l'assistante — 09/10/2026

Source : Google Sheet **« Compta - suivi mensuel »**, propriétaire
`assistante@implantologielege.com`, id
`1gMdQABvLZM1RN9lgWovpXfggjV08fYec0_B53Ji5pD0`, modifié le 02/10/2026.
Huit onglets mensuels, **223 lignes de facture**.

Outil : `lire_suivi_assistante.py`. Export en ODS, parsé localement, comparé au
registre ligne par ligne.

---

## Le résultat

**53 factures de l'exercice 2026 étaient absentes du registre, pour 18 643,87 €.**

Dont **8 déjà déposées au portail**, que `coherence.py` a redressées de lui-même
dès l'inscription des lignes. Il reste **45 pièces à localiser, 17 061,13 €**.

| fournisseur | pièces à localiser | montant |
|---|---:|---:|
| STRAUMANN | 7 | 5 968,89 € |
| NTJ | 5 | 2 819,00 € |
| ROTEC | 7 | 2 714,50 € |
| GACD | 10 | 1 821,69 € |
| MADE IN LABS | 1 | 1 207,00 € |
| BIOTECH | 2 | 719,50 € |
| SEPTODONT | 2 | 616,96 € |
| ONCD | 1 | 462,00 € |
| ARCADE | 6 | 344,97 € |
| BONGERT | 1 | 306,50 € |
| ARGOAT | 1 | 64,00 € |
| ORMCO | 1 | 19,20 € |
| PHARMACIE | 1 | 11,92 € |

Le registre passe de 229 à **282 pièces**. `coherence.py` ne sort aucune
divergence.

**Trois fournisseurs étaient totalement inconnus du registre : BIOTECH, ONCD et
PHARMACIE.** Deux autres y étaient à peine présents : ARCADE et ZIMVIE.

---

## Pourquoi ces pièces sont en `A_VERIFIER` et pas en `RECU`

Le classeur prouve que **la facture existe**. Il ne prouve pas qu'on en détient
le fichier. L'état `A_VERIFIER` dit exactement cela : la pièce est connue, le
justificatif reste à trouver au Drive ou à réclamer au fournisseur.

C'est la leçon du bilan 2025, où cinq justificatifs n'ont jamais été retrouvés :
mieux vaut une liste de 45 trous nommés qu'un trou inconnu.

---

## Mon premier chiffre était faux, et de 14 068 €

J'ai d'abord annoncé **32 711,89 €** sur 59 lignes. C'était faux, pour deux
défauts de mon propre parseur :

**1. Les échéances comptées comme des factures.** La facture Straumann
`9060109581` apparaît **quatre fois à 4 463,13 €**, sous les libellés
« 3ème échéance », « 4ème échéance »… Ce n'est pas quatre factures, c'est un
échéancier. Mon parseur prenait « 3ème échéance » pour un nom de fournisseur.

**2. Arcade compté en Straumann.** Les en-têtes `ARCADE`, `ZIMVIE`, `PHARMACIE`,
`DGFP` et `NEHOM` ne figuraient pas dans ma liste de fournisseurs. Un bloc dont
l'en-tête n'est pas reconnu n'ouvre pas de nouveau fournisseur : ses lignes
restaient collées au bloc précédent. Les pièces Arcade — numéros 8569392,
18719136, 8570251 — étaient donc comptées en Straumann.

Après correction et dédoublonnage par numéro : **53 factures, 18 643,87 €**.

C'est la même erreur de méthode que ce matin sur les doublons par taille
d'octets : un critère qui a l'air suffisant jusqu'à ce qu'on le teste.

---

## Une boucle fermée

Le scan GACD illisible de « 3 - DEPOSEES TGS » est identifié : **facture
2402229909 du 04/12/2025, 197,53 €**.

Deux sources concordent sans se connaître :

- l'arithmétique : 380,57 + 56,98 + 126,11 + **197,53** = **761,19 €**, le
  montant exact du virement groupé ;
- le classeur, onglet « Décembre », ligne 04/12/2025 · 197,53 · 2402229909.

Le fichier est renommé `2025-12-04_GACD_FACTURE_197.53_2402229909_scan-sans-texte.pdf`.

---

## Les anomalies à trancher

### 1. Straumann 9060109581 — l'échéancier, et son montant réel

Quatre échéances de 4 463,13 € pour une même facture datée du 28/05/2026. Si ce
sont quatre échéances d'une facture unique, **cette facture fait 17 852,52 €** et
c'est ce montant-là qui doit figurer au bilan, pas 4 463,13 €.

Le registre ne porte pour l'instant que 4 463,13 €, avec la mention « ligne
d'échéance, le montant est une échéance, PAS le total de la facture ». **C'est le
plus gros enjeu de tout le dépouillement** : 13 389 € d'écart possible.

À vérifier sur la facture elle-même, et au relevé LCL (quatre débits de
4 463,13 € doivent apparaître).

### 2. Deux numéros portant deux montants différents

| numéro | montants vus | onglets |
|---|---|---|
| GACD `2402336462` | **14,38 €** et **57,75 €** | Mai à Juillet |
| NTJ `20240304` | **747,00 €** et **147,00 €** | Juillet à / Mai à Juillet |

Soit une coquille de saisie, soit deux factures dont l'une porte un mauvais
numéro. Les deux montants sont au registre avec la mention du conflit.

### 3. ROTEC 5110950 réglée deux fois

Commentaire du classeur, onglet « Mars à Mai » :
> « Facture 15/01/2026 - 60,5 euros - N°5110950 réglée deux fois »

Ton assistante l'avait repéré. **60,50 € à récupérer auprès de ROTEC**, après
vérification au relevé.

### 4. Septodont 90056093 — 4,00 € d'écart

Classeur **368,73 €**, registre **364,73 €**. Seule divergence de montant sur
toutes les pièces communes aux deux sources, ce qui est plutôt rassurant. À
relire sur la facture.

### 5. ROTEC 5101378 — un numéro qui n'existe probablement pas

Le classeur écrit `5101378` pour la facture du 13/01/2026 à 60,50 €. Le Drive
contient `ROTEC - 5110778 - 14-01-2026`. Le classeur date systématiquement ses
lignes ROTEC de janvier **un jour plus tôt** que les noms de fichiers du Drive
(13/14/15 janvier contre 14/15/16). `5101378` est donc très probablement une
coquille pour **5110778**.

### 6. ONCD — deux chèques de 462 € le même jour

Onglet « Juillet à » : 26/01/2026, deux lignes de 462,00 €, chèques **8430662**
et **8430663**, numéros de pièce `262785280708` et `266020689680`. Cotisation
ordinale ? Deux praticiens ? À qualifier. Une seule des deux est au registre.

### 7. Les dates aberrantes du classeur

`31/06/2026`, `28/022026`, `13/03/0206`, `02/12/2026` pour une facture de 2025,
`30/12/1899` dans plusieurs cellules de date de règlement. Les lignes concernées
sont au registre **sans date**, avec la mention « DATE ABERRANTE DANS LE
CLASSEUR, non reportée ».

Pour la Septodont 90005673, le classeur dit « 02/12/2026 » et le PDF dit
« 02.12.25 » : **la lecture du document a primé**, la pièce est passée en
exercice 2025.

---

## Ce que ça change pour la suite

Les 45 pièces à localiser sont maintenant la plus grosse tâche du dossier, devant
les 38 « à trier » d'hier. Trois façons de les traiter, par ordre de rendement :

1. **Les chercher au Drive**, par numéro. Beaucoup y sont probablement déjà, mal
   nommées — c'est ce qu'a montré la balayage de ce matin.
2. **Les recouper au relevé LCL** : `audit_lcl.py` signale 190 débits sans
   justificatif pour 76 004,07 €. Ces 45 pièces en expliquent une partie.
3. **Réclamer ce qui manque** aux fournisseurs, Straumann et ROTEC d'abord.

Et un constat : ce classeur est tenu à jour par ton assistante en parallèle de
mon registre, sans que les deux se parlent. Les deux disent des choses vraies que
l'autre ignore. Tant qu'ils restent séparés, chaque dépouillement sera à refaire.

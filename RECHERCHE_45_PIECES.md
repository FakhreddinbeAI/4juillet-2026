# Recherche des 45 pièces dans le Drive — 09/10/2026

Méthode : recherche par **titre** d'abord (une correspondance dans le nom
s'auto-identifie), puis par **plein texte** pour les absentes. Les fichiers
Arcade et ROTEC ont été trouvés en listant leurs familles de noms plutôt
qu'une par une.

**Résultat : 16 trouvées, 29 introuvables.**

---

## La trouvaille qui domine tout le reste

La recherche a mis au jour un second tableau : **« Suivi factures Straumann
2026 »**, id `1juxcddu_3wrT3Hluxsd_AbYO4XNU8ZDcePHAxbbu5Vc`, propriétaire
`contact@`. Trente lignes, chaque facture avec son avoir lié et son statut.

Il répond à la question que je signalais ce matin comme le plus gros enjeu :

> `9060109581` · **22 315,65 €** · « Non réglée (**échéancier 5×4463,13**) »

**Cinq** échéances, pas quatre. Et surtout : la facture fait **22 315,65 €**,
alors que le classeur de l'assistante ne listait que les échéances et que j'avais
inscrit une échéance en croyant inscrire la facture.

**17 852,52 € de sous-évaluation** — de très loin la plus grosse correction du
dossier. Le montant est corrigé au registre.

Le fichier n'est pas au Drive : la colonne « Réf. PDF » porte **« voir
Paycenter »** au lieu d'une référence. La facture est à télécharger sur le
portail Straumann Paycenter.

### Et le reste du tableau Straumann

| | montant |
|---|---:|
| Total factures 2026 | 31 689,29 € |
| Total avoirs 2026 | −7 337,36 € |
| **Net facturé** | **24 351,93 €** |
| Total non réglé | 24 351,93 € |

Chaque facture « Soldée » de ce tableau est en réalité **annulée par un avoir du
même montant** (colonne « Doc lié »), pas payée. Le net facturé est donc
intégralement impayé.

Ce tableau contient **22 documents Straumann que mon registre ignore
totalement** : 9060006689, 9060011986, 9060017570, 9060024519, 9060032068,
9060034033, 9060036137, 9060040628, 9060048851, 9060051289, 9060051290,
9060059451, 9060063384, 9060063944, 9060079433, 9060082089, 9060083085,
9060084611, 9060102693, 9060102694, 9060106903, 9060106911 — factures et avoirs
mêlés. C'est le prochain chantier, et il faut le traiter en gardant les paires
facture/avoir ensemble, sinon on compte des charges qui ont été annulées.

---

## Les 16 pièces trouvées

| réf. | fournisseur | montant | fichier | dossier |
|---|---|---:|---|---|
| BIOF2607056018 | BIOTECH | 620,50 € | `BIOF2607056018.pdf` | à régler |
| BIOF2607056019 | BIOTECH | 99,00 € | `BIOF2607056019.pdf` | à régler |
| 36409 | MADE IN LABS | 1 207,00 € | `id=36409.pdf` | à régler |
| 24516832 | BONGERT | 306,50 € | `FACTURE_24516832.pdf` | à régler |
| 2402386339 | GACD | 312,84 € | `2402386339.pdf` | à régler |
| 5123110 | ROTEC | 99,50 € | `Facture client - 5123110 - 01-08-2026.pdf` | à régler |
| 20240312 | NTJ | 341,00 € | `NTJ aout` | à régler |
| 2402331992 | GACD | 28,00 € | `2402331992 GACD : 28` | Règlements Mai |
| 2402280246 | GACD | 427,78 € | `GACD - 2402280246. V1` | Règlements Mai |
| 9060084270 | STRAUMANN | 73,14 € | `Straumann 9060084270 - 73,14` | Règlements Mai |
| 18719136 | ARCADE | 123,99 € | `FAK18_12_205622_18719136_8570332_…` | Règlements Mai |
| 85700444 | ARCADE | 160,00 € | `FAK18_12_205622_18719137_8570444_…` | Règlements Mai |
| 433539 | PHARMACIE | 11,92 € | `2026-05-19_PHARMACIE-VISITANDINES_FACTURE_11.92.jpg` | réglées |
| 90041207 | SEPTODONT | 257,94 € | `Facture 90041207.pdf` | Downloads |
| 9060128654 | STRAUMANN | 134,34 € | `invoice-0982494040.pdf` | Downloads |
| 266020689680 | ONCD | 462,00 € | `cotisations ordinales 2026.pdf` | Comptabilité |

Les trois dernières ont été trouvées **par leur contenu, pas par leur nom** :
aucune ne porte son numéro dans le titre.

### Deux conventions de nommage apprises

**Arcade** : `FAK18_12_205622_<n°1>_<n°2>_<date>_<heure>.pdf`. Chaque fichier
porte **deux numéros**. Le classeur utilise parfois le premier, parfois le
second — d'où l'impression que les pièces manquaient.

**Straumann** : `invoice-0<réf. PDF>.pdf`, où la réf. PDF est la colonne du
tableau Straumann. C'est la clé pour retrouver les autres, si elles ont été
téléchargées.

### Une coquille de numéro

Le classeur écrit `85700444` (8 chiffres), le fichier dit `8570444`
(7 chiffres). Un zéro de trop à la saisie. Le vrai numéro est **8570444**.

---

## Les 29 introuvables

Elles n'existent nulle part au Drive, ni par titre ni par contenu : seulement
dans les tableaux de suivi.

**ROTEC, 2 614,50 € — le plus gros trou, et le plus net**

| réf. | date | montant |
|---|---|---:|
| 5115373 | 24/03/2026 | 930,00 € |
| 5115598 | 27/03/2026 | 581,50 € |
| 5115612 | 25/03/2026 | 528,50 € |
| 5118952 | 22/05/2026 | 382,50 € |
| 5115742 | 30/03/2026 | 132,00 € |
| 5101378 | 13/01/2026 | 60,50 € (numéro douteux, probablement 5110778) |

Tous les autres ROTEC de l'exercice sont au Drive, sous le nom
`Facture client - <n°> - <date>.pdf`. Ces six-là manquent, et cinq d'entre elles
sont de mars 2026 : il manque visiblement un lot entier. **À réclamer à ROTEC** —
et ça rejoint le message qu'on garde pour Lucie.

**STRAUMANN, 23 613,33 €** — 9060109581 (22 315,65 €, à prendre sur Paycenter),
9060109569 (472,74 €), 9060109572 (691,20 €), 9060121791 (134,34 €),
9060131185 (0,00 €).

**GACD, 1 051,07 €** — 2402318938, 240235574, 2402358750, 2402359883,
2402361965, 2402363184, 2402365910. Le numéro `240235574` fait 9 chiffres là où
tous les autres GACD en font 10 : coquille probable.

**NTJ, 2 478,00 €** — 202400268, 20240242, 20240256, 20240304. Attention,
`202400268` a un zéro de trop : c'est très probablement la **20240268**, celle
qui a été **déposée deux fois** au portail et que mon registre connaît déjà à
776,00 €. À vérifier avant de la réclamer.

**ARCADE, 60,98 €** — 8569392 (282,97 €), 8569411 (12,00 €), 8570729
(−123,99 €), 8570863 (−110,00 €). Les deux derniers sont des **avoirs**, et
8570729 à −123,99 € est exactement l'opposé de la facture 18719136 : il
l'annule.

**Autres** — SEPTODONT 900049585 (359,02 €), ARGOAT ARG11138 (64,00 €),
ORMCO 331200806 (19,20 €).

---

## Une facture découverte en chemin

`ntj septembre 2029` (le nom porte une coquille, c'est 2026), dans « factures à
régler » : **facture NTJ 20240346, septembre 2026**. Elle n'est **ni dans le
classeur de l'assistante, ni dans mon registre**. Montant à lire.

---

## Deux choses à savoir

**Le classeur de l'assistante a été modifié ce matin à 08h40**, pendant notre
session. Elle y travaille. Mon dépouillement est un instantané : il faudra le
relancer, et `lire_suivi_assistante.py` est fait pour ça.

**Le registre est maintenant à 282 pièces et 240 994,44 € de charges 2026
identifiées.** Les états : 164 déposées, 28 reçues, 47 à vérifier, 19 renommées,
12 manquantes.

---

## Ce que je ferais ensuite, par rendement

1. **Les 22 documents Straumann du second tableau**, en gardant les paires
   facture/avoir. C'est là que sont les montants.
2. **Réclamer les 6 ROTEC**, dont 5 de mars 2026 — un lot entier manque, c'est
   le trou le plus net et le plus facile à combler.
3. **Télécharger 9060109581 sur Paycenter** : 22 315,65 €, la plus grosse pièce
   de l'exercice, et on n'en a pas le justificatif.
4. **Vérifier si `202400268` est bien la 20240268** avant toute réclamation à
   NTJ.

# Ce qui manque au bilan 2026

*Fichier de travail pour la fin d'exercice. Établi le 6 octobre 2026, à jour
du dépôt de 15h30.*

> **Avant d'utiliser cette liste, la revérifier.** Six fois le 6 octobre j'ai
> annoncé des pièces manquantes qui étaient déjà déposées. La commande qui
> tranche :
> ```
> python3 -I audit_portail.py registre_2026.csv \
>         historique_portail.txt historique_portail_statuts.txt
> ```
> Une pièce n'est manquante que si l'historique du portail l'ignore.

---

## 1. À réclamer aux fournisseurs

Vérifié le 06/10 : aucune de ces pièces n'est ni au Drive, ni au portail.

| Fournisseur | Pièce | Montant | Où la chercher |
|---|---|---|---|
| MADE IN LABS | facture du 31/05 | 3 522,72 € | le fournisseur. Connue par la seule relance du 17/08 |
| MADE IN LABS | facture du 30/06 | 3 089,02 € | idem |
| COFICA | loyer 750004781830 | 1 353,76 € | agence 95908. Le registre dit « fichier nommé Cofibail 06-07 2026, sans extension » — jamais retrouvé |
| COFICA | 2 loyers non identifiés | 2 707,52 € | 10 prélèvements au relevé pour 7 factures au registre |
| ROTEC | factures sous la relance C012667 | 1 004,50 € | ROTEC. La relance existe, les factures d'origine non |
| ARIES | 3 factures | 2 970,00 € | espace entrepreneurs.com. Rien reçu depuis juin |
| ZFX | facture R-2602.52453 du 13/02 | 253,99 € | ZFX. Connue par la seule mise en demeure |
| STRAUMANN | facture 9060125749 | 100,74 € | eShop Straumann. Connue par la seule ligne du relevé de compte du 24/07 |
| CANVA | 3 factures | 36,00 € | canva.com, ou la boîte perso du Dr |
| ADF | la vraie facture | 389,00 € | adfcongres.com, Espace Apprenant. Ce qui est déposé est une **confirmation d'inscription** |
| SEPTODONT | facture d'origine du rappel du 27/08 | — | le fournisseur |
| PETRO-OUEST | ticket du 05/04/2026 | 116,33 € | la voiture, le bureau. Débit `CB97PETRO-OUEST 05/04/26` au relevé 50 |
| NEOHM | 2ᵉ moitié de FR153116 ou FR154597 | 1 105,20 € | NEOHM. Le virement du 11/12 de 2 210,40 € couvre **deux** factures, une seule moitié est au portail |

**Sous-total identifié : environ 18 000 €** de pièces qui existent chez un
tiers et qu'il suffit de demander.

---

## 2. Le vrai trou : 16 134 € prélevés sans AUCUNE facture au dossier

Quinze fournisseurs prélèvent chaque mois. **Pas une seule facture d'eux dans
le registre.** Ce ne sont pas des pièces égarées : elles n'ont jamais été
collectées.

| Fournisseur | Débits | Total |
|---|---|---|
| LIXXBAIL | 12 | 7 197,67 € |
| DOCTOLIB | 10 | 1 490,00 € |
| AMAZON | 14 | 1 338,27 € |
| RECEPT AI | 10 | 1 244,00 € |
| ICARE | 10 | 1 040,00 € |
| FREE | 19 | 936,07 € |
| BNP PARIBAS LEASE | 10 | 800,00 € |
| CM-CIC LEASING | 3 | 683,16 € |
| IONOS | 10 | 294,00 € |
| HOSTINGER | 1 | 244,66 € |
| ADOBE | 10 | 239,90 € |
| SPOTIFY | 10 | 212,40 € |
| OPENAI | 2 | 203,98 € |
| APPLE | 11 | 179,89 € |
| MICROSOFT | 3 | 30,00 € |
| **TOTAL** | **135** | **16 134,00 €** |

**C'est le premier poste de ce fichier, et de loin.** Chaque facture se
télécharge sur un espace client, en quelques minutes par fournisseur. Le
Lixxbail à lui seul fait 7 198 € — et c'est un crédit-bail, donc une pièce
que TGS réclamera forcément.

Deux remarques :
- **AMAZON, SPOTIFY, APPLE, MICROSOFT** : à trancher avant de réclamer. Une
  partie est peut-être personnelle, et dans ce cas elle n'a pas à figurer au
  bilan — elle relève du compte courant d'associé.
- La plupart arrivent sur **ftighza@gmail.com**, non connectée ici. Le
  branchement de cette boîte en lecture débloquerait l'essentiel.

---

## 3. À qualifier avant de pouvoir conclure

Ni manquant ni présent : indéterminé. Le dire est plus utile que de deviner.

| Pièce | Ce qui bloque |
|---|---|
| MUTUALEASE `020-FL-32158803` | le registre la dit déposée le 28/07, mais ce numéro est absent de l'historique. Un `f 020 fl 30525487 mutualease` y est, sous un autre numéro |
| MUTUALEASE `020-FC-01179765` | FC et non FL : décompte ou loyer ? Nature à confirmer |
| ARGOAT | trou apparent : mars, mai, juin, juillet reçus. Avril et août manquent-ils, ou n'ont-ils jamais existé ? |
| GACD | rien avant juillet 2026 au Drive, alors que GACD facture régulièrement |
| CMV MEDIFORCE | 80,00 € à ventiler. 13 pièces déposées le 29/07, dont 7 couvrent des périodes 2025 |
| `Scan2026-07-30_121442` | 2 pages, **pas de couche texte**. Drive ne rend que « Untitled ». À ouvrir à l'œil |
| `Scan2026-07-30_121631` | idem |

---

## 4. Pour Mme Daheron — des questions, pas des pièces

Ces flux existent au relevé et sont parfaitement documentés. Ce qui manque
n'est pas un justificatif, c'est une **décision comptable**.

| Flux | Montant | La question |
|---|---|---|
| `VIR SEPA Tighza perso` | 28 822 € | compte courant d'associé ou rémunération ? Le traitement fiscal diffère. **C'est la vraie question du dossier.** |
| virements à la SELARL | 16 000 € | même question, en sens inverse |
| `CHQ IRREGUL 2491605` | 2 440,25 € | contrepartie introuvable |
| `LAURENT FIGARD` | 8 005,93 € | nature à qualifier |
| `Marion NOILHETAS` | 1 984,19 € | nature à qualifier |
| SCM LEGESMILE | 76 997 € versés contre 120 314,80 € appelés | écart de 43 318 € : régularisation à venir, ou appel non soldé ? |

---

## 5. Déjà traité, pour ne pas le redemander

Six fausses alertes du 6 octobre, toutes dues à la même faute — lire le
registre et prendre son silence pour une absence.

| Ce que j'annonçais manquant | La réalité |
|---|---|
| les 3 tableaux d'amortissement des prêts | déposés : `lcl pret 09 2024 1`, `2`, `3` |
| quote-part SCM 120 314,80 € | dans la répartition de charges déposée le 21/09 |
| compte courant SCM 9 787,35 € | **dans le même fichier**, ligne « solde CC » |
| attestation Madelin MACSF | déposée le 21/09 |
| DGFiP 22 €, « saisie possible » | payée le 09/03, `VIR SEPA DGFP` au relevé 49 |
| amende 75 € | payée par saisie le 26/02, `BLOCAGE SUR PCE262177909` |
| avoir STRAUMANN 9060136144 | dans `Scan2026-07-30_121534` |
| 2ᵉ relance STRAUMANN | dans `Scan2026-07-30_120331` |

---

## En une ligne

Les pièces à réclamer font ~18 000 €, mais **le vrai sujet est les 16 134 €
d'abonnements jamais collectés** — et la clé de ce poste est le branchement
de la boîte `ftighza@gmail.com` en lecture.

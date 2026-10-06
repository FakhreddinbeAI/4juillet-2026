# Ce qui manque au bilan 2026

*Fichier de travail pour la fin d'exercice. Établi le 6 octobre 2026, à jour
de la récolte dans `ftighza@gmail.com` (16h).*

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
| ARIES | **1** facture, celle de janvier 2026 | 990,00 € | à réclamer. Débit `CB97ARIES CONSUL 24/01/26` au relevé 47 |
| ZFX | facture R-2602.52453 du 13/02 | 253,99 € | ZFX. Connue par la seule mise en demeure |
| STRAUMANN | facture 9060125749 | 100,74 € | eShop Straumann. Connue par la seule ligne du relevé de compte du 24/07 |
| CANVA | 5 factures | 60,00 € | **espace client canva.com** uniquement. Les mails n'ont pas de PDF, et déc. 2025, mai, juil., août et sept. 2026 manquent même dans la boîte |
| ADF | la vraie facture | 389,00 € | adfcongres.com, Espace Apprenant. Ce qui est déposé est une **confirmation d'inscription** |
| SEPTODONT | facture d'origine du rappel du 27/08 | — | le fournisseur |
| PETRO-OUEST | ticket du 05/04/2026 | 116,33 € | la voiture, le bureau. Débit `CB97PETRO-OUEST 05/04/26` au relevé 50 |
| NEOHM | 2ᵉ moitié de FR153116 ou FR154597 | 1 105,20 € | NEOHM. Le virement du 11/12 de 2 210,40 € couvre **deux** factures, une seule moitié est au portail |

**Sous-total identifié : environ 18 000 €** de pièces qui existent chez un
tiers et qu'il suffit de demander.

---

## 2. Les abonnements : 16 134 € prélevés, et seuls 4 fournisseurs facturent par mail

**Récolte du 06/10 dans `ftighza@gmail.com` : 35 factures sur la période.**
Le constat le plus utile est négatif — **quatorze fournisseurs sur dix-huit
n'envoient aucune facture par mail.** Il faudra passer par leur espace client,
et le Dr doit y être connecté.

### Récupéré (4 fournisseurs, tout est là)

| Fournisseur | Factures | Période | Note |
|---|---|---|---|
| DOCTOLIB | 10 | déc. 2025 → sept. 2026 | aucun trou |
| RECEPT AI | 10 | déc. 2025 → sept. 2026 | facturé par **Budgie S.A.S.** — c'est pour ça que « recept » ne trouvait rien |
| IONOS | 10 | déc. 2025 → sept. 2026 | le relevé porte le n° de facture (`Fact. 202543127270`) : appariement un à un possible |
| MACSF | 1 attestation | 2025 | **contrat P15001 confirmé**, 4 936,81 € de cotisations déductibles en 2025 |

### À prendre sur l'espace client (13 fournisseurs)

| Fournisseur | Montant LCL | Ce que la boîte mail donne |
|---|---|---|
| **LIXXBAIL** | **7 197,67 €** | rien. Contrat **EM002148431**. Crédit-bail : la pièce la plus importante du dossier |
| AMAZON | 1 338,27 € | rien. 50+ commandes, bien plus que les 14 débits pro → tri à faire |
| ICARE | 1 040,00 € | rien. C'est l'**entretien du Volkswagen**, pas un logiciel |
| FREE | 936,07 € | 9 avis sans PDF. **Avril 2026 manque même en avis** |
| BNP PARIBAS LEASE | 800,00 € | rien. Crédit-bail, factures par courrier |
| CM-CIC LEASING | 683,16 € | géré par **Mutualease**. Les mails annoncent un duplicata, l'original part par courrier ou Chorus Pro |
| IONOS | — | *(récupéré)* |
| HOSTINGER | 244,66 € | rien sur la période. **Et `drtighza.fr` a expiré le 11/06/2026** |
| ADOBE | 239,90 € | un rappel de renouvellement, pas de facture |
| SPOTIFY | 212,40 € | rien. Probablement personnel |
| APPLE | 179,89 € | 2 PDF de févr. 2026, et **31 reçus écrits dans le corps du mail**, sans PDF. 31 reçus pour 11 débits : mélange perso/pro certain |
| MICROSOFT | 30,00 € | rien |
| CANVA | 36,00 € | avis sans PDF |

### Deux corrections que la récolte a produites

**ARIES : il ne manque pas trois factures, mais une.** L'abonnement s'est
**arrêté** — dernier débit le 26/05/2026, et les relevés vont jusqu'au 05/10.
Quatre mois sans prélèvement, et rien dans la boîte depuis mai. Les factures
de juin à septembre n'existent pas. Seule celle de **janvier 2026** manque.

**Et Aries coûte 1 017,73 € par mois, pas 990 €.** Chaque débit porte une
`COM CHANGE` de 27,73 € que la facture de Dubaï ne mentionne pas :
**168,35 € de commissions de change sur l'année**. C'est une charge bancaire
déductible pour laquelle aucun justificatif fournisseur n'existera jamais —
le relevé est la pièce.

**OPENAI : deux problèmes distincts, pas un.** Le LCL porte deux débits de
101,99 € (`CB97OPENAI *CHAT`, 29/12 et 28/01) **sans facture**. Et Chrome a
trouvé deux factures de septembre (80,09 € + 39,91 €) qui **ne correspondent à
aucun débit LCL** : elles ont été payées sur une **Mastercard •••• 0422**, qui
n'est pas le compte de la SELARL. L'abonnement ChatGPT Business, ouvert le
04/03/2026, n'apparaît nulle part.

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

---

## 6. La Mastercard •••• 0422 — à qualifier d'urgence

OpenAI et Entrepreneurs.com (un « PASS VIP – Semaine du Scaling » de 32,09 $
le 27/08/2026) sont payés avec cette carte. **Elle n'est pas la carte LCL de
la SELARL**, dont les tickets portent `••••2097`, et aucun de ces débits
n'apparaît sur les relevés.

Deux conséquences, et il faut trancher avant la clôture :

- si c'est une **carte personnelle**, ces dépenses ne sont pas des charges de
  la SELARL. Elles relèvent du compte courant d'associé — et des factures
  existent à leur nom, ce qui pourrait conduire à les imputer à tort.
- si c'est un **second compte professionnel**, alors il manque un relevé
  bancaire entier au dossier, et les contrôles de complétude faits sur le LCL
  et le BNP ne couvrent pas tout.

**La deuxième hypothèse est la plus grave** : elle invaliderait partiellement
le rapprochement. À vérifier en premier.

## 7. Hors comptabilité, mais à savoir

**`drtighza.fr` a expiré le 11/06/2026** — hébergement et nom de domaine. Ce
n'est pas un sujet de bilan, mais ça se voit de l'extérieur.

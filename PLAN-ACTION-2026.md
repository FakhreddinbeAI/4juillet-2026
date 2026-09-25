# PLAN D'ACTION — COMPTABILITÉ 2026

SELARL TIGHZA · exercice du 01/01/2026 au 31/12/2026 · cabinet TGS France
Établi le 25/09/2026

---

## Pourquoi ce plan

Le bilan 2025 a coûté trois semaines de travail à rebours, et **263,15 € de
justificatifs définitivement perdus**. La cause n'était pas la paresse : les
pièces existaient presque toutes. Elles étaient éparpillées, mal nommées, et
surtout **rien ne disait lesquelles étaient parties chez le comptable**.

L'exercice 2026 est déjà entamé aux trois quarts. Il reste trois mois pour
reprendre la main avant que TGS ne réclame — leur demande est tombée le
3 juillet pour le bilan 2025, donc vers **juillet 2027** pour celui-ci.

---

## Le principe, en une phrase

> Une pièce se traite le jour où elle arrive, pas le jour où le comptable
> la réclame.

---

## Les quatre étapes du circuit

### 1 · RÉCUPÉRER

Les pièces arrivent par quatre canaux, et c'est ce qui rend le suivi difficile.

Quatre boîtes mail alimentent la comptabilité. **Deux ne sont pas encore
branchées** sur l'assistant : `ftighza@gmail.com` et
`secretaire@implantologielege.com`. Tant que ce n'est pas fait, les factures
Canva et l'identité de l'assureur prévoyance restent hors de portée.

| Canal | Ce qui y arrive | Où ça atterrit |
|---|---|---|
| Automatisation Gmail (`contact@`) | pièces jointes des mails reçus | `Mon Drive > FACTURATION` |
| `ftighza@gmail.com` — **à brancher** | Canva, prévoyance Madelin P15 001 | nulle part |
| `secretaire@implantologielege.com` — **à brancher** | secrétariat | nulle part |
| Courrier papier | COFICA, CPAM, URSSAF, MACSF | scanner → `Scan Cabinet*.pdf` |
| Espaces clients | ADF, Mutualease, Hostinger, Recept AI | à télécharger à la main |
| Lisa et Lucie | factures fournisseurs du cabinet | Drive partagé, étape 1 |

**Point d'attention :** l'automatisation dépose bien les pièces jointes dans
`FACTURATION`, mais sous leur nom brut (`GCFRD0014124467.pdf`). Elle ne
renomme pas, ne trie pas, et ne dépose rien sur le portail.

### 2 · TRIER

Tout ce qui arrive n'est pas une facture fournisseur.

| Nature | Destination |
|---|---|
| Facture fournisseur, avoir, ticket | circuit factures (Drive partagé) |
| CPAM, mutuelles, SNIR, SCM | `Comptabilité > 05 - Fiscal & Social` |
| URSSAF, retraite, paie | `Comptabilité > 07 - RH & Paie` |
| TGS Avocats | `Comptabilité > 06 - Juridique` |
| Relance d'impayé | `Factures_impayees` |
| Contrat, leasing, abonnement | `Comptabilité > 04 - Contrats` |

### 3 · RENOMMER

```
AAAA-MM-JJ_FOURNISSEUR_TYPE_MONTANT_REFERENCE[_Pdébut-au-fin][_DUPLICATA].pdf
```

- **Date de la pièce**, pas du scan
- **Montant TTC**, point décimal, jamais recopié depuis le nom du fichier :
  il faut ouvrir le PDF
- **Période** dès qu'il y en a une — c'est elle qui rattache la charge au bon
  exercice, pas la date d'émission

Types : `FACTURE` `AVOIR` `TICKET` `CONTRAT` `RELEVE` `ATTESTATION` `RELANCE`
`INDU` `AFFILIATION` `AR` `RECU`

Le renommage se fait avec Claude in Chrome, **par lots de 5 fichiers**.
Prompt : `prompt_renommage.md`.

### 4 · TÉLÉVERSER

Dépôt sur https://monespaceclient.tgs-france.fr, puis le fichier descend dans
`3 - DEPOSEES TGS > 2026 > <mois>`.

**Avant chaque dépôt, chercher la référence dans l'historique.** Bredent a été
déposé trois fois en 2025, Anthropic d'août deux fois en 2026.

**Un doublon se prouve, il ne se devine pas.** Ouvrir les deux PDF, constater
le même **numéro de pièce**, puis vérifier un élément de détail — bon de
livraison, ligne de produit, période. Le montant, le nom de fichier et la
taille ne sont pas des preuves. Un laboratoire peut facturer 45,00 € deux
mois de suite pour deux travaux différents.

> Rappel : « Dépôt OK » et « En cours de traitement » veulent dire *reçu, pas
> encore traité*. L'absence en comptabilité ne prouve rien.

---

## Le rythme

| Quand | Quoi | Combien de temps |
|---|---|---|
| Chaque vendredi | vider `FACTURATION` : renommer, déposer, ranger | 20 min |
| Le 5 du mois | tableau de suivi des règlements + relevé LCL + tickets | 30 min |
| Chaque trimestre | `python3 compta2026.py` — trous, doublons, nommage | 1 h |
| Janvier 2027 | clôture : les 12 mois sont-ils complets ? | ½ journée |
| Vers juillet 2027 | réponse à la demande TGS | quelques jours |

---

## L'outillage

| Fichier | Rôle |
|---|---|
| `registre_2026.csv` | une ligne par pièce, tenue au fil de l'eau |
| `compta2026.py` | détecte les trous sur les récurrents, les doublons, les noms non conformes |
| `suivi_2026.csv` | export réimportable dans Google Sheets |
| `prompt_renommage.md` | à coller dans Claude in Chrome |
| `prompt_depot.md` | idem, pour le téléversement |

```bash
python3 compta2026.py                      # contrôle
python3 compta2026.py --export suivi.csv   # export Sheets
```

---

## Ce qu'il reste à faire maintenant

### Urgent — délai légal

**CPAM Vendée, indu de 96,75 €.** Créance 2606534061, courrier du 06/08 déposé
le 11/08. Deux mois pour payer ou contester, soit **mi-octobre**. Passé ce
délai, prélèvement d'office et pénalité possible.

### Pièces à récupérer

| Quoi | Où | Montant |
|---|---|---|
| 3 factures Made in Labs (mai, juin, juillet) | le fournisseur | 8 316,98 € |
| 5 factures COFICA (mars à juillet) | Cofica Bail, agence 95908 | 6 768,80 € |
| Factures Médiforce février à août | à ventiler depuis les 13 pièces déposées | 560,00 € |
| Factures Canva juillet et août | boîte perso ou canva.com | 24,00 € |
| Facture La Fraise depuis juillet | vérifier si l'abonnement existe encore | — |
| Facture Aries / Entrepreneurs.com 2026 | espace client | 990 €/mois |
| Vraie facture ADF | Espace Apprenant adfcongres.com | 389,00 € |
| Attestation Madelin P15 001 | **assureur inconnu** — voir ci-dessous | — |
| Facture Septodont d'origine | le fournisseur | — |

### Montants à vérifier

**16 pièces sont au registre sans montant confirmé** — 6 Google Workspace,
6 Anthropic, 2 Mutualease, Médiforce, Argoat avril. Les fichiers sont dans le
Drive : il suffit de les ouvrir. Tant que le montant n'est pas lu, la ligne
reste `A_VERIFIER`.

### L'énigme de la prévoyance

TGS réclame l'attestation Madelin du contrat **P15 001**. Introuvable dans la
boîte du cabinet et dans le Drive. Le contrat est personnel (TNS), donc la
correspondance part sur `ftighza@gmail.com`.

**Le moyen le plus sûr de l'identifier : ouvrir un relevé LCL de 2026 et lire
le libellé du prélèvement de prévoyance.** Il nomme l'assureur, et donne le
montant annuel — qui est exactement ce que l'attestation certifie.

### Deux angles morts à traiter

**Canva** arrive sur la boîte personnelle. Soit on change l'adresse de
facturation vers `contact@`, soit on met un transfert automatique. Sinon on
oubliera encore.

**Lucie rapatrie certaines factures en parallèle** de l'automatisation. C'est
ce qui a produit le doublon Anthropic d'août. Une règle suffit : *les factures
d'abonnement arrivent automatiquement dans `FACTURATION`, personne ne les
redépose à la main.*

---

## Le bilan 2025 est CLOS

Confirmé par la comptable **par téléphone le 25/09/2026**. Le contrat de
prévoyance a été fourni, et plus rien n'est attendu sur l'exercice 2025 :
ni les relevés de compte, ni la 2ᵉ facture NEOHM, ni les 642 € de TGS Avocat,
ni les comptes SCM Legesmile, ni les tableaux de février à avril.

**Ne plus relancer personne sur 2025.** Si TGS y revenait, ce serait une
nouvelle demande, à traiter comme telle.

Toute l'attention va désormais à l'exercice 2026.

## Avertissement sur la sauvegarde

Ce dossier de travail a été perdu **deux fois** — le conteneur est recyclé
après quelques jours d'inactivité, et le `git push` est refusé parce que
l'application GitHub de Claude n'est pas installée sur le dépôt.

**Tous ces fichiers sont donc copiés dans le Drive.** C'est le Drive qui fait
foi, pas cette machine. Pour réparer GitHub : https://claude.ai/connect-github,
un propriétaire de l'organisation doit installer l'app.

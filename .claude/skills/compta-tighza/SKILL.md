---
name: compta-tighza
description: >
  Comptabilité de la SELARL TIGHZA (cabinet dentaire, Legé 44650) avec le
  cabinet TGS France : récupération des factures, tri, nommage, dépôt sur le
  portail, registre annuel et réponse aux demandes du comptable. À déclencher
  dès que l'utilisateur mentionne TGS, bilan, factures, justificatifs,
  pièces manquantes, relevés, dépôt sur le portail, classement Drive, ou
  nomme un fournisseur du cabinet (COFICA, Straumann, Mutualease, Médiforce,
  Argoat, Aries, Made in Labs, Septodont...).
---

# Comptabilité SELARL TIGHZA ⇄ TGS France

## Le dossier

| | |
|---|---|
| Société | SELARL TIGHZA — 1 rue de Chambord, 44650 Legé |
| RCS | Nantes 911 470 177 |
| Exercice | année civile, clos au 31/12 |
| Comptable | Florence DAHERON — Florence.DAHERON@tgs-france.fr |
| Gestionnaire | Aurélie GUILLOTEAU — Aurelie.GUILLOTEAU@tgs-france.fr — 02 28 00 23 96 |
| Juridique | TGS France Avocats — M<sup>e</sup> Mélanie ROUGER (dépôts INPI) |
| RH / paie | In Extenso — Chloé Chambellan |
| Portail | https://monespaceclient.tgs-france.fr |
| Banques | **deux comptes.** `LCL` — compte de la SELARL, relevés du 6 d'un mois au 5 du suivant, c'est lui qui porte les règlements fournisseurs et les virements CPAM. `BNP 2112` — compte pro du Dr personne physique, qui porte les rétrocessions de Johanne, un prêt, une assurance et les frais bancaires. |
| Où sont les relevés | **sur l'ORDINATEUR du cabinet**, jamais sur le Drive, et ça ne changera pas. LCL n'est pas « absent » : il est hors de portée de *cette* session, mais une tâche planifiée liée à la machine le lit déjà. |
| Relevé LCL | compte **07480070666**. Fichier `COMPTEPROLCL_07480070666_AAAAMMJJ.pdf` déposé dans `C:\Users\conta\Downloads`, puis archivé dans `Documents\Compta SELARL\03 - Releves bancaires\AAAA\`. Lu sur la machine avec `pdftotext -layout`. |
| Équipe | Lisa et Lucie, assistantes (assistante@implantologielege.com) |

Attention : les mails de TGS partent parfois de l'adresse de Florence Daheron
mais sont **signés Aurélie Guilloteau**. Lire la signature avant de répondre.

## Les sources — où vivent les pièces

**Boîtes mail.** Quatre adresses alimentent la comptabilité. Toutes ne sont
pas encore branchées sur l'assistant.

| Adresse | Ce qui y arrive | Branchée ? |
|---|---|---|
| `contact@implantologielege.com` | l'essentiel : fournisseurs, TGS, patients | oui |
| `ftighza@gmail.com` | boîte perso du Dr — **Canva**, et très probablement la **prévoyance Madelin P15 001** | **à brancher** |
| `secretaire@implantologielege.com` | secrétariat | **à brancher** |
| `assistante@implantologielege.com` | Lucie — reçoit Septodont, GACD | non |

**RÈGLE — pas de transfert de courrier depuis la boîte personnelle.**
Aucun mail ne doit partir de `ftighza@gmail.com` vers `contact@`,
`secretaire@` ou `assistante@` : pas de renvoi automatique, pas de règle de
transfert. On y accède en **lecture** par connecteur.

En revanche les **factures** y vont bien : on ouvre la pièce jointe et on la
dépose dans le Drive de `contact@`, dossier `FACTURATION`, au bon nom. C'est
le document qui circule, pas le mail.

Tant que `ftighza@gmail.com` n'est pas accessible en lecture, deux angles
morts subsistent : les factures Canva et l'identité de l'assureur prévoyance.

### Le dernier import depuis la boîte perso : 9 juillet 2026

Vérifié dans le Drive, pas déduit. Les sept PDF Canva (12/2025 → 06/2026)
portent tous `createdTime 2026-07-09T10:22Z`, et le dossier `Jan-Mai 2025
(boite ftighza)` (id `1Rk09zvyXgRvhMXMyczpg1EMP7LFQ8P6e`) porte
`2026-07-09T14:08Z`. Aucun autre fichier du Drive ne porte le nom de cette
boîte : il n'y a eu **qu'un seul import**.

Le connecteur Gmail lit `contact@` — les liens de résultat portent
`authuser=contact@implantologielege.com`. C'est la vérification à refaire pour
savoir si la boîte perso est branchée : une recherche `from:canva` qui ne
rend rien signifie qu'elle ne l'est pas.

### Quand elle sera branchée — la procédure d'import

Un connecteur n'est lu qu'**au démarrage d'une session**. Après l'avoir
ajouté, il faut donc une **nouvelle session** : inutile de chercher à le voir
apparaître dans celle en cours.

1. Confirmer l'accès : `from:canva` doit rendre des résultats, et les liens
   porter `authuser=ftighza@gmail.com`.
2. Balayer à partir du **09/07/2026** — rien avant, c'est déjà importé, et
   réimporter créerait des doublons que la règle 4 interdit de trancher à
   l'amiable.
3. Cibles connues : **Canva** juillet, août, septembre, octobre (12,00 €,
   émise le 6 de chaque mois) et la **prévoyance Madelin MACSF P15 001**.
4. Télécharger les pièces jointes dans le Drive de `contact@`, dossier
   `FACTURATION`. **Le document circule, jamais le mail** — aucun transfert,
   aucune règle de renvoi.
5. Inscrire au registre, renommer selon la convention, puis déposer.

Et la question de fond à poser au Dr, parce qu'elle vaut mieux qu'un import
récurrent : **faire basculer la facturation Canva sur `contact@`** depuis
canva.com. Ces factures sont établies à son nom sans SIREN — leur place dans
la SELARL est de toute façon à valider par la comptable.

**Drive partagé « Lisa et Lucie - Suivi compta »** (id `0AGRDLERQ9FC3Uk9PVA`) :
c'est le drive lui-même, partagé avec Lisa et Lucie. Lucie y est
*organisateur*, le compte `contact@` seulement *organisateur de contenu* —
d'où l'impossibilité de déplacer les fichiers qu'elle y dépose.

**Automatisation Gmail** : dépose les pièces jointes dans `Mon Drive >
FACTURATION` (id `1Wl82iXKZmGD4iNzYuVN06gQ6jYKnLxCt`) sous leur nom brut. Elle
ne renomme pas, ne trie pas, ne dépose rien sur le portail.

## État du dossier

**L'exercice 2025 est CLOS** — confirmé par la comptable par téléphone le
25/09/2026. Le contrat de prévoyance a été fourni. Plus rien n'est attendu
sur 2025 : ne plus relancer personne dessus. Si TGS y revenait, ce serait une
nouvelle demande.

**L'exercice en cours est 2026**, clos au 31/12/2026, demande TGS attendue
vers juillet 2027.

## Les dix règles

**1. « Dépôt OK » ne veut pas dire traité.** Sur le portail, `Dépôt OK` et
`En cours de traitement` signifient *reçu, pas encore intégré*. L'absence en
comptabilité ne prouve pas l'absence de dépôt. **L'historique des dépôts fait
foi.**

**2. Le montant exact est la seule clé.** Même fournisseur + montant différent
= ce n'est pas la pièce. `RECEPT AI 25.pdf` (25 €) ne couvre pas 90,80 €.

**3. Lire la PÉRIODE, jamais la date d'émission.** Une facture de mars 2026
peut couvrir avril→juin 2026. Trois pièces déposées pour le bilan 2025
étaient hors exercice pour cette raison.

**4. Exiger le n° de pièce sur les avoirs.** Un avoir Straumann a été déclaré
couvert parce que quinze autres fichiers portaient le même montant.

**5. Les tickets ne survivent pas six mois.** Cinq perdus sur 2025, 263,15 €.
Un ticket se photographie le jour même.

**6. Le contrat n'est pas chez le financeur.** Le crédit-bail « CMV Médiforce
A1S88001 » est en réalité un bon de commande **Henry Schein** de décembre 2024.
Chercher chez le vendeur du matériel, pas chez l'organisme de financement.

**7. Vérifier avant de déposer.** Bredent déposé 3×, Anthropic d'août 2×.

**7 bis. UN DOUBLON SE PROUVE, IL NE SE DEVINE PAS.** Ne jamais déclarer
deux pièces identiques sur la foi du montant, du nom de fichier ou de la
taille en octets. Il faut **ouvrir les deux PDF** et constater que le
**numéro de pièce** est le même, puis qu'au moins un élément de détail
concorde — bon de livraison, ligne de produit, période. Même fournisseur +
même montant ne prouve rien : un laboratoire peut facturer 45,00 € deux mois
de suite pour deux travaux différents. Tant que ce n'est pas vérifié, la
pièce reste où elle est, et on le signale.

**8. Une facture peut être scindée.** NEOHM : 2 210,40 € en deux moitiés.

**9. Certaines demandes ne sont pas des pièces.** TGS pose aussi des questions ;
elles se répondent par écrit.

**10. Ne jamais conclure depuis un nom de fichier, une taille ou un montant.**
Ouvrir le PDF. C'est la règle dont toutes les autres découlent.

**11. LE CONTRÔLE PART DE LA BANQUE.** Un registre construit depuis les
fournisseurs ne voit que ce qu'on sait déjà chercher. Un relevé bancaire est
exhaustif : tout débit sans justificatif est un trou par construction. C'est
ainsi qu'on a découvert une échéance de prêt de 636,01 €/mois sans tableau
d'amortissement et une assurance prélevée depuis des mois sans contrat —
aucune des deux n'était au registre. Outil : `controle_bancaire.py`.

**12. PÉRIMÈTRE DU CONTRÔLE BANCAIRE** — fixé par le Dr le 01/10/2026. On ne
suit que **facture, avoir, prélèvement, rétrocession de Johanne**. Sont
exclus : les **virements CPAM**, qui sont réconciliés par l'**export LOGOS**
du bilan et ne se saisissent jamais à la main ; et les prélèvements du gérant
comme les mouvements entre entités, qui ne se justifient pas par une pièce
fournisseur. Les mouvements hors périmètre restent dans les données pour que
le recalcul des soldes continue de prouver que la saisie est complète, mais
ils ne partent pas à l'export.

## Qui lit quoi — ne pas refaire le travail d'un autre

Trois mécanismes se partagent les flux bancaires. Avant de saisir quoi que ce
soit, vérifier lequel couvre déjà la ligne.

| Flux | Qui s'en occupe | Destination |
|---|---|---|
| Crédits LCL : virements **patients** et **mutuelles/OCAM** | tâche planifiée *Relevé LCL – virements patients*, le 6 du mois, sur la machine | Sheet *Suivi virements patients — saisie Logos*, puis saisie par Marion |
| Crédits LCL : **CPAM, MSA, ENIM** | **export LOGOS** du bilan | jamais à la main |
| **Débits LCL** : factures, avoirs, prélèvements | **personne — c'est le trou** | `controle_bancaire.py` |
| BNP : rétrocessions Johanne, prêt, assurance, frais | `controle_bancaire.py` | feuille *CONTROLE BANCAIRE 2026* |

La tâche du 6 exclut volontairement CPAM, MSA, ENIM, remises CB et chèques,
virements internes et Dr Loiseau. Elle ne regarde **que les crédits**. Les
débits LCL — c'est-à-dire tous les règlements fournisseurs — ne sont extraits
par rien. C'est la seule pièce manquante du dispositif.

**Attention en modifiant cette tâche :** elle est liée à un ordinateur. Un
changement de prompt depuis une session cloud renvoie `needs_device_approval`
et ne s'applique pas. Il faut le faire depuis une conversation liée à cette
machine. Le nom, l'horaire et l'activation, eux, se changent d'ici.

## La convention de nommage

```
AAAA-MM-JJ_FOURNISSEUR_TYPE_MONTANT_REFERENCE[_Pdébut-au-fin][_DUPLICATA].pdf
```

Types : `FACTURE` `AVOIR` `TICKET` `CONTRAT` `RELEVE` `ATTESTATION` `RELANCE`
`INDU` `AFFILIATION` `AR` `RECU`. Montant TTC, point décimal, sans symbole ;
omis quand la pièce n'en porte pas.

## Le circuit

```
Drive partagé                           Mon Drive
  Lisa - Lucie : factures à régler         FACTURATION  ← automatisation Gmail
  Lucie - Lisa : factures réglées          Comptabilité Cabinet Tighza
  3 - DEPOSEES TGS > année > mois            00 TGS · 01 Fournisseurs · 02 Recettes
  4 - A TRIER                                03 Relevés · 04 Contrats
  0 - MODE D EMPLOI                          05 Fiscal & Social · 06 Juridique
  0 - PROMPT RENOMMAGE                       07 RH & Paie · 08 Bilan 2026
```

Une pièce ne descend dans `3 - DEPOSEES TGS` **que** lorsqu'elle est
réellement sur le portail. Ce qui reste en amont est la liste de ce qu'il
reste à faire.

## Les outils

`compta2026.py` lit `registre_2026.csv` et signale les trous sur les
récurrents, les doublons et les noms non conformes. `--export` produit un CSV
pour Google Sheets. Les prompts Claude in Chrome sont dans
`prompt_renommage.md` — **lots de 5 fichiers, une tâche à la fois, texte plat**.

`controle_bancaire.py` fait l'inverse : il part des relevés. Une ligne par
mouvement, le justificatif attendu en face, et deux colonnes pour le dépôt sur
le portail. Il recalcule le solde de chaque relevé à partir des mouvements
saisis et vérifie le chaînage d'un mois au suivant — c'est ce double contrôle
qui prouve qu'aucun mouvement n'a été oublié. `controle_bancaire.gs` installe
les cases à cocher et l'horodatage dans la feuille Google ; **il doit être créé
depuis la feuille, par Extensions → Apps Script, jamais comme projet autonome**,
sinon `getActiveSpreadsheet()` renvoie null et `onEdit` ne part pas.

`tableau_tgs.gs` met en forme la feuille des pièces : vraies cases à cocher à
la place des `FALSE`, montants convertis en nombres, horodatage, couleurs par
état, filtre, et la colonne **Ouvrir** qui pointe sur chaque pièce.

### Apps Script — cinq pièges payés cash

1. **Découper en étapes et appeler `flush()` après chacune.** Un script
   monolithique a cassé sur « Service Spreadsheets failed » après 69 secondes :
   Apps Script accumule les écritures et les envoie au dernier moment, donc un
   échec en fin de parcours laisse un état indéterminé. Découpé, le même
   travail passe en 4 secondes et le journal dit où ça s'arrête.
2. **Rendre chaque étape relançable.** `getConditionalFormatRules()` puis
   `push` empile les mêmes règles en double à chaque relance. Il faut
   **remplacer**, pas ajouter — sinon la première relance après un échec
   partiel abîme la feuille.
3. **Pas de formule écrite par le script.** `setFormulas()` n'adapte pas le
   séparateur d'arguments : une formule à virgules dans un classeur en
   français donne `#ERROR!` sur toute la colonne. Poser le lien directement
   sur le texte avec `setRichTextValue()`, l'URL construite en JavaScript.
   `#ERROR!` est une erreur de **syntaxe**, pas de valeur.
4. **Jamais de texte riche vide.** `newRichTextValue().setText("")` lève une
   exception. Si le tableau est construit en entier avant d'être écrit, cette
   exception tombe avant la moindre écriture : rien ne bouge et rien ne
   l'explique. Sauter les lignes vides, et vider la colonne **avant** la
   boucle pour qu'un passage laisse toujours une trace visible.
5. **Nommer une fonction corrigée autrement.** Deux versions de suite ont
   semblé échouer alors qu'elles ne tournaient pas : le collage n'avait pas
   été enregistré, et c'était l'ancienne fonction qui s'exécutait. Le signe à
   lire : un journal **sans aucune ligne `Logger.log`** alors que la nouvelle
   version en écrit une. Un nom neuf rend le problème visible — s'il
   n'apparaît pas dans la liste déroulante, le fichier n'est pas enregistré.

Et la règle qui couvre les cinq : **vérifier dans la feuille, pas dans le
journal**. Lire la colonne par le connecteur Drive a tranché chaque fois.

## Les récurrents

| Fournisseur | Rythme | Montant | Piège |
|---|---|---|---|
| COFICA BAIL (980 750 019 180 56) | mensuel | 1 353,76 € | la facture de décembre couvre janvier |
| Mutualease / CM-CIC (FT0801600) | trimestriel | 182,30 € | matériel informatique, ≠ Médiforce |
| CMV Médiforce (A1S88001) | mensuel | 80,00 € | contrat = Henry Schein 12/2024, 36 mois |
| Aries / Entrepreneurs.com | mensuel | 990,00 € | débité 1 019,70 € : +3 % commission de change LCL, à imputer en frais bancaires |
| Google Workspace | mensuel | 91,08 € | facture émise le dernier jour du mois, envoyée le 1er du suivant |
| Anthropic | mensuel | 108,00 € | depuis février 2026 ; tarif antérieur différent |
| Canva | mensuel | 12,00 € | factures sur la boîte **personnelle** du Dr |
| Argoat, Made in Labs, Straumann, GACD, Rotec, Bredent, Osseo Shop | variable | — | labos, noms de fichiers illisibles |
| MACSF | annuel | 229,39 € | **deux contrats distincts** : RCP + protection juridique n° 7904376-52, et prévoyance Madelin **P15 001**. Même espace client macsf.fr, identifiant 7904376. L'attestation fiscale Madelin s'y télécharge en janvier pour l'année écoulée. |

## Le rythme

Chaque vendredi vider `FACTURATION` (renommer, déposer, ranger) · le 5 du mois
tableau de suivi + relevé LCL + tickets · chaque trimestre `compta2026.py` et
tour des espaces clients · janvier clôture · printemps-été la demande TGS.

## Règles de conduite

- Ouvrir le PDF, ne jamais déduire d'un nom de fichier.
- Confronter plutôt que rassurer : si un chiffre ne tombe pas juste, le dire.
- La parole du Dr prime sur toute déduction automatique.
- Vérifier ses propres totaux avant de les livrer.
- Ne pas s'engager sur une date dans un mail à TGS sans l'avoir demandé.
- **Le Drive fait foi, pas le conteneur** : il a été effacé deux fois, et le
  push GitHub est refusé (app Claude non installée sur le dépôt).

## Le Drive voit l'ordinateur — et agit dessus

Google Drive for Desktop **miroite le PC** : `Downloads`, `Desktop` et
`Documents` existent sur le Drive, sous l'ID parent
`1zGylp2Z6rJ0dhE1TrpEE9ixKb6gUdjZv`. Le dossier Téléchargements est
`1adB-euhu-ZkMQ1E07_J5azVWgWji2Zat`.

**Conséquence utile :** un relevé posé dans les Téléchargements du PC devient
lisible depuis l'assistant, sans qu'il soit déposé nulle part. C'est comme ça
que le relevé BNP 26009 a été traité le 05/10/2026.

**Conséquence dangereuse :** ce qu'on fait dans ces dossiers se répercute sur
le disque. Déplacer un fichier hors de `Downloads` le retire du PC, et le
mettre à la corbeille le supprime du PC. Donc dans un dossier miroité :
**copier, jamais déplacer, et ne jamais mettre à la corbeille.** Un doublon
`Nom (1).pdf` qui réapparaît après un déplacement est la resynchronisation du
fichier local — le laisser tranquille.

## Règle 13 — où vivent les pièces (posée le 06/10/2026)

**Ce qui est sur le Bureau reste sur le Bureau. Ce qui est sur le Drive va
dans le drive partagé « Lisa et Lucie - Suivi compta ».**

| Destination | Quoi |
|---|---|
| `Lucie - Lisa : factures réglées` | ce qui est payé |
| `Lisa - Lucie : factures à régler` | ce qui ne l'est pas |

Et surtout : **ne jamais déplacer un fichier du Bureau ni de Documents.**
`Bureau > Comptabilité Cabinet Tighza` est dans le miroir Drive pour
ordinateur — l'en sortir le supprimerait du disque. Pour ceux-là, copier.

### Comment trancher payé / non payé — VOIR LA RÈGLE 20, qui remplace ceci

> **Cette section a été écrite le matin du 06/10/2026 et la règle 20, posée
> par le Dr l'après-midi, la remplace.** Elle est conservée pour mémoire,
> rayée, parce que les deux critères qu'elle proposait ont tous les deux
> produit de fausses conclusions dans la journée.

~~1. Prélèvement automatique → réglée.~~ **Faux.** « Cofica est prélevé » ne
dit pas *quelle* échéance est payée : dix prélèvements Cofica font 1 353,76 €
au centime. Le mode de paiement qualifie le fournisseur, jamais la pièce.

~~2. Total payé au fournisseur ≥ total facturé → réglées.~~ **Faux, et
démontré le 06/10.** Le raisonnement est vide quand le registre ne porte
aucune facture du fournisseur — ROTEC : zéro facture enregistrée, donc la
comparaison compare à rien. Il est faux aussi quand les paiements règlent un
exercice clos : sur 45 402 € que j'annonçais manquants chez quatre
fournisseurs, 23 927 € soldaient **2025**, et les 16 288 € de Straumann
étaient entièrement imaginaires.

3. **Une relance, une mise en demeure ou un retour de chèque → à régler**,
   quoi que dise le reste. Celui-là tient : c'est une preuve directe.

**La règle qui s'applique est la 20 : le paiement n'est prouvé que par le
relevé LCL**, soit parce que le libellé du débit porte la référence de la
pièce, soit parce que le montant est unique des deux côtés. Sinon la chaîne
ne s'incrémente pas, et `A_TRIER` veut dire « je ne peux pas prouver ».

Reste vrai de cette section : **le comptage**. Dix prélèvements pour sept
factures prouve que les sept sont payées et que trois manquent. Et
l'appariement chronologique est trompeur — la fenêtre des relevés commence le
06/12/2025, donc tout est décalé d'un rang.

### Le déplacement vers le drive partagé est À SENS UNIQUE

`contact@` est **organisateur de contenu** sur « Lisa et Lucie - Suivi
compta », pas organisateur. Conséquence vérifiée le 06/10 : on peut y
**déposer** un fichier, on ne peut plus l'en **sortir**. L'erreur est donc
irréversible sans Lucie.

À faire AVANT tout déplacement, et pas après : vérifier que la pièce n'y est
pas déjà sous un autre nom. Lucie nomme en brut — `2402391923.pdf` — là où
nous nommons selon la convention. La même facture peut donc exister deux
fois sans que le nom le signale.

C'est arrivé : la facture GACD 2402391923 est aujourd'hui dans « réglées »
sous son nom de convention ET dans « à régler » sous `2402391923.pdf`.
Classée payée et impayée à la fois, et je ne peux pas le corriger.

**Et « à régler » est le domaine de Lucie.** On y ajoute, on n'y retire
rien, on n'y réarbitre rien.

## Règle 14 — LIRE LE MODE D'EMPLOI AVANT DE RANGER QUOI QUE CE SOIT

À la racine du drive partagé « Lisa et Lucie - Suivi compta » :
**`0 - MODE D EMPLOI (a lire avant de deposer)`**
(id `1h9VwrcKLQ_r-um_Jk3ImFdD2Cp3z13gqWxyqGa_KnBQ`)

Mis en place le 30/07/2026, mis à jour le 02/09. Je ne l'avais jamais ouvert
et j'ai passé une journée à reconstruire un circuit qui existait déjà.

### Le circuit est en QUATRE étapes, pas deux

| Étape | Dossier | Qui, quoi |
|---|---|---|
| 1 | `Lisa - Lucie : factures à régler` | Lisa y dépose tout ce qui arrive |
| 2 | `Lucie - Lisa : factures réglées` | Lucie règle, **renomme**, puis dépose sur le portail |
| 3 | `3 - DEPOSEES TGS` > année > mois | **uniquement** quand la pièce est réellement sur le portail |
| 4 | `4 - A TRIER` | montant illisible, pièce douteuse, doublon suspect |

**Toute l'astuce est l'étape 3** : ce qui reste dans « réglées » est exactement
la liste de ce qu'il reste à déposer. Le Google Sheet refait ce que ce dossier
fait déjà — préférer le dossier, il ne peut pas se désynchroniser.

**Et l'étape 4 existe pour ne pas deviner.** Une pièce dont on ne peut pas
prouver le paiement va dans `4 - A TRIER`, jamais dans « à régler ».

### Ce qui ne passe PAS par ce circuit

> **ATTENTION — ce tableau est PÉRIMÉ sur la première ligne.** Le Dr a posé
> le 06/10/2026 une règle qui prime : **tout ce qui est sur le Drive se
> consolide dans le drive partagé**, y compris les relances. `Factures_impayees`
> n'est plus la destination. Sa règle passe avant le mode d'emploi du 30/07.
>
> Le reste du tableau tient : les courriers d'organismes vont bien dans le
> Drive du Dr.

| Quoi | Où |
|---|---|
| ~~Relances de fournisseurs impayés~~ | ~~`Factures_impayees`~~ → **drive partagé** |
| CPAM, mutuelles, SNIR, SCM | `Comptabilité Cabinet Tighza > 05 - Fiscal & Social` |
| URSSAF, retraite, paie | `07 - RH & Paie SELARL (In Extenso)` |
| TGS Avocats | `06 - Juridique` |
| Pièce réclamée par TGS pour le bilan | `00 - TGS (demandes en cours)` |

### Le portail : le statut ne dit pas ce qu'on croit

Sur **https://monespaceclient.tgs-france.fr**, « Dépôt OK » et « En cours de
traitement » signifient **reçu, pas encore traité**. Une pièce absente de la
comptabilité peut donc avoir été fournie. **C'est l'historique des dépôts qui
fait foi, jamais la comptabilité.**

### Les cinq erreurs que le document chiffre

1. Un nom ressemblant n'est pas la bonne pièce. Même fournisseur + montant
   différent = ce n'est pas la pièce.
2. Lire la date d'émission au lieu de la période couverte. Trois factures
   déposées en 2025 concernaient le mauvais exercice.
3. Un ticket de caisse se photographie le jour même.
4. Déposer deux fois : Bredent l'a été trois fois.
5. **Une facture peut être scindée.** NEOHM : 2 210,40 € en deux moitiés de
   1 105,20 € — vérifié dans le LCL, le virement du 11/12 règle FR153116 ET
   FR154597, et le portail n'a que « 1sur 2 ». La seconde moitié manque.

Et le rappel qui revient : **la banque du cabinet est le LCL, pas la BRED.**
« VIR INST BRED Neohm » est le virement *vers* Neohm, dont la banque est la
BRED — pas un compte du cabinet.

## Règle 15 — chercher au portail AVANT de dire qu'une pièce manque

Le 6 octobre 2026, quatre fois dans la même journée, j'ai annoncé des pièces
manquantes qui étaient déjà déposées : Ormco, Straumann, Rotec et NTJ ; les
trois tableaux d'amortissement des prêts ; la quote-part SCM de 120 314,80 €
et le compte courant de 9 787,35 €. Total des fausses alertes : plus de
174 000 €, dont une que j'avais classée « de loin le premier enjeu du
dossier ».

**La faute, toujours la même : lire le registre et prendre son silence pour
une absence.** Le registre est une vue partielle, construite ici. L'historique
des dépôts du portail fait foi — le mode d'emploi du drive le dit, et je l'ai
oublié quatre fois.

**La procédure, maintenant outillée :**

```
python3 -I audit_portail.py registre_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
```

Quatre colonnes, et la dernière compte autant que les autres :

- **tranchées à la main** — `etat` à `DEPOSEE` ou `HORS PERIMETRE`. Une
  décision humaine ; l'index ne la contredit pas.
- **déjà au portail** — la référence se retrouve dans un nom déposé.
- **absentes** — référence exploitable, introuvable. À déposer.
- **sans référence exploitable** — on ne peut PAS conclure, et on le dit.
  Deviner ici, c'est fabriquer un faux.

**Deux garde-fous, chacun payé d'un faux résultat.** On indexe les suites de
chiffres et non les mots, parce que les noms sont saisis à la main avec des
espaces dans les numéros (« 1144 05 » pour la facture 114405). Et une
référence réduite à une année est refusée : « QP-2025 » tombait sur
« 2025 12 31 BNP 2112 RELEVE 25012.pdf ».

**Un fichier peut porter plusieurs pièces du registre.** La répartition de
charges SCM au 31/03/2026 contient à la fois la quote-part 2025 (ligne
`755000 QP FRAIS GENERAUX A REINTEGRER`, colonne DR TIGHZA-SELARL) et le solde
du compte courant 45530000 (ligne `APPORTS ASSOCIES 2025`, intitulée
`solde CC`). Je cherchais le second comme une pièce séparée. Avant de réclamer
une pièce, ouvrir celles qu'on a déjà.

## Règle 16 — les vérifications en suspens vivent dans un fichier, pas dans la conversation

`A_VERIFIER_PLUS_TARD.md` tient les contrôles qui demandent un accès que je
n'ai pas : banque en ligne, portail fournisseur, réponse de la comptable.
**À relire au début de chaque séance.**

Chaque entrée dit **où regarder**, **ce qui est déjà établi**, et **quoi
conclure selon le résultat** — y compris le résultat qui me donne tort. Sans
la dernière colonne, la reprise coûte de refaire tout le raisonnement, et on
le refait mal.

Quand le Dr dit « je ne peux pas vérifier maintenant, garde ça pour plus
tard », c'est là que ça va. Pas dans une note de bas de page du registre, où
je ne la relirai pas.

## Règle 17 — le portail réécrit les noms, et c'est la cause de mes trous d'index

Chrome l'a établi le 06/10/2026 en déposant le lot Aries : **l'historique du
portail affiche les noms en minuscules, avec des espaces à la place des
tirets, des underscores et des points.**

`2026-02-01_ARIES_FACTURE_990.00_F-2026-02-000008793.pdf` devient
`2026 02 01 aries facture 990 00 f 2026 02 000008793.pdf`

C'est le mécanisme exact qui m'a fait rater sept pièces pourtant déposées :
`020-FC-01179765` déposé en `020 FC 01179765`, `04753-52817600` en
`04753 52817600`. **Une référence contenant un séparateur n'existe jamais
telle quelle dans l'historique.** D'où l'indexation par groupes de chiffres
de `index_portail.py`, et non par la référence collée.

Corollaire pour les prompts de dépôt : **ordonner de chercher le numéro
complet, jamais le nom du fournisseur.** Une recherche sur « ARIES » ramène
les quatre factures 2025 et fait croire que le lot est déjà déposé.

**Et ne jamais tronquer une référence dans une sortie d'outil.** Le 06/10
j'ai annoncé au Dr que le registre portait des références tronquées : c'était
mon propre `%-16s` qui les coupait. Une sortie qui ment sur ses données est
pire qu'une sortie large.

## Règle 18 — lire l'en-tête du Sheet avant d'y écrire, et le vérifier dans le code

Le 06/10/2026 j'ai écrit un script de cochage en **devinant** que la case
était en colonne K et l'horodatage en L. La vraie structure du Sheet
« TGS 2026 — pieces a deposer » est :

| col | contenu |
|---|---|
| A | **Depose TGS** — la case à cocher |
| B | **Horodatage** |
| C | Etat · D Date · E Fournisseur · F Type · G Montant |
| H | Reference |
| I | Periode · J Nom de fichier |
| K | **Point de vigilance** |
| L | **Ouvrir** — le lien rich-text vers le Drive |

Résultat : `true` écrit dans les points de vigilance, l'horodatage par-dessus
**cinq liens Drive détruits**, et aucune case cochée. Le journal annonçait
pourtant « Cochees : 5 nouvelles » — il disait vrai sur la correspondance en
colonne H et faux sur tout le reste.

**Deux règles qui en sortent :**

1. **Lire l'en-tête avant d'écrire.** `read_file_content` sur l'id du Sheet
   rend la structure complète en un appel. Dix secondes contre cinq liens
   perdus.
2. **Vérifier l'en-tête DANS le script, et s'arrêter si elle ne correspond
   pas.** Un script qui écrit à l'aveugle sur une position supposée finira
   par écraser autre chose. Celui qui compte ses lignes sans vérifier où il
   écrit annonce un succès en détruisant des données — c'est ce qui s'est
   passé.

## Règle 19 — la catégorie de dépôt est toujours « Je ne sais pas où déposer ce document »

Ce n'est **pas** un recours en cas d'hésitation : c'est la règle. **C'est TGS
qui impute les pièces, pas nous.** Une pièce rangée dans la mauvaise catégorie
leur coûte plus de temps qu'une pièce non rangée.

Le 06/10/2026 j'ai écrit « Mes fournisseurs (Achats) / Mes factures d'achat »
dans deux prompts Claude in Chrome. **Dix pièces sont parties dans la mauvaise
catégorie** — les cinq Aries et les cinq du lot 7 — avant que le Dr ne le
voie.

L'origine de l'erreur est instructive : le gabarit PROMPT 2 disait « *Si tu
hésites, prends « Je ne sais pas où déposer ce document »* ». J'ai lu ça comme
une porte de sortie et j'ai « amélioré » le prompt en imposant une catégorie
précise. **Durcir une consigne qu'on n'a pas comprise, c'est la casser.**

**Et on ne redépose pas pour corriger** : c'est l'erreur n° 4 du mode d'emploi
(Bredent déposé trois fois). Une pièce mal catégorisée est au portail ; elle
se signale à Aurélie GUILLOTEAU, elle ne se redépose pas.

## Règle 20 — la chaîne ne s'incrémente que sur preuve au relevé LCL

Consigne du Dr, 06/10/2026 : « *c'est une chaîne à suivre donc sauf si toi tu
vois que c'est payé sur le relevé de compte du LCL, on n'incrémente pas* ».

**Les quatre états sont les quatre dossiers du drive partagé** — c'est toute
l'astuce du système, et il suffisait de la lire :

| état | dossier |
|---|---|
| `A_TRIER` | `4 - A TRIER` |
| `A_PAYER` | `Lisa - Lucie : factures à régler` |
| `PAYE` | `Lucie - Lisa : factures réglées` |
| `ENVOYE_TGS` | `3 - DEPOSEES TGS` |

`cycle_vie.py` calcule cette colonne. **Deux preuves, et deux seulement :**
l'historique du portail pour `ENVOYE_TGS`, le relevé LCL pour `PAYE`.

**Ce qui ne suffit pas :**

- **le dossier où Lucie l'a rangée.** C'est une affirmation, pas une preuve.
- **le fait que le fournisseur soit prélevé.** « Cofica est prélevé » ne dit
  pas *quelle* échéance est payée : dix prélèvements Cofica font tous
  1 353,76 € au centime.

Un paiement n'est prouvé que de deux façons : la **référence de la pièce lue
dans le libellé** du débit, ou un **montant unique des deux côtés** — unique
au relevé *et* unique au registre. Sinon la chaîne ne bouge pas, et `A_TRIER`
veut dire « je ne peux pas prouver », pas « c'est perdu ».

**Corollaire : on ne prépare que des lots de pièces payées.** Mes lots du
06/10 puisaient dans « à régler », donc dans l'impayé — le lot Septodont
contenait quatre factures impayées sur cinq, pour 763,76 € dus.

**Et ce contrôle a démenti ma propre alerte du jour.** J'annonçais la DGFiP de
22 € comme l'urgence du dossier, « délai expiré depuis mars, saisie
possible ». Le relevé 49 montre `VIR SEPA DGFP` de 22,00 € le 09/03/2026 :
payée depuis sept mois. Et l'amende de 75 € a été payée par saisie
(`BLOCAGE SUR PCE262177909`, 26/02). Je n'avais jamais cherché le paiement
au relevé avant de crier à l'urgence.

## Règle 21 — une absence de mention n'est pas une preuve d'absence

Le 06/10/2026 j'avais inscrit au registre que le ticket La Cascade de 69,20 €
était « non déductible » au motif qu'**aucun convive n'y était mentionné**.
Le Dr a corrigé : c'était un repas professionnel.

C'est la même faute que les six fausses alertes du jour, appliquée à la
déductibilité au lieu des pièces manquantes : **prendre un silence pour une
preuve.** Un ticket ne dit pas qui était à table ; il ne dit pas non plus que
personne n'y était.

**La bonne formulation** n'est pas « non déductible » mais « déductibilité à
établir : il manque le motif et les convives ». Et la bonne action est de
**demander**, pas de conclure.

**Ce qu'il faut sur une note de restaurant**, et que le ticket ne porte
jamais : le motif professionnel, le nom et la qualité des convives. À écrire
sur la pièce ou dans une note déposée avec elle. Sans ça, la charge est
fragile même quand elle est légitime — et le dire au Dr est utile, alors que
la déclarer non déductible était faux.

À noter aussi : un ticket de **boissons sans nourriture** relève des frais de
réception plutôt que du repas d'affaires. La distinction change le compte
d'imputation, et c'est TGS qui tranche.

## Règle 22 — valider le JavaScript avant de l'envoyer, et le garder court

Trois fois dans la journée du 06/10/2026 : `SyntaxError: Unexpected end of
input`. Jamais une faute de syntaxe — **toujours un collage tronqué.** La
troisième fois, le script faisait 125 lignes dont trente lignes de données
très longues ; la coupure est tombée à la ligne 100.

**Deux gestes, avant tout envoi de script :**

1. **Valider.** `cp script.gs /tmp/t.js && node --check /tmp/t.js`. Un
   comptage d'accolades ne suffit pas : il dit « équilibré » sur du code
   cassé. `node --check` tranche en une seconde, et il faut l'extension
   `.js` — il refuse `.gs`.
2. **Raccourcir.** Sortir des données tout ce qui n'y est pas indispensable :
   les notes longues deviennent des constantes indexées par fournisseur. Le
   même script est passé de 125 à 84 lignes et de lignes à 180 caractères à
   aucune au-delà de 84.

**Et si l'erreur arrive quand même** : vérifier d'abord que le fichier envoyé
est valide, puis demander la ligne citée. Si elle tombe au milieu d'une
fonction, c'est le collage, pas le code — inutile de réécrire le script, il
suffit de le raccourcir.

## Règle 23 — ne jamais dire à Chrome de sauter la vérification

Le 06/10/2026 j'ai écrit dans un prompt de dépôt : « *PAS DE VERIFICATION
PREALABLE DANS L'HISTORIQUE. J'ai controle : aucune facture Doctolib, Ionos ou
Recept AI n'a jamais ete deposee.* »

**Je n'avais pas contrôlé.** Mon propre index a trouvé, dix minutes plus tard,
que les **douze factures Ionos de 2025 étaient déposées** depuis le 06/06,
sous la forme `IN 2025 MM 09 <référence>.pdf` — dont celle de décembre 2025,
qui était dans mon lot. Et `RECEPT AI 25 .pdf` correspond très probablement à
la facture de 25,00 € du même lot.

Deux fautes superposées : affirmer un contrôle que je n'avais pas fait, et
**retirer le garde-fou** qui l'aurait rattrapé. Chrome aurait vu le doublon si
je l'avais laissé chercher.

**La vérification dans l'historique reste dans tous les prompts de dépôt.**
Elle coûte quelques secondes par pièce ; un doublon coûte le démêlage, et
c'est l'erreur n° 4 du mode d'emploi — Bredent déposé trois fois.

**La seule exception légitime** est une pièce sans numéro, comme un ticket de
caisse : il n'y a alors rien à chercher. Et même là, on le dit en expliquant
*pourquoi*, pas en affirmant un contrôle.

## Règle 24 — `coherence.py` passe avant toute affirmation sur l'état du dossier

Écrit le 06/10/2026 après une journée de fautes qui avaient toutes le même
point commun : **rien ne les contredisait automatiquement.**

```
python3 -I coherence.py registre_2026.csv lcl_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
```

Il compare trois sources — ce que je crois (le registre), ce que TGS a reçu
(l'historique), ce que la banque a payé (le relevé) — et sort les divergences.
**Sortie vide = seul résultat acceptable.** Il a trouvé du premier coup :

- **42 pièces au portail dont l'état disait le contraire.** Je ne mettais à
  jour que celles déposées de ma main ; celles que l'index trouvait restaient
  marquées non déposées.
- **Une ligne de l'historique collée sur la précédente.** Un `cat >>` sur un
  fichier sans retour à la ligne final avait soudé la première ligne ajoutée à
  la dernière existante, avalant le nom d'une facture Aries dans le champ
  statut. L'index ne la voyait plus, et je l'annonçais absente du portail.
  **Un `printf '\n' >>` avant tout ajout, et le contrôle vérifie désormais la
  terminaison de chaque fichier.**
- **Un emplacement qui affirmait « déposé le 28/07 »** pour une Mutualease
  dont le numéro est absent de l'historique. `cycle_vie.py` ne croit plus un
  emplacement : il exige l'état `DEPOSEE`, qui lui-même exige une preuve.

**Et l'état `DEPOSEE` ne se décrète pas.** Si la référence ne se retrouve pas
dans l'historique, la note doit **nommer le dépôt entre apostrophes**, et le
contrôle vérifie que ce nom existe vraiment. Une affirmation non vérifiable
est signalée comme telle.

## Règle 25 — la mise en forme du Sheet se pose sur les COLONNES, jamais sur les lignes

Le 08/10/2026 le Dr signale que chaque ligne ajoutée au tableau sort nue :
pas de case à cocher, pas de couleur d'état, pas de format sur le montant —
et qu'il demande la correction à Chrome tous les jours.

**La cause est dans mon propre script.** `tableau_tgs.gs` posait tout sur des
plages bornées par le nombre de lignes du moment :

```javascript
var nb = nbLignes_(f);
f.getRange(2, COL_DEPOSE, nb, 1).insertCheckboxes();
.setRanges([f.getRange(2, COL_ETAT, nb, 1)])
```

Une ligne au-delà de `1 + nb` est hors plage. Le script était correct le jour
où il a tourné, et faux le lendemain.

**`format_permanent.gs` le corrige** : tout se pose de la ligne 2 à
`getMaxRows()`, cases à cocher comprises sur les lignes vides — c'est ce qui
fait qu'une ligne neuve en a une sans rien relancer. La règle conditionnelle
`=$A2=TRUE` propage sa référence relative vers le bas toute seule.

Le filtre aussi doit couvrir toute la feuille, sinon une ligne neuve sort des
tris sans qu'on le voie.

**Et un déclencheur `onChange`** rejoue la pose quand Sheets agrandit la
grille au-delà de `getMaxRows()`.

**La leçon générale** : une mise en forme calculée sur l'état actuel des
données est une dette. Elle doit porter sur la structure — une colonne, un
type — pas sur un décompte.

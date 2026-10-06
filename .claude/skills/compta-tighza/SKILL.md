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

### Comment trancher payé / non payé sans deviner

Trois critères, par ordre de force. Si aucun ne tranche, la pièce va dans
**à régler** : c'est le défaut prudent, parce qu'une facture classée à tort
en « réglées » ne sera jamais réclamée, alors qu'une relance inutile ne coûte
rien.

1. **Prélèvement automatique** → réglée. Le prélèvement ne se négocie pas.
   Vaut pour COFICA, Anthropic, Google Workspace, Canva, Aries, La Fraise,
   Doctolib, Icare, IONOS, Free, Apple, Recept AI, MACSF, URSSAF, CARCDSF.
2. **Total payé au fournisseur ≥ total facturé** → les pièces au dossier sont
   réglées. GACD 5 499 € payés contre 2 016 € facturés, Straumann 16 704 €
   contre 493 €.
3. **Une relance, une mise en demeure ou un retour de chèque** → à régler,
   quoi que dise le reste. C'est une preuve directe de l'impayé.

**Ce qui NE tranche pas** : un appariement montant par montant. Dix
prélèvements COFICA font 1 353,76 € au centime, sept factures Google
Workspace 91,08 €. Et l'appariement chronologique est trompeur : la fenêtre
des relevés commence le 06/12/2025, donc le premier paiement de l'année règle
une facture de décembre — tout est décalé d'un rang. Le **comptage**, lui,
est solide : dix prélèvements pour sept factures prouve que les sept sont
payées, et que trois factures manquent.

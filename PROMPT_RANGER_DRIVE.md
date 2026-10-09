# Ranger « 3 - DEPOSEES TGS » — prompt Claude in Chrome

**Version du 09/10/2026 à 12h50.** La version du matin est remplacée : sa
méthode était fausse. Voir « Pourquoi la première méthode était fausse ».

## Pourquoi c'est Chrome qui le fait

Le renommage des fichiers du drive partagé me passe par l'API Drive sans
difficulté — j'ai renommé 38 fichiers ce matin. **Le déplacement, lui, m'est
refusé** : chaque tentative de changer le dossier parent répond
`The caller does not have permission`, y compris sur un fichier que j'avais créé
moi-même une heure plus tôt. Ce n'est pas propre à un fichier, c'est une limite
de mon accès au drive partagé.

Claude in Chrome agit dans ton navigateur avec tes droits à toi. Lui peut.

## État vérifié le 09/10/2026 à 12h47

- **75 fichiers posés à plat** à la racine de « 3 - DEPOSEES TGS »
- les douze dossiers mensuels de 2026 existent et sont **vides**
- le dossier 2025 existe, sans sous-dossiers mensuels

Répartition attendue, comptée fichier par fichier :

| destination | fichiers |
|---|---|
| 2025 | 35 |
| 2026 / 01 - Janvier | 4 |
| 2026 / 02 - Fevrier | 8 |
| 2026 / 03 - Mars | 4 |
| 2026 / 04 - Avril | 2 |
| 2026 / 05 - Mai | 2 |
| 2026 / 06 - Juin | 4 |
| 2026 / 07 - Juillet | 5 |
| 2026 / 08 - Aout | 4 |
| 2026 / 09 - Septembre | 7 |
| 2026 / 10, 11, 12 | 0 |
| **total** | **75** |

---

## Pourquoi la première méthode était fausse

Le prompt du matin disait de **chercher le préfixe** (« 2026-01 ») et de
déplacer les résultats. C'est contaminé : **18 des 75 noms portent une période
en plus de leur date**, sous la forme `_P2026-01-05-au-2026-02-04`. Une
recherche « 2026-01 » attrape donc des pièces de décembre 2025 et de juillet
2026.

Deux misfilings garantis, parmi d'autres :

- `2026-09-25_COFICA_..._P2026-10-05-au-2026-11-04.pdf` serait parti dans
  **Octobre** (et aussi dans Novembre) au lieu de Septembre
- `2025-12-24_COFICA_..._P2026-01-05-au-2026-02-04.pdf` serait parti dans
  **Janvier 2026** au lieu de 2025

Les dossiers 10, 11 et 12 doivent rester vides : aucune pièce ne porte une date
d'octobre à décembre 2026. La recherche les aurait remplis.

**La méthode corrigée n'utilise pas la recherche.** Tous les fichiers sont
nommés `AAAA-MM-JJ_...`, donc **le tri par nom les met dans l'ordre
chronologique** et chaque mois forme un bloc contigu. On sélectionne le bloc, on
le déplace, et le bloc suivant remonte en haut de la liste.

---

## LE PROMPT

```
Tu es dans Google Drive, connecté au compte contact@implantologielege.com.

Tu dois ranger les 75 fichiers posés à plat à la racine du dossier
« 3 - DEPOSEES TGS » (drive partagé) dans ses sous-dossiers année puis mois,
qui existent déjà et sont vides.

N'UTILISE PAS LA RECHERCHE. Elle donnerait de faux résultats : 18 noms de
fichiers portent une période en plus de leur date (par exemple
« _P2026-01-05-au-2026-02-04 »), donc une recherche sur « 2026-01 » attrape des
pièces qui ne sont pas de janvier. Travaille uniquement dans la vue du dossier.

PREPARATION
  1. ouvre « 3 - DEPOSEES TGS »
  2. passe en affichage LISTE (pas en grille)
  3. trie par NOM, de A à Z

Tous les fichiers s'appellent AAAA-MM-JJ_FOURNISSEUR_... Le tri par nom les met
donc dans l'ordre chronologique, et chaque mois forme un bloc contigu. Les deux
dossiers « 2025 » et « 2026 » sont regroupés à part des fichiers.

METHODE, un bloc à la fois, toujours en partant du HAUT de la liste de fichiers

  a. repère le premier fichier de la liste et lis son préfixe de date
  b. descends jusqu'au dernier fichier qui porte le même préfixe de mois
  c. clique le premier, puis Maj+clic le dernier : tout le bloc est sélectionné
  d. VERIFIE DEUX CHOSES avant de déplacer :
       - le nombre de fichiers sélectionnés correspond au tableau ci-dessous
       - tous les noms sélectionnés COMMENCENT par le préfixe attendu
     Si l'un des deux ne colle pas, ARRETE-TOI et dis-le-moi sans rien déplacer.
  e. clic droit → Organiser → Déplacer vers, et choisis le dossier cible
  f. note le nombre déplacé

Après chaque déplacement la liste raccourcit et le bloc suivant remonte en haut.
Tu refais a. à f. jusqu'à ce que la racine soit vide.

L'ORDRE DES BLOCS, et les comptes attendus

  bloc 1 : noms commençant par 2025      35 fichiers  ->  2025
  bloc 2 : noms commençant par 2026-01    4 fichiers  ->  2026 / 01 - Janvier
  bloc 3 : noms commençant par 2026-02    8 fichiers  ->  2026 / 02 - Fevrier
  bloc 4 : noms commençant par 2026-03    4 fichiers  ->  2026 / 03 - Mars
  bloc 5 : noms commençant par 2026-04    2 fichiers  ->  2026 / 04 - Avril
  bloc 6 : noms commençant par 2026-05    2 fichiers  ->  2026 / 05 - Mai
  bloc 7 : noms commençant par 2026-06    4 fichiers  ->  2026 / 06 - Juin
  bloc 8 : noms commençant par 2026-07    5 fichiers  ->  2026 / 07 - Juillet
  bloc 9 : noms commençant par 2026-08    4 fichiers  ->  2026 / 08 - Aout
  bloc 10 : noms commençant par 2026-09   7 fichiers  ->  2026 / 09 - Septembre

Total 75. Les dossiers 10 - Octobre, 11 - Novembre et 12 - Decembre doivent
rester VIDES : aucune pièce ne porte une date d'octobre à décembre 2026. Si tu
crois devoir y mettre quelque chose, c'est que tu lis une période et non une
date — arrête-toi et dis-le-moi.

DEUX FICHIERS SANS JOUR DANS LEUR NOM
Ils n'ont que l'année et le mois, et le tri peut les placer à l'une ou l'autre
extrémité de leur bloc. Ils se rangent normalement :
  « 2025-12_TIGHZA_SUIVI-MENSUEL_compta-decembre.pdf »        -> 2025
  « 2026-03_TIGHZA_SUIVI-MENSUEL_reglements-debut-2026.pdf »  -> 03 - Mars

LES FICHIERS « _DOUBLON »
Onze noms finissent par « _DOUBLON » ou « _DOUBLON-SUSPECT-sans-texte ». Ce sont
des copies repérées, marquées exprès. Tu les ranges par date comme les autres :
ils doivent rester dans le même dossier que leur jumeau. N'en supprime aucun.

NE DEPLACE RIEN D'AUTRE
Tu ne touches pas aux documents « 0 - MODE D EMPLOI » et « 0 - PROMPT
RENOMMAGE », ni aux dossiers « Lisa - Lucie : factures à régler »,
« Lucie - Lisa : factures réglées » et « 4 - A TRIER ». Tu ne renommes rien, tu
ne supprimes rien, tu ne crées aucun dossier.

POUR FINIR
Retourne à la racine de « 3 - DEPOSEES TGS » et dis-moi combien de fichiers y
restent. Il ne doit en rester AUCUN.

Puis écris-moi ce journal, chiffres réels uniquement :
  2025    : <n> déplacés   (attendu 35)
  2026-01 : <n> déplacés   (attendu 4)
  2026-02 : <n> déplacés   (attendu 8)
  2026-03 : <n> déplacés   (attendu 4)
  2026-04 : <n> déplacés   (attendu 2)
  2026-05 : <n> déplacés   (attendu 2)
  2026-06 : <n> déplacés   (attendu 4)
  2026-07 : <n> déplacés   (attendu 5)
  2026-08 : <n> déplacés   (attendu 4)
  2026-09 : <n> déplacés   (attendu 7)
  restant à la racine : <n>

N'invente aucun chiffre. Si un bloc ne donne pas le compte attendu, dis-moi
lequel et ce que tu as vu, et ne le déplace pas. Si un déplacement échoue, dis
lequel et pourquoi, et continue les autres.
```

---

## Ce que ça donne quand c'est fait

L'étape 3 redevient ce que le mode d'emploi veut qu'elle soit : un historique
classé par mois, où **tout ce qui est présent est déposé**.

À réception du journal, je mets à jour la colonne `emplacement` du registre pour
les 75 pièces, je relance `coherence.py`, je régénère `vue_tgs.csv` et tu n'as
plus qu'un **TGS > Actualiser** à faire.

Restent hors de ce rangement, et c'est voulu : les pièces qui dorment ailleurs
(dossiers d'abonnements, Downloads, scans Brother, Compta Cabinet Tighza) et les
13 restées chez Lucie, que tu as choisi de ne pas toucher.

---

## PROMPT 2 — ANNULÉ, ne pas lancer

**Le 09/10/2026 à 10h30 : ce prompt n'a plus lieu d'être, et le constat qui le
motivait était faux.**

La Cofica `750004848906` **avait été déposée le 08/10/2026**, statut
« Dépôt OK ». Elle était donc à sa juste place dans l'étape 3, et il n'y a rien
à remonter. Mon export de l'historique du portail s'arrêtait au 06/10 et je
n'avais pas vu ce dépôt : j'ai pris l'absence dans un fichier périmé pour une
preuve de non-dépôt.

C'est l'étape anti-doublon de Chrome qui l'a rattrapé, pas moi. Le garde-fou
ajouté depuis : `coherence.py` affiche la date d'arrêt de l'historique à chaque
exécution, pour qu'une absence ne puisse plus passer pour une preuve.

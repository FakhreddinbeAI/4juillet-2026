# Le Sheet de suivi — procédure définitive (09/10/2026)

## La règle

**Le Sheet du 09/10/2026 est le dernier. On ne le recrée plus.**

`https://docs.google.com/spreadsheets/d/1exJNQ8xj_fj7aGBEH6ZeLnTkVtWsyCKTAt2ZgI_Dbhs/edit`

Les précédents sont renommés « PERIME » ou « Archive ».

## Pourquoi il y en a eu trois

Mon accès au Drive sait **renommer et déplacer** un fichier, pas **écrire
dedans**. À chaque mise à jour je ne pouvais donc que fabriquer un nouveau
Sheet — et il fallait refaire la mise en forme derrière. Trois fois.

Le script `actualiser.gs` inverse le sens : **je dépose un fichier
`vue_tgs.csv` sur le Drive, et c'est le Sheet qui vient le chercher.** L'adresse,
les couleurs et les cases à cocher ne changent plus jamais.

---

## À FAIRE UNE SEULE FOIS — installer le script

À lancer **après** la mise en forme, pas avant.

```
Tu es dans Google Sheets, sur ce classeur :
https://docs.google.com/spreadsheets/d/1exJNQ8xj_fj7aGBEH6ZeLnTkVtWsyCKTAt2ZgI_Dbhs/edit

Tu dois y installer un script Apps Script, une fois pour toutes.

ETAPE 1 — récupère le code. Il est dans ce fichier de mon Drive, ouvre-le et copie-le
EN ENTIER, sans rien résumer ni abréger :
https://drive.google.com/file/d/1GlJrQrISzBu2LyKZIADjV-_ABBMhPscg/view

ETAPE 2 — dans le classeur, va dans Extensions > Apps Script. Si un code existe déjà
dans le fichier Code.gs, REMPLACE-LE entièrement par celui que tu viens de copier.
Nomme le projet « TGS - actualisation ». Enregistre.

ETAPE 3 — exécute la fonction onOpen une fois, pour autoriser le script et poser le
menu. Accepte les autorisations demandées (lecture du Drive, modification du classeur).

ETAPE 4 — N'EXECUTE PAS « actualiser » aujourd'hui. Le fichier vue_tgs.csv n'est pas
encore sur le Drive, et le script s'arrêtera proprement en disant qu'il ne le trouve
pas. C'est le comportement attendu. Dis-moi simplement :
  - que le code est bien en place et enregistré
  - que le menu « TGS » apparaît dans la barre du classeur
  - les autorisations que tu as dû accepter

Ne modifie aucune donnée de la feuille, ne crée aucun onglet, ne touche pas à la mise
en forme.
```

---

## LE CYCLE, à partir de maintenant

**Moi :** je mets le registre à jour, je lance `coherence.py`, je génère
`vue_tgs.csv` et je le dépose sur le Drive.

**Toi :** tu ouvres le Sheet, menu **TGS > Actualiser depuis le CSV**. Un clic.

Le script réécrit les lignes, retrie, et écrit un compte rendu dans l'onglet
**journal** : combien de lignes, combien par action, les montants.

**Plus jamais de mise en forme à refaire, plus jamais de nouvelle adresse.**

---

## Le canal de retour, qui manquait

Avant d'écrire, le script relève les **cases que tu as cochées à la main et que
mon registre ignore encore**. Il ne les écrase pas en silence : il les liste
dans le journal, avec le fournisseur, le numéro et le montant.

Donc si tu déposes une pièce sur le portail et que tu la coches, l'actualisation
suivante me le dira — et je l'inscrirai au registre. C'est le sens qui manquait :
jusqu'ici l'information n'allait que de moi vers toi.

## Les garde-fous du script

- **L'onglet est reconnu par son en-tête `B1:J1`**, jamais par sa position ni
  son nom. A1 porte une case à cocher : sa valeur lue est un booléen, pas le
  libellé « Depose TGS ». Le script refuse de travailler s'il ne trouve pas
  exactement un onglet conforme — c'est la leçon de l'onglet « Untitled ».
- **Aucun `getUi()` dont le travail dépende.** Tous sont dans des try/catch,
  après l'épisode où un script avait tout fait correctement avant d'échouer sur
  sa dernière ligne décorative.
- **Il refuse de travailler si le CSV ne commence pas par l'en-tête attendu**,
  plutôt que d'écrire n'importe quoi.
- Syntaxe vérifiée avec `node --check`, conversion des montants testée sur huit
  cas, dont `1353,76`, `-123,99`, `0,00` et `120314,80`.

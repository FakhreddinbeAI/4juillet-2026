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
https://drive.google.com/file/d/1TMMj6VRCsAKUYFF4Y_5_gxkHuBAgmzG7/view

ETAPE 2 — dans le classeur, va dans Extensions > Apps Script. Si un code existe déjà
dans le fichier Code.gs, REMPLACE-LE entièrement par celui que tu viens de copier.
Nomme le projet « TGS - actualisation ». Enregistre.

ETAPE 3 — exécute la fonction onOpen une fois, pour autoriser le script et poser le
menu. Accepte les autorisations demandées (lecture du Drive, modification du classeur).

ETAPE 4 — teste-le. Le fichier vue_tgs.csv est déjà sur le Drive. Recharge la page du
classeur, puis utilise le menu « TGS » > « Actualiser depuis le CSV ».

Il doit réécrire les 271 lignes et les retrier. Une chose DOIT changer, et c'est le but :
les dix relevés LCL de la colonne I (Reference) affichent aujourd'hui 46, 47 … 55, et
doivent redevenir 046, 047 … 055. Google les avait lus comme des nombres à l'import et
leur avait mangé le zéro de tête. Le script force la colonne I en texte avant d'écrire.

Dis-moi :
  - que le code est en place et enregistré
  - que le menu « TGS » apparaît dans la barre du classeur
  - ce que le compte rendu affiche, recopié tel quel
  - si les couleurs et les cases à cocher sont intactes après l'actualisation
  - ce qu'affiche la colonne I sur les lignes dont le fournisseur est LCL-70666 :
    filtre la colonne F sur LCL-70666, il doit y avoir dix lignes, et je veux les dix
    valeurs de la colonne I recopiées telles quelles

Ce qu'il doit annoncer : 271 lignes écrites, 0 ligne effacée, 10 références à zéro de
tête préservées, et la répartition 12 / 45 / 10 / 37 / 13 / 154 pour les six actions.

Ne modifie aucune donnée de la feuille à la main, ne crée aucun onglet (le script crée
lui-même l'onglet « journal », c'est normal), ne touche pas aux couleurs.
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
- **Les formats sont imposés AVANT l'écriture, jamais après.** La colonne I
  (Reference) est forcée en texte brut (`@`) et la colonne E en `yyyy-mm-dd`.
  Dans l'autre ordre, Sheets réinterprète ce qu'on vient d'écrire et personne ne
  s'en aperçoit — c'est ce qui a mangé le zéro de `046`.
- **La dernière ligne de données est cherchée dans la colonne F, pas avec
  `getLastRow()`.** Les cases à cocher descendent jusqu'à la ligne 1000 :
  `getLastRow()` renvoyait 1000 et le script aurait annoncé 728 lignes effacées.
- **La clé d'une ligne sans référence normalise le montant des deux côtés.**
  Sinon la virgule du CSV ne correspond jamais au point de la cellule.
- Syntaxe vérifiée avec `node --check`, conversion des montants testée sur huit
  cas, dont `1353,76`, `-123,99`, `0,00` et `120314,80` ; `derniereLigne` testée
  sur quatre cas (271/1000, 0/1000, 1/1000, feuille d'une seule ligne) ; `cle`
  sur dix cas, dont l'espace de milliers, les décimales nulles, un montant
  négatif, un montant vide, et la non-confusion de `046` avec `46`.

---

## Le défaut du 09/10 — les dix relevés LCL

À l'import du CSV, Google Sheets a lu la référence `046` comme **le nombre 46**
et lui a mangé son zéro de tête. Dix lignes touchées : les relevés LCL **046 à
055**, soit tout l'exercice de janvier à octobre.

C'est la **même faute** que l'épisode `completerLCL`, où
`("00" + "5113053").slice(-3)` avait produit `"053"` et écrasé la référence d'un
vrai relevé. Deux fois le même piège : un identifiant à zéros de tête traité
comme un nombre.

Les autres références à zéro ont survécu — `020-FC-01179765`,
`0440-1601-1250-4730-11` — parce que leurs tirets empêchent Sheets d'y voir un
nombre. Le danger ne porte que sur les références **purement numériques**.

**Réparé par la première actualisation du 09/10 à 12:32**, journal à l'appui :
« Colonne I forcee en texte : 10 reference(s) a zero de tete preservee(s) », et
les dix lignes relues une à une — `046` à `055`, toutes cochées, toutes en
« 7 FAIT ».

---

## Les 16 fausses alertes de la première actualisation

La première actualisation a crié sur 16 lignes cochées « que le registre ne
connaît pas du tout ». **Aucune donnée n'était perdue** — les totaux étaient
inchangés (271 lignes, 154 cochées, mêmes sommes) et les 16 lignes sont toutes
au CSV en « 7 FAIT ». Deux causes distinctes, les deux de mon fait.

**Les dix LCL n'étaient PAS une fausse alerte.** La feuille portait vraiment
`46`…`55`, qui ne sont des références de rien. L'alerte a correctement signalé
les dégâts du zéro mangé. Elle ne reviendra pas : la feuille porte maintenant
`046`…`055`, qui correspondent au registre.

**Les six autres étaient une vraie fausse alerte, et c'était un défaut de la
clé de comparaison.** Une ligne sans référence est identifiée par
`fournisseur|montant`. Or le montant arrivait sous deux formes :

| côté | valeur | clé construite |
|---|---|---|
| CSV | texte `109,15` | `PETRO-OUEST\|109,15` |
| feuille | nombre `109.15` | `PETRO-OUEST\|109.15` |

La virgule contre le point : elles ne pouvaient **jamais** correspondre. Les six
lignes sans référence et cochées criaient donc à chaque passage. Corrigé en
passant les deux côtés par `montant()` puis `toFixed(2)`.

La septième ligne sans référence — SEPTODONT, relance du 27/08/2026 — n'a pas
crié, et c'est ce qui a permis de prouver le diagnostic : **elle n'a pas de
montant non plus**, donc sa clé valait `SEPTODONT|` des deux côtés et
correspondait. 6 lignes sur 7, jamais 7 : l'écart confirmait la cause.

**La comparaison des références n'a pas été affaiblie** pour faire taire
l'alerte : `046` et `46` restent deux clés distinctes, testé explicitement.

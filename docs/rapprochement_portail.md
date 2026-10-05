# Pourquoi le portail décide des coches, et pas Claude in Chrome

Demande d'origine : brancher Claude in Chrome, le portail TGS et le Google
Sheet pour que le dépôt se fasse seul pendant qu'on travaille ailleurs, et que
Chrome coche les cases au fur et à mesure.

Le dépôt automatisé est faisable. Faire cocher les cases par Chrome ne l'est
pas — ou plutôt, ça ne devrait pas l'être.

## La raison

Une case cochée doit signifier **« le portail détient la pièce »**, jamais
« Chrome pense l'avoir envoyée ».

Un dépôt qui échoue en silence serait coché. La pièce sortirait du radar, et on
la découvrirait au bilan, c'est-à-dire trop tard. Une case cochée à tort est
**pire que pas d'automatisation** : elle éteint l'alerte au lieu de la lever.

C'est la règle déjà posée pour les doublons : on ne conclut pas sur une
apparence, on va voir la source. Ici la source est le portail.

## Le circuit

1. `fileDAttente()` sort les pièces prêtes et non déposées, par lots de 5.
2. Chrome dépose un lot — **tâche A** du PROMPT 8. Il ne touche pas au Sheet.
3. Chrome relit la liste des pièces que le portail déclare détenir — **tâche B**.
   Liste brute, un nom par ligne, rien de corrigé.
4. On colle cette liste dans l'onglet `PORTAIL`, à partir de la ligne 3.
5. `cocherDepuisPortail()` coche et horodate les correspondances exactes.

On peut boucler 1→5 autant de fois que nécessaire : rien n'est recoché, aucun
horodatage n'est écrasé.

## Ce que le script ne fait pas, délibérément

Il **ne décoche jamais** et ne rattrape rien tout seul. Il signale les écarts
dans les deux sens :

- **cochée ici, absente du portail** — un dépôt perdu, ou une pièce retirée
  côté TGS ;
- **au portail, inconnue du tableau** — un nom hors convention, ou une pièce
  déposée en dehors du registre.

Un écart se regarde. Le corriger automatiquement reviendrait à recréer le
problème qu'on vient d'éviter : une feuille qui a l'air juste.

## Pourquoi la liste doit être brute

Si Chrome rapproche les noms lui-même, il rapprochera les ressemblances. Or
cinq loyers COFICA à 1 353,76 € se ressemblent énormément, et deux factures
Aries de 990,00 € aussi.

Le rapprochement est fait par `cle_()`, sur correspondance exacte. Elle ne
tolère que la casse, les espaces parasites, un chemin résiduel et le suffixe
`(1)` que les navigateurs ajoutent aux téléchargements. Jamais le corps du
nom : date, fournisseur, montant et référence sont ce qui distingue deux
pièces de même montant.

## Deux détails techniques qui coûtent cher à redécouvrir

- **`onEdit` ne se déclenche pas** quand un script coche une case : les
  déclencheurs simples ignorent les modifications d'origine script. C'est
  pourquoi `cocherDepuisPortail()` écrit l'horodatage lui-même.
- **Ça tourne sur le PC, pas dans la session distante.** Le conteneur n'a ni
  navigateur, ni session TGS, ni les fichiers. L'orchestration se fait depuis
  une session Claude Code locale ou l'extension.

## À vérifier avant de lancer

Le portail TGS affiche-t-il une liste consultable des pièces déjà déposées ?
Tout le dispositif repose là-dessus.

S'il ne l'affiche pas, la preuve de second choix est l'accusé de réception
montré après chaque dépôt, relevé par Chrome à ce moment-là. Moins solide —
on ne peut plus rien revérifier après coup — mais mieux que la seule parole de
Chrome.

Et à regarder tant qu'on y est : TGS propose-t-il un **dépôt groupé** ou une
adresse de dépôt par mail ? 75 fichiers un par un dans un navigateur, c'est
fragile. Par mail, l'envoi partirait de `contact@` : rien ne part de
`ftighza@`, la règle est respectée.

# Ranger « 3 - DEPOSEES TGS » — prompt Claude in Chrome (09/10/2026)

## Pourquoi c'est Chrome qui le fait

Le renommage des fichiers du drive partagé me passe par l'API Drive sans
difficulté — j'ai renommé 38 fichiers ce matin. **Le déplacement, lui, m'est
refusé** : chaque tentative de changer le dossier parent répond
`The caller does not have permission`, y compris sur un fichier que j'avais créé
moi-même une heure plus tôt. Ce n'est pas propre à un fichier, c'est une
limite de mon accès au drive partagé.

Claude in Chrome agit dans ton navigateur avec tes droits à toi. Lui peut.

---

## PROMPT 1 — ranger les pièces par année et par mois

```
Tu es dans Google Drive, connecté au compte contact@implantologielege.com.

Tu dois ranger les fichiers qui sont posés à plat à la racine du dossier
« 3 - DEPOSEES TGS » (drive partagé) dans ses sous-dossiers année puis mois,
qui existent déjà et sont vides.

Tous les fichiers ont été renommés ce matin au format AAAA-MM-JJ_FOURNISSEUR_...
Le rangement se fait donc uniquement d'après le début du nom : c'est mécanique,
tu n'as aucun fichier à ouvrir ni aucun jugement à porter.

NE DEPLACE RIEN D'AUTRE. En particulier, tu ne touches pas aux documents
« 0 - MODE D EMPLOI » et « 0 - PROMPT RENOMMAGE », ni aux dossiers
« Lisa - Lucie : factures à régler », « Lucie - Lisa : factures réglées »
et « 4 - A TRIER ». Tu travailles uniquement sur les fichiers qui sont
DIRECTEMENT à la racine de « 3 - DEPOSEES TGS ».

Méthode, à répéter pour chacun des treize lots ci-dessous. Utilise la
sélection multiple, pas treize glisser-déposer un par un :

  1. ouvre « 3 - DEPOSEES TGS »
  2. dans la barre de recherche, restreins la recherche à ce dossier et
     cherche le préfixe du lot (par exemple « 2026-01 »)
  3. sélectionne tous les résultats qui sont à la racine du dossier
  4. clic droit → Organiser → Déplacer vers, et choisis le dossier cible
  5. note combien de fichiers tu as déplacés

Les treize lots :

  préfixe du nom   ->  dossier cible
  2026-01          ->  2026 / 01 - Janvier
  2026-02          ->  2026 / 02 - Fevrier
  2026-03          ->  2026 / 03 - Mars
  2026-04          ->  2026 / 04 - Avril
  2026-05          ->  2026 / 05 - Mai
  2026-06          ->  2026 / 06 - Juin
  2026-07          ->  2026 / 07 - Juillet
  2026-08          ->  2026 / 08 - Aout
  2026-09          ->  2026 / 09 - Septembre
  2026-10          ->  2026 / 10 - Octobre
  2026-11          ->  2026 / 11 - Novembre
  2026-12          ->  2026 / 12 - Decembre
  2025             ->  2025          (ce dossier n'a pas de sous-dossiers
                                      mensuels, les pièces 2025 vont à sa
                                      racine, c'est voulu)

ATTENTION sur le lot « 2026-06 » : un fichier s'appelle
« 2026-06-30_MUTUALEASE_FACTURE_318.56_020-FC-01179765_facture-de-cession.pdf ».
Il part bien dans 06 - Juin comme les autres.

ATTENTION sur deux fichiers dont le nom commence par 2025 mais qui portent une
période 2026 — « 2025-12-24_COFICA_..._P2026-01-05-au-2026-02-04.pdf » et
« 2025-12-15_MUTUALEASE_..._P2026-01-01-au-2026-03-31.pdf ». Ils vont dans le
dossier 2025 avec les autres : le classement suit la DATE DE LA PIECE, et c'est
le registre comptable qui porte l'information de période. Ne les mets pas dans
2026.

Quand les treize lots sont faits, retourne à la racine de « 3 - DEPOSEES TGS »
et dis-moi combien de fichiers y restent. Il ne devrait en rester AUCUN.

Puis écris-moi un journal dans ce format :
  2026-01 : <n> fichiers déplacés
  2026-02 : <n> fichiers déplacés
  ... pour les treize lots ...
  restant à la racine : <n>
N'invente aucun chiffre. Si un lot n'a donné aucun résultat, écris 0.
Si un déplacement échoue, dis lequel et pourquoi, et continue les autres.
```

---

## PROMPT 2 — remonter la Cofica qui n'est pas déposée

À lancer **après** le prompt 1, et **seulement** si le dépôt du lot 2 des
quinze pièces n'a pas encore été fait. Si la Cofica 750004848906 a été déposée
entre-temps, elle est à sa place et il n'y a rien à faire.

```
Tu es dans Google Drive, connecté au compte contact@implantologielege.com.

Un fichier se trouve dans « 3 - DEPOSEES TGS » alors qu'il n'a pas encore été
déposé sur le portail TGS :

  2026-09-25_COFICA_FACTURE_1353.76_750004848906_P2026-10-05-au-2026-11-04.pdf

Le mode d'emploi du drive est explicite : une pièce ne descend dans
« 3 - DEPOSEES TGS » QUE quand elle est réellement sur le portail. Une pièce
descendue trop tôt casse la garantie pour toutes les autres : on ne peut plus
se fier au dossier pour savoir ce qui reste à déposer.

Déplace ce seul fichier vers « Lucie - Lisa : factures réglées », qui est
l'étape 2 du circuit, celle de ce qui est payé mais pas encore déposé.

Ne déplace rien d'autre. Confirme-moi le déplacement, ou dis-moi pourquoi il
a échoué.
```

---

## Ce que ça donne quand c'est fait

L'étape 3 redevient ce que le mode d'emploi veut qu'elle soit : un historique
classé par mois, où **tout ce qui est présent est déposé** et où **rien de ce
qui est déposé ne manque** — sauf les 75 pièces qui dorment encore ailleurs
(dossiers d'abonnements, Downloads, scans Brother, Compta Cabinet Tighza) et
les 13 restées chez Lucie, que tu as choisi de ne pas toucher.

À réception de ton journal, je mets à jour la colonne `emplacement` du registre
pour les pièces déplacées, et je relance `coherence.py`.

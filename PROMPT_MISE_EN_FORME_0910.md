# Mise en forme du Sheet du 09/10/2026 — prompt Claude in Chrome

Le Sheet : **TGS 2026 — suivi des pieces (09-10)**
`https://docs.google.com/spreadsheets/d/1exJNQ8xj_fj7aGBEH6ZeLnTkVtWsyCKTAt2ZgI_Dbhs/edit`

271 lignes de données, lignes 2 à 272. L'ancien Sheet (08-10) est renommé
« PERIME » : ne plus y toucher.

**Changement par rapport à la dernière fois :** la colonne A arrive avec les
valeurs `TRUE` / `FALSE` en texte. Il faut y poser les cases à cocher, ce qui
convertit le texte en vraies coches — l'étape qui avait manqué la dernière fois.

---

```
Tu es dans Google Sheets, sur ce classeur :
https://docs.google.com/spreadsheets/d/1exJNQ8xj_fj7aGBEH6ZeLnTkVtWsyCKTAt2ZgI_Dbhs/edit

IDENTIFIER LA BONNE FEUILLE. Ne te fie pas à sa position ni à son nom : repère
l'onglet dont la ligne 1 contient, de A1 à J1, exactement :
  Depose TGS | Action | Cycle | Etat | Date | Fournisseur | Type | Montant | Reference | Periode
S'il n'y en a aucun, ou s'il y en a plusieurs, ARRETE-TOI et dis-le-moi sans
rien modifier.

Les données vont de la ligne 2 à la ligne 272. Prévois la mise en forme jusqu'à
la ligne 1000 pour que les lignes ajoutées plus tard en héritent.

ETAPE 1 — les cases à cocher
La colonne A contient pour l'instant les textes TRUE et FALSE. Sélectionne
A2:A1000 et applique Insertion > Case à cocher. Les TRUE doivent devenir des
cases cochées et les FALSE des cases décochées. Vérifie-le sur deux lignes :
la ligne 2 doit être décochée, la ligne 272 cochée.

ETAPE 2 — en-tête
Ligne 1 : fond gris foncé, texte blanc, gras, centré. Fige la ligne 1.
Fige aussi la colonne A pour qu'elle reste visible au défilement.

ETAPE 3 — format des colonnes
  H (Montant)  : format nombre, deux décimales, symbole €, aligné à droite
  E (Date)     : laissé en texte, c'est volontaire, les dates sont en AAAA-MM-JJ
  B (Action)   : gras
Largeurs : ajuste automatiquement, sauf la colonne J (Periode) que tu peux
laisser étroite.

ETAPE 4 — couleur par action, sur toute la ligne
Mise en forme conditionnelle sur A2:J1000, avec une règle par action, en te
fondant sur la colonne B. Utilise une formule personnalisée du type
=$B2="2 A OBTENIR" pour chaque cas :

  2 A OBTENIR    rouge clair      ce qu'il faut réclamer, la facture n'existe pas
  3 A LOCALISER  orange clair     la facture existe, le fichier est introuvable
  4 LUCIE PAIE   jaune clair      chez Lucie
  5 A TRIER      bleu clair       à classer
  6 HORS 2026    gris clair       hors exercice
  7 FAIT         vert très clair  déposé chez TGS

Garde des teintes PALES : le texte doit rester lisible.

ETAPE 5 — le tri et le filtre
Pose un filtre sur A1:J1000.
Trie sur la colonne B de A à Z. L'ordre est voulu : le chiffre en tête de
chaque action fait remonter ce qui reste à faire et descendre ce qui est fait.
Ne retire pas ces chiffres.

ETAPE 6 — contrôle, et dis-moi les chiffres
Compte et rapporte-moi :
  - combien de lignes au total (hors en-tête)
  - combien de cases cochées en colonne A
  - combien de lignes par action (les six valeurs de la colonne B)
  - la somme de la colonne H pour les lignes « 7 FAIT »
  - la somme de la colonne H pour toutes les autres lignes

Voici ce que j'attends. Si un chiffre diffère, dis-le-moi, ne corrige rien :

  total            271
  cases cochées    154
  2 A OBTENIR       12       7 959,03 €
  3 A LOCALISER     45      30 070,56 €
  4 LUCIE PAIE      10       6 630,18 €
  5 A TRIER         37      10 302,75 €
  6 HORS 2026       13       5 540,26 €
  7 FAIT           154     184 911,28 €

  somme « 7 FAIT »        184 911,28 €
  somme des autres         60 502,78 €

Ne touche à rien d'autre : pas de ligne ajoutée ou supprimée, pas de valeur
modifiée, pas d'onglet créé.
```

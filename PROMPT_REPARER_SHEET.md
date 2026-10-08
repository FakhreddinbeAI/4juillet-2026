# PROMPT CLAUDE IN CHROME — remettre le Sheet d'aplomb (08/10/2026)

Contexte : 24 lignes ont été collées en bas du tableau, mais la feuille est
triée par Action, donc elles se retrouvent au mauvais endroit. Il faut
trier, corriger deux montants, et réparer la colonne des dates de dépôt.

```
Ouvre cette feuille Google Sheets :
https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU

Colonnes : A Depose TGS (cases a cocher) - B Action - C Cycle - D Etat -
E Date - F Fournisseur - G Type - H Montant - I Reference - J Periode -
K Depose le

ETAPE 0 - ETAT DES LIEUX, avant de toucher a quoi que ce soit.
Place-toi en F2 et fais Ctrl + fleche bas pour aller a la derniere ligne
remplie. Dis-moi son numero.
  - Si c'est 212 : tout est en place, continue a l'etape 1.
  - Si c'est 188 ou 189 : le collage a echoue, les 24 lignes ne sont pas
    passees ou sont empilees dans une seule cellule. ARRETE-TOI et dis-le-
    moi, je fournirai les donnees autrement.
  - Si c'est un autre nombre : dis-le-moi et arrete-toi.

ETAPE 1 - REMETTRE DANS L'ORDRE.
Selectionne la plage A2:K212.
Donnees > Trier la plage > Options de tri avancees.
NE COCHE PAS "Les donnees ont une ligne d'en-tete" : la ligne 1 est deja
exclue de la selection.
Trie par colonne A, de A a Z.
Ajoute un second critere : colonne B, de A a Z.
Valide.

ETAPE 2 - CORRIGER DEUX MONTANTS. C'est le plus important : il y a deux
mille euros d'erreur.
Avec Ctrl+F, trouve la ligne dont la colonne I contient 35195 :
  - colonne H : remplace 967,00 par 1967,00
  - colonne B : remplace LUCIE PAIE par A DEPOSER
  - colonne C : remplace A_PAYER par PAYE
Puis la ligne dont la colonne I contient 35435 :
  - colonne H : remplace 329,95 par 1329,95
  - colonne B : remplace LUCIE PAIE par A DEPOSER
  - colonne C : remplace A_PAYER par PAYE
Les deux lignes doivent passer du bleu au vert. C'est normal.

ETAPE 3 - REPARER LES DATES DE DEPOT.
Le collage a declenche le script d'horodatage, qui a ecrit LA DATE DU JOUR
en colonne K sur les lignes collees. Ce n'est pas la vraie date de depot.
Selectionne toute la colonne K de la ligne 2 a la ligne 212, SAUF que tu ne
dois effacer QUE les cellules contenant 08/10/2026.
Le plus simple : Ctrl+F, "Rechercher et remplacer", cherche 08/10/2026,
remplace par rien, et coche "Rechercher dans les formules" si l'option
existe. Limite la recherche a cette feuille.
Dis-moi combien de remplacements ont ete faits.

ETAPE 4 - REMETTRE LES VRAIES DATES.
Extensions > Apps Script. Selectionne la fonction remplirDatesPortail et
execute-la. Puis selectionne completerLCL et execute-la aussi, si elle
existe dans le projet.
Donne-moi les chiffres affiches par chacune.

ETAPE 5 - VERIFICATION. Donne-moi ces six nombres, en comptant les lignes
de chaque couleur ou en filtrant la colonne B :
  A DEPOSER   : je dois en avoir 15
  A OBTENIR   : 12
  A TRIER     : 28
  HORS 2026   : 12
  LUCIE PAIE  : 21
  RIEN        : 123
  Total       : 211 lignes de donnees, de la ligne 2 a la ligne 212.
Dis-moi aussi combien de cellules de la colonne K sont vides sur une ligne
dont la colonne A est cochee : il ne devrait y en avoir AUCUNE.

Ne supprime aucune ligne. N'ajoute aucun declencheur. Ne modifie pas la
mise en forme conditionnelle.
```

## Pourquoi ces nombres-là

Ils ont changé depuis ce matin, et c'est le travail de la journée :

- **A DEPOSER passe de 13 à 15** : les deux Made in Labs sont payées, le
  relevé le prouve.
- **A OBTENIR passe de 5 à 12** : les six factures Henry Schein impayées
  plus la facture Hostinger 2026 jamais récupérée.
- **A TRIER passe de 25 à 28** : la relance Henry Schein, la facture Google
  GCFRD0011327141 et l'Argoat 02/2026.
- **LUCIE PAIE passe de 19 à 21** : deux ROTEC de plus, moins les deux Made
  in Labs qui en sortent.
- **RIEN passe de 98 à 123** : les dix ROTEC déjà déposées, les dix relevés
  LCL et les cinq autres pièces retrouvées au portail.

Si un seul de ces nombres ne tombe pas, ne corrige rien à la main : dis-le-
moi, je chercherai l'écart dans le registre.

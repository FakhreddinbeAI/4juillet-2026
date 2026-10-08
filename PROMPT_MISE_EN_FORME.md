# PROMPT CLAUDE IN CHROME — mise en forme du nouveau Sheet (08/10/2026)

Feuille : **TGS 2026 — suivi des pieces (08-10)**
`https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU`

**LA REGLE QUI COMPTE : on borne a A1:J173.** L'ancien Sheet ramait parce
que j'avais pose huit regles sur des colonnes entieres de 1 000 lignes, dont
une a formule sur 12 000 cellules. Jamais de colonne entiere ici.

## LE PROMPT

```
Ouvre cette feuille Google Sheets :
https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU

Les donnees vont de la ligne 2 a la ligne 173. Les colonnes sont :
A Depose TGS (cases a cocher, deja en place) - B Action - C Cycle -
D Etat - E Date - F Fournisseur - G Type - H Montant - I Reference -
J Periode

REGLE ABSOLUE : n'applique JAMAIS une mise en forme a une colonne entiere.
Toujours la plage A2:J173, ou la colonne bornee a la ligne 173. Une regle
posee sur 1000 lignes rend la feuille inutilisable, c'est deja arrive.

1. EN-TETE
   Selectionne A1:J1. Mets en gras, fond gris fonce #434343, texte blanc,
   centre. Puis Affichage > Figer > 1 ligne.

2. LARGEURS
   A 90 - B 110 - C 120 - D 110 - E 95 - F 170 - G 110 - H 100 - I 190 -
   J 200. Selectionne A1:J173 et mets le renvoi a la ligne sur "Couper"
   (pas "Renvoyer a la ligne") pour que chaque ligne garde la meme hauteur.

3. MONTANTS
   Selectionne H2:H173. Format > Nombre > Personnalise, et saisis :
   #,##0.00 €
   Aligne a droite.

4. DATES ET REFERENCES
   E2:E173 centre. I2:I173 en police Courier New taille 9, pour que les
   numeros de facture soient lisibles. C2:D173 centre.

5. LES COULEURS - LE PLUS IMPORTANT
   Selectionne A2:J173. Format > Mise en forme conditionnelle.
   Cree SIX regles, chacune avec "La formule personnalisee est".
   Chaque regle s'applique a la plage A2:J173 et colore TOUTE la ligne.

   Regle 1 : =$B2="A DEPOSER"
     fond #d9ead3  texte #274e13  gras
   Regle 2 : =$B2="A OBTENIR"
     fond #f4cccc  texte #990000  gras
   Regle 3 : =$B2="LUCIE PAIE"
     fond #cfe2f3  texte #0b5394
   Regle 4 : =$B2="A TRIER"
     fond #fce5cd  texte #b45f06
   Regle 5 : =$B2="HORS 2026"
     fond #f3f3f3  texte #999999  italique
   Regle 6 : =$B2="RIEN"
     fond blanc    texte #999999

   Attention : ecris bien $B2 avec le dollar devant le B SEULEMENT.
   Le $ devant la colonne et rien devant le 2 : c'est ce qui fait que la
   regle colore la ligne entiere et se propage vers le bas.

   L'ordre compte : mets "A DEPOSER" en premier et "RIEN" en dernier.

6. FILTRE
   Selectionne A1:J173 puis Donnees > Creer un filtre.
   Ne filtre rien, ne trie rien : laisse juste le filtre en place.

7. VERIFICATION, et dis-moi le resultat
   - combien de lignes sont vertes (A DEPOSER) : je dois en avoir 13
   - combien sont rouges (A OBTENIR) : je dois en avoir 5
   - combien sont bleues (LUCIE PAIE) : je dois en avoir 19
   - combien sont orange (A TRIER) : je dois en avoir 28
   - la derniere ligne de donnees est bien la 173
   - aucune mise en forme ne depasse la ligne 173

Ne trie pas la feuille. Ne supprime aucune ligne. Ne touche pas aux cases
a cocher de la colonne A. N'ajoute aucun script : tout se fait par les
menus.
```

## POURQUOI LES COULEURS SONT SUR *ACTION* ET PLUS SUR *ETAT*

Avant, les couleurs suivaient la colonne Etat (RENOMME, RECU, MANQUANT...).
Ca disait l'etat du FICHIER, pas ce qu'il y avait a faire. La colonne Action
dit la seule chose qui t'interesse en ouvrant la feuille : vert tu deposes,
rouge tu reclames, bleu c'est Lucie, orange c'est a trier, gris tu oublies.

Si tu veux malgre tout les anciennes couleurs d'Etat en plus, dis-le-moi :
ca fait quatorze regles au total et la feuille devient bavarde, mais c'est
faisable.

## CE QUI RESTE A FAIRE ENSUITE

La colonne « Ouvrir » avec les liens Drive. J'en ai retrouve 86 sur 172 :
63 en reconnaissant la reference dans le nom du fichier, 23 en depouillant
« Reglements Mai » a la main. Les autres portent des noms qui ne contiennent
aucune reference (« BONGERT », « Cofibail 06-07 2026 », « MIL 04-2026 »),
donc il faut aller les chercher dossier par dossier. Je continue.

# PROMPT CLAUDE IN CHROME — mise en forme permanente du Sheet (08/10/2026)

Feuille : **TGS 2026 — suivi des pieces (08-10)**
`https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU`

## CE QUI REND LA MISE EN FORME PERMANENTE

Tout est pose **jusqu'a la ligne 1000**. Une ligne ajoutee en 174, en 300 ou
en 999 recoit donc les couleurs, le format du montant et la case a cocher
**par construction**, sans script et sans declencheur.

C'est exactement ce que visait `format_permanent.gs`, et ce n'est pas
l'etendue qui l'avait fait echouer : c'etait le declencheur `onChange` qui
relancait `rendrePermanent()`, lequel reecrivait 999 cases et recreait le
filtre — donc se redeclenchait lui-meme. **Ne reinstalle jamais ce
declencheur.** Une comparaison `=$B2="A DEPOSER"` ne coute rien ; une boucle
de declencheur coute tout.

## LE PROMPT

```
Ouvre cette feuille Google Sheets :
https://docs.google.com/spreadsheets/d/1pz_3DZsIIO9MrUJsTmzXO2cekN7ijnZlyLt1d2Ka9aU

Colonnes : A Depose TGS (cases a cocher) - B Action - C Cycle - D Etat -
E Date - F Fournisseur - G Type - H Montant - I Reference - J Periode
Les donnees occupent les lignes 2 a 173. Les lignes 174 a 1000 sont vides.

TOUT CE QUI SUIT VA JUSQU'A LA LIGNE 1000, pas jusqu'a 173 : c'est ce qui
fait qu'une ligne ajoutee plus tard sera traitee comme les autres.
N'INSTALLE AUCUN SCRIPT ET AUCUN DECLENCHEUR.

1. FAIRE DESCENDRE CE QUI EST DEJA DEPOSE
   Selectionne A2:J173. Donnees > Trier la plage > Options de tri avancees.
   Coche "Les donnees ont une ligne d'en-tete" : NON (on a deja exclu la 1).
   Trie par colonne A, de A a Z (donc FALSE avant TRUE),
   puis ajoute un second critere : colonne B, de A a Z.
   Resultat attendu : les 98 lignes cochees passent en bas, et le haut de la
   feuille ne contient plus que ce qui reste a faire.

2. EN-TETE
   A1:J1 en gras, fond #434343, texte blanc, centre.
   Affichage > Figer > 1 ligne.

3. LARGEURS ET HAUTEUR
   A 90 - B 110 - C 120 - D 110 - E 95 - F 170 - G 110 - H 100 - I 190 -
   J 200.
   Selectionne A1:J1000 et mets le renvoi a la ligne sur "Couper", pour que
   toutes les lignes gardent la meme hauteur.

4. MONTANTS
   H2:H1000. Format > Nombre > Format personnalise, saisis :
   #,##0.00 €
   Aligne a droite.

5. LISIBILITE
   E2:E1000 centre. C2:D1000 centre.
   I2:I1000 en Courier New taille 9 (les numeros de facture).

6. CASES A COCHER SUR TOUTE LA ZONE
   Selectionne A2:A1000. Insertion > Case a cocher.
   Les cases deja presentes et leurs valeurs ne doivent PAS changer : si
   l'outil te propose d'ecraser les valeurs existantes, refuse. Le but est
   seulement que les lignes 174 a 1000 en aient une d'avance.

7. LES COULEURS - LE PLUS IMPORTANT
   Selectionne A2:J1000. Format > Mise en forme conditionnelle.
   Cree SIX regles, chacune en "La formule personnalisee est", chacune
   appliquee a la plage A2:J1000.

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

   Ecris bien $B2 : un dollar devant le B SEULEMENT, rien devant le 2.
   C'est ce qui colore la ligne entiere et propage la regle vers le bas.
   Mets "A DEPOSER" en premier et "RIEN" en dernier.

   Les lignes 174 a 1000 resteront blanches puisque leur colonne B est vide.
   Des qu'on y ecrira une action, la couleur viendra toute seule.

8. FILTRE
   Selectionne A1:J1000 puis Donnees > Creer un filtre.
   Ne filtre rien et ne trie rien avec : laisse-le en place.

9. VERIFICATION - donne-moi ces chiffres
   - lignes vertes (A DEPOSER) : je dois en avoir 13
   - rouges (A OBTENIR) : 5
   - bleues (LUCIE PAIE) : 19
   - orange (A TRIER) : 25
   - gris italique (HORS 2026) : 12
   - blanches en gris clair (RIEN) : 98
   Total 172. Les 98 doivent etre EN BAS, pas en haut.
   - ecris le mot ESSAI en B174, dis-moi si la ligne se colore, puis EFFACE
     ce mot. C'est le seul test qui prouve que la mise en forme est bien
     permanente.

Ne supprime aucune ligne. N'ajoute aucun script. Ne cree aucun declencheur.
```

## LE POINT FAIBLE QUE JE TE DIS QUAND MEME

Le tri de l'etape 1 est alphabetique. Dans le bloc du haut, l'ordre sera
donc : A DEPOSER, A OBTENIR, A TRIER, HORS 2026, LUCIE PAIE — avec
« HORS 2026 » coince au milieu au lieu d'etre avant les lignes deposees.

Je l'ai corrige a la source : la prochaine vue que je fabrique numerotera
les actions (« 1 A DEPOSER », « 2 A OBTENIR », « 3 LUCIE PAIE »,
« 4 A TRIER », « 5 HORS 2026 », « 6 RIEN »), et un simple tri A-Z redonnera
alors l'ordre exact pour toujours. Il faudra juste rectifier les six
formules ci-dessus en consequence. Je ne te le fais pas changer maintenant
pour ne pas te faire refaire ce que tu viens de faire.

## AU-DELA DE LA LIGNE 1000

Si un jour la feuille depasse 1000 lignes, Sheets ajoute des lignes HORS des
plages ci-dessus et la mise en forme s'arretera de nouveau. A 172 pieces en
dix mois d'exercice, c'est loin ; mais c'est la seule limite, et elle se
leve en rejouant ce prompt avec 2000 a la place de 1000.

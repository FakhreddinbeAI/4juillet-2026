# PROMPTS CLAUDE IN CHROME — compta 2026

Deux règles apprises à la dure, valables pour les deux prompts :
**cinq fichiers par lot** (au-delà, Chrome tourne sans rien écrire) et
**une seule tâche à la fois** (renommer, puis déposer — jamais les deux).
Texte plat, pas de tableau ni de pictogramme : la version formatée n'était
pas lisible.

---

## PROMPT 1 — renommer

```
Ouvre ce dossier Google Drive :
https://drive.google.com/drive/folders/1Wl82iXKZmGD4iNzYuVN06gQ6jYKnLxCt

C'est le dossier FACTURATION. Prends les 5 PREMIERS fichiers dont le nom
ne commence PAS par une date au format 2026-, et ignore les autres.

Pour chacun :

1. Ouvre le PDF et lis-le. Ne conclus jamais depuis le nom du fichier.
   Releve : l'emetteur, le numero de facture, la date de la piece,
   la periode couverte s'il y en a une, et le montant TTC.

2. Renomme le fichier ainsi :
   ANNEE-MOIS-JOUR_FOURNISSEUR_TYPE_MONTANT_NUMERO.pdf

   Exemples :
   2026-07-31_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0013852502.pdf
   2026-08-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0008.pdf
   2026-04-01_ARGOAT_FACTURE_45.00_ARG12031.pdf

   Le fournisseur en majuscules, sans espace, tirets autorises.
   Le type est FACTURE, AVOIR, TICKET, CONTRAT, RELEVE, ATTESTATION,
   RELANCE, INDU, AFFILIATION, AR ou RECU.
   Le montant avec un point decimal, sans le symbole euro.

3. Si la piece couvre une periode, ajoute a la fin :
   _P2026-07-01-au-2026-07-31

4. S'il s'agit d'un duplicata, ajoute _DUPLICATA tout a la fin.

5. Si l'extension est .rotec, remplace-la par .pdf.

6. Si tu n'arrives pas a lire le montant, ne devine pas :
   laisse le fichier et dis-le-moi.

7. Si tu penses qu'un fichier est un doublon d'un autre, NE LE DECIDE PAS
   SEUL. Un meme montant, un meme nom ou une meme taille ne prouvent rien.
   Ouvre LES DEUX PDF et verifie que le NUMERO DE PIECE est identique, puis
   qu'un element de detail concorde (bon de livraison, ligne de produit,
   periode). Si c'est le cas, dis-le-moi et attends ma reponse. Sinon,
   traite-les comme deux pieces distinctes.

Ne supprime aucun fichier. Ne deplace rien pour l'instant.

Quand les 5 sont renommes, donne-moi la liste :
ancien nom, nouveau nom, et ce que tu as lu dans le PDF
(emetteur, numero, date, periode, montant TTC).
```

Relance le même prompt pour les cinq suivants : les précédents seront déjà
au bon format et automatiquement ignorés.

---

## PROMPT 2 — déposer sur le portail

À lancer seulement quand les noms sont propres.

```
Va sur https://monespaceclient.tgs-france.fr

Je vais te donner 5 fichiers a deposer. Pour chacun, dans cet ordre :

ETAPE 1 - verifier qu'il n'y est pas deja.
Ouvre Mes depots de documents puis Historique des depots.
Plage large, toutes categories. Cherche le NUMERO DE PIECE du fichier.
Si tu le trouves deja, ne depose pas et dis-le-moi.

ETAPE 2 - deposer.
Depose le fichier dans la categorie des factures fournisseurs.
Si tu hesites, prends "Je ne sais pas ou deposer ce document".

ETAPE 3 - noter.
Releve la date, l'heure et le statut affiche apres l'envoi.

Les 5 fichiers sont dans :
https://drive.google.com/drive/folders/1Wl82iXKZmGD4iNzYuVN06gQ6jYKnLxCt

[COLLER ICI LES 5 NOMS DE FICHIERS]

Ne depose rien d'autre. Ne supprime rien.

En retour, pour chaque fichier : depose ou deja present, date et heure,
categorie choisie, statut.
```

**Pour des relevés bancaires**, deux changements : la catégorie est
*relevés bancaires* et non *factures fournisseurs*, et le numéro à chercher
dans l'historique est le **numéro de relevé** — les cinq chiffres à la fin du
nom de fichier (`25001`). Le dossier des relevés 2025 est
`https://drive.google.com/drive/folders/1X-qNAgyC_SyPa-hM6m8X-XTTdCsNQ3mZ`.

Et il faut dire explicitement à Chrome de **ne pas déposer le fichier
`_DUPLICATA`** : il est dans le même dossier, il porte le même numéro que le
25001, et rien dans son nom ne l'empêche d'être pris pour une pièce de plus.

---

## PROMPT 3 — faire le tour des espaces clients

Une fois par trimestre. Ce sont les pièces qui n'arrivent jamais par mail.

```
Je veux recuperer mes factures 2026 sur mes espaces clients.
Traite UN SEUL fournisseur a la fois, celui que je te nomme.

Fournisseur : [NOM]

1. Connecte-toi a son espace client.
2. Liste toutes les factures de l'annee 2026 : date, numero, montant TTC,
   periode si indiquee.
3. Telecharge celles que je te dirai, dans ce dossier :
   https://drive.google.com/drive/folders/1Wl82iXKZmGD4iNzYuVN06gQ6jYKnLxCt
4. Nomme-les : ANNEE-MOIS-JOUR_FOURNISSEUR_FACTURE_MONTANT_NUMERO.pdf

Commence par me donner la LISTE seulement. Ne telecharge rien avant
que je te le dise.
```

Les espaces à faire : **ADF** (la vraie facture du congrès, pas la
confirmation), **Mutualease**, **Aries / Entrepreneurs.com**, **Canva**,
**Hostinger**, **Recept AI**, **La Fraise Pro**.

---

## PROMPT 4 — relevés de banque BNP

Les relevés **ne vont pas sur le Drive** : ils contiennent des noms de
patients dans les libellés de virements et de chèques. Ils restent sur le
disque du PC jusqu'au dépôt sur le portail TGS.

Préalable, sinon l'extension n'a pas la main sur le disque :
- créer `C:\Compta 2026\Releves BNP`
- `chrome://settings/downloads` → **Toujours demander où enregistrer**

```
Connecte-toi a mon espace bancaire BNP Paribas
(mabanque.bnpparibas, ou entreprises.bnpparibas.net selon le compte).

Je cherche les RELEVES DE COMPTE de l'exercice 2026 pour mon
comptable : janvier a aout 2026. Septembre n'est pas cloture,
on le prendra plus tard.

ETAPE 1 - LISTER, NE RIEN TELECHARGER.

Va dans les documents / releves de compte.
Donne-moi la liste de tout ce qui existe sur 2026 :
- le numero ou l'intitule du compte
- le mois couvert
- la date d'arrete
- s'il y a plusieurs comptes, dis-le et liste-les separement

S'il y a un compte courant ET un compte a terme, un livret,
ou un compte CB commercant, je les veux tous : le comptable
a besoin de l'integralite des comptes de la societe.

Arrete-toi la et attends ma reponse.

ETAPE 2 - TELECHARGER (seulement quand je te le dis).

Telecharge les 4 premiers releves de la liste, dans ce dossier :
C:\Compta 2026\Releves BNP

Nomme chaque fichier ainsi :
ANNEE-MOIS-JOUR_BNP_RELEVE_COMPTE-XXXX_PAAAA-MM-JJ-au-AAAA-MM-JJ.pdf

La date du debut est la date d'ARRETE du releve.
COMPTE-XXXX = les 4 derniers chiffres du numero de compte.

Exemple :
2026-01-31_BNP_RELEVE_COMPTE-4127_P2026-01-01-au-2026-01-31.pdf
2026-02-28_BNP_RELEVE_COMPTE-4127_P2026-02-01-au-2026-02-28.pdf

Regles :
- Ouvre chaque PDF et verifie la periode avant de le nommer.
  Ne te fie pas au nom propose par la banque.
- Si un mois manque dans la liste, dis-le-moi, ne l'invente pas.
- Ne telecharge que les releves. Pas les avis d'operation,
  pas les echelles d'interet, pas les RIB.
- Ne supprime rien, ne modifie aucun parametre du compte.

Quand les 4 sont la, donne-moi la liste : nom du fichier,
periode reelle lue dans le PDF, solde de debut et solde de fin.
```

Relancer l'étape 2 pour les quatre suivants.

**Pourquoi demander les soldes.** Le solde de fin de janvier doit être le
solde de début de février. Si la chaîne casse, c'est qu'il manque un
relevé — et on le voit tout de suite, pas en juillet 2027.

**Pourquoi la référence du compte dans le nom.** Sans elle, `compta2026.py`
lit la période comme une référence et la détection de trous ne fonctionne
plus. `COMPTE-XXXX` occupe la place et le `_P...` est reconnu.

---

## PROMPT 5 — scans sans couche texte

Le Brother produit parfois des **PDF image pures**, sans aucun texte
sélectionnable. Le connecteur Drive ne renvoie alors rien du tout et la
pièce est illisible côté assistant. Claude in Chrome, lui, voit la page
telle qu'elle s'affiche : c'est la seule voie.

**Chrome ne fait que lire et renommer. Il ne déplace rien** — le classement
se fait ensuite côté assistant, qui a les dossiers et les droits. Une tâche
à la fois, c'est la règle qui a toujours tenu.

Dossier des scans : `16oa6oyoNviQ2Ko8veK72Q1sCcbamjRLx`

```
Ouvre ce dossier Google Drive :
https://drive.google.com/drive/folders/[ID DU DOSSIER]

Ce sont des scans, et ce sont des IMAGES : il n y a aucun texte
selectionnable. Il faut vraiment regarder la page.

Traite ces 5 fichiers, UN PAR UN, dans cet ordre :

[COLLER ICI LES 5 NOMS]

Pour chacun :

1. Ouvre le PDF et lis TOUTES les pages. Releve l emetteur, la nature du
   document (facture, avoir, relance, contrat, releve, courrier), le
   numero de piece, la date, la periode couverte s il y en a une, et le
   montant TTC.

2. Renomme ainsi :
   ANNEE-MOIS-JOUR_FOURNISSEUR_TYPE_MONTANT_NUMERO.pdf

   Exemples reels de ce cabinet :
   2026-09-30_LA-FRAISE_FACTURE_119.00_F-2026-093001309.pdf
   2026-06-30_EXECOM_FACTURE_334.80_FA006127.pdf
   2026-07-23_ONCD_RELANCE_462.00_262785280708.pdf

   Fournisseur en majuscules, sans espace, tirets autorises.
   Type : FACTURE AVOIR TICKET CONTRAT RELEVE ATTESTATION RELANCE
   INDU AFFILIATION AR RECU.
   Montant avec un point decimal, sans le symbole euro.
   Si la piece ne porte aucun montant, omets-le.

3. Si la piece couvre une periode, ajoute a la fin :
   _P2026-09-01-au-2026-09-30

NE DEPLACE AUCUN FICHIER. Ne supprime rien. Le classement n est pas ta
tache, je m en occupe apres.

Cinq regles :

- Si tu n arrives pas a lire le montant ou le numero, NE DEVINE PAS.
  Laisse le nom actuel et dis-moi ce que tu as pu lire.

- Si un meme PDF contient PLUSIEURS documents differents, par exemple
  une relance suivie d une facture reimprimee, ne choisis pas. Decris-moi
  chaque page et laisse le nom tel quel.

- Si c est un document PATIENT (nom, date de naissance, numero de
  securite sociale, devis, note d honoraires), NE LE RENOMME PAS.
  Signale-le-moi, il y a un circuit separe pour ca.

- Si tu vois une facture de loyer COFICA BAIL, dis-le-moi en premier,
  avant tout le reste.

- Si tu penses qu un fichier est le doublon d un autre, NE LE DECIDE PAS
  SEUL. Un meme montant ne prouve rien. Ouvre LES DEUX et verifie que le
  NUMERO DE PIECE est identique, puis qu un element de detail concorde
  (bon de livraison, ligne de produit, periode). Dis-le-moi et attends
  ma reponse.

En retour, pour chaque fichier : ancien nom, nouveau nom, et ce que tu as
lu — emetteur, nature, numero, date, periode, montant TTC.
```

Trois ajouts par rapport au PROMPT 1, tous payés par l'expérience.

**La règle « document patient ».** Un scan du 7 mai 2026 s'est révélé être une
note d'honoraires avec nom, date de naissance et numéro de sécurité sociale,
posée dans le sas comptable. Ça se reproduira.

**La règle « plusieurs documents dans un PDF ».** La deuxième relance
Straumann du 24/07 contenait le relevé de compte *et* la réimpression
intégrale d'une facture — trois pièces dans un seul scan. Un nom unique
aurait écrasé deux d'entre elles.

**L'alerte COFICA en tête de réponse.** Les loyers de mars, mai, juillet et
septembre manquent toujours. Deux des cinq précédents dormaient sous des noms
sans extension, invisibles à toute recherche.

### Pour un contrat ou un document long

Ne pas renommer d'emblée. Demander d'abord le nombre de pages, la nature
exacte, l'émetteur, le cocontractant, la date de signature, la durée,
l'échéance, le montant et la périodicité, puis le numéro de contrat. Le
crédit-bail « CMV Médiforce » était en réalité un bon de commande Henry
Schein : sans ces éléments, on nomme la pièce d'après le financeur et on
perd le vendeur.

---

## PROMPT 6 — relevés LCL  *(PERIME, voir l'encadré)*

> **Ne pas utiliser.** Une tâche planifiée liée à l'ordinateur du cabinet
> lit déjà les relevés LCL avec `pdftotext`, bien mieux que Chrome ne le
> ferait : *Relevé LCL – virements patients*, le 6 de chaque mois.
> Le relevé est dans `C:\Users\conta\Downloads` sous le nom
> `COMPTEPROLCL_07480070666_AAAAMMJJ.pdf`.
>
> Ce qui manque n'est pas un moyen de lire, c'est l'extraction des
> **débits** : cette tâche ne regarde que les crédits. Voir le PROMPT 7.
> Le prompt ci-dessous ne sert que si la machine est indisponible.

**Règle permanente, posée par le Dr le 01/10/2026 : les relevés bancaires ne
vont jamais sur le Drive.** Ils restent sur l'ordinateur du cabinet, dans
`C:\Compta 2026\Releves BNP`. L'assistant n'a aucun accès à ce disque — la
session tourne dans un conteneur en ligne. C'est donc Claude in Chrome qui lit
et qui **recrache les mouvements en texte**, que l'on recopie ensuite dans
`controle_bancaire.py`. Le relevé ne bouge pas.

Deux sources possibles, la seconde est la meilleure.

### Variante A — le fichier local

Chrome ouvre un PDF du disque avec une adresse `file:///`. Exemple :
`file:///C:/Compta%202026/Releves%20BNP/2026-01-31_LCL_RELEVE.pdf`
Les espaces s'écrivent `%20`. Si Chrome refuse, ouvrir le PDF à la main puis
demander à l'extension de lire l'onglet actif.

### Variante B — l'espace client LCL, sans fichier du tout

Se connecter à l'espace client et lire l'historique des opérations à l'écran.
Rien à télécharger, rien à ranger. Et LCL propose un **export CSV** des
opérations : dans ce cas, coller le CSV directement, c'est le plus rapide et
le plus fiable.

### Le prompt

```
Je veux relever les mouvements d UN SEUL releve de compte LCL.
Un seul a la fois : un releve LCL contient beaucoup de lignes.

Periode a traiter : [MOIS]  (les releves LCL vont du 6 d un mois au 5 du suivant)

Source : soit le PDF sur mon disque, soit l historique des operations dans
l espace client LCL. Dis-moi laquelle tu utilises.

NE TELECHARGE RIEN. NE DEPOSE RIEN SUR GOOGLE DRIVE.
Tu lis, tu me rends du texte, c est tout.

D abord, l en-tete :
- numero du releve
- periode exacte, du ... au ...
- solde de debut et solde de fin
- total des debits et total des credits

Ensuite, UNE LIGNE PAR MOUVEMENT, dans cet ordre exact, separe par des
barres verticales, sans tableau et sans mise en forme :

date | libelle complet | debit | credit

Exemples du format attendu :
26.01.2026 | PRLV SEPA COFICA BAIL ECH/260126 | 1353.76 |
10.02.2026 | VIR SEPA RECU /FRM LOISEAU JOHANNE RETRO JANVIER | | 1549.78

Regles :

- NE SAISIS PAS les virements de la CPAM. Aucun. Ils sont reconcilies par
  l export LOGOS du bilan. Si tu en vois, compte-les et dis-moi seulement
  combien il y en a et leur total, sans les detailler.

- Les montants avec un POINT decimal, sans symbole, sans espace de milliers.

- Recopie le libelle ENTIER, y compris les references et numeros de mandat.
  C est ce qui permet de rattacher le mouvement a une facture.

- Si un libelle contient un nom de patient, remplace-le par PATIENT et
  dis-le-moi. Ne recopie aucun nom de patient.

- Si un montant est illisible, ecris ILLISIBLE a sa place. Ne devine pas.

A la fin, verifie TOI-MEME : solde de debut + total credits - total debits
doit donner le solde de fin. Si ca ne tombe pas juste, dis-le, c est qu une
ligne manque.
```

**Pourquoi ce format.** Les lignes `date | libellé | débit | crédit` se
reversent directement dans `controle_bancaire.py`, et le recalcul du solde
refait le contrôle de son côté. Deux vérifications indépendantes de la même
chose : celle de Chrome et la mienne. C'est ce double filet qui a prouvé que
les 43 mouvements BNP étaient complets.

**Pourquoi exclure la CPAM en amont.** Sur le compte de la SELARL, les
virements CPAM sont le gros du volume. Les saisir à la main serait long et
produirait des écarts avec LOGOS, qui fait déjà ce travail. On demande juste
leur nombre et leur total, pour pouvoir vérifier que rien d'autre ne se cache
dedans.

---

## PROMPT 7 — débits du relevé LCL

C'est le seul trou du dispositif. La tâche du 6 extrait les **crédits**
(patients, mutuelles), LOGOS réconcilie la CPAM, et **personne n'extrait les
débits** — c'est-à-dire tous les règlements fournisseurs : COFICA, Aries,
Médiforce, Mutualease, Google, Anthropic, Canva, La Fraise, les labos.

À faire tourner **sur l'ordinateur**, dans une conversation liée à la machine,
soit en ajoutant ce bloc à la tâche existante, soit dans une seconde tâche le
même jour. Le relevé ne bouge pas, rien ne part sur le Drive.

```
Deuxieme partie de la tache : les DEBITS du releve LCL.

Meme releve que la premiere partie :
C:\Users\conta\Downloads\COMPTEPROLCL_07480070666_AAAAMMJJ.pdf
Extraction avec pdftotext -layout. Ne deplace pas le fichier, n upload rien.

Je veux TOUTES les ecritures au DEBIT, une par ligne, dans cet ordre exact,
separees par des barres verticales, sans tableau ni mise en forme :

date | libelle complet | montant

Exemples du format attendu :
26.01.2026 | PRLV SEPA COFICA BAIL ECH/260126 MDT/980750019180 | 1353.76
02.02.2026 | PRLV SEPA GOOGLE CLOUD FRANCE GCFRD0011667476 | 87.41

Regles :

- Le libelle ENTIER, avec les references, numeros de mandat et d echeance.
  C est ce qui rattache le mouvement a une facture : sans la reference, la
  ligne est inexploitable.

- Montants avec un POINT decimal, sans symbole, sans espace de milliers.

- N EXCLUS AUCUN DEBIT, meme ceux qui te semblent personnels. C est moi qui
  trie ensuite. Un debit oublie est un trou invisible.

- Si un libelle contient un nom de patient, remplace-le par PATIENT et
  signale-le. Ne recopie aucun nom de patient.

- Si un montant est illisible, ecris ILLISIBLE. Ne devine pas.

CONTROLE OBLIGATOIRE a la fin : ancien solde + total des credits - somme des
debits que tu viens de lister = nouveau solde du releve. Donne le calcul.
S il ne tombe pas juste, dis-le : il manque une ligne.

Donne aussi le nombre de virements CPAM, MSA et ENIM et leur total, sans les
detailler : c est LOGOS qui les reconcilie, je veux juste pouvoir verifier
qu aucun autre credit ne se cache dedans.
```

**Pourquoi ne rien exclure au débit.** Au crédit, le tri en amont fait gagner
du temps parce que la CPAM est traitée ailleurs. Au débit, c'est l'inverse :
le contrôle n'a de valeur que s'il est exhaustif. Le recalcul du solde ne
prouve rien si des lignes ont été écartées avant la saisie — et c'est ce
recalcul qui garantit qu'aucune charge n'a été oubliée.

**Pourquoi la référence complète.** Sans `MDT/980750019180` ni le numéro
d'échéance, impossible de dire quel loyer COFICA est payé. On a passé des
semaines à chercher trois loyers faute de pouvoir rattacher un débit à une
facture.

---

## PROMPT 8 — dépôt en continu, puis relevé du portail

**Où le lancer.** Depuis une session Claude Code **locale** sur le PC, ou
l'extension Claude in Chrome. Jamais depuis la session distante : elle n'a ni
le navigateur, ni la session TGS, ni les fichiers.

**Deux tâches séparées, et dans cet ordre.** La deuxième n'est pas une
formalité : c'est elle qui autorise les coches. Tant qu'elle n'a pas tourné,
rien n'est coché.

### Tâche A — déposer un lot de 5

```
Tu es sur le portail TGS, déjà connecté.

Dépose ces 5 pièces, une par une, dans l'espace de dépôt de l'exercice 2026 :

[coller ici les 5 noms de fichier donnés par fileDAttente()]

Les fichiers sont dans le Drive de contact@implantologielege.com. Pour chacun :
cherche le fichier par son nom exact, dépose-le, attends la confirmation du
portail avant de passer au suivant.

NE COCHE RIEN dans le Google Sheet. Ce n'est pas ton rôle ici.

À la fin, réponds-moi par une ligne par fichier, dans cet ordre :
  nom du fichier | DEPOSE ou ECHEC | ce que le portail a affiché

Si un dépôt échoue, dis-le et passe au suivant. Ne réessaie pas en boucle, et
n'invente jamais une confirmation que le portail n'a pas affichée.
```

### Tâche B — relever ce que le portail détient

```
Toujours sur le portail TGS, exercice 2026.

Ouvre la liste des pièces déjà déposées. Relève le NOM DE FICHIER EXACT de
chacune, telle que le portail l'affiche — sans rien corriger, sans rien
compléter, sans rien réordonner.

Si la liste est paginée, parcours toutes les pages et dis-moi combien tu en as
parcouru.

Rends-moi la liste brute, un nom par ligne, rien d'autre : pas de numérotation,
pas de puces, pas de commentaire.
```

Cette liste se colle dans l'onglet **PORTAIL** du Sheet, à partir de la ligne 3.
Puis on lance `cocherDepuisPortail()`.

**Pourquoi Chrome ne coche pas lui-même.** Une case cochée doit signifier « le
portail détient la pièce », jamais « Chrome pense l'avoir envoyée ». Un dépôt
qui échoue en silence serait coché, la pièce sortirait du radar, et on la
découvrirait au bilan. Une case cochée à tort est pire que pas
d'automatisation : elle éteint l'alerte. C'est la même règle que pour les
doublons — on ne conclut pas sur une apparence, on va voir la source.

**Pourquoi la liste brute et surtout pas « corrigée ».** Si Chrome rapproche
lui-même les noms, il rapprochera les ressemblances — et deux COFICA de
1 353,76 € se ressemblent énormément. Le rapprochement est fait par
`cle_()`, sur correspondance exacte, et tout écart est signalé au lieu d'être
deviné.

# PROMPTS CLAUDE IN CHROME — compta 2026

> **LA CATEGORIE DE DEPOT EST TOUJOURS « Je ne sais pas où déposer ce
> document ».** Ce n'est pas un recours en cas d'hésitation, c'est la règle.
> C'est TGS qui impute les pièces, pas nous. Le 06/10/2026 j'ai écrit
> « Mes factures d'achat » dans deux prompts : dix pièces sont parties dans
> la mauvaise catégorie avant que le Dr ne le voie.

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
Categorie : "Je ne sais pas ou deposer ce document".
C'est la categorie a utiliser par DEFAUT pour tout ce que je te donne.
Ne choisis JAMAIS une categorie plus precise de toi-meme : c'est TGS qui
impute, pas nous, et une piece rangee dans la mauvaise categorie leur coute
plus de temps qu'une piece non rangee.

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

---

## PROMPT 9 — télécharger les factures depuis les espaces clients

**Pourquoi télécharger plutôt que renommer.** Le lot 1 a échoué sur quatre
fichiers présents dans le Drive sous leur **ancien nom** : le renommage avait
été acté au registre mais jamais appliqué au fichier. Télécharger une copie
fraîche la fait arriver directement au bon nom, sans toucher aux originaux et
sans renommage à vérifier.

**La règle de nommage, et elle est non négociable.**

```
AAAA-MM-JJ_FOURNISSEUR_TYPE_MONTANT_REFERENCE[_Pdébut-au-fin].pdf
```

Montant TTC, point décimal, sans symbole. **Le montant se lit DANS le PDF**,
jamais sur la page du portail et jamais dans le nom du fichier proposé par le
site. Les montants Anthropic passent de 21,60 à 88,69 puis 108,00 à cause du
changement d'offre du 13 avril : une valeur recopiée d'une ligne voisine serait
fausse.

**Destination unique :** `Mon Drive > FACTURATION`. Le tri vient après.

**Avant d'enregistrer, vérifie qu'un fichier de ce nom exact n'existe pas
déjà** dans le Drive. S'il existe, n'enregistre pas et signale-le.

### Tâche 1 — Anthropic (console.anthropic.com)

```
Va sur console.anthropic.com, section facturation / historique des factures.

Télécharge ces quatre factures, une par une :
  HKTDOLB4-0001  —  période du 10/02/2026 au 10/03/2026
  HKTDOLB4-0002  —  période du 10/03/2026 au 10/04/2026
  HKTDOLB4-0003  —  période du 10/04/2026 au 10/05/2026
  et la facture de SEPTEMBRE 2026, émise vers le 13/09, dont je n'ai ni le
  numéro ni le montant confirmé

Pour chacune : ouvre le PDF, LIS le total TTC dedans, puis enregistre dans
Mon Drive > FACTURATION sous le nom

  AAAA-MM-JJ_ANTHROPIC_FACTURE_MONTANT_REFERENCE_PAAAA-MM-JJ-au-AAAA-MM-JJ.pdf

Exemple pour la première, SI le PDF confirme bien 21,60 :
  2026-02-10_ANTHROPIC_FACTURE_21.60_HKTDOLB4-0001_P2026-02-10-au-2026-03-10.pdf

Si le montant lu dans le PDF diffère de 21,60, utilise CELUI DU PDF et
signale-le-moi.

Réponds par une ligne par facture :
  nom du fichier enregistré | montant lu dans le PDF | OK ou ECHEC + motif
```

### Tâche 2 — Canva (canva.com)

```
Va sur canva.com, paramètres de facturation, historique des factures.

Télécharge les factures de JUILLET, AOÛT et SEPTEMBRE 2026 — émises le 6 de
chaque mois, 12,00 EUR attendus. Celle d'octobre tombe le 06/10 : prends-la
aussi si elle est déjà là.

Même règle : lis le montant et le numéro DANS le PDF. Enregistre dans
Mon Drive > FACTURATION sous

  AAAA-MM-JJ_CANVA_FACTURE_MONTANT_REFERENCE_PAAAA-MM-JJ-au-AAAA-MM-JJ.pdf

La référence Canva ressemble à 04904-74747500-1.

Réponds par une ligne par facture : nom enregistré | montant | numéro | OK ou ECHEC.
```

### Tâche 3 — Aries (espace entrepreneurs.com)

```
Connecte-toi à l'espace client entrepreneurs.com, section factures.

Il me manque JANVIER, JUILLET et AOÛT 2026 — 990,00 EUR par mois attendus.
Rien n'a été reçu depuis la facture de juin.

Attention : ces factures sont EXONÉRÉES DE TVA (export de services, société de
Dubaï). Le total TTC égale donc le HT. Lis-le dans le PDF.

Enregistre dans Mon Drive > FACTURATION sous
  AAAA-MM-JJ_ARIES_FACTURE_MONTANT_REFERENCE_PAAAA-MM-JJ-au-AAAA-MM-JJ.pdf

Les références Aries ont deux formes : F-2026-02-000008793 et INV-2026-01345.
Recopie celle qui figure sur le PDF, sans la normaliser.

Réponds par une ligne par facture. Si un mois n'existe pas dans l'espace,
dis-le au lieu de prendre le mois voisin.
```

### Tâche 4 — MACSF (macsf.fr, identifiant 7904376)

```
Connecte-toi à macsf.fr avec l'identifiant 7904376 — même espace client que la
RCP.

Je cherche l'ATTESTATION FISCALE MADELIN du contrat de prévoyance P15 001,
pour l'année 2026.

Enregistre-la dans Mon Drive > FACTURATION sous
  2026-12-31_MACSF_ATTESTATION_MONTANT_P15-001_P2026-01-01-au-2026-12-31.pdf

Le montant est le total des cotisations versées sur l'année, tel qu'il figure
sur l'attestation. S'il n'y figure pas, omets le bloc montant.

Si l'attestation 2026 n'est pas encore émise, dis-moi à partir de quelle date
elle le sera. Ne prends pas celle de 2025 à la place.
```

### Tâche 5 — Straumann (eShop)

```
Connecte-toi à l'eShop Straumann, historique des factures.

Je cherche la facture 9060125749, du 16/06/2026, 100,74 EUR, échéance le
16/07/2026. Je ne la connais que par une ligne de relevé bancaire — je n'ai
jamais vu la facture elle-même.

Attention : il y a DEUX comptes clients, 15133210 et 15133626. Cherche dans
les deux.

Enregistre sous
  2026-06-16_STRAUMANN_FACTURE_MONTANT_9060125749.pdf
avec le montant lu dans le PDF. S'il n'est pas de 100,74, signale-le : c'est
le relevé bancaire qui serait à revoir.
```

### Ce qui ne se télécharge PAS — à réclamer

Ces pièces n'existent sur aucun espace client. Inutile de les chercher :

| Pièce | Montant | À qui |
|---|---|---|
| COFICA loyers mars et mai | 1 353,76 € ×2 | Cofica Bail, agence 95908 |
| Made in Labs mai et juin | 3 522,72 € et 3 089,02 € | Made in Labs |
| ZFX R-2602.52453 | 253,99 € | Zfx Lyon |
| ADF — la vraie facture | 389,00 € | Espace Apprenant adfcongres.com, **attestations à partir du 03/12/2026** |

Ce qu'on a de l'ADF est une **confirmation d'inscription**, pas une facture.
C'est noté au registre et ça reste vrai : rien à télécharger avant décembre.

---

## PROMPT 10 — lot 3, les cinq factures Aries  *(prêt à coller, 06/10/2026)*

Version remplie du PROMPT 2. Les noms et le dossier ont été **vérifiés dans
le Drive le 06/10** : les cinq fichiers existent sous ces noms exacts.

**Deux pièges, et ils sont dans le prompt :**

1. **Les deux factures de mars se ressemblent à s'y tromper** —
   `F-2026-03-000009276` et `F-2026-03-000009829`, 990,00 € chacune. Ce ne
   sont PAS des doublons : la première couvre mars, la seconde avril (émise le
   30/03, échéance au 14/04). Sans cet avertissement, Chrome en déposera une
   et sautera l'autre.
2. **L'historique contient quatre factures Aries de 2025.** Une recherche sur
   « ARIES » les ramène et donne l'illusion que c'est déjà déposé. D'où
   l'ordre de chercher le **numéro complet**, jamais le nom du fournisseur.

```
Va sur https://monespaceclient.tgs-france.fr

J'ai 5 factures a deposer. Elles sont dans ce dossier Drive :
https://drive.google.com/drive/folders/1VDRQDpIbCO7R3NRibxAXCWcAgsAbBS1N

Le dossier contient d'autres fichiers. Ne prends QUE ces cinq-la, par leur
nom exact :

2026-02-01_ARIES_FACTURE_990.00_F-2026-02-000008793_P2026-02-01-au-2026-02-28.pdf
2026-03-01_ARIES_FACTURE_990.00_F-2026-03-000009276_P2026-03-01-au-2026-03-31.pdf
2026-03-30_ARIES_FACTURE_990.00_F-2026-03-000009829_P2026-04-01-au-2026-04-30.pdf
2026-04-30_ARIES_FACTURE_990.00_F-2026-04-0000010320_P2026-05-01-au-2026-05-31.pdf
2026-05-31_ARIES_FACTURE_990.00_INV-2026-01345_P2026-06-01-au-2026-06-30.pdf

AVERTISSEMENT IMPORTANT. Les cinq font 990,00 EUR chacune et quatre portent
un numero qui commence par F-2026. Ce ne sont PAS des doublons : ce sont
cinq mois d'abonnement differents. Les deux de mars en particulier,
F-2026-03-000009276 et F-2026-03-000009829, sont deux factures distinctes.
Depose-les toutes les cinq.

Pour chaque fichier, dans cet ordre :

ETAPE 1 - verifier qu'il n'y est pas deja.
Ouvre Mes depots de documents puis Historique des depots.
Plage de dates la plus large, toutes categories.
Cherche le NUMERO COMPLET, par exemple F-2026-02-000008793.
NE CHERCHE PAS "ARIES" ni "990" : l'historique contient quatre factures
Aries de 2025 (F-2025-09-000006226, F-2025-10-000006935,
F-2025-11-000007812, F-2025-12-000008290) qui n'ont rien a voir avec
celles-ci. Si tu cherches le fournisseur, tu vas croire a tort que c'est
deja fait.
Si tu trouves le numero complet, ne depose pas et dis-le-moi.

ETAPE 2 - deposer.
Categorie : "Je ne sais pas ou deposer ce document".

ETAPE 3 - noter.
Releve la date, l'heure et le statut affiche apres l'envoi.

Ne depose rien d'autre. Ne renomme rien. Ne supprime rien. Ne deplace rien.

En retour, pour chaque fichier : depose ou deja present, date et heure,
categorie choisie, statut affiche. Et dis-moi clairement si l'un des cinq
n'a PAS pu etre depose, avec la raison.
```

**Après le retour de Chrome**, cocher les cinq lignes dans le Google Sheet et
passer l'état à `DEPOSEE` au registre. À signaler à Mme Daheron au passage :
Aries Consulting FZCO est à Dubaï, donc **autoliquidation de la TVA**
(art. 44 dir. 2006/112/CE) — 4 950 € de prestations sans TVA déductible, à
déclarer en TVA due et déductible simultanément.

---

## PROMPT 11 — lot 7 recomposé, cinq factures fournisseurs  *(prêt à coller, 06/10/2026)*

**Pourquoi le lot 7 du fichier LOTS_DEPOT n'est pas celui-ci.** Il mélangeait
trois catégories de dépôt — factures fournisseurs, recettes (la note
d'honoraires 2825) et relevés bancaires (le BNP 26009) — soit trois tâches
déguisées en une, contre la règle maison. Et il contenait l'ADF, qui est une
**confirmation d'inscription et non une facture**, plus le GACD encore sous
son nom brut. Les quatre sortent ; deux factures La Fraise les remplacent.

**Liens directs par fichier** et non lien de dossier : les cinq vivent dans
quatre dossiers différents.

**Trois pièges, tous dans le prompt :**

1. **Les deux La Fraise font 119,00 € chacune** — même piège qu'Aries. Juin et
   septembre, deux abonnements distincts.
2. **L'historique contient un dépôt Execom de 2025** (`execom chq 8430739
   504 00euros`). Chercher « EXECOM » fait croire que c'est fait.
3. **L'historique contient deux dépôts Neohm** (`NEOHM Facture FR156786`,
   `NEOHM facture 1sur 2 de 2210 4`). Ni l'un ni l'autre n'est FR159171.

```
Va sur https://monespaceclient.tgs-france.fr

J'ai 5 factures fournisseurs a deposer. Elles sont dans quatre dossiers
differents du Drive, donc je te donne un lien par fichier. Ouvre chaque lien,
telecharge le PDF, puis depose-le.

1. NEOHM facture FR159171 - 1132,80 EUR
   https://drive.google.com/file/d/1qYs4IVimDiuRKn4H60xCbNqnjvnV6shO/view

2. EXECOM facture FA006127 - 334,80 EUR
   https://drive.google.com/file/d/1Bt5MTZmkOQO1FBD8_FMHKUBIAF8rpAWP/view

3. ZFX mise en demeure D-2606.08953 - 253,99 EUR
   https://drive.google.com/file/d/1lFKmgHbsS0e7-lmQ2RzAiP2MZzTTQYaa/view

4. LA FRAISE facture F-2026-06300142 - 119,00 EUR
   https://drive.google.com/file/d/1ngE-uC5l_IgDZn1cX9wqDDt586sciSQc/view

5. LA FRAISE facture F-2026-093001309 - 119,00 EUR
   https://drive.google.com/file/d/1FCXJMeuo8Zx9vlQxptGx13HPGXi1jWr4/view

AVERTISSEMENT 1. Les deux factures La Fraise font 119,00 EUR chacune. Ce ne
sont PAS des doublons : l'une est de juin, l'autre de septembre. Depose les
deux.

AVERTISSEMENT 2. Pour verifier si une piece est deja presente, cherche
TOUJOURS le NUMERO COMPLET, jamais le nom du fournisseur :
- « EXECOM » ramene un depot de 2025 (execom chq 8430739 504 00euros) qui
  n'a rien a voir.
- « NEOHM » ramene deux depots (NEOHM Facture FR156786 et NEOHM facture
  1sur 2 de 2210 4) dont aucun n'est FR159171.
Si tu cherches le fournisseur, tu vas croire a tort que c'est deja fait.

Pour chaque fichier, dans cet ordre :

ETAPE 1 - verifier qu'il n'y est pas deja.
Ouvre Mes depots de documents puis Historique des depots.
Plage de dates la plus large, toutes categories.
Cherche le numero complet : FR159171, puis FA006127, puis D-2606.08953 ou
2606.08953, puis F-2026-06300142, puis F-2026-093001309.
Si tu trouves le numero complet, ne depose pas et dis-le-moi.

ETAPE 2 - deposer.
Categorie pour les cinq : "Je ne sais pas ou deposer ce document".

ETAPE 3 - noter.
Releve la date, l'heure et le statut affiche apres l'envoi.

Ne depose rien d'autre. Ne renomme rien. Ne supprime rien. Ne deplace rien.

En retour, pour chaque fichier : depose ou deja present, date et heure,
statut affiche. Et dis-moi clairement si l'un des cinq n'a PAS pu etre
depose, avec la raison.
```

**Total du lot : 1 959,59 €.**

**À signaler à Mme Daheron avec ce lot :** la pièce ZFX est une **mise en
demeure** portant sur la facture R-2602.52453 du 13/02/2026, et cette facture
d'origine n'est ni au Drive ni au portail. Elle est à réclamer à ZFX.

## Les quatre pièces sorties du lot 7, et où elles vont

| Pièce | Pourquoi elle sort | Catégorie de dépôt |
|---|---|---|
| ADF C-30800 · 389 € | confirmation d'inscription, pas une facture — la vraie est sur adfcongres.com, Espace Apprenant | fournisseurs, après récupération |
| GACD 2402391923 · 548,73 € | encore nommée `2402391923.pdf` | fournisseurs, après renommage |
| Note d'honoraires 2825 · 232 € | c'est une **recette**, pas un achat | recettes |
| Relevé BNP 26009 | relevé bancaire | relevés bancaires |

---

## PROMPT 12 — lot Septodont, cinq pièces  *(prêt à coller, 06/10/2026)*

Un seul dossier, une seule catégorie, cinq pièces, **1 886,54 €**.

**Deux pièges :**

1. **Le rappel Septodont du 27/08 est DÉJÀ déposé** (`SEPTODONT Rappel de
   paiement 27 08 2026.pdf`, Dépôt OK le 06/10). La relance 1034064 de ce lot
   est celle du **11/09**, une autre pièce. Chrome qui cherche « rappel » ou
   « relance » trouvera le 27/08 et conclura à tort.
2. **L'historique contient une dizaine de dépôts Septodont** — `90005673`,
   `90021319`, `septodont 143 32`, `septodont chq 8430648`… Chercher
   « SEPTODONT » les ramène tous.

```
Va sur https://monespaceclient.tgs-france.fr

J'ai 5 pieces Septodont a deposer. Un lien par fichier, ouvre, telecharge,
depose.

1. Facture 90049585 du 25/06/2026 - 359,02 EUR
   https://drive.google.com/file/d/1D0E67i9YqXCRRvEBr313egHO177aF6bg/view

2. Facture 90056020 du 28/07/2026 - 383,63 EUR
   https://drive.google.com/file/d/1vNFG6JGBKi8Q4CwR6di1TK4401TGonA2/view

3. Facture 90056093 du 28/07/2026 - 364,73 EUR
   https://drive.google.com/file/d/1NLaiQRz-CuZf5PO7lGmr3XvM_HHt7C9Z/view

4. Facture 90060529 du 03/09/2026 - 15,40 EUR
   https://drive.google.com/file/d/1kCxiHsNbB0em3idn3wgxvKjBiSyqroIC/view

5. Relance 1034064 du 11/09/2026 - 763,76 EUR
   https://drive.google.com/file/d/1PsQu6lkw2sco_0fJCXYHNTpgd4K5t4P-/view

AVERTISSEMENT 1. Les pieces 2 et 3 portent la MEME DATE, le 28/07/2026, et
viennent du meme fournisseur. Ce ne sont pas des doublons : deux factures
distinctes, 383,63 et 364,73. Depose les deux.

AVERTISSEMENT 2. Un rappel de paiement Septodont du 27/08/2026 est DEJA
depose au portail. La piece 5 de ma liste est la relance du 11/09/2026,
numero 1034064 : ce n'est PAS la meme. Ne conclus pas qu'elle est deja la
parce que tu vois un rappel Septodont dans l'historique.

AVERTISSEMENT 3. Pour verifier, cherche TOUJOURS le numero complet, jamais
« SEPTODONT » : l'historique contient une dizaine de depots Septodont
(90005673, 90021319, septodont 143 32, septodont chq 8430648...) qui n'ont
rien a voir avec ces cinq-la.

Pour chaque fichier, dans cet ordre :

ETAPE 1 - verifier qu'il n'y est pas deja.
Ouvre Mes depots de documents puis Historique des depots.
Plage de dates la plus large, toutes categories.
Cherche le numero complet : 90049585, puis 90056020, puis 90056093, puis
90060529, puis 1034064.
Si tu trouves le numero complet, ne depose pas et dis-le-moi.

ETAPE 2 - deposer.
Categorie pour les cinq : "Je ne sais pas ou deposer ce document".
C'est TGS qui impute, pas nous. Ne choisis JAMAIS une categorie plus
precise de toi-meme.

ETAPE 3 - noter.
Releve la date, l'heure et le statut affiche apres l'envoi.

Ne depose rien d'autre. Ne renomme rien. Ne supprime rien. Ne deplace rien.

En retour, pour chaque fichier : depose ou deja present, date et heure,
statut affiche. Et dis-moi clairement si l'un des cinq n'a PAS pu etre
depose, avec la raison.
```

**Pour Mme Daheron :** la facture 90056020 porte **deux taux de TVA**, 20 %
et 2,10 % sur les anesthésiques. Et la relance 1034064 est intégralement
couverte par des pièces déjà au portail — il n'y a rien à réclamer à
Septodont, juste à payer.

---

## PROMPT 13 — carburant, cinq tickets prouvés payés  *(prêt à coller, 06/10/2026)*

**Le premier lot conforme à la règle du Dr** : chaque pièce est appariée à un
débit carte du relevé LCL, au centime et à la date. C'est l'appariement le
plus solide possible — pas une déduction, une correspondance.

| Ticket | Débit LCL | Montant |
|---|---|---|
| 16/05 Petro-Ouest | relevé 51, `CB97PETRO-OUEST 16/05/26` | 109,15 € |
| 07/06 Super U | relevé 52, `CB97UEP*DAC SUPE 07/06/26` | 126,27 € |
| 18/06 Petro-Ouest | relevé 52, `CB97PETRO-OUEST 18/06/26` | 123,01 € |
| 20/07 Petro-Ouest | relevé 53, `CB97PETRO-OUEST 20/07/26` | 122,59 € |
| 14/09 Super U | relevé 55, `CB97UEP*DAC SUPE 14/09/26` | 145,59 € |

**626,61 €.** Les cinq étaient absents du registre : ils dormaient dans les
scans Brother du 06/10, sous des noms de scanner. Je les ai renommés.

**Particularité de ce lot : les tickets n'ont pas de numéro de pièce.** La
vérification se fait donc par **date et montant**, pas par référence. J'ai
contrôlé moi-même : **aucun ticket de carburant n'a jamais été déposé** — zéro
sur les 1 325 lignes de l'historique depuis 2023. Le risque de doublon est
donc nul, et le prompt le dit pour que Chrome ne cherche pas en vain.

```
Va sur https://monespaceclient.tgs-france.fr

J'ai 5 tickets de carburant a deposer. Un lien par fichier.

1. 2026-05-16_PETRO-OUEST_TICKET_109.15.pdf
   https://drive.google.com/file/d/1o6a40IQd6EIiwmh1biEYDjKi_bX95eR7/view

2. 2026-06-07_SUPER-U-LEGE_TICKET_126.27.pdf
   https://drive.google.com/file/d/1kDXjg8vjxQrnIFBCRYJto4A6QvDQe-R3/view

3. 2026-06-18_PETRO-OUEST_TICKET_123.01.pdf
   https://drive.google.com/file/d/1N3E9iuZA50RaTEH4jXYyvjfcTTIREOn7/view

4. 2026-07-20_PETRO-OUEST_TICKET_122.59.pdf
   https://drive.google.com/file/d/14IHNQQ9MrZoOElkWOG7krqozMxdopRcY/view

5. 2026-09-14_SUPER-U-LEGE_TICKET_145.59.pdf
   https://drive.google.com/file/d/1_EgJbP9vkdwVZjrP7kzwbRGCtkuE3Q7v/view

PAS D'ETAPE DE VERIFICATION POUR CE LOT. Un ticket de caisse n'a pas de
numero de piece, donc rien a chercher dans l'historique. J'ai verifie
moi-meme : aucun ticket de carburant n'a jamais ete depose, sur les 1 325
lignes de l'historique depuis 2023. Ne perds pas de temps a chercher.

Pour chaque fichier :

ETAPE 1 - deposer.
Categorie pour les cinq : "Je ne sais pas ou deposer ce document".
C'est TGS qui impute, pas nous. Ne choisis JAMAIS une categorie plus
precise de toi-meme.

ETAPE 2 - noter.
Releve la date, l'heure et le statut affiche apres l'envoi.

Ne depose rien d'autre. Ne renomme rien. Ne supprime rien. Ne deplace rien.

En retour, pour chaque fichier : date et heure, statut affiche. Et dis-moi
clairement si l'un des cinq n'a PAS pu etre depose, avec la raison.
```

**Un sixième plein manque.** Le relevé 50 porte
`CB97PETRO-OUEST 05/04/26` de **116,33 €** sans ticket scanné. C'est
l'erreur n° 3 du mode d'emploi : un ticket se photographie le jour même.
Celui-là est probablement perdu — à chercher dans la voiture ou le bureau.

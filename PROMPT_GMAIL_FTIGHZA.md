# Prompt Gmail — récupérer les pièces manquantes sur ftighza@gmail.com

*Écrit le 12/10/2026. À coller dans Claude in Chrome, sur l'onglet Gmail de
`ftighza@gmail.com` déjà connecté.*

---

## À coller dans Chrome

Tu es dans la boîte Gmail `ftighza@gmail.com`. Tu dois y retrouver des factures
et des courriers manquants pour la comptabilité 2026 de la SELARL TIGHZA.

### Quatre règles, aucune n'est négociable

**1. RIEN NE PART DE CETTE ADRESSE.** Tu ne transfères aucun message, tu ne
réponds à aucun message, tu n'envoies rien. C'est la règle la plus importante
de ce travail, et c'est aussi le réflexe naturel quand on veut « récupérer » une
facture reçue par mail : ici, c'est interdit. Si tu te retrouves devant une
fenêtre de rédaction, ferme-la.

**2. N'utilise pas le bouton « Enregistrer dans Drive » de Gmail.** Il
enregistrerait dans le Drive de `ftighza@gmail.com`, qui n'est pas celui de la
comptabilité. **Tu télécharges les pièces jointes**, c'est tout. Elles
arriveront dans le dossier Téléchargements de l'ordinateur, et c'est le bon
endroit : je les reprendrai de là.

**3. Tu ne modifies rien dans la boîte.** Pas de suppression, pas d'archivage,
pas de libellé, pas de mise à la corbeille. Si un message est non lu, essaie de
le laisser non lu. Tu lis et tu télécharges, point.

**4. Dis-moi le nom exact de chaque fichier téléchargé, et à quelle facture il
correspond.** C'est la consigne la plus utile de tout ce prompt. Les
fournisseurs nomment très mal leurs pièces jointes : ce matin encore, une
facture Straumann s'appelait `invoice 0982494040.pdf` et une facture Made in
Labs `id=36409.pdf`. Sans ta correspondance, le fichier est inexploitable.

### Méthode

Un fournisseur à la fois, dans l'ordre ci-dessous. Après chacun, dis-moi ce que
tu as trouvé et ce qui manque, puis passe au suivant. **Les trous
m'intéressent autant que les trouvailles** : si un fournisseur facture tous les
mois et qu'il te manque mars, c'est une information, pas un échec.

Si une requête ne rend rien, élargis-la avant de conclure : enlève
`has:attachment` (certaines factures sont derrière un lien « voir ma facture »,
et dans ce cas tu suis le lien et tu télécharges le PDF depuis le site), enlève
la date, essaie le nom du fournisseur seul. **Ne conclus « rien » qu'après
avoir essayé au moins deux formulations**, et dis-moi lesquelles.

---

## Priorité 1 — l'urgent et le gros

### HENRY SCHEIN — 6 factures, 1 071,75 €, mise en demeure

```
from:henryschein OR "Henry Schein" after:2025/11/30
```

Les six factures à retrouver, par numéro :

| n° | date | montant |
|---|---|---|
| 4287993 | 04/06/2026 | 381,49 € |
| 4293114 | 08/06/2026 | 124,99 € |
| 4317192 | 30/06/2026 | 231,34 € |
| 4320966 | 03/07/2026 | 31,98 € |
| 4336516 | 22/07/2026 | 31,98 € |
| 4377209 | 17/09/2026 | 269,97 € |

C'est le dossier le plus pressé : un « dernier rappel » avec menace de
procédure contentieuse porte sur ces six-là. Si tu n'en trouves que certaines,
dis-moi précisément lesquelles.

### LIXXBAIL — 7 198 €, crédit-bail

```
lixxbail OR "LIXXBAIL" OR EM002148431 after:2025/11/30
```

Douze prélèvements sur l'année, contrat `EM002148431`. **C'est un crédit-bail,
donc la pièce la plus importante de toute la liste** : un expert-comptable la
réclamera forcément, et sans elle l'immobilisation ne peut pas être traitée. Si
tu ne trouves pas les factures, cherche au moins **le contrat** et
**l'échéancier**.

### COFICA BAIL — 2 factures de 1 353,76 €

```
cofica OR "Cofica Bail" after:2025/11/30
```

Les deux manquantes sont du **25/02/2026** et du **24/04/2026**, 1 353,76 €
chacune. Les prélèvements sont mensuels, donc il devrait y avoir une série
complète : dis-moi quels mois tu vois et quels mois manquent.

### MADE IN LABS — facture 35937, 3 089,02 €

```
"made in labs" OR madeinlabs after:2026/05/01
```

Une seule pièce : la facture **35937**, 3 089,02 €, probablement de juin 2026
(celle de mai est 35684, celle de juillet 36187).

---

## Priorité 2 — les séries à trous

### ROTEC — 10 factures, 3 020 €

```
rotec after:2025/11/30
```

Par numéro : `5101378` (13/01, 60,50), `5111168` (21/01, 60,50), `5113217`
(17/02, 128,00), `5115373` (24/03, 930,00), `5115612` (25/03, 528,50),
`5115598` (27/03, 581,50), `5115742` (30/03, 132,00), `5118952` (22/05,
382,50), `5124043` (02/09, 70,50), et `5114472` (146,00, **date inconnue** —
dis-moi ce que porte le document).

Cinq de ces factures sont de mars 2026. Si Rotec envoie ses factures par mail,
elles devraient toutes y être.

### NTJ — 5 factures, 2 431 €

```
ntj OR "NTJ" after:2025/11/30
```

Manquent : `20240242` (02/02, 694,00), `20240256` (02/03, 261,00), `20240280`
(04/05, 578,00), `20240293` (01/06, 151,00), `20240304` (01/07, 747,00).

### GACD — 10 factures, 1 053 €

```
from:gacd OR GACD has:attachment after:2025/11/30
```

Manquent : `2402318938` (21/04, 14,15), `240235574` (02/06, 56,01),
`2402358750` (09/06, 147,73), `2402359883` (10/06, 20,32), `2402361965` (12/06,
370,95), `2402363184` (15/06, 12,54), `2402365910` (18/06, 431,37), plus
`2402336461` et `2402321857` dont je n'ai **pas le montant** — si tu les
trouves, lis-le-moi.

### ARGOAT — 3 pièces

```
argoat after:2025/11/30
```

Manquent : `ARG11138` (02/02/2026, 64,00) ; la facture du **28/02/2026**, dont
je n'ai ni numéro ni montant ; et il faut vérifier s'il existe des factures
d'**août et septembre 2026**, totalement absentes de mes relevés.

### ARIES / ENTREPRENEURS.COM — 990 € par facture

```
entrepreneurs.com OR "Aries Consulting" OR aries after:2025/11/30
```

Au moins celle du 01/01/2026 à 990,00 €, et il en manque probablement trois
depuis juin 2026.

---

## Priorité 3 — fiscal et social, et c'est important aujourd'hui

**Cette boîte est l'adresse que la CARCDSF a au dossier.** C'est donc ici
qu'arrivent les appels de cotisations et, probablement, les mises en demeure.
Cherche large :

```
from:carcdsf OR carcdsf OR "retraite des chirurgiens dentistes"
```
```
from:impots.gouv.fr OR "finances publiques" OR "saisie administrative"
```
```
urssaf OR "mise en demeure" OR "mise en recouvrement" OR contentieux
```

Ce que je veux savoir, et c'est une question, pas une liste de téléchargements :
**y a-t-il dans cette boîte des courriers d'administration que personne n'a
traités ?** Une saisie à tiers détenteur datée du 21/09/2026 a été découverte
aujourd'hui pour une cotisation foncière impayée depuis décembre 2025 — elle a
dormi neuf mois. Je veux savoir s'il y en a d'autres. Télécharge tout ce que tu
trouves et liste-le par date.

Cherche aussi :

```
carcdsf OR "déclaration de revenus" OR DSI OR "revenus 2025"
```

pour voir si la CARCDSF a réclamé la déclaration de revenus avant l'appel du
25 septembre.

---

## Priorité 4 — les abonnements, si tu as encore du temps

Une requête par ligne, télécharge tout ce qui vient :

```
from:doctolib.fr has:attachment after:2025/11/30
recept has:attachment after:2025/11/30
icare has:attachment after:2025/11/30
from:free.fr OR from:freemobile has:attachment after:2025/11/30
from:ionos.fr has:attachment after:2025/11/30
from:hostinger has:attachment after:2025/11/30
from:adobe.com has:attachment after:2025/11/30
from:openai.com has:attachment after:2025/11/30
from:canva.com has:attachment after:2025/11/30
from:microsoft.com facture after:2025/11/30
"BNP Paribas Lease" OR "BNP Lease" after:2025/11/30
"CM-CIC" OR "Leasing Solutions" after:2025/11/30
macsf OR madelin OR prevoyance after:2025/11/30
```

Pour Hostinger je cherche la facture du **18/04/2026**. Pour Canva, trois
factures de 12,00 € : **juillet, août et septembre 2026**. Pour Google
Workspace, la facture `GCFRD0011327141` du **02/01/2026**. Pour MACSF, c'est
l'**attestation fiscale Madelin** qui m'intéresse, contrat `P15 001` ou
`F0015` — le numéro est incertain.

Deux avertissements :

**Amazon, Apple et Spotify sont probablement un mélange personnel et
professionnel.** Télécharge quand même, on triera après — mais signale-le.

**Ne te laisse pas piéger par les montants identiques.** Dans ce dossier,
plusieurs pièces distinctes portent le même montant : trois ORMCO à 19,98 €,
deux CPAM à 96,75 €, deux ONCD à 462,00 €. Deux factures du même montant ne
sont pas un doublon. Si tu hésites, télécharge les deux et dis-le-moi.

---

## Ce que je veux dans ton rapport

Un tableau par fournisseur :

| colonne | contenu |
|---|---|
| fournisseur | |
| trouvées | combien, et leurs numéros |
| nom du fichier | **le nom exact du fichier téléchargé**, pour chaque facture |
| manquantes | les numéros de ma liste que tu n'as pas trouvés |
| requêtes essayées | surtout celles qui n'ont rien rendu |

Puis, séparément :

1. **Les courriers d'administration** que tu as trouvés, par date, avec leur
   objet — qu'ils soient téléchargés ou non.
2. **Ce qui t'a surpris.** Un fournisseur qui facture à une autre adresse, une
   facture au nom d'un confrère, un montant qui ne ressemble à rien, un
   courrier resté non lu depuis des mois. Dis-le même si ça ne fait pas partie
   de ta tâche : c'est souvent là qu'est l'essentiel.
3. **Ce que tu n'as pas pu faire**, et pourquoi. Si tu as sauté une requête ou
   renoncé à un téléchargement, dis-le simplement. Je préfère une liste
   incomplète et honnête à une liste qui prétend être complète.

Et rappelle-moi, en une ligne à la fin, que tu n'as envoyé aucun message depuis
cette adresse.

---

## Note pour moi, pas pour Chrome

**Les fichiers arrivent dans `Téléchargements`, pas sur le Drive de contact@.**
La règle est « aucun mail ne part de ftighza, mais les factures doivent partir
sur le drive de contact » : le transfert est donc interdit et le passage par le
disque est obligatoire. Une fois les fichiers dans `Téléchargements`, ils sont
sur le portable — donc accessibles depuis le Drive synchronisé de contact@. Le
dépôt se fera en seconde étape.

**Ne pas déclencher ce prompt et le dépôt TGS dans la même session Chrome.**
Les deux manipulent des téléchargements et des noms de fichiers ; mélanger les
deux, c'est perdre la correspondance nom ↔ numéro, qui est tout l'intérêt.

**Les 7 avoirs Straumann ne sont pas dans cette liste**, et c'est voulu : ils
ne sont pas à retrouver dans une boîte mail, ils sont à réclamer au
fournisseur. Le brouillon est parqué, entrée 7 de `A_VERIFIER_PLUS_TARD.md`,
et il part de `contact@`, pas d'ici.

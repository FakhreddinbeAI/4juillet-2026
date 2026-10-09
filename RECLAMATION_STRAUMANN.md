# Straumann — réclamer les pièces manquantes (09/10/2026)

**Neuf documents manquent**, et ils se réclament en une seule fois au même
fournisseur : sept avoirs, une facture, et un avoir dont on ignore l'objet.

Mais **une voie n'a pas été essayée**, et il faut l'épuiser avant de réclamer.

---

## La piste à épuiser d'abord : les commandes « EXC »

L'avoir 9060040628, le seul des huit qu'on détienne, porte dans son en-tête :

> **No de commande EXC 2300813341** — Date de commande 26 févr. 26

Ces avoirs sont des **échanges**. Ils ont donc leur propre numéro de commande,
préfixé `EXC`, **distinct des commandes mensuelles** que Chrome a parcourues de
janvier à juin. Si les PDF des avoirs sont rattachés à leur commande d'échange
plutôt qu'à la commande d'origine, ils sont là et il n'y a rien à réclamer.

C'est pour ça que l'étape 1 du prompt cherche encore au lieu d'écrire.

---

## Ce qui manque, et sur quelle preuve

### Les sept avoirs

Montants et dates **tels que la feuille de suivi les donne** — ils n'ont pas été
lus dans les documents, puisque les documents sont introuvables. Leur
**existence**, elle, est confirmée par l'extrait de compte Paycenter, qui les
porte comme lignes.

| avoir | date | montant annoncé | facture annulée |
|---|---|---|---|
| 9060011986 | 21/01/2026 | −611,45 € | 9060006689 |
| 9060034033 | 17/02/2026 | −917,17 € | 9060017570 |
| 9060059451 | 20/03/2026 | −1 222,90 € | 9060048851 |
| 9060063384 | 26/03/2026 | −305,72 € | 9060051289 |
| 9060063944 | 26/03/2026 | −305,72 € | 9060051290 |
| 9060084611 | 22/04/2026 | −917,17 € | 9060083085 |
| 9060102694 | 19/05/2026 | −917,17 € | 9060102693 |

Total annoncé : **−5 197,30 €**.

Où ils ne sont pas, et qui l'a vérifié :

- **Paycenter** : leur lien « Réf. PDF » ouvre la facture 9050178334 du
  17/09/2025, pas l'avoir. Ce n'est pas un bug — l'avoir 9060040628 porte
  lui-même « No de facture orig. 9050178334 », donc le portail affiche la
  facture d'origine que l'avoir désigne.
- **eShop**, commandes de janvier à juin 2026 : absents.
- **Le Drive**, cherchés par titre **et par contenu** sur l'ensemble : absents.

### La facture que Straumann réclame sans la fournir

**9060125749, 100,74 €, 16/06/2026.**

C'est le cas le plus solide, et il faut le présenter ainsi : **Straumann l'exige
deux fois par écrit** —

- son **relevé de compte du 24/07/2026** la porte, échéance au 16/07
- sa **deuxième relance** la liste comme ligne impayée

— et elle est absente de ses propres systèmes : ni dans les créances Paycenter,
ni dans l'extrait de compte, ni dans aucune commande eShop. On ne peut pas payer
une facture qu'ils réclament et ne délivrent pas.

### L'avoir dont on ignore l'objet

**9060200897, −1 528,62 €, 08/10/2026** — hier. Affiché dans Paycenter, **sans
PDF**. C'est le plus gros avoir de l'exercice et aucune facture 2026 du registre
ne porte ce montant : il ne s'apparie pas comme les autres.

Piste écartée, pour mémoire : 1 528,62 € est aussi la valeur nette de l'avoir
9060040628. Ce n'est pas un lien — ces implants coûtent 254,77 € l'unité après
remise de 27 %, et 6 × 254,77 = 1 528,62. C'est une quantité.

---

## Pourquoi ces avoirs comptent, même s'ils ne coûtent rien

Chaque avoir annule une facture du même montant : **l'effet net est nul**. On
pourrait croire qu'ils ne servent à rien.

Ils servent à ceci : **une facture déposée sans son avoir fait croire à une
charge qui n'existe pas.** Les sept factures correspondantes, elles, existent et
sont déposables. Si on les dépose seules, on gonfle les charges 2026 de
**5 197,30 €** — et c'est TGS qui le découvrira, ou pas.

C'est la seule raison de les réclamer, et elle suffit.

---

## LE PROMPT

```
Tu es sur le portail Straumann, connecté au compte du cabinet
(numéro client 15123197, DOCTEUR TIGHZA FAKHREDDINE, 1 rue de Chambord 44650 Legé).

Neuf documents manquent. Avant d'en réclamer un seul, il reste une piste à
épuiser.

ETAPE 1 — LA PISTE DES COMMANDES « EXC », à faire en premier
L'avoir 9060040628, le seul qu'on possède, porte dans son en-tête :
  « No de commande EXC 2300813341 — Date de commande 26 févr. 26 »
Ces avoirs sont des ECHANGES : ils ont leur propre numéro de commande préfixé
EXC, différent des commandes mensuelles que tu as parcourues la dernière fois.

Cherche donc, dans l'eShop :
  - la commande EXC 2300813341, pour voir COMMENT un avoir d'échange y est
    présenté et où son PDF se trouve
  - puis, pour chacun des sept avoirs ci-dessous, la commande EXC correspondante
    (l'extrait de compte Paycenter affiche peut-être le numéro de commande en
    face de chaque ligne d'avoir — regarde)

  9060011986   21/01/2026
  9060034033   17/02/2026
  9060059451   20/03/2026
  9060063384   26/03/2026
  9060063944   26/03/2026
  9060084611   22/04/2026
  9060102694   19/05/2026

Dis-moi ce que tu trouves. Si les PDF sont là, télécharge-les et ARRETE-TOI :
il n'y a plus rien à réclamer, et on passe à autre chose.

ETAPE 2 — seulement si l'étape 1 ne donne rien
Trouve sur le portail le moyen de contacter le service documents ou le service
client : formulaire de contact, messagerie interne du compte, adresse e-mail
affichée. Dis-moi lequel existe et ce qu'il demande comme informations.

NE PAS CHERCHER UNE ADRESSE AILLEURS. Les factures ne portent qu'un téléphone
(01 64 17 30 08) et un fax. Je ne veux aucune adresse devinée ou trouvée sur un
annuaire : seulement un canal qui existe dans le compte.

ETAPE 3 — prépare la demande, NE L'ENVOIE PAS
Remplis le formulaire ou le brouillon avec le texte que je te donne ci-dessous,
tel quel. Puis ARRETE-TOI AVANT D'ENVOYER et montre-moi ce que ça donne.
C'est le docteur qui décide d'envoyer, pas toi et pas moi.

Si le formulaire impose un objet, une catégorie ou une limite de caractères,
dis-le-moi au lieu de couper le texte toi-même.

--- TEXTE A RECOPIER ---

Objet : demande de duplicata — avoirs et facture manquants, compte 15123197

Madame, Monsieur,

Notre comptable doit justifier chaque écriture de l'exercice 2026 et il nous
manque neuf documents de votre part, sur le compte 15123197 (Docteur Fakhreddine
Tighza, 1 rue de Chambord, 44650 Legé).

1. Sept avoirs, dont nous voyons les lignes dans l'extrait de compte Paycenter
mais dont le PDF n'est pas accessible : le lien « document » renvoie vers la
facture 9050178334 du 17 septembre 2025, qui est la facture d'origine de ces
échanges, et non vers l'avoir lui-même.

  9060011986 du 21/01/2026
  9060034033 du 17/02/2026
  9060059451 du 20/03/2026
  9060063384 du 26/03/2026
  9060063944 du 26/03/2026
  9060084611 du 22/04/2026
  9060102694 du 19/05/2026

Merci de nous transmettre ces sept avoirs en PDF. Ils annulent chacun une
facture que nous détenons, et sans eux notre comptabilité ferait apparaître des
charges qui n'existent pas.

2. La facture 9060125749 du 16/06/2026, 100,74 €.

Celle-ci nous est réclamée par vos services — elle figure sur votre relevé de
compte du 24 juillet 2026 avec une échéance au 16 juillet, et votre deuxième
relance la liste comme impayée — mais elle est introuvable dans votre portail :
ni dans les créances Paycenter, ni dans l'extrait de compte, ni dans aucune
commande de l'eShop. Merci de nous l'adresser, afin que nous puissions la
régler.

3. L'avoir 9060200897 du 08/10/2026, d'un montant de 1 528,62 €.

Il apparaît dans Paycenter sans document associé. Merci de nous l'adresser et de
nous préciser quelle facture il vient annuler.

Vous remerciant par avance,

Docteur Fakhreddine Tighza
SELARL TIGHZA — 1 rue de Chambord, 44650 Legé
contact@implantologielege.com

--- FIN DU TEXTE ---

CE QUE TU NE FAIS PAS
  - tu n'envoies rien sans son accord
  - tu n'écris depuis aucune autre adresse que contact@implantologielege.com
  - tu ne modifies aucun chiffre ni aucune date du texte
  - tu ne dis pas que les avoirs sont « introuvables chez vous » autrement que
    comme c'est écrit : on signale un fait, on n'accuse personne
```

---

## Ce qui se passe après

Si l'étape 1 trouve les PDF, les sept avoirs passent de MANQUANT à RECU et il
n'y a plus que deux documents à réclamer.

Si elle ne trouve rien, la demande part et je marque les neuf lignes comme
réclamées, avec la date — pour qu'une relance soit possible dans quinze jours
sans avoir à se rappeler quand on a écrit.

Dans les deux cas, les **sept factures correspondantes restent déposables dès
maintenant** — à condition de déposer chaque facture avec son avoir, ou aucune
des deux. Jamais la facture seule.

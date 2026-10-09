# Audit du Drive partagé compta — 09/10/2026

Question posée : le Drive est-il bien rangé, et tout ce qui a été déposé est-il bien
dans « 3 - DEPOSEES TGS » ?

Réponse courte : **le circuit est bien conçu, il n'est pas appliqué.** Sur 123 pièces
2026 réellement déposées au portail, **27** sont rangées dans l'étape 3.

J'ai lu le document « 0 - MODE D EMPLOI (a lire avant de deposer) » à la racine du drive
partagé avant de juger quoi que ce soit : c'est lui qui fait foi, et c'est à lui que je
compare tout ce qui suit.

---

## Le circuit prévu

| | dossier | rôle |
|---|---|---|
| Étape 1 | `Lisa - Lucie : factures à régler` | Lisa dépose tout ce qui arrive |
| Étape 2 | `Lucie - Lisa : factures réglées` | Lucie règle, renomme, dépose au portail |
| Étape 3 | `3 - DEPOSEES TGS` → année → mois | **uniquement** ce qui est réellement au portail |
| Étape 4 | `4 - A TRIER` | montant illisible, doublon suspect |

La phrase clé du mode d'emploi : « à tout moment, ce qui reste dans l'étape 2 est
exactement la liste de ce qu'il reste à déposer ». C'est cette garantie qui est cassée.

---

## Les six constats

### 1. L'arborescence année → mois de l'étape 3 est vide

Les douze dossiers mensuels de 2026 existent bien. **Janvier à octobre : zéro fichier.**
Le dossier 2025 ne contient qu'un seul fichier.

Les **75 fichiers** de l'étape 3 sont posés **à plat à la racine**, 2025 et 2026 mélangés.
La structure a été créée le 30/07/2026 et n'a jamais servi.

### 2. 75 pièces déposées sont rangées ailleurs

Sur les 123 pièces 2026 que le registre donne comme déposées au portail :

| | nombre | |
|---|---:|---|
| rangées dans l'étape 3 | 27 | correct |
| relevés bancaires restés sur le PC | 21 | **normal**, c'est ta règle |
| **déposées mais rangées ailleurs** | **75** | éparpillées sur 16 emplacements |

Les cinq plus gros tas : `A DEPOSER - abonnements 06-10-2026` (18), `Compta Cabinet
Tighza > 01 - Factures fournisseurs > 2026 > Abonnements & services` (14),
`Règlements Mai` (10), `Downloads (miroir du PC)` (9), `Brother` scans du 06/10 (5).

### 3. Treize pièces payées ET déposées sont encore dans « factures à régler »

C'est le constat le plus gênant, parce qu'il trompe Lucie : son dossier lui présente
comme restant à payer des pièces qui sont déjà payées **et** déjà chez TGS.

- `Règlements Mai` : 10
- `Règlements Mai : Factures de 03 a 2026` : 2
- racine de `factures à régler` : 1

Je n'y touche pas : tu m'as dit que ce dossier est géré par Lucie et que je n'en retire
rien. C'est la seule décision de cet audit qui t'appartient.

### 4. ~~Une pièce est descendue dans l'étape 3 sans être déposée~~ — **CONSTAT FAUX**

> **Corrigé le 09/10/2026 à 10h30. Ce constat était une erreur de ma part.**
>
> J'avais écrit que
> `2026-09-25_COFICA_FACTURE_1353.76_750004848906_P2026-10-05-au-2026-11-04.pdf`
> se trouvait dans l'étape 3 sans avoir été déposée, et qu'il fallait la remonter à
> l'étape 2. **Elle avait été déposée le 08/10/2026, statut « Dépôt OK », sous ce même
> nom de fichier.** Elle était donc exactement à sa place, et le circuit était respecté.
>
> **Cause :** mon export de l'historique du portail s'arrête au **06/10/2026**. Le dépôt
> du 08/10 lui est invisible. J'ai pris l'absence dans un fichier périmé pour une preuve
> de non-dépôt — alors que le mode d'emploi dit précisément que c'est l'historique des
> dépôts qui fait foi, ce qui suppose qu'il soit à jour.
>
> **Correction apportée à l'outil :** `coherence.py` affiche désormais à chaque
> lancement la date d'arrêt de l'historique qu'il a lu —
> `Historique arrete au JJ/MM/AAAA : un depot posterieur est INVISIBLE ici.` Aucune
> affirmation du type « pas encore déposée » ne vaut au-delà de cette date.
>
> C'est le contrôle anti-doublon du prompt de dépôt qui a rattrapé l'erreur : Chrome a
> cherché le numéro avant d'envoyer, l'a trouvé, et n'a pas redéposé. Sans cette étape A,
> la pièce partait une seconde fois et créait une double écriture.

### 5. Sept doublons probables, anciens noms conservés à côté des nouveaux

Sept paires ont **exactement la même taille en octets** — un ancien nom et son nom
normalisé coexistent dans l'étape 3. Le renommage semble avoir créé une copie au lieu
de renommer en place.

| ancien nom | nom normalisé | taille identique |
|---|---|---|
| `macsf attestation assurance local  (1).pdf` | `2026_MACSF_ATTESTATION_..._exemplaire-1.pdf` | 660 683 |
| `macsf attestation assurance local  (2).pdf` | `2026_MACSF_ATTESTATION_..._exemplaire-2.pdf` | 1 021 376 |
| `cofica 08-09 2025.pdf` | `2025_COFICA_..._aout-et-septembre-2025.pdf` | 823 063 |
| `cofica bail jin + juillet 2025.pdf` | `2025_COFICA_..._juin-et-juillet-2025.pdf` | 805 648 |
| `mutualease11-25.pdf` | `2025-11_MUTUALEASE_FACTURE_montant-a-lire.pdf` | 758 426 |
| `mutualease 12-2025.pdf` | `2025-12_MUTUALEASE_FACTURE_montant-a-lire.pdf` | 783 257 |
| `osseo shop 10-2025.pdf` | `2025-10_OSSEO-SHOP_FACTURE_montant-a-lire.pdf` | 964 602 |

**Une taille identique est un indice fort, pas une preuve.** Je ne les ai pas ouverts.
Avant de marquer quoi que ce soit `_DOUBLON` je les lis — c'est la règle qu'on s'est
donnée après l'épisode Straumann, où deux fichiers au même montant étaient deux
factures différentes.

Trois autres paires sont déjà correctement marquées `_DOUBLON` (Straumann 9060036699,
Cofica 750004747696, Mutualease 2025-06).

### 6. Vingt-cinq fichiers sur 75 ne sont pas normalisés du tout

Exemples : `BONGERT 13/03/2026` (trois fichiers portant la même date, aucun montant,
aucun numéro), `GACD Virement le 13/03/2026`, `MIL- 01/2026 V1 le 06/03/2026`,
`argoat 160euros virement du 13/10/2025`, `MADE IN LABS `, `Compta - suivi mensuel`,
`Septodont règlé chq le 13/03/20265` (coquille : 20265).

Sans montant ni référence, ils sont inexploitables pour un rapprochement automatique :
c'est exactement ce qui a coûté trois semaines au bilan 2025.

### Deux pièces absentes de mon registre

`2026_MACSF_ATTESTATION_assurance-du-local_exemplaire-1.pdf` et `_exemplaire-2.pdf`.
Elles sont dans l'étape 3 — donc censées être au portail — mais mon registre ne les
connaît pas. Je les ajoute après les avoir lues.

Pour mémoire, `4 - A TRIER` contient 6 fichiers, tous des doublons déjà identifiés et
annotés. Ce dossier-là est propre.

---

---

# CE QUI A ETE FAIT LE 09/10/2026

Décisions prises : A, B, C et D. Dossier de Lucie : on n'y touche pas.

## Fait — 38 fichiers renommés dans l'étape 3

Tous les fichiers de « 3 - DEPOSEES TGS » portent maintenant un nom au format
du mode d'emploi. Un seul reste en `montant-a-lire` : un scan GACD sans couche
texte, marqué `A-TRIER`.

## Bloqué — le déplacement m'est refusé

`update_file` avec un nouveau dossier parent répond
`The caller does not have permission`, **sur tous les fichiers du drive
partagé**, y compris une copie que je venais de créer moi-même. Le renommage
passe, le déplacement non. A et B ne peuvent donc pas être faits par moi :
ils sont dans `PROMPT_RANGER_DRIVE.md`, pour Claude in Chrome, qui agit avec
les droits du compte.

## Ce que C et D ont révélé

### Neuf pièces de l'exercice 2026 déposées chez TGS et absentes du registre

| date | fournisseur | montant | référence |
|---|---|---:|---|
| 15/01/2026 | BONGERT | 306,50 € | 24514532 |
| 31/01/2026 | BONGERT | 158,85 € | 24514784 |
| 31/01/2026 | MADE IN LABS | 3 390,29 € | 34755 |
| 28/02/2026 | MADE IN LABS | 3 893,50 € | 34968 |
| 16/02/2026 | NEOHM | 1 105,20 € | FR156786 |
| 19/01/2026 | GACD | 414,29 € | 2402261254 |
| 09/02/2026 | GACD | 131,53 € | 2402275693 |
| 05/01/2026 | COFICA | 1 353,76 € | 750004695244 |
| 01/01/2026 | MUTUALEASE | 182,30 € | 020-FL-31694851 |
| | **total** | **10 936,22 €** | |

### Neuf factures RECEPT AI, toutes manquantes

Budgie S.A.S. / rcpt.ai, le répondeur IA. Facturation mensuelle le 16.
Facture émise à la SELARL mais adressée à `ftighza@gmail.com`, ce qui l'a
tenue hors du circuit du drive partagé.

`B93C3B79-0271` 90,80 € · `0427` 100,25 € · `0626` 102,35 € · `0842` 105,85 € ·
`1116` 121,25 € · `1384` 156,60 € · `1635` 172,35 € · `1909` 152,05 € ·
`2195` 217,50 € — **1 219,00 €**.

La première, 90,80 €, est exactement le montant cité en exemple d'erreur n° 1
dans le mode d'emploi.

**Total trouvé ce matin : 12 155,22 € de charges 2026 absentes du registre.**
Le registre passe de 211 à 229 pièces, `coherence.py` ne sort aucune divergence.

### Pourquoi mon contrôle les avait manquées

Le contrôle 4 bis de `coherence.py` ne regardait que le **nom** du dépôt, et
n'acceptait que les noms commençant par une date 2026. Ces pièces avaient été
déposées sous leurs anciens noms : `BONGERT 13 03 2026.pdf`,
`MIL 01 2026 V1 le 06 03 2026.pdf`, `GACd virement le 06 03 2026.pdf`. Aucune
chance de les voir.

Corrigé : le contrôle accepte maintenant un second critère, la **date de dépôt**,
bornée à octobre-décembre 2026 pour ne pas remonter les centaines de pièces
2025 déposées en 2026. Les 21 pièces 2025 légitimement absentes d'un registre
2026 sont listées, avec leur motif et après lecture, dans
`hors_perimetre_portail.txt`. Le contrôle a été testé en retirant une ligne de
cette liste : il reparle, puis se taît quand on la remet.

### Trois erreurs de ma part, corrigées

1. **Les quatre « GACD PREUVE-DE-PAIEMENT 761.19 »** ne sont pas des preuves de
   paiement. Ce sont **quatre factures GACD différentes** (380,57 € / 56,98 € /
   126,11 € / une illisible), réglées par un seul virement de 761,19 €. Je les
   avais prises pour trois scans du même justificatif et nommées `1-sur-3`,
   `2-sur-3`, `3-sur-3`.

2. **Les deux MACSF « exemplaire-1 » et « exemplaire-2 »** ne sont pas deux
   copies : ce sont **deux documents distincts**, une attestation d'assurance du
   local et un échéancier de prélèvements, cotisation 331,74 € pour la période
   du 11/07/2025 au 10/07/2026.

3. **La taille d'octets identique ne suffit pas** à repérer un doublon. Le
   fichier `MADE IN LABS` est la facture 34968, la même que
   `MIL- 02/2026 V1` — mais **362 553 octets contre 364 499**. Mon critère de
   taille l'aurait laissée passer. C'est la lecture qui l'a trouvée.

### Deux dépôts en double à signaler à Mme DAHERON

- **Septodont 90005673** apparaît **trois fois** à l'historique du portail :
  `Facture 90005673.pdf`, `Facture 90005673 1 .pdf` et
  `90005673 SEPTODONT chq le 13 03 2026.pdf`. Risque de triple écriture.
- **Cofica `cofica 12 2025.pdf`** apparaît **trois fois**, dont une en
  « Dépôt OK » le 28/07/2026 et une « En cours » le 06/10/2026.

S'ajoute au NTJ 20240268 déjà repéré, déposé deux fois.

### Deux pistes ouvertes

- **COFICA, même période facturée deux fois.** La facture 750004695244 (émise
  le 24/12/2025) et la 750004820769 (émise le 29/07/2026) couvrent toutes deux
  la période **05/01/2026 au 04/02/2026**, 1 353,76 € chacune. L'une est
  probablement le duplicata de l'autre, mais les deux sont au portail.
- **NEOHM scindée en deux.** `FR156786` fait 1 105,20 €, et le portail contient
  `NEOHM facture 1sur 2 de 2210 4 regle le 11 12 2025`. Le mode d'emploi
  signale exactement ce piège. Il faut vérifier si FR156786 est une moitié et
  retrouver la seconde.

### Un piège du mode d'emploi confirmé deux fois

L'erreur n° 2 — « lire la date d'émission au lieu de la période couverte » — se
vérifie sur deux pièces trouvées ce matin : la Cofica 750004695244 émise le
24/12/2025 couvre janvier-février **2026**, et la Mutualease 020-FL-31694851
émise le 15/12/2025 couvre **le premier trimestre 2026**. Les deux sont des
charges de l'exercice 2026 bien qu'émises en 2025.

### Conséquence du renommage à retenir

Le mode d'emploi dit de renommer **au moment du dépôt, pas plus tard**. J'ai
renommé 38 fichiers déjà déposés : le lien entre le fichier du drive et son
entrée à l'historique du portail ne se fait donc plus par le nom. Pour chacune
des neuf pièces ajoutées au registre, la note cite **le nom exact sous lequel
elle a été déposée**, entre apostrophes simples — c'est la forme que
`coherence.py` sait rattacher. Sans cela le contrôle les aurait déclarées
« marquée déposée sans preuve », ce qu'il a d'ailleurs fait avant que je
complète les notes.

---

## Ce que je proposais (A, B, C, D validés ; E refusé)

Dans l'ordre, du plus sûr au plus discutable.

**A — ranger les 75 fichiers de l'étape 3 dans année → mois.** Aucune pièce ne change
de statut, rien ne sort du circuit, c'est du classement pur. Je le fais moi-même par
l'API Drive, sans copier/coller.

**B — remonter le Cofica 750004848906 dans l'étape 2** en attendant son dépôt (lot 2),
puis le redescendre quand le portail l'aura confirmé.

**C — lire les 7 paires suspectes**, et ne marquer `_DOUBLON` que celles dont le contenu
est réellement identique.

**D — renommer les 25 fichiers non normalisés** de l'étape 3. Ils sont hors du dossier
de Lucie, donc le renommage est autorisé. Ceux dont le montant est illisible partent
en `4 - A TRIER` plutôt que d'être devinés.

**E — les 13 pièces encore dans « factures à régler ».** Bloqué : c'est le dossier de
Lucie. Trois options, c'est ton appel.

1. je les copie dans l'étape 3 sous leur bon nom et je laisse ses originaux en place
   (ce que j'ai fait ce matin pour les 5 Bongert / Made in Labs) — son dossier reste
   trompeur mais rien ne bouge chez elle ;
2. je les déplace vers l'étape 3 : le circuit redevient fiable, mais 13 fichiers
   disparaissent de son dossier sans qu'elle soit prévenue ;
3. tu la prévitens, et je déplace après son accord.

**F — les 62 autres pièces déposées mais rangées hors du drive partagé** (abonnements,
Downloads, scans Brother, Compta Cabinet Tighza). Elles sont dans ton Drive personnel,
pas dans le circuit partagé. Les rapatrier dans l'étape 3 rendrait le dossier vraiment
exhaustif, mais ça vide des dossiers que tu utilises peut-être par ailleurs. À décider
séparément, après A à E.

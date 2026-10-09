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

### 4. Une pièce est descendue dans l'étape 3 sans être déposée

`2026-09-25_COFICA_FACTURE_1353.76_750004848906_P2026-10-05-au-2026-11-04.pdf`

Elle est dans l'étape 3 alors qu'elle n'est pas au portail — elle fait partie du lot 2
des dépôts en cours. Le mode d'emploi est explicite : « La pièce ne descend ici QUE
quand elle est réellement sur le portail. C'est toute l'astuce. » Une pièce qui descend
trop tôt casse la garantie pour toutes les autres : on ne peut plus se fier au dossier.

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

## Ce que je propose

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

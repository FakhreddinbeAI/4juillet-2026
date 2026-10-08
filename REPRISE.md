# EN PRIORITÉ ABSOLUE — LE MESSAGE POUR LUCIE N'EST PAS ENVOYÉ

**Demandé le jeudi 08/10/2026 au soir. À rappeler au Dr dès sa première
sollicitation, quel qu'en soit le sujet.**

Le message de consigne ROTEC pour Lucie est écrit mais **volontairement pas
envoyé** : c'était un soir, Lucie est salariée, ce n'était pas le moment.

Il est dans **`MESSAGE_LUCIE_ROTEC.md`**, à la racine. Le lui **redonner tel
quel** dans la réponse — pas seulement signaler qu'il existe.

L'essentiel : **ne plus rien régler à ROTEC** avant d'avoir le relevé de
compte client **C012667**, à demander à `comptabilite@rotec.fr` ou au
02 40 62 11 02. On a payé 5 673,51 € en quatre virements en 2026 mais on ne
retrouve des factures que pour 2 196,51 €, et aucun virement ne correspond à
un lot identifiable. Payer risque le double paiement, ne pas payer risque
l'impayé. Seule la 5124043 du 02/09 est sûrement encore due.

Un rappel automatique est aussi programmé pour le lundi 12/10/2026 à 8h30
(trigger `trig_01JznHdyM2WwwrexbsrvCxfV`). **Les deux existent exprès** :
si le Dr écrit avant lundi, ce fichier doit suffire.

Une fois le rappel fait, supprimer ce bloc.

---

# Reprise — mardi 7 octobre 2026

*Point d'entrée du dossier. À lire en premier, avant toute action.*

---

## Les trois commandes à lancer avant de parler

```bash
cd /home/user/4juillet-2026

# 1. Le dossier est-il cohérent ? Sortie vide = seul résultat acceptable.
python3 -I coherence.py registre_2026.csv lcl_2026.csv \
        historique_portail.txt historique_portail_statuts.txt

# 2. Où en est chaque pièce du circuit ?
python3 -I cycle_vie.py registre_2026.csv lcl_2026.csv \
        historique_portail.txt historique_portail_statuts.txt

# 3. Que reste-t-il à déposer, et où sont les fichiers ?
python3 -I liste_depot.py registre_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
```

**Si `coherence.py` sort quelque chose, on le règle avant tout le reste.**

---

## État au soir du 6 octobre, vérifié

| | pièces |
|---|---|
| Envoyé à TGS | **95** |
| Payé, en attente de dépôt | **1** |
| À payer — Lucie gère | 8 |
| À trier — paiement non prouvable | 39 |
| Hors périmètre | 10 |
| **Total au registre** | **153** |

**47 pièces déposées aujourd'hui** en huit lots : 5 Aries, 5 du lot 7,
5 tickets de carburant, 5 pièces diverses, 27 abonnements.

La seule pièce payée en attente est la **Mutualease `020-FL-32158803`** :
son emplacement affirme un dépôt le 28/07 que l'historique ne confirme pas.
C'est la dernière contradiction du dossier, laissée visible plutôt que
tranchée.

---

## Ce qu'il reste, par ordre de rentabilité

### 1. Les 13 espaces clients — 16 134 € de prélèvements sans facture

Le prompt est prêt (`prompt_renommage.md`, PROMPT 14 bis), avec **les débits
exacts à retrouver** chez chacun. Lixxbail en tête : **7 198 €**, contrat
`EM002148431`, et c'est un crédit-bail — TGS le réclamera forcément.

Il faut que le Dr soit connecté à chaque espace. Les quatre fournisseurs qui
facturent par mail sont faits : Doctolib, Ionos, Recept AI, MACSF.

### 2. Les 39 pièces « à trier »

Elles ne sont pas perdues : **je ne peux pas prouver leur paiement au relevé**,
soit parce que le libellé ne porte pas de référence, soit parce que le montant
est ambigu. Les débloquer veut dire lire les libellés de virement un par un.
C'est cette méthode qui a prouvé les 763,76 € dus à Septodont et démoli ma
fausse urgence DGFiP.

### 3. La carte Mastercard •••• 0422 — à qualifier en premier si on la traite

OpenAI et Entrepreneurs.com y sont payés. La carte LCL de la SELARL est la
•••• 2097. Aucun de ces débits n'est sur les relevés.

- **Carte personnelle** → ces dépenses ne sont pas des charges de la société.
- **Second compte professionnel** → **il manque un relevé bancaire entier**,
  et les contrôles de complétude ne couvrent pas tout.

La seconde hypothèse invaliderait une partie du rapprochement. C'est la seule
question ouverte qui pourrait défaire du travail déjà fait.

### 4. Pour Mme Daheron — des décisions, pas des pièces

**28 822 € de `VIR SEPA Tighza perso`** : compte courant d'associé ou
rémunération ? Puis le `CHQ IRREGUL` de 2 440,25 €, les 16 000 € virés à la
SELARL, Figard 8 005,93 €, Noilhetas 1 984,19 €, et l'écart SCM de 43 318 €
entre 76 997 € versés et 120 314,80 € appelés.

---

## Débriefing du 6 octobre — dix erreurs, trois causes

Je les écris parce que les reconnaître ne sert à rien si le mécanisme reste.

### Cause 1 — prendre un silence pour une preuve (6 fois)

Le registre ne mentionne pas une pièce → je l'annonce manquante. Le ticket ne
nomme pas de convives → je la dis non déductible. Je n'ai pas lu la suite d'un
libellé → j'affirme qu'un paiement n'existe pas.

Fausses alertes : les trois tableaux d'amortissement, la quote-part SCM de
120 315 €, le compte courant SCM de 9 787 €, l'attestation Madelin, la DGFiP
de 22 € « avec saisie possible » (payée depuis mars), l'amende de 75 € (payée
par saisie en février), trois abonnements résiliés dont je réclamais les
factures. **Plus de 174 000 € de pièces annoncées manquantes qui étaient là.**

**Ce qui l'attrape maintenant :** `coherence.py` compare le registre à
l'historique et au relevé. Règles 15, 20, 21, 24.

### Cause 2 — affirmer un contrôle que je n'avais pas fait (1 fois, grave)

J'ai écrit dans un prompt : « *pas de vérification, j'ai contrôlé, aucune
facture Doctolib, Ionos ou Recept AI n'a jamais été déposée* ». Faux. Les
douze Ionos de 2025 étaient au portail. **J'ai fait les deux fautes à la
fois : mentir sur un contrôle, et retirer le garde-fou qui l'aurait rattrapé.**

**Ce qui l'attrape :** la vérification reste dans tous les prompts de dépôt,
sans exception négociable. Règle 23.

### Cause 3 — deviner une structure au lieu de la lire (2 fois, dont une destructrice)

J'ai supposé que la case du Sheet était en colonne K et l'horodatage en L.
C'était « Point de vigilance » et « Ouvrir » : **j'ai écrasé cinq liens
Drive**, et le script annonçait « Cochees : 5 » en détruisant des données.

Et un `cat >>` sur un fichier sans retour à la ligne final a **soudé** deux
lignes de l'historique, avalant le nom d'une facture.

**Ce qui l'attrape :** tout script vérifie l'en-tête et s'arrête si elle ne
correspond pas ; `coherence.py` contrôle la terminaison des fichiers et
détecte les lignes collées. Règles 18, 24.

### Et trois fautes de méthode, sans cause commune

- **Durcir une consigne mal comprise.** « Si tu hésites, prends *Je ne sais
  pas où déposer* » était la règle, pas un recours. Dix pièces sont parties
  dans la mauvaise catégorie. Règle 19.
- **Confondre deux axes.** La colonne `etat` dit si j'ai le fichier ; elle ne
  dit pas où la pièce en est du circuit. D'où des lots de dépôt bâtis avec des
  factures impayées. Règle 20.
- **Me tromper de périmètre.** Trois pièces de décembre 2025 dans un registre
  2026, parce que les relevés commencent le 06/12/2025.

---

## Ce qui est acquis et ne doit pas être refait

- **Les dix relevés LCL** (046 à 055) sont extraits et prouvés complets par
  trois contrôles indépendants : 677 mouvements, 348 672,30 € de débits,
  346 276,65 € de crédits, zéro écart. Déposés au portail.
- **L'historique du portail** est indexé : 1 298 dépôts, interrogeable par
  numéro. C'est lui qui fait foi, jamais la comptabilité.
- **Le Google Sheet** porte 152 lignes, en accord avec le registre.
- **Les trois outils** : `coherence.py` (trouve mes erreurs),
  `cycle_vie.py` (où en est chaque pièce), `audit_portail.py` et
  `liste_depot.py` (quoi déposer et où est le fichier).

## Les fichiers, et à quoi ils servent

| Fichier | Rôle |
|---|---|
| `registre_2026.csv` | une ligne par pièce, 153 lignes, la source |
| `coherence.py` | **à lancer en premier** — trouve les divergences |
| `cycle_vie.py` | l'état de chaque pièce dans le circuit |
| `MANQUANT.md` | ce qui manque, classé par action |
| `A_VERIFIER_PLUS_TARD.md` | les contrôles qui demandent un accès que je n'ai pas |
| `prompt_renommage.md` | les 15 prompts Claude in Chrome |
| `LOTS_DEPOT.md` | les lots de dépôt et leurs liens vérifiés |
| `RAPPROCHEMENT_LCL.md` | le rapprochement banque, avec ses corrections |
| `.claude/skills/compta-tighza/SKILL.md` | les 13 règles, dont 12 écrites aujourd'hui |

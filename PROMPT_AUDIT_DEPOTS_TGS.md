# Prompt — exporter l'historique complet du portail TGS

*Écrit le 02/11/2026. Troisième version du même jour : les deux premières
partaient d'une prémisse fausse. Voir la note en fin de fichier.*

**Pourquoi ce prompt.** La question des abonnements est **réglée** : les 27
pièces 2026 du dossier `A DEPOSER - abonnements` sont au portail, déposées le
06/10/2026, vérifiées une par une sur leur nom de dépôt.

Ce qui reste, ce sont **47 pièces déclarées parties chez TGS et introuvables
dans nos deux historiques, pour 159 115,49 €** — dont **130 102,15 € sur deux
pièces SCM-LEGESMILE**. Nos deux fichiers d'historique totalisent 1 894 lignes
pour un portail qui en affiche environ 1 460 : il y a des doublons entre eux, et
on ne sait pas ce qui manque. Il faut un export propre, complet et **daté**.

---

## À COLLER DANS CHROME

Tu es sur le portail de dépôt de TGS France, connecté. **Tu ne déposes rien, tu
ne supprimes rien, tu ne renommes rien, tu ne changes aucune catégorie.** Tu lis
et tu recopies. C'est un inventaire.

### D'abord trois chiffres, dans un premier message

1. **Le compteur de dépôts**, s'il est affiché. Tel quel.
2. **Le nombre de pages** de la liste.
3. **La date du dépôt le plus récent** et celle **du plus ancien**.

Donne-moi ces trois chiffres avant de te lancer dans la recopie. Comme ça je
sais à quoi m'attendre, et toi aussi.

### Puis l'export

**L'historique complet des dépôts, avec pour chaque ligne trois informations :
le nom exact du document, son statut, et sa date.** C'est la date qui compte le
plus : sans elle l'export ne me sert à rien, et c'est exactement ce qui manque
dans celui que j'ai.

Une ligne par dépôt, un trait vertical entre les champs :

```
nom exact du document | statut | date
```

Recopie le nom **caractère pour caractère**, avec son extension. Ne le corrige
pas, ne le complète pas, ne l'abrège pas. Les noms de ce portail sont souvent
bizarres — `id 36409.pdf`, `mai2023 1 .pdf`, `RECEPT AI 25 .pdf` — et c'est
cette bizarrerie qui me permet de les reconnaître. Un nom « nettoyé » est un nom
perdu.

Si deux dépôts portent le même nom, écris les deux lignes. **Ne déduplique
pas** : savoir qu'une pièce a été déposée deux fois m'intéresse.

**Si le portail permet de trier par date**, commence par le plus récent et
remonte. Si tu ne peux pas aller jusqu'au bout, j'aurai au moins la partie
récente, qui est celle qui me manque.

### Les pièces que je cherche en particulier

Pendant que tu parcours la liste, signale-moi tout dépôt qui concerne :

- **SCM LEGESMILE** ou **LEGESMILE** — priorité absolue, deux pièces de gros
  montant
- **MADE IN LABS** ou **MIL**
- **BONGERT**
- **CANVA**
- **GACD**
- **NTJ**
- **COFICA**
- **STRAUMANN**
- **ONCD** (Ordre national des chirurgiens-dentistes)
- **EXECOM**, **OSSEO SHOP**, **MUTUALEASE**, **MACSF**, **ARGOAT**, **ORMCO**,
  **ZFX**, **SEPTODONT**

Pour chacun : combien de dépôts, et leurs noms exacts. **Je ne te dis pas
combien j'en attends** — je veux ton compte, pas la confirmation du mien.

Attention : certains dépôts ne portent **ni le nom du fournisseur ni un numéro
de facture**, seulement un montant (`Straumann 98 34.pdf`) ou un identifiant nu
(`id 36409.pdf`). Une recherche par nom de fournisseur les rate tous. C'est
pourquoi je te demande de **parcourir la liste** et pas seulement d'interroger
le moteur de recherche.

### Ce que je veux dans ton rapport

L'export, aussi complet que tu as pu le faire. Puis, séparément et clairement :

- **ce que tu as parcouru** — de quelle page à quelle page ;
- **ce que tu n'as pas pu parcourir**, et pourquoi ;
- **ce qui t'a surpris** : un statut que tu ne comprends pas, un dépôt qui
  semble en double, une catégorie vide, un nom illisible.

Et la consigne qui compte plus que les autres : **ne comble aucun trou.** Si une
date est absente, écris « date absente ». Si un nom est coupé à l'écran, dis-le.
Un export incomplet et honnête me sert. Un export complété de mémoire me coûtera
des mois — c'est déjà arrivé, aujourd'hui même, et c'était moi.

---

## Note pour moi, pas pour Chrome

**Deux versions de ce prompt étaient fausses, et il faut que ça reste écrit.**

La première annonçait : « l'historique contient zéro IONOS, zéro Recept-AI 2026,
donc TGS n'a probablement rien ». J'avais lancé deux tests, tous deux à 0 sur
29, et pris ces deux zéros pour une confirmation croisée. **Ils interrogeaient
le même fichier**, et ce fichier ne couvrait pas la période.

La seconde corrigeait la conclusion mais gardait le diagnostic : « le contrôle
est aveugle depuis le 06/10 ». Faux aussi. Le projet contient **deux**
historiques, et la preuve était dans celui que je n'avais jamais ouvert :

| fichier | lignes | datées | contenu |
|---|---:|---:|---|
| `historique_portail.txt` | 1 304 | 71 | vieil export, 1 233 lignes **sans date** |
| `historique_portail_statuts.txt` | 590 | 589 | **les 134 dépôts du 06/10/2026** |

Ce second fichier est passé en quatrième argument à `coherence.py` à chaque
exécution, depuis des semaines. Je ne l'avais jamais lu moi-même.

> **Quand un test revient vide, demander d'abord s'il regardait au bon endroit.**
> Un fichier qu'on passe à un script sans jamais l'ouvrir n'est pas une source,
> c'est un angle mort.

**Ce que j'ai changé en conséquence**, pour que ça ne se reproduise pas :

- les 27 notes citent désormais **le nom de dépôt exact** du portail, pas
  seulement un horodatage. Une preuve que `coherence.py` ne peut pas lire n'est
  pas une preuve, c'est une opinion bien datée ;
- le garde-fou de `coherence.py` ne dit plus « historique arrêté au 09/10 » — une
  date unique là où il y a deux sources. Il annonce maintenant combien de dépôts
  sont datés, combien ne le sont pas, et que **l'absence d'une pièce n'est pas
  une preuve de non-dépôt**.

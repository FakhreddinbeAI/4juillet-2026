# PLAN MENSUEL — suivre la compta TGS au fil de l'eau

*Établi le 08/10/2026. Objectif : que le Sheet ne redevienne jamais faux, et
que ça ne te coûte pas une après-midi de copier-coller.*

## CE QUE TU FAIS, UNE FOIS PAR MOIS

Trois gestes, pas plus.

1. **Tu télécharges le relevé LCL du mois** et tu me le donnes.
2. **Tu me dis ce que tu as reçu comme factures** — ou tu les déposes dans le
   dossier Drive habituel, je les y trouverai.
3. **Tu colles un bloc** dans le Sheet, et tu lances `remplirDatesPortail`.

Le reste est pour moi.

## CE QUE JE FAIS, DANS CET ORDRE

### 1. J'intègre le relevé
Je convertis le relevé en lignes de `lcl_2026.csv`. C'est la **source de
vérité du paiement** : une pièce ne passe à PAYÉ que si son débit est au
relevé. Cette règle ne bouge pas.

### 2. Je fais tourner les trois contrôles
```
python3 -I coherence.py registre_2026.csv lcl_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
python3 -I cycle_vie.py  registre_2026.csv lcl_2026.csv \
        historique_portail.txt historique_portail_statuts.txt
python3 -I audit_lcl.py  registre_2026.csv lcl_2026.csv
```
- `coherence.py` cherche **mes** erreurs : états qui se contredisent,
  références en double, dépôts du portail absents du registre.
- `cycle_vie.py` recalcule le cycle de chaque pièce d'après les preuves.
- `audit_lcl.py` va **du relevé vers le registre** : quel débit n'a pas de
  justificatif. C'est le contrôle qui a trouvé les 79 301 €.

### 3. Je te rends trois choses, et seulement trois
- **Le bloc à coller** dans le Sheet : les nouvelles pièces, en TSV, prêtes
  pour un `Ctrl+V` en bas du tableau.
- **La liste des factures à réclamer** ce mois-ci, avec le montant et la date
  du débit, pour que tu puisses les demander au fournisseur.
- **Les questions pour Mme Daheron**, s'il y en a.

### 4. Je rafraîchis l'historique du portail
**C'est l'étape qu'on a oubliée et qui a coûté le plus cher.** Mon historique
datait du 06/10 : tout dépôt postérieur m'était invisible, et j'ai affirmé
« 98 pièces déposées » quand tu en comptais 146. Un historique périmé rend
tout le reste faux sans prévenir.

Prompt pour Chrome, à relancer chaque mois :
```
Va sur https://monespaceclient.tgs-france.fr
Ouvre Mes depots de documents puis Historique des depots.
Plage la plus large possible, toutes categories.
Donne-moi la liste COMPLETE, une ligne par depot, au format :
   nom du fichier | statut | date de depot
Parcours toutes les pages jusqu'a la derniere et dis-moi combien tu en as
trouve au total.
```

## LES RÈGLES QUI NE CHANGENT PAS

**La chaîne.** À TRIER → À PAYER → PAYÉ → ENVOYÉ À TGS. On n'incrémente
jamais une étape sans preuve. Le seul passage à PAYÉ vient du relevé LCL.

**Le périmètre, c'est le compte pro.** Si c'est débité du compte de la
SELARL, c'est professionnel jusqu'à preuve du contraire. Si ce n'est pas
débité, ce n'est pas à nous de le porter.

**Jamais de montant recopié depuis un nom de fichier.** Le Canva annoncé à
12,00 € en valait 13,32. Le montant se lit dans le PDF.

**Un doublon se prouve en lisant les deux pièces.** Deux montants égaux ne
font pas un doublon. Et deux tailles de fichier différentes ne font pas deux
pièces : les deux Made in Labs de 360 094 et 361 635 octets portaient la même
facture 35195.

**« À régler », c'est Lucie.** J'y ajoute, je n'en retire rien et je ne
réarbitre pas.

**La catégorie de dépôt est toujours « Je ne sais pas où déposer ce
document ».** C'est TGS qui impute.

**Rien ne part de ftighza@gmail.com.** Les documents circulent vers le Drive
de contact@, aucun mail ne part de la boîte personnelle.

## CE QUI RESTE À FAIRE, PAR ORDRE D'ARGENT

| # | Sujet | Montant | Action |
|---|---|---|---|
| 1 | Straumann, 4 virements sans facture | 16 572 € | portail client, et trancher les deux comptes 15123197 / 15133626 |
| 2 | Made in labs | 8 216 € | relevé de compte fournisseur |
| 3 | Lixxbail, contrat EM002148431 | 7 198 € | portail client |
| 4 | ROTEC 2026 | 6 487 € | le dossier n'est pas clos, contrairement à ce que je croyais |
| 5 | Aries, 6 prélèvements | 6 108 € | janvier 2026 manque encore |
| 6 | GACD | 4 953 € | portail client |
| 7 | NTJ | 2 981 € | labo |
| 8 | Ormco 2 805 € du 21/01 | 2 805 € | un seul virement, factures à retrouver |
| 9 | Les 4 chèques non identifiés | 2 320 € | demander les images à la banque |
| 10 | CHQ IRREGUL 2491605 | 2 440 € | question pour Mme Daheron |

## LE CALENDRIER

- **Vers le 10 de chaque mois**, quand le relevé LCL du mois précédent est
  disponible : tu me le donnes, je fais tourner les contrôles.
- **Avant le 31/12/2026** : clôture. Tout ce qui reste à obtenir doit être
  réclamé en novembre au plus tard, parce qu'un fournisseur met trois
  semaines à répondre.
- **Janvier 2027** : l'attestation MACSF Madelin 2026 devient disponible.
  Elle ne peut pas exister avant.

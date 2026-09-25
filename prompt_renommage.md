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

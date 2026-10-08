# PROMPT CLAUDE IN CHROME — ROTEC, demande ciblée (08/10/2026)

## CE QU'IL NE FAUT SURTOUT PAS DEMANDER

Le prompt initial devait réclamer les factures ROTEC manquantes :
`audit_lcl.py` montrait **6 487 € de virements ROTEC sans justificatif**.

J'ai cherché avant d'écrire. **Quinze factures ROTEC de 2026 étaient déjà
dans le Drive**, et sept d'entre elles déjà déposées chez TGS. Mon registre
n'en connaissait que quatre.

Réclamer aurait été une faute double : demander à un fournisseur des pièces
qu'on possède, et croire le trou comblé alors qu'il ne l'était pas au bon
endroit — il était dans mon registre, pas chez ROTEC.

## CE QUI MANQUE VRAIMENT

Une seule période, et elle se déduit du relevé bancaire :

| Pièce | Date | Source |
|---|---|---|
| Facture 5121155 | 26/06/2026 | dans le Drive |
| **rien** | **27/06 → 01/09** | **le trou** |
| Facture 5124043 | 02/09/2026 | dans le Drive |

Le virement du **18/09, 275,50 €**, porte le libellé *« Tighza 26/06 jusqu au
01/09 »*. Il règle donc cette période. La 5121155 fait 107,50 € : il reste
**168,00 € de factures** émises entre le 27/06 et le 01/09 qu'on n'a pas.

## LE PROMPT

```
Ouvre ce PDF, c'est une facture ROTEC :
https://drive.google.com/file/d/1HbPxkT-DffKIMx_gBx6Ddt_SHtTz1RzX/view

ETAPE 1 - releve sur la facture, et dis-le-moi :
  - le NUMERO DE COMPTE CLIENT du cabinet
  - l'adresse e-mail de ROTEC (comptabilite, service client ou contact)
  - l'adresse postale et le telephone
  - s'il est fait mention d'un espace client en ligne, son adresse

ETAPE 2 - prepare un BROUILLON d'e-mail dans Gmail, depuis
contact@implantologielege.com. NE L'ENVOIE PAS. Laisse-le en brouillon,
je le relirai.

Objet : SELARL TIGHZA - demande de releve de compte 2026 et de copies de
factures

Corps :

  Madame, Monsieur,

  Dans le cadre de la preparation de notre bilan 2026, nous avons besoin de
  deux elements.

  1. Le releve de notre compte client pour l'exercice 2026, du 1er janvier
     au 30 septembre 2026, faisant apparaitre l'ensemble des factures et des
     reglements.

  2. La copie des factures emises entre le 27 juin et le 1er septembre 2026.
     Nous disposons de la facture 5121155 du 26/06/2026 et de la 5124043 du
     02/09/2026, mais d'aucune entre les deux, alors que notre virement du
     18 septembre 2026 couvre cette periode.

  Nos coordonnees : SELARL TIGHZA, 1 rue de Chambord, 44650 Lege.
  Numero de compte client : [METS ICI LE NUMERO RELEVE A L'ETAPE 1]

  Avec nos remerciements,

  SELARL TIGHZA

ETAPE 3 - dis-moi que le brouillon est pret, et recopie-moi l'adresse
destinataire que tu as mise.

N'ENVOIE RIEN. Ne touche a aucun autre message.
```

## POURQUOI DEMANDER LE RELEVÉ DE COMPTE ET PAS SEULEMENT LES FACTURES

Parce qu'un relevé de compte **tranche tout d'un coup** : il dit ce qui a été
facturé, ce qui a été réglé, et ce qui reste dû. Si une seizième facture 2026
existe que ni le Drive ni le portail ne connaissent, elle y apparaîtra. C'est
ce qui a permis de reconstituer Septodont (763,76 € dus) et Made in Labs.

Demander une liste de numéros qu'on croit manquants, c'est demander au
fournisseur de confirmer notre propre inventaire. Demander le relevé, c'est
lui demander le sien.

## LA RÈGLE QUI SORT DE LÀ

**On ne réclame jamais sans avoir cherché d'abord.** C'est la même faute que
le 06/10, quand j'avais écrit dans un prompt de dépôt « j'ai contrôlé, aucune
facture n'a été déposée » sans l'avoir fait — et que les douze IONOS 2025 y
étaient. Même erreur, autre porte.

Avant toute réclamation à un fournisseur, le balayage du Drive et de
l'historique du portail est obligatoire.

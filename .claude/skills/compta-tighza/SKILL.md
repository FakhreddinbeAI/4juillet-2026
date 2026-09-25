---
name: compta-tighza
description: >
  Comptabilité de la SELARL TIGHZA (cabinet dentaire, Legé 44650) avec le
  cabinet TGS France : récupération des factures, tri, nommage, dépôt sur le
  portail, registre annuel et réponse aux demandes du comptable. À déclencher
  dès que l'utilisateur mentionne TGS, bilan, factures, justificatifs,
  pièces manquantes, relevés, dépôt sur le portail, classement Drive, ou
  nomme un fournisseur du cabinet (COFICA, Straumann, Mutualease, Médiforce,
  Argoat, Aries, Made in Labs, Septodont...).
---

# Comptabilité SELARL TIGHZA ⇄ TGS France

## Le dossier

| | |
|---|---|
| Société | SELARL TIGHZA — 1 rue de Chambord, 44650 Legé |
| RCS | Nantes 911 470 177 |
| Exercice | année civile, clos au 31/12 |
| Comptable | Florence DAHERON — Florence.DAHERON@tgs-france.fr |
| Gestionnaire | Aurélie GUILLOTEAU — Aurelie.GUILLOTEAU@tgs-france.fr — 02 28 00 23 96 |
| Juridique | TGS France Avocats — M<sup>e</sup> Mélanie ROUGER (dépôts INPI) |
| RH / paie | In Extenso — Chloé Chambellan |
| Portail | https://monespaceclient.tgs-france.fr |
| Banque | **LCL**, relevés du 6 d'un mois au 5 du suivant |
| Équipe | Lisa et Lucie, assistantes (assistante@implantologielege.com) |

Attention : les mails de TGS partent parfois de l'adresse de Florence Daheron
mais sont **signés Aurélie Guilloteau**. Lire la signature avant de répondre.

## Les dix règles

**1. « Dépôt OK » ne veut pas dire traité.** Sur le portail, `Dépôt OK` et
`En cours de traitement` signifient *reçu, pas encore intégré*. L'absence en
comptabilité ne prouve pas l'absence de dépôt. **L'historique des dépôts fait
foi.**

**2. Le montant exact est la seule clé.** Même fournisseur + montant différent
= ce n'est pas la pièce. `RECEPT AI 25.pdf` (25 €) ne couvre pas 90,80 €.

**3. Lire la PÉRIODE, jamais la date d'émission.** Une facture de mars 2026
peut couvrir avril→juin 2026. Trois pièces déposées pour le bilan 2025
étaient hors exercice pour cette raison.

**4. Exiger le n° de pièce sur les avoirs.** Un avoir Straumann a été déclaré
couvert parce que quinze autres fichiers portaient le même montant.

**5. Les tickets ne survivent pas six mois.** Cinq perdus sur 2025, 263,15 €.
Un ticket se photographie le jour même.

**6. Le contrat n'est pas chez le financeur.** Le crédit-bail « CMV Médiforce
A1S88001 » est en réalité un bon de commande **Henry Schein** de décembre 2024.
Chercher chez le vendeur du matériel, pas chez l'organisme de financement.

**7. Vérifier avant de déposer.** Bredent déposé 3×, Anthropic d'août 2×.

**8. Une facture peut être scindée.** NEOHM : 2 210,40 € en deux moitiés.

**9. Certaines demandes ne sont pas des pièces.** TGS pose aussi des questions ;
elles se répondent par écrit.

**10. Ne jamais conclure depuis un nom de fichier.** Ouvrir le PDF.

## La convention de nommage

```
AAAA-MM-JJ_FOURNISSEUR_TYPE_MONTANT_REFERENCE[_Pdébut-au-fin][_DUPLICATA].pdf
```

Types : `FACTURE` `AVOIR` `TICKET` `CONTRAT` `RELEVE` `ATTESTATION` `RELANCE`
`INDU` `AFFILIATION` `AR` `RECU`. Montant TTC, point décimal, sans symbole ;
omis quand la pièce n'en porte pas.

## Le circuit

```
Drive partagé                           Mon Drive
  Lisa - Lucie : factures à régler         FACTURATION  ← automatisation Gmail
  Lucie - Lisa : factures réglées          Comptabilité Cabinet Tighza
  3 - DEPOSEES TGS > année > mois            00 TGS · 01 Fournisseurs · 02 Recettes
  4 - A TRIER                                03 Relevés · 04 Contrats
  0 - MODE D EMPLOI                          05 Fiscal & Social · 06 Juridique
  0 - PROMPT RENOMMAGE                       07 RH & Paie · 08 Bilan 2026
```

Une pièce ne descend dans `3 - DEPOSEES TGS` **que** lorsqu'elle est
réellement sur le portail. Ce qui reste en amont est la liste de ce qu'il
reste à faire.

## Les outils

`compta2026.py` lit `registre_2026.csv` et signale les trous sur les
récurrents, les doublons et les noms non conformes. `--export` produit un CSV
pour Google Sheets. Les prompts Claude in Chrome sont dans
`prompt_renommage.md` — **lots de 5 fichiers, une tâche à la fois, texte plat**.

## Les récurrents

| Fournisseur | Rythme | Montant | Piège |
|---|---|---|---|
| COFICA BAIL (980 750 019 180 56) | mensuel | 1 353,76 € | la facture de décembre couvre janvier |
| Mutualease / CM-CIC (FT0801600) | trimestriel | 182,30 € | matériel informatique, ≠ Médiforce |
| CMV Médiforce (A1S88001) | mensuel | 80,00 € | contrat = Henry Schein 12/2024, 36 mois |
| Aries / Entrepreneurs.com | mensuel | 990,00 € | débité 1 019,70 € : +3 % commission de change LCL, à imputer en frais bancaires |
| Google Workspace | mensuel | 91,08 € | facture émise le dernier jour du mois, envoyée le 1er du suivant |
| Anthropic | mensuel | 108,00 € | depuis février 2026 ; tarif antérieur différent |
| Canva | mensuel | 12,00 € | factures sur la boîte **personnelle** du Dr |
| Argoat, Made in Labs, Straumann, GACD, Rotec, Bredent, Osseo Shop | variable | — | labos, noms de fichiers illisibles |

## Le rythme

Chaque vendredi vider `FACTURATION` (renommer, déposer, ranger) · le 5 du mois
tableau de suivi + relevé LCL + tickets · chaque trimestre `compta2026.py` et
tour des espaces clients · janvier clôture · printemps-été la demande TGS.

## Règles de conduite

- Ouvrir le PDF, ne jamais déduire d'un nom de fichier.
- Confronter plutôt que rassurer : si un chiffre ne tombe pas juste, le dire.
- La parole du Dr prime sur toute déduction automatique.
- Vérifier ses propres totaux avant de les livrer.
- Ne pas s'engager sur une date dans un mail à TGS sans l'avoir demandé.
- **Le Drive fait foi, pas le conteneur** : il a été effacé deux fois, et le
  push GitHub est refusé (app Claude non installée sur le dépôt).

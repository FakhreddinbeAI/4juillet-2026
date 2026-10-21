# Cockpit Devis — textes des relances J7 / J15 / J30

Version 2 du 21/10/2026, **à relire et valider par le Dr avant tout envoi réel**.
J0 (envoi du devis + explications + documents) est déjà codé dans le Cockpit (`ecran_courrier_`).

**Principe (Dr, 21/10/2026)** : chaque relance a un seul but, **faire signer le devis**. Elle commence par
« Avez-vous pensé à signer votre devis ? » et **redonne toutes les informations** : le patient n'a rien à
chercher (devis et documents rejoints, montants, comment signer et renvoyer).

## Bloc commun « Votre devis en un coup d'œil » (inséré dans les 3 relances)

```
VOTRE DEVIS EN UN COUP D'ŒIL
• Devis n° [N° DEVIS] du [DATE DEVIS] — [TRAITEMENT]
• Montant total : [MONTANT]
• Remboursement Assurance Maladie : [REMB. AMO]
• Reste à charge avant mutuelle : [RESTE À CHARGE]
• Valable jusqu'au : [DATE DE VALIDITÉ]

POUR SIGNER (2 minutes)
1. Imprimez le devis joint (ou demandez-nous un exemplaire papier).
2. Datez, signez, et écrivez « Bon pour accord ».
3. Renvoyez-le en réponse à ce message (une photo lisible suffit),
   ou déposez-le au cabinet.

Les pièces jointes : votre devis[, le questionnaire médical][ et le consentement].
```

Pièces jointes de chaque relance : **le devis + les documents J0 encore manquants** (mêmes fichiers qu'à J0).

Champs remplis par le script, lus dans la base du Cockpit : `[N° DEVIS]` (ID dossier), `[DATE DEVIS]`,
`[TRAITEMENT]` (Description), `[MONTANT]`, `[REMB. AMO]`, `[RESTE À CHARGE]` (Reste à charge avant
mutuelle, ou Reste à charge total si la mutuelle a répondu), `[DATE DE VALIDITÉ]` (Validité).
`[Bonjour…]` = « Bonjour [Prénom], » seulement si le prénom vient du devis Logos ET que l'adresse est celle
du patient ; sinon « Bonjour, ».

Règles d'envoi (modèle v2 du 31/08/2026) : une relance par patient même s'il a plusieurs devis ; arrêt si
signé, refusé, si le patient a répondu ou a un message en attente ; adresses dédoublonnées, pas d'envoi
sans adresse ; 8 h–20 h, jamais le dimanche ; chaque envoi noté au journal et dans « Relance 1/2/3 ».

---

## J7 — Rappel de signature + questions

**Objet :** Avez-vous pensé à signer votre devis n° [N° DEVIS] ?

```
[Bonjour…]

Avez-vous pensé à signer votre devis ? Nous vous le renvoyons ci-joint, avec tous
les éléments, pour que vous n'ayez rien à rechercher.

[BLOC COMMUN]

Si un point vous retient avant de signer — le déroulement des séances, le
calendrier, le coût — répondez simplement à ce message ou appelez-nous au
02 40 26 36 00 : nous prendrons le temps de vous expliquer.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

---

## J15 — Rappel de signature + mutuelle et papiers

**Objet :** Votre devis n° [N° DEVIS] — signature et mutuelle

```
[Bonjour…]

Nous n'avons pas encore reçu votre devis signé. Peut-être attendez-vous la réponse
de votre mutuelle ? Voici de quoi tout finaliser, sans rien rechercher.

[BLOC COMMUN]

VOTRE MUTUELLE
• Vous avez sa réponse ? Envoyez-nous-la avec le devis signé : nous calculerons
  votre reste à charge définitif.
• Vous ne l'avez pas encore sollicitée ? Nous pouvons faire la demande pour vous :
  il nous suffit d'une photo de votre carte de mutuelle.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

---

## J30 — Dernier rappel : signer, attendre ou s'appeler

**Objet :** Votre devis n° [N° DEVIS] — dernier rappel avant mise en attente

```
[Bonjour…]

Votre devis n° [N° DEVIS] n'est pas encore signé. Nous vous le renvoyons une
dernière fois, avec tous les éléments.

[BLOC COMMUN]

Si vous n'êtes pas prêt à signer, répondez simplement par un mot :
• « ATTENTE » : nous mettons votre dossier en attente, sans autre relance ;
• « APPEL » : vous préférez en parler de vive voix, nous vous appelons.

Si le projet n'est plus d'actualité, c'est parfaitement entendu : vous n'avez rien
à nous répondre. Passé le [DATE DE VALIDITÉ], un nouveau bilan sera nécessaire,
car votre situation dentaire aura pu évoluer.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00
```

**Après J30 : plus aucun envoi automatique.**
- Devis signé reçu → bouton « Devis signé reçu » → le dossier part chez Lisa.
- « ATTENTE » → statut « En attente », plus de relance.
- « APPEL » → tâche « Appeler le patient » dans le Cockpit (et le brief du matin).
- Pas de réponse → le dossier reste visible dans « À décider » ; l'équipe tranche.

---

## Versions WhatsApp (envoi manuel par l'équipe, bouton dans le Cockpit)

- **J7** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Avez-vous pensé à signer votre devis n° [N° DEVIS] ? Nous vous l'avons renvoyé par mail avec toutes les infos. Une question ? Nous sommes là. »
- **J15** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Votre devis n° [N° DEVIS] n'est pas encore signé : attendez-vous votre mutuelle ? Nous pouvons faire la demande pour vous avec une photo de votre carte. »
- **J30** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Dernier rappel pour votre devis n° [N° DEVIS] : vous signez, on met en attente, ou vous préférez qu'on vous appelle ? »

---

## À valider par le Dr

1. Signature : « L'équipe du Cabinet d'Implantologie de Legé ».
2. Chaque relance renvoie **le devis + les documents J0 manquants** en pièces jointes.
3. J15 : proposer de faire la demande de prise en charge à la place du patient.
4. J30 : mots-réponses ATTENTE / APPEL (le script les reconnaît dans les réponses).
5. Délais comptés depuis la **date d'envoi du devis** (J0).

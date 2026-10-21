# Cockpit Devis — textes des relances J7 / J15 / J30

Version 3 du 21/10/2026 (mixte des versions 1 et 2), **à relire et valider par le Dr avant tout envoi réel**.
J0 (envoi du devis + explications + documents) est déjà codé dans le Cockpit (`ecran_courrier_`).

**Principe** : chaque relance rappelle de **signer le devis** et **redonne toutes les informations** (devis
rejoint, montants, comment signer) pour que le patient n'ait rien à chercher — version 2. Chaque étape garde
son angle propre — version 1 : J7 les questions, J15 la mutuelle et les papiers, J30 la décision
(continuer / attendre / s'appeler), sans pression.

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

Pièces jointes : votre devis[, le questionnaire médical][ et le consentement].
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

## J7 — Tout est clair ? Pensez à signer

**Objet :** Votre devis n° [N° DEVIS] — avez-vous des questions ?

```
[Bonjour…]

Il y a une semaine, nous vous avons adressé votre devis n° [N° DEVIS] ainsi que les
explications sur le traitement proposé par le Dr Tighza.

Nous voulions nous assurer que tout est clair pour vous. Si un point mérite d'être
repris — le déroulement des séances, le calendrier, le coût ou les remboursements —
répondez simplement à ce message ou appelez-nous : nous prendrons le temps de vous
l'expliquer.

Et si tout vous convient, avez-vous pensé à signer votre devis ? Nous vous le
renvoyons ci-joint, avec l'essentiel, pour que vous n'ayez rien à rechercher.

[BLOC COMMUN]

Rien ne presse : votre devis reste valable jusqu'au [DATE DE VALIDITÉ].

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

**Pourquoi.** On ouvre par les questions (trois portes concrètes), puis on rappelle la signature avec tout
sous la main. « Rien ne presse » retire la pression à une semaine.

---

## J15 — Signature, mutuelle et papiers

**Objet :** Votre devis n° [N° DEVIS] — signature, mutuelle et documents

```
[Bonjour…]

Nous n'avons pas encore reçu votre devis signé. C'est souvent la mutuelle ou un
document qui retarde les choses : voici de quoi tout finaliser, sans rien
rechercher.

[BLOC COMMUN]

VOTRE MUTUELLE
• Vous avez sa réponse de prise en charge ? Envoyez-la-nous avec le devis signé :
  nous calculerons votre reste à charge définitif.
• Vous ne l'avez pas encore sollicitée ? Nous pouvons faire la demande pour vous :
  il nous suffit d'une photo lisible de votre carte de mutuelle.

VOS DOCUMENTS
Avec le devis signé, merci de nous retourner le questionnaire médical et le
consentement joints, complétés et signés. Le questionnaire est confidentiel et
réservé à votre praticien.

Vous pouvez tout nous envoyer en réponse à ce message (photo ou scan), ou le
déposer au cabinet.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

**Pourquoi.** À deux semaines, ce qui bloque est rarement la décision : c'est la mutuelle ou un papier.
Proposer de faire la demande de prise en charge à la place du patient lève le frein le plus fréquent (et
alimente le Copilot portails).

---

## J30 — Signer, attendre ou s'appeler

**Objet :** Votre devis n° [N° DEVIS] — comment souhaitez-vous poursuivre ?

```
[Bonjour…]

Votre devis n° [N° DEVIS] du [DATE DEVIS] n'est pas encore signé, et nous voulions
savoir comment vous souhaitez poursuivre. Nous vous le renvoyons une dernière fois,
avec tous les éléments.

[BLOC COMMUN]

Vous pouvez aussi nous répondre par un seul mot :
• « CONTINUER » : vous souhaitez lancer le traitement, nous vous recontactons pour
  organiser la suite ;
• « ATTENTE » : vous préférez mettre votre dossier en attente pour le moment, nous
  ne vous relancerons plus ;
• « APPEL » : vous aimeriez en parler de vive voix, nous vous appelons.

Si le projet n'est plus d'actualité, c'est parfaitement entendu : vous n'avez rien
à nous répondre.

À savoir : passé le [DATE DE VALIDITÉ], un nouveau bilan sera nécessaire, car votre
situation dentaire aura pu évoluer.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00
```

**Pourquoi.** Le devis signé reste la voie la plus simple (tout est joint) ; les trois mots-réponses
rendent la décision facile pour ceux qui hésitent. « Vous n'avez rien à répondre » autorise le silence, ce
qui fait paradoxalement répondre les indécis. L'échéance est une raison clinique, pas administrative.

**Après J30 : plus aucun envoi automatique.**
- Devis signé reçu → bouton « Devis signé reçu » → le dossier part chez Lisa.
- « CONTINUER » → action « Appeler pour organiser le traitement » pour l'équipe.
- « ATTENTE » → statut « En attente », plus de relance.
- « APPEL » → tâche « Appeler le patient » dans le Cockpit (et le brief du matin).
- Pas de réponse → le dossier reste visible dans « À décider » ; l'équipe tranche.

---

## Versions WhatsApp (envoi manuel par l'équipe, bouton dans le Cockpit)

- **J7** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Tout est clair sur votre devis n° [N° DEVIS] ? Si une question vous retient, nous sommes là. Et si tout vous convient, pensez à le signer : nous vous l'avons renvoyé par mail avec toutes les infos. »
- **J15** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Votre devis n° [N° DEVIS] n'est pas encore signé : attendez-vous votre mutuelle ? Nous pouvons faire la demande pour vous avec une photo de votre carte. »
- **J30** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Pour votre devis n° [N° DEVIS] : on lance le traitement, on met en attente, ou vous préférez qu'on vous appelle ? »

---

## À valider par le Dr

1. Signature : « L'équipe du Cabinet d'Implantologie de Legé ».
2. Chaque relance renvoie **le devis + les documents J0 manquants** en pièces jointes.
3. J15 : proposer de faire la demande de prise en charge à la place du patient.
4. J30 : mots-réponses CONTINUER / ATTENTE / APPEL (le script les reconnaît dans les réponses).
5. Délais comptés depuis la **date d'envoi du devis** (J0).

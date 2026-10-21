# Cockpit Devis — textes des relances J7 / J15 / J30

Version 1 du 21/10/2026, **à relire et valider par le Dr avant tout envoi réel**.
J0 (envoi du devis + explications + documents) est déjà codé dans le Cockpit (`ecran_courrier_`).

Champs remplis par le script :
- `[Bonjour…]` : « Bonjour [Prénom], » seulement si le prénom vient du devis Logos ET que l'adresse est celle du patient ; sinon « Bonjour, »
- `[N° DEVIS]`, `[DATE DEVIS]`, `[DATE DE VALIDITÉ]` : lus dans la base du Cockpit (colonnes « ID dossier », « Date devis », « Validité »)

Règles d'envoi (reprises du modèle v2 du 31/08/2026) :
- une seule relance par patient, même s'il a plusieurs devis ;
- pas de relance si le devis est signé, refusé, si le patient a répondu, ou si un message de sa part attend une réponse ;
- adresses dédoublonnées avant envoi ; pas d'envoi si l'adresse est absente ;
- envoi entre 8 h et 20 h, jamais le dimanche ;
- chaque envoi est noté dans le journal du dossier et dans « Relance 1 / Relance 2 / Relance 3 ».

---

## J7 — « Tout est clair ? »

**Objet :** Votre devis n° [N° DEVIS] — avez-vous des questions ?

```
[Bonjour…]

Il y a une semaine, nous vous avons adressé votre devis n° [N° DEVIS] ainsi que les
explications sur le traitement proposé par le Dr Tighza.

Nous voulions simplement nous assurer que tout est clair pour vous. Si un point
mérite d'être repris — le déroulement des séances, le calendrier, le coût ou les
remboursements — il suffit de répondre à ce message ou de nous appeler : nous
prendrons le temps de vous l'expliquer.

Rien ne presse : votre devis reste valable jusqu'au [DATE DE VALIDITÉ].

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

**Pourquoi ce texte.** Une question ouverte avec trois portes concrètes (séances, calendrier, coût) donne une vraie raison de répondre, sans pression : « rien ne presse ».

---

## J15 — Mutuelle et papiers

**Objet :** Votre devis n° [N° DEVIS] — mutuelle et documents

```
[Bonjour…]

Nous revenons vers vous au sujet de votre devis n° [N° DEVIS], pour vous aider sur
les démarches administratives :

• Votre mutuelle : avez-vous reçu sa réponse de prise en charge ? Si vous ne l'avez
  pas encore sollicitée, nous pouvons faire la demande pour vous : il nous suffit de
  votre carte de mutuelle (une photo lisible convient).

• Vos documents : si ce n'est pas encore fait, merci de nous retourner le devis signé
  avec la mention « Bon pour accord », ainsi que les documents joints à notre premier
  message (questionnaire médical et consentement), complétés et signés.

Vous pouvez tout nous envoyer en réponse à ce message (photo ou scan), ou les
apporter au cabinet.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00

Pour ne plus recevoir ce type de message, répondez « STOP ».
```

**Pourquoi ce texte.** C'est souvent la mutuelle ou un papier manquant qui bloque, pas la décision. Proposer de faire la demande de prise en charge à la place du patient lève le frein le plus fréquent (et alimente le Copilot portails).

---

## J30 — Continuer, attendre ou s'appeler

**Objet :** Votre devis n° [N° DEVIS] — comment souhaitez-vous poursuivre ?

```
[Bonjour…]

Votre devis n° [N° DEVIS] du [DATE DEVIS] est toujours à votre disposition, et nous
voulions savoir comment vous souhaitez poursuivre. Il vous suffit de répondre par
un seul mot :

• « CONTINUER » : vous souhaitez lancer le traitement, nous vous recontactons pour
  organiser la suite ;
• « ATTENTE » : vous préférez mettre votre dossier en attente pour le moment, nous
  ne vous relancerons plus ;
• « APPEL » : vous aimeriez en parler de vive voix, nous vous appelons.

Si le projet n'est plus d'actualité, c'est parfaitement entendu : vous n'avez rien
à nous répondre.

À savoir : votre devis reste valable jusqu'au [DATE DE VALIDITÉ]. Au-delà, un nouveau
bilan sera nécessaire, car votre situation dentaire aura pu évoluer.

Bien cordialement,

L'équipe du Cabinet d'Implantologie de Legé
1 rue de Chambord, 44650 Legé — 02 40 26 36 00
```

**Pourquoi ce texte.** Trois réponses en un mot rendent la décision facile. « Vous n'avez rien à répondre » autorise le silence, ce qui fait paradoxalement répondre ceux qui hésitent encore. L'échéance est présentée comme une raison clinique, pas administrative.

**Après J30 : plus aucun envoi automatique.**
- « CONTINUER » → action « Appeler pour organiser le traitement » pour l'équipe.
- « ATTENTE » → statut « En attente », plus de relance.
- « APPEL » → tâche « Appeler le patient » dans le Cockpit (et le brief du matin).
- Pas de réponse → le dossier reste visible dans « À décider » ; c'est l'équipe qui tranche.

---

## Versions WhatsApp (envoi manuel par l'équipe, bouton dans le Cockpit)

- **J7** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Vous avez bien reçu votre devis ? Si vous avez la moindre question, nous sommes là. »
- **J15** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Avez-vous eu la réponse de votre mutuelle ? Nous pouvons faire la demande pour vous avec une photo de votre carte. »
- **J30** : « Bonjour, c'est le Cabinet d'Implantologie de Legé. Pour votre devis : on continue, on met en attente, ou vous préférez qu'on vous appelle ? »

---

## À valider par le Dr

1. Signature : « L'équipe du Cabinet d'Implantologie de Legé » (et non un prénom).
2. J15 : proposer de faire la demande de prise en charge à la place du patient.
3. J30 : les trois mots-réponses CONTINUER / ATTENTE / APPEL (le script les reconnaîtra dans les réponses).
4. Délais comptés depuis la **date d'envoi du devis** (J0), pas depuis la date du devis.

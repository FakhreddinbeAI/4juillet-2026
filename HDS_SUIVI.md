# Avenant HDS Google Workspace — suivi de la demande

*Tenu par Claude, qui gère la demande. Dernière vérification : 27 octobre 2026.
Sources : journal de la session « Google Workspace en HDS » (18–20/10), boîte
contact@, Drive.*

## Où on en est

| Condition HDS côté Google | État | Depuis |
|---|---|---|
| Édition suffisante | ✅ Business Plus, 3 licences | — |
| Contrat de sous-traitance (Avenant traitement des données cloud) | ✅ Accepté | 30/11/2025 |
| Région de données « Europe » (données au repos) | ✅ Activée, capture prise | 20/10/2026 |
| **Avenant HDS** | ⏳ **Demandé, sans réponse** | 19/10/2026 |

## La demande du 19/10

- **Canal** : formulaire commercial Google Cloud (celui que la page HDS de
  Google indique). Le formulaire commercial Workspace refuse les structures de
  moins de 20 personnes.
- **Envoyé** le 19/10/2026 au matin (envoi confirmé à 8 h 27, heure de Paris), avec le compte du cabinet,
  la SELARL TIGHZA, le secteur Santé et le téléphone du Dr Tighza.
- **Contenu** : six questions (avenant HDS, périmètre, contrat, régions de
  données, Apps Script, législations extra-européennes). Le texte exact est
  sur le Mac : `hds/DEMANDE-HDS-google-workspace.md`.
- **Accusé** : page « Merci. Nous vous contacterons prochainement. » Pas de
  numéro de dossier.
- **Réponse attendue** : sur contact@ ou par téléphone.

## Contrôles de la boîte contact@

| Date | Boîte, spam, corbeille | Résultat |
|---|---|---|
| 27/10 (J+8) | expéditeurs Google, « HDS », « Google Cloud », « SELARL TIGHZA » | Rien de Google. Seulement des mails automatiques (sécurité, conditions, factures) |

**Téléphone (27/10)** : aucun appel décroché, aucun message laissé. Le
Dr Tighza ne répond pas aux numéros inconnus. Or le formulaire commercial
annonce un rappel par un commercial. **Ce canal est donc probablement perdu** :
si Google a appelé, l'appel n'a pas abouti.

## Prochaine étape : ticket écrit à l'assistance, sans attendre le 2/11

Le rappel téléphonique ne passe pas : on bascule sur un canal écrit qui donne
un numéro de dossier. C'est l'assistance de la console d'administration
(admin.google.com > Aide > Contacter l'assistance), à ouvrir avec le compte
administrateur. Le contrôle du 2/11 reste en place comme filet. Texte prêt à
coller, moins de 1 000 caractères :

> SELARL TIGHZA, cabinet dentaire (domaine implantologielege.com), Google
> Workspace Business Plus, 3 licences. Nous hébergeons des données de santé à
> caractère personnel (art. L.1111-8 du code de la santé publique) et
> souhaitons conclure l'avenant HDS de Google Workspace. Prérequis déjà en
> place : avenant relatif au traitement des données dans le cloud accepté le
> 30/11/2025, région de données Europe activée le 20/10/2026. Une demande a été
> envoyée le 19/10/2026 via le formulaire commercial Google Cloud, sans réponse
> à ce jour. Merci de nous indiquer la procédure pour signer l'avenant HDS pour
> une organisation de moins de 20 utilisateurs, et de confirmer si Google Apps
> Script entre dans le périmètre du certificat HDS. Merci de répondre par
> écrit à contact@implantologielege.com (pas de rappel téléphonique possible
> pendant les consultations).

## Ce qui reste côté cabinet (hors Google)

- **Comptes nominatifs** pour Lisa, Marion et Lucie : décision en attente.
  Le compte partagé reste le point faible.
- **Alerte sécurité Google du 24/10** : 1 compte sans validation en deux
  étapes, 2 connexions suspectes, 7 accès depuis des appareils non sécurisés.
- **Vus dans la console le 20/10** : SIRET non validé pour la facturation
  électronique, mode de paiement à ajouter, adresse du délégué à la protection
  des données sur une boîte Gmail personnelle.

## Piste parallèle : Clever Cloud

Contrat HDS non signé. Leur organisation est prête, il reste le formulaire
Yousign (lien du mail du 23/10) puis 15 min d'onboarding. Licence de 200 € HT
par mois. À trancher : si tout reste dans Google, l'avenant Workspace suffit
peut-être (sous réserve que Google confirme qu'Apps Script est couvert).
L'application `transmissions-devis` tourne en zone standard depuis le 18/10.

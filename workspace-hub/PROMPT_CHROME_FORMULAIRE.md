# PROMPT CLAUDE IN CHROME — formulaire de pré-consultation implanto (26/10/2026)

> **Remplacé par `PROMPT_LOCAL_FORMULAIRE.md`** : Claude in Chrome n'est pas arrivé à piloter l'éditeur Google Forms. Les mêmes corrections passent désormais par le script `formulaire_implanto.gs`.

## Pourquoi

Voici ce qu'a montré le tri des 143 réponses par le module Questionnaires du Hub :

- **Les « STOP » ne stoppent rien.** 36 patients sur 136 sont hors parcours : 30 veulent des soins, pas un implant ; 19 n'ont pas de dent manquante. Ils remplissent pourtant tout le questionnaire, et Marion doit les rappeler pour les réorienter.
- **Les pathologies sont à choix unique.** Un patient qui en a deux ne peut en déclarer qu'une : 2 pathologies déclarées sur 136.
- **L'avertissement tabac est proposé comme une réponse** (« ⚠️ Tabagisme > 10 cig/jour… »).
- **La V3 n'a plus de mention d'information** ni de case « J'accepte d'être recontacté(e) ». Or elle recueille des données de santé.

Le module du Hub fonctionne avec ou sans ces changements. Les deux premiers sont déjà gérés : les cases à cocher et les réponses partielles.

## Avant de lancer

- À lancer depuis **Claude Desktop ou Claude dans Chrome, sur ton ordinateur**, avec l'extension connectée et le compte contact@ ouvert dans Chrome.
- Relire le **texte d'information RGPD** du prompt, surtout la durée de conservation (12 mois proposés), et le faire valider par ton conseil.
- Ce prompt ne touche jamais aux réponses existantes : le robot ne doit pas ouvrir l'onglet « Réponses ».

## LE PROMPT

```
Tu vas modifier un Google Form du cabinet. Il est en ligne et reçoit des
réponses de patients : sois prudent, et arrête-toi pour me demander au
moindre doute.

Formulaire : https://docs.google.com/forms/d/1549mkhGTY3qYCLoG50a8gSqHtRyLar5V49eSiR8claA/edit

RÈGLES ABSOLUES
- N'ouvre JAMAIS l'onglet « Réponses » : il contient des données de patients.
- Ne supprime aucune question. Ne renomme aucune question et aucune option,
  sauf la seule option tabac indiquée à l'étape 3 (un script lit les titres).
- Dans l'aperçu, ne clique JAMAIS sur « Envoyer » : ça créerait une fausse
  réponse dans le classeur.
- Si une boîte de dialogue de confirmation apparaît, arrête-toi et demande-moi.

ÉTAPE 0 — INVENTAIRE (aucune modification)
Liste-moi, dans l'ordre, les sections et les questions : titre, type
(choix multiples, cases à cocher, réponse courte…), obligatoire ou non. Puis
attends mon « OK » avant de continuer. Je m'attends à trouver à peu près :
  « Avez-vous plus de 18 ans ? », « Nom et Prénom », « Adresse Mail »,
  « Téléphone », « Avez-vous actuellement au moins UNE dent manquante… »,
  « Êtes-vous ici pour une pose d'implant dentaire ? », « Êtes-vous
  actuellement traité(e) pour l'une de ces pathologies ? », « Prenez-vous
  actuellement des médicaments ? », « Fumez-vous ? », puis les questions sur
  les dents, la prothèse, l'orientation, la motivation, la compréhension, et
  « Demande libre ».

ÉTAPE 1 — MENTION D'INFORMATION
Dans la description du formulaire (sous le titre, tout en haut), AJOUTE à la
fin, sans rien effacer, ce paragraphe :

🔒 Vos données — Ce questionnaire est destiné au Cabinet d'Implantologie de
Legé (SELARL TIGHZA, 1 rue de Chambord, 44650 Legé). Vos réponses, y compris
les informations de santé, servent uniquement à évaluer si une consultation
d'implantologie est adaptée et à vous recontacter. Elles sont lues par le
praticien et l'équipe du cabinet, hébergées sur Google Workspace, et
conservées 12 mois si aucune consultation n'a lieu (sinon dans votre dossier
patient). Vous pouvez y accéder, les rectifier ou demander leur suppression
en écrivant à contact@implantologielege.com, et saisir la CNIL (cnil.fr).

ÉTAPE 2 — PATHOLOGIES EN CASES À COCHER
Sur la question « Êtes-vous actuellement traité(e) pour l'une de ces
pathologies ? », change le type de « Choix multiples » en « Cases à cocher »
(menu déroulant du type, à droite du titre). Vérifie ensuite que toutes les
options sont toujours là, « Aucune de ces pathologies » comprise, et que
l'interrupteur « Obligatoire » n'a pas changé.

ÉTAPE 3 — AVERTISSEMENT TABAC
Sur la question « Fumez-vous ? » :
  a) ⋮ (en bas à droite de la question) > « Description », et colle :
     ⚠️ Au-delà de 10 cigarettes par jour, le risque d'échec de l'implant est
     multiplié par 3. Un sevrage est recommandé.
  b) supprime l'option qui commence par « ⚠️ Tabagisme > 10 cig/jour » (la
     croix à droite de l'option). Garde « NON », « OUI, moins de 10
     cigarettes/jour » et « OUI, plus de 10 cigarettes/jour ».

ÉTAPE 4 — FAIRE VRAIMENT S'ARRÊTER LES « STOP »
But : un patient qui répond NON à l'une des trois questions ci-dessous saute
directement à une page de fin, sans voir le reste du questionnaire.
  Q-âge   = « Avez-vous plus de 18 ans ? »
  Q-dent  = « Avez-vous actuellement au moins UNE dent manquante… »
  Q-impl  = « Êtes-vous ici pour une pose d'implant dentaire ? »

4a. Crée une NOUVELLE SECTION tout à la fin du formulaire :
    Titre : Ce questionnaire n'est pas adapté à votre demande
    Description : Ce questionnaire concerne uniquement le remplacement de
    dents manquantes par des implants. Pour une consultation, des soins ou un
    détartrage, prenez rendez-vous avec votre dentiste ou en consultation
    générale sur Doctolib. Merci d'avoir pris le temps de répondre.
    Elle ne contient aucune question. Sous cette section, règle
    « Après la section N » sur « Envoyer le formulaire ».

4b. La section juste AVANT cette nouvelle section (la dernière section
    « normale ») : règle « Après la section N » sur « Envoyer le
    formulaire ». Sinon, les patients normaux tomberaient sur la page de fin.

4c. Google Forms n'accepte le saut de section que sur UNE question par
    section. Si Q-âge, Q-dent et Q-impl sont dans la même section, découpe-la
    avec « Ajouter une section » (icône à droite) pour que chacune soit dans
    sa propre section, en gardant l'ordre actuel des questions. Nom, mail et
    téléphone doivent rester AVANT Q-dent : il faut les coordonnées des
    patients à réorienter. Décris-moi le découpage avant de le faire.

4d. Pour chacune des trois questions : ⋮ > « Aller à la section en fonction
    de la réponse ». Puis :
      - réponse OUI → « Continuer vers la section suivante »
      - réponse NON → « Ce questionnaire n'est pas adapté à votre demande »

ÉTAPE 5 — CONSENTEMENT
Dans la dernière section normale, APRÈS « Demande libre », ajoute une
question :
  Type : Cases à cocher — Obligatoire : oui
  Titre : Consentement
  Une seule option : J'accepte que le cabinet utilise mes réponses pour
  évaluer ma demande et me recontacter.

ÉTAPE 6 — VÉRIFICATION DANS L'APERÇU (icône œil, SANS ENVOYER)
  a) Remplis l'âge = OUI, nom « TEST Robot », mail test@exemple.fr,
     téléphone 0600000000, dent manquante = NON → clique « Suivant » →
     tu dois arriver sur « Ce questionnaire n'est pas adapté à votre
     demande ». Ferme l'aperçu SANS envoyer.
  b) Rouvre l'aperçu et réponds OUI partout jusqu'à la fin : tu ne dois
     jamais voir la page « pas adapté », et la dernière page doit montrer la
     case Consentement. Ferme SANS envoyer.

COMPTE RENDU
Donne-moi : chaque étape avec « fait » ou « pas fait » et pourquoi, le plan
final des sections, et toute différence avec ce que j'attendais à l'étape 0.
```

## Après le passage du robot

1. Dans le classeur des réponses, la question « Consentement » ajoute une colonne à droite. Le module du Hub n'en a pas besoin.
2. Dans l'éditeur du Hub, relancer `qx_diagnostic()` : toutes les colonnes doivent rester ✓.
3. Facultatif, à la main (10 secondes, sans robot pour ne pas exposer les réponses) : renommer l'en-tête A « Colonne 1 » en « Horodateur » et T en « Note équipe ».

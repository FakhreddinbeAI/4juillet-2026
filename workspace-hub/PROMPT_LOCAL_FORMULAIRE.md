# PROMPT SESSION LOCALE — corriger le formulaire implanto par script (26/10/2026)

## Pourquoi un script et pas Chrome

Claude in Chrome n'a pas réussi à piloter l'éditeur Google Forms : menus flottants, champs riches et sauts de section sont difficiles à cliquer de façon fiable. Les corrections passent donc par `formulaire_implanto.gs`, un script FormApp. La session locale le colle dans Apps Script, clique sur « Exécuter », et ne fait qu'**un seul** changement à la main : FormApp ne sait pas changer le type d'une question.

Le script a été testé hors Google sur une copie simulée du formulaire V3, avec et sans sections existantes :
- **Relance sans risque :** relancé une deuxième fois, il ne double rien.
- **Garde-fou :** il refuse de toucher au formulaire si l'ordre des questions n'est pas celui attendu.
- **Parcours simulés :**

  | Réponses du patient | Parcours |
  |---|---|
  | tout OUI | jusqu'à l'envoi, sans voir la page de fin |
  | NON à l'âge | page de fin |
  | NON à la dent manquante | coordonnées, puis page de fin |
  | NON à l'implant | coordonnées, puis page de fin |

Ce que fait le script (le détail est en tête du fichier) :
- mention RGPD ;
- avertissement tabac déplacé en description ;
- réponses STOP qui arrêtent vraiment le formulaire ;
- case « Consentement » obligatoire.

Il ne lit aucune réponse et ne renomme aucune question.

**À valider avant de lancer :** le texte RGPD, notamment la durée de 12 mois (constante `FX.RGPD` du script).

## LE PROMPT (à coller dans une session Claude locale qui a la main sur l'ordinateur)

```
Tu as la main sur mon ordinateur (Windows) et sur Chrome, où le compte
contact@implantologielege.com est connecté. Objectif : corriger mon Google
Form « QUESTIONNAIRE DE PRÉ-CONSULTATION IMPLANTOLOGIE » avec un script
Apps Script déjà écrit et testé. Tu ne modifies rien à la main dans le
formulaire, sauf à l'étape 5.

RÈGLES
- N'ouvre jamais l'onglet « Réponses » du formulaire ni le classeur des
  réponses : ce sont des données de patients.
- Dans l'aperçu du formulaire, ne clique jamais sur « Envoyer » : ça
  créerait une fausse réponse.
- L'écran d'autorisation Google (étape 3), c'est MOI qui clique : arrête-toi
  et demande-moi.
- Au moindre ⚠️ ou message d'erreur dans un journal, arrête-toi et montre-le-moi.

1. RÉCUPÉRER LE SCRIPT dans le presse-papiers. Dans PowerShell :
   (Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/FakhreddinbeAI/4juillet-2026/claude/dreamy-mccarthy-cw9ydm/workspace-hub/formulaire_implanto.gs").Content | Set-Clipboard
   Vérifie que le texte contient « function formulaire_appliquer » et
   « function formulaire_inventaire ».

2. CRÉER LE PROJET. Dans Chrome, ouvre
   https://script.google.com/home/projects/create
   - Renomme le projet (titre en haut à gauche) en
     « Formulaire implanto — corrections ».
   - Dans Code.gs : Ctrl+A puis Ctrl+V. Le script remplace
     « function myFunction ».
   - Ctrl+S pour enregistrer.

3. INVENTAIRE (ne modifie rien). Dans la liste déroulante des fonctions, en
   haut, choisis « formulaire_inventaire », puis clique sur « Exécuter ».
   La première fois, Google demande une autorisation : STOP, demande-moi de
   cliquer (seul l'accès à Google Forms est demandé).
   Relève ensuite tout le « Journal d'exécution » et montre-le-moi. La
   dernière ligne doit être « Contrôles : OK… » ; sinon, arrête-toi.

4. CORRECTIONS. Choisis « formulaire_appliquer », puis « Exécuter ». Relève
   le journal : une ligne ✓ par correction, puis la structure finale.
   Si quelque chose coupe, on peut relancer : rien ne se double.

5. LA SEULE MODIFICATION À LA MAIN. Ouvre le formulaire avec le lien
   « Formulaire : … » en tête du journal, onglet « Questions » uniquement.
   Clique sur la question « Êtes-vous actuellement traité(e) pour l'une de
   ces pathologies ? ». Dans le menu du type, à droite du titre, passe de
   « Choix multiples » à « Cases à cocher ». Vérifie que toutes les options
   sont toujours là et que l'interrupteur « Obligatoire » n'a pas changé.
   Si tu n'y arrives pas en deux essais, dis-le-moi : je le ferai.

6. VÉRIFICATION dans l'aperçu (icône œil), SANS ENVOYER :
   a) Réponds OUI à « plus de 18 ans », puis Suivant. Saisis le nom
      « TEST Robot », le mail test@exemple.fr et le téléphone 0600000000,
      et réponds NON à « dent manquante ». Clique sur Suivant : tu dois
      arriver sur la page « Ce questionnaire n'est pas adapté à votre
      demande ». Ferme l'onglet de l'aperçu.
   b) Ouvre un nouvel aperçu et réponds OUI partout jusqu'à la fin (des
      valeurs bidon dans les champs texte). La page « pas adapté » ne doit
      jamais apparaître, et la dernière page doit montrer la case
      « Consentement ». Ferme sans envoyer.

7. COMPTE RENDU. Donne-moi les deux journaux, le résultat des étapes 5 et
   6, et ce qui n'a pas marché.
```

## Après

1. Relancer `qx_diagnostic()` dans le Workspace Hub : toutes les colonnes doivent rester ✓. La colonne « Consentement » apparaît à droite dans le classeur, mais le module n'en a pas besoin.
2. Le projet « Formulaire implanto — corrections » peut ensuite être mis à la corbeille depuis script.google.com.

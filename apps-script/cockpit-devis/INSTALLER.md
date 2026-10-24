# Cockpit Devis — installer les relances J7 / J15 / J30 et « Devis signé reçu »

Version du 21/10/2026. Fichiers de référence : ce dossier (`Code.gs`, `Relances.gs`, `Ecran.html`, `appsscript.json` inchangé).
Script : https://script.google.com/d/1wT_L8riYMbn7rd6VSDjHWuH98P_k6XHOcJiqAqm8Ym4IDDHps4snTe37/edit

Tout reste **en mode test** : `MODE_ENVOI` absent ou `TEST` → les relances partent vers contact@ avec « [TEST → adresse du patient] » dans l'objet ; `SYNCHRO_LISA` absent ou `OFF` → rien n'est écrit chez Lisa.

## Texte à coller à Claude in Chrome

```
Compte contact@implantologielege.com uniquement (pas ftighza@gmail.com).

1. Ouvre le script Cockpit Devis :
   https://script.google.com/d/1wT_L8riYMbn7rd6VSDjHWuH98P_k6XHOcJiqAqm8Ym4IDDHps4snTe37/edit
2. Remplace intégralement Code.gs et Ecran.html par leur version GitHub (« Copy raw file ») :
   https://github.com/fakhreddinbeai/4juillet-2026/blob/ccr-f742e5aa-rukpap/apps-script/cockpit-devis/Code.gs
   https://github.com/fakhreddinbeai/4juillet-2026/blob/ccr-f742e5aa-rukpap/apps-script/cockpit-devis/Ecran.html
3. Crée un nouveau fichier de script nommé « Relances » (Fichiers → + → Script) et colle :
   https://github.com/fakhreddinbeai/4juillet-2026/blob/ccr-f742e5aa-rukpap/apps-script/cockpit-devis/Relances.gs
   Vérifie par empreinte que les 3 fichiers sont identiques à GitHub. Enregistre.
4. Paramètres du projet → Propriétés du script : vérifie que MODE_ENVOI vaut TEST (ou est absente).
   Ajoute SYNCHRO_LISA = TEST. Ne mets RIEN sur REEL ni ON.
5. Exécute relance_installer (je valide moi-même l'écran d'autorisation Google : accès Gmail en lecture
   pour repérer les réponses des patients). Montre-moi le journal.
6. Exécute relance_test et relance_testTextes. Montre-moi les deux journaux. relance_test n'envoie rien.
7. Déployer → Gérer les déploiements → déploiement de l'écran Cockpit → ✏️ → Nouvelle version → Déployer.
8. Ouvre l'écran Cockpit, ouvre le dossier fictif 99999-00001 : vérifie la présence des boutons
   « ✍ Devis signé reçu » et « Prochaine relance » ; clique « Prochaine relance » et montre-moi le texte.
   Ne clique PAS sur « Devis signé reçu » sur un dossier réel.
9. LECTURE SEULE, ne modifie rien : ouvre le classeur
   https://docs.google.com/spreadsheets/d/1ZNutOD1xstRfXWslXduR4OGusxcW2Eq05iynA6juXYU/edit
   → Extensions → Apps Script (le script de Lisa). Trouve le fichier LISA_AUTO (ou la fonction qui recopie
   une nouvelle ligne de l'onglet Lisa vers Marion, Lucie, Règlements, Suivi RDV) et dis-moi :
   a) comment elle est déclenchée (onEdit simple, déclencheur installable onEdit / onChange, ou horaire) ;
   b) quelles colonnes de Lisa elle lit pour décider qu'une ligne est nouvelle.
   Dans Déclencheurs (icône réveil), liste les déclencheurs du projet de Lisa.
10. Fais-moi un rapport complet.
```

## Pourquoi l'étape 9
Le Cockpit écrit la nouvelle ligne dans l'onglet Lisa par script. Or un déclencheur `onEdit` ne se déclenche
jamais sur une écriture faite par un script : si la recopie vers Marion / Lucie / Règlements / Suivi RDV
dépend d'un `onEdit`, la ligne resterait seule chez Lisa. Tant que ce point n'est pas vérifié,
`SYNCHRO_LISA` reste sur `TEST` (le journal du Cockpit dit seulement où la ligne irait).

## Ce que fait le code
- `relance_tourner` (chaque jour à 9 h, jamais le dimanche, 8 h–20 h) : lit d'abord les réponses des patients
  dans Gmail (lecture seule) — CONTINUER / ATTENTE / APPEL / STOP ou toute autre réponse arrête les relances
  et pose l'action pour l'équipe — puis envoie la relance due (J7, J15, J30 depuis la date d'envoi du devis).
  Une seule relance par patient sur 7 jours, même s'il a plusieurs devis. Pas de relance si devis signé,
  décidé, expiré, ou sans adresse. Pièces jointes : le devis + les documents J0 non cochés dans « Pièces reçues ».
- « ✍ Devis signé reçu » : note la date, statut « Devis signé », décision « Accepté », arrête les relances,
  puis passe le dossier chez Lisa dans le bon classeur (Implanto si un acte relève de l'implantologie, sinon
  Autres devis) — jamais d'écrasement d'une ligne existante, jamais d'écriture dans une cellule à formule.
- Nouvelles colonnes en fin de « Plans » : « Relance 3 », « Réponse patient ». Nouveaux statuts :
  « Devis signé », « En attente ».

## Testé hors ligne (simulation, 21/10/2026)
Faux classeur de 8 dossiers : J7 à J+8, J15 à J+16, J30 à J+31 ; 2e devis du même patient reporté ; devis
expiré ignoré ; dossier signé ignoré ; réponse « APPEL » reconnue (action « Appeler le patient ») et la citation
du message précédent ignorée ; 2e passage le même jour : aucun envoi ; « Devis signé reçu » en TEST : ligne
cible annoncée dans le journal, rien écrit. **Non testé : l'exécution réelle dans Google** (Gmail, Drive, envoi).


---

# Mise à jour du 24/10/2026 — après le rapport d'installation

Corrections :
1. **Relances de test marquées** : en MODE TEST la date est notée « TEST jj/mm/aaaa » dans « Relance 1/2/3 » ;
   en REEL ces cases ne comptent pas, un vrai dossier testé n'est donc jamais « déjà relancé ».
2. **Gmail en lecture seule** : lecture des réponses par l'API Gmail (service avancé), autorisation
   `gmail.readonly` au lieu de `https://mail.google.com/` (accès complet). Le manifeste `appsscript.json`
   liste désormais les autorisations exactes.
3. **Date de l'aperçu** : calcul en jours de calendrier (plus d'effet du passage à l'heure d'hiver) et
   report au lundi si l'échéance tombe un dimanche.
4. Adresse du patient nettoyée (espaces, majuscules) avant l'envoi.

## Texte à coller à Claude in Chrome

```
Compte contact@implantologielege.com uniquement.

1. https://myaccount.google.com/permissions (compte contact@) : trouve l'accès de l'application
   « Cockpit Devis » (ou « Projet sans titre » lié au script Cockpit) et clique « Supprimer l'accès ».
   Note dans ton rapport le nom exact de l'accès supprimé. Ne touche à aucun autre accès.
2. Ouvre https://script.google.com/d/1wT_L8riYMbn7rd6VSDjHWuH98P_k6XHOcJiqAqm8Ym4IDDHps4snTe37/edit
   Paramètres du projet → coche « Afficher le fichier manifeste appsscript.json dans l'éditeur ».
3. Remplace intégralement par la version GitHub (« Copy raw file »), puis vérifie par empreinte SHA-256 :
   appsscript.json ← https://github.com/fakhreddinbeai/4juillet-2026/blob/ccr-f742e5aa-rukpap/apps-script/cockpit-devis/appsscript.json
   Relances.gs     ← https://github.com/fakhreddinbeai/4juillet-2026/blob/ccr-f742e5aa-rukpap/apps-script/cockpit-devis/Relances.gs
   (Code.gs et Ecran.html ne changent pas : vérifie seulement leur empreinte.) Enregistre.
   Dans « Services » à gauche, « Gmail » doit apparaître (ajouté par le manifeste).
4. Exécute relance_installer. L'écran d'autorisation Google doit maintenant indiquer
   « Consulter vos e-mails et vos paramètres » (lecture seule) et NON « lire, rédiger, envoyer et
   supprimer ». Je valide moi-même. Fais une capture des autorisations demandées pour le rapport.
5. Exécute relance_test puis relance_testTextes. Journaux dans le rapport.
6. Déployer → Gérer les déploiements → « Sans titre » → ✏️ → Nouvelle version → Déployer.
7. Écran Cockpit, dossier 99999-00001 → « Prochaine relance » : la date doit être le 26/10/2026.
8. Rapport : empreintes, accès supprimé, autorisations demandées, journaux, version du déploiement.
```

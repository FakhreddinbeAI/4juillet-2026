# Workspace Hub : onglet ☀️ Brief

Ce dossier fusionne le projet Apps Script « Brief du matin — Cabinet » dans « Workspace Hub ».
Le moteur du brief n'est pas modifié. Ces deux fichiers ne font que le brancher.

| Fichier | Où le coller dans le projet Workspace Hub |
|---|---|
| `Brief.gs` (moteur V2, remplace le Code.gs du projet Brief) | nouveau fichier de script `Brief` |
| `BriefHub.gs` | nouveau fichier de script `BriefHub` |
| `BriefHub_onglet.html` | dans `index.html`, juste avant `</body>` |

## Installation

1. Hub → ＋ Fichier de script `Brief` → coller `Brief.gs` (V2). Tant que le mail part de l'ancien projet, coller aussi `Brief.gs` à la place de son `Code.gs`.
2. Hub → ＋ Fichier de script `BriefHub` → coller `BriefHub.gs`.
3. Hub → `index.html` → coller `BriefHub_onglet.html` juste avant `</body>`.
4. Lancer `briefHub_test` dans l'éditeur. Une autorisation est demandée pour l'envoi de mail (MailApp est un nouvel accès pour le Hub).
5. Déployer → Gérer les déploiements → ✏️ → Nouvelle version. L'URL ne change pas.
6. Pour envoyer le mail depuis le Hub : lancer `brief_installerDeclencheur` dans le Hub, puis `brief_supprimerDeclencheur` dans l'ancien projet, puis archiver l'ancien projet.

## Réglages

- `BRIEF_HEURE_SOIR = 15` (dans `BriefHub_onglet.html`) : à partir de cette heure, l'onglet ouvre le brief du prochain jour ouvré.
- `dir:true` : l'onglet est réservé à la Direction. Le serveur le vérifie aussi avec `exigerDirection_()`.

## Vérifié le 03/11/2026 sur le vrai code des deux projets

- Aucun conflit de noms entre `Code.gs`, `Cours.gs`, `Questionnaires.gs`, `Brief` et `BriefHub` (112 noms globaux).
- Le vrai moteur a tourné avec des données fictives. Vendredi 18 h, « Prochain jour ouvré » saute le samedi, le dimanche et un lundi « Fermé », et ouvre le mardi.
- L'onglet a été testé dans le vrai `index.html` sous Chromium, en clair, en sombre et sur mobile, sans erreur JavaScript. Il est invisible pour l'équipe. Le cache, Recalculer et Actualiser fonctionnent, et les liens s'ouvrent dans un nouvel onglet.
- Le déclencheur `qx_surReponse` (Questionnaires) n'est pas touché par les fonctions du brief.

## Limite connue (même règle que le mail)

Le moteur ne connaît pas les jours fériés. Pour qu'un jour soit traité comme fermé un jour de semaine, il faut un événement « Fermé » sur la journée entière dans l'agenda.

## Moteur V2 (`Brief.gs`) — 03/11/2026

- **Aucun nom de patient dans le brief.** Chaque patient a un code : ses initiales, plus le n° de dossier du classeur quand il existe (« D.J. #142 »). Le nom est aussi retiré des notes quand il y a été recopié. Le réglage `BRIEF_CFG.codePatient` vaut `'auto'`, `'initiales'` ou `'aucun'`.
- **Gmail sans nom.** Le brief donne le nombre de fils, les expéditeurs par domaine (les adresses personnelles sont regroupées en « particuliers ») et un lien vers Gmail. Avec `gmailDetail: true`, l'expéditeur et l'objet de chaque mail reviennent.
- **« 🧰 À préparer et vérifier ».** Une fiche par type de RDV (`BRIEF_PREPA`), avec des cases à cocher. Trois contrôles se font automatiquement sur chaque RDV : référence implant dans la note, prothèse marquée [proth✅], dossier bloqué chez Lisa.
- **Sources des fiches.** Le doc Drive « PROTOCOLES » de l'équipe (version de l'assistante du 02/10), les skills gestion RDV et bilan matinal, et les modèles de consentement par acte. Aucun protocole salle ou matériel n'a été trouvé dans le Drive : cette partie reste à écrire par l'équipe de soins.
- **`brief_typesAgenda()`.** Écrit dans le journal chaque type de RDV des 60 prochains jours avec sa fiche, ou « SANS FICHE ».
- **Testé** avec le vrai moteur, des noms fictifs et les trois modes de code : aucun nom ne sort. Tous les types testés tombent sur la bonne fiche, et le rendu dans le Hub est correct en sombre et sur mobile. Aucun conflit de noms avec le Hub (119 noms globaux).

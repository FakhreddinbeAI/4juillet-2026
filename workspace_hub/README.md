# Workspace Hub : onglet ☀️ Brief

Ce dossier fusionne le projet Apps Script « Brief du matin — Cabinet » dans « Workspace Hub ».
Le moteur du brief n'est pas modifié. Ces deux fichiers ne font que le brancher.

| Fichier | Où le coller dans le projet Workspace Hub |
|---|---|
| *(Code.gs du projet Brief, tel quel)* | nouveau fichier de script `Brief` |
| `BriefHub.gs` | nouveau fichier de script `BriefHub` |
| `BriefHub_onglet.html` | dans `index.html`, juste avant `</body>` |

## Installation

1. Projet Brief du matin → `Code.gs` → tout copier → Hub → ＋ Fichier de script `Brief` → coller.
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

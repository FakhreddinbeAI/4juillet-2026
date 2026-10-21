# Transmissions devis — point central

Mis à jour le 21/10/2026. Une seule source de vérité : ce fichier.
Règle : rien n'est supprimé sans décision du Dr ; les anciennes versions restent, rangées en « Archives ».

## 1. EN SERVICE (la seule chose que l'équipe utilise)

| Quoi | Où |
|---|---|
| **App tablettes** (Implanto + Autres devis, menu Filière) | https://script.google.com/a/macros/implantologielege.com/s/AKfycbwTJ2z5zAqCD_KVNgq7dUBghCMumVdCtOyY6gTrBaPL8QSuSMLWURxpSqDHQsxdcdBJ/exec |
| Script de l'app (« API Transmissions devis ») | https://script.google.com/d/1B47N3KrLBqIRokOe-AcIwr4NZr9J1lEuHNR_TnQaL6hmok1bW7m5A4eV/edit — déploiement « Sans titre », version 4 (21/10/2026), accès « Moi uniquement », compte contact@ |
| Code de référence de l'app (API 1.3.0) | ce dépôt : `apps-script/transmissions-devis-unique/` (Config.gs, API.gs, Index.html). Pont.gs : seulement dans le script |
| Classeur **Implanto** (données) | https://docs.google.com/spreadsheets/d/1ZNutOD1xstRfXWslXduR4OGusxcW2Eq05iynA6juXYU/edit |
| Classeur **Autres devis** (données) | https://docs.google.com/spreadsheets/d/1kQyAve0QEr4tou_xGV6d6UG3zwvRL7dE5DQ-yiKYZ1k/edit |
| Script de Lisa (règles, horodatage, agenda, pipeline) | lié à chaque classeur (Extensions → Apps Script). **Ne jamais modifier depuis l'app.** |
| Agenda lu par l'app | contact@implantologielege.com |

Lien `/dev` (AKfycbwDsImte…/dev) : lien de test du script, réservé à l'éditeur. **Jamais sur les tablettes.**

## 2. ARCHIVES (gardées, ne plus utiliser au quotidien)

| Quoi | Où | Note |
|---|---|---|
| Ancienne app version Claude « Transmissions devis » | https://claude.ai/artifact/LrdsEMPAPmwjMSqSA4ebEp | épinglée ; ne marche qu'avec les connecteurs Claude |
| État des lieux — Transmissions devis | https://claude.ai/artifact/DxSfy9WSPfmrHguMNZvK2n | |
| Maquette web app Dossiers | https://claude.ai/artifact/FHtS5v73771PckPwZ2XSz5 | |
| Synchro La Fraise | https://claude.ai/artifact/L47GDQX9VBgcKf2dNd9gML | |
| Remplacer La Fraise — cahier des charges | https://claude.ai/artifact/PR8nYqPrFXxdLfdaACtmEf + Google Doc 15KWeBWbYxoeIaOY6pc1IdpixRLqM6jDFIsBgTqBziew | |
| Case Dossier clôturé | https://claude.ai/artifact/QmqRrPGbXPt7hPfWQLdCUY | |
| Guide animateur — Formation Lucie | https://claude.ai/artifact/8wA2ffXriyXrsMMu42jAAG | |
| Sauvegardes du 24/08/2026 (2 classeurs) | Drive : 1L7Algz-ZAlnYVpB1ja9WVjb_FUoORNuZgrAW6Uk-gjc, 1kHSdlyRPCpeAS8Dcc8bRDIHyU1OETR0z1hAuM8WC28A | avant réalignement |
| Vidéo guide | Drive : guide-transmissions-devis.mp4 (10pxbuOfTNFXGcjYWpSL1l4J95p2fynQ4) | montre peut-être l'ancienne version Claude |
| Déploiement « original — compte d… » | dans le script de l'app | encore actif, ancienne version |
| Démo Clever Cloud | session « Installation Clever Cloud — Transmissions devis » (18/10) | **à trancher** : la session signalait une carte SELARL à enregistrer, sinon suspension |
| Cockpit Devis (classeur « base » + script + dossiers) | Drive : 1tVIQjL4USDXWTTUfK29HcOaIK4CdUDwDVz8gorFMYfA | lien avec l'app à confirmer |

## 3. CORBEILLE DRIVE (21/10/2026, récupérable ~30 jours, jusqu'au ~20/11/2026)

Drive → Corbeille → clic droit → Restaurer.

- API Transmissions devis — Autres devis (script, remplacé par l'app unique)
- API Transmissions devis — TEST (script)
- TEST Installeur Transmissions devis (script)
- COPIE TEST — Transmissions devis — Implanto
- TEST — Transmissions devis (cabinet fictif des Lilas)
- TEST — Transmissions devis Autres devis (cabinet fictif des Lilas)
- 5 × TEST devis fictif.txt

Non mis à la corbeille (droits) : « Script Transmissions devis (TEST Lilas) » (1ViiDf9aZ4PggM3_Tj49wIexyZknV7bE6si0aaintaRk).

## 4. SESSIONS CLAUDE qui ont travaillé dessus

| Date | Session | Ce qui en reste |
|---|---|---|
| 24/08 | Outil transmission dossiers patients | classeurs Lisa-Marion-Lucie, sauvegardes du 24/08 |
| 18/10 | Simplification tableau administratif Lisa | page Claude « Transmissions devis » |
| 18/10 | Palier 1 : brancher la maquette sur le Google Sheet | script API (Palier 1) |
| 18/10 | Installation Clever Cloud — Transmissions devis | démo hébergée (à trancher) |
| 18/10 | Google Workspace en HDS | skill hds-google-workspace-cabinet |
| 19/10 | Tester le script runtime dans le classeur de test | OAuth cabinet accordé, « note partagée » |
| 20-21/10 | Cockpit de suivi de devis et classeur Lisa (celle-ci) | app unique v4, ce fichier |

## 5. Règle pour la suite

1. Toute modification de l'app part de `apps-script/transmissions-devis-unique/` dans ce dépôt, puis est collée dans le script et redéployée (Gérer les déploiements → ✏️ → Nouvelle version). L'URL ne change jamais.
2. Une nouvelle session Claude commence par lire ce fichier.
3. Rien n'est supprimé : on déplace en « Archives » ici.

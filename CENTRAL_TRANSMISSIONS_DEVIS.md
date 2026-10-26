# Transmissions devis — point central

Mis à jour le 21/10/2026. Une seule source de vérité : ce fichier.
Règle : rien n'est supprimé sans décision du Dr ; les anciennes versions restent, rangées en « Archives ».

Dossier Drive central : https://drive.google.com/drive/folders/1oF-vCpKCETquNntVw2EExozzECkAYRS8
(document « 00 — LIRE D'ABORD — Point central » : https://docs.google.com/document/d/14LBLJqdbDckxFTz1O_OzOtPVUeFiLX_v6SCZQ-5PYII/edit)

Circuit : Logos (devis PDF) → **Cockpit Devis** (lecture, envoi patient, suivi, PEC) → synchro étape 7 (désactivée) → **Transmissions devis** (Lisa · Marion · Lucie · Règlements).

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

## 1 bis. EN CONSTRUCTION — Cockpit Devis (remplaçant de La Fraise)

| Quoi | Où |
|---|---|
| Classeur « Cockpit Devis — base » (Plans, Actes, Journal, Paramètres) | https://docs.google.com/spreadsheets/d/1tVIQjL4USDXWTTUfK29HcOaIK4CdUDwDVz8gorFMYfA/edit |
| Script « Cockpit Devis » (Code.gs + Ecran.html, webapp « Moi uniquement ») | https://script.google.com/d/1wT_L8riYMbn7rd6VSDjHWuH98P_k6XHOcJiqAqm8Ym4IDDHps4snTe37/edit |
| Dossier Drive « Cockpit Devis » | https://drive.google.com/drive/folders/15GyL2riQCbtMj6wPxp-Yp8aT-IxLUSDI — Devis entrants, Dossiers patients, Devis illisibles, Modèles patients |

État au 19/10/2026 (journal) : étape 1 faite — lecture des devis Logos OK (3 dossiers : 1 fictif + 2 réels du 15/10, « Dossier à traiter »), envoi au patient testé en MODE TEST seulement (pièces jointes : devis + questionnaire médical + consentement), WhatsApp testé, PEC mutuelle saisie à la main. Synchro vers le classeur Implanto : présente mais désactivée (`synchroClasseur: false`, étape 7). 5 sous-dossiers « 99999-00001 — FICTIF » en double dans Dossiers patients (tests répétés) ; seul 1VVxsoNZEXew6EFVg0Be-aAgmzXsA_xcT est référencé par la base. Le PDF de test de ce dossier fictif (16UI0shgx73d-JvoZuI9MKVQTEJo2kAhq) est à la corbeille depuis le 21/10 : à restaurer.

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

## 6. ARCHITECTURE — 3 modules autonomes qui se parlent (décision du 21/10/2026)

À terme : une seule interface. En attendant : chaque module marche seul et échange avec son voisin.

```
 Logos (PDF devis)
      │
      ▼
 ① COCKPIT DEVIS ──────────────── PEC à demander ───────────────▶ ③ COPILOT PORTAILS MUTUELLES
   lit le devis, envoie au patient,  ◀──── Accordé / Refusé + montant ────  remplit le portail (Santéclair/FFL),
   suit lecture / signature            (« Statut PEC », « Remb. AMC accordé »)  s'arrête avant « Valider »
      │
      │ devis accepté / signé  (colonnes ★ = mêmes en-têtes que l'onglet Lisa)
      ▼
 ② TRANSMISSIONS DEVIS (app tablettes : Lisa · Marion · Lucie · Règlements)
```

Clé commune aux 3 modules : **ID dossier** (format Logos `NNNNN-NNNNN`). Bus d'échange : les classeurs Google (pas d'API entre modules tant qu'ils sont séparés).

| Liaison | Sens | État | Ce qu'il manque |
|---|---|---|---|
| ① → ② | Cockpit → classeur de Lisa | codée, **désactivée** (`synchroClasseur: false`) | choisir le classeur selon la filière (Implanto / Autres devis : aujourd'hui seul Implanto est configuré), définir le déclencheur (devis signé ? accepté ?), ne jamais écraser une ligne déjà travaillée par Lisa |
| ① → ③ | Cockpit → Copilot | **préparée côté Cockpit** (bloc DPEC dans « Plans » ; n° Sécu et date de naissance jamais stockés, relus dans le PDF par `cockpit_identiteDPEC_`) | le Copilot lit aujourd'hui sa propre base (`treatment_plans`, `plan_details`) : lui ajouter une lecture des dossiers « Statut PEC = À demander » du Cockpit |
| ③ → ① | Copilot → Cockpit | à faire | relire « Accordé / Refusé / Facturé » sur le portail et l'écrire dans « Statut PEC » + « Remb. AMC accordé » |
| ① → ② (PEC) | Cockpit → Lisa | à faire | reporter le résultat PEC dans les colonnes PEC / montants mutuelle de Lisa |

Contraintes :
- Le Copilot tourne **en local** sur le PC du cabinet (Playwright piloté sur un Chrome connecté au portail ; aucun mot de passe stocké ; validation finale toujours humaine). Il ne peut pas devenir une page Apps Script : dans l'interface unique, ce sera un « agent de poste » déclenché depuis l'interface via une file d'attente dans le classeur.
- Cockpit et Transmissions sont tous deux en Apps Script + Google Sheets : leur fusion en une seule webapp à onglets est la voie la plus courte vers l'interface unique.

Copilot portails mutuelles — où il est :
- Spec : `spec_copilote_dpec_santeclair.md` (Drive 1zHCWxHh9lZEKVRWBKkIQIdWMjOzmKFMS)
- Code TypeScript (pilotes `portails/types.ts`, `registre.ts`, `dpec-driver.ts`, `ccam-mapping.ts`, `prepare-dossier.ts`, panneau `copilote-portail-panel.tsx`) : **plusieurs copies dans Drive** (3 dossiers « copilote-dpec », « copilote-local », skill « copilote-portail-supervise » + zip du 14/07). La copie de référence reste à désigner.
- Skill réutilisable : installé sur le PC Windows (`C:\Users\conta\.claude\skills\copilote-portail-supervise\`).

Ordre proposé : ① → ② d'abord (supprime la double saisie Logos / La Fraise / Lisa), puis ① ↔ ③, puis la fusion Cockpit + Transmissions en une interface.

### Décisions du 21/10/2026
- **① → ② : un dossier passe chez Lisa quand le patient a SIGNÉ le devis** (colonne « Signé le » du Cockpit renseignée).
- Le Cockpit doit faire les **relances patient tout seul**. Constat sur le code du 19/10 : ce n'est **pas encore le cas** — les colonnes « Relance 1 / Relance 2 » existent mais rien ne les remplit ; « Signé le » n'est modifiable ni à l'écran ni par un statut ; le suivi de lecture (« Nb d'ouvertures ») n'existe pas (le mail part avec pièces jointes, sans lien de suivi ; le « Jeton patient » est prévu pour une future page patient). Envois toujours en MODE TEST (propriété `MODE_ENVOI`).

### Séquence patient du Cockpit (décision du Dr, 21/10/2026) — RÉFÉRENCE

| Jour | Message | But |
|---|---|---|
| **J0** | Envoi du devis + explications du traitement + documents (questionnaire, consentement) | Déjà codé dans le Cockpit (`ecran_envoyer`, mail J0) |
| **J7** | « Tout est OK ? Avez-vous des questions ? » | Lever les doutes sur le traitement |
| **J15** | Point **mutuelle et papiers** : retour de la mutuelle reçu ? documents complets ? | Débloquer la prise en charge et les pièces |
| **J30** | « On continue, on met le dossier en attente, ou vous préférez un appel ? » | Faire décider le patient sans pression ; « appel » → tâche pour l'équipe |

Arrêt de la séquence dès que le devis est **signé** (→ passage chez Lisa), refusé, ou que le patient a répondu.
Versions antérieures trouvées et **remplacées** par cette séquence : cahier des charges La Fraise (J+7 / J+21 / J+28), modèle v2 du 31/08 (J+10 / J+30, Drive 12rO0bxapMx_fODZgvDZWw40qw17NNYh7), skill HubSpot de mai (J+7 / J+14 / J+30). À reprendre du modèle v2 : pas de prénom sauf certitude, une relance par patient (pas par devis), dédoublonnage des adresses, ligne « STOP », pas de relance si le patient a écrit.

### Copilot : règle de version et copie de référence
**On garde la copie la plus récente du Copilot** (la plus travaillée) ; les autres deviennent des archives.

Inventaire du 21/10/2026 (métadonnées seulement) : **une seule vraie copie du code source**, la plus récente.
- **Référence** : projet `suivi-devis` sauvegardé depuis « Mon ordinateur portable / Desktop » — https://drive.google.com/drive/folders/1a6-hcu8DWF42oay0XhN6hwXt0wvvYFjw (historique `.git` inclus, dernières modifications 17-18/10/2026).
  - `src/automation/santeclair/` : dpec-driver.ts (+ test), run.ts, session.ts, playwright-page.ts, connect.ts
  - `src/automation/portails/` : types.ts, registre.ts (contrat commun des pilotes de portail)
  - `src/domain/coverage/santeclair/` : ccam-mapping.ts, prepare-dossier.ts, grille-tarifaire.ts, insurers.ts, families.ts (+ tests)
  - Interface : `app/plans/[id]/copilote-portail-panel.tsx`, `dpec-preview.tsx` ; route `app/api/plans/[id]/copilote-dpec/route.ts`
- **Pas des copies** : les 3 dossiers « copilote-dpec » du 18/10 07:35 sont dans `.next/` = sortie de compilation Next.js du même projet (à ignorer).
- **Archives** : skill « copilote-portail-supervise » (sauvegarde Claude du 21/07, version de session.ts ancienne) ; « copilote-local » = projet Python de tri d'e-mails, sans lien ; dossiers « suivi-devis » de mai 2026 (HubSpot, plus anciens, sans code copilote).
- Le code lui-même tourne sur le PC portable (Desktop\\suivi-devis) ; le Drive n'en est qu'une sauvegarde synchronisée.

## 7. JOURNAL DES DÉCISIONS (à compléter à chaque session, ne jamais effacer)

| Date | Décision | Raison |
|---|---|---|
| 20/10/2026 | App Transmissions servie par Apps Script (plus par Claude) | L'équipe l'ouvre sur tablette sans compte Claude ni connecteurs |
| 21/10/2026 | Une seule app pour Implanto + Autres devis (menu Filière), version 4 | Une seule icône, une seule URL |
| 21/10/2026 | Rien n'est supprimé sans décision du Dr ; on archive | Travail éclaté sur plusieurs PC et sessions |
| 21/10/2026 | 3 modules autonomes qui communiquent (Cockpit, Transmissions, Copilot), fusion à terme | Chaque outil marche seul en attendant l'interface unique |
| 21/10/2026 | Passage Cockpit → Lisa à la **signature** du devis | Lisa ne travaille que des dossiers engagés |
| 21/10/2026 | Séquence J0 / J7 / J15 / J30 (ci-dessus), relances autonomes dans le Cockpit | Décision du Dr |
| 21/10/2026 | Chaque relance J7/J15/J30 vise la signature : « Avez-vous pensé à signer votre devis ? » + récapitulatif complet et devis rejoint | Le patient n'a rien à chercher ; à chaque relance on remet toutes les infos |
| 21/10/2026 | Relances v3 = mixte : rappel de signature + récapitulatif (v2) ET angle propre à chaque étape (v1 : questions / mutuelle et papiers / CONTINUER-ATTENTE-APPEL) | Choix du Dr |
| 21/10/2026 | Cockpit : relances J7/J15/J30 + « Devis signé reçu » codés (`apps-script/cockpit-devis/`), en MODE TEST ; passage chez Lisa en SYNCHRO_LISA = TEST tant que la recopie LISA_AUTO n'est pas vérifiée | Un onEdit ne se déclenche pas sur une écriture par script |
| 24/10/2026 | Cockpit installé (déploiement « Sans titre » v3), MODE_ENVOI absent = TEST, SYNCHRO_LISA = TEST, déclencheur relance_tourner 9 h | Rapport Claude in Chrome du 24/10 |
| 24/10/2026 | Relances de test notées « TEST jj/mm/aaaa », ignorées en REEL ; Gmail en lecture seule (gmail.readonly) | Ne pas fausser les vrais dossiers ; l'accès complet accordé n'était pas nécessaire |
| 24/10/2026 | Passage chez Lisa reste en TEST : la recopie de Lisa (`lisaAutoPropager`) est un déclencheur installable « lors d'une modification », qui ne réagit pas aux écritures par script | Vérifié en lecture seule dans le projet de Lisa (6 déclencheurs) |
| 24/10/2026 | Option A : nouveau fichier `COCKPIT_PONT.gs` (même fichier dans les projets de Lisa Implanto et Autres devis) + déclencheur 15 min qui rejoue `lisaAutoPropager` sans événement ; aucun des 43 / 33 fichiers de Lisa modifié ; synchro Règlements bloquée s'il y a un trou en Règlements!A | `lisaAutoPropager` exige un événement de saisie ; `reglements_synchroniser` écraserait des lignes en cas de trou |
| 24/10/2026 | Pont installé : `COCKPIT_PONT.gs` (empreinte 96b7a5d9…) + déclencheur `cockpitPont_recopier` 15 min dans Implanto (44 fichiers, 7 déclencheurs) et Autres devis (34 fichiers, 3 déclencheurs) ; simulation « rien à recopier » des deux côtés ; fichiers de Lisa inchangés (43/43, 33/33) | Rapport Claude in Chrome du 24/10, 19:27 |
| 24/10/2026 | Corrections Cockpit installées (Relances.gs d510895a…, appsscript.json fa654db7…) ; ancien accès Gmail complet supprimé, nouvel accès gmail.readonly ; déploiement « Sans titre » v4 ; prochaine relance du fictif : J7 le 26/10/2026 | Rapport Claude in Chrome du 24/10, 19:49 |
| 26/10/2026 | J7 de test reçue sur contact@ à 09:03 (heure de Paris) : objet « [TEST → …] Votre devis n° 99999-00001 — avez-vous des questions ? », 3 pièces jointes (devis, questionnaire médical, consentement Implantologie), texte v3 conforme | Contrôle de la boîte contact@ en lecture seule le 26/10 |
| 21/10/2026 | Copilot : la copie la plus récente fait foi = `suivi-devis` du PC portable (Drive 1a6-hcu8DWF42oay0XhN6hwXt0wvvYFjw) | Décision du Dr ; seule vraie copie du code, modifiée le 18/10 |

### Points ouverts au 24/10/2026
- **Recopie chez Lisa** : `lisaAutoPropager` (déclencheur « lors d'une modification ») lance `insererDossiersManquants()`, `reglements_synchroniser()`, `fiab_autoReparer()` ; ligne nouvelle = ID de Lisa!A absent de Marion!B ou Règlements!A ; garde-fou : B et D remplis. Une ligne écrite par le Cockpit ne déclenche rien. Décision à prendre par le Dr.
- **Ingestion automatique** du Cockpit (`cockpit_ingerer` toutes les 5 min) : non installée.
- **Lecteur de devis** : sur le devis fictif, « Céramo-céramique · Libre » est rattaché au Cone beam au lieu de la couronne (matériau / panier lus sur la mauvaise ligne). À corriger dans `lecteur_lire`.
- **Pont Lisa — à savoir** : une ligne de Lisa avec ID mais sans nom (B) ou type (D) bloque la recopie de tous les dossiers (comportement identique à `lisaAutoPropager`) ; un trou dans Règlements!A bloque la synchro Règlements avec une alerte à chaque passage, à combler à la main. L'en-tête de `COCKPIT_PONT.gs` dit « horaire » alors que le déclencheur tourne toutes les 15 min (commentaire seulement, laissé tel quel pour garder l'empreinte installée).
- **Activation du passage chez Lisa** : `SYNCHRO_LISA` reste sur TEST jusqu'au premier devis réellement signé ; ce jour-là, passer sur ON juste avant « ✍ Devis signé reçu », puis vérifier la ligne dans Lisa, Marion, Lucie, Règlements et Suivi RDV après le passage du pont (≤ 15 min).
- **Autre accès Google à examiner** (sans urgence) : un second « Projet sans titre » a encore Gmail complet + Google Agenda sur contact@ (probablement un projet de Lisa, `agd_auto`). Ne pas y toucher sans identifier le projet.
- **Lundi 26/10/2026, 9 h** : première J7 de test (dossier fictif) vers contact@, objet « [TEST → …] Votre devis n° 99999-00001 — avez-vous des questions ? » ; « Relance 1 » = « TEST 26/10/2026 ». Vérifier le mail et les 3 pièces jointes avant de passer `MODE_ENVOI = REEL`.
- **Avant `MODE_ENVOI = REEL`** (26/10/2026) : (1) la ligne « Devis n° … — [Description] » reprend la description brute de Logos (ex. « PC SC 1 IMPLANT. PEC SC 1 implant »), peu lisible pour un patient ; (2) en REEL, le J0 du Cockpit part aussi aux patients ; (3) si La Fraise relance encore les mêmes patients, ils recevraient deux circuits de relances (phase D du cahier des charges : marche en parallèle à organiser) ; (4) « Relance 1 » du dossier fictif = « TEST 26/10/2026 » non vérifié à l'écran.

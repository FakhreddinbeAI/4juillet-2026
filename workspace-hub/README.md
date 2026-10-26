# Workspace Hub — module « Questionnaires implanto »

Ce module branche les réponses au **questionnaire de pré-consultation implantologie** (le Google Form V3 dont le lien est donné aux patients via Doctolib) sur le Workspace Hub. Pour chaque patient, il donne :

- **le tri :** parcours standard, avis du Dr, ou hors parcours ;
- **l'étape du parcours :** à appeler, RDV pris, consultation faite, devis, devis signé ;
- **la prochaine action et qui la fait :** Marion pour les appels, le Dr pour les avis.

Il tourne dans Apps Script. Aucune donnée ne sort de Google : pas d'IA, pas de service externe.

| Fichier | Rôle | Où le coller |
|---|---|---|
| `Questionnaires.gs` | Lecture des réponses, tri, rapprochement agenda + devis, décisions, déclencheur | Nouveau fichier de script **« Questionnaires »** dans le projet Workspace Hub |
| `index.html` | Le `index.html` du Hub + l'onglet « Questionnaires » + la carte du jour | Remplace **tout** le contenu de `index` dans le projet |
| `vue-questionnaires.js` | La partie ajoutée à `index.html`, isolée pour la relire | Rien à coller : elle est déjà dans `index.html` |

`Code.gs` et `Cours.gs` ne changent pas.

---

## Installation (10 minutes)

1. Ouvrir le projet Apps Script **Workspace Hub**.
2. Cliquer sur **＋ → Script**, nommer le fichier `Questionnaires`, puis y coller `Questionnaires.gs`.
3. Ouvrir `index` : tout sélectionner, puis coller `index.html`.
4. Aller dans **Paramètres du projet → Propriétés du script** et ajouter :

   | Propriété | Valeur |
   |---|---|
   | `QX_REPONSES_ID` | ID du classeur « V3 QUESTIONNAIRE … (réponses) V3 » : la partie de son URL entre `/d/` et `/edit` |
   | `QX_LIEN_FORMULAIRE` | le lien court du formulaire (`https://forms.gle/…`, bouton « Envoyer » du formulaire) |
   | `QX_COCKPIT_ID` | *(facultatif)* ID de « Cockpit Devis — base », pour voir les devis de Cockpit |
   | `QX_AGENDA_ID` | *(facultatif)* seulement si les RDV patients ne sont pas dans l'agenda principal de contact@ |

5. Dans l'éditeur, choisir la fonction **`qx_installer`**, puis cliquer sur **Exécuter** et accepter les autorisations. Cela :
   - crée le classeur « Questionnaires implanto — suivi (Workspace Hub) » ;
   - pose le déclencheur qui réagit à chaque nouvelle réponse.
6. Exécuter **`qx_diagnostic`**, puis lire le journal. On y trouve :
   - les colonnes reconnues ;
   - la répartition du tri ;
   - **les types de RDV présents dans l'agenda.** Vérifier que la consultation implanto y est cochée ✓. Sinon, ajuster `TYPE_CONSULT` (voir plus bas).
7. Ouvrir **Déployer → Gérer les déploiements → Modifier → Nouvelle version**.

> Tant que l'étape 7 n'est pas faite, l'équipe garde l'ancienne version. On peut donc tester tranquillement avec l'URL de test (`/dev`).

---

## Ce que voit qui

| | Direction (contact@) | Équipe (Lisa, Marion, Lucie) |
|---|---|---|
| Nom, téléphone, e-mail, date de réponse | ✓ | ✓ (il faut appeler) |
| Tri et prochaine action | ✓ | ✓ |
| Motif « hors parcours » (pas de dent manquante…) | ✓ | ✓ (il faut réorienter) |
| Motif de l'avis (pathologie / médicaments / tabac) | ✓ | « Avis du Dr requis », sans détail |
| Réponses déclarées (pathologie, médicaments, demande libre…) | ✓ | ✗ |
| Boutons OK consult / Appeler d'abord / Réorienter | ✓ | ✗ |
| Boutons RDV proposé / Injoignable / Réorienté / Clos | ✓ | ✓ |

Le serveur fait ce filtrage. Le détail médical n'arrive jamais dans le navigateur de l'équipe.

---

## Les règles du tri (modifiables en haut de `Questionnaires.gs`, objet `QX`)

Le tri **ne pose aucun diagnostic et ne hiérarchise rien**. Il applique les règles déjà écrites dans le formulaire.

| Tri | Déclenché par | Prochaine action |
|---|---|---|
| **Hors parcours** | Une réponse « STOP » du formulaire : moins de 18 ans, pas de dent manquante, ou « je veux juste une consultation / des soins » | Marion : réorienter vers une consultation générale |
| **Avis du Dr** | **N'importe quelle** déclaration en section 2 : une pathologie autre que « Aucune », des médicaments autres que « non / aucun », du tabac | Dr : OK consult / Appeler d'abord / Réorienter |
| **Parcours standard** | Ni l'un ni l'autre | Marion : proposer la consultation implanto |

Le formulaire ne s'arrête pas sur « STOP » : le patient peut finir de répondre. C'est pour ça que le tri recalcule tout à partir des réponses.

Ensuite, l'étape avance seule :

- **RDV pris :** le nom du patient apparaît dans l'agenda (« NOM Prénom » ou « Prénom NOM », accents ignorés) ;
- **Consultation faite :** le RDV est passé ;
- **Devis / Devis signé / Devis refusé :** le patient apparaît dans Cockpit (onglet Plans) ou dans Transmissions Implanto (onglet Lisa) ;
- **Ancien :** plus de 60 jours sans RDV, devis, décision ni suivi. La réponse sort des listes « À faire ».

**Régler soi-même :**

| Je veux… | Je modifie |
|---|---|
| que le tabac ne déclenche plus l'avis | dans `QX.AVIS`, ligne `tabac` : `actif: false` |
| qu'une réponse « Non merci » aux médicaments ne déclenche rien | la regex `sauf` de la ligne `medicaments` |
| que les appels soient pour Lisa | `QUI_RDV: 'Lisa'` |
| reconnaître le type de RDV Logos de la 1re consultation implanto | `TYPE_CONSULT`, avec les types listés par `qx_diagnostic()` |
| garder les réponses actives plus longtemps | `JOURS_ACTIFS` |

**Cas réels gérés :**

- la ligne 2 de test et les lignes vides sont ignorées ;
- **les réponses envoyées plusieurs fois** par le même patient sont regroupées et la plus récente compte. Le regroupement se fait au même nom, ou au même téléphone / e-mail si les noms concordent. Deux membres d'une famille qui partagent un numéro restent séparés ;
- **les téléphones sont remis au format 06 12 34 56 78.** Cela couvre le zéro perdu quand la cellule est un nombre, un « O » tapé à la place d'un zéro, les points et les espaces ;
- **les deux colonnes « Colonne 1 » :** A est l'horodatage. La colonne T, ajoutée à la main, est ignorée.

---

## Automatismes

- **À chaque nouvelle réponse** classée « Avis du Dr », un e-mail part vers contact@ : « un avis vous attend ». Il ne contient ni nom ni détail médical.
- **Carte « Questionnaires implanto » sur « Aujourd'hui » :** le Dr y voit ses avis à donner et l'équipe ses appels à passer.
- **Bloc « Consultations implanto à venir sans questionnaire » (21 jours) :** le bouton « Copier le message » prépare un texte à coller dans Doctolib, un SMS ou un e-mail, avec le lien du formulaire.

Les décisions et les suivis sont écrits dans le classeur « Questionnaires implanto — suivi (Workspace Hub) ». Il garde la trace de qui a fait quoi et quand. Le classeur des réponses n'est jamais modifié.

---

## Lien avec la plateforme devis

- **Déjà en place (lecture seule) :** le Hub lit Cockpit (`Plans` : `Nom complet patient`, `Statut`, `Date devis`) et Transmissions Implanto (`Lisa` : `Nom complet patient`, `Statut devis`, `Date devis`). Chaque questionnaire affiche donc son devis et son statut. Cela donne le pipeline complet : **questionnaire → tri → RDV → consultation → devis → signé**.
- **Étape suivante possible :** afficher dans la fiche Cockpit un badge « Questionnaire implanto : OK Dr le 12/10 ». Cockpit lirait alors le classeur de suivi du Hub, par le nom. C'est 20 lignes dans `ecran_fiche()`, à faire quand le module aura tourné quelques semaines.

---

## À améliorer dans le formulaire (5 minutes, sans toucher au code)

Les points 1 à 4 sont faits par le script **`formulaire_implanto.gs`**, à lancer avec **`PROMPT_LOCAL_FORMULAIRE.md`** depuis une session Claude locale. Seul le passage des pathologies en cases à cocher reste un clic à la main. Le module gère déjà le résultat : réponses partielles après un STOP, pathologies en cases à cocher.

1. **Faire vraiment s'arrêter les STOP.** Pour les questions dent manquante, implant et âge : **⋮ → Aller à la section en fonction de la réponse**. Envoyer le « NON » vers une section finale « Merci — prenez RDV chez votre dentiste ».
2. **Pathologies en cases à cocher.** Aujourd'hui, la question est à choix unique : un patient qui a deux pathologies ne peut en déclarer qu'une. Le module gère déjà les cases à cocher.
3. **Le message tabac est une réponse.** L'option « ⚠️ Tabagisme > 10 cig/jour… » est un avertissement, pas une réponse : le mettre en description de la question.
4. **Mention d'information RGPD.** La V3 n'en a plus : la V2 contenait « J'accepte d'être recontacté(e) ». Le formulaire recueille des données de santé, donc il faut une mention d'information (finalité, destinataire = le cabinet, durée de conservation, droits) et la case « J'accepte d'être recontacté(e) ». Texte à faire valider par ton conseil.
5. Renommer A « Colonne 1 » en « Horodateur » et T en « Note équipe ». C'est facultatif : le module s'en sort sans.

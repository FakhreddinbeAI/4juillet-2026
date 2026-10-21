/**
 * COCKPIT DEVIS — remplaçant interne de La Fraise · Étape 1 : base + ingestion + lecture
 * ------------------------------------------------------------------------------------
 * cockpit_installer()        crée (une seule fois) le classeur « Cockpit Devis — base » et les dossiers Drive
 * cockpit_ingerer()          lit les devis déposés dans « Devis entrants », crée plans + actes (déclencheur 5 min)
 * cockpit_testDevisFictif()  lit le devis fictif de test et journalise le résultat (n'écrit rien)
 * cockpit_reinitialiser()    remet la base à zéro (phase de test uniquement)
 * cockpit_installerDeclencheur() / cockpit_supprimerDeclencheur()
 *
 * Pensé pour la suite : les colonnes de « Plans » portent les mêmes noms que l'onglet Lisa du classeur
 * Transmissions quand elles ont le même sens, et la correspondance est décrite dans « Paramètres ».
 * La synchro vers le classeur (étape 7) est PRÉSENTE MAIS DÉSACTIVÉE : COCKPIT_CFG.synchroClasseur = false.
 * Bloc DPEC : tout ce que les portails mutuelles demandent, SAUF n° de Sécurité sociale et date de naissance,
 * qui ne sont jamais stockés et sont relus à la demande dans le PDF (cockpit_identiteDPEC_).
 */

var COCKPIT_CFG = {
  nomBase: 'Cockpit Devis — base',
  nomDossierRacine: 'Cockpit Devis',
  devisFictifId: '1g8lSA5_4Bmyeckr_fd_zCH7y9TPJ5nbh',   // devis-01-implant-15.txt (patient fictif)
  classeurId: '1ZNutOD1xstRfXWslXduR4OGusxcW2Eq05iynA6juXYU',
  synchroClasseur: false,                                 // remplacé par la propriété SYNCHRO_LISA (Relances.gs)
  classeurAutresId: '1kQyAve0QEr4tou_xGV6d6UG3zwvRL7dE5DQ-yiKYZ1k',   // Transmissions devis — Autres devis
  fuseau: 'Europe/Paris',

  // Onglets et colonnes. Les noms marqués ★ sont identiques aux en-têtes de Lisa (synchro future par NOM).
  onglets: {
    'Plans': ['ID dossier ★', 'Nom complet patient ★', 'ID Logos ★', 'Type de devis / traitement ★', 'Date devis ★',
              'Montant devis ★', 'Base Sécu', 'Remb. AMO', 'Reste à charge avant mutuelle', 'Remb. mutuelle (AMC)',
              'Reste à charge total ★', 'Statut', 'Action prioritaire', 'Validé pour envoi', 'Date d\'envoi',
              'Nb d\'ouvertures', '1re lecture', 'Dernière lecture', 'Décision', 'Motif de refus', 'Signé le',
              'Pièces reçues', 'Relance 1', 'Relance 2', 'Prénom', 'E-mail', 'Téléphone', 'WhatsApp', 'Validité', 'Description',
              // --- bloc prise en charge mutuelle (DPEC) : ce que les portails demandent, hors identité sensible
              'Statut PEC', 'Plateforme PEC', 'Organisme complémentaire', 'N° adhérent', 'N° contrat',
              'Réf. dossier PEC', 'Date demande PEC', 'Date réponse PEC',
              'RPPS praticien', 'ADELI praticien', 'Lieu de fabrication', 'Sous-traitance', 'Lieu sous-traitance',
              // --- technique
              'Contrôle lecture', 'Alertes lecture', 'Jeton patient', 'Dossier Drive', 'PDF du devis', 'Créé le',
              'Synchro classeur',
              // --- relances J7 / J15 / J30 (Relances.gs) : ajoutées à la fin pour ne pas décaler les colonnes existantes
              'Relance 3', 'Réponse patient'],
    'Actes': ['ID dossier', 'N° traitement', 'Dent', 'Code', 'Libellé', 'Honoraires', 'Honoraires limite',
              'Base Sécu', 'Remb. AMO', 'Non remboursé AMO', 'Reste à charge', 'Matériau', 'Matériau (libellé)',
              'Panier', 'Panier (libellé)', 'Remb. AMC accordé', 'Reste à charge final'],
    'Journal': ['Horodatage', 'ID dossier', 'Acteur', 'Action', 'Détail'],
    'Paramètres': ['Clé', 'Valeur', 'Commentaire']
  },
  statuts: ['Dossier à traiter', 'Devis envoyé', 'Devis envoyé et lu', 'Devis signé', 'En attente', 'Premier RDV pris',
            'Traitement en cours', 'Traitement posé et payé', 'Traitement terminé', 'Décliné', 'Archivé'],
  statutsPEC: ['À demander', 'Demandée', 'Accordée', 'Refusée', 'Patient autonome'],
  plateformesPEC: ['Santéclair', 'Kalixia / Viamedis', 'Almerys', 'Itelis', 'Carte Blanche', 'Sévéane', 'iSanté',
                   'E-mail à la mutuelle', 'Autre'],
  actionsParStatut: {
    'Dossier à traiter': 'Vérifier et valider l\'envoi', 'Devis envoyé': 'Attendre lecture / relancer',
    'Devis envoyé et lu': 'Relancer la signature', 'Devis signé': 'Transmettre à Lisa',
    'En attente': 'Dossier en attente (choix du patient)', 'Premier RDV pris': 'Finaliser la signature des documents',
    'Traitement en cours': 'Suivre le traitement', 'Traitement posé et payé': 'Archiver',
    'Traitement terminé': 'Archiver', 'Décliné': '—', 'Archivé': '—'
  }
};

/* ============================ INSTALLATION ============================ */

function cockpit_installer() {
  var P = PropertiesService.getScriptProperties();
  var racine = cockpit_dossier_(P, 'DOSSIER_RACINE', COCKPIT_CFG.nomDossierRacine, DriveApp.getRootFolder());
  var entrants = cockpit_dossier_(P, 'DOSSIER_ENTRANTS', 'Devis entrants', racine);
  var traites = cockpit_dossier_(P, 'DOSSIER_PATIENTS', 'Dossiers patients', racine);
  cockpit_dossier_(P, 'DOSSIER_ERREURS', 'Devis illisibles', racine);

  var ss;
  if (P.getProperty('BASE_ID')) ss = SpreadsheetApp.openById(P.getProperty('BASE_ID'));
  else {
    ss = SpreadsheetApp.create(COCKPIT_CFG.nomBase);
    DriveApp.getFileById(ss.getId()).moveTo(racine);
    P.setProperty('BASE_ID', ss.getId());
  }
  Object.keys(COCKPIT_CFG.onglets).forEach(function (nom, i) {
    var sh = ss.getSheetByName(nom) || ss.insertSheet(nom, i);
    var ent = COCKPIT_CFG.onglets[nom].map(function (h) { return h.replace(' ★', ''); });
    if (sh.getMaxColumns() < ent.length) sh.insertColumnsAfter(sh.getMaxColumns(), ent.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, ent.length).setValues([ent]).setFontWeight('bold').setBackground('#E8EEF5').setWrap(true);
    sh.setFrozenRows(1);
  });
  var defaut = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
  if (defaut && ss.getSheets().length > 1) ss.deleteSheet(defaut);

  // Statut, Statut PEC et Plateforme PEC en menus déroulants
  var plans = ss.getSheetByName('Plans');
  [['Statut', COCKPIT_CFG.statuts], ['Statut PEC', COCKPIT_CFG.statutsPEC], ['Plateforme PEC', COCKPIT_CFG.plateformesPEC]].forEach(function (x) {
    var c = COCKPIT_CFG.onglets.Plans.indexOf(x[0]) + 1;
    plans.getRange(2, c, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(x[1], true).build());
  });

  // Paramètres : correspondance future avec Lisa (★ = même nom de colonne)
  var par = ss.getSheetByName('Paramètres');
  if (par.getLastRow() < 2) {
    var lignes = [['BASE_ID', ss.getId(), 'ce classeur'],
                  ['DOSSIER_ENTRANTS', entrants.getId(), 'déposer ici les devis PDF imprimés depuis Logos'],
                  ['DOSSIER_PATIENTS', traites.getId(), 'un sous-dossier par patient après lecture'],
                  ['CLASSEUR_TRANSMISSIONS', COCKPIT_CFG.classeurId, 'cible de la synchro (étape 7, désactivée)']];
    COCKPIT_CFG.onglets.Plans.forEach(function (h) {
      if (/★/.test(h)) lignes.push(['SYNCHRO → Lisa', h.replace(' ★', ''), 'même nom de colonne dans Lisa']);
    });
    par.getRange(2, 1, lignes.length, 3).setValues(lignes);
  }
  cockpit_journal_(ss, '', 'système', 'Installation', 'base ' + ss.getUrl());
  Logger.log('Base : ' + ss.getUrl());
  Logger.log('Déposer les devis dans : ' + entrants.getUrl());
}

function cockpit_dossier_(P, cle, nom, parent) {
  var id = P.getProperty(cle);
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = parent.getFoldersByName(nom), d = it.hasNext() ? it.next() : parent.createFolder(nom);
  P.setProperty(cle, d.getId());
  return d;
}

var COCKPIT_BASE_VERIFIEE_ = false;
function cockpit_base_() {
  var id = PropertiesService.getScriptProperties().getProperty('BASE_ID');
  if (!id) throw new Error('Base absente : lancer cockpit_installer() d\'abord.');
  var ss = SpreadsheetApp.openById(id);
  if (!COCKPIT_BASE_VERIFIEE_) {   // colonnes ajoutées en fin de « Plans » (relances) : la feuille doit être assez large
    COCKPIT_BASE_VERIFIEE_ = true;
    var plans = ss.getSheetByName('Plans'), n = COCKPIT_CFG.onglets.Plans.length;
    if (plans && plans.getMaxColumns() < n) plans.insertColumnsAfter(plans.getMaxColumns(), n - plans.getMaxColumns());
  }
  return ss;
}

/* ============================ INGESTION ============================ */

function cockpit_ingerer() {
  var verrou = LockService.getScriptLock();
  if (!verrou.tryLock(20000)) return;
  try {
    var P = PropertiesService.getScriptProperties(), ss = cockpit_base_();
    var entrants = DriveApp.getFolderById(P.getProperty('DOSSIER_ENTRANTS'));
    var patients = DriveApp.getFolderById(P.getProperty('DOSSIER_PATIENTS'));
    var erreurs = DriveApp.getFolderById(P.getProperty('DOSSIER_ERREURS'));
    var fichiers = entrants.getFiles(), n = 0;
    while (fichiers.hasNext()) {
      var f = fichiers.next();
      try {
        var plan = lecteur_lire(cockpit_texte_(f));
        if (!plan.idDossier || !plan.actes.length) throw new Error(plan.alertes.join(' ; '));
        if (cockpit_ligneDuDossier_(ss, plan.idDossier)) {
          cockpit_journal_(ss, plan.idDossier, 'système', 'Doublon ignoré', f.getName());
          f.moveTo(erreurs); continue;
        }
        var dossier = patients.createFolder(plan.idDossier + ' — ' + (plan.nomComplet || 'patient'));
        f.moveTo(dossier);
        cockpit_ecrirePlan_(ss, plan, f, dossier);
        cockpit_journal_(ss, plan.idDossier, 'système', 'Devis lu', plan.actes.length + ' actes · ' + plan.montant + ' € · ' + plan.controle);
        n++;
      } catch (err) {
        f.moveTo(erreurs);
        cockpit_journal_(ss, '', 'système', 'Devis illisible', f.getName() + ' : ' + (err.message || err));
      }
    }
    if (n) Logger.log(n + ' devis lus.');
  } finally { verrou.releaseLock(); }
}

/** Texte d'un fichier : .txt direct ; PDF converti par Drive (copie Google Docs temporaire, supprimée ensuite). */
function cockpit_texte_(f) {
  var type = f.getMimeType();
  if (type === MimeType.PLAIN_TEXT) return f.getBlob().getDataAsString('UTF-8');
  if (type !== MimeType.PDF) throw new Error('format non pris en charge : ' + type);
  var limite = '-------cockpit' + Date.now();
  var meta = JSON.stringify({ name: 'tmp-cockpit-' + f.getName(), mimeType: 'application/vnd.google-apps.document' });
  var corps = Utilities.newBlob('--' + limite + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta +
      '\r\n--' + limite + '\r\nContent-Type: application/pdf\r\n\r\n').getBytes()
    .concat(f.getBlob().getBytes())
    .concat(Utilities.newBlob('\r\n--' + limite + '--').getBytes());
  var rep = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&ocrLanguage=fr', {
    method: 'post', contentType: 'multipart/related; boundary=' + limite, payload: corps,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  if (rep.getResponseCode() >= 300) throw new Error('conversion PDF refusée : ' + rep.getContentText().slice(0, 200));
  var id = JSON.parse(rep.getContentText()).id;
  try { return DocumentApp.openById(id).getBody().getText(); }
  finally { DriveApp.getFileById(id).setTrashed(true); }
}

function cockpit_ecrirePlan_(ss, plan, fichier, dossier) {
  var H = COCKPIT_CFG.onglets.Plans.map(function (h) { return h.replace(' ★', ''); });
  var v = {
    'ID dossier': plan.idDossier, 'Nom complet patient': plan.nomComplet, 'ID Logos': plan.idLogos,
    'Type de devis / traitement': plan.type, 'Date devis': plan.dateDevis, 'Montant devis': plan.montant,
    'Base Sécu': plan.base, 'Remb. AMO': plan.amo, 'Reste à charge avant mutuelle': plan.resteACharge,
    'Statut': 'Dossier à traiter', 'Action prioritaire': COCKPIT_CFG.actionsParStatut['Dossier à traiter'],
    'Validé pour envoi': false, 'Nb d\'ouvertures': 0, 'Prénom': plan.prenom, 'E-mail': plan.email,
    'Téléphone': plan.telephone, 'WhatsApp': plan.telephoneIntl ? 'https://wa.me/' + plan.telephoneIntl : '',
    'Validité': plan.validite, 'Description': plan.description,
    'Statut PEC': 'À demander', 'RPPS praticien': plan.rpps, 'ADELI praticien': plan.adeli,
    'Lieu de fabrication': plan.lieuFabrication, 'Sous-traitance': plan.sousTraitance,
    'Lieu sous-traitance': plan.lieuSousTraitance,
    'Contrôle lecture': plan.controle, 'Alertes lecture': plan.alertes.join(' ; '),
    'Jeton patient': Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8),
    'Dossier Drive': dossier.getUrl(), 'PDF du devis': fichier.getUrl(),
    'Créé le': Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy HH:mm')
  };
  if (plan.coordonneesManquantes.length) v['Action prioritaire'] = 'Compléter ' + plan.coordonneesManquantes.join(' et ') + ' (absent du devis Logos)';
  var plans = ss.getSheetByName('Plans'), r = cockpit_prochaineLigne_(plans);
  plans.getRange(r, H.indexOf('Téléphone') + 1).setNumberFormat('@');   // garde le 0 initial
  ['Date devis', 'Validité', 'Téléphone'].forEach(function (h) { plans.getRange(r, H.indexOf(h) + 1).setNumberFormat('@'); });  // pas de conversion auto en date
  plans.getRange(r, 1, 1, H.length).setValues([H.map(function (h) { return v[h] === undefined ? '' : v[h]; })]);
  // reste à charge total = avant mutuelle − mutuelle (formule, recalculée quand Lisa saisit l'AMC)
  var c = function (h) { return H.indexOf(h) + 1; };
  var a1 = function (h) { return plans.getRange(r, c(h)).getA1Notation(); };
  plans.getRange(r, c('Reste à charge total')).setFormula('=' + a1('Reste à charge avant mutuelle') + '-N(' + a1('Remb. mutuelle (AMC)') + ')');
  plans.getRange(r, c('Validé pour envoi')).insertCheckboxes().uncheck();
  var actes = ss.getSheetByName('Actes'), r0 = cockpit_prochaineLigne_(actes);
  var lignes = plan.actes.map(function (x) {
    return [plan.idDossier, x.traitement, x.dent, x.code, x.libelle, x.honoraires, x.honorairesLimite,
            x.base === null ? 'NR' : x.base, x.amo, x.nonRembourse, x.resteACharge, x.materiau || '',
            x.materiauLibelle || '', x.panier || '', x.panierLibelle || '', '', ''];
  });
  if (!lignes.length) return;
  var HA0 = COCKPIT_CFG.onglets.Actes;
  ['Dent', 'Matériau', 'Panier'].forEach(function (h) { actes.getRange(r0, HA0.indexOf(h) + 1, lignes.length, 1).setNumberFormat('@'); });  // « 2 5 6 » n'est pas une date
  actes.getRange(r0, 1, lignes.length, lignes[0].length).setValues(lignes);
  // reste à charge final par acte = reste à charge − AMC accordé (saisi à réception de la prise en charge)
  var HA = COCKPIT_CFG.onglets.Actes, ca = function (h) { return HA.indexOf(h) + 1; };
  for (var k = 0; k < lignes.length; k++) {
    var rr = r0 + k, rac = actes.getRange(rr, ca('Reste à charge')).getA1Notation(), amc = actes.getRange(rr, ca('Remb. AMC accordé')).getA1Notation();
    actes.getRange(rr, ca('Reste à charge final')).setFormula('=' + rac + '-N(' + amc + ')');
  }
}

/** Première ligne libre d'après la colonne A (les cases à cocher ne comptent pas). */
function cockpit_prochaineLigne_(sh) {
  var col = sh.getRange('A2:A').getValues(), dernier = 1;
  for (var i = 0; i < col.length; i++) if (String(col[i][0]) !== '') dernier = i + 2;
  return dernier + 1;
}

/**
 * Identité pour la DPEC, lue À LA DEMANDE dans le PDF du devis (dossier Drive du patient) et JAMAIS écrite
 * dans la base : n° de Sécurité sociale et date de naissance. Réservée au futur assistant de remplissage des portails.
 */
function cockpit_identiteDPEC_(idDossier) {
  var ss = cockpit_base_(), r = cockpit_ligneDuDossier_(ss, idDossier);
  if (!r) throw new Error('dossier inconnu : ' + idDossier);
  var H = COCKPIT_CFG.onglets.Plans.map(function (h) { return h.replace(' ★', ''); });
  var url = ss.getSheetByName('Plans').getRange(r, H.indexOf('PDF du devis') + 1).getValue();
  var t = cockpit_texte_(DriveApp.getFileById(String(url).match(/[-\w]{25,}/)[0]));
  var nir = t.match(/s[ée]curit[ée]\s+sociale\s+du\s+patient\s*:\s*([12](?:\s?\d){12,14})/i);
  var ddn = t.match(/Date\s+de\s+naissance\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
  return { nir: nir ? nir[1].replace(/\s/g, '') : '', dateNaissance: ddn ? ddn[1] : '' };
}

/** Remet la base à zéro (en-têtes réécrits, données effacées) : uniquement pendant la phase de test. */
function cockpit_reinitialiser() {
  var ss = cockpit_base_();
  ['Plans', 'Actes'].forEach(function (nom) {
    var sh = ss.getSheetByName(nom);
    if (sh.getMaxRows() > 1) { sh.getRange(2, 1, sh.getMaxRows() - 1, sh.getMaxColumns()).clearContent().clearDataValidations(); }
    sh.getRange(1, 1, 1, sh.getMaxColumns()).clearContent();
  });
  cockpit_installer();
  cockpit_journal_(ss, '', 'système', 'Réinitialisation', 'base remise à zéro (phase de test)');
  Logger.log('Base remise à zéro.');
}

function cockpit_ligneDuDossier_(ss, id) {
  var col = ss.getSheetByName('Plans').getRange('A2:A').getValues();
  for (var i = 0; i < col.length; i++) if (String(col[i][0]) === String(id)) return i + 2;
  return 0;
}

function cockpit_journal_(ss, id, acteur, action, detail) {
  ss.getSheetByName('Journal').appendRow([Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy HH:mm:ss'), id, acteur, action, detail]);
}

/* ============================ TESTS ============================ */

/** Lit le devis fictif et affiche le résultat. N'écrit rien dans la base. */
function cockpit_testDevisFictif() {
  var p = lecteur_lire(DriveApp.getFileById(COCKPIT_CFG.devisFictifId).getBlob().getDataAsString('UTF-8'));
  Logger.log(p.idDossier + ' · ' + p.nomComplet + ' · ' + p.type + ' · ' + p.actes.length + ' actes · montant ' + p.montant +
             ' · AMO ' + p.amo + ' · RAC ' + p.resteACharge + ' · contrôle ' + p.controle + ' ' + p.alertes.join(' ; '));
  p.actes.forEach(function (a) { Logger.log('  ' + a.dent + ' ' + a.code + ' ' + a.libelle + ' · ' + a.honoraires + ' · AMO ' + a.amo + ' · RAC ' + a.resteACharge); });
}

/** Copie le devis fictif dans « Devis entrants » puis lance l'ingestion : test de bout en bout. */
function cockpit_testIngestion() {
  var P = PropertiesService.getScriptProperties();
  DriveApp.getFileById(COCKPIT_CFG.devisFictifId).makeCopy('TEST devis fictif.txt', DriveApp.getFolderById(P.getProperty('DOSSIER_ENTRANTS')));
  cockpit_ingerer();
  Logger.log('Voir la base : ' + cockpit_base_().getUrl());
}

/* ============================ DÉCLENCHEUR ============================ */

function cockpit_installerDeclencheur() {
  cockpit_supprimerDeclencheur();
  ScriptApp.newTrigger('cockpit_ingerer').timeBased().everyMinutes(5).create();
  Logger.log('Ingestion automatique toutes les 5 minutes.');
}
function cockpit_supprimerDeclencheur() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'cockpit_ingerer') ScriptApp.deleteTrigger(t); });
}

/* ============================ ÉTAPE 7 — SYNCHRO CLASSEUR (désactivée) ============================ */

/** Rend, pour un plan, les valeurs à pousser dans Lisa (colonnes ★, par NOM). N'écrit rien tant que synchroClasseur = false. */
function cockpit_versLisa_(ligneObjet) {
  var out = {};
  COCKPIT_CFG.onglets.Plans.forEach(function (h) { if (/★/.test(h)) { var k = h.replace(' ★', ''); out[k] = ligneObjet[k]; } });
  return out;
}

/* ============================ LECTEUR DE DEVIS ============================ */
/**
 * LECTEUR — lit le texte d'un devis Logos (CERFA « entente directe ») et rend un objet plan.
 * Pur : aucune dépendance Google, testable hors ligne.
 * Ne retient JAMAIS le n° de Sécurité sociale ni la date de naissance.
 */

var LECTEUR_RE = {
  numero: /D\s?e\s?v\s?i\s?s\s+(\d{3,7})\s*-\s*(\d{3,7})/,
  nom: /Nom\s+et\s+pr[ée]nom\s*:[ \t]*([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ' -]*?)[ \t]+([A-ZÀ-ÖØ-Þ][^\n]*?)(?:[ \t]{3,}|[ \t]*$)/m,
  dateDevis: /Date\s+du\s+devis\s*:\s*(\d{2}\/\d{2}\/\d{4})/,
  validite: /Valable\s+jusqu.{0,4}au[^:]*:\s*(\d{2}\/\d{2}\/\d{4})/,
  mail: /Mail[ \t]*:[ \t]*([^\s@]+@[^\s@]+\.[a-z]{2,})/i,
  tel: /T[ée]l[ée]phone[ \t]*:[ \t]*((?:\d{2}[ .]?){4}\d{2})/,
  description: /Description\s+du\s+traitement\s+propos[ée]\s*:\s*(.+?)(?:\s{3,}|$)/m,
  rpps: /RPPS\s*:\s*(\d{11})/,
  // ligne d'acte : n° traitement, dent(s) facultatives, code CCAM (espaces parasites tolérés) ou HN, reste
  acte: /^\s*(\d{1,2})\s+((?:\d{2}(?:\s*[-,à]\s*\d{2})?\s+)*)([A-Z]\s?[A-Z]\s?[A-Z]\s?[A-Z]\s?\d{3}|HN)\s+(.*)$/,
  montant: /\d{1,3}(?: \d{3})*,\d{2}|\bNR\b|(?:^|\s)0(?=\s|$)/g
};

var LECTEUR_MATERIAUX = { '1': 'Alliage précieux', '2': 'Alliage non précieux', '3': 'Céramo-céramique',
  '4': 'Céramique céramométallique', '5': 'Polymères de base', '6': 'Dents artificielles' };
var LECTEUR_PANIERS = { '1': '100% Santé', '2': 'Modéré', '3': 'Libre', '4': 'CSS' };

/** Cases cochées du lieu de fabrication (🗹 / þ / ☑ = cochée ; ◻ / ¨ / ☐ = vide). */
function lecteur_fabrication_(t) {
  var COCHE = '(?:🗹|þ|☑|☒)';
  var UE = 'au sein de l.Union Europ[ée]enne', HUE = 'hors Union Europ[ée]enne';
  var lignes = t.split('\n'), res = { lieu: '', sousTraitance: '', lieuSousTraitance: '' };
  var quel = function (txt) {
    var m = txt.match(new RegExp(COCHE + '\\s*(' + UE + '|' + HUE + ')', 'i'));
    return m ? (/hors/i.test(m[1]) ? 'Hors UE' : 'UE') : '';
  };
  for (var i = 0; i < lignes.length; i++) {
    var L = lignes[i];
    if (!res.lieu && /L\s?i\s?e\s?u\s+de\s+fabrication/i.test(L)) res.lieu = quel(L);   // la notice reprend la formule : 1re occurrence seulement
    if (/sous\s*trait/i.test(L) && /fabricant/i.test(L)) {
      if (new RegExp(COCHE + '\\s*sans sous', 'i').test(L)) res.sousTraitance = 'Non';
      else if (new RegExp(COCHE + '\\s*avec', 'i').test(L)) { res.sousTraitance = 'Oui'; res.lieuSousTraitance = quel(L.replace(/^.*sous trait[ée]e\s*:/i, '')); }
    }
  }
  return res;
}

function lecteur_nombre_(s) {
  if (s == null) return null;
  s = String(s).trim();
  if (s === 'NR') return null;
  return Math.round(parseFloat(s.replace(/\s/g, '').replace(',', '.')) * 100) / 100;
}

/** Sépare libellé et colonnes chiffrées en fin de ligne. */
function lecteur_queue_(reste) {
  // on cherche la plus longue suite de montants en fin de ligne
  var toks = [], m, re = new RegExp(LECTEUR_RE.montant.source, 'g');
  var positions = [];
  while ((m = re.exec(reste)) !== null) positions.push({ v: m[0].trim(), i: m.index, fin: m.index + m[0].length });
  // garder la suite finale contiguë (séparée seulement par des espaces)
  var suite = [];
  for (var k = positions.length - 1; k >= 0; k--) {
    var p = positions[k];
    var apres = suite.length ? suite[0].i : reste.length;
    if (/^\s*$/.test(reste.slice(p.fin, apres))) suite.unshift(p); else break;
  }
  if (suite.length < 4) return null;
  toks = suite.map(function (p) { return p.v; });
  var libelle = reste.slice(0, suite[0].i).trim();
  return { toks: toks, libelle: libelle };
}

/** Texte brut du devis → plan. */
function lecteur_lire(texte) {
  var t = String(texte || '').replace(/\r/g, '');
  var R = LECTEUR_RE, plan = { alertes: [] };
  var num = t.match(R.numero);
  if (num) { plan.idLogos = num[1]; plan.numeroDevis = num[1] + '-' + num[2]; plan.idDossier = plan.numeroDevis; }
  else plan.alertes.push('numéro de devis introuvable');
  var nm = t.match(R.nom);
  if (nm) { plan.nom = nm[1].trim().replace(/\s+/g, ' '); plan.prenom = nm[2].trim(); plan.nomComplet = plan.nom + ' ' + plan.prenom; }
  else plan.alertes.push('nom du patient introuvable');
  var g = function (re) { var x = t.match(re); return x ? x[1].trim() : ''; };
  plan.dateDevis = g(R.dateDevis);
  plan.validite = g(R.validite);
  plan.email = g(R.mail);
  plan.email = plan.email.toLowerCase();
  var tel = g(R.tel).replace(/[ .]/g, '');
  plan.telephone = tel ? tel.replace(/(\d{2})(?=\d)/g, '$1 ') : '';            // 06 40 75 64 95
  plan.telephoneIntl = /^0[1-9]\d{8}$/.test(tel) ? '33' + tel.slice(1) : '';  // 33640756495 (lien WhatsApp)
  plan.coordonneesManquantes = [plan.email ? '' : 'e-mail', tel ? '' : 'téléphone'].filter(String);
  plan.description = g(R.description);
  plan.rpps = g(R.rpps);
  plan.adeli = g(/ADELI\s*:\s*(\d{9})/);
  var fab = lecteur_fabrication_(t);
  plan.lieuFabrication = fab.lieu; plan.sousTraitance = fab.sousTraitance; plan.lieuSousTraitance = fab.lieuSousTraitance;

  // actes
  var lignes = t.split('\n'), actes = [], dernier = null, totaux = null;
  for (var i = 0; i < lignes.length; i++) {
    var L = lignes[i];
    var a = L.match(R.acte);
    if (a) {
      var q = lecteur_queue_(a[4]);
      if (!q) { plan.alertes.push('ligne d\'acte illisible : ' + L.trim().slice(0, 80)); dernier = null; continue; }
      var v = q.toks, n = v.length;
      var acte = {
        traitement: Number(a[1]),
        dent: a[2].trim().replace(/\s+/g, ' ') || '',
        code: a[3].replace(/\s/g, ''),
        libelle: q.libelle.replace(/\s{2,}.*$/, '').trim(),   // les colonnes matériaux/panier sont après de grands blancs
        honoraires: lecteur_nombre_(v[n - 5]),
        honorairesLimite: n >= 6 ? lecteur_nombre_(v[n - 6]) : null,
        base: lecteur_nombre_(v[n - 4]),
        amo: lecteur_nombre_(v[n - 3]) || 0,
        nonRembourse: lecteur_nombre_(v[n - 2]),
        resteACharge: lecteur_nombre_(v[n - 1])
      };
      var mp = q.libelle.match(/\s{2,}(\d)\s+(\d)\s/);   // matériau + panier quand présents
      if (mp) { acte.materiau = mp[1]; acte.panier = mp[2]; }
      actes.push(acte); dernier = acte; continue;
    }
    // ligne de total : uniquement des montants, juste après les actes
    if (actes.length && !totaux && /^\s*(?:\d{1,3}(?: \d{3})*,\d{2}\s+){3,}/.test(L) && !/[A-Za-z]/.test(L)) {
      var tq = lecteur_queue_(' ' + L.trim());
      if (tq) {
        var tv = tq.toks, tn = tv.length;
        totaux = { honoraires: lecteur_nombre_(tv[0]), base: lecteur_nombre_(tv[tn - 4]),
                   amo: lecteur_nombre_(tv[tn - 3]) || 0, resteACharge: lecteur_nombre_(tv[tn - 1]) };
      }
      dernier = null; continue;
    }
    // suite de libellé sur la ligne suivante
    if (dernier && /^\s{4,}\S/.test(L) && !/\d,\d{2}/.test(L) && L.trim().length < 60) {
      dernier.libelle += ' ' + L.trim(); dernier = null;
    }
  }
  if (!actes.length) { var flux = lecteur_flux_(t); actes = flux.actes; totaux = flux.totaux; plan.alertes = plan.alertes.concat(flux.alertes); }
  plan.actes = actes;
  var somme = function (k) { return Math.round(actes.reduce(function (s, x) { return s + (x[k] || 0); }, 0) * 100) / 100; };
  plan.montant = somme('honoraires');
  plan.base = somme('base');
  plan.amo = somme('amo');
  plan.resteACharge = somme('resteACharge');
  if (!actes.length) plan.alertes.push('aucun acte lu');
  if (totaux) {
    ['honoraires:montant', 'amo:amo', 'resteACharge:resteACharge'].forEach(function (c) {
      var p = c.split(':');
      if (Math.abs((totaux[p[0]] || 0) - plan[p[1]]) > 0.01) plan.alertes.push('écart total ' + p[0] + ' : ligne total ' + totaux[p[0]] + ' / somme des actes ' + plan[p[1]]);
    });
  } else if (actes.length) plan.alertes.push('ligne de total introuvable (contrôle impossible)');
  actes.forEach(function (a) {
    a.materiauLibelle = String(a.materiau || '').split(/\s+/).map(function (c) { return LECTEUR_MATERIAUX[c] || ''; }).filter(String).join(' + ');
    a.panierLibelle = LECTEUR_PANIERS[a.panier] || '';
  });
  plan.type = lecteur_type_(actes);
  plan.controle = plan.alertes.length ? 'À VÉRIFIER' : 'OK';
  return plan;
}

/** Mode « une valeur par ligne » : texte d'un PDF converti par Google Drive. */
function lecteur_flux_(t) {
  var tok = t.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return x; });
  var VAL = /^(Aucun|NR|0|\d{1,3}(?: \d{3})*,\d{2})$/, CODE = /^([A-Z]\s?){4}\d{3}$|^HN$/, DENTS = /^\d{2}(?:\s*[-à,]?\s*\d{2})*$/;
  var out = { actes: [], totaux: null, alertes: [] }, i = 0;
  while (i < tok.length && !/^Reste\s+à\s+charge$/i.test(tok[i])) i++;
  if (i >= tok.length) { out.alertes.push('tableau des actes introuvable'); return out; }
  i++;
  while (i < tok.length && !/^TOTAL/.test(tok[i])) {
    if (!/^\d{1,2}$/.test(tok[i])) { out.alertes.push('lecture interrompue sur « ' + tok[i].slice(0, 40) + ' »'); break; }
    var a = { traitement: Number(tok[i++]), dent: '' };
    var dents = [];
    while (i < tok.length && !CODE.test(tok[i]) && DENTS.test(tok[i]) && dents.length < 3) dents.push(tok[i++]);
    if (!CODE.test(tok[i] || '')) { out.alertes.push('code CCAM introuvable après le traitement ' + a.traitement); break; }
    a.dent = dents.join(' '); a.code = tok[i++].replace(/\s/g, '');
    var lib = [];
    while (i < tok.length && /[A-Za-zÀ-ÿ]/.test(tok[i]) && !VAL.test(tok[i])) lib.push(tok[i++]);
    a.libelle = lib.join(' ');
    var chiffres = [];
    while (i < tok.length && /^\d(\s+\d)*$/.test(tok[i]) && !VAL.test(tok[i])) chiffres.push(tok[i++]);
    if (chiffres.length) a.materiau = chiffres[0];
    if (chiffres.length > 1) a.panier = chiffres[1];
    var v = [];
    while (i < tok.length && VAL.test(tok[i]) && v.length < 6) v.push(tok[i++]);
    if (v.length < 5) { out.alertes.push('montants incomplets pour ' + a.code); break; }
    var n = v.length;
    a.honorairesLimite = n === 6 && v[0] !== 'Aucun' ? lecteur_nombre_(v[0]) : null;
    a.honoraires = lecteur_nombre_(v[n - 5]);
    a.base = lecteur_nombre_(v[n - 4]);
    a.amo = lecteur_nombre_(v[n - 3]) || 0;
    a.nonRembourse = lecteur_nombre_(v[n - 2]);
    a.resteACharge = lecteur_nombre_(v[n - 1]);
    out.actes.push(a);
  }
  if (/^TOTAL/.test(tok[i] || '')) {
    var tv = [];
    i++;
    while (i < tok.length && VAL.test(tok[i]) && tv.length < 6) tv.push(tok[i++]);
    var tn = tv.length;
    if (tn >= 4) out.totaux = { honoraires: lecteur_nombre_(tv[0]), amo: lecteur_nombre_(tv[tn - 3]) || 0, resteACharge: lecteur_nombre_(tv[tn - 1]) };
  }
  return out;
}

/** Type de traitement, mêmes libellés que la colonne « Type » de Lisa. */
function lecteur_type_(actes) {
  var f = {};
  actes.forEach(function (a) {
    var l = (a.libelle || '').toLowerCase(), c = a.code;
    if (/implant/.test(l) || /^LBLD0[0-9]{2}$/.test(c)) f.implanto = 1;
    else if (/compl[eè]te/.test(l)) f.complete = 1;
    else if (/amovible|adjointe|partielle|stellite|ch[aâ]ssis|r[ée]sine.*dent/.test(l)) f.partielle = 1;
    else if (/couronne|bridge|inlay|onlay|facette/.test(l)) f.couronne = 1;
  });
  var k = Object.keys(f);
  if (k.length > 1) return 'Plan de traitement complet';
  return { implanto: 'Implanto', complete: 'Prothèse complète', partielle: 'Prothèse partielle', couronne: 'Couronne' }[k[0]] || 'Autre';
}

/* ============================ ÉTAPE 2 — ÉCRAN ÉQUIPE (application web) ============================ */
/**
 * doGet()            ouvre l'écran équipe (liste de travail + fiche plan)
 * ecran_*            fonctions appelées par l'écran (lecture / mise à jour / envoi)
 * Envoi : MODE_ENVOI = 'TEST' (défaut) → tous les mails partent vers DEST_TEST (toi), jamais au patient.
 *         Passer en réel : propriété du script MODE_ENVOI = 'REEL' (une fois la marche en parallèle validée).
 */

var ECRAN_EDITABLES = ['Prénom', 'E-mail', 'Téléphone', 'Statut PEC', 'Plateforme PEC', 'Organisme complémentaire',
  'N° adhérent', 'N° contrat', 'Réf. dossier PEC', 'Date demande PEC', 'Date réponse PEC', 'Motif de refus',
  'Décision', 'Pièces reçues'];
var ECRAN_NOTES = ['WhatsApp ouvert', 'Appel patient', 'Note'];
var CABINET = { nom: 'Cabinet d\'Implantologie de Legé', adresse: '1 rue de Chambord, 44650 Legé' };

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Ecran').setTitle('Cockpit Devis')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function ecran_H_() { return COCKPIT_CFG.onglets.Plans.map(function (h) { return h.replace(' ★', ''); }); }
function ecran_val_(x) {
  if (x instanceof Date) return Utilities.formatDate(x, COCKPIT_CFG.fuseau, (x.getHours() || x.getMinutes()) ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
  return x;
}
function ecran_obj_(H, row) { var o = {}; H.forEach(function (h, i) { o[h] = ecran_val_(row[i]); }); return o; }
function ecran_mode_() {
  var P = PropertiesService.getScriptProperties();
  return { mode: P.getProperty('MODE_ENVOI') || 'TEST', testDest: P.getProperty('DEST_TEST') || Session.getEffectiveUser().getEmail() };
}
function ecran_acteur_() { return Session.getActiveUser().getEmail() || 'équipe'; }
function ecran_verrou_() { var l = LockService.getScriptLock(); l.waitLock(20000); return l; }
function ecran_eur_(n) {
  n = Math.round((Number(n) || 0) * 100) / 100;
  var p = n.toFixed(2).split('.');
  return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + p[1] + ' €';
}
function ecran_manque_(o) { return [o['E-mail'] ? '' : 'e-mail', o['Téléphone'] ? '' : 'téléphone'].filter(String); }

/** Action prioritaire recalculée après chaque changement. */
function ecran_action_(sh, H, r) {
  var o = ecran_obj_(H, sh.getRange(r, 1, 1, H.length).getValues()[0]), manque = ecran_manque_(o), a;
  if (manque.length && /Dossier à traiter|Devis envoyé/.test(o['Statut'])) a = 'Compléter ' + manque.join(' et ');
  else if (o['Statut'] === 'Dossier à traiter') a = o['Validé pour envoi'] === true ? 'Envoyer le devis' : 'Vérifier et valider l\'envoi';
  else if (o['Réponse patient'] && RELANCE_CFG.statutsRelancables.indexOf(o['Statut']) >= 0) a = relance_actionReponse_(o);   // Relances.gs
  else if (o['Statut'] === 'Devis signé' && /^Transmis|^Déjà chez Lisa/.test(o['Synchro classeur'])) a = 'Suivi chez Lisa';
  else a = COCKPIT_CFG.actionsParStatut[o['Statut']] || '';
  sh.getRange(r, H.indexOf('Action prioritaire') + 1).setValue(a);
}

/* ---------- lecture ---------- */

function ecran_liste() {
  var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), n = cockpit_prochaineLigne_(sh) - 2, plans = [];
  if (n > 0) sh.getRange(2, 1, n, H.length).getValues().forEach(function (row) {
    var o = ecran_obj_(H, row);
    if (!o['ID dossier']) return;
    var manque = ecran_manque_(o);
    plans.push({
      id: String(o['ID dossier']), nom: o['Nom complet patient'], type: o['Type de devis / traitement'],
      date: o['Date devis'], montant: o['Montant devis'], rac: o['Reste à charge total'], statut: o['Statut'],
      action: o['Action prioritaire'], valide: o['Validé pour envoi'] === true, pec: o['Statut PEC'],
      envoi: o['Date d\'envoi'], ouvertures: o['Nb d\'ouvertures'],
      alerte: o['Contrôle lecture'] !== 'OK' ? 'lecture à vérifier' : (manque.length ? 'manque ' + manque.join(' et ') : '')
    });
  });
  var m = ecran_mode_();
  return { plans: plans.reverse(), cfg: { statuts: COCKPIT_CFG.statuts, statutsPEC: COCKPIT_CFG.statutsPEC,
    plateformes: COCKPIT_CFG.plateformesPEC, mode: m.mode, testDest: m.testDest, moi: ecran_acteur_() } };
}

function ecran_fiche(id) {
  var ss = cockpit_base_(), r = cockpit_ligneDuDossier_(ss, id);
  if (!r) throw new Error('dossier introuvable : ' + id);
  var H = ecran_H_(), plan = ecran_obj_(H, ss.getSheetByName('Plans').getRange(r, 1, 1, H.length).getValues()[0]);
  var HA = COCKPIT_CFG.onglets.Actes, sa = ss.getSheetByName('Actes'), na = cockpit_prochaineLigne_(sa) - 2, actes = [];
  if (na > 0) sa.getRange(2, 1, na, HA.length).getValues().forEach(function (x, i) {
    if (String(x[0]) === String(id)) { var a = ecran_obj_(HA, x); a._ligne = i + 2; actes.push(a); }
  });
  var sj = ss.getSheetByName('Journal'), nj = sj.getLastRow() - 1, journal = [];
  if (nj > 0) sj.getRange(2, 1, nj, 5).getValues().forEach(function (x) {
    if (String(x[1]) === String(id)) journal.push({ quand: ecran_val_(x[0]), acteur: x[2], action: x[3], detail: x[4] });
  });
  plan._manque = ecran_manque_(plan);
  return { plan: plan, actes: actes, journal: journal.reverse() };
}

/* ---------- mises à jour ---------- */

function ecran_maj(id, champs) {
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id), qui = ecran_acteur_();
    if (!r) throw new Error('dossier introuvable');
    Object.keys(champs).forEach(function (k) {
      if (ECRAN_EDITABLES.indexOf(k) < 0) throw new Error('champ non modifiable : ' + k);
      var cell = sh.getRange(r, H.indexOf(k) + 1), ancien = String(ecran_val_(cell.getValue())), v = String(champs[k] == null ? '' : champs[k]).trim();
      if (k === 'E-mail') v = v.toLowerCase();
      if (k === 'Téléphone') {
        var t = v.replace(/\D/g, '');
        v = t.replace(/(\d{2})(?=\d)/g, '$1 ');
        cell.setNumberFormat('@');
        sh.getRange(r, H.indexOf('WhatsApp') + 1).setValue(/^0[1-9]\d{8}$/.test(t) ? 'https://wa.me/33' + t.slice(1) : '');
      }
      if (/^Date /.test(k)) cell.setNumberFormat('@');
      if (ancien === v) return;
      cell.setValue(v);
      cockpit_journal_(ss, id, qui, 'Modification', k + ' : ' + (ancien || '∅') + ' → ' + (v || '∅'));
    });
    ecran_action_(sh, H, r);
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

/** Remboursement mutuelle accordé, acte par acte ({ligne: montant}) → total dans Plans. */
function ecran_amc(id, valeurs) {
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sa = ss.getSheetByName('Actes'), HA = COCKPIT_CFG.onglets.Actes;
    var cAmc = HA.indexOf('Remb. AMC accordé') + 1, total = 0, saisi = false;
    Object.keys(valeurs).forEach(function (ligne) {
      var L = Number(ligne);
      if (String(sa.getRange(L, 1).getValue()) !== String(id)) throw new Error('ligne d\'acte incohérente');
      var s = String(valeurs[ligne] == null ? '' : valeurs[ligne]).replace(/\s/g, '').replace(',', '.');
      var v = s === '' ? '' : Number(s);
      if (v !== '' && isNaN(v)) throw new Error('montant invalide : ' + valeurs[ligne]);
      sa.getRange(L, cAmc).setValue(v);
      if (v !== '') { total += v; saisi = true; }
    });
    var sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id);
    total = Math.round(total * 100) / 100;
    sh.getRange(r, H.indexOf('Remb. mutuelle (AMC)') + 1).setValue(saisi ? total : '');
    cockpit_journal_(ss, id, ecran_acteur_(), 'Prise en charge mutuelle', saisi ? 'AMC accordé : ' + ecran_eur_(total) : 'AMC effacé');
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

function ecran_valider(id, oui) {
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id);
    sh.getRange(r, H.indexOf('Validé pour envoi') + 1).setValue(!!oui);
    cockpit_journal_(ss, id, ecran_acteur_(), oui ? 'Validé pour envoi' : 'Validation retirée', '');
    ecran_action_(sh, H, r);
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

function ecran_statut(id, statut, motif) {
  if (COCKPIT_CFG.statuts.indexOf(statut) < 0) throw new Error('statut inconnu');
  if (statut === 'Décliné' && !String(motif || '').trim()) throw new Error('motif de refus obligatoire');
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id);
    var ancien = sh.getRange(r, H.indexOf('Statut') + 1).getValue();
    sh.getRange(r, H.indexOf('Statut') + 1).setValue(statut);
    if (statut === 'Décliné') {
      sh.getRange(r, H.indexOf('Motif de refus') + 1).setValue(motif);
      sh.getRange(r, H.indexOf('Décision') + 1).setValue('Refusé');
    }
    if (statut === 'Premier RDV pris') sh.getRange(r, H.indexOf('Décision') + 1).setValue('Accepté');
    cockpit_journal_(ss, id, ecran_acteur_(), 'Statut', ancien + ' → ' + statut + (motif ? ' (' + motif + ')' : ''));
    ecran_action_(sh, H, r);
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

/** Trace d'une action faite hors outil (WhatsApp, appel). */
function ecran_noter(id, action, detail) {
  if (ECRAN_NOTES.indexOf(action) < 0) throw new Error('action inconnue');
  cockpit_journal_(cockpit_base_(), id, ecran_acteur_(), action, String(detail || '').slice(0, 300));
  return ecran_fiche(id);
}

/* ---------- envoi du devis ---------- */

function ecran_envoyer(id) {
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id);
    var o = ecran_obj_(H, sh.getRange(r, 1, 1, H.length).getValues()[0]);
    if (o['Validé pour envoi'] !== true) throw new Error('le devis doit d\'abord être validé pour envoi');
    if (!o['E-mail']) throw new Error('e-mail du patient manquant');
    var m = ecran_mode_(), dest = m.mode === 'REEL' ? o['E-mail'] : m.testDest;
    var devis = DriveApp.getFileById(String(o['PDF du devis']).match(/[-\w]{25,}/)[0]);
    var j0 = docs_J0_(o, ecran_fiche(id).actes);
    var pieces = [devis.getBlob().setName('Devis ' + o['ID dossier'] + (/\.pdf$/i.test(devis.getName()) ? '.pdf' : '.txt'))]
      .concat(j0.documents.map(function (d) { return d.fichier.getBlob(); }));
    var c = ecran_courrier_(o, j0);
    var sujet = (m.mode === 'REEL' ? '' : '[TEST → ' + o['E-mail'] + '] ') + c.sujet;
    MailApp.sendEmail({ to: dest, subject: sujet, body: c.texte, htmlBody: c.html, name: CABINET.nom, attachments: pieces });
    var auj = Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy');
    sh.getRange(r, H.indexOf('Date d\'envoi') + 1).setNumberFormat('@').setValue(auj);
    if (o['Statut'] === 'Dossier à traiter') sh.getRange(r, H.indexOf('Statut') + 1).setValue('Devis envoyé');
    cockpit_journal_(ss, id, ecran_acteur_(), 'Devis envoyé', 'à ' + dest + (m.mode === 'REEL' ? '' : ' (MODE TEST, patient : ' + o['E-mail'] + ')') +
      ' · pièces : devis + ' + j0.documents.map(function (d) { return d.titre; }).join(' + '));
    ecran_action_(sh, H, r);
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

/** Mail J0 : devis + explication du traitement + documents à remplir et signer (V1 — à relire). */
function ecran_courrier_(o, j0) {
  j0 = j0 || { familles: [], documents: [] };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var sujet = 'Votre devis n° ' + o['ID dossier'] + ' et vos documents — ' + CABINET.nom;
  var aRetourner = ['Le devis daté et signé, avec la mention « Bon pour accord »']
    .concat(j0.documents.map(function (d) { return d.titre + ', complété(e) et signé(e)'; }));
  var T = [], Hh = [];
  var p = function (t) { T.push(t); Hh.push('<p style="margin:0 0 10px">' + esc(t) + '</p>'); };
  var h = function (t) { T.push('', t.toUpperCase()); Hh.push('<h3 style="margin:18px 0 6px;font-size:15px;color:#1b2a41">' + esc(t) + '</h3>'); };
  var li = function (arr, num) {
    arr.forEach(function (x, i) { T.push((num ? (i + 1) + '. ' : '• ') + x); });
    Hh.push('<' + (num ? 'ol' : 'ul') + ' style="margin:0 0 10px;padding-left:22px">' + arr.map(function (x) { return '<li style="margin-bottom:4px">' + esc(x) + '</li>'; }).join('') + '</' + (num ? 'ol' : 'ul') + '>');
  };
  p('Bonjour ' + (o['Prénom'] || '') + ',');
  p('Suite à votre consultation, vous trouverez ci-joint votre devis n° ' + o['ID dossier'] + ' ainsi que les documents qui accompagnent votre traitement.');
  if (j0.familles.length) {
    h('Le traitement proposé');
    j0.familles.forEach(function (f) {
      T.push('', f.titre + ' (' + f.actes.join(' ; ') + ')', DOCS_CFG.explications[f.cle]);
      Hh.push('<p style="margin:0 0 4px"><b>' + esc(f.titre) + '</b> <span style="color:#6b7280">(' + esc(f.actes.join(' ; ')) + ')</span></p>' +
              '<p style="margin:0 0 12px">' + esc(DOCS_CFG.explications[f.cle]) + '</p>');
    });
  }
  h('Récapitulatif');
  li(['Montant total : ' + ecran_eur_(o['Montant devis']),
      'Remboursement Assurance Maladie : ' + ecran_eur_(o['Remb. AMO']),
      'Reste à charge avant mutuelle : ' + ecran_eur_(o['Reste à charge avant mutuelle'])]);
  p('Votre mutuelle peut prendre en charge une partie de ce reste à charge : vous pouvez lui transmettre ce devis, ou nous demander de faire la demande pour vous.');
  h('Documents à nous retourner');
  li(aRetourner, true);
  p('Vous pouvez nous les renvoyer en réponse à ce message (photo ou scan lisible), ou les apporter à votre prochain rendez-vous. Le questionnaire médical est confidentiel et réservé à votre praticien.');
  p('Nous restons à votre disposition pour toute question.');
  p('Bien cordialement,');
  T.push('L\'équipe du ' + CABINET.nom, CABINET.adresse);
  Hh.push('<p style="margin:0">L\'équipe du ' + esc(CABINET.nom) + '<br><span style="color:#6b7280">' + esc(CABINET.adresse) + '</span></p>');
  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1b2a41;max-width:640px">' + Hh.join('') + '</div>';
  return { sujet: sujet, texte: T.join('\n'), html: html };
}

/** Test serveur sans écran : liste + fiche du premier dossier dans le journal d'exécution. */
function ecran_test() {
  var L = ecran_liste();
  Logger.log(L.plans.length + ' plan(s) · mode ' + L.cfg.mode + ' → ' + L.cfg.testDest + ' · moi : ' + L.cfg.moi);
  if (!L.plans.length) return;
  var f = ecran_fiche(L.plans[0].id);
  Logger.log(f.plan['ID dossier'] + ' · ' + f.actes.length + ' actes · ' + f.journal.length + ' entrées de journal · action : ' + f.plan['Action prioritaire']);
  Logger.log(ecran_courrier_(f.plan, docs_J0_(f.plan, f.actes)).texte);
}


/** Envoi test du devis fictif (mode TEST : part vers ta propre adresse). */
function ecran_testEnvoi() {
  var f = ecran_envoyer('99999-00001');
  Logger.log('Statut : ' + f.plan['Statut'] + ' · envoyé le ' + f.plan['Date d\'envoi'] + ' · ' + f.journal[0].action + ' ' + f.journal[0].detail);
}

/** Correction ponctuelle : remet en texte les dates / codes que le classeur a convertis en dates (une seule fois). */
function cockpit_corrigerFormats() {
  var ss = cockpit_base_(), tz = COCKPIT_CFG.fuseau, n = 0;
  var fix = function (sh, cols, enDate) {
    var H = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], last = cockpit_prochaineLigne_(sh) - 1;
    if (last < 2) return;
    cols.forEach(function (h) {
      var c = H.indexOf(h) + 1, rg = sh.getRange(2, c, last - 1, 1), vals = rg.getValues();
      var out = vals.map(function (x) {
        if (!(x[0] instanceof Date)) return [x[0]];
        n++;
        return [enDate ? Utilities.formatDate(x[0], tz, 'dd/MM/yyyy')
                       : x[0].getDate() + ' ' + (x[0].getMonth() + 1) + ' ' + (x[0].getFullYear() % 100)];
      });
      rg.setNumberFormat('@').setValues(out);
    });
  };
  fix(ss.getSheetByName('Plans'), ['Date devis', 'Validité'], true);
  fix(ss.getSheetByName('Actes'), ['Dent', 'Matériau', 'Panier'], false);
  Logger.log(n + ' cellule(s) corrigée(s).');
}

/* ============================ DOCUMENTS J0 (questionnaire + consentements) ============================ */
/**
 * À l'envoi du devis (J0), le mail contient : le devis Logos, l'explication du traitement proposé,
 * le questionnaire médical et le(s) consentement(s) éclairé(s) correspondant aux actes du devis.
 * Les documents sont générés depuis les modèles Google Docs du dossier « Cockpit Devis › Modèles patients »
 * (balises {{PATIENT}} {{DATE}} {{N_DEVIS}} {{ACTES}} {{PRATICIEN}}), exportés en PDF dans le dossier Drive du patient.
 */
var DOCS_CFG = {
  praticien: 'Docteur Fakhreddine TIGHZA',
  modeles: {
    questionnaire: '1J6eCEYVI9pHF4Aqz4i8tPynLkGODTPGFFQ2GXyYlKu8',
    implant: '1WVChdYXLN0l0qqV7SqsXE43ClCAjN0pkg_3YEw6Fbnw',
    greffe: '1r2uZiuBoDl6a_TIb2E23wKTetbYhN5eQCHw_PTQEKmI',
    sinus: '1foOGDImZoBF5bobv_UDGfssbreR1FIvdjpUaPuA1zkg',
    avulsion: '1kTJQM-Nvm3IFKyl1aQf0PiMl9SYaRvIDV5QEjmbW0gk',
    couronne: '1v0jHYwjIPB08I7xlkTGfbxA9wnnWm60d-HddCNWpCEg',
    bridge: '1VjmIis8geLDTXQUZOtdugz-gaw2z0p41yXfHX-tlheQ',
    amovible: '1w20og6utVFsh_ldlGiKQpqhF0e9leimKTd5K67VgMEc',
    amovible_transitoire: '1Gc7GTjDuirA8XbyiVgqTIAZ8Yd85MZRFvAFWPF6EnZM',
    endodontie: '1fGl7PgEmC109ZET0Z0PrkIQWX5BzRv2OAQkwRGkGY1U',
    ancrage: '1l1XzSfgcGgZHMh6wOzBPDgAaUX6qWU7WNz5FaVyN94g'
  },
  titres: {
    implant: 'Implantologie', greffe: 'Greffe osseuse', sinus: 'Élévation sinusienne', avulsion: 'Avulsion (extraction)',
    couronne: 'Couronne', bridge: 'Bridge', amovible: 'Prothèse amovible', amovible_transitoire: 'Prothèse amovible transitoire',
    endodontie: 'Traitement de canal', ancrage: 'Restauration avec ancrage'
  },
  // ordre d'affichage = ordre chronologique habituel du parcours
  ordre: ['avulsion', 'amovible_transitoire', 'endodontie', 'ancrage', 'greffe', 'sinus', 'implant', 'couronne', 'bridge', 'amovible'],
  // Textes patients (V1 rédigée à partir des notices du cabinet — À RELIRE par le praticien)
  explications: {
    implant: "Un implant est une petite racine artificielle placée dans l'os, à l'endroit où une dent manque, sous anesthésie locale. On laisse ensuite l'os cicatriser autour de l'implant pendant environ 4 à 6 mois, avec si besoin une prothèse provisoire pendant ce temps. Une fois l'implant bien intégré, on fixe dessus la dent définitive (couronne, bridge ou appareil). Des contrôles réguliers et un brossage soigneux sont ensuite indispensables pour le garder longtemps.",
    greffe: "Quand l'os est trop fin pour recevoir un implant, une greffe osseuse permet d'en reconstruire le volume. On prélève un peu de votre propre os dans la mâchoire, que l'on peut compléter avec un matériau de comblement, puis on le place à l'endroit à renforcer. Après l'intervention, un gonflement de quelques jours est habituel et il faut éviter d'appuyer sur la zone (pas de prothèse amovible pendant une semaine). Les implants sont posés environ 4 à 6 mois plus tard, une fois l'os consolidé.",
    sinus: "Sur la mâchoire du haut, au niveau des dents du fond, l'os situé sous le sinus est parfois trop fin pour poser un implant. L'élévation sinusienne consiste à soulever délicatement la membrane du sinus et à placer dessous un matériau de comblement, pour recréer de l'os. Pendant les deux mois qui suivent, il faut éviter la plongée et ne pas mettre la tête sous l'eau. Les implants sont posés environ 4 à 6 mois après, quand la zone a cicatrisé.",
    avulsion: "L'avulsion consiste à retirer une dent qui ne peut pas être conservée, sous anesthésie locale. Un léger saignement et un gonflement de quelques jours sont habituels ; une fiche de conseils post-opératoires vous sera remise. Il est ensuite recommandé de remplacer la dent extraite assez rapidement pour éviter que les dents voisines ne se déplacent.",
    couronne: "Une couronne est une « coiffe » sur mesure qui recouvre entièrement une dent abîmée pour la protéger et lui redonner sa forme et sa couleur. Lors d'une première séance, la dent est préparée, une empreinte est prise et une couronne provisoire est posée. La couronne définitive, fabriquée par le laboratoire, est ensuite collée lors d'un rendez-vous suivant. Une bonne hygiène et des contrôles réguliers aident à la faire durer.",
    bridge: "Un bridge permet de remplacer une ou plusieurs dents manquantes en s'appuyant sur les dents voisines, qui servent de piliers. Ces dents piliers sont préparées, une empreinte est prise et un bridge provisoire est posé en attendant. Le bridge définitif, fabriqué par le laboratoire, est ensuite fixé lors d'un rendez-vous suivant. Il est fixe : vous ne l'enlevez pas, mais il demande un nettoyage soigneux entre les dents.",
    amovible: "Une prothèse amovible est un appareil que vous pouvez retirer, qui remplace les dents manquantes pour vous permettre de mâcher et de sourire. Sa fabrication demande plusieurs rendez-vous : empreintes, enregistrement de votre morsure, choix et essayage des dents, puis pose. Une période d'adaptation de quelques jours à quelques semaines est normale, avec si besoin des retouches au cabinet. Elle se nettoie après chaque repas et se retire la nuit.",
    amovible_transitoire: "La prothèse amovible transitoire est un appareil provisoire, préparé avant l'extraction des dents et posé le jour même, pour que vous ne restiez pas sans dents. Elle se porte pendant la cicatrisation, environ 4 à 6 mois, et peut être réajustée si besoin. Elle aide la gencive à cicatriser de façon régulière, en attendant la prothèse définitive ou les implants.",
    endodontie: "Le traitement de canal (dévitalisation) permet de conserver une dent dont le nerf est atteint ou infecté. Sous anesthésie locale, l'intérieur de la dent est nettoyé, désinfecté puis rebouché de façon étanche, en une ou plusieurs séances. Une légère sensibilité pendant quelques jours est possible. La dent devenant plus fragile, il est conseillé de la protéger ensuite rapidement, le plus souvent par une couronne.",
    ancrage: "Quand une dent dévitalisée a perdu beaucoup de matière, on la renforce avec un ancrage placé dans sa racine. Cet ancrage sert de support solide pour reconstruire la dent et accueillir ensuite une couronne. Il s'agit en général d'une étape préparatoire, réalisée avant la pose de la couronne."
  }
};

/** Famille de consentement d'un acte (null = acte sans consentement : radio, forfait…). */
function docs_famille_(a) {
  var l = String(a['Libellé'] || a.libelle || '').toLowerCase(), c = String(a['Code'] || a.code || '');
  if (/sinus/.test(l)) return 'sinus';
  if (/greffe|comblement|r[ée]g[ée]n[ée]ration osseuse/.test(l)) return 'greffe';
  if (/implant/.test(l) || /^LBLD0/.test(c)) return 'implant';
  if (/^HBGD/.test(c) || /avulsion|extraction/.test(l)) return 'avulsion';
  if (/transitoire|imm[ée]diate/.test(l) && /amovible|adjointe|prot/.test(l)) return 'amovible_transitoire';
  if (/amovible|adjointe|stellite|ch[aâ]ssis|compl[eè]te/.test(l)) return 'amovible';
  if (/inlay.?core|ancrage|faux.?moignon|tenon/.test(l)) return 'ancrage';
  if (/bridge|pont|interm[ée]diaire/.test(l)) return 'bridge';
  if (/^HBFD/.test(c) || /canal|endodont|pulpectomie|d[ée]vitalis/.test(l)) return 'endodontie';
  if (/couronne|coiffe|onlay|inlay|facette/.test(l)) return 'couronne';
  return null;
}

/** Familles du plan, dans l'ordre du parcours, avec la liste des actes concernés. */
function docs_familles_(actes) {
  var parF = {};
  actes.forEach(function (a) {
    var f = docs_famille_(a);
    if (!f) return;
    var dent = String(a['Dent'] || a.dent || '').trim();
    (parF[f] = parF[f] || []).push((dent ? 'dent' + (/\s/.test(dent) ? 's ' : ' ') + dent + ' : ' : '') + String(a['Libellé'] || a.libelle || ''));
  });
  return DOCS_CFG.ordre.filter(function (f) { return parF[f]; }).map(function (f) {
    return { cle: f, titre: DOCS_CFG.titres[f], actes: parF[f] };
  });
}

/** Génère (ou réutilise) un PDF rempli depuis un modèle, rangé dans le dossier du patient. */
function docs_pdf_(cle, titre, o, actesTexte, dossier) {
  var nom = titre + ' — ' + o['ID dossier'] + '.pdf';
  var it = dossier.getFilesByName(nom);
  if (it.hasNext()) return it.next();
  var copie = DriveApp.getFileById(DOCS_CFG.modeles[cle]).makeCopy('tmp ' + nom, dossier);
  try {
    var doc = DocumentApp.openById(copie.getId()), corps = doc.getBody();
    var valeurs = { PATIENT: o['Nom complet patient'], DATE: o['Date devis'], N_DEVIS: o['ID dossier'],
                    ACTES: actesTexte || '—', PRATICIEN: DOCS_CFG.praticien };
    Object.keys(valeurs).forEach(function (k) {
      var v = String(valeurs[k] == null ? '' : valeurs[k]);
      [corps, doc.getHeader(), doc.getFooter()].forEach(function (zone) { if (zone) zone.replaceText('\\{\\{' + k + '\\}\\}', v); });
    });
    doc.saveAndClose();
    return dossier.createFile(copie.getAs(MimeType.PDF).setName(nom));
  } finally { copie.setTrashed(true); }
}

/** Documents J0 d'un dossier : [{titre, fichier}] — questionnaire + un consentement par famille d'actes. */
function docs_J0_(o, actes) {
  var dossier = DriveApp.getFolderById(String(o['Dossier Drive']).match(/[-\w]{25,}/)[0]);
  var familles = docs_familles_(actes), out = [];
  out.push({ titre: 'Questionnaire médical', fichier: docs_pdf_('questionnaire', 'Questionnaire médical', o, '', dossier) });
  familles.forEach(function (f) {
    out.push({ titre: 'Consentement éclairé — ' + f.titre, cle: f.cle,
               fichier: docs_pdf_(f.cle, 'Consentement — ' + f.titre, o, f.actes.join(' ; '), dossier) });
  });
  return { documents: out, familles: familles };
}

/** Aperçu sans envoi : génère les PDF dans le dossier du patient et renvoie leurs liens (bouton « Documents J0 »). */
function ecran_apercuDocs(id) {
  var f = ecran_fiche(id), r = docs_J0_(f.plan, f.actes);
  cockpit_journal_(cockpit_base_(), id, ecran_acteur_(), 'Documents préparés', r.documents.map(function (d) { return d.titre; }).join(' · '));
  return r.documents.map(function (d) { return { titre: d.titre, url: d.fichier.getUrl() }; });
}

/** Test : documents J0 de deux dossiers réels de test (prothèse, implants). */
function docs_test() {
  ['22268-17831', '25894-17835'].forEach(function (id) {
    var f = ecran_fiche(id), r = docs_J0_(f.plan, f.actes);
    Logger.log(id + ' → ' + r.familles.map(function (x) { return x.cle + ' [' + x.actes.join(' ; ') + ']'; }).join(' | '));
    r.documents.forEach(function (d) { Logger.log('   ' + d.titre + ' : ' + d.fichier.getUrl()); });
  });
}

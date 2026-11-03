/**
 * BRIEF.gs — Mail du matin · Cabinet Tighza (V2)
 * ------------------------------------------------------------
 * Lit : Google Agenda (contact@) + classeur « Transmissions devis — Implanto » + Gmail.
 * Écrit : RIEN dans l'agenda ni dans le classeur. Envoie 1 mail à BRIEF_CFG.destinataire.
 * Aucune IA : tout est déduit de règles lisibles ci-dessous (modifiables).
 *
 * V2 :
 *   - Aucun nom de patient dans le brief : code = initiales + n° de dossier du classeur (BRIEF_CFG.codePatient).
 *     Le nom reste dans l'agenda et dans Logos. Il est aussi retiré des notes s'il y est recopié.
 *   - Section « À préparer et vérifier » : une fiche par type de RDV (BRIEF_PREPA, plus bas), tirée du doc PROTOCOLES.
 *   - Gmail : nombre de fils + expéditeurs par domaine (patients regroupés en « particuliers »), sans nom ni objet.
 *
 * Points d'entrée :
 *   brief_recon()                 → journal uniquement (Exécutions), n'envoie rien
 *   brief_matin()                 → construit et envoie le mail (selon BRIEF_CFG.mode)
 *   brief_typesAgenda()           → journal : tous les types de RDV des 60 prochains jours et leur fiche (ou « SANS FICHE »)
 *   brief_installerDeclencheur()  → déclencheur quotidien vers 7h30
 *   brief_supprimerDeclencheur()  → retire le déclencheur
 */

var BRIEF_CFG = {
  mode: 'TEST',                                   // 'TEST' (objet préfixé [TEST]) | 'ENVOI'
  destinataire: 'contact@implantologielege.com',
  agendaId: 'contact@implantologielege.com',
  classeurId: '1ZNutOD1xstRfXWslXduR4OGusxcW2Eq05iynA6juXYU',
  fuseau: 'Europe/Paris',
  joursAnticipation: 3,        // checklists labo / chirurgie : aujourd'hui + N jours ouvrés
  joursCreneaux: 7,            // créneaux libres : sur N jours
  joursDesistement: 60,        // patients "si désistement" : RDV dans les N jours
  creneauMinMinutes: 20,
  plages: [['09:00', '13:00'], ['14:00', '19:00']],   // horaires d'ouverture pour calculer les trous
  minRdvPourAnalyserJour: 3,   // un jour avec moins de RDV = planning pas encore rempli → non analysé

  // Initiales relevées dans les notes
  initiales: { ft: 'Dr Tighza', jl: 'Dr Loiseau', dk: 'David Koita', lt: 'Lisa', am: 'Anne-Marie' },
  equipe: ['marion', 'lucie', 'lisa'],

  // Règles sur le champ « Type : »
  reTypeProthese: /pose\s*pf|proth[eè]se\s*adjointe|proth[eè]se\s*\/\s*implant|finition|essayage|stellite|bridge|couronne(?!\s*descell)/i,
  reTypeEmpreinte: /empreinte/i,
  reTypeChirurgie: /pose\s*\d*\s*implant|d[ée]couverture|extraction|greffe|sinus|chirurg/i,
  reTypePoseImplant: /pose\s*\d*\s*implant/i,
  reTypeUrgence: /urgence|dent cass[ée]e|couronne descell/i,
  reTypeNouveau: /adress[ée] par un confr|consultation\s+pr[ée]-?op/i,
  reTypeInterne: /com interne|zone r[ée]serv/i,

  reProthRecue: /proth\s*✅|proth\.?\s*re[çc]ue\s*✅/i,
  reRefImplant: /\b(RC|RN|WN|NN|NC|SP|BLX?|BLT|TL)\s*\d+(?:[.,]\d+)?(?:\s*[*x×]\s*\d+(?:[.,]\d+)?)?/i,
  reDesistement: /d[ée]sistement|liste d'attente|disponible\s*\+{2,}/i,
  reFlag: /oubli|d[ée]cal[ée]|repouss|report[ée]|priorit[ée]|[àa] confirmer|\(\?\)|annul/i,
  reFerme: /^\s*ferm[ée]/i,
  reLigneContact: /t[ée]l[ée]phone|^\s*tel\b|tel n°|portable|^\s*(mr|mme|m\.)\s*:|e-?mail|@|(\d{2}[\s.]?){5}/i,

  gmailRequete: 'in:inbox is:unread older_than:1d -category:promotions -category:social',
  gmailMax: 8,

  // Ce qui remplace le nom du patient dans le brief :
  //   'auto'      → initiales + n° de dossier du classeur s'il existe (ex. « D.J. #142 »)
  //   'initiales' → initiales seules (« D.J. »)
  //   'aucun'     → rien : heure + type de RDV uniquement
  codePatient: 'auto',
  gmailDetail: false   // true = remet l'expéditeur et l'objet de chaque mail (des noms de patients peuvent réapparaître)
};

/* ===================== À PRÉPARER / À VÉRIFIER PAR TYPE DE RDV =====================
 * Une fiche par famille d'actes. La 1re fiche dont « re » reconnaît le champ « Type : » de l'agenda s'applique
 * (l'ordre compte : « Couronne sur implant » doit être vue par la fiche implant avant la fiche couronne).
 * Sources : doc Drive « PROTOCOLES » de l'équipe (RDV implantaires, C sur implant, Règlements, Gestion de l'agenda,
 * DPC non réalisée), skill gestion RDV (3 documents avant chirurgie), skill bilan matinal (labo, réf. implant).
 * Rien ici n'est clinique : ce sont des documents, des encaissements et des étapes de parcours.
 * auto = contrôles faits par le script sur chaque RDV :
 *   'ref'   → référence implant présente dans la note (poses d'implant seulement)
 *   'proth' → prothèse marquée reçue [proth✅]
 *   'lisa'  → dossier bloqué chez Lisa (documents à déposer / PEC à finaliser)
 * Ajouter un type : copier une fiche, changer cle / nom / re. Puis lancer brief_typesAgenda() pour voir ce qui reste sans fiche.
 * Une liste vide [] n'est pas affichée.
 */
var BRIEF_PREPA_TOUS = ['carte Vitale à l\'arrivée (droits ALD / CSS à jour)', 'carte mutuelle valide, scannée dans Logos'];

var BRIEF_PREPA = [
  { cle: 'implant', nom: '⚫ Chirurgie implantaire (implant, sinus, greffe)', re: /pose\s*\d*\s*implant|sinus|greffe|chirurg/i,
    auto: ['ref', 'lisa'],
    preparer: ['Implant à la référence notée dans l\'agenda (vérifier le stock)',
               'RAC à encaisser : montant noté par Lisa dans Observations (Logos) · pas de carte Vitale pour la partie DPC',
               'DPC pas finalisée → chèque de caution du montant total du devis, noté dans Observations',
               'Échéancier à faire signer s\'il est prévu',
               'Après l\'intervention : passeport implantaire · note d\'honoraires Santéclair signée patient + praticien'],
    verifier: ['Devis signé « Bon pour accord » · consentement éclairé · questionnaire médical à jour',
               'CBCT réalisé',
               'Santéclair / Almerys : DPC finalisée (voir Lisa)'] },

  { cle: 'urgence', nom: '🔴 Urgence / dent cassée / couronne descellée', re: /urgence|dent\s*cass|descell|douleur/i,
    preparer: [],
    verifier: ['Si un soin est à prévoir : programmer le RDV de soins (créneau bleu)'] },

  { cle: 'protimpl', nom: '🔘 Prothèse sur implant', re: /sur\s*implant|proth[eè]se\s*\/\s*implant|pilier|transviss/i,
    auto: ['proth'],
    preparer: ['Prothèse + pièces reçues du labo',
               'RAC à encaisser (Observations Logos, calculé par Lisa) · échéancier s\'il est prévu',
               'Fin de séance : carte Vitale, télétransmission « Tiers payant Sécurité Sociale » · consultation ou autre soin = FSE à part',
               'Note d\'honoraires Santéclair imprimée, signée patient + praticien'],
    verifier: ['Accord mutuelle de la partie prothèse (DPC accordée)',
               'Prévenir Lisa en fin de séance : facturation Santéclair le même jour que la télétransmission'] },

  { cle: 'cbct', nom: '🟢 CBCT / retour de devis', re: /cbct|cone\s*beam|scanner|retour\s*(de\s*)?devis|signature\s*(du\s*)?devis/i,
    preparer: ['Devis papier complet à faire signer « Bon pour accord »'],
    verifier: ['Pose à fixer 7 à 10 jours après (créneau chirurgie)',
               'Santéclair / Almerys : prévenir Lisa (DPC à créer entre J-15 et J-7)'] },

  { cle: 'consult', nom: '🟢 Avis / consultation', re: /\bavis\b|consult|pr[ée]-?op|adress[ée]/i,
    preparer: ['Patient adressé : courrier du confrère, radio, zone à traiter',
               'Questionnaire médical (patient Doctolib : validé via le Sheet avant l\'inscription dans Logos)'],
    verifier: ['Après la consultation : devis papier remis · relances J+7 / J+14 / J+30'] },

  { cle: 'petitechir', nom: '⚫ Extraction / découverture', re: /extraction|d[ée]couverture/i,
    auto: ['lisa'],
    preparer: ['Acte hors DPC : règlement en totalité pendant la séance'],
    verifier: ['Consentement éclairé signé · questionnaire médical à jour'] },

  { cle: 'empreinte', nom: '🔵 Empreinte', re: /empreinte/i,
    preparer: ['Bon de labo prêt · envoi au labo en fin de journée'],
    verifier: ['Pose à programmer 2 semaines après · mail type après le RDV'] },

  { cle: 'amovible', nom: '🟢 Essayage / prothèse amovible', re: /adjointe|amovible|stellite|essayage|finition/i,
    auto: ['proth'],
    preparer: ['Travail du labo reçu', 'Bon de retour labo si essayage · prochain RDV à 2 semaines'],
    verifier: ['Prothèse amovible : consentement « Prothèse amovible » signé', 'Mail type après le RDV'] },

  { cle: 'pf', nom: '🔵 Pose couronne / bridge', re: /pose\s*pf|bridge|couronne|inlay|onlay|facette/i,
    auto: ['proth'],
    preparer: ['Prothèse reçue du labo', 'Fin de séance : carte Vitale (FSE) · rappeler le panier choisi sur le devis signé (RAC 0 / modéré / libre)'],
    verifier: ['Consentement « Couronne » ou « Bridge » signé'] },

  { cle: 'endo', nom: '🔵 Endo / dévitalisation', re: /endo|pulp|d[ée]vital/i,
    preparer: [],
    verifier: ['Consentement « Endodontie » signé', 'Souvent suivi d\'une empreinte PF : prévoir le RDV suivant'] },

  { cle: 'controle', nom: '🟡 Contrôle / détartrage', re: /contr[ôo]le|d[ée]tartrage/i,
    preparer: [],
    verifier: ['Si un soin est à prévoir : programmer le RDV de soins (créneau bleu)'] }
];

/** Fiche applicable à un type de RDV (la première qui correspond), ou null. */
function brief_fiche_(type) {
  if (!type) return null;
  for (var i = 0; i < BRIEF_PREPA.length; i++) if (BRIEF_PREPA[i].re.test(type)) return BRIEF_PREPA[i];
  return null;
}

/** Journal : chaque type de RDV des 60 prochains jours → sa fiche, ou SANS FICHE. Aucun nom de patient. */
function brief_typesAgenda() {
  var d0 = brief_dateLocale_(brief_aujourdhui_(), '00:00');
  var vus = {};
  brief_lireAgenda_(d0, new Date(d0.getTime() + 60 * 86400000)).forEach(function (ev) {
    var e = brief_analyser_(ev);
    if (e.journee || e.estInterne) return;
    var t = e.type || '(sans « Type : »)';
    if (!vus[t]) vus[t] = { n: 0, fiche: e.fiche ? e.fiche.nom : 'SANS FICHE' };
    vus[t].n++;
  });
  Object.keys(vus).sort(function (a, b) { return vus[b].n - vus[a].n; }).forEach(function (t) {
    Logger.log(vus[t].n + ' × ' + t + '  →  ' + vus[t].fiche);
  });
}

/* ===================== POINTS D'ENTRÉE ===================== */

function brief_matin() {
  var jour = brief_aujourdhui_();
  var res = brief_construire_(jour);
  if (res.stats.ferme && res.stats.rdv === 0) { Logger.log('Jour fermé sans RDV (' + jour + ') : aucun mail.'); return; }
  brief_envoyer_(res);
}

/** Test manuel : envoie le brief du PROCHAIN jour ouvré, objet préfixé [TEST]. */
function brief_test() {
  var d = new Date(), garde = 0, res;
  do {
    d = new Date(d.getTime() + 86400000);
    res = brief_construire_(Utilities.formatDate(d, BRIEF_CFG.fuseau, 'yyyy-MM-dd'));
  } while (res.stats.ferme && res.stats.rdv === 0 && garde++ < 10);
  MailApp.sendEmail({ to: BRIEF_CFG.destinataire, subject: '[TEST] ' + res.objet, htmlBody: res.html, name: 'Brief cabinet' });
  Logger.log('Test envoyé : ' + res.objet);
}

function brief_envoyer_(res) {
  var objet = (BRIEF_CFG.mode === 'TEST' ? '[TEST] ' : '') + res.objet;
  MailApp.sendEmail({ to: BRIEF_CFG.destinataire, subject: objet, htmlBody: res.html, name: 'Brief cabinet' });
  Logger.log('Envoyé : ' + objet);
}

function brief_recon() {
  var jour = brief_aujourdhui_();
  var res = brief_construire_(jour);
  Logger.log('Objet : ' + res.objet);
  Logger.log(JSON.stringify(res.stats));
  Logger.log('Classeur : ' + JSON.stringify(res.classeurInfo));
  var f = brief_lireFiles_(SpreadsheetApp.openById(BRIEF_CFG.classeurId));
  Logger.log('Files : Lisa ' + JSON.stringify(f.lisa.map(function(g){return g.etiquette+'='+g.lignes.length;})) + ' · Marion ' + JSON.stringify(f.marion.map(function(g){return g.etiquette+'='+g.lignes.length;})) + ' · masqués ' + f.bloques + ' · Lucie ' + JSON.stringify(f.lucie.map(function(g){return g.etiquette+'='+g.lignes.length;})) + ' · Cicat ' + f.cicat.length + ' · erreurs ' + JSON.stringify(f.erreurs));
}

function brief_installerDeclencheur() {
  brief_supprimerDeclencheur();
  ScriptApp.newTrigger('brief_matin').timeBased().everyDays(1).atHour(7).nearMinute(30)
    .inTimezone(BRIEF_CFG.fuseau).create();
  Logger.log('Déclencheur posé : brief_matin tous les jours vers 7h30 (week-ends et jours fermés ignorés).');
}

function brief_supprimerDeclencheur() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'brief_matin') ScriptApp.deleteTrigger(t);
  });
}

/* ===================== ADAPTATEURS GOOGLE ===================== */

function brief_aujourdhui_() {
  var s = Utilities.formatDate(new Date(), BRIEF_CFG.fuseau, 'yyyy-MM-dd');
  return s;
}

function brief_lireAgenda_(debut, fin) {
  var cal = CalendarApp.getCalendarById(BRIEF_CFG.agendaId);
  return cal.getEvents(debut, fin).map(function (e) {
    return { titre: e.getTitle() || '', debut: e.getStartTime(), fin: e.getEndTime(),
             journee: e.isAllDayEvent(), desc: e.getDescription() || '' };
  });
}

function brief_lireClasseur_() {
  var info = { ok: false, message: '', marion: [], lucie: [] };
  try {
    var ss = SpreadsheetApp.openById(BRIEF_CFG.classeurId);
    info.marion = brief_lireOnglet_(ss, 'Marion', ['Nom complet patient', 'Étape en cours', 'Acte prévu']);
    info.lucie = brief_lireOnglet_(ss, 'Lucie', ['Nom complet patient', 'Planification validée']);
    info.ok = true;
  } catch (err) {
    info.message = String(err && err.message || err);
  }
  try { info.files = brief_lireFiles_(SpreadsheetApp.openById(BRIEF_CFG.classeurId)); } catch (e2) { info.files = null; }
  return info;
}

/** Lit un onglet en trouvant la ligne d'en-têtes et les colonnes par NOM (contient, insensible accents/casse). */
function brief_lireOnglet_(ss, nomOnglet, colonnesVoulues) {
  var sh = ss.getSheetByName(nomOnglet);
  if (!sh) throw new Error('onglet « ' + nomOnglet + ' » introuvable');
  var v = sh.getDataRange().getDisplayValues();
  var ligneEnt = -1, idx = {};
  for (var r = 0; r < Math.min(8, v.length) && ligneEnt < 0; r++) {
    var trouve = 0, tmp = {};
    colonnesVoulues.forEach(function (c) {
      for (var k = 0; k < v[r].length; k++) {
        if (brief_norm_(v[r][k]).indexOf(brief_norm_(c)) >= 0) { tmp[c] = k; trouve++; break; }
      }
    });
    if (trouve === colonnesVoulues.length) { ligneEnt = r; idx = tmp; }
  }
  if (ligneEnt < 0) throw new Error(nomOnglet + ' : colonnes introuvables (' + colonnesVoulues.join(', ') + ')');
  var out = [];
  for (var i = ligneEnt + 1; i < v.length; i++) {
    var o = {};
    colonnesVoulues.forEach(function (c) { o[c] = v[i][idx[c]]; });
    if (o['Nom complet patient']) out.push(o);
  }
  return out;
}

function brief_lireGmail_() {
  try {
    var fils = GmailApp.search(BRIEF_CFG.gmailRequete, 0, 50);
    return { ok: true, total: fils.length, liste: fils.slice(0, BRIEF_CFG.gmailMax).map(function (f) {
      var m = f.getMessages()[f.getMessageCount() - 1];
      var from = String(m.getFrom());
      var adr = (from.match(/<([^>]+)>/) || [null, from])[1];
      return { de: from.replace(/<.*>/, '').replace(/"/g, '').trim(),
               domaine: String(adr.split('@')[1] || '').toLowerCase().trim(),
               objet: f.getFirstMessageSubject(), date: m.getDate() };
    }) };
  } catch (err) { return { ok: false, message: String(err) }; }
}

function brief_construire_(jourIso) {
  var d0 = brief_dateLocale_(jourIso, '00:00');
  var fin = new Date(d0.getTime() + (BRIEF_CFG.joursDesistement + 1) * 86400000);
  var evts = brief_lireAgenda_(d0, fin);
  var classeur = brief_lireClasseur_();
  var gmail = brief_lireGmail_();
  return brief_coeur_(jourIso, evts, classeur, gmail);
}

/* ===================== CŒUR (pur, testable) ===================== */

function brief_coeur_(jourIso, evts, classeur, gmail) {
  var C = BRIEF_CFG;
  var parJour = {};
  evts.forEach(function (e) {
    var k = brief_iso_(e.debut);
    (parJour[k] = parJour[k] || []).push(brief_analyser_(e));
  });
  Object.keys(parJour).forEach(function (k) { parJour[k].sort(function (a, b) { return a.debut - b.debut; }); });

  var jourInfo = brief_infoJour_(jourIso, parJour[jourIso] || []);
  var rdvJour = jourInfo.rdv;

  // Jours d'anticipation (ouvrés) : aujourd'hui + N
  var joursAnticip = brief_joursOuvres_(jourIso, C.joursAnticipation + 1, parJour);
  var aVenir = [];
  joursAnticip.forEach(function (j) { (parJour[j] || []).forEach(function (e) { if (!e.journee) aVenir.push(e); }); });

  var prothAttendues = aVenir.filter(function (e) { return e.estProthese && !e.prothRecue; });
  var prothRecues = aVenir.filter(function (e) { return e.estProthese && e.prothRecue; });
  var poses = aVenir.filter(function (e) { return e.estPoseImplant; });
  var chirSansRef = poses.filter(function (e) { return !e.refImplant; });
  var empreintes = rdvJour.filter(function (e) { return e.estEmpreinte; });
  var urgences = rdvJour.filter(function (e) { return e.estUrgence || e.estNouveau; });
  var flags = rdvJour.filter(function (e) { return e.flag; });

  // Dossiers implanto / prothèse du jour → croisement classeur
  var dossiers = [];
  if (classeur && classeur.ok) {
    rdvJour.filter(function (e) { return e.estPoseImplant || e.estProthese || e.estChirurgie; }).forEach(function (e) {
      var m = brief_trouverPatient_(e.patient, classeur.marion);
      var l = brief_trouverPatient_(e.patient, classeur.lucie);
      if (m || l) dossiers.push({ e: e, etape: m ? m['Étape en cours'] : '', acte: m ? m['Acte prévu'] : '',
                                 planif: l ? l['Planification validée'] : '' });
    });
  }

  // Désistements : patients prêts à venir plus tôt
  var desist = [];
  Object.keys(parJour).sort().forEach(function (k) {
    if (k < jourIso) return;
    parJour[k].forEach(function (e) { if (!e.journee && e.desistement) desist.push(e); });
  });

  // Créneaux libres
  var creneaux = [];
  brief_joursOuvres_(jourIso, C.joursCreneaux, parJour).forEach(function (j) {
    var info = brief_infoJour_(j, parJour[j] || []);
    if (info.ferme || info.rdv.length === 0) return;          // jour sans consultation : ignoré sans bruit
    if (info.rdv.length < C.minRdvPourAnalyserJour) { creneaux.push({ jour: j, nonAnalyse: true, n: info.rdv.length }); return; }
    var trous = brief_trous_(j, parJour[j] || []);
    if (trous.length) creneaux.push({ jour: j, trous: trous });
  });

  var nAlertes = jourInfo.alertes.length + prothAttendues.length + chirSansRef.length + flags.length;
  var stats = { jour: jourIso, ferme: jourInfo.ferme, rdv: rdvJour.length, prothAttendues: prothAttendues.length, chirSansRef: chirSansRef.length,
                desistement: desist.length, joursAvecCreneaux: creneaux.filter(function (c) { return c.trous; }).length,
                dossiersCroises: dossiers.length, gmailNonLus: gmail && gmail.ok ? gmail.total : null };

  if (jourInfo.incoherent) nAlertes++;
  var objet = '☀️ Brief ' + brief_jourLong_(jourIso) + ' · ' + rdvJour.length + ' RDV' +
              (nAlertes ? ' · ' + nAlertes + ' ⚠️' : '') + (jourInfo.ferme ? ' · FERMÉ' : '');

  // Code patient (jamais le nom) + fiches « à préparer / à vérifier » des RDV du jour
  var files = classeur && classeur.files;
  var code = brief_codeur_(files);
  var bloquants = [];
  if (files) files.lisa.forEach(function (g) {
    if (BRIEF_FILES.bloquantLisa.test(g.etiquette)) g.lignes.forEach(function (r) { bloquants.push({ 'Nom complet patient': r.nom, rang: g.etiquette }); });
  });
  var prepa = [], parFiche = {}, sansFiche = {};
  rdvJour.forEach(function (e) {
    if (!e.fiche) { var t = e.type || '(sans « Type : »)'; sansFiche[t] = (sansFiche[t] || 0) + 1; return; }
    var g = parFiche[e.fiche.cle];
    if (!g) { g = parFiche[e.fiche.cle] = { fiche: e.fiche, rdv: [] }; prepa.push(g); }
    var auto = e.fiche.auto || [], alertes = [], infos = [];
    if (auto.indexOf('ref') >= 0 && e.estPoseImplant) {
      if (e.refImplant) infos.push('réf. ' + e.refImplant); else alertes.push('référence implant absente de la note');
    }
    if (auto.indexOf('proth') >= 0 && !e.prothRecue) alertes.push('prothèse pas marquée reçue [proth✅]');
    if (auto.indexOf('lisa') >= 0) {
      var b = brief_trouverPatient_(e.patient, bloquants);
      if (b) alertes.push('dossier bloqué chez Lisa : ' + b.rang);
    }
    g.rdv.push({ e: e, alertes: alertes, infos: infos });
  });
  stats.fiches = prepa.length;
  stats.sansFiche = Object.keys(sansFiche).length;

  var html = brief_rendu_({ jourIso: jourIso, jourInfo: jourInfo, rdvJour: rdvJour, prothAttendues: prothAttendues,
    prothRecues: prothRecues, poses: poses, chirSansRef: chirSansRef, empreintes: empreintes, urgences: urgences,
    flags: flags, dossiers: dossiers, classeur: classeur, desist: desist, creneaux: creneaux, gmail: gmail,
    code: code, prepa: prepa, sansFiche: sansFiche });

  return { objet: objet, html: html, stats: stats,
           classeurInfo: classeur ? { ok: classeur.ok, message: classeur.message,
             marion: (classeur.marion || []).length, lucie: (classeur.lucie || []).length } : null };
}

/** Transforme un événement brut en objet métier. */
function brief_analyser_(e) {
  var C = BRIEF_CFG;
  var desc = String(e.desc || '').replace(/\r/g, '');
  var lignes = desc.split('\n');
  var type = '', note = [];
  for (var i = 0; i < lignes.length; i++) {
    var l = lignes[i].trim();
    var mt = l.match(/^Type\s*:\s*(.*)$/i);
    if (mt) { type = mt[1].trim(); break; }       // tout ce qui suit = coordonnées → ignoré
    if (!l || C.reProthRecue.test(l) || C.reLigneContact.test(l)) continue;
    note.push(l);
  }
  var noteTxt = note.join(' · ');
  var titre = String(e.titre || '').replace(/\[proth✅\]/gi, '').trim();
  var bas = (' ' + noteTxt + ' ').toLowerCase();
  var praticien = [], equipe = [];
  Object.keys(C.initiales).forEach(function (k) {
    if (new RegExp('(^|[^a-zà-ÿ])' + k + '([^a-zà-ÿ]|$)', 'i').test(bas)) praticien.push(C.initiales[k]);
  });
  C.equipe.forEach(function (p) { if (bas.indexOf(p) >= 0) equipe.push(p.charAt(0).toUpperCase() + p.slice(1)); });
  var o = {
    titre: titre, patient: titre, debut: e.debut, fin: e.fin, journee: !!e.journee,
    type: type, note: noteTxt, praticien: praticien.filter(function (x, i, a) { return a.indexOf(x) === i; }),
    equipe: equipe.filter(function (x, i, a) { return a.indexOf(x) === i; }),
    prothRecue: C.reProthRecue.test(e.titre) || C.reProthRecue.test(desc),
    estInterne: C.reTypeInterne.test(type) || (!type && !e.journee && !/[A-Z]{2,}/.test(titre)),
    refImplant: (noteTxt.match(C.reRefImplant) || [null])[0],
    desistement: C.reDesistement.test(noteTxt),
    flag: (noteTxt.match(C.reFlag) || [null])[0]
  };
  o.estProthese = C.reTypeProthese.test(type);
  o.estEmpreinte = C.reTypeEmpreinte.test(type);
  o.estChirurgie = C.reTypeChirurgie.test(type);
  o.estPoseImplant = C.reTypePoseImplant.test(type);
  o.estUrgence = C.reTypeUrgence.test(type);
  o.estNouveau = C.reTypeNouveau.test(type);
  if (o.estInterne) { o.estProthese = o.estEmpreinte = o.estChirurgie = o.estPoseImplant = false; }
  o.fiche = (o.estInterne || o.journee) ? null : brief_fiche_(type);
  return o;
}

function brief_infoJour_(jourIso, liste) {
  var C = BRIEF_CFG;
  var alertes = liste.filter(function (e) { return e.journee; }).map(function (e) { return e.titre; });
  var marqueFerme = alertes.some(function (t) { return C.reFerme.test(t); });
  var dow = brief_dateLocale_(jourIso, '12:00').getDay();
  var rdv = liste.filter(function (e) { return !e.journee && !e.estInterne; });
  var interne = liste.filter(function (e) { return !e.journee && e.estInterne; });
  // « Fermé » noté mais des RDV existent → on traite quand même la journée, avec une alerte
  var ferme = (dow === 0 || dow === 6) ? rdv.length === 0 : (marqueFerme && rdv.length === 0);
  var incoherent = marqueFerme && rdv.length > 0;
  return { alertes: alertes, ferme: ferme, incoherent: incoherent, rdv: rdv, interne: interne };
}

function brief_joursOuvres_(jourIso, n, parJour) {
  var out = [], d = brief_dateLocale_(jourIso, '12:00'), garde = 0;
  while (out.length < n && garde++ < 30) {
    var k = brief_iso_(d);
    if (!brief_infoJour_(k, parJour[k] || []).ferme) out.push(k);
    d = new Date(d.getTime() + 86400000);
  }
  return out;
}

function brief_trous_(jourIso, liste) {
  var C = BRIEF_CFG, trous = [];
  var occ = liste.filter(function (e) { return !e.journee; })
                 .map(function (e) { return [e.debut.getTime(), e.fin.getTime()]; })
                 .sort(function (a, b) { return a[0] - b[0]; });
  C.plages.forEach(function (p) {
    var cur = brief_dateLocale_(jourIso, p[0]).getTime(), finP = brief_dateLocale_(jourIso, p[1]).getTime();
    occ.forEach(function (o) {
      if (o[1] <= cur || o[0] >= finP) return;
      if (o[0] - cur >= C.creneauMinMinutes * 60000) trous.push([cur, o[0]]);
      cur = Math.max(cur, o[1]);
    });
    if (finP - cur >= C.creneauMinMinutes * 60000) trous.push([cur, finP]);
  });
  return trous.map(function (t) { return { de: new Date(t[0]), a: new Date(t[1]), min: Math.round((t[1] - t[0]) / 60000) }; });
}

function brief_trouverPatient_(nomAgenda, lignes) {
  if (!lignes || !lignes.length) return null;
  var n = brief_norm_(nomAgenda);
  var exact = lignes.filter(function (l) { return brief_norm_(l['Nom complet patient']) === n; });
  if (exact.length) return exact[exact.length - 1];
  var mots = n.split(' ').filter(function (m) { return m.length > 2; });
  var proche = lignes.filter(function (l) {
    var c = brief_norm_(l['Nom complet patient']);
    return mots.length >= 2 && mots.every(function (m) { return c.indexOf(m) >= 0; });
  });
  return proche.length === 1 ? proche[0] : null;   // jamais de rapprochement ambigu
}

/* ===================== RENDU HTML ===================== */

function brief_rendu_(d) {
  var h = [], esc = brief_esc_;
  var css = {
    h2: 'font:600 15px Arial;margin:18px 0 6px;color:#1f2a44;border-bottom:1px solid #dde2ea;padding-bottom:3px',
    td: 'padding:3px 8px;font:13px Arial;vertical-align:top;border-bottom:1px solid #f0f2f5',
    p: 'font:13px Arial;margin:4px 0;color:#333', vide: 'font:13px Arial;color:#8a94a6;margin:4px 0'
  };
  function titre(t) { h.push('<div style="' + css.h2 + '">' + t + '</div>'); }
  function vide(t) { h.push('<div style="' + css.vide + '">' + (t || 'Rien à signaler.') + '</div>'); }
  // Patient : son code, jamais son nom. Notes : le nom est retiré s'il y a été recopié.
  var code = d.code || function (nom) { return nom; };
  function qui(e, apres) { var c = code(e.patient); return c ? esc(c) + (apres || '') : ''; }
  function note(e) { return esc(brief_masquerNom_(e.note, e.patient)); }
  function ligne(e, extra) {
    return '<b>' + brief_jourCourt_(e.debut) + ' ' + brief_heure_(e.debut) + '</b> · ' + qui(e, ' · ') +
           '<i>' + esc(e.type || '—') + '</i>' + (extra ? ' · ' + extra : '');
  }
  function liste(arr, fn) { h.push('<ul style="margin:4px 0 4px 18px;padding:0">'); arr.forEach(function (x) {
    h.push('<li style="' + css.p + '">' + fn(x) + '</li>'); }); h.push('</ul>'); }

  h.push('<div style="max-width:720px">');
  h.push('<div style="font:700 18px Arial;color:#1f2a44">☀️ Brief du ' + esc(brief_jourLong_(d.jourIso)) + '</div>');
  h.push('<div style="' + css.vide + '">Sources : Google Agenda · classeur Transmissions · Gmail. Généré automatiquement, sans IA.' +
         (BRIEF_CFG.codePatient === 'aucun' ? ' Patients non nommés : heure + type.' :
          ' Patients en code (initiales' + (BRIEF_CFG.codePatient === 'auto' ? ' + n° de dossier du classeur' : '') + ') ; le nom est dans l\'agenda et Logos.') + '</div>');

  // 1. Alertes
  titre('⚠️ Alertes');
  var al = d.jourInfo.alertes.slice();
  if (d.jourInfo.ferme) al.unshift('CABINET FERMÉ aujourd\'hui');
  if (d.jourInfo.incoherent) al.unshift('<b>« Fermé » noté dans l\'agenda mais ' + d.rdvJour.length + ' RDV patient(s) prévus — à vérifier</b>');
  if (al.length) liste(al, function (t) { return /^<b>/.test(t) ? t : esc(t); }); else vide('Aucune alerte journée.');

  // 2. Planning
  titre('📅 Planning (' + d.rdvJour.length + ' RDV)');
  if (d.rdvJour.length) {
    h.push('<table style="border-collapse:collapse;width:100%">');
    d.rdvJour.forEach(function (e) {
      var tags = e.praticien.concat(e.equipe).join(', ');
      var badges = (e.estProthese ? (e.prothRecue ? ' ✅proth' : ' ⚠️proth') : '') +
                   (e.estPoseImplant ? (e.refImplant ? ' 🦷' + esc(e.refImplant) : ' ⚠️réf') : '');
      h.push('<tr><td style="' + css.td + ';white-space:nowrap"><b>' + brief_heure_(e.debut) + '</b>–' + brief_heure_(e.fin) +
             '</td><td style="' + css.td + '">' + (qui(e) || '—') + badges + '</td><td style="' + css.td + '"><i>' + esc(e.type || '—') +
             '</i></td><td style="' + css.td + ';color:#555">' + note(e) + (tags ? ' <span style="color:#8a94a6">[' + esc(tags) + ']</span>' : '') + '</td></tr>');
    });
    h.push('</table>');
  } else vide('Aucun RDV patient.');
  if (d.jourInfo.interne.length) h.push('<div style="' + css.vide + '">Interne : ' +
    d.jourInfo.interne.map(function (e) { return brief_heure_(e.debut) + ' ' + esc(e.titre || e.note); }).join(' · ') + '</div>');

  // 2 bis. À préparer et vérifier, par type de RDV (fiches BRIEF_PREPA)
  if (d.prepa && d.rdvJour.length) {
    titre('🧰 À préparer et vérifier');
    h.push('<div style="' + css.vide + '">Pour tous : ' + BRIEF_PREPA_TOUS.map(esc).join(' · ') + '</div>');
    var bloc = 'margin:10px 0 0;padding:8px 10px;border:1px solid #dde2ea;border-radius:8px';
    var sous = 'font:600 12px Arial;color:#5b6577;margin:6px 0 2px;text-transform:uppercase;letter-spacing:.03em';
    d.prepa.forEach(function (g) {
      h.push('<div style="' + bloc + '">');
      h.push('<div style="' + css.p + '"><b>' + esc(g.fiche.nom) + '</b> — ' + g.rdv.map(function (x) {
        return '<b>' + brief_heure_(x.e.debut) + '</b>' + (qui(x.e) ? ' ' + qui(x.e) : '') +
               (x.infos.length ? ' <span style="color:#5b6577">(' + x.infos.map(esc).join(', ') + ')</span>' : '');
      }).join(' · ') + '</div>');
      g.rdv.forEach(function (x) { x.alertes.forEach(function (a) {
        h.push('<div style="' + css.p + ';color:#b3261e">⚠️ <b>' + brief_heure_(x.e.debut) + '</b> ' + qui(x.e) + ' : ' + esc(a) + '</div>');
      }); });
      function cases(titre, arr) {
        if (!arr.length) return;
        h.push('<div style="' + sous + '">' + titre + '</div><div style="margin:0 0 2px 2px">');
        arr.forEach(function (t) { h.push('<div style="' + css.p + ';margin:2px 0">☐ ' + esc(t) + '</div>'); });
        h.push('</div>');
      }
      cases('Préparer', g.fiche.preparer);
      cases('Vérifier', g.fiche.verifier);
      h.push('</div>');
    });
    var sf = Object.keys(d.sansFiche || {});
    if (sf.length) h.push('<div style="' + css.vide + ';margin-top:8px">Sans fiche : ' + sf.map(function (t) {
      return '« ' + esc(t) + ' »' + (d.sansFiche[t] > 1 ? ' ×' + d.sansFiche[t] : ''); }).join(', ') +
      ' — à ajouter dans BRIEF_PREPA si utile.</div>');
  }

  // 3. Labo
  titre('🧪 Labo — prothèses à confirmer (jusqu\'à J+' + BRIEF_CFG.joursAnticipation + ' ouvrés)');
  if (d.prothAttendues.length) liste(d.prothAttendues, function (e) { return ligne(e, '⚠️ pas de [proth✅]'); });
  else vide('Toutes les prothèses attendues sont marquées reçues.');
  if (d.prothRecues.length) h.push('<div style="' + css.vide + '">Déjà reçues : ' +
    d.prothRecues.map(function (e) { return brief_heure_(e.debut) + ' ' + qui(e); }).join(', ') + '</div>');
  if (d.empreintes.length) { h.push('<div style="' + css.p + '"><b>Empreintes du jour à envoyer au labo :</b></div>');
    liste(d.empreintes, function (e) { return ligne(e, note(e)); }); }

  // 4. Chirurgie
  titre('🔧 Poses implant (jusqu\'à J+' + BRIEF_CFG.joursAnticipation + ' ouvrés)');
  if (d.poses.length) liste(d.poses, function (e) {
    return ligne(e, e.refImplant ? 'réf. ' + esc(e.refImplant) : '<b style="color:#b3261e">⚠️ référence implant absente de la note</b>') +
           (e.note ? ' — ' + note(e) : ''); });
  else vide('Aucune pose prévue.');

  // 5. Dossiers
  titre('📂 Dossiers implanto / prothèse du jour (classeur)');
  if (!d.classeur || !d.classeur.ok) vide('⚠️ Classeur non lu : ' + esc(d.classeur ? d.classeur.message : 'inconnu') + ' — section ignorée.');
  else if (d.dossiers.length) liste(d.dossiers, function (x) {
    return ligne(x.e) + '<br><span style="color:#555">Étape : ' + esc(x.etape || '—') +
           (x.planif ? ' · Planif Lucie : ' + esc(x.planif) : '') + '</span>'; });
  else vide('Aucun RDV du jour retrouvé dans le classeur (rapprochement par nom complet, jamais approximatif).');

  brief_renduFiles_(d.classeur && d.classeur.files, h, css, d.code);

  // 6. Urgences / nouveaux
  titre('🚑 Urgences & nouveaux patients du jour');
  if (d.urgences.length) liste(d.urgences, function (e) { return ligne(e, note(e)); }); else vide();
  if (d.flags.length) { h.push('<div style="' + css.p + '"><b>Notes à relire :</b></div>');
    liste(d.flags, function (e) { return ligne(e, '« ' + esc(e.flag) + ' » — ' + note(e)); }); }

  // 7. Créneaux + désistements
  titre('🕳️ Créneaux libres (' + BRIEF_CFG.joursCreneaux + ' jours ouvrés)');
  var avec = d.creneaux.filter(function (c) { return c.trous; });
  if (avec.length) liste(avec, function (c) {
    return '<b>' + esc(brief_jourLong_(c.jour)) + '</b> : ' + c.trous.map(function (t) {
      return brief_heure_(t.de) + '–' + brief_heure_(t.a) + ' (' + t.min + ' min)'; }).join(', '); });
  else vide('Aucun trou ≥ ' + BRIEF_CFG.creneauMinMinutes + ' min sur les jours analysés.');
  var na = d.creneaux.filter(function (c) { return c.nonAnalyse; });
  if (na.length) h.push('<div style="' + css.vide + '">Non analysés (planning pas rempli) : ' +
    na.map(function (c) { return esc(brief_jourLong_(c.jour)) + ' (' + c.n + ' RDV)'; }).join(', ') + '</div>');
  h.push('<div style="' + css.p + '"><b>Patients à appeler si désistement :</b></div>');
  if (d.desist.length) liste(d.desist, function (e) { return (qui(e) || '—') + ' — RDV actuel ' + brief_jourCourt_(e.debut) + ' ' +
    brief_heure_(e.debut) + ' · <i>' + esc(e.type) + '</i>'; });
  else vide('Personne marqué « si désistement » dans les notes.');

  // 8. Gmail
  titre('✉️ Mails non lus depuis plus de 24 h');
  if (!d.gmail || !d.gmail.ok) vide('⚠️ Gmail non lu — section ignorée.');
  else if (d.gmail.total) {
    h.push('<div style="' + css.p + '"><b>' + d.gmail.total + (d.gmail.total >= 50 ? '+' : '') + '</b> fil(s) en attente · ' +
           '<a href="https://mail.google.com/mail/#search/' + encodeURIComponent(BRIEF_CFG.gmailRequete) +
           '" style="color:#1a56b0;text-decoration:none">ouvrir dans Gmail</a></div>');
    if (BRIEF_CFG.gmailDetail) liste(d.gmail.liste, function (m) { return esc(m.de) + ' — ' + esc(m.objet); });
    else {
      // Sans nom ni objet : expéditeurs par domaine, les adresses personnelles regroupées en « particuliers »
      var perso = /^(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|orange|wanadoo|free|sfr|neuf|laposte|icloud|me|bbox|aol|gmx|numericable|club-internet)\./i;
      var dom = {}, ordre = [];
      d.gmail.liste.forEach(function (m) {
        var k = !m.domaine ? 'inconnu' : perso.test(m.domaine) ? 'particuliers' : m.domaine;
        if (!dom[k]) { dom[k] = 0; ordre.push(k); } dom[k]++;
      });
      h.push('<div style="' + css.vide + '">' + d.gmail.liste.length + ' plus récents : ' +
             ordre.map(function (k) { return esc(k) + (dom[k] > 1 ? ' ×' + dom[k] : ''); }).join(' · ') + '</div>');
    }
  } else vide('Boîte à jour.');

  h.push('</div>');
  return h.join('');
}

/* ===================== OUTILS ===================== */

/**
 * Fabrique la fonction nom → code patient, selon BRIEF_CFG.codePatient.
 * Le n° de dossier vient des onglets Lisa / Marion (colonne « ID dossier »), rapprochés par nom exact
 * ou sans ambiguïté (même règle que les dossiers du jour : jamais approximatif).
 */
function brief_codeur_(files) {
  var mode = BRIEF_CFG.codePatient;
  var ids = (files && files.ids) || [];
  return function (nom, id) {
    if (mode === 'aucun') return '';
    var ini = brief_initiales_(nom);
    if (mode === 'initiales') return ini;
    if (!id) { var r = brief_trouverPatient_(nom, ids); id = r ? r.id : ''; }
    return ini + (id ? ' #' + id : '');
  };
}

/** « DUPONT Jean » → « D.J. » · « Mme MARTIN-LEROY Anne » → « M.L.A. » (civilités et particules ignorées, 3 lettres max). */
function brief_initiales_(nom) {
  var mots = brief_norm_(nom).split(' ').filter(function (m) {
    return /^[A-Z]/.test(m) && !/^(M|MR|MME|MLLE|MM|MONSIEUR|MADAME|DR|ET|DE|DU|DES|D|LE|LA|EP|EPOUSE|NEE|VVE)$/.test(m);
  });
  return mots.length ? mots.slice(0, 3).map(function (m) { return m.charAt(0); }).join('.') + '.' : '—';
}

/** Retire de `texte` les mots du nom du patient (≥ 3 lettres) s'ils y ont été recopiés. */
function brief_masquerNom_(texte, nom) {
  var t = String(texte || '');
  String(nom || '').split(/[^A-Za-zÀ-ÿ'’-]+/).filter(function (m) {
    return m.length >= 3 && !/^(mme|mlle|madame|monsieur)$/i.test(m);
  }).forEach(function (m) {
    var mot = m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp('(^|[^A-Za-zÀ-ÿ])' + mot + '(?=$|[^A-Za-zÀ-ÿ])', 'gi'), '$1…');
  });
  return t;
}

function brief_norm_(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function brief_esc_(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function brief_fmt_(d, motif) {
  return Utilities.formatDate(d, BRIEF_CFG.fuseau, motif);
}
function brief_iso_(d) { return brief_fmt_(d, 'yyyy-MM-dd'); }
function brief_heure_(d) { return brief_fmt_(d, 'HH:mm'); }
function brief_jourCourt_(d) {
  var j = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'][Number(brief_fmt_(d, 'u')) % 7];
  return j + ' ' + brief_fmt_(d, 'dd/MM');
}
function brief_jourLong_(iso) {
  var d = brief_dateLocale_(iso, '12:00');
  var j = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][d.getDay()];
  return j + ' ' + iso.slice(8, 10) + '/' + iso.slice(5, 7);
}
/** Date absolue correspondant à jourIso + 'HH:mm' heure de Paris. */
function brief_dateLocale_(iso, hhmm) {
  var guess = new Date(iso + 'T' + hhmm + ':00Z');
  for (var i = 0; i < 2; i++) {
    var vu = brief_fmt_(guess, 'yyyy-MM-dd HH:mm');
    var cible = iso + ' ' + hhmm;
    var diff = (new Date(cible.replace(' ', 'T') + ':00Z') - new Date(vu.replace(' ', 'T') + ':00Z'));
    guess = new Date(guess.getTime() + diff);
  }
  return guess;
}


/* ===================== FILES DE L'ÉQUIPE (lecture seule) ===================== */

var BRIEF_FILES = {
  seuilCicatrisation: 75,   // J+ à partir duquel on signale une fin de cicatrisation proche
  bloquantLisa: /documents?\s*à\s*déposer|PEC\s*à\s*finaliser/i,   // rangs Lisa qui interdisent le RDV
  lisa:   { onglet: 'Lisa',   req: { nom: ['Nom complet patient', 'Nom'], rang: ['Rang Lisa'] },
            opt: { id: ['ID dossier'], cloture: ['Dossier clôturé'] } },
  marion: { onglet: 'Marion', req: { nom: ['Nom complet patient'], etape: ['Étape en cours'] },
            opt: { id: ['ID dossier'], rdv: ['Prochain RDV — date'] } },
  facturer: '🧾 À facturer'
};

function brief_lireFiles_(ss) {
  var F = BRIEF_FILES, out = { lisa: [], marion: [], lucie: [], cicat: [], bloques: 0, facturer: '', erreurs: [], ids: [] };
  // ids : toutes les lignes portant un n° de dossier (sert au code patient), avant tout filtrage
  function retenirIds(rows) { rows.forEach(function (r) { if (r.id) out.ids.push({ 'Nom complet patient': r.nom, id: r.id }); }); return rows; }
  function clos(r) { return /⛔\s*Cl[oô]tur/i.test(r._ligne) || /☑/.test(r.cloture || ''); }
  function cle(r) { return r.id ? 'ID:' + r.id : 'NOM:' + brief_norm_(r.nom); }
  function grouper(rows, champ) {
    var g = {}, ordre = [];
    rows.forEach(function (r) { var k = r[champ]; if (!g[k]) { g[k] = []; ordre.push(k); } g[k].push(r); });
    return ordre.sort().map(function (k) { return { etiquette: k, lignes: g[k] }; });
  }
  var bloques = {};
  try {
    var l = retenirIds(brief_file_(ss, F.lisa)).filter(function (r) { return r.rang && !/^9/.test(r.rang) && !clos(r); });
    l.forEach(function (r) { if (F.bloquantLisa.test(r.rang)) { bloques[cle(r)] = true; bloques['NOM:' + brief_norm_(r.nom)] = true; } });
    out.lisa = grouper(l, 'rang');
  } catch (e) { out.erreurs.push(String(e.message || e)); }
  try {
    var m = retenirIds(brief_file_(ss, F.marion)).filter(function (r) { return !clos(r); });
    var mar = m.filter(function (r) { return /🟠/.test(r.etape) && !/lucie/i.test(r.etape); });
    var libres = mar.filter(function (r) { return !(bloques[cle(r)] || bloques['NOM:' + brief_norm_(r.nom)]); });
    out.bloques = mar.length - libres.length;
    out.marion = grouper(libres, 'etape');
    out.lucie = grouper(m.filter(function (r) { return /🟠/.test(r.etape) && /lucie/i.test(r.etape); }), 'etape');
    m.forEach(function (r) {
      var j = (r.etape.match(/cicatrisation\s*\(J\+(\d+)/i) || [])[1];
      if (j && Number(j) >= F.seuilCicatrisation) { r.j = Number(j); out.cicat.push(r); }
    });
    out.cicat.sort(function (a, b) { return b.j - a.j; });
  } catch (e) { out.erreurs.push(String(e.message || e)); }
  try {
    var sh = ss.getSheetByName(F.facturer);
    if (sh) { out.facturer = String(sh.getRange('A2').getDisplayValue() || '').trim();
              out.facturerUrl = brief_urlLigne_(sh, 1); }
  } catch (e) { out.erreurs.push(String(e.message || e)); }
  return out;
}

function brief_urlLigne_(sh, ligne) {
  return 'https://docs.google.com/spreadsheets/d/' + BRIEF_CFG.classeurId + '/edit#gid=' + sh.getSheetId() + '&range=A' + ligne;
}

/** Lit un onglet : colonnes par NOM (égalité d'abord, sinon « contient »). Chaque ligne porte son lien direct. */
function brief_file_(ss, cfg) {
  var sh = ss.getSheetByName(cfg.onglet);
  if (!sh) throw new Error('onglet « ' + cfg.onglet + ' » introuvable');
  var v = sh.getDataRange().getDisplayValues();
  function chercher(ligne, noms) {
    for (var n = 0; n < noms.length; n++) {
      var cible = brief_norm_(noms[n]);
      for (var k = 0; k < ligne.length; k++) if (brief_norm_(ligne[k]) === cible) return k;
      for (k = 0; k < ligne.length; k++) if (brief_norm_(ligne[k]).indexOf(cible) >= 0) return k;
    }
    return -1;
  }
  var ent = -1, idx = {};
  for (var r = 0; r < Math.min(8, v.length) && ent < 0; r++) {
    var tmp = {}, ok = true;
    Object.keys(cfg.req).forEach(function (c) { var k = chercher(v[r], cfg.req[c]); if (k < 0) ok = false; tmp[c] = k; });
    if (ok) { ent = r; idx = tmp; Object.keys(cfg.opt || {}).forEach(function (c) { idx[c] = chercher(v[r], cfg.opt[c]); }); }
  }
  if (ent < 0) throw new Error(cfg.onglet + ' : colonnes introuvables (' + Object.keys(cfg.req).join(', ') + ')');
  var out = [];
  for (var i = ent + 1; i < v.length; i++) {
    var o = { _ligne: v[i].join(' '), url: brief_urlLigne_(sh, i + 1) };
    Object.keys(idx).forEach(function (c) { o[c] = idx[c] >= 0 ? String(v[i][idx[c]] || '').trim() : ''; });
    if (o.nom) out.push(o);
  }
  return out;
}

function brief_renduFiles_(f, h, css, code) {
  var esc = brief_esc_;
  function lien(r) { return '<a href="' + esc(r.url) + '" style="color:#1a56b0;text-decoration:none">' + esc(code ? code(r.nom, r.id) || 'dossier' : r.nom) + '</a>'; }
  h.push('<div style="' + css.h2 + '">👥 Files de l\'équipe (classeur) — clic sur un nom = ligne du patient</div>');
  if (!f) { h.push('<div style="' + css.vide + '">⚠️ Classeur non lu — section ignorée.</div>'); return; }
  function total(groupes) { return groupes.reduce(function (s, g) { return s + g.lignes.length; }, 0); }
  function personne(titre, groupes, note) {
    h.push('<div style="' + css.p + ';margin-top:10px"><b>' + titre + '</b> — ' + total(groupes) + ' dossier(s)</div>');
    if (note) h.push('<div style="' + css.vide + '">' + note + '</div>');
    if (!groupes.length) { h.push('<div style="' + css.vide + '">Rien en attente.</div>'); return; }
    h.push('<ul style="margin:4px 0 4px 18px;padding:0">');
    groupes.forEach(function (g) {
      h.push('<li style="' + css.p + '"><b>' + esc(g.etiquette) + '</b> (' + g.lignes.length + ') : ' + g.lignes.map(lien).join(', ') + '</li>');
    });
    h.push('</ul>');
  }
  personne('Lisa', f.lisa);
  personne('Marion', f.marion, f.bloques ? f.bloques + ' dossier(s) masqué(s) : bloqués chez Lisa (documents à déposer / PEC à finaliser) — pas de RDV possible.' : '');
  personne('Lucie', f.lucie);
  if (f.cicat.length) {
    h.push('<div style="' + css.p + ';margin-top:10px"><b>⏳ Fin de cicatrisation proche (≥ J+' + BRIEF_FILES.seuilCicatrisation +
           ') — RDV pilier + couronne à prévoir :</b> ' + f.cicat.map(function (c) { return lien(c) + ' (J+' + c.j + ')'; }).join(', ') + '</div>');
  }
  if (f.facturer) h.push('<div style="' + css.p + ';margin-top:10px"><b>🧾 <a href="' + esc(f.facturerUrl || '') + '" style="color:#1a56b0;text-decoration:none">Facturation mutuelle</a> :</b> ' + esc(f.facturer) + '</div>');
  if (f.erreurs.length) h.push('<div style="' + css.vide + '">⚠️ ' + f.erreurs.map(esc).join(' · ') + '</div>');
}

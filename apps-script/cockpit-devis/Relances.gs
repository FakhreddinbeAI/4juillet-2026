/**
 * RELANCES.gs — relances patient J7 / J15 / J30, « Devis signé reçu » et passage du dossier chez Lisa.
 * ------------------------------------------------------------------------------------------------
 * Décisions du Dr (21/10/2026, voir CENTRAL_TRANSMISSIONS_DEVIS.md) :
 *   - chaque relance rappelle de SIGNER le devis et redonne tout (devis rejoint, montants, comment signer) ;
 *   - J7 = questions · J15 = mutuelle et papiers · J30 = CONTINUER / ATTENTE / APPEL ; après J30, plus rien ;
 *   - un dossier passe chez Lisa quand le patient a SIGNÉ le devis.
 * Textes : cockpit/RELANCES_J7_J15_J30.md (version 3).
 *
 * relance_installer()     ajoute les colonnes / statuts manquants, puis crée le déclencheur quotidien (9 h)
 * relance_tourner()       passe quotidien : lit les réponses des patients, puis envoie les relances dues
 * relance_test()          simulation : affiche ce qui partirait aujourd'hui, n'envoie rien, n'écrit rien
 * relance_supprimerDeclencheur()
 *
 * Envois : comme le J0, MODE_ENVOI = 'TEST' (défaut) → tout part vers DEST_TEST, jamais au patient ;
 *          la date est alors notée « TEST jj/mm/aaaa » et ne compte plus une fois MODE_ENVOI = 'REEL'.
 * Réponses : API Gmail en lecture seule (service avancé « Gmail », autorisation gmail.readonly).
 * Passage chez Lisa : propriété SYNCHRO_LISA = 'OFF' (défaut, rien) | 'TEST' (journal seulement) | 'ON' (écrit).
 */

var RELANCE_CFG = {
  etapes: [{ cle: 'J7', jours: 7, colonne: 'Relance 1' },
           { cle: 'J15', jours: 15, colonne: 'Relance 2' },
           { cle: 'J30', jours: 30, colonne: 'Relance 3' }],
  statutsRelancables: ['Devis envoyé', 'Devis envoyé et lu'],
  heureDebut: 8, heureFin: 20,               // jamais en dehors de 8 h – 20 h, jamais le dimanche
  delaiEntreRelancesJours: 7,                // une seule relance par patient sur 7 jours glissants
  adresseCabinet: 'contact@implantologielege.com',
  telephone: '02 40 26 36 00',
  // mots-réponses reconnus en tête de la réponse du patient (J30 + désinscription)
  motsReponse: { CONTINUER: 'Continuer', ATTENTE: 'Attente', APPEL: 'Appel', STOP: 'Stop' },
  actionsReponse: {
    Continuer: 'Appeler pour organiser le traitement', Attente: 'Dossier en attente (choix du patient)',
    Appel: 'Appeler le patient', Stop: 'Ne plus relancer (STOP)', Lue: 'Lire la réponse du patient (Gmail)'
  },
  lisa: { onglet: 'Lisa', ligneEntetes: 3, premiereLigne: 4, statutDevis: 'Accepté' }
};

/* ============================ INSTALLATION ============================ */

function relance_installer() {
  relance_migrer_();
  relance_supprimerDeclencheur();
  ScriptApp.newTrigger('relance_tourner').timeBased().atHour(9).everyDays(1).inTimezone(COCKPIT_CFG.fuseau).create();
  Logger.log('Relances : passage quotidien à 9 h. Mode d\'envoi : ' + ecran_mode_().mode +
             ' · passage chez Lisa : ' + relance_modeLisa_() + '.');
}

function relance_supprimerDeclencheur() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'relance_tourner') ScriptApp.deleteTrigger(t); });
}

/** Ajoute à la base les colonnes et statuts apparus avec les relances (sans toucher aux colonnes existantes). */
function relance_migrer_() {
  var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_();
  if (sh.getMaxColumns() < H.length) sh.insertColumnsAfter(sh.getMaxColumns(), H.length - sh.getMaxColumns());
  var actuels = sh.getRange(1, 1, 1, H.length).getValues()[0], ajout = [];
  H.forEach(function (h, i) {
    if (String(actuels[i]) === h) return;
    if (String(actuels[i]) !== '') throw new Error('Colonne ' + (i + 1) + ' : « ' + actuels[i] + ' » au lieu de « ' + h + ' ». Migration arrêtée, rien n\'a été modifié.');
    ajout.push(i);
  });
  ajout.forEach(function (i) { sh.getRange(1, i + 1).setValue(H[i]).setFontWeight('bold').setBackground('#E8EEF5').setWrap(true); });
  sh.getRange(2, H.indexOf('Statut') + 1, Math.max(sh.getMaxRows() - 1, 1), 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(COCKPIT_CFG.statuts, true).build());
  if (ajout.length) cockpit_journal_(ss, '', 'système', 'Migration relances', 'colonnes ajoutées : ' + ajout.map(function (i) { return H[i]; }).join(', '));
}

/* ============================ PASSAGE QUOTIDIEN ============================ */

function relance_tourner() { return relance_passage_(false); }

/** Simulation : ce qui partirait aujourd'hui. N'envoie rien, n'écrit rien. */
function relance_test() {
  var r = relance_passage_(true);
  Logger.log(r.length ? r.join('\n') : 'Aucune relance due aujourd\'hui.');
}

function relance_passage_(simulation) {
  var maintenant = new Date(), heure = Number(Utilities.formatDate(maintenant, COCKPIT_CFG.fuseau, 'H'));
  var dimanche = Utilities.formatDate(maintenant, COCKPIT_CFG.fuseau, 'u') === '7';
  if (!simulation && (dimanche || heure < RELANCE_CFG.heureDebut || heure >= RELANCE_CFG.heureFin)) return ['Hors plage d\'envoi : rien.'];
  var verrou = LockService.getScriptLock();
  if (!simulation && !verrou.tryLock(20000)) return ['Verrou occupé : passage reporté.'];
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), n = cockpit_prochaineLigne_(sh) - 2, rapport = [];
    if (n < 1) return rapport;
    var lignes = sh.getRange(2, 1, n, H.length).getValues().map(function (row, i) { return { r: i + 2, o: ecran_obj_(H, row) }; });
    var aujourdhui = relance_jour_(maintenant);

    // 1. Réponses des patients (Gmail) : une réponse arrête les relances de tous ses devis.
    lignes.forEach(function (L) {
      if (!relance_suivi_(L.o) || L.o['Réponse patient']) return;   // déjà répondu : c'est l'équipe qui prend la main
      var rep = relance_reponse_(L.o);
      if (!rep) return;
      rapport.push(L.o['ID dossier'] + ' : réponse du patient (' + rep.type + ')');
      if (simulation) { L.o['Réponse patient'] = rep.type; return; }
      relance_appliquerReponse_(ss, sh, H, L, rep);
    });

    // 2. Relances dues, une par patient.
    var vus = {};
    lignes.forEach(function (L) {
      var o = L.o, cle = relance_adresse_(o['E-mail']);
      if (!relance_suivi_(o) || o['Réponse patient'] || !cle) return;
      if (cle === relance_adresse_(RELANCE_CFG.adresseCabinet)) return;
      var envoi = relance_lireDate_(o['Date d\'envoi']), validite = relance_lireDate_(o['Validité']);
      if (!envoi) return;
      if (validite && validite < aujourdhui) { rapport.push(o['ID dossier'] + ' : devis expiré, pas de relance'); return; }
      var jours = Math.round((aujourdhui - relance_jour_(envoi)) / 864e5), etape = null;
      RELANCE_CFG.etapes.forEach(function (e) { if (jours >= e.jours && !relance_faite_(o[e.colonne])) etape = e; });
      if (!etape) return;
      if (vus[cle] || relance_recente_(lignes, cle, aujourdhui)) { rapport.push(o['ID dossier'] + ' : ' + etape.cle + ' reportée (une relance par patient)'); return; }
      vus[cle] = true;
      rapport.push(o['ID dossier'] + ' : ' + etape.cle + ' (J+' + jours + ')' + (simulation ? ' — simulation' : ''));
      if (!simulation) relance_envoyer_(ss, sh, H, L, etape);
    });
    return rapport;
  } finally { if (!simulation) verrou.releaseLock(); }
}

/** Un dossier est suivi tant qu'il est envoyé, ni signé, ni décidé. */
function relance_suivi_(o) {
  return RELANCE_CFG.statutsRelancables.indexOf(o['Statut']) >= 0 && !o['Signé le'] && !o['Décision'];
}

/** Une relance a-t-elle déjà été envoyée à cette adresse (n'importe quel devis) dans les 7 derniers jours ? */
function relance_recente_(lignes, cle, aujourdhui) {
  return lignes.some(function (L) {
    if (relance_adresse_(L.o['E-mail']) !== cle) return false;
    return RELANCE_CFG.etapes.some(function (e) {
      var d = relance_faite_(L.o[e.colonne]) ? relance_lireDate_(L.o[e.colonne]) : null;
      return d && (aujourdhui - relance_jour_(d)) / 864e5 < RELANCE_CFG.delaiEntreRelancesJours;
    });
  });
}

/* ============================ ENVOI ============================ */

function relance_envoyer_(ss, sh, H, L, etape) {
  var o = L.o, m = ecran_mode_(), dest = m.mode === 'REEL' ? relance_adresse_(o['E-mail']) : m.testDest;
  var pieces = relance_pieces_(o);
  var c = relance_courrier_(o, etape.cle, pieces.documentsJ0);
  MailApp.sendEmail({ to: dest, subject: (m.mode === 'REEL' ? '' : '[TEST → ' + o['E-mail'] + '] ') + c.sujet,
                      body: c.texte, htmlBody: c.html, name: CABINET.nom, attachments: pieces.blobs });
  // En mode TEST la date est préfixée « TEST » : ces relances ne comptent plus une fois passé en REEL.
  var auj = (m.mode === 'REEL' ? '' : 'TEST ') + Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy');
  sh.getRange(L.r, H.indexOf(etape.colonne) + 1).setNumberFormat('@').setValue(auj);
  o[etape.colonne] = auj;
  cockpit_journal_(ss, o['ID dossier'], 'système', 'Relance ' + etape.cle, 'à ' + dest +
    (m.mode === 'REEL' ? '' : ' (MODE TEST, patient : ' + o['E-mail'] + ')') + ' · pièces : ' + pieces.titres.join(' + '));
}

/** Pièces jointes : le devis + les documents J0 que « Pièces reçues » ne mentionne pas encore. */
function relance_pieces_(o) {
  var recu = String(o['Pièces reçues'] || '').toLowerCase(), blobs = [], titres = [];
  var devis = DriveApp.getFileById(String(o['PDF du devis']).match(/[-\w]{25,}/)[0]);
  blobs.push(devis.getBlob().setName('Devis ' + o['ID dossier'] + (/\.pdf$/i.test(devis.getName()) ? '.pdf' : '.txt')));
  titres.push('devis');
  var j0 = docs_J0_(o, ecran_fiche(o['ID dossier']).actes);
  j0.documents.forEach(function (d) {
    if (/questionnaire/i.test(d.titre) && /questionnaire/.test(recu)) return;
    if (/consentement/i.test(d.titre) && /consentement/.test(recu)) return;
    blobs.push(d.fichier.getBlob()); titres.push(d.titre);
  });
  // « Questionnaire médical » → « le questionnaire médical » pour les phrases du mail
  var enPhrase = titres.slice(1).map(function (t) { return 'le ' + t.charAt(0).toLowerCase() + t.slice(1); });
  return { blobs: blobs, titres: titres, documentsJ0: enPhrase };
}

/* ============================ TEXTES (version 3 du 21/10/2026) ============================ */

function relance_courrier_(o, cle, piecesTitres) {
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var n = o['ID dossier'], validite = o['Validité'] || '—', T = [], Hh = [];
  var p = function (t) { T.push(t, ''); Hh.push('<p style="margin:0 0 10px">' + esc(t) + '</p>'); };
  var h = function (t) { T.push(t.toUpperCase()); Hh.push('<h3 style="margin:16px 0 6px;font-size:15px;color:#1b2a41">' + esc(t) + '</h3>'); };
  var li = function (arr, num) {
    arr.forEach(function (x, i) { T.push((num ? (i + 1) + '. ' : '• ') + x); }); T.push('');
    Hh.push('<' + (num ? 'ol' : 'ul') + ' style="margin:0 0 10px;padding-left:22px">' + arr.map(function (x) { return '<li style="margin-bottom:4px">' + esc(x) + '</li>'; }).join('') + '</' + (num ? 'ol' : 'ul') + '>');
  };
  var rac = (o['Remb. mutuelle (AMC)'] !== '' && o['Remb. mutuelle (AMC)'] != null)
    ? 'Reste à charge après mutuelle : ' + ecran_eur_(o['Reste à charge total'])
    : 'Reste à charge avant mutuelle : ' + ecran_eur_(o['Reste à charge avant mutuelle']);
  var docs = piecesTitres || relance_titresDocs_(o);
  var bloc = function () {
    h('Votre devis en un coup d\'œil');
    li(['Devis n° ' + n + ' du ' + (o['Date devis'] || '—') + (o['Description'] ? ' — ' + o['Description'] : ''),
        'Montant total : ' + ecran_eur_(o['Montant devis']),
        'Remboursement Assurance Maladie : ' + ecran_eur_(o['Remb. AMO']),
        rac, 'Valable jusqu\'au : ' + validite]);
    h('Pour signer (2 minutes)');
    li(['Imprimez le devis joint (ou demandez-nous un exemplaire papier).',
        'Datez, signez, et écrivez « Bon pour accord ».',
        'Renvoyez-le en réponse à ce message (une photo lisible suffit), ou déposez-le au cabinet.'], true);
    p('Pièces jointes : votre devis' + (docs.length ? ', ' + docs.join(', ') : '') + '.');
  };
  var sujet;
  p(o['Prénom'] ? 'Bonjour ' + o['Prénom'] + ',' : 'Bonjour,');
  if (cle === 'J7') {
    sujet = 'Votre devis n° ' + n + ' — avez-vous des questions ?';
    p('Il y a une semaine, nous vous avons adressé votre devis n° ' + n + ' ainsi que les explications sur le traitement proposé par le Dr Tighza.');
    p('Nous voulions nous assurer que tout est clair pour vous. Si un point mérite d\'être repris — le déroulement des séances, le calendrier, le coût ou les remboursements — répondez simplement à ce message ou appelez-nous : nous prendrons le temps de vous l\'expliquer.');
    p('Et si tout vous convient, avez-vous pensé à signer votre devis ? Nous vous le renvoyons ci-joint, avec l\'essentiel, pour que vous n\'ayez rien à rechercher.');
    bloc();
    p('Rien ne presse : votre devis reste valable jusqu\'au ' + validite + '.');
  } else if (cle === 'J15') {
    sujet = 'Votre devis n° ' + n + ' — signature, mutuelle et documents';
    p('Nous n\'avons pas encore reçu votre devis signé. C\'est souvent la mutuelle ou un document qui retarde les choses : voici de quoi tout finaliser, sans rien rechercher.');
    bloc();
    h('Votre mutuelle');
    li(['Vous avez sa réponse de prise en charge ? Envoyez-la-nous avec le devis signé : nous calculerons votre reste à charge définitif.',
        'Vous ne l\'avez pas encore sollicitée ? Nous pouvons faire la demande pour vous : il nous suffit d\'une photo lisible de votre carte de mutuelle.']);
    if (docs.length) {
      h('Vos documents');
      p('Avec le devis signé, merci de nous retourner ' + docs.join(' et ') + ', complétés et signés. Le questionnaire médical est confidentiel et réservé à votre praticien.');
    }
    p('Vous pouvez tout nous envoyer en réponse à ce message (photo ou scan), ou le déposer au cabinet.');
  } else {
    sujet = 'Votre devis n° ' + n + ' — comment souhaitez-vous poursuivre ?';
    p('Votre devis n° ' + n + ' du ' + (o['Date devis'] || '—') + ' n\'est pas encore signé, et nous voulions savoir comment vous souhaitez poursuivre. Nous vous le renvoyons une dernière fois, avec tous les éléments.');
    bloc();
    p('Vous pouvez aussi nous répondre par un seul mot :');
    li(['« CONTINUER » : vous souhaitez lancer le traitement, nous vous recontactons pour organiser la suite ;',
        '« ATTENTE » : vous préférez mettre votre dossier en attente pour le moment, nous ne vous relancerons plus ;',
        '« APPEL » : vous aimeriez en parler de vive voix, nous vous appelons.']);
    p('Si le projet n\'est plus d\'actualité, c\'est parfaitement entendu : vous n\'avez rien à nous répondre.');
    p('À savoir : passé le ' + validite + ', un nouveau bilan sera nécessaire, car votre situation dentaire aura pu évoluer.');
  }
  p('Bien cordialement,');
  T.push('L\'équipe du ' + CABINET.nom, CABINET.adresse + ' — ' + RELANCE_CFG.telephone);
  Hh.push('<p style="margin:0 0 10px">L\'équipe du ' + esc(CABINET.nom) + '<br><span style="color:#6b7280">' + esc(CABINET.adresse) + ' — ' + esc(RELANCE_CFG.telephone) + '</span></p>');
  if (cle !== 'J30') {
    T.push('', 'Pour ne plus recevoir ce type de message, répondez « STOP ».');
    Hh.push('<p style="margin:12px 0 0;font-size:12px;color:#6b7280">Pour ne plus recevoir ce type de message, répondez « STOP ».</p>');
  }
  return { sujet: sujet, texte: T.join('\n'), html: '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#1b2a41;max-width:640px">' + Hh.join('') + '</div>' };
}

/** Titres des documents J0 encore attendus, sans générer de fichier (pour les aperçus). */
function relance_titresDocs_(o) {
  var recu = String(o['Pièces reçues'] || '').toLowerCase(), out = [];
  if (!/questionnaire/.test(recu)) out.push('le questionnaire médical');
  if (!/consentement/.test(recu)) out.push('le consentement éclairé');
  return out;
}

/* ============================ RÉPONSES DES PATIENTS (Gmail, lecture seule) ============================ */

/**
 * Dernier message reçu du patient depuis l'envoi du devis, ou null.
 * API Gmail (service avancé « Gmail ») avec l'autorisation gmail.readonly : lecture seule, rien n'est
 * modifié ni supprimé dans la boîte.
 */
function relance_reponse_(o) {
  var mail = relance_adresse_(o['E-mail']), envoi = relance_lireDate_(o['Date d\'envoi']);
  if (!mail || !envoi) return null;
  var apres = Utilities.formatDate(envoi, COCKPIT_CFG.fuseau, 'yyyy/MM/dd');
  var liste = Gmail.Users.Messages.list('me', { q: 'from:' + mail + ' after:' + apres + ' -in:spam -in:trash', maxResults: 10 });
  var dernier = null;
  (liste.messages || []).forEach(function (x) {
    var msg = Gmail.Users.Messages.get('me', x.id, { format: 'full' });
    var de = relance_entete_(msg, 'From').replace(/^.*</, '').replace(/>.*$/, '');
    var quand = new Date(Number(msg.internalDate));
    if (relance_adresse_(de) !== mail || quand < envoi) return;
    if (!dernier || quand > dernier.date) dernier = { date: quand, msg: msg };
  });
  if (!dernier) return null;
  var corps = relance_texteMessage_(dernier.msg.payload).split(/\n\s*(?:Le .{0,80}a écrit|On .{0,80}wrote|-----|De :|From:)/)[0];
  var mot = (corps.toUpperCase().match(/\b(CONTINUER|ATTENTE|APPEL|STOP)\b/) || [])[1];
  return { type: mot ? RELANCE_CFG.motsReponse[mot] : 'Lue', date: dernier.date,
           lien: 'https://mail.google.com/mail/u/0/#all/' + dernier.msg.threadId };
}

function relance_entete_(msg, nom) {
  var h = ((msg.payload || {}).headers || []).filter(function (x) { return String(x.name).toLowerCase() === nom.toLowerCase(); })[0];
  return h ? String(h.value) : '';
}

/** Texte brut d'un message de l'API Gmail : première partie text/plain, sinon text/html sans balises. */
function relance_texteMessage_(part) {
  var trouve = { plain: '', html: '' };
  (function parcourir(p) {
    if (!p) return;
    var data = p.body && p.body.data;
    if (data && p.mimeType === 'text/plain' && !trouve.plain) trouve.plain = relance_b64_(data);
    if (data && p.mimeType === 'text/html' && !trouve.html) trouve.html = relance_b64_(data);
    (p.parts || []).forEach(parcourir);
  })(part);
  return trouve.plain || trouve.html.replace(/<br\s*\/?>|<\/p>/gi, '\n').replace(/<[^>]+>/g, ' ');
}
function relance_b64_(s) { return Utilities.newBlob(Utilities.base64DecodeWebSafe(s)).getDataAsString('UTF-8'); }

function relance_appliquerReponse_(ss, sh, H, L, rep) {
  var o = L.o, quand = Utilities.formatDate(rep.date, COCKPIT_CFG.fuseau, 'dd/MM/yyyy');
  sh.getRange(L.r, H.indexOf('Réponse patient') + 1).setNumberFormat('@').setValue(rep.type + ' (' + quand + ')');
  o['Réponse patient'] = rep.type;
  if (rep.type === 'Attente') sh.getRange(L.r, H.indexOf('Statut') + 1).setValue('En attente');
  sh.getRange(L.r, H.indexOf('Action prioritaire') + 1).setValue(RELANCE_CFG.actionsReponse[rep.type]);
  cockpit_journal_(ss, o['ID dossier'], 'patient', 'Réponse reçue', rep.type + ' · ' + rep.lien);
}

/** Action prioritaire d'un dossier dont le patient a répondu (utilisée par ecran_action_ de Code.gs). */
function relance_actionReponse_(o) {
  var t = String(o['Réponse patient'] || '').split(' (')[0];
  return RELANCE_CFG.actionsReponse[t] || '';
}

/* ============================ DEVIS SIGNÉ → LISA ============================ */

/** Bouton « Devis signé reçu » de l'écran. */
function ecran_signe(id) {
  var l = ecran_verrou_();
  try {
    var ss = cockpit_base_(), sh = ss.getSheetByName('Plans'), H = ecran_H_(), r = cockpit_ligneDuDossier_(ss, id);
    if (!r) throw new Error('dossier introuvable');
    var auj = Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy');
    sh.getRange(r, H.indexOf('Signé le') + 1).setNumberFormat('@').setValue(auj);
    sh.getRange(r, H.indexOf('Statut') + 1).setValue('Devis signé');
    sh.getRange(r, H.indexOf('Décision') + 1).setValue('Accepté');
    cockpit_journal_(ss, id, ecran_acteur_(), 'Devis signé reçu', 'relances arrêtées');
    var res;
    try { res = relance_versLisa_(ss, sh, H, r); }
    catch (err) {
      res = { ecrit: false, etat: 'Erreur passage chez Lisa : ' + (err.message || err) };
      cockpit_journal_(ss, id, 'système', 'Passage chez Lisa', 'ERREUR : ' + (err.message || err) + ' — rien écrit, à saisir chez Lisa');
    }
    sh.getRange(r, H.indexOf('Synchro classeur') + 1).setValue(res.etat);
    sh.getRange(r, H.indexOf('Action prioritaire') + 1).setValue(res.ecrit ? 'Suivi chez Lisa' : 'Transmettre à Lisa');
  } finally { l.releaseLock(); }
  return ecran_fiche(id);
}

function relance_modeLisa_() { return (PropertiesService.getScriptProperties().getProperty('SYNCHRO_LISA') || 'OFF').toUpperCase(); }

/** Filière d'un dossier : Implanto dès qu'un acte relève de l'implantologie, sinon Autres devis. */
function relance_filiere_(id) {
  var actes = ecran_fiche(id).actes;
  return actes.some(function (a) { return docs_famille_(a) === 'implant'; }) ? 'implanto' : 'autres';
}

/**
 * Écrit le dossier dans l'onglet Lisa du bon classeur (colonnes ★, repérées par leur NOM en ligne 3).
 * Jamais d'écrasement : si l'ID dossier existe déjà chez Lisa, rien n'est écrit.
 * Jamais d'écriture dans une cellule qui porte une formule.
 * SYNCHRO_LISA = OFF → rien · TEST → journal de ce qui serait écrit · ON → écriture.
 */
function relance_versLisa_(ss, sh, H, r) {
  var mode = relance_modeLisa_(), o = ecran_obj_(H, sh.getRange(r, 1, 1, H.length).getValues()[0]), id = String(o['ID dossier']);
  if (mode === 'OFF') { cockpit_journal_(ss, id, 'système', 'Passage chez Lisa', 'désactivé (SYNCHRO_LISA = OFF) : à saisir chez Lisa'); return { ecrit: false, etat: 'À transmettre (synchro désactivée)' }; }
  var filiere = relance_filiere_(id);
  var cible = SpreadsheetApp.openById(filiere === 'implanto' ? COCKPIT_CFG.classeurId : COCKPIT_CFG.classeurAutresId);
  var lisa = cible.getSheetByName(RELANCE_CFG.lisa.onglet);
  if (!lisa) throw new Error('onglet Lisa introuvable dans ' + cible.getName());
  var LE = RELANCE_CFG.lisa.ligneEntetes, P1 = RELANCE_CFG.lisa.premiereLigne;
  var entetes = lisa.getRange(LE, 1, 1, lisa.getLastColumn()).getValues()[0].map(function (x) { return String(x).trim(); });
  var cId = entetes.indexOf('ID dossier') + 1;
  if (!cId) throw new Error('colonne « ID dossier » introuvable chez Lisa');
  var ids = lisa.getRange(P1, cId, Math.max(lisa.getLastRow() - P1 + 1, 1), 1).getValues(), ligne = 0;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) {
      cockpit_journal_(ss, id, 'système', 'Passage chez Lisa', 'déjà présent dans ' + cible.getName() + ' (ligne ' + (P1 + i) + ') : rien écrit');
      return { ecrit: false, etat: 'Déjà chez Lisa (' + (filiere === 'implanto' ? 'Implanto' : 'Autres devis') + ')' };
    }
    if (!ligne && String(ids[i][0]).trim() === '') ligne = P1 + i;
  }
  if (!ligne) ligne = P1 + ids.length;
  var valeurs = cockpit_versLisa_(o);
  valeurs['Date devis'] = relance_lireDate_(o['Date devis']) || o['Date devis'];
  valeurs['Statut devis'] = RELANCE_CFG.lisa.statutDevis;
  var ecrits = [], ignores = [];
  Object.keys(valeurs).forEach(function (k) {
    var c = entetes.indexOf(k) + 1;
    if (!c) { ignores.push(k + ' (absent)'); return; }
    if (mode === 'ON' && lisa.getRange(ligne, c).getFormula()) { ignores.push(k + ' (formule)'); return; }
    if (mode === 'ON') lisa.getRange(ligne, c).setValue(valeurs[k]);
    ecrits.push(k);
  });
  var detail = cible.getName() + ' › Lisa ligne ' + ligne + ' : ' + ecrits.join(', ') + (ignores.length ? ' · ignorés : ' + ignores.join(', ') : '');
  cockpit_journal_(ss, id, 'système', mode === 'ON' ? 'Passage chez Lisa' : 'Passage chez Lisa (TEST, rien écrit)', detail);
  var quand = Utilities.formatDate(new Date(), COCKPIT_CFG.fuseau, 'dd/MM/yyyy');
  return mode === 'ON'
    ? { ecrit: true, etat: 'Transmis le ' + quand + ' (' + (filiere === 'implanto' ? 'Implanto' : 'Autres devis') + ', ligne ' + ligne + ')' }
    : { ecrit: false, etat: 'TEST ' + quand + ' : irait en ' + (filiere === 'implanto' ? 'Implanto' : 'Autres devis') + ' ligne ' + ligne };
}

/* ============================ APERÇU (écran) ============================ */

/** Prochaine relance d'un dossier et son texte, sans rien envoyer. */
function ecran_apercuRelance(id) {
  var f = ecran_fiche(id), o = f.plan;
  if (!relance_suivi_(o)) return { etape: '', info: 'Pas de relance : statut « ' + o['Statut'] + ' »' + (o['Signé le'] ? ', signé le ' + o['Signé le'] : '') + '.' };
  if (o['Réponse patient']) return { etape: '', info: 'Pas de relance : le patient a répondu (' + o['Réponse patient'] + ').' };
  var envoi = relance_lireDate_(o['Date d\'envoi']);
  if (!envoi) return { etape: '', info: 'Pas de relance tant que le devis n\'est pas envoyé.' };
  var suite = null;
  RELANCE_CFG.etapes.forEach(function (e) { if (!suite && !relance_faite_(o[e.colonne])) suite = e; });
  if (!suite) return { etape: '', info: 'Les trois relances sont parties : plus d\'envoi automatique.' };
  var date = relance_plusJours_(envoi, suite.jours);   // en jours de calendrier (heure d'hiver / d'été sans effet)
  if (Utilities.formatDate(date, COCKPIT_CFG.fuseau, 'u') === '7') date = relance_plusJours_(date, 1);   // pas d'envoi le dimanche
  var c = relance_courrier_(o, suite.cle);
  return { etape: suite.cle, date: Utilities.formatDate(date, COCKPIT_CFG.fuseau, 'dd/MM/yyyy'), sujet: c.sujet, texte: c.texte,
           info: 'Prochaine relance : ' + suite.cle + ' le ' + Utilities.formatDate(date, COCKPIT_CFG.fuseau, 'dd/MM/yyyy') + ' (à partir de 8 h, hors dimanche).' };
}

/** Test : texte des 3 relances pour le dossier fictif, dans le journal d'exécution. */
function relance_testTextes() {
  var o = ecran_fiche('99999-00001').plan;
  ['J7', 'J15', 'J30'].forEach(function (k) { var c = relance_courrier_(o, k); Logger.log('=== ' + k + ' · ' + c.sujet + '\n' + c.texte); });
}

/* ============================ OUTILS ============================ */

function relance_adresse_(s) { return String(s || '').trim().toLowerCase(); }

/** Une case « Relance n » compte comme envoyée : en REEL, seules les dates sans « TEST » ; en TEST, toutes. */
function relance_faite_(v) {
  v = String(v || '').trim();
  if (!v) return false;
  return !(/^TEST/i.test(v) && ecran_mode_().mode === 'REEL');
}
function relance_plusJours_(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

/** « dd/MM/yyyy » (texte) ou Date → Date à minuit ; sinon null. */
function relance_lireDate_(v) {
  if (v instanceof Date) return relance_jour_(v);
  var m = String(v || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}
function relance_jour_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

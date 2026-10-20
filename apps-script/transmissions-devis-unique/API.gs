/**
 * API.gs — Palier 1 : le classeur « Transmissions devis » exposé en application web.
 *
 * Projet Apps Script SÉPARÉ du script de Lisa (décision du 18/10/2026) : aucun de ses 43
 * fichiers n'est touché, aucun déclencheur n'est créé. Le classeur est ouvert par son
 * identifiant (propriété de script SPREADSHEET_ID). Pont.gs rejoue, après chaque écriture,
 * ce que le script de Lisa fait sur un clic (horodatage, verrou, journal, RDV4, étape en cours).
 *
 * Deux façons d'être appelé :
 *   - L'APPLICATION SERVIE PAR CE SCRIPT (mode de production ce soir) : doGet() renvoie
 *     Index.html (la maquette), qui parle au script par google.script.run → apiLire(),
 *     apiEcrire(json), apiAgenda(). Déploiement « exécuter en tant qu'utilisateur accédant »
 *     + « toute personne disposant d'un compte Google » : chacune se connecte avec son compte
 *     Google, agit avec ses propres droits sur le classeur (sans accès au classeur, rien ne
 *     s'ouvre), et l'historique des versions reste nominatif.
 *   - HTTP (page hébergée ailleurs, ex. la démo Clever Cloud, ou tests en ligne de commande) :
 *     doPost(e) avec un corps JSON (voir CONTRAT-API.md), identité par clé partagée CLE_API
 *     (tests) ou jeton Google Sign-In (GOOGLE_CLIENT_ID + COMPTES_AUTORISES / DOMAINE_AUTORISE).
 *     doGet(e) : ?api=info → état sans donnée ; ?api=agenda → agenda (compte Google connecté).
 *
 * api_diagnostiquer() : à lancer dans l'éditeur, lecture seule, vérifie le câblage.
 *
 * Vocabulaire : celui du classeur, repris tel quel (« ☑ Fait », « ☐ À faire »,
 * « ⚪ VERROUILLÉE », libellés des colonnes). Les colonnes sont repérées par leur EN-TÊTE
 * (ligne 3), jamais par leur lettre : si Lisa insère une colonne, rien ne casse.
 */

var API_VERSION = '1.3.0';
var API_LIGNE_ENTETES = 3;
var API_PREMIERE_LIGNE = 4;
var API_FAIT = '☑ Fait';            // = FAIT de Code.gs (vérifié par api_diagnostiquer)
var API_A_FAIRE = '☐ À faire';      // = A_FAIRE de Code.gs
var API_VERROUILLEE = '⚪ VERROUILLÉE';
var API_ENTETE_ID = 'ID dossier';
var API_ENTETE_HORODATAGE = 'Horodatage';
var API_ANNEE_MIN = 2000, API_ANNEE_MAX = 2100;   // fenêtre des dates acceptées en écriture (code DATE)

var API_ONGLETS = ['Lisa', 'Marion', 'Lucie', 'Règlements', 'Suivi RDV'];

/* Une seule application pour les deux classeurs (20/10/2026) : la filière choisie dans le menu
   de l'application arrive avec chaque appel. « autres » ouvre SPREADSHEET_ID_AUTRES s'il est
   configuré ; sinon, et pour toute autre valeur, c'est SPREADSHEET_ID comme avant. */
var API_FILIERE_DEMANDEE = '';
function api_choisirFiliere_(f) {
  API_FILIERE_DEMANDEE = (String(f || '').toLowerCase() === 'autres' && api_propriete_('SPREADSHEET_ID_AUTRES')) ? 'autres' : '';
}

/* En-têtes de la frise (Suivi RDV) → clés du modèle de l'application */
var API_TYPES_RDV = {
  cbct: '🩻 CBCT', consult: '💬 Consultation / plan de traitement', chir: '🔧 Chirurgie / extraction',
  pose: '🦷 Pose implant', empreinte: '🧪 Empreinte', pilier: '👑 Pilier + couronne',
  prothese: '🦷 Prothèse', controle: '✅ Contrôle / cicatrisation', fin: '💰 Rendez-vous financier'
};

/* Mode de facturation (Règlements) : la cellule porte le libellé complet de la liste
   déroulante ; on le reconnaît à son emoji de tête, on l'écrit tel que la liste le définit. */
var API_MODES_PREFIXE = { TP: '🏥', RAC0: '💳', AUTO: '👤' };
var API_MODES_LIBELLE = {
  TP: '🏥 Tiers payant mutuelle — encaisser le reste à charge seul',
  RAC0: '💳 RAC 0 — encaisser la part mutuelle, remboursée à coup sûr',
  AUTO: '👤 Autonome — encaisser tout ce que la Sécu ne prend pas'
};

/* État du matériel (Lucie!« Alerte / commentaire ») : libellés écrits en clair. */
var API_MATERIEL = { a_commander: 'À commander', commande: 'Commandé', recu: 'Reçu', pret: 'Prêt' };

/* ------------------------------------------------------------------------
   CELLULES DE SAISIE AUTORISÉES À L'ÉCRITURE. Rien d'autre n'est jamais écrit.
   ------------------------------------------------------------------------ */

/* Cases ☑/☐ : champ de l'application → { onglet, en-tête }. `horodatage` : la colonne
   immédiatement à droite s'appelle « Horodatage » et c'est onEdit (Code.gs) qui la remplit. */
var API_CASES = {
  de: { onglet: 'Lisa', entete: 'LISA • Documents envoyés', horodatage: true, libelle: 'Documents envoyés' },
  ds: { onglet: 'Lisa', entete: 'LISA • Documents signés reçus', horodatage: true, libelle: 'Documents signés reçus' },
  dd: { onglet: 'Lisa', entete: 'LISA • Documents déposés au dossier patient', horodatage: true, libelle: 'Documents déposés au dossier patient' },
  pa: { onglet: 'Lisa', entete: 'LISA • Prise en charge analysée', horodatage: true, libelle: 'Prise en charge analysée' },
  pi: { onglet: 'Lisa', entete: 'LISA • PEC implant demandée', horodatage: true, libelle: 'PEC implant demandée' },
  pp: { onglet: 'Lisa', entete: 'LISA • PEC pilier + couronne demandée', horodatage: true, libelle: 'PEC pilier + couronne demandée' },
  cl: { onglet: 'Lisa', entete: 'LISA • Dossier clôturé', horodatage: true, libelle: 'Dossier clôturé' },
  pr: { onglet: 'Marion', entete: 'MARION • Premier RDV pris', horodatage: true, libelle: 'Premier RDV pris', verrou: true },
  ech: { onglet: 'Marion', entete: "Demande d'échelonnement", horodatage: false, libelle: "Demande d'échelonnement" },
  pl: { onglet: 'Lucie', entete: 'LUCIE • Planification validée avec Fakhreddine', horodatage: true, libelle: 'Planification validée avec Fakhreddine' }
};

/* Saisies simples : champ → { onglet, en-tête, genre } ; genre ∈ texte | nombre_ou_texte | date | liste | materiel */
var API_SAISIES = {
  statut: { onglet: 'Lisa', entete: 'Statut devis', genre: 'liste' },
  pecTotale: { onglet: 'Lisa', entete: 'Prise en charge mutuelle totale', genre: 'nombre_ou_texte' },
  rac: { onglet: 'Lisa', entete: 'Reste à charge total', genre: 'nombre_ou_texte' },
  montantFacture: { onglet: 'Lisa', entete: 'Montant facturé mutuelle (€)', genre: 'nombre_ou_texte' },
  rembAttendu: { onglet: 'Lisa', entete: 'Remboursement attendu (€)', genre: 'nombre_ou_texte' },
  montantRecu: { onglet: 'Lisa', entete: 'Montant reçu (€)', genre: 'nombre_ou_texte' },
  montantProchainRdv: { onglet: 'Lisa', entete: 'LISA • Montant prochain RDV (€)', genre: 'nombre_ou_texte' },
  rdvHeure: { onglet: 'Marion', entete: 'Date/heure RDV', genre: 'date' },
  materiel: { onglet: 'Lucie', entete: 'Alerte / commentaire', genre: 'materiel' }
};

/* Règlements : en-tête de chaque champ, par étape (0 = implant, 1 = pilier + couronne) */
var API_REGLEMENT = {
  mode: 'Mode de facturation',
  org: '🏥 Organisme tiers payant',
  pecMontant: ['PEC 1 — implant', 'PEC 2 — pilier + couronne'],
  etapes: [
    { pm: 'Étape 1 — part mutuelle (€)', rac: 'Étape 1 — reste à charge (€)', pecEnv: 'PEC 1 envoyée', factEnv: 'Étape 1 — Facture envoyée', dateFact: 'Étape 1 — Date facturation', mFact: 'Étape 1 — Montant facturé (€)', rembRecu: 'Étape 1 — Remboursement reçu', dateRemb: 'Étape 1 — Date remboursement', mRecu: 'Étape 1 — Montant reçu (€)', ecart: 'Étape 1 — Écart facturé/reçu', aEncaisser: 'Étape 1 — à encaisser (€)' },
    { pm: 'Étape 2 — part mutuelle (€)', rac: 'Étape 2 — reste à charge (€)', pecEnv: 'PEC 2 envoyée', factEnv: 'Étape 2 — Facture envoyée', dateFact: 'Étape 2 — Date facturation', mFact: 'Étape 2 — Montant facturé (€)', rembRecu: 'Étape 2 — Remboursement reçu', dateRemb: 'Étape 2 — Date remboursement', mRecu: 'Étape 2 — Montant reçu (€)', ecart: 'Étape 2 — Écart facturé/reçu', aEncaisser: 'Étape 2 — à encaisser (€)' }
  ],
  genres: { pm: 'nombre', rac: 'nombre', pecEnv: 'case', factEnv: 'case', dateFact: 'date', mFact: 'nombre', rembRecu: 'case', dateRemb: 'date', mRecu: 'nombre' }
};

/* Journal : la colonne « Notes libres » existe sur les trois onglets. La phrase est écrite
   sur l'onglet de la personne qui parle : NOTES.gs la signe avec le nom de l'onglet.
   Le rôle « Direction » n'a pas d'onglet : sa note part sur l'onglet de Lisa, préfixée du
   prénom, en attendant la décision de Lisa (voir README, points à décider). */
var API_NOTES_ENTETE = 'Notes libres';
var API_NOTES_ONGLET_PAR_AUTEUR = { Lisa: 'Lisa', Marion: 'Marion', Lucie: 'Lucie' };
var API_NOTES_DIRECTION = { onglet: 'Lisa', prefixe: 'Fakhreddine : ' };

/* Colonnes calculées ou posées par le script, renvoyées en lecture seule.
   Les en-têtes sont comparés après trim (deux en-têtes de Règlements ont un espace de tête). */
var API_CALCULEES = {
  Lisa: { prochaineAction: 'Prochaine action / alerte', autorisation: 'MARION • Autorisation prise de RDV', responsable: 'Responsable active', factMut: 'LISA • Facturation mutuelle', dateFact: 'Date d’ouverture / facturation', rembRecu: 'LISA • Remboursement reçu', dateRemb: 'Date remboursement', rang: '⚡ Rang Lisa', echeance: 'Échéance devis (+6 mois)', relance: '⚠️ Relance à faire' },
  Marion: { avancementLisa: 'AVANCEMENT LISA', prochainRdvDate: 'Prochain RDV — date', prochainRdvType: 'Prochain RDV — type', modeLabel: 'Mode de facturation', aEncaisser0: 'À encaisser — implant (€)', aEncaisser1: 'À encaisser — pilier + couronne (€)', datePose: 'Date pose implantaire', datePilier: 'Date pose pilier + couronne', montantAEncaisser: 'LISA • Montant à encaisser (€)', actionMarion: 'Prochaine action / alerte', etapeClinique: 'Étape en cours', clos: '⛔ Clôturé (auto)' },
  Lucie: { fileAttente: "File d'attente", prochainRdvDate: 'Prochain RDV — date', prochainRdvType: 'Prochain RDV — type', acte: 'Acte prévu', alerte: 'Alerte / commentaire', clos: '⛔ Clôturé (auto)' },
  'Règlements': { controle: 'Contrôle montants', factureAFaire: 'Facture à faire', dateAFacturer: "Date d'intervention à facturer", dateActe0: '📅 Date acte implant', dateActe1: '📅 Date acte pilier + couronne', prochaineFact: '🧾 Prochaine facturation', statutFact: '⚠️ Facturation', clos: '⛔ Clôturé (auto)' },
  'Suivi RDV': { agenda: '📅 Agenda Logos' }
};

/* =========================================================================
   POINTS D'ENTRÉE
   ========================================================================= */

/* Une requête HTTP est pour l'API quand elle porte `action`. */
function api_estPourApi_(corps) {
  return !!(corps && typeof corps === 'object' && typeof corps.action === 'string');
}

function doPost(e) {
  var corps = null;
  try { corps = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : ''); } catch (x) { corps = null; }
  if (!api_estPourApi_(corps)) return api_json_({ ok: false, code: 'PARAMETRE', erreur: 'Corps JSON attendu, avec « action »' });
  api_choisirFiliere_(corps.filiere);
  var auth;
  try { auth = api_authentifier_(corps, 'http'); }
  catch (err) { return api_json_({ ok: false, code: err.code || 'ACCES', erreur: err.message || String(err) }); }
  if (corps.action === 'info') return api_json_(api_info_());
  if (corps.action === 'lire') return api_json_(api_traiterLecture_(auth));
  if (corps.action === 'agenda') return api_json_(api_traiterAgenda_(auth));
  return api_json_(api_traiterEcriture_(corps, auth));
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  api_choisirFiliere_(p.f);
  if (p.api === 'info') return api_json_(api_info_());
  if (p.api === 'agenda' || p.api === 'lire') {
    var auth;
    try { auth = api_authentifier_(null, 'session'); }
    catch (err) { return api_json_({ ok: false, code: err.code || 'ACCES', erreur: err.message || String(err) }); }
    return api_json_(p.api === 'agenda' ? api_traiterAgenda_(auth) : api_traiterLecture_(auth));
  }
  try {
    return HtmlService.createHtmlOutputFromFile('Index').setTitle('Transmissions devis').addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (x) {
    return api_json_({ ok: false, code: 'CONFIG', erreur: 'Index.html absent du projet : coller apps-script/Index.html (voir README)' });
  }
}

/* Appelées par google.script.run depuis Index.html. Elles renvoient une CHAÎNE JSON
   (google.script.run ne transporte pas les objets Date). L'identité est le compte Google
   connecté (déploiement « utilisateur accédant »). */
function apiLire(_, filiere) {
  api_choisirFiliere_(filiere);
  try { return JSON.stringify(api_traiterLecture_(api_authentifier_(null, 'session'))); }
  catch (e) { return JSON.stringify({ ok: false, code: e.code || 'ACCES', erreur: e.message || String(e) }); }
}
function apiEcrire(json, filiere) {
  api_choisirFiliere_(filiere);
  try { return JSON.stringify(api_traiterEcriture_(typeof json === 'string' ? JSON.parse(json) : json, api_authentifier_(null, 'session'))); }
  catch (e) { return JSON.stringify({ ok: false, code: e.code || 'ACCES', erreur: e.message || String(e) }); }
}
function apiAgenda(_, filiere) {
  api_choisirFiliere_(filiere);
  try { return JSON.stringify(api_traiterAgenda_(api_authentifier_(null, 'session'))); }
  catch (e) { return JSON.stringify({ ok: false, code: e.code || 'ACCES', erreur: e.message || String(e) }); }
}

/* État de l'API sans aucune donnée patient (pour vérifier un déploiement). */
function api_info_() {
  var ss = null; try { ss = api_classeur_(); } catch (e) { ss = null; }
  return {
    ok: true, api: 'transmissions-devis', version: API_VERSION,
    pont: api_pontActif_(), projet: 'separe', classeurConfigure: !!api_propriete_('SPREADSHEET_ID'), agendaId: api_propriete_('AGENDA_ID') ? 'configuré' : 'calendrier principal du compte connecté',
    filiere: ss ? api_filiere_(ss) : null, classeur: ss ? ss.getName() : null,
    auth: { cle: !!api_propriete_('CLE_API'), google: !!api_propriete_('GOOGLE_CLIENT_ID'), comptes: !!api_propriete_('COMPTES_AUTORISES'), domaine: api_propriete_('DOMAINE_AUTORISE') || null },
    horodatage: ss ? api_iso_(new Date(), ss.getSpreadsheetTimeZone()) : null
  };
}

/* À lancer dans l'éditeur Apps Script : ne modifie rien, écrit dans le journal d'exécution.
   Le journal ne mentionne ni compte ni patient : seulement l'état du câblage. */
function api_diagnostiquer() {
  var L = [];
  if (!api_propriete_('SPREADSHEET_ID')) { Logger.log('⚠️ Propriété SPREADSHEET_ID absente : poser l\'identifiant du classeur (copie de test d\'abord) dans Paramètres du projet → Propriétés du script.'); return 'SPREADSHEET_ID absente'; }
  var ctx = api_contexte_({ utilisateur: '', mode: 'editeur' });
  L.push('API ' + API_VERSION + ' — classeur « ' + ctx.ss.getName() + ' » — filière ' + ctx.filiere);
  API_ONGLETS.forEach(function (nom) {
    var f = ctx.feuilles[nom];
    L.push(nom + ' : ' + Object.keys(f.colonnes).length + ' en-têtes, ' + Object.keys(f.index).length + ' dossiers (lignes ' + API_PREMIERE_LIGNE + '→' + f.derniereLigne + ')');
  });
  var manquantes = api_verifierEntetes_(ctx);
  L.push(manquantes.length ? '⚠️ En-têtes introuvables : ' + manquantes.join(' ; ') : '✅ Tous les en-têtes attendus sont présents');
  var info = api_info_().auth;
  L.push('Authentification : clé partagée ' + (info.cle ? 'configurée' : 'absente') + ' · Google Sign-In ' + (info.google ? 'configuré' : 'absent') + ' · liste de comptes ' + (info.comptes ? 'configurée' : 'absente') + ' · domaine ' + (info.domaine || 'absent'));
  if (!info.cle && !info.google) L.push('⚠️ Aucune authentification configurée : l\'application hébergée sera refusée (ACCES). Renseigner CLE_API (tests) ou GOOGLE_CLIENT_ID + COMPTES_AUTORISES / DOMAINE_AUTORISE (production).');
  if (typeof api_pont_diagnostic_ === 'function') api_pont_diagnostic_(ctx).forEach(function (s) { L.push(s); });
  try { var ag = api_traiterAgenda_({ utilisateur: '', mode: 'editeur' }); L.push(ag.ok ? 'Agenda : ' + ag.events.length + ' événement(s) lus (' + ag.calendrier + ')' : 'Agenda : ⚠️ ' + ag.erreur); } catch (e) { L.push('Agenda : ⚠️ ' + e.message); }
  var t = new Date();
  var tout = api_lireTout_(ctx);
  L.push('Lecture complète : ' + tout.dossiers.length + ' dossiers en ' + (new Date() - t) + ' ms ; anomalies : ' + JSON.stringify(tout.anomalies));
  Logger.log(L.join('\n'));
  return L.join('\n');
}

/* =========================================================================
   LECTURE
   ========================================================================= */

function api_traiterLecture_(auth) {
  try {
    var ctx = api_contexte_(auth);
    var tout = api_lireTout_(ctx);
    return {
      ok: true, version: API_VERSION, filiere: ctx.filiere,
      classeur: { id: ctx.ss.getId(), nom: ctx.ss.getName(), url: ctx.ss.getUrl() },
      utilisateur: ctx.utilisateur, authMode: ctx.authMode, horodatage: api_iso_(new Date(), ctx.tz), pont: api_pontActif_(),
      autresUrl: api_propriete_('AUTRES_URL') || null,
      filieres: api_propriete_('SPREADSHEET_ID_AUTRES') ? ['implanto', 'autres'] : null,
      dossiers: tout.dossiers, anomalies: tout.anomalies
    };
  } catch (e) {
    return { ok: false, code: e.code || 'ERREUR', erreur: e.message || String(e) };
  }
}

/* Lit les 5 onglets d'un coup et construit un dossier par ID (ordre de l'onglet Lisa). */
function api_lireTout_(ctx) {
  var brut = {};
  API_ONGLETS.forEach(function (nom) {
    var f = ctx.feuilles[nom];
    var n = f.derniereLigne - API_PREMIERE_LIGNE + 1;
    var valeurs = n > 0 ? f.sheet.getRange(API_PREMIERE_LIGNE, 1, n, f.derniereColonne).getValues() : [];
    var parId = {};
    valeurs.forEach(function (ligne, i) {
      var id = api_texte_(ligne[f.colId - 1]);
      if (!id || id === API_ENTETE_ID) return;
      if (!parId[id]) parId[id] = { ligne: API_PREMIERE_LIGNE + i, valeurs: ligne };
    });
    brut[nom] = parId;
  });
  var anomalies = { sansLigneMarion: [], sansLigneLucie: [], sansLigneReglements: [], sansLigneSuivi: [], doublons: {} };
  API_ONGLETS.forEach(function (nom) { var d = ctx.feuilles[nom].doublons; if (d.length) anomalies.doublons[nom] = d; });
  var dossiers = [];
  Object.keys(brut.Lisa).forEach(function (id) {
    var lignes = {}, numeros = {};
    API_ONGLETS.forEach(function (nom) { lignes[nom] = brut[nom][id] ? brut[nom][id].valeurs : null; numeros[nom] = brut[nom][id] ? brut[nom][id].ligne : null; });
    if (!lignes.Marion) anomalies.sansLigneMarion.push(id);
    if (!lignes.Lucie) anomalies.sansLigneLucie.push(id);
    if (!lignes['Règlements']) anomalies.sansLigneReglements.push(id);
    if (!lignes['Suivi RDV']) anomalies.sansLigneSuivi.push(id);
    dossiers.push(api_construireDossier_(ctx, id, lignes, numeros));
  });
  return { dossiers: dossiers, anomalies: anomalies };
}

/* Relit un seul dossier (après une écriture) : une lecture de ligne par onglet. */
function api_lireDossier_(ctx, id) {
  var lignes = {}, numeros = {};
  API_ONGLETS.forEach(function (nom) {
    var f = ctx.feuilles[nom];
    var ligne = f.index[id];
    numeros[nom] = ligne || null;
    lignes[nom] = ligne ? f.sheet.getRange(ligne, 1, 1, f.derniereColonne).getValues()[0] : null;
  });
  if (!lignes.Lisa) throw api_erreur_('Dossier introuvable dans l\'onglet Lisa : ' + id, 'INTROUVABLE');
  return api_construireDossier_(ctx, id, lignes, numeros);
}

/* Le modèle de l'application, construit depuis les 5 lignes. Les dates sont des chaînes
   « yyyy-MM-ddTHH:mm:ss » (heure du classeur), les cases { v: bool, ts: date|null, etat: texte }. */
function api_construireDossier_(ctx, id, lignes, numeros) {
  var tz = ctx.tz;
  var L = api_lecteur_(ctx, 'Lisa', lignes.Lisa), M = api_lecteur_(ctx, 'Marion', lignes.Marion), U = api_lecteur_(ctx, 'Lucie', lignes.Lucie), R = api_lecteur_(ctx, 'Règlements', lignes['Règlements']), S = api_lecteur_(ctx, 'Suivi RDV', lignes['Suivi RDV']);
  var sortie = function (v) { return api_iso_(v, tz); };
  var caseDe = function (lect, def) {
    var etat = api_texte_(lect.v(def.entete));
    var ts = def.horodatage ? lect.v(def.entete, 1) : null;
    return { v: etat === API_FAIT, etat: etat, ts: (ts instanceof Date) ? sortie(ts) : null };
  };
  var d = {
    id: id, filiere: ctx.filiere,
    patient: api_texte_(L.v('Nom complet patient')), logos: sortie(L.v('ID Logos')), type: api_texte_(L.v('Type de devis / traitement')),
    statut: api_texte_(L.v('Statut devis')), dateDevis: sortie(L.v('Date devis')), montant: sortie(L.v('Montant devis')),
    pecTotale: sortie(L.v('Prise en charge mutuelle totale')), rac: sortie(L.v('Reste à charge total')),
    montantFacture: sortie(L.v('Montant facturé mutuelle (€)')), rembAttendu: sortie(L.v('Remboursement attendu (€)')),
    montantRecu: sortie(L.v('Montant reçu (€)')), montantProchainRdv: sortie(L.v('LISA • Montant prochain RDV (€)')),
    rdv: {}, rdvHeure: sortie(M.v('Date/heure RDV')), acteMarion: api_texte_(M.v('Acte prévu')),
    agendaBrut: api_texte_(S.v('📅 Agenda Logos')),
    lucieAlerte: api_texte_(U.v('Alerte / commentaire')), materiel: '',
    notes: [], notesBrut: { Lisa: api_texte_(L.v(API_NOTES_ENTETE)), Marion: api_texte_(M.v(API_NOTES_ENTETE)), Lucie: api_texte_(U.v(API_NOTES_ENTETE)) },
    reg: { mode: null, modeLabel: api_texte_(R.v(API_REGLEMENT.mode)), org: api_texte_(R.v(API_REGLEMENT.org)) || 'Autonome', pecMontant: [sortie(R.v(API_REGLEMENT.pecMontant[0])), sortie(R.v(API_REGLEMENT.pecMontant[1]))], e: [] },
    calc: {}, lignes: numeros, ids: { seance: api_texte_(M.v('ID séance')), materiel: api_texte_(U.v('ID matériel')) }
  };
  Object.keys(API_CASES).forEach(function (k) {
    var def = API_CASES[k];
    d[k] = caseDe(def.onglet === 'Lisa' ? L : (def.onglet === 'Marion' ? M : U), def);
  });
  Object.keys(API_TYPES_RDV).forEach(function (k) { d.rdv[k] = sortie(S.v(API_TYPES_RDV[k])); });
  var alerte = d.lucieAlerte.toLowerCase();
  Object.keys(API_MATERIEL).forEach(function (k) { if (alerte === API_MATERIEL[k].toLowerCase()) d.materiel = k; });
  Object.keys(API_MODES_PREFIXE).forEach(function (k) { if (d.reg.modeLabel.indexOf(API_MODES_PREFIXE[k]) === 0) d.reg.mode = k; });
  API_REGLEMENT.etapes.forEach(function (et) {
    d.reg.e.push({
      pm: sortie(R.v(et.pm)), rac: sortie(R.v(et.rac)),
      pecEnv: api_texte_(R.v(et.pecEnv)) === API_FAIT, factEnv: api_texte_(R.v(et.factEnv)) === API_FAIT, rembRecu: api_texte_(R.v(et.rembRecu)) === API_FAIT,
      dateFact: sortie(R.v(et.dateFact)), mFact: sortie(R.v(et.mFact)), dateRemb: sortie(R.v(et.dateRemb)), mRecu: sortie(R.v(et.mRecu)),
      ecart: api_texte_(R.v(et.ecart)), aEncaisser: sortie(R.v(et.aEncaisser))
    });
  });
  d.notes = api_analyserNotes_(d.notesBrut.Lisa || d.notesBrut.Marion || d.notesBrut.Lucie);
  d.notesDivergent = !(d.notesBrut.Lisa === d.notesBrut.Marion && d.notesBrut.Marion === d.notesBrut.Lucie);
  Object.keys(API_CALCULEES).forEach(function (onglet) {
    var lect = { Lisa: L, Marion: M, Lucie: U, 'Règlements': R, 'Suivi RDV': S }[onglet];
    Object.keys(API_CALCULEES[onglet]).forEach(function (k) {
      var v = lect.v(API_CALCULEES[onglet][k]);
      d.calc[k] = (v instanceof Date) ? sortie(v) : (v === '' || v === null || v === undefined ? null : v);
    });
  });
  return d;
}

/* « 25/08/2026 11:04 · Lisa — relancée pour signature » (une note par ligne, la plus récente en haut) */
function api_analyserNotes_(texte) {
  if (!texte) return [];
  var motif = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s*·\s*(.+?)\s+—\s+([\s\S]*)$/;
  return String(texte).split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
    var m = l.match(motif);
    if (!m) return { d: null, who: '', t: l };
    return { d: m[3] + '-' + m[2] + '-' + m[1] + 'T' + m[4] + ':' + m[5] + ':00', who: m[6], t: m[7] };
  });
}

/* =========================================================================
   ÉCRITURE
   ========================================================================= */

function api_traiterEcriture_(a, auth) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (e) { return { ok: false, code: 'OCCUPE', erreur: 'Le classeur est en cours de modification, réessaie dans quelques secondes.' }; }
  var ctx = null;
  try {
    ctx = api_contexte_(auth);
    if (!a || typeof a !== 'object') throw api_erreur_('Requête vide', 'PARAMETRE');
    if (!a.id) throw api_erreur_('ID dossier manquant', 'PARAMETRE');
    if (!ctx.feuilles.Lisa.index[a.id]) throw api_erreur_('Dossier introuvable : ' + a.id, 'INTROUVABLE');
    var res;
    switch (a.action) {
      case 'cocher': res = api_ecrireCase_(ctx, a); break;
      case 'saisir': res = api_ecrireSaisie_(ctx, a); break;
      case 'rdv': res = api_ecrireRdv_(ctx, a); break;
      case 'reglement': res = api_ecrireReglement_(ctx, a); break;
      case 'etape': res = api_ecrireEtape_(ctx, a); break;
      case 'note': res = api_ecrireNote_(ctx, a); break;
      default: throw api_erreur_('Action inconnue : ' + a.action, 'PARAMETRE');
    }
    SpreadsheetApp.flush();
    var sortie = { ok: true, action: a.action, dossier: api_lireDossier_(ctx, a.id) };
    Object.keys(res || {}).forEach(function (k) { sortie[k] = res[k]; });
    return sortie;
  } catch (e) {
    var echec = { ok: false, code: e.code || 'ERREUR', erreur: e.message || String(e), action: a && a.action };
    try { if (ctx && a && a.id && ctx.feuilles.Lisa.index[a.id]) { SpreadsheetApp.flush(); echec.dossier = api_lireDossier_(ctx, a.id); } } catch (x) { /* on renvoie l'erreur d'origine */ }
    return echec;
  } finally {
    lock.releaseLock();
  }
}

/* Case ☑/☐ : { action:'cocher', id, champ: de|ds|dd|pa|pi|pp|cl|pr|ech|pl, valeur: true|false, auteur } */
function api_ecrireCase_(ctx, a) {
  var def = API_CASES[a.champ];
  if (!def) throw api_erreur_('Case inconnue : ' + a.champ, 'PARAMETRE');
  if (def.horodatage && !api_pontActif_()) throw api_erreur_('Le pont est désactivé (propriété PONT=off) : l\'horodatage ne serait pas posé. Cocher est refusé.', 'PONT_INACTIF');
  var coche = a.valeur === true || a.valeur === 'true' || a.valeur === 1;
  if (def.verrou && coche) {
    /* Le verrou de Lisa, vérifié AVANT d'écrire ; onEdit (Code.gs) le vérifie encore via le pont. */
    var autorisation = api_texte_(api_lireCellule_(ctx, 'Lisa', a.id, API_CALCULEES.Lisa.autorisation));
    if (autorisation === API_VERROUILLEE) {
      throw api_erreur_('⛔ Refusé : le dossier est ' + API_VERROUILLEE + '. Lisa n\'a pas encore déposé les documents signés au dossier patient. Le RDV reste verrouillé.', 'VERROUILLEE');
    }
  }
  var r = api_poser_(ctx, def.onglet, a.id, def.entete, coche ? API_FAIT : API_A_FAIRE, a);
  /* Si le script a refusé (verrou) et remis « ☐ À faire », on le dit. */
  if (coche && api_texte_(api_lireCellule_(ctx, def.onglet, a.id, def.entete)) !== API_FAIT) {
    throw api_erreur_('⛔ Refusé par le script du classeur : ' + def.libelle + ' n\'a pas été coché (' + (r.pontDetail && r.pontDetail.onEdit ? r.pontDetail.onEdit : 'verrou') + ').', 'VERROUILLEE');
  }
  return { pont: r.pont, pontDetail: r.pontDetail, libelle: def.libelle, cellule: r.cellule };
}

/* Saisie simple : { action:'saisir', id, champ, valeur } */
function api_ecrireSaisie_(ctx, a) {
  var def = API_SAISIES[a.champ];
  if (!def) throw api_erreur_('Champ inconnu : ' + a.champ, 'PARAMETRE');
  var valeur;
  if (def.genre === 'materiel') {
    if (a.valeur && !API_MATERIEL[a.valeur]) throw api_erreur_('État matériel inconnu : ' + a.valeur, 'PARAMETRE');
    valeur = a.valeur ? API_MATERIEL[a.valeur] : '';
  } else valeur = api_convertir_(a.valeur, def.genre, ctx.tz);
  if (def.genre === 'liste') api_verifierListe_(ctx, def.onglet, a.id, def.entete, valeur);
  var r = api_poser_(ctx, def.onglet, a.id, def.entete, valeur, a);
  return { pont: r.pont, pontDetail: r.pontDetail, cellule: r.cellule };
}

/* Frise : { action:'rdv', id, type: cbct|consult|chir|pose|empreinte|pilier|prothese|controle|fin, date: 'yyyy-MM-dd'|null } */
function api_ecrireRdv_(ctx, a) {
  var entete = API_TYPES_RDV[a.type];
  if (!entete) throw api_erreur_('Type de RDV inconnu : ' + a.type, 'PARAMETRE');
  var r = api_poser_(ctx, 'Suivi RDV', a.id, entete, api_convertir_(a.date, 'date', ctx.tz), a);
  return { pont: r.pont, pontDetail: r.pontDetail, cellule: r.cellule };
}

/* Règlements, en-tête de dossier : { action:'reglement', id, champ: mode|org, valeur } */
function api_ecrireReglement_(ctx, a) {
  if (a.champ === 'mode') {
    var libelle = '';
    if (a.valeur) {
      if (!API_MODES_PREFIXE[a.valeur]) throw api_erreur_('Mode de facturation inconnu : ' + a.valeur, 'PARAMETRE');
      libelle = api_libelleDeListe_(ctx, 'Règlements', a.id, API_REGLEMENT.mode, API_MODES_PREFIXE[a.valeur]) || API_MODES_LIBELLE[a.valeur];
    }
    var r1 = api_poser_(ctx, 'Règlements', a.id, API_REGLEMENT.mode, libelle, a);
    return { pont: r1.pont, pontDetail: r1.pontDetail, cellule: r1.cellule };
  }
  if (a.champ === 'org') {
    var org = api_texte_(a.valeur);
    api_verifierListe_(ctx, 'Règlements', a.id, API_REGLEMENT.org, org);
    var r2 = api_poser_(ctx, 'Règlements', a.id, API_REGLEMENT.org, org, a);
    return { pont: r2.pont, pontDetail: r2.pontDetail, cellule: r2.cellule };
  }
  throw api_erreur_('Champ règlement inconnu : ' + a.champ, 'PARAMETRE');
}

/* Règlements, par étape : { action:'etape', id, etape: 0|1, champ: pm|rac|pecEnv|factEnv|dateFact|mFact|rembRecu|dateRemb|mRecu, valeur } */
function api_ecrireEtape_(ctx, a) {
  var et = API_REGLEMENT.etapes[Number(a.etape)];
  var genre = API_REGLEMENT.genres[a.champ];
  if (!et || !genre) throw api_erreur_('Étape ou champ inconnu : ' + a.etape + ' / ' + a.champ, 'PARAMETRE');
  var valeur = genre === 'case' ? ((a.valeur === true || a.valeur === 'true') ? API_FAIT : API_A_FAIRE) : api_convertir_(a.valeur, genre, ctx.tz);
  var r = api_poser_(ctx, 'Règlements', a.id, et[a.champ], valeur, a);
  return { pont: r.pont, pontDetail: r.pontDetail, cellule: r.cellule };
}

/* Journal : { action:'note', id, texte, auteur: Lisa|Marion|Lucie|Direction }
   La phrase est écrite SEULE, sur une ligne, dans la colonne Notes libres de l'onglet de
   l'auteur ; NOTES.gs (via onEdit et le pont) la date, la signe du nom de l'onglet, l'empile
   sur l'historique (reçu en oldValue) et la recopie sur les trois onglets. */
function api_ecrireNote_(ctx, a) {
  var texte = api_texte_(a.texte).replace(/\s*\r?\n\s*/g, ' ').trim();
  if (!texte) throw api_erreur_('Note vide', 'PARAMETRE');
  if (!api_pontActif_()) throw api_erreur_('Le pont est désactivé (propriété PONT=off) : la note ne serait ni datée ni recopiée. Ajouter une note est refusé.', 'PONT_INACTIF');
  var onglet = API_NOTES_ONGLET_PAR_AUTEUR[a.auteur];
  if (!onglet) { onglet = API_NOTES_DIRECTION.onglet; texte = API_NOTES_DIRECTION.prefixe + texte; }
  var r = api_poser_(ctx, onglet, a.id, API_NOTES_ENTETE, texte, a);
  /* NOTES.gs a-t-il bien transformé la phrase en ligne datée ? */
  var apres = api_texte_(api_lireCellule_(ctx, onglet, a.id, API_NOTES_ENTETE));
  if (!/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(apres)) throw api_erreur_('La note a été écrite mais le script du classeur ne l\'a pas datée (' + (r.pontDetail && r.pontDetail.onEdit ? r.pontDetail.onEdit : 'pont') + ').', 'NOTE');
  return { pont: r.pont, pontDetail: r.pontDetail, cellule: r.cellule, onglet: onglet };
}

/* ------------------------------------------------------------------------
   Le geste élémentaire : poser une valeur dans UNE cellule de saisie, puis passer la
   main au script de Lisa (Pont.gs). Trois garde-fous :
     1. l'en-tête doit exister (sinon rien n'est écrit) ;
     2. la cellule ne doit pas contenir de formule (sinon refus : colonne calculée) ;
     3. l'écriture et l'appel au pont se font sous verrou de script (pas d'entrelacement).
   ------------------------------------------------------------------------ */
function api_poser_(ctx, onglet, id, entete, valeur, a) {
  var f = ctx.feuilles[onglet];
  if (!f) throw api_erreur_('Onglet inconnu : ' + onglet, 'STRUCTURE');
  var ligne = f.index[id];
  if (!ligne) throw api_erreur_('Dossier ' + id + ' absent de l\'onglet ' + onglet, 'INTROUVABLE');
  var col = f.colonnes[entete];
  if (!col) throw api_erreur_('En-tête introuvable dans ' + onglet + ' : « ' + entete + ' »', 'STRUCTURE');
  var range = f.sheet.getRange(ligne, col);
  if (range.getFormula()) throw api_erreur_('Cellule calculée (formule) : écriture refusée en ' + onglet + '!' + range.getA1Notation() + ' (« ' + entete + ' »)', 'FORMULE');
  var ancienne = range.getValue();
  range.setValue(valeur);
  SpreadsheetApp.flush();
  var detail = { onEdit: 'inactif', rejoues: {}, etape: 'inactif' };
  var pont = 'inactif';
  if (api_pontActif_() && typeof api_pont_apresEdition_ === 'function') {
    detail = api_pont_apresEdition_({ ss: ctx.ss, sheet: f.sheet, range: range, oldValue: ancienne, value: valeur, auteur: a && a.auteur, utilisateur: ctx.utilisateur, champ: a && a.champ, action: a && a.action });
    pont = detail.onEdit === 'ok' ? 'ok' : (detail.onEdit === 'inactif' ? 'inactif' : 'erreur : ' + detail.onEdit);
  }
  return { pont: pont, pontDetail: detail, cellule: onglet + '!' + range.getA1Notation(), ancienne: api_iso_(ancienne, ctx.tz) };
}

/* Le pont est actif sauf si la propriété de script PONT vaut « off » (dépannage). */
function api_pontActif_() { return api_propriete_('PONT').toLowerCase() !== 'off'; }

/* =========================================================================
   AUTHENTIFICATION
   ========================================================================= */
function api_authentifier_(req, mode) {
  req = req || {};
  if (mode === 'session') {
    /* Déploiement « utilisateur accédant » : le compte Google connecté. Sans accès au classeur,
       openById échoue de toute façon. La liste COMPTES_AUTORISES / DOMAINE_AUTORISE, si elle est
       renseignée, s'applique en plus. */
    var email = '';
    try { email = Session.getActiveUser().getEmail() || ''; } catch (e) { email = ''; }
    api_verifierAcces_(email, false);
    return { utilisateur: email, mode: 'session' };
  }
  var cle = api_propriete_('CLE_API');
  if (cle && req.cle) {
    if (String(req.cle) !== cle) throw api_erreur_('Clé d\'accès incorrecte', 'ACCES');
    return { utilisateur: api_texte_(req.auteur) ? api_texte_(req.auteur) + ' (clé)' : 'clé partagée', mode: 'cle' };
  }
  if (req.idToken) {
    var info = api_verifierJetonGoogle_(String(req.idToken));
    api_verifierAcces_(info.email, true);
    return { utilisateur: info.email, nom: info.nom, mode: 'google' };
  }
  if (!cle && !api_propriete_('GOOGLE_CLIENT_ID')) throw api_erreur_('API non configurée : renseigner CLE_API (tests) ou GOOGLE_CLIENT_ID + COMPTES_AUTORISES (production) dans les propriétés du script', 'CONFIG');
  throw api_erreur_('Connexion requise', 'ACCES');
}

/* Jeton d'identité Google Sign-In → { email, nom }. Vérifié auprès de Google, mis en cache
   jusqu'à son expiration (au plus 30 min) pour ne pas interroger Google à chaque clic. */
function api_verifierJetonGoogle_(jeton) {
  var clientId = api_propriete_('GOOGLE_CLIENT_ID');
  if (!clientId) throw api_erreur_('GOOGLE_CLIENT_ID absent des propriétés du script', 'CONFIG');
  var cache = CacheService.getScriptCache();
  var empreinte = 'api_jeton:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, jeton, Utilities.Charset.UTF_8));
  var connu = cache.get(empreinte);
  if (connu) return JSON.parse(connu);
  var rep = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(jeton), { muteHttpExceptions: true });
  if (rep.getResponseCode() !== 200) throw api_erreur_('Connexion Google expirée ou invalide : reconnecte-toi', 'JETON');
  var info = JSON.parse(rep.getContentText());
  if (info.aud !== clientId) throw api_erreur_('Jeton Google émis pour une autre application', 'JETON');
  if (info.iss !== 'https://accounts.google.com' && info.iss !== 'accounts.google.com') throw api_erreur_('Émetteur du jeton inattendu', 'JETON');
  if (String(info.email_verified) !== 'true' || !info.email) throw api_erreur_('Adresse e-mail Google non vérifiée', 'ACCES');
  var res = { email: String(info.email).toLowerCase(), nom: info.name || '' };
  var restant = Math.floor(Number(info.exp) - Date.now() / 1000);
  if (restant > 60) cache.put(empreinte, JSON.stringify(res), Math.min(1800, restant));
  return res;
}

/* Comptes autorisés : COMPTES_AUTORISES (e-mails séparés par des virgules) et/ou DOMAINE_AUTORISE.
   En mode jeton Google, l'absence de toute restriction est une erreur de configuration. */
function api_verifierAcces_(utilisateur, obligatoire) {
  var liste = api_propriete_('COMPTES_AUTORISES'), domaine = api_propriete_('DOMAINE_AUTORISE').toLowerCase().replace(/^@/, '');
  if (!liste && !domaine) {
    if (obligatoire) throw api_erreur_('Aucun compte autorisé configuré (COMPTES_AUTORISES ou DOMAINE_AUTORISE) : accès refusé par prudence', 'CONFIG');
    return;
  }
  var email = String(utilisateur || '').toLowerCase();
  var comptes = liste.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  if (comptes.indexOf(email) >= 0) return;
  if (domaine && email.slice(-(domaine.length + 1)) === '@' + domaine) return;
  throw api_erreur_('Accès refusé pour ce compte', 'ACCES');
}

/* =========================================================================
   CONTEXTE : classeur, onglets, en-têtes, index des ID
   ========================================================================= */

function api_contexte_(auth) {
  auth = auth || { utilisateur: '', mode: 'inconnu' };
  var ss = api_classeur_();
  var ctx = { ss: ss, tz: ss.getSpreadsheetTimeZone(), utilisateur: auth.utilisateur || '', authMode: auth.mode, filiere: api_filiere_(ss), feuilles: {} };
  API_ONGLETS.forEach(function (nom) {
    var sheet = ss.getSheetByName(nom);
    if (!sheet) throw api_erreur_('Onglet introuvable : « ' + nom + ' »', 'STRUCTURE');
    var derniereColonne = sheet.getLastColumn();
    var derniereLigne = sheet.getLastRow();
    var entetes = sheet.getRange(API_LIGNE_ENTETES, 1, 1, derniereColonne).getValues()[0];
    var colonnes = {};
    entetes.forEach(function (h, i) { h = api_texte_(h); if (h && colonnes[h] === undefined) colonnes[h] = i + 1; });
    var colId = colonnes[API_ENTETE_ID];
    if (!colId) throw api_erreur_('Colonne « ' + API_ENTETE_ID + ' » introuvable dans ' + nom, 'STRUCTURE');
    var index = {}, doublons = [];
    var n = derniereLigne - API_PREMIERE_LIGNE + 1;
    if (n > 0) {
      sheet.getRange(API_PREMIERE_LIGNE, colId, n, 1).getValues().forEach(function (r, i) {
        var id = api_texte_(r[0]);
        if (!id) return;
        if (index[id]) { doublons.push(id); return; }
        index[id] = API_PREMIERE_LIGNE + i;
      });
    }
    ctx.feuilles[nom] = { sheet: sheet, colonnes: colonnes, entetes: entetes, colId: colId, index: index, doublons: doublons, derniereLigne: derniereLigne, derniereColonne: derniereColonne };
  });
  return ctx;
}

/* Script lié : le classeur actif. Sinon (script autonome) : propriété SPREADSHEET_ID. */
function api_classeur_() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; }
  if (!ss) {
    var id = API_FILIERE_DEMANDEE === 'autres' ? api_propriete_('SPREADSHEET_ID_AUTRES') : api_propriete_('SPREADSHEET_ID');
    if (!id) throw api_erreur_('Aucun classeur : script non lié et propriété SPREADSHEET_ID absente', 'CONFIG');
    ss = SpreadsheetApp.openById(id);
  }
  return ss;
}

/* Propriété FILIERE (implanto | autres) ; sinon devinée d'après le nom du classeur. */
function api_filiere_(ss) {
  if (API_FILIERE_DEMANDEE) return API_FILIERE_DEMANDEE;
  var p = api_propriete_('FILIERE');
  if (p) return p;
  return /autres/i.test(ss.getName()) ? 'autres' : 'implanto';
}

/* Propriété de script, sinon valeur du fichier Config.gs (API_CONFIG), sinon ''. */
function api_propriete_(nom) {
  var v = '';
  try { v = PropertiesService.getScriptProperties().getProperty(nom) || ''; } catch (e) { v = ''; }
  if (!v && typeof API_CONFIG === 'object' && API_CONFIG && API_CONFIG[nom] !== undefined && API_CONFIG[nom] !== null) v = String(API_CONFIG[nom]);
  return v;
}

/* Vérifie que tous les en-têtes dont l'API dépend existent ; renvoie la liste des manquants. */
function api_verifierEntetes_(ctx) {
  var attendus = [];
  var ajouter = function (onglet, entete) { attendus.push({ onglet: onglet, entete: entete }); };
  ['Nom complet patient', 'ID Logos', 'Type de devis / traitement', 'Statut devis', 'Date devis', 'Montant devis', API_NOTES_ENTETE].forEach(function (h) { ajouter('Lisa', h); });
  Object.keys(API_CASES).forEach(function (k) { ajouter(API_CASES[k].onglet, API_CASES[k].entete); });
  Object.keys(API_SAISIES).forEach(function (k) { ajouter(API_SAISIES[k].onglet, API_SAISIES[k].entete); });
  Object.keys(API_TYPES_RDV).forEach(function (k) { ajouter('Suivi RDV', API_TYPES_RDV[k]); });
  ajouter('Règlements', API_REGLEMENT.mode); ajouter('Règlements', API_REGLEMENT.org);
  API_REGLEMENT.etapes.forEach(function (et) { Object.keys(et).forEach(function (k) { ajouter('Règlements', et[k]); }); });
  ajouter('Marion', API_NOTES_ENTETE); ajouter('Lucie', API_NOTES_ENTETE);
  Object.keys(API_CALCULEES).forEach(function (o) { Object.keys(API_CALCULEES[o]).forEach(function (k) { ajouter(o, API_CALCULEES[o][k]); }); });
  var manquants = [];
  attendus.forEach(function (x) { if (!ctx.feuilles[x.onglet].colonnes[x.entete]) manquants.push(x.onglet + ' → « ' + x.entete + ' »'); });
  return manquants;
}

/* =========================================================================
   AGENDA — les événements du calendrier du cabinet (synchronisé avec Logos), au format
   Google, pour l'écran Agenda de l'application. Propriété AGENDA_ID (ex. l'adresse du compte
   cabinet) ; sinon le calendrier principal du compte connecté. Fenêtre : −180 / +365 jours.
   Confidentialité : de la description, seule la ligne « Type : … » est transmise.
   ========================================================================= */
var API_AGENDA_PASSE_J = 180, API_AGENDA_FUTUR_J = 365;

function api_traiterAgenda_(auth) {
  try {
    var idCal = api_propriete_('AGENDA_ID');
    var cal = idCal ? CalendarApp.getCalendarById(idCal) : CalendarApp.getDefaultCalendar();
    if (!cal) throw api_erreur_('Agenda « ' + idCal + ' » introuvable ou non partagé avec ce compte', 'AGENDA');
    var tz = cal.getTimeZone ? (cal.getTimeZone() || 'Europe/Paris') : 'Europe/Paris';
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    var debut = new Date(auj.getTime() - API_AGENDA_PASSE_J * 864e5), fin = new Date(auj.getTime() + API_AGENDA_FUTUR_J * 864e5);
    var evs = cal.getEvents(debut, fin);
    var events = evs.map(function (ev) { return api_evenement_(ev, tz); });
    return { ok: true, storedAt: Utilities.formatDate(new Date(), tz, "yyyy-MM-dd'T'HH:mm:ssXXX"), partiel: false, calendrier: idCal || 'principal', fenetre: { de: api_jourIso_(debut), a: api_jourIso_(fin) }, utilisateur: auth && auth.utilisateur, events: events };
  } catch (e) {
    return { ok: false, code: e.code || 'AGENDA', erreur: e.message || String(e) };
  }
}

/* Un événement CalendarApp → { id, summary, description (ligne « Type : … » seulement), location,
   start, end, status, htmlLink }. Journée entière : start/end en { date } ; sinon { dateTime }. */
function api_evenement_(ev, tz) {
  var desc = String(ev.getDescription() || '');
  var m = desc.match(/Type\s*:\s*[^\r\n<]+/);
  var journee = ev.isAllDayEvent();
  var iso = function (d) { return Utilities.formatDate(d, tz, "yyyy-MM-dd'T'HH:mm:ssXXX"); };
  var start, end;
  if (journee) { start = { date: api_jourIso_(ev.getAllDayStartDate()) }; end = { date: api_jourIso_(ev.getAllDayEndDate()) }; }
  else { start = { dateTime: iso(ev.getStartTime()) }; end = { dateTime: iso(ev.getEndTime()) }; }
  return { id: ev.getId(), summary: String(ev.getTitle() || ''), description: m ? m[0].trim() : '', location: String(ev.getLocation() || ''), start: start, end: end, status: 'confirmed', htmlLink: '' };
}

function api_jourIso_(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

/* =========================================================================
   OUTILS
   ========================================================================= */

/* Lecteur d'une ligne : v(entete, decalage) renvoie la valeur de la colonne (décalée de n). */
function api_lecteur_(ctx, onglet, ligne) {
  var f = ctx.feuilles[onglet];
  return {
    v: function (entete, decalage) {
      if (!ligne) return '';
      var col = f.colonnes[entete];
      if (!col) return '';
      var i = col - 1 + (decalage || 0);
      if (decalage && api_texte_(f.entetes[i]) !== API_ENTETE_HORODATAGE) return '';
      var x = ligne[i];
      return (x === undefined || x === null) ? '' : x;
    }
  };
}

function api_lireCellule_(ctx, onglet, id, entete) {
  var f = ctx.feuilles[onglet];
  var ligne = f.index[id], col = f.colonnes[entete];
  if (!ligne || !col) return '';
  return f.sheet.getRange(ligne, col).getValue();
}

/* Pour une liste déroulante : la valeur doit faire partie des choix autorisés (si la cellule en a). */
function api_verifierListe_(ctx, onglet, id, entete, valeur) {
  if (valeur === '' || valeur === null) return;
  var choix = api_choixDeListe_(ctx, onglet, id, entete);
  if (choix && choix.indexOf(valeur) < 0) throw api_erreur_('Valeur « ' + valeur + ' » hors liste pour « ' + entete + ' » (' + choix.join(' / ') + ')', 'LISTE');
}

/* Le libellé complet d'un choix de liste repéré par son début (ex. l'emoji du mode de facturation). */
function api_libelleDeListe_(ctx, onglet, id, entete, prefixe) {
  var choix = api_choixDeListe_(ctx, onglet, id, entete);
  if (!choix) return '';
  for (var i = 0; i < choix.length; i++) if (String(choix[i]).indexOf(prefixe) === 0) return String(choix[i]);
  return '';
}

function api_choixDeListe_(ctx, onglet, id, entete) {
  var f = ctx.feuilles[onglet];
  var ligne = f.index[id], col = f.colonnes[entete];
  if (!ligne || !col) return null;
  var dv = f.sheet.getRange(ligne, col).getDataValidation();
  if (!dv) return null;
  var type = dv.getCriteriaType();
  var crit = dv.getCriteriaValues();
  if (type === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) return crit[0].map(String);
  if (type === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE) return crit[0].getValues().map(function (r) { return String(r[0]); }).filter(Boolean);
  return null;
}

/* Conversion des valeurs reçues de l'application vers ce que la cellule attend. */
function api_convertir_(valeur, genre, tz) {
  if (valeur === null || valeur === undefined || valeur === '') return '';
  switch (genre) {
    case 'nombre': {
      var n = typeof valeur === 'number' ? valeur : parseFloat(String(valeur).replace(',', '.'));
      if (isNaN(n)) throw api_erreur_('Nombre attendu, reçu « ' + valeur + ' »', 'PARAMETRE');
      return n;
    }
    case 'nombre_ou_texte': {
      /* Le classeur tolère du texte dans certaines colonnes de montants (« autonome », « NC »). On le respecte. */
      if (typeof valeur === 'number') return valeur;
      var s = String(valeur).trim();
      var m = s.replace(/\s/g, '').replace(',', '.');
      return /^-?\d+(\.\d+)?$/.test(m) ? parseFloat(m) : s;
    }
    case 'date': {
      if (valeur instanceof Date) return valeur;
      var p = String(valeur).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
      if (!p) throw api_erreur_('Date attendue au format yyyy-MM-dd[THH:mm], reçu « ' + valeur + ' »', 'PARAMETRE');
      /* Un champ date du navigateur déclenche une écriture à chaque chiffre de l'année tapé (0002, 0020, 0202, 2026) ;
         et new Date(2, …) donnerait 1902 (constaté sur la copie le 18/10/2026). Hors fenêtre → refus, rien n'est écrit. */
      var an = Number(p[1]);
      if (an < API_ANNEE_MIN || an > API_ANNEE_MAX) throw api_erreur_('Année ' + p[1] + ' hors de la fenêtre ' + API_ANNEE_MIN + '–' + API_ANNEE_MAX + ' : date non écrite (saisie incomplète ?)', 'DATE');
      var dt = new Date(an, Number(p[2]) - 1, Number(p[3]), Number(p[4] || 0), Number(p[5] || 0), Number(p[6] || 0));
      dt.setFullYear(an);
      if (isNaN(dt.getTime())) throw api_erreur_('Date invalide « ' + valeur + ' »', 'DATE');
      return dt;
    }
    case 'liste':
    case 'texte':
    default:
      return String(valeur);
  }
}

/* Date → « yyyy-MM-ddTHH:mm:ss » dans le fuseau du classeur ; '' → null ; le reste inchangé. */
function api_iso_(v, tz) {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : Utilities.formatDate(v, tz, "yyyy-MM-dd'T'HH:mm:ss");
  if (v === '' || v === null || v === undefined) return null;
  return v;
}

function api_texte_(v) { return (v === null || v === undefined) ? '' : String(v).trim(); }

function api_erreur_(message, code) { var e = new Error(message); e.code = code || 'ERREUR'; return e; }

function api_json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

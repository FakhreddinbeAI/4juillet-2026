/**
 * QUESTIONNAIRES IMPLANTO — module du Workspace Hub (fichier à ajouter au projet, à côté de Code.gs)
 * Lit les réponses du « Questionnaire de pré-consultation implantologie » V3 (lien donné aux patients via Doctolib),
 * les trie avec les règles du formulaire lui-même, les rapproche de l'agenda et des devis, et donne l'action suivante.
 *
 * Le tri est ORGANISATIONNEL : aucun diagnostic, aucun classement de gravité.
 *  - « Hors parcours »     : une réponse que le formulaire marque STOP (moins de 18 ans, pas de dent manquante,
 *                             pas venu pour un implant). Le formulaire laisse continuer après un STOP, d'où ce tri.
 *  - « Avis du Dr »        : au moins une déclaration en section 2 (pathologie, médicaments, tabac), quelle qu'elle soit.
 *  - « Parcours standard » : rien de tout cela → le secrétariat propose la consultation.
 * Le Dr tranche toujours en dernier (OK consult / Appeler d'abord / Réorienter).
 * Le détail médical n'est renvoyé qu'à la Direction (contrôle côté serveur) ; l'équipe voit le statut et l'action.
 * Rien ne sort de Google : pas d'IA, pas de service externe.
 *
 * Propriétés de script (Paramètres du projet > Propriétés du script) :
 *   QX_REPONSES_ID      ID du classeur des réponses au formulaire (obligatoire)
 *   QX_LIEN_FORMULAIRE  lien court du formulaire (forms.gle/…), pour le message « questionnaire à remplir » (facultatif)
 *   QX_AGENDA_ID        agenda des RDV patients (facultatif, défaut : agenda principal du compte qui déploie)
 *   QX_COCKPIT_ID       ID de la base « Cockpit Devis — base », onglet Plans (facultatif)
 * Installation : lancer qx_installer() une fois depuis l'éditeur, puis qx_diagnostic() pour vérifier.
 */
const QX = {
  ONGLET: '',             // vide = premier onglet (« Réponses au formulaire 1 »)
  JOURS_PASSE: 90,        // fenêtre de lecture de l'agenda
  JOURS_FUTUR: 120,
  JOURS_A_VENIR: 21,      // « consultations implanto sans questionnaire » sur cet horizon
  JOURS_ACTIFS: 60,       // au-delà, une réponse sans RDV, devis, décision ni suivi passe en « Ancien »
  // Type de RDV (description « Type : … » ou lieu des événements Logos), comparé sans accents ni majuscules.
  // qx_diagnostic() liste les types réellement présents dans l'agenda pour régler ce motif.
  TYPE_CONSULT: /IMPLANT|1 ?E?R?E? CONSULT|PREMIERE CONSULT|BILAN PRE/,
  // Colonnes repérées par mots-clés dans l'en-tête : le texte exact des questions peut évoluer.
  // La première colonne qui correspond gagne : « Colonne 1 » vise A (horodatage), pas T (même titre, ajoutée à la main).
  COL: {
    horodatage:    /^horodat|^timestamp|^colonne 1$/i,
    age:           /plus de 18 ans|quel est votre [âa]ge/i,
    patient:       /^nom et pr[ée]nom|^nom complet|^nom\s*:?$/i,
    email:         /mail|courriel/i,
    tel:           /t[ée]l[ée]phone|portable/i,
    dentManquante: /dent manquante/i,
    pourImplant:   /ici pour une pose/i,
    pathologies:   /pathologies/i,
    medicaments:   /m[ée]dicaments/i,
    tabac:         /fumez/i,
    nbDents:       /combien de dents/i,
    depuis:        /depuis combien de temps/i,
    zones:         /localisation|o[ùu] se situent/i,
    prothese:      /proth[èe]se/i,
    oriente:       /orient[ée]/i,
    motivation:    /pourquoi souhaitez-vous/i,
    comprendVis:   /vis en titane/i,
    informe:       /inform[ée]\(?e?\)? que la pose/i,
    demande:       /demande libre/i
  },
  // Hors parcours : les réponses « STOP » du formulaire. Toute autre réponse contenant « STOP » compte aussi.
  HORS: [
    { col: 'age',           si: /^\s*non\b|moins de 18/i, motif: 'Moins de 18 ans' },
    { col: 'dentManquante', si: /^\s*non\b/i,             motif: 'Pas de dent manquante' },
    { col: 'pourImplant',   si: /^\s*non\b/i,             motif: 'Vient pour une consultation ou des soins, pas pour un implant' }
  ],
  // Avis du Dr : section 2 du formulaire. actif: false = la question ne déclenche plus l'avis.
  // « sauf » = réponses qui ne déclenchent rien ; tout le reste (texte libre compris) déclenche.
  AVIS: [
    { col: 'pathologies', actif: true, sauf: /^\s*aucune\b/i, motif: 'Pathologie déclarée' },
    { col: 'medicaments', actif: true, sauf: /^\s*(non|aucun|aucune|rien|n[ée]ant|pas de|0)\b|^[\s.\-]*$/i, motif: 'Médicaments déclarés' },
    { col: 'tabac',       actif: true, sauf: /^\s*non\b/i,    motif: 'Tabac déclaré' }
  ],
  // Points non bloquants, utiles pour préparer la consultation. equipe: false = Direction seulement.
  INFOS: [
    { col: 'oriente',     si: /^\s*oui\b/i,                          info: 'Adressé par son dentiste : courrier au confrère après la consultation' },
    { col: 'comprendVis', si: /besoin d.explications|^\s*non\b/i,     info: 'Explications à prévoir : ce qu\'est un implant' },
    { col: 'informe',     si: /ne savais pas|besoin d.explications/i, info: 'Explications à prévoir : chirurgie, délais, coût' },
    { col: 'demande',     si: /\S/, equipe: false,                    info: 'Message libre du patient (voir le détail)' }
  ],
  // Devis : où chercher le patient après la consultation (lecture seule, par nom).
  DEVIS: [
    { source: 'Cockpit',       propriete: 'QX_COCKPIT_ID', onglet: 'Plans', nom: 'Nom complet patient', statut: 'Statut', date: 'Date devis' },
    { source: 'Transmissions', classeur: 'Transmissions devis — Implanto', onglet: 'Lisa', nom: 'Nom complet patient', statut: 'Statut devis', date: 'Date devis' }
  ],
  DEVIS_SIGNE: /sign|accept|traitement|rdv pris/i,
  DEVIS_REFUSE: /d[ée]clin|refus|abandon/i,
  DECISIONS: ['OK consult', 'Appeler d\'abord', 'Réorienter'],
  SUIVIS: ['RDV proposé', 'Injoignable', 'Réorienté', 'Clos'],
  QUI_RDV: 'Marion',
  QUI_DR: 'Dr Tighza'
};
const QX_VOIES = { hors: 'Hors parcours implanto', avis: 'Avis du Dr avant RDV', ok: 'Parcours standard' };
const QX_ETAPES = ['Avis Dr', 'À appeler', 'RDV pris', 'Consult faite', 'Devis', 'Devis signé', 'Devis refusé', 'Hors parcours', 'Clos', 'Ancien'];
const QX_ENTETES = ['Clé', 'Reçu le', 'Patient', 'Tri auto', 'Décision Dr', 'Note Dr', 'Décision le', 'Décision par', 'Suivi', 'Suivi le', 'Suivi par'];
const QX_IGNORE_AGENDA = /^(FERME|GE|CONGE|CONGES|VACANCES|ZONE RESERVEE|REUNION|FORMATION|PAUSE|DEJEUNER)$/;

/* ---------- LECTURE POUR LA PAGE ---------- */

/** Liste + KPIs. Direction : tout. Équipe : sans le détail médical. */
function getQuestionnaires() {
  exigerDomaine_();
  const dir = estDirection_();
  const rep = qx_lireReponses_();
  const suivi = qx_lireSuivi_();
  const agenda = qx_lireAgenda_();
  const devis = qx_lireDevis_();
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  const vus = {};
  const liste = rep.patients.map(function (q) {
    const s = qx_suiviDe_(suivi, q);
    const rdv = qx_rdvPatient_(agenda, q, auj);
    rdv.cles.forEach(function (k) { vus[k] = true; });
    const dv = devis[q.jetons] || null;
    const act = qx_action_(q, s, rdv, dv, auj);
    const o = {
      cle: q.cle, patient: q.patient, recu: fmt_(q.recu, 'dd/MM/yyyy'), t: q.recu.getTime(), nb: q.nb,
      tel: q.tel, email: q.email, voie: q.voie, voieLib: QX_VOIES[q.voie],
      motifs: dir || q.voie !== 'avis' ? q.motifs : ['Avis du Dr requis'],
      infos: q.infos.filter(function (x) { return dir || x.equipe !== false; }).map(function (x) { return x.info; }),
      decision: s.decision || '', noteDr: dir ? (s.note || '') : '', decisionLe: s.decisionLe || '',
      suivi: s.suivi || '', suiviLe: s.suiviLe || '', suiviPar: s.suiviPar || '',
      rdv: rdv.prochain ? { quand: fmt_(rdv.prochain.date, "EEE d MMM 'à' HH:mm"), type: rdv.prochain.type, approx: rdv.approx } : null,
      rdvPasse: rdv.dernier ? { quand: fmt_(rdv.dernier.date, 'dd/MM/yyyy'), type: rdv.dernier.type } : null,
      devis: dv ? { source: dv.source, statut: dv.statut, date: dv.date } : null,
      action: act.action, qui: act.qui, etape: act.etape
    };
    if (dir) o.detail = q.detail;
    return o;
  });
  liste.sort(function (a, b) { return b.t - a.t; });
  const sans = qx_consultsSansQuestionnaire_(agenda, vus, auj);
  const k = { aTraiter: 0, avis: 0, appeler: 0, rdv: 0, sans: sans.length, etapes: {} };
  liste.forEach(function (o) {
    if (o.qui) k.aTraiter++;
    if (o.etape === 'Avis Dr') k.avis++;
    if (o.etape === 'À appeler') k.appeler++;
    if (o.rdv) k.rdv++;
    k.etapes[o.etape] = (k.etapes[o.etape] || 0) + 1;
  });
  return {
    liste: liste, sansQuestionnaire: sans, kpis: k, etapes: QX_ETAPES, direction: dir,
    decisions: QX.DECISIONS, suivis: QX.SUIVIS, quiDr: QX.QUI_DR,
    lien: PropertiesService.getScriptProperties().getProperty('QX_LIEN_FORMULAIRE') || '',
    colonnesManquantes: dir ? rep.manquantes : [],
    nbReponses: rep.nbReponses, joursAVenir: QX.JOURS_A_VENIR,
    agenda: agenda.erreur || '',
    maj: fmt_(new Date(), 'dd/MM HH:mm')
  };
}

/** Décision du Dr (Direction seulement). decision vide = annuler la décision. */
function qxDecider(cle, decision, note) {
  exigerDirection_();
  if (decision && QX.DECISIONS.indexOf(decision) < 0) throw new Error('Décision inconnue');
  qx_ecrireSuivi_(cle, { 'Décision Dr': decision || '', 'Note Dr': texteSur_(note, 300), 'Décision le': decision ? new Date() : '', 'Décision par': decision ? signature_(QX.QUI_DR) : '' });
  return true;
}

/** Suivi du secrétariat (toute l'équipe). statut vide = remettre à zéro. */
function qxSuivre(cle, statut, par) {
  exigerDomaine_();
  if (statut && QX.SUIVIS.indexOf(statut) < 0) throw new Error('Statut inconnu');
  qx_ecrireSuivi_(cle, { 'Suivi': statut || '', 'Suivi le': statut ? new Date() : '', 'Suivi par': statut ? signature_(par) : '' });
  return true;
}

/* ---------- RÉPONSES ---------- */

function qx_feuilleReponses_() {
  const id = PropertiesService.getScriptProperties().getProperty('QX_REPONSES_ID');
  if (!id) throw new Error('Propriété QX_REPONSES_ID manquante (ID du classeur des réponses)');
  const ss = SpreadsheetApp.openById(id);
  return (QX.ONGLET && ss.getSheetByName(QX.ONGLET)) || ss.getSheets()[0];
}

/** Toutes les réponses, regroupées par patient (le même patient renvoie parfois le formulaire) : la plus récente gagne. */
function qx_lireReponses_() {
  const sh = qx_feuilleReponses_();
  const n = sh.getLastRow(), nc = sh.getLastColumn();
  if (n < 2 || nc < 1) return { patients: [], manquantes: [], nbReponses: 0 };
  const v = sh.getRange(1, 1, n, nc).getValues();
  const col = qx_colonnes_(v[0]);
  const manquantes = ['horodatage', 'patient', 'dentManquante', 'pathologies'].filter(function (c) { return col[c] == null; });
  const reponses = [];
  for (let i = 1; i < v.length; i++) {
    const q = qx_analyser_(v[i], col, v[0]);
    if (q) reponses.push(q);
  }
  return { patients: qx_regrouper_(reponses), manquantes: manquantes, nbReponses: reponses.length };
}

/** En-tête → { clé de QX.COL: index }. Une colonne ne sert qu'une fois ; l'ordre de QX.COL départage. */
function qx_colonnes_(entete) {
  const col = {}, prises = {};
  Object.keys(QX.COL).forEach(function (k) {
    for (let j = 0; j < entete.length; j++) {
      if (!prises[j] && QX.COL[k].test(String(entete[j]).trim())) { col[k] = j; prises[j] = true; return; }
    }
  });
  return col;
}

/** Une ligne de réponse → tri automatique (null si ce n'est pas une vraie réponse). Sans appel Google : testable. */
function qx_analyser_(ligne, col, entete) {
  const recu = ligne[col.horodatage];
  if (!(recu instanceof Date) || isNaN(recu)) return null; // ligne de test, ligne vide
  const val = function (k) { return col[k] == null ? '' : String(ligne[col[k]] == null ? '' : ligne[col[k]]).trim(); };
  const patient = val('patient').replace(/\s+/g, ' ') || '(sans nom)';
  const motifsHors = [], motifsAvis = [], infos = [];
  QX.HORS.forEach(function (r) { if (r.si.test(val(r.col))) motifsHors.push(r.motif); });
  if (!motifsHors.length) ligne.forEach(function (c, j) {
    if (/\bSTOP\b/.test(String(c))) motifsHors.push('Réponse « STOP » : ' + qx_court_(entete[j]));
  });
  QX.AVIS.forEach(function (r) {
    const x = val(r.col);
    if (r.actif && x && !r.sauf.test(x)) motifsAvis.push(r.motif);
  });
  QX.INFOS.forEach(function (r) { if (r.si.test(val(r.col))) infos.push({ info: r.info, equipe: r.equipe }); });
  const voie = motifsHors.length ? 'hors' : motifsAvis.length ? 'avis' : 'ok';
  const jetons = qx_jetons_(patient);
  return {
    cle: qx_dateCle_(recu) + '|' + jetons, recu: recu, patient: patient, jetons: jetons,
    tel: qx_tel_(val('tel')), email: val('email').toLowerCase(), voie: voie,
    motifs: voie === 'hors' ? motifsHors : motifsAvis, infos: infos,
    detail: [['Pathologies', val('pathologies')], ['Médicaments', val('medicaments')], ['Tabac', val('tabac')],
             ['Dents manquantes', [val('nbDents'), val('zones'), val('depuis')].filter(String).join(' · ')],
             ['Prothèse actuelle', val('prothese')], ['Adressé par son dentiste', val('oriente')],
             ['Motivation', val('motivation')], ['Compréhension', [val('comprendVis'), val('informe')].filter(String).join(' · ')],
             ['Demande libre', val('demande')]]
      .filter(function (x) { return x[1]; })
  };
}

/**
 * Regroupe les réponses d'un même patient et garde la plus récente. Même nom = même patient.
 * Même téléphone ou même e-mail = même patient seulement si un nom contient l'autre (« Roux » / « Roux Inès ») :
 * deux membres d'une famille qui partagent un numéro restent séparés.
 */
function qx_regrouper_(reponses) {
  const groupes = [], index = {};
  const compatibles = function (a, b) {
    const x = a.split(' '), y = b.split(' ');
    const inclus = function (p, q) { return p.every(function (m) { return q.indexOf(m) > -1; }); };
    return inclus(x, y) || inclus(y, x);
  };
  reponses.slice().sort(function (a, b) { return a.recu - b.recu; }).forEach(function (q) {
    const ids = ['n:' + q.jetons, q.tel ? 't:' + q.tel : '', /@/.test(q.email) ? 'm:' + q.email : ''].filter(function (x) { return x && x !== 'n:'; });
    let g = null;
    ids.forEach(function (id) {
      if (g != null || index[id] == null) return;
      const autre = groupes[index[id]][groupes[index[id]].length - 1];
      if (id.charAt(0) === 'n' || compatibles(q.jetons, autre.jetons)) g = index[id];
    });
    if (g == null) { g = groupes.length; groupes.push([]); }
    groupes[g].push(q);
    ids.forEach(function (id) { index[id] = g; });
  });
  return groupes.map(function (g) {
    const q = g[g.length - 1];
    q.nb = g.length;
    q.anciennesCles = g.slice(0, -1).map(function (x) { return x.cle; }).reverse();
    return q;
  });
}

/** Nom → jetons triés, sans accents : « Dupont Marie », « MARIE DUPONT » et « dupont  marie » donnent la même clé. */
function qx_jetons_(s) { return qx_norm_(s).split(' ').filter(String).sort().join(' '); }
function qx_norm_(s) { return String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/[-'’.,]/g, ' ').replace(/\s+/g, ' ').trim(); }
function qx_tel_(s) {
  let d = String(s || '').replace(/[oO]/g, '0').replace(/\D/g, '');
  if (/^33\d{9}$/.test(d)) d = '0' + d.slice(2);
  if (/^[1-9]\d{8}$/.test(d)) d = '0' + d; // zéro perdu quand la cellule est un nombre
  return /^0\d{9}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, '$1 ') : String(s || '').trim();
}
function qx_dateCle_(d) { return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2) + ('0' + d.getSeconds()).slice(-2); }
function qx_court_(s) { s = String(s).trim(); return s.length > 60 ? s.slice(0, 59) + '…' : s; }

/* ---------- ACTION SUIVANTE ---------- */

/** Étape du pipeline et prochaine action. Ordre : clos → devis → ancien → hors parcours → avis → RDV → appel. */
function qx_action_(q, s, rdv, dv, auj) {
  const dec = s.decision || '';
  const voie = dec === 'OK consult' ? 'ok' : dec === 'Réorienter' ? 'hors' : q.voie;
  const fin = function (etape) { return { action: '', qui: '', etape: etape }; };
  if (s.suivi === 'Clos') return fin('Clos');
  if (dv) return fin(QX.DEVIS_REFUSE.test(dv.statut) ? 'Devis refusé' : QX.DEVIS_SIGNE.test(dv.statut) ? 'Devis signé' : 'Devis');
  if (!dec && !s.suivi && !rdv.prochain && !rdv.dernier && q.recu < new Date(auj.getTime() - QX.JOURS_ACTIFS * 86400000)) return fin('Ancien');
  if (voie === 'hors') {
    if (s.suivi === 'Réorienté') return fin('Clos');
    return { action: 'Réorienter vers une consultation générale' + (rdv.prochain ? ' (RDV du ' + fmt_(rdv.prochain.date, 'dd/MM') + ' à vérifier)' : ''), qui: QX.QUI_RDV, etape: 'Hors parcours' };
  }
  if (voie === 'avis' && !dec) return { action: 'Donner l\'avis sur le questionnaire', qui: QX.QUI_DR, etape: 'Avis Dr' };
  if (dec === 'Appeler d\'abord') return { action: 'Appeler le patient avant de fixer le RDV', qui: QX.QUI_DR, etape: 'Avis Dr' };
  if (rdv.prochain) return fin('RDV pris');
  if (rdv.dernier) return { action: 'Consultation faite le ' + fmt_(rdv.dernier.date, 'dd/MM') + ' : devis à faire ou dossier à clore', qui: QX.QUI_DR, etape: 'Consult faite' };
  if (s.suivi === 'Injoignable') return { action: 'Rappeler (injoignable le ' + s.suiviLe + ')', qui: QX.QUI_RDV, etape: 'À appeler' };
  if (s.suivi === 'RDV proposé') return { action: 'Vérifier que le RDV est bien pris (proposé le ' + s.suiviLe + ')', qui: QX.QUI_RDV, etape: 'À appeler' };
  return { action: 'Proposer la consultation implanto', qui: QX.QUI_RDV, etape: 'À appeler' };
}

/* ---------- SUIVI (décisions + statuts, feuille propre au Hub) ---------- */

function qx_feuilleSuivi_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('QX_SUIVI_ID');
  if (id) return SpreadsheetApp.openById(id).getSheets()[0];
  const verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    const deja = props.getProperty('QX_SUIVI_ID');
    if (deja) return SpreadsheetApp.openById(deja).getSheets()[0];
    const ss = SpreadsheetApp.create('Questionnaires implanto — suivi (Workspace Hub)');
    ss.setSpreadsheetLocale('fr_FR');
    const sh = ss.getSheets()[0];
    sh.setName('Suivi');
    sh.appendRow(QX_ENTETES);
    sh.setFrozenRows(1);
    props.setProperty('QX_SUIVI_ID', ss.getId());
    return sh;
  } finally {
    verrou.releaseLock();
  }
}

function qx_lireSuivi_() {
  const sh = qx_feuilleSuivi_();
  const n = sh.getLastRow();
  const out = {};
  if (n < 2) return out;
  const d = function (x) { return x instanceof Date ? fmt_(x, 'dd/MM') : String(x || ''); };
  sh.getRange(2, 1, n - 1, QX_ENTETES.length).getValues().forEach(function (r) {
    if (r[0]) out[String(r[0])] = { decision: String(r[4] || ''), note: String(r[5] || ''), decisionLe: d(r[6]), suivi: String(r[8] || ''), suiviLe: d(r[9]), suiviPar: String(r[10] || '') };
  });
  return out;
}

/** Suivi de la réponse la plus récente ; à défaut, celui d'une réponse précédente du même patient. */
function qx_suiviDe_(suivi, q) {
  if (suivi[q.cle]) return suivi[q.cle];
  for (let i = 0; i < q.anciennesCles.length; i++) if (suivi[q.anciennesCles[i]]) return suivi[q.anciennesCles[i]];
  return {};
}

function qx_ecrireSuivi_(cle, champs) {
  const q = qx_lireReponses_().patients.filter(function (x) { return x.cle === cle; })[0];
  if (!q) throw new Error('Questionnaire introuvable');
  const verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    const sh = qx_feuilleSuivi_();
    const n = sh.getLastRow();
    const cles = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    let ligne = cles.indexOf(cle) + 2;
    if (ligne < 2) {
      sh.appendRow([cle, q.recu, q.patient, QX_VOIES[q.voie]]);
      ligne = sh.getLastRow();
    }
    Object.keys(champs).forEach(function (h) { sh.getRange(ligne, QX_ENTETES.indexOf(h) + 1).setValue(champs[h]); });
  } finally {
    verrou.releaseLock();
  }
}

/* ---------- AGENDA (RDV Logos / Doctolib recopiés dans Google Agenda) ---------- */

function qx_lireAgenda_() {
  const out = { parNom: {}, liste: [], erreur: '' };
  try {
    const id = PropertiesService.getScriptProperties().getProperty('QX_AGENDA_ID');
    const cal = id ? CalendarApp.getCalendarById(id) : CalendarApp.getDefaultCalendar();
    if (!cal) throw new Error('agenda « ' + id + ' » introuvable');
    const debut = new Date(Date.now() - QX.JOURS_PASSE * 86400000), fin = new Date(Date.now() + QX.JOURS_FUTUR * 86400000);
    cal.getEvents(debut, fin).forEach(function (ev) {
      const e = qx_evenement_(ev.getTitle(), ev.getDescription(), ev.getLocation(), ev.getStartTime(), ev.isAllDayEvent());
      if (!e) return;
      out.liste.push(e);
      (out.parNom[e.jetons] = out.parNom[e.jetons] || []).push(e);
    });
  } catch (err) {
    out.erreur = 'Agenda non lu : ' + err.message;
  }
  return out;
}

/** Même lecture que Transmissions devis : titre = patient [annotations], type dans « Type : … » (description) ou dans le lieu. */
function qx_evenement_(titre, desc, lieu, debut, journee) {
  if (journee) return null;
  desc = String(desc || ''); lieu = String(lieu || ''); titre = String(titre || '').trim();
  const mType = desc.match(/Type\s*:\s*([^\r\n]+)/i);
  const type = mType ? mType[1].trim() : lieu.replace(/\s*\(S\.?\s*\d+\)\s*$/i, '').trim();
  if (!mType && !/\((S\.?\s*\d+)\)/i.test(lieu)) return null;
  if (/ZONE RESERVEE/.test(qx_norm_(type))) return null;
  const nom = titre.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
  if (!nom || QX_IGNORE_AGENDA.test(qx_norm_(nom))) return null;
  return { date: debut, nom: nom, jetons: qx_jetons_(nom), type: type, typeN: qx_norm_(type) };
}

/**
 * RDV d'un patient : mêmes jetons de nom (ordre indifférent). À défaut, un nom qui contient l'autre
 * (nom composé, deuxième prénom) : rapprochement marqué « à confirmer ». Un nom d'un seul mot n'est jamais rapproché à peu près.
 */
function qx_rdvPatient_(agenda, q, auj) {
  let evs = agenda.parNom[q.jetons] || [];
  const cles = evs.length ? [q.jetons] : [];
  let approx = false;
  const mots = q.jetons.split(' ');
  if (!evs.length && mots.length > 1) {
    Object.keys(agenda.parNom).forEach(function (k) {
      const p = k.split(' ');
      if (p.length < 2) return;
      const inclus = function (a, b) { return a.every(function (x) { return b.indexOf(x) > -1; }); };
      if (inclus(mots, p) || inclus(p, mots)) { evs = evs.concat(agenda.parNom[k]); cles.push(k); }
    });
    approx = evs.length > 0;
  }
  const depuis = new Date(q.recu.getTime() - 7 * 86400000);
  const futurs = evs.filter(function (e) { return e.date >= auj; }).sort(function (x, y) { return x.date - y.date; });
  const passes = evs.filter(function (e) { return e.date < auj && e.date >= depuis; }).sort(function (x, y) { return y.date - x.date; });
  return { prochain: futurs[0] || null, dernier: passes[0] || null, approx: approx, cles: cles };
}

/** Consultations implanto à venir dont le patient n'a pas (encore) rempli le questionnaire. */
function qx_consultsSansQuestionnaire_(agenda, vus, auj) {
  const fin = new Date(auj.getTime() + QX.JOURS_A_VENIR * 86400000);
  return agenda.liste
    .filter(function (e) { return e.date >= auj && e.date < fin && QX.TYPE_CONSULT.test(e.typeN) && !vus[e.jetons]; })
    .sort(function (x, y) { return x.date - y.date; })
    .map(function (e) { return { patient: e.nom, quand: fmt_(e.date, "EEE d MMM 'à' HH:mm"), jour: fmt_(e.date, 'EEEE d MMMM'), type: e.type }; });
}

/* ---------- DEVIS (Cockpit, Transmissions) ---------- */

/** Jetons du nom → devis le plus récent, toutes sources confondues. Une source absente ou inaccessible est ignorée. */
function qx_lireDevis_() {
  const out = {};
  QX.DEVIS.forEach(function (src) {
    try {
      let id = src.propriete ? PropertiesService.getScriptProperties().getProperty(src.propriete) : '';
      if (!id && src.classeur) id = (CFG.CLASSEURS.filter(function (c) { return c.nom === src.classeur; })[0] || {}).id;
      if (!id) return;
      const sh = SpreadsheetApp.openById(id).getSheetByName(src.onglet);
      if (!sh || sh.getLastRow() < 2) return;
      const v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
      let iEnt = -1;
      for (let i = 0; i < Math.min(10, v.length); i++) if (v[i].map(String).indexOf(src.nom) > -1) { iEnt = i; break; }
      if (iEnt < 0) return;
      const h = v[iEnt].map(String), cN = h.indexOf(src.nom), cS = h.indexOf(src.statut), cD = h.indexOf(src.date);
      v.slice(iEnt + 1).forEach(function (r) {
        const k = qx_jetons_(r[cN]);
        if (!k) return;
        const d = cD > -1 && r[cD] instanceof Date ? r[cD] : null;
        if (out[k] && out[k].t >= (d ? d.getTime() : 0)) return;
        out[k] = { source: src.source, statut: cS > -1 ? String(r[cS] || '') : '', date: d ? fmt_(d, 'dd/MM/yyyy') : '', t: d ? d.getTime() : 0 };
      });
    } catch (e) { /* source facultative */ }
  });
  return out;
}

/* ---------- AUTOMATISMES ---------- */

/** À lancer une fois : crée la feuille de suivi et le déclencheur « nouvelle réponse ». */
function qx_installer() {
  const id = PropertiesService.getScriptProperties().getProperty('QX_REPONSES_ID');
  if (!id) throw new Error('Renseigner d\'abord la propriété QX_REPONSES_ID');
  qx_feuilleSuivi_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'qx_surReponse') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('qx_surReponse').forSpreadsheet(id).onFormSubmit().create();
  Logger.log('Suivi : ' + SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('QX_SUIVI_ID')).getUrl());
  Logger.log('Déclencheur posé : chaque nouvelle réponse est triée à l\'arrivée.');
}

/** Nouvelle réponse : si l'avis du Dr est requis, un mail SANS nom ni détail médical prévient la Direction. */
function qx_surReponse(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  const ent = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const q = qx_analyser_(sh.getRange(e.range.getRow(), 1, 1, sh.getLastColumn()).getValues()[0], qx_colonnes_(ent), ent);
  if (!q || q.voie !== 'avis') return;
  GmailApp.sendEmail(CFG.DIRECTION[0], 'Questionnaire implanto : un avis vous attend',
    'Un nouveau questionnaire de pré-consultation implantologie attend votre avis.\n' +
    'Workspace Hub > onglet Questionnaires.\n\n(Message automatique, sans donnée patient.)');
}

/** Contrôle sans nom de patient : colonnes reconnues, répartition du tri, types de RDV présents dans l'agenda. */
function qx_diagnostic() {
  const sh = qx_feuilleReponses_();
  const ent = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const col = qx_colonnes_(ent);
  Logger.log('Onglet lu : « ' + sh.getName() + ' »');
  Object.keys(QX.COL).forEach(function (k) { Logger.log((col[k] == null ? '⚠️ non trouvée : ' : '✓ ') + k + (col[k] == null ? '' : ' → ' + qx_court_(ent[col[k]]))); });
  ent.forEach(function (h, j) { if (Object.keys(col).every(function (k) { return col[k] !== j; })) Logger.log('· colonne non utilisée : ' + qx_court_(h)); });
  const r = qx_lireReponses_(), n = { hors: 0, avis: 0, ok: 0 };
  r.patients.forEach(function (q) { n[q.voie]++; });
  Logger.log(r.nbReponses + ' réponses, ' + r.patients.length + ' patients. Tri : ' + n.ok + ' parcours standard · ' + n.avis + ' avis du Dr · ' + n.hors + ' hors parcours');
  const ag = qx_lireAgenda_(), types = {};
  ag.liste.forEach(function (e) { types[e.type] = (types[e.type] || 0) + 1; });
  Logger.log(ag.erreur || ('Agenda : ' + ag.liste.length + ' RDV patients lus. Types de RDV (✓ = compté comme consultation implanto) :'));
  Object.keys(types).sort().forEach(function (t) { Logger.log((QX.TYPE_CONSULT.test(qx_norm_(t)) ? '✓ ' : '  ') + t + ' (' + types[t] + ')'); });
}

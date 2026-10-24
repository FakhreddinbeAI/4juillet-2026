/**
 * COCKPIT_PONT.gs — recopie horaire des nouveaux dossiers de Lisa vers Marion, Lucie, Règlements, Suivi RDV.
 * -----------------------------------------------------------------------------------------------------
 * Pourquoi : le Cockpit Devis écrit les dossiers signés dans l'onglet Lisa PAR SCRIPT ; or le déclencheur
 * « lors d'une modification » (lisaAutoPropager) ne réagit qu'aux saisies à la main. Ce fichier rejoue, toutes
 * les 15 minutes, exactement ce que fait lisaAutoPropager, avec les mêmes fonctions du projet et le même
 * garde-fou. Décision du Dr, 24/10/2026 (option A). AUCUN autre fichier du projet n'est modifié.
 *
 * Fichier identique dans les deux projets (Implanto et Autres devis) : il calcule lui-même les dossiers
 * manquants (copie de lisaAutoEtat_, absente du projet Autres devis).
 *
 * cockpitPont_simuler()        lecture seule : affiche ce qui serait recopié, n'écrit rien
 * cockpitPont_installer()      pose le déclencheur toutes les 15 min (idempotent)
 * cockpitPont_desinstaller()   retire ce déclencheur (et seulement lui)
 * cockpitPont_recopier()       appelée par le déclencheur
 */

var COCKPIT_PONT_CFG = {
  fonction: 'cockpitPont_recopier', minutes: 15,
  premiereLigne: 4, ongletLisa: 'Lisa', ongletMarion: 'Marion', ongletReglements: 'Règlements',
  colId: 1, colNom: 2, colType: 4,      // Lisa : A = ID dossier, B = nom, D = type (comme LISA_AUTO_CFG)
  colIdMarion: 2                        // Marion : B = ID dossier
};

function cockpitPont_recopier() {
  var cfg = COCKPIT_PONT_CFG, propre = LockService.getScriptLock();
  if (!propre.tryLock(1000)) return;                       // un passage à la fois
  try {
    var etat = cockpitPont_etat_();
    if (!etat.manquants.length && !etat.manquantsReglements.length) return;
    if (etat.incomplets.length) { console.log('cockpitPont : saisie en cours (B ou D vide) pour ' + etat.incomplets.join(', ') + ' : on attend'); return; }
    if (etat.manquants.length) console.log('cockpitPont\n' + insererDossiersManquants());   // verrou de document interne
    if (etat.manquantsReglements.length) {
      var trou = cockpitPont_trouReglements_();
      if (trou) console.error('cockpitPont : Règlements!A a une ligne vide (ligne ' + trou + ') avant la dernière ligne remplie : synchronisation Règlements NON lancée pour ne rien écraser (' + etat.manquantsReglements.join(', ') + ')');
      else {
        var verrou = LockService.getDocumentLock();
        verrou.waitLock(30000);
        try { reglements_synchroniser(); console.log('cockpitPont : Règlements synchronisé (' + etat.manquantsReglements.join(', ') + ')'); }
        finally { verrou.releaseLock(); }
      }
    }
    if (typeof fiab_autoReparer === 'function') fiab_autoReparer();   // formules + Suivi RDV
  } catch (err) {
    console.error('cockpitPont : ' + (err && err.message ? err.message : err));
  } finally { propre.releaseLock(); }
}

/** Lecture seule : ce que ferait cockpitPont_recopier maintenant. */
function cockpitPont_simuler() {
  var etat = cockpitPont_etat_(), L = [];
  L.push('Classeur : ' + SpreadsheetApp.getActive().getName());
  L.push('Absents de Marion : ' + (etat.manquants.join(', ') || 'aucun'));
  L.push('Absents de Règlements : ' + (etat.manquantsReglements.join(', ') || 'aucun'));
  L.push('Incomplets (B ou D vide, on attendrait) : ' + (etat.incomplets.join(', ') || 'aucun'));
  var trou = cockpitPont_trouReglements_();
  L.push('Règlements!A : ' + (trou ? 'ligne vide en ' + trou + ' → la synchro Règlements serait BLOQUÉE' : 'pas de trou'));
  if (etat.manquants.length && typeof insererDossiersManquants_ === 'function') L.push(insererDossiersManquants_(true));
  L.push(etat.manquants.length || etat.manquantsReglements.length
    ? (etat.incomplets.length ? '→ Rien ne serait fait (saisie en cours).' : '→ Ces dossiers SERAIENT recopiés au prochain passage.')
    : '→ Rien à recopier.');
  Logger.log(L.join('\n'));
  return L.join('\n');
}

function cockpitPont_installer() {
  cockpitPont_desinstaller();
  ScriptApp.newTrigger(COCKPIT_PONT_CFG.fonction).timeBased().everyMinutes(COCKPIT_PONT_CFG.minutes).create();
  Logger.log('Déclencheur cockpitPont_recopier installé (toutes les ' + COCKPIT_PONT_CFG.minutes + ' min).');
}

function cockpitPont_desinstaller() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === COCKPIT_PONT_CFG.fonction) { ScriptApp.deleteTrigger(t); n++; }
  });
  Logger.log('Déclencheurs cockpitPont_recopier retirés : ' + n);
  return n;
}

/** Copie de lisaAutoEtat_ (LISA_AUTO.gs du projet Implanto), autonome. */
function cockpitPont_etat_() {
  var cfg = COCKPIT_PONT_CFG, ss = SpreadsheetApp.getActive();
  var lisa = ss.getSheetByName(cfg.ongletLisa), marion = ss.getSheetByName(cfg.ongletMarion);
  var etat = { manquants: [], manquantsReglements: [], incomplets: [] };
  if (!lisa || !marion) return etat;
  var p = cfg.premiereLigne, nbLisa = lisa.getLastRow() - p + 1;
  if (nbLisa < 1) return etat;
  var presents = {}, nbMarion = marion.getLastRow() - p + 1;
  if (nbMarion > 0) marion.getRange(p, cfg.colIdMarion, nbMarion, 1).getDisplayValues().forEach(function (l) { var v = String(l[0]).trim(); if (v) presents[v] = true; });
  var presentsReg = {}, reg = ss.getSheetByName(typeof REG_CFG !== 'undefined' ? REG_CFG.onglet : cfg.ongletReglements);
  if (reg) {
    var pr = typeof REG_CFG !== 'undefined' ? REG_CFG.premiereLigne : p, nbReg = reg.getLastRow() - pr + 1;
    if (nbReg > 0) reg.getRange(pr, 1, nbReg, 1).getDisplayValues().forEach(function (l) { var v = String(l[0]).trim(); if (v) presentsReg[v] = true; });
  }
  lisa.getRange(p, 1, nbLisa, cfg.colType).getDisplayValues().forEach(function (l) {
    var id = String(l[cfg.colId - 1]).trim();
    if (!id) return;
    var absentMarion = !presents[id], absentReg = !!reg && !presentsReg[id];
    if (!absentMarion && !absentReg) return;
    if (absentMarion) etat.manquants.push(id);
    if (absentReg) etat.manquantsReglements.push(id);
    if (!String(l[cfg.colNom - 1]).trim() || !String(l[cfg.colType - 1]).trim()) etat.incomplets.push(id);
  });
  return etat;
}

/**
 * reglements_synchroniser écrit à partir de « ligne 4 + nombre d'ID non vides » : un trou dans Règlements!A
 * lui ferait écraser des lignes remplies. Renvoie le n° de la première ligne vide suivie d'une ligne remplie, ou 0.
 */
function cockpitPont_trouReglements_() {
  var ss = SpreadsheetApp.getActive(), reg = ss.getSheetByName(typeof REG_CFG !== 'undefined' ? REG_CFG.onglet : COCKPIT_PONT_CFG.ongletReglements);
  if (!reg) return 0;
  var p = typeof REG_CFG !== 'undefined' ? REG_CFG.premiereLigne : COCKPIT_PONT_CFG.premiereLigne, n = reg.getLastRow() - p + 1;
  if (n < 1) return 0;
  var v = reg.getRange(p, 1, n, 1).getValues().map(function (l) { return String(l[0]).trim(); }), vide = 0;
  for (var i = 0; i < v.length; i++) { if (!v[i]) { if (!vide) vide = p + i; } else if (vide) return vide; }
  return 0;
}

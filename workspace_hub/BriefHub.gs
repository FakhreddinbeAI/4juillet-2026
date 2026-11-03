/**
 * BriefHub.gs — Le brief quotidien dans le Workspace Hub
 * ==================================================================
 * Rôle : afficher dans l'onglet « ☀️ Brief » du Hub exactement le même brief
 *        que le mail du matin. Le moteur reste Brief.gs (copie à l'identique
 *        du Code.gs du projet « Brief du matin — Cabinet »). Ici, on ne fait
 *        que l'appeler et renvoyer le HTML à la page.
 *
 * Lecture seule : n'écrit dans aucun classeur, n'envoie aucun mail.
 * Accès : Direction uniquement (le brief contient Gmail + les files de l'équipe).
 *
 * Fonctions :
 *   getBrief(cible)      → appelée par la page : 'jour' (aujourd'hui) | 'suivant' (prochain jour ouvré)
 *   briefHub_test()      → à lancer une fois depuis l'éditeur : autorise + vérifie (voir Exécutions)
 *
 * Ouvrir l'onglet à l'équipe : remplacer exigerDirection_() par exigerDomaine_() ci-dessous
 * ET mettre dir:false dans le bloc ajouté à index.html.
 * ⚠️ La section Gmail du brief montrerait alors la boîte de contact@ à toute l'équipe.
 */

function getBrief(cible) {
  exigerDirection_();
  var jour = brief_aujourdhui_();
  if (cible === 'suivant') jour = briefHub_prochainJourOuvert_(jour);
  var res = brief_construire_(jour);
  // Uniquement des textes / booléens : google.script.run ne transporte pas les objets Date.
  return {
    jour: jour,
    titre: brief_jourLong_(jour),
    objet: res.objet,
    html: res.html,
    ferme: !!(res.stats.ferme && res.stats.rdv === 0),
    calculeA: Utilities.formatDate(new Date(), BRIEF_CFG.fuseau, 'HH:mm')
  };
}

/**
 * Premier jour après `depuisIso` où le cabinet n'est pas fermé.
 * Même règle que le mail (brief_infoJour_) : week-end sans RDV, ou « Fermé » noté sans RDV.
 * Ne lit que l'agenda jour par jour (rapide) ; le brief complet n'est calculé qu'une fois.
 */
function briefHub_prochainJourOuvert_(depuisIso) {
  var midi = brief_dateLocale_(depuisIso, '12:00');
  for (var i = 1; i <= 14; i++) {
    var iso = brief_iso_(new Date(midi.getTime() + i * 86400000));
    var d0 = brief_dateLocale_(iso, '00:00');
    var evts = brief_lireAgenda_(d0, new Date(d0.getTime() + 86400000))
      .map(function (e) { return brief_analyser_(e); });
    if (!brief_infoJour_(iso, evts).ferme) return iso;
  }
  return brief_iso_(new Date(midi.getTime() + 86400000)); // garde-fou : le lendemain
}

/** Test éditeur : lance-le une fois (déclenche l'autorisation), puis lis le journal. */
function briefHub_test() {
  ['jour', 'suivant'].forEach(function (c) {
    var t0 = Date.now();
    var r = getBrief(c);
    Logger.log(c + ' → ' + r.objet + ' · ' + Math.round(r.html.length / 1024) + ' Ko · ' +
               ((Date.now() - t0) / 1000).toFixed(1) + ' s' + (r.ferme ? ' · FERMÉ' : ''));
  });
}

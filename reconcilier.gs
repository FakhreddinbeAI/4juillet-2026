/**
 * RECONCILIER — remettre la feuille et le Drive d accord
 * A coller dans le MEME projet Apps Script. Remplace reparerLiens().
 *
 * L audit a trouve 61 noms sur 117 introuvables dans le Drive. Deux causes
 * distinctes, deux remedes :
 *
 *   1. LE BLOC DE PERIODE EN TROP. Le vrai fichier est
 *      « 2026-09-30_BNP-2112_RELEVE_26009.pdf » et la feuille attendait
 *      « ..._26009_P2026-09-01-au-2026-09-30.pdf ». Or la convention rend ce
 *      bloc FACULTATIF : le fichier est conforme, c est le nom attendu qui
 *      etait faux. On corrige la FEUILLE.
 *
 *   2. JAMAIS RENOMME. Le fichier existe sous son nom d origine, du genre
 *      « 2026-03-06 Canva Pro Solo 04812-63634805 12,00 EUR.pdf ». La feuille
 *      a raison, c est le FICHIER qu on renomme.
 *
 * LA REGLE DE PRUDENCE : on ne renomme que si la REFERENCE du nom attendu se
 * retrouve dans le nom du fichier, et seulement s il y a UN SEUL candidat.
 * Deux candidats, ou aucune reference : on ne touche a rien et on signale.
 * Un montant identique ne vaut jamais preuve — cinq loyers COFICA font
 * 1 353,76 et deux factures Aries 990,00.
 *
 * ET ON NE RENOMME JAMAIS DANS LE MIROIR DU DISQUE. Le dossier
 * Telechargements est synchronise : le renommer renommerait sur l ordinateur.
 * Ces candidats sont signales, pas touches.
 *
 * Aucune alerte en fin de parcours : un alert() apres une longue boucle
 * attend le clic et a deja fait exploser la limite des 30 minutes. Tout va
 * dans le journal.
 */

var MIROIR_TELECHARGEMENTS = "1adB-euhu-ZkMQ1E07_J5azVWgWji2Zat";
var R_FICHIER = 10, R_REF = 8, R_LIEN = 12, R_LIGNE1 = 2;


/** Enleve le bloc _Pdebut-au-fin d un nom, s il y en a un. */
function sansPeriode_(nom) {
  return nom.replace(/_P\d{4}-\d{2}-\d{2}-au-\d{4}-\d{2}-\d{2}(?=\.pdf$)/i, "");
}


function dansLeMiroir_(fichier) {
  var p = fichier.getParents();
  while (p.hasNext()) if (p.next().getId() === MIROIR_TELECHARGEMENTS) return true;
  return false;
}


function poserLien_(cellule, fichier) {
  cellule.setFontColor(null).setFontWeight(null);
  cellule.setRichTextValue(SpreadsheetApp.newRichTextValue()
    .setText("ouvrir").setLinkUrl(fichier.getUrl()).build());
}


function reconcilier() {
  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var nb = f.getLastRow() - R_LIGNE1 + 1;
  if (nb < 1) { Logger.log("Feuille vide."); return; }

  var noms = f.getRange(R_LIGNE1, R_FICHIER, nb, 1).getValues();
  var refs = f.getRange(R_LIGNE1, R_REF,     nb, 1).getValues();

  var ok = 0, nomsCorriges = [], fichiersRenommes = [], ambigus = [],
      miroir = [], introuvables = [], vides = 0;

  for (var i = 0; i < nb; i++) {
    var ligne = R_LIGNE1 + i;
    var nom = String(noms[i][0] || "").trim();
    var cel = f.getRange(ligne, R_LIEN);
    if (!nom) { cel.clearContent(); vides++; continue; }

    // 1. le nom exact
    var it = DriveApp.getFilesByName(nom);
    if (it.hasNext()) { poserLien_(cel, it.next()); ok++; continue; }

    // 2. le meme nom sans le bloc de periode
    var court = sansPeriode_(nom);
    if (court !== nom) {
      var it2 = DriveApp.getFilesByName(court);
      if (it2.hasNext()) {
        f.getRange(ligne, R_FICHIER).setValue(court);
        poserLien_(cel, it2.next());
        nomsCorriges.push(ligne + " : " + court);
        continue;
      }
    }

    // 3. par la reference, et seulement si elle designe UN SEUL fichier
    var ref = String(refs[i][0] || "").trim();
    if (ref.length >= 4 && ref.indexOf("'") === -1) {
      var cands = [], it3 = DriveApp.searchFiles("title contains '" + ref + "'");
      while (it3.hasNext() && cands.length < 5) cands.push(it3.next());

      if (cands.length === 1) {
        if (dansLeMiroir_(cands[0])) {
          miroir.push(ligne + " : " + cands[0].getName());
        } else {
          var avant = cands[0].getName();
          cands[0].setName(nom);
          poserLien_(cel, cands[0]);
          fichiersRenommes.push(ligne + " : " + avant + "  ->  " + nom);
        }
        continue;
      }
      if (cands.length > 1) {
        var l = [];
        for (var c = 0; c < cands.length; c++) l.push(cands[c].getName());
        ambigus.push(ligne + " : " + ref + " donne " + cands.length +
                     " candidats -> " + l.join(" | "));
        cel.setValue("A TRANCHER").setFontColor("#b45f06").setFontWeight("bold");
        continue;
      }
    }

    cel.setValue("ABSENT DU DRIVE").setFontColor("#990000").setFontWeight("bold");
    introuvables.push(ligne + " : " + nom);
  }
  SpreadsheetApp.flush();

  function bloc(titre, liste) {
    Logger.log("");
    Logger.log(titre + " (" + liste.length + ")");
    for (var k = 0; k < liste.length; k++) Logger.log("   " + liste[k]);
  }

  Logger.log("=== RECONCILIATION ===");
  Logger.log("Deja bons           : " + ok);
  Logger.log("Noms corriges       : " + nomsCorriges.length);
  Logger.log("Fichiers renommes   : " + fichiersRenommes.length);
  Logger.log("A trancher          : " + ambigus.length);
  Logger.log("Dans le miroir      : " + miroir.length);
  Logger.log("Introuvables        : " + introuvables.length);
  Logger.log("Lignes sans nom     : " + vides);

  if (nomsCorriges.length)     bloc("NOMS CORRIGES dans la feuille, bloc de periode retire", nomsCorriges);
  if (fichiersRenommes.length) bloc("FICHIERS RENOMMES dans le Drive", fichiersRenommes);
  if (ambigus.length)          bloc("A TRANCHER — plusieurs candidats, RIEN touche", ambigus);
  if (miroir.length)           bloc("DANS LE MIROIR DU DISQUE — non renommes expres", miroir);
  if (introuvables.length)     bloc("INTROUVABLES — a telecharger ou reclamer", introuvables);
}

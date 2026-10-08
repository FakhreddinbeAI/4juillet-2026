/**
 * degraisserEssai() ne touche a RIEN, il dit seulement ce qu il ferait.
 * degraisserVraiment() supprime les lignes de la fin qui sont VIDES.
 * Une ligne n est vide que si B a L sont vides ET A n est pas cochee.
 * Les cases a cocher seules ne comptent pas comme du contenu : c est
 * justement elles qui font croire a Google que la grille est pleine.
 */

var MARGE = 60;  // lignes vides gardees apres la derniere vraie ligne

function trouver_() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets(), ok = [];
  var T = ["Depose TGS", "Horodatage", "Etat", "Date", "Fournisseur",
           "Type", "Montant", "Reference"];
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 8) continue;
    var e = fs[i].getRange(1, 1, 1, 8).getValues()[0], bon = true;
    for (var c = 0; c < 8; c++) {
      if (String(e[c]).trim() !== T[c]) { bon = false; break; }
    }
    if (bon) ok.push(fs[i]);
  }
  if (ok.length !== 1) {
    throw new Error("ARRET : " + ok.length + " onglet(s) a l en-tete "
      + "attendue. RIEN FAIT.");
  }
  return ok[0];
}

function etude_() {
  var f = trouver_();
  var maxi = f.getMaxRows();
  var d = f.getRange(1, 1, maxi, 12).getValues();
  var derVraie = 1;
  for (var r = 1; r < maxi; r++) {
    var plein = (d[r][0] === true);
    for (var c = 1; c < 12 && !plein; c++) {
      if (String(d[r][c]).trim() !== "") plein = true;
    }
    if (plein) derVraie = r + 1;
  }
  return {f: f, maxi: maxi, derVraie: derVraie,
          garde: Math.min(maxi, derVraie + MARGE)};
}

function degraisserEssai() {
  var e = etude_();
  var sup = e.maxi - e.garde;
  Logger.log("Onglet : " + e.f.getName());
  Logger.log("Grille actuelle : " + e.maxi + " lignes");
  Logger.log("Derniere ligne AVEC DU CONTENU : " + e.derVraie);
  Logger.log("Je garderais : " + e.garde + " lignes ("
    + e.derVraie + " + " + MARGE + " de marge)");
  Logger.log("Je supprimerais : " + sup + " lignes vides, de "
    + (e.garde + 1) + " a " + e.maxi);
  Logger.log(sup > 0 ? "Lance degraisserVraiment() pour le faire."
    : "Rien a supprimer.");
  try {
    SpreadsheetApp.getUi().alert("Grille : " + e.maxi
      + "\nContenu jusqu a : " + e.derVraie
      + "\nA supprimer : " + sup + " lignes vides");
  } catch (e) {
    // getUi() echoue hors contexte d interface : le
    // journal suffit, le travail est deja fait.
    Logger.log("Pas d interface : " + e);
  }
}

function degraisserVraiment() {
  var e = etude_();
  var sup = e.maxi - e.garde;
  if (sup <= 0) { Logger.log("Rien a supprimer."); return; }
  e.f.deleteRows(e.garde + 1, sup);
  Logger.log("Supprime " + sup + " lignes vides. Grille : "
    + e.f.getMaxRows() + " lignes.");
  try {
    SpreadsheetApp.getUi().alert("Supprime : " + sup + " lignes vides.\n"
      + "Grille ramenee a " + e.f.getMaxRows() + " lignes.");
  } catch (e) {
    // getUi() echoue hors contexte d interface : le
    // journal suffit, le travail est deja fait.
    Logger.log("Pas d interface : " + e);
  }
}

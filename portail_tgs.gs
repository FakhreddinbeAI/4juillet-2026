/**
 * RAPPROCHEMENT PORTAIL TGS -> cases a cocher
 * A coller dans le MEME projet Apps Script que tableau_tgs.gs.
 *
 * Une case cochee signifie « le portail detient la piece », jamais « Chrome
 * pense l avoir envoyee ». Le raisonnement complet est dans
 * docs/rapprochement_portail.md.
 *
 * Circuit : Chrome depose -> Chrome releve la liste du portail -> on la colle
 * dans l onglet PORTAIL ligne 3 -> cocherDepuisPortail().
 */

var ONGLET_PORTAIL   = "PORTAIL";
var T_COL_DEPOSE     = 1;    // A
var T_COL_HORODATAGE = 2;    // B
var T_COL_ETAT       = 3;    // C
var T_COL_FICHIER    = 10;   // J
var T_PREMIERE_LIGNE = 2;


function classeur_() {
  var c = SpreadsheetApp.getActiveSpreadsheet();
  if (!c) throw new Error("Projet autonome : le recreer depuis la feuille.");
  return c;
}


/**
 * Forme reduite pour comparer. On tolere la casse, les espaces parasites, un
 * chemin et le suffixe « (1) » des telechargements. JAMAIS le corps du nom :
 * date, fournisseur, montant et reference distinguent deux pieces de meme
 * montant.
 */
function cle_(nom) {
  return String(nom || "")
    .replace(/^.*[\\\/]/, "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s*\(\d+\)(?=\.pdf$)/i, "")
    .toLowerCase();
}


function preparerOngletPortail() {
  var c = classeur_();
  var o = c.getSheetByName(ONGLET_PORTAIL);
  if (o) { Logger.log("Onglet " + ONGLET_PORTAIL + " deja present."); return; }
  o = c.insertSheet(ONGLET_PORTAIL);
  o.getRange(1, 1).setValue("Noms de fichier releves SUR LE PORTAIL TGS")
   .setFontWeight("bold").setBackground("#1f3864").setFontColor("#ffffff");
  o.getRange(2, 1).setValue("Coller la liste du portail a partir de la ligne 3, " +
                            "un nom par ligne. Puis cocherDepuisPortail().")
   .setFontStyle("italic").setFontColor("#666666");
  o.setColumnWidth(1, 520);
  o.setFrozenRows(2);
  Logger.log("Onglet " + ONGLET_PORTAIL + " cree.");
}


/**
 * Coche et horodate sur correspondance EXACTE du nom normalise.
 * N ecrase jamais un horodatage. Ne decoche jamais. Signale les ecarts.
 * L horodatage est ecrit ici car onEdit ne part pas sur une modif de script.
 */
function cocherDepuisPortail() {
  var c = classeur_();
  var f = c.getSheets()[0];
  var o = c.getSheetByName(ONGLET_PORTAIL);
  if (!o) throw new Error("Onglet " + ONGLET_PORTAIL + " absent : lancer " +
                          "preparerOngletPortail().");

  var brut = o.getLastRow() >= 3
           ? o.getRange(3, 1, o.getLastRow() - 2, 1).getValues() : [];
  var portail = {}, nbPortail = 0;
  for (var i = 0; i < brut.length; i++) {
    var k = cle_(brut[i][0]);
    if (!k) continue;
    if (!portail[k]) { portail[k] = true; nbPortail++; }
  }
  if (!nbPortail) { Logger.log("Liste du portail vide. Rien a rapprocher."); return; }

  var nb = f.getLastRow() - T_PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Tableau vide."); return; }

  var noms   = f.getRange(T_PREMIERE_LIGNE, T_COL_FICHIER,    nb, 1).getValues();
  var coches = f.getRange(T_PREMIERE_LIGNE, T_COL_DEPOSE,     nb, 1).getValues();
  var horo   = f.getRange(T_PREMIERE_LIGNE, T_COL_HORODATAGE, nb, 1).getValues();

  var now = new Date(), neuves = 0, deja = 0, absentes = [], vues = {};

  for (var j = 0; j < nb; j++) {
    var cle = cle_(noms[j][0]);
    if (!cle) continue;
    if (portail[cle]) {
      vues[cle] = true;
      if (coches[j][0] === true) { deja++; } else { coches[j][0] = true; neuves++; }
      if (!horo[j][0]) horo[j][0] = now;
    } else if (coches[j][0] === true) {
      absentes.push((T_PREMIERE_LIGNE + j) + " : " + noms[j][0]);
    }
  }

  f.getRange(T_PREMIERE_LIGNE, T_COL_DEPOSE,     nb, 1).setValues(coches);
  f.getRange(T_PREMIERE_LIGNE, T_COL_HORODATAGE, nb, 1).setValues(horo);
  SpreadsheetApp.flush();

  var inconnues = [];
  for (var p in portail) if (!vues[p]) inconnues.push(p);

  Logger.log("--- RAPPROCHEMENT PORTAIL TGS ---");
  Logger.log(nbPortail + " nom(s) au portail.");
  Logger.log("Nouvellement cochees : " + neuves + " / deja cochees : " + deja);
  Logger.log("Restant : " + (nb - neuves - deja));

  if (absentes.length) {
    Logger.log("A REGARDER - cochees ici mais ABSENTES du portail (" +
               absentes.length + "). Je signale, je ne decoche pas :");
    for (var a = 0; a < absentes.length; a++) Logger.log("   " + absentes[a]);
  }
  if (inconnues.length) {
    Logger.log("A REGARDER - au portail mais INCONNUES du tableau (" +
               inconnues.length + "). Nom hors convention, ou depot hors registre :");
    for (var b = 0; b < inconnues.length; b++) Logger.log("   " + inconnues[b]);
  }
  if (!absentes.length && !inconnues.length) {
    Logger.log("Aucun ecart : portail et tableau concordent.");
  }
}


/** File d attente a donner a Chrome, par lots de 5. */
function fileDAttente() {
  var f = classeur_().getSheets()[0];
  var nb = f.getLastRow() - T_PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Tableau vide."); return; }

  var d = f.getRange(T_PREMIERE_LIGNE, 1, nb, 12).getValues();
  var att = [];
  for (var i = 0; i < nb; i++) {
    var nom = String(d[i][T_COL_FICHIER - 1] || "").trim();
    if (d[i][T_COL_DEPOSE - 1] === true) continue;
    if (String(d[i][T_COL_ETAT - 1]) !== "RENOMME") continue;
    if (!nom) continue;
    att.push(nom);
  }

  Logger.log("--- A DEPOSER : " + att.length + " piece(s) ---");
  for (var j = 0; j < att.length; j += 5) {
    Logger.log("Lot " + (j / 5 + 1) + " :");
    for (var k = j; k < Math.min(j + 5, att.length); k++) Logger.log("   " + att[k]);
  }
}

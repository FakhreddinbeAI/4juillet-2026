/**
 * RAPPROCHEMENT PORTAIL TGS → cases a cocher
 *
 * A coller dans le MEME projet Apps Script que tableau_tgs.gs, cree depuis la
 * feuille par Extensions → Apps Script.
 *
 * LE PRINCIPE, et c est tout l interet du fichier : une case cochee doit
 * signifier « le portail TGS detient la piece », jamais « Claude in Chrome
 * pense l avoir envoyee ». Un depot qui echoue en silence serait coche, la
 * piece sortirait du radar, et on la decouvrirait au bilan. Une case cochee a
 * tort est pire que pas d automatisation : elle eteint l alerte.
 *
 * Donc la verite vient du portail. Le circuit :
 *
 *   1. Claude in Chrome depose les pieces (par lots de 5).
 *   2. Claude in Chrome relit la LISTE DES PIECES DEPOSEES sur le portail et
 *      colle les noms de fichier dans l onglet PORTAIL, un par ligne, en A.
 *   3. On lance cocherDepuisPortail() : il coche et horodate uniquement les
 *      lignes dont le nom de fichier figure dans cette liste.
 *
 * Ce script NE DECOCHE JAMAIS et ne supprime rien. Les ecarts sont signales
 * dans le journal, pas corriges d office : un ecart se regarde, il ne se
 * rattrape pas automatiquement.
 */

var ONGLET_PORTAIL = "PORTAIL";
var T_COL_DEPOSE     = 1;    // A — la case a cocher
var T_COL_HORODATAGE = 2;    // B
var T_COL_FICHIER    = 10;   // J — nom de fichier
var T_PREMIERE_LIGNE = 2;


function classeur_() {
  var c = SpreadsheetApp.getActiveSpreadsheet();
  if (!c) {
    throw new Error("Aucun classeur actif : projet Apps Script autonome. " +
                    "Le recreer par Extensions puis Apps Script DEPUIS la feuille.");
  }
  return c;
}


/**
 * Normalise un nom de fichier avant comparaison.
 *
 * On compare sur une forme reduite parce que le portail peut rendre le nom
 * avec une casse differente, des espaces en trop, des guillemets, ou le
 * suffixe « (1) » que les navigateurs ajoutent aux telechargements. Ce qui ne
 * doit JAMAIS etre normalise, en revanche, c est le corps du nom : date,
 * fournisseur, montant et reference restent significatifs, c est eux qui
 * distinguent deux pieces de meme montant.
 */
function cle_(nom) {
  return String(nom || "")
    .replace(/^.*[\\\/]/, "")        // enleve un eventuel chemin
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s*\(\d+\)(?=\.pdf$)/i, "")   // « ... (1).pdf » → « ....pdf »
    .toLowerCase();
}


/** Cree l onglet PORTAIL s il manque, avec son mode d emploi en en-tete. */
function preparerOngletPortail() {
  var c = classeur_();
  var o = c.getSheetByName(ONGLET_PORTAIL);
  if (o) { Logger.log("L onglet " + ONGLET_PORTAIL + " existe deja."); return o; }

  o = c.insertSheet(ONGLET_PORTAIL);
  o.getRange(1, 1).setValue("Noms de fichier releves SUR LE PORTAIL TGS");
  o.getRange(1, 1).setFontWeight("bold").setBackground("#1f3864")
   .setFontColor("#ffffff");
  o.getRange(2, 1).setValue(
    "Coller ici la liste des pieces que le portail declare detenir, " +
    "un nom par ligne, a partir de la ligne 3. Puis lancer cocherDepuisPortail().");
  o.getRange(2, 1).setFontStyle("italic").setFontColor("#666666");
  o.setColumnWidth(1, 520);
  o.setFrozenRows(2);
  Logger.log("Onglet " + ONGLET_PORTAIL + " cree. Y coller la liste du portail " +
             "a partir de la ligne 3.");
  return o;
}


/**
 * Coche et horodate les lignes confirmees par le portail.
 *
 * Ne coche que sur correspondance exacte du nom de fichier normalise.
 * N ecrase jamais un horodatage deja pose : la premiere fois fait foi.
 * Ne decoche jamais.
 */
function cocherDepuisPortail() {
  var c = classeur_();
  var f = c.getSheets()[0];
  var o = c.getSheetByName(ONGLET_PORTAIL);
  if (!o) {
    throw new Error("Onglet " + ONGLET_PORTAIL + " absent. " +
                    "Lancer d abord preparerOngletPortail().");
  }

  // --- la liste du portail
  var brut = o.getLastRow() >= 3
           ? o.getRange(3, 1, o.getLastRow() - 2, 1).getValues()
           : [];
  var auPortail = {}, nbPortail = 0;
  for (var i = 0; i < brut.length; i++) {
    var k = cle_(brut[i][0]);
    if (!k) continue;
    if (!auPortail[k]) { auPortail[k] = 0; nbPortail++; }
    auPortail[k]++;
  }
  if (!nbPortail) {
    Logger.log("La liste du portail est vide. Rien a rapprocher.");
    return;
  }

  // --- le tableau
  var nb = f.getLastRow() - T_PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Tableau vide."); return; }

  var noms   = f.getRange(T_PREMIERE_LIGNE, T_COL_FICHIER,    nb, 1).getValues();
  var coches = f.getRange(T_PREMIERE_LIGNE, T_COL_DEPOSE,     nb, 1).getValues();
  var horo   = f.getRange(T_PREMIERE_LIGNE, T_COL_HORODATAGE, nb, 1).getValues();

  var maintenant = new Date();
  var nouvelles = 0, dejaCochees = 0, absentesDuPortail = [], vues = {};

  for (var j = 0; j < nb; j++) {
    var k = cle_(noms[j][0]);
    if (!k) continue;                      // ligne sans nom de fichier
    if (auPortail[k]) {
      vues[k] = true;
      if (coches[j][0] === true) {
        dejaCochees++;
      } else {
        coches[j][0] = true;
        nouvelles++;
      }
      // on n ecrase pas un horodatage existant
      if (!horo[j][0]) horo[j][0] = maintenant;
    } else if (coches[j][0] === true) {
      // cochee chez nous mais introuvable au portail : a REGARDER, pas a corriger
      absentesDuPortail.push((T_PREMIERE_LIGNE + j) + " : " + noms[j][0]);
    }
  }

  f.getRange(T_PREMIERE_LIGNE, T_COL_DEPOSE,     nb, 1).setValues(coches);
  f.getRange(T_PREMIERE_LIGNE, T_COL_HORODATAGE, nb, 1).setValues(horo);
  SpreadsheetApp.flush();

  // --- ce que le portail detient mais que le tableau ne connait pas
  var inconnues = [];
  for (var cle in auPortail) if (!vues[cle]) inconnues.push(cle);

  Logger.log("--- RAPPROCHEMENT PORTAIL TGS ---");
  Logger.log(nbPortail + " nom(s) distinct(s) releves sur le portail.");
  Logger.log("Nouvellement cochees : " + nouvelles);
  Logger.log("Deja cochees : " + dejaCochees);
  Logger.log("Restant a deposer : " + (nb - nouvelles - dejaCochees));

  if (absentesDuPortail.length) {
    Logger.log("");
    Logger.log("A REGARDER — cochees dans le tableau mais ABSENTES du portail (" +
               absentesDuPortail.length + "). Je ne decoche pas, je signale :");
    for (var a = 0; a < absentesDuPortail.length; a++) {
      Logger.log("   " + absentesDuPortail[a]);
    }
  }
  if (inconnues.length) {
    Logger.log("");
    Logger.log("A REGARDER — presentes au portail mais INCONNUES du tableau (" +
               inconnues.length + "). Soit un nom qui ne suit pas la convention, " +
               "soit une piece deposee hors registre :");
    for (var b = 0; b < inconnues.length; b++) Logger.log("   " + inconnues[b]);
  }
  if (!absentesDuPortail.length && !inconnues.length) {
    Logger.log("");
    Logger.log("Aucun ecart : le portail et le tableau disent la meme chose.");
  }
}


/**
 * Liste, dans le journal, les pieces pretes a deposer et pas encore cochees.
 * C est la file d attente a donner a Claude in Chrome, par lots de 5.
 */
function fileDAttente() {
  var f = classeur_().getSheets()[0];
  var nb = f.getLastRow() - T_PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Tableau vide."); return; }

  var d = f.getRange(T_PREMIERE_LIGNE, 1, nb, 12).getValues();
  var attente = [];
  for (var i = 0; i < nb; i++) {
    var etat = String(d[i][2]);                       // C — etat
    var nom  = String(d[i][T_COL_FICHIER - 1] || "").trim();
    if (d[i][T_COL_DEPOSE - 1] === true) continue;    // deja deposee
    if (etat !== "RENOMME") continue;                 // pas prete
    if (!nom) continue;                               // rien a deposer
    attente.push(nom);
  }

  Logger.log("--- A DEPOSER : " + attente.length + " piece(s) ---");
  for (var j = 0; j < attente.length; j += 5) {
    Logger.log("");
    Logger.log("Lot " + (j / 5 + 1) + " :");
    for (var k = j; k < Math.min(j + 5, attente.length); k++) {
      Logger.log("   " + attente[k]);
    }
  }
}

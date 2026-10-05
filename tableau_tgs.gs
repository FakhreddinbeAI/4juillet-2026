/**
 * TGS 2026 — pièces à déposer : mise en forme et cases à cocher
 *
 * LE PIÈGE, c'est celui de juillet : ce script doit être créé DEPUIS LA
 * FEUILLE — Extensions → Apps Script — et jamais comme projet autonome.
 * Dans un projet autonome, getActiveSpreadsheet() renvoie null et onEdit ne
 * se déclenche pas.
 *
 * Mode d'emploi :
 *   1. ouvrir la feuille TGS 2026 — pièces à déposer
 *   2. Extensions → Apps Script
 *   3. coller ce fichier, enregistrer
 *   4. lancer installer(), accepter l'autorisation
 *   5. cocher une case : la date et l'heure s'écrivent à côté
 *
 * Colonnes : A dépôt, B horodatage, C état, D date, E fournisseur, F type,
 * G montant, H référence, I période, J nom de fichier, K vigilance.
 * Le script AJOUTE une colonne L « ouvrir », cliquable, qui lance une
 * recherche Drive sur le nom exact du fichier. Un clic et on est sur la pièce.
 */

var COL_DEPOSE     = 1;   // A
var COL_HORODATAGE = 2;   // B
var COL_ETAT       = 3;   // C
var COL_MONTANT    = 7;   // G
var COL_FICHIER    = 10;  // J
var COL_VIGILANCE  = 11;  // K
var COL_LIEN       = 12;  // L — ajoutee par le script
var NB_COLONNES    = 12;
var PREMIERE_LIGNE = 2;


function feuille_() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur) {
    throw new Error(
      "Aucun classeur actif : ce script a été créé comme projet autonome. " +
      "Il faut le recréer depuis la feuille, par Extensions puis Apps Script.");
  }
  return classeur.getSheets()[0];
}


/** Convertit "1 353,76" en nombre. Rend null si la cellule est vide. */
function enNombre_(v) {
  if (typeof v === "number") return v;
  if (!v) return null;
  var s = String(v)
            .replace(/ /g, "")   // espace insécable
            .replace(/ /g, "")   // espace fine insécable
            .replace(/\s/g, "")
            .replace(",", ".");
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}


/** À lancer UNE SEULE FOIS. */
function installer() {
  var f = feuille_();
  var derniere = f.getLastRow();
  var nb = derniere - PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Feuille vide, rien à installer."); return; }

  // ---- 1. de vraies cases à cocher, à la place des FALSE
  // insertCheckboxes convertit les FALSE existants en cases décochées.
  f.getRange(PREMIERE_LIGNE, COL_DEPOSE, nb, 1).insertCheckboxes();

  // ---- 2. en-tête
  f.setFrozenRows(1);
  f.setFrozenColumns(3);               // dépôt, horodatage et état restent visibles
  f.getRange(1, COL_LIEN).setValue("Ouvrir");
  f.getRange(1, 1, 1, NB_COLONNES)
   .setFontWeight("bold")
   .setBackground("#1f3864")
   .setFontColor("#ffffff")
   .setVerticalAlignment("middle")
   .setWrap(true);
  f.setRowHeight(1, 40);

  // ---- 3. largeurs, pensées pour ne pas avoir à faire défiler
  var largeurs = [90, 130, 105, 95, 170, 105, 100, 180, 200, 420, 460, 75];
  for (var c = 0; c < largeurs.length; c++) f.setColumnWidth(c + 1, largeurs[c]);

  // ---- 4. le corps du tableau
  var corps = f.getRange(PREMIERE_LIGNE, 1, nb, NB_COLONNES);
  corps.setVerticalAlignment("top").setFontSize(10);
  f.getRange(PREMIERE_LIGNE, COL_VIGILANCE, nb, 1).setWrap(true);
  f.getRange(PREMIERE_LIGNE, 10, nb, 1).setWrap(false).setFontFamily("Courier New");

  // ---- 5. les montants deviennent de vrais nombres, donc sommables
  var plageM = f.getRange(PREMIERE_LIGNE, COL_MONTANT, nb, 1);
  var vals = plageM.getValues();
  var convertis = 0;
  for (var i = 0; i < vals.length; i++) {
    var n = enNombre_(vals[i][0]);
    if (n !== null) { vals[i][0] = n; convertis++; } else { vals[i][0] = ""; }
  }
  plageM.setValues(vals);
  plageM.setNumberFormat('# ##0.00\\ "€"').setHorizontalAlignment("right");

  // ---- 6. l'horodatage est écrit par le script
  f.getRange(PREMIERE_LIGNE, COL_HORODATAGE, nb, 1)
   .setNumberFormat("dd/MM/yyyy HH:mm")
   .setBackground("#fff2cc")
   .setHorizontalAlignment("center");

  // ---- 6 bis. la colonne « ouvrir » : une recherche Drive sur le nom exact
  // du fichier. Aucun identifiant a maintenir, et ca continue de marcher si la
  // piece est deplacee d'un dossier a l'autre.
  // Apps Script attend toujours la syntaxe en-US, donc la virgule en
  // separateur d'arguments, meme sur une feuille en francais.
  var formules = [];
  for (var j = 0; j < nb; j++) {
    var l = PREMIERE_LIGNE + j;
    formules.push(['=IF($J' + l + '="","",HYPERLINK(' +
                   '"https://drive.google.com/drive/search?q="&ENCODEURL($J' + l + '),' +
                   '"ouvrir"))']);
  }
  f.getRange(PREMIERE_LIGNE, COL_LIEN, nb, 1)
   .setFormulas(formules)
   .setHorizontalAlignment("center")
   .setFontSize(9);

  // ---- 7. couleur sur l'état : on voit les trous sans lire
  var plageEtat = f.getRange(PREMIERE_LIGNE, COL_ETAT, nb, 1);
  var couleurs = [
    ["RENOMME",    "#d9ead3", "#274e13"],   // prêt à déposer
    ["RECU",       "#cfe2f3", "#0b5394"],   // reçu, à renommer
    ["A_VERIFIER", "#fce5cd", "#b45f06"],   // doute
    ["MANQUANT",   "#f4cccc", "#990000"]    // absent
  ];
  var regles = f.getConditionalFormatRules();
  for (var k = 0; k < couleurs.length; k++) {
    regles.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(couleurs[k][0])
      .setBackground(couleurs[k][1]).setFontColor(couleurs[k][2]).setBold(true)
      .setRanges([plageEtat]).build());
  }
  // une ligne cochée passe en gris : le déposé s'efface visuellement
  regles.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=$A" + PREMIERE_LIGNE + "=TRUE")
    .setFontColor("#999999")
    .setRanges([corps]).build());
  f.setConditionalFormatRules(regles);

  // ---- 8. un filtre, pour isoler un état ou un fournisseur
  var filtre = f.getFilter();
  if (filtre) filtre.remove();
  f.getRange(1, 1, derniere, NB_COLONNES).createFilter();

  f.getRange(PREMIERE_LIGNE, COL_ETAT, nb, 1).setHorizontalAlignment("center");

  Logger.log("Installation terminée. " + nb + " lignes, " + convertis +
             " montants convertis en nombres. Coche une case pour vérifier " +
             "l'horodatage.");
}


/**
 * Déclencheur simple.
 * Coché   → la date et l'heure s'écrivent en B.
 * Décoché → B est effacé, pour qu'un dépôt annulé ne laisse pas de trace.
 * Un horodatage déjà posé n'est jamais réécrit : la première fois fait foi.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var f = e.range.getSheet();
  if (f.getIndex() !== 1) return;
  if (e.range.getColumn() !== COL_DEPOSE) return;
  if (e.range.getRow() < PREMIERE_LIGNE) return;

  for (var i = 0; i < e.range.getNumRows(); i++) {
    var ligne = e.range.getRow() + i;
    var coche = f.getRange(ligne, COL_DEPOSE).getValue() === true;
    var cible = f.getRange(ligne, COL_HORODATAGE);
    if (coche) {
      if (!cible.getValue()) cible.setValue(new Date());
    } else {
      cible.clearContent();
    }
  }
}


/** Récapitulatif dans le journal. À lancer avant de répondre au comptable. */
function recapitulatif() {
  var f = feuille_();
  var nb = f.getLastRow() - PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Feuille vide."); return; }

  var d = f.getRange(PREMIERE_LIGNE, 1, nb, NB_COLONNES).getValues();
  var parEtat = {}, deposes = 0, totalDepose = 0;

  for (var i = 0; i < d.length; i++) {
    var etat = String(d[i][COL_ETAT - 1]);
    var m = enNombre_(d[i][COL_MONTANT - 1]) || 0;
    if (!parEtat[etat]) parEtat[etat] = [0, 0];
    parEtat[etat][0]++;
    parEtat[etat][1] += m;
    if (d[i][COL_DEPOSE - 1] === true) { deposes++; totalDepose += m; }
  }

  Logger.log("--- TGS 2026 ---");
  for (var e in parEtat) {
    Logger.log(e + " : " + parEtat[e][0] + " piece(s), " +
               parEtat[e][1].toFixed(2) + " EUR");
  }
  Logger.log("Deposees sur le portail : " + deposes + " pour " +
             totalDepose.toFixed(2) + " EUR");
  Logger.log("Restant a deposer : " + (nb - deposes));
}

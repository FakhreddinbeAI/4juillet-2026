/**
 * Rend la mise en forme du tableau TGS PERMANENTE.
 *
 * LE PROBLEME. Mon script d origine posait tout sur des plages BORNEES par
 * le nombre de lignes du moment : getRange(2, COL, nb, 1). Une ligne ajoutee
 * ensuite tombe HORS de ces plages — pas de case, pas de couleur, pas de
 * format sur le montant. D ou la correction a refaire chaque jour.
 *
 * LA CORRECTION. Tout se pose sur les COLONNES ENTIERES, de la ligne 2 a la
 * derniere ligne de la feuille. Une ligne ajoutee est dedans par
 * construction.
 *
 * A lancer une fois : rendrePermanent(), puis installerDeclencheur().
 */

var NB_COL = 12;

function feuille_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function rendrePermanent() {
  var f = feuille_();

  // Garde-fou : on ne touche a rien si l en-tete a change.
  var e = f.getRange(1, 1, 1, NB_COL).getValues()[0];
  var A = {1: "Depose TGS", 2: "Horodatage", 3: "Etat", 7: "Montant",
           11: "Point de vigilance"};
  for (var c in A) {
    if (String(e[c - 1]).trim() !== A[c]) {
      throw new Error("ARRET colonne " + c + " : attendu '" + A[c]
        + "', trouve '" + String(e[c - 1]).trim() + "'. Rien ecrit.");
    }
  }

  var n = f.getMaxRows() - 1;
  if (n < 1) throw new Error("Feuille vide.");

  // 1. une case sur TOUTE la colonne A, lignes vides comprises : c est ce
  //    qui fait qu une ligne neuve en a une sans rien demander.
  f.getRange(2, 1, n, 1).insertCheckboxes();

  // 2. formats, par colonne entiere
  f.getRange(2, 2, n, 1).setNumberFormat("dd/MM/yyyy HH:mm")
    .setBackground("#fff2cc").setHorizontalAlignment("center");
  f.getRange(2, 7, n, 1).setNumberFormat('#,##0.00" €"')
    .setHorizontalAlignment("right");
  f.getRange(2, 3, n, 1).setHorizontalAlignment("center");
  f.getRange(2, 6, n, 1).setHorizontalAlignment("center");
  f.getRange(2, 11, n, 1).setWrap(true);
  f.getRange(2, 10, n, 1).setFontSize(8).setFontFamily("Courier New");

  // 3. couleurs d etat. La reference relative $A2 se propage vers le bas.
  var etat = f.getRange(2, 3, n, 1), corps = f.getRange(2, 1, n, NB_COL);
  var C = [["RENOMME", "#d9ead3", "#274e13"], ["RECU", "#cfe2f3", "#0b5394"],
           ["A_VERIFIER", "#fce5cd", "#b45f06"], ["MANQUANT", "#f4cccc", "#990000"],
           ["DEPOSEE", "#d0e0e3", "#0c343d"], ["A_VENIR", "#fff2cc", "#7f6000"],
           ["HORS PERIMETRE", "#efefef", "#666666"],
           ["SANS OBJET", "#efefef", "#666666"]];
  var r = C.map(function (x) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(x[0])
      .setBackground(x[1]).setFontColor(x[2]).setBold(true)
      .setRanges([etat]).build();
  });
  r.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=$A2=TRUE").setFontColor("#999999")
    .setRanges([corps]).build());
  f.setConditionalFormatRules(r);

  // 4. le filtre aussi, sinon une ligne neuve sort des tris.
  var filtre = f.getFilter();
  if (filtre) filtre.remove();
  SpreadsheetApp.flush();
  f.getRange(1, 1, f.getMaxRows(), NB_COL).createFilter();

  Logger.log("Pose sur les colonnes, lignes 2 a " + f.getMaxRows() + ".");
  Logger.log(C.length + " couleurs d etat + le grise des lignes cochees.");
}

/**
 * Au-dela de getMaxRows(), Sheets cree des lignes qui seraient de nouveau
 * hors plage. Ce declencheur rejoue la mise en forme. A installer une fois.
 */
function installerDeclencheur() {
  var t = ScriptApp.getProjectTriggers();
  for (var i = 0; i < t.length; i++) {
    if (t[i].getHandlerFunction() === "surChangement") {
      Logger.log("Declencheur deja installe.");
      return;
    }
  }
  ScriptApp.newTrigger("surChangement")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet().getId())
    .onChange().create();
  Logger.log("Declencheur installe.");
}

function surChangement(e) {
  if (e && (e.changeType === "INSERT_ROW" || e.changeType === "INSERT_GRID")) {
    rendrePermanent();
  }
}

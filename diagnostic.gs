/**
 * diagnostic() — ne modifie RIEN. Compte les lignes et dit qui les cache.
 * A lancer quand le Sheet parait avoir perdu des lignes.
 */

function diagnostic() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var fs = ss.getSheets();
  Logger.log("Onglets : " + fs.length);

  for (var i = 0; i < fs.length; i++) {
    var f = fs[i];
    var nom = f.getName();
    var maxi = f.getMaxRows();
    var der = f.getLastRow();
    Logger.log("--- onglet " + (i + 1) + " : « " + nom + " »");
    Logger.log("    getMaxRows = " + maxi + " / getLastRow = " + der);

    if (f.getLastColumn() < 8 || der < 2) {
      Logger.log("    (pas la feuille de travail)");
      continue;
    }

    var d = f.getRange(2, 1, der - 1, 8).getValues();
    var reel = 0, coche = 0, avecRef = 0, derReel = 0;
    for (var r = 0; r < d.length; r++) {
      if (String(d[r][4]).trim() === "") continue;
      reel++;
      derReel = r + 2;
      if (d[r][0] === true) coche++;
      if (String(d[r][7]).trim() !== "") avecRef++;
    }
    Logger.log("    lignes avec un FOURNISSEUR : " + reel);
    Logger.log("    derniere ligne non vide : " + derReel);
    Logger.log("    cochees : " + coche + " / avec reference : " + avecRef);

    var filtre = f.getFilter();
    Logger.log("    filtre pose : " + (filtre ? "OUI" : "non"));

    var cachFiltre = [], cachMain = [];
    for (var r = 2; r <= derReel; r++) {
      if (f.isRowHiddenByFilter(r)) cachFiltre.push(r);
      else if (f.isRowHiddenByUser(r)) cachMain.push(r);
    }
    Logger.log("    MASQUEES PAR LE FILTRE : " + cachFiltre.length
      + (cachFiltre.length ? " (de " + cachFiltre[0] + " a "
        + cachFiltre[cachFiltre.length - 1] + ")" : ""));
    Logger.log("    masquees a la main : " + cachMain.length
      + (cachMain.length ? " (de " + cachMain[0] + " a "
        + cachMain[cachMain.length - 1] + ")" : ""));
    Logger.log("    VISIBLES : " + (derReel - 1 - cachFiltre.length
      - cachMain.length));
  }
}

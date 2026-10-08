/**
 * carte() — ne modifie RIEN et ne fait AUCUN appel par ligne.
 * Dit OU sont les vraies lignes dans la grille, et si la colonne L
 * contient encore des liens. Un seul getValues, un seul getRichTextValues.
 */

function carte() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets(), f = null;
  var T = ["Depose TGS", "Horodatage", "Etat", "Date", "Fournisseur",
           "Type", "Montant", "Reference"];
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 8) continue;
    var e = fs[i].getRange(1, 1, 1, 8).getValues()[0], bon = true;
    for (var c = 0; c < 8; c++) {
      if (String(e[c]).trim() !== T[c]) { bon = false; break; }
    }
    if (bon) { f = fs[i]; break; }
  }
  if (!f) throw new Error("ARRET : onglet introuvable. RIEN FAIT.");

  var maxi = f.getMaxRows();
  var d = f.getRange(1, 1, maxi, 12).getValues();
  var rt = f.getRange(1, 12, maxi, 1).getRichTextValues();

  var plages = [], deb = 0, liens = 0, coches = [];
  for (var r = 1; r < maxi; r++) {
    var vide = true;
    for (var c = 1; c < 12; c++) {
      if (String(d[r][c]).trim() !== "") { vide = false; break; }
    }
    if (!vide) {
      if (!deb) deb = r + 1;
      if (d[r][0] === true) coches.push(r + 1);
      var u = rt[r][0] ? rt[r][0].getLinkUrl() : null;
      if (!u) {
        var rs = rt[r][0] ? rt[r][0].getRuns() : [];
        for (var k = 0; k < rs.length; k++) {
          if (rs[k].getLinkUrl()) { u = rs[k].getLinkUrl(); break; }
        }
      }
      if (u) liens++;
    } else if (deb) {
      plages.push(deb + "-" + r); deb = 0;
    }
  }
  if (deb) plages.push(deb + "-" + maxi);

  Logger.log("Onglet : " + f.getName() + " / grille : " + maxi);
  Logger.log("BLOCS DE CONTENU (" + plages.length + ") : "
    + plages.join(", "));
  Logger.log("Lignes avec un lien en colonne L : " + liens);
  Logger.log("Lignes cochees : " + coches.length
    + (coches.length ? " (de " + coches[0] + " a "
      + coches[coches.length - 1] + ")" : ""));
  var fi = f.getFilter();
  Logger.log("Filtre : " + (fi ? "pose sur " + fi.getRange().getA1Notation()
    : "aucun"));
  SpreadsheetApp.getUi().alert("Blocs de contenu : " + plages.length
    + "\nLiens en L : " + liens + "\nCochees : " + coches.length);
}

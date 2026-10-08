/**
 * completerROTEC() — inscrit les 9 dates de depot que remplirDatesPortail
 * ne connaissait pas.
 *
 * LA CAUSE : la table DATES de horodatage.gs a ete generee AVANT que les
 * factures ROTEC entrent au registre. Un script qui porte ses donnees en dur
 * vieillit des que la source bouge. C est pour cela qu il faut regenerer
 * horodatage.gs apres chaque ajout de pieces, et pas seulement le relancer.
 *
 * A coller a la fin de horodatage.gs, puis executer completerROTEC.
 */

var DATES_ROTEC = {
  "5110778": "20/04/2026", "5110828": "20/04/2026",
  "5110950": "20/04/2026", "5113053": "24/06/2026",
  "5116617": "24/06/2026", "5117001": "24/06/2026",
  "5118293": "24/06/2026", "5118531": "24/06/2026",
  "5119917": "24/06/2026", "5120388": "24/06/2026"
};

function completerROTEC() {
  var f = feuille_();
  var nb = f.getLastRow() - 1;
  var d = f.getRange(2, 1, nb, 10).getValues();
  var k = f.getRange(2, COL_K, nb, 1).getValues();
  var mis = 0, reste = [];

  for (var i = 0; i < nb; i++) {
    if (String(d[i][5]).trim() === "") continue;
    var ref = String(d[i][8]).trim();
    if (DATES_ROTEC[ref] && String(k[i][0]).trim() === "") {
      k[i][0] = DATES_ROTEC[ref];
      mis++;
    } else if (d[i][0] === true && String(k[i][0]).trim() === "") {
      reste.push(String(d[i][5]) + " " + ref);
    }
  }
  f.getRange(2, COL_K, nb, 1).setValues(k);
  f.getRange(2, COL_K, nb, 1).setHorizontalAlignment("center");

  Logger.log("Dates ROTEC inscrites : " + mis);
  Logger.log("Cochees encore sans date (" + reste.length + ") : "
    + reste.join(", "));
  try {
    SpreadsheetApp.getUi().alert("ROTEC datees : " + mis
      + "\nEncore sans date : " + reste.length);
  } catch (e) {
    Logger.log("Pas d interface : " + e);
  }
}

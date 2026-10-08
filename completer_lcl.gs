/**
 * completerLCL() — repare les 10 lignes que remplirDatesPortail a laissees
 * vides.
 *
 * LA CAUSE : la reference « 046 » a ete collee dans une cellule au format
 * automatique. Sheets l a lue comme le NOMBRE 46 et a supprime le zero de
 * tete. La cle "046" de ma table ne correspondait donc plus a rien, et le
 * journal l a dit noir sur blanc : « LCL-70666 46 ».
 *
 * A coller dans le MEME fichier horodatage.gs, a la fin, puis executer
 * completerLCL. Rien d autre a refaire.
 */

function completerLCL() {
  var f = feuille_();
  var nb = f.getLastRow() - 1;
  var d = f.getRange(2, 1, nb, 10).getValues();
  var k = f.getRange(2, COL_K, nb, 1).getValues();
  var mis = 0, reste = [];

  for (var i = 0; i < nb; i++) {
    if (String(d[i][5]).trim() === "") continue;
    if (String(k[i][0]).trim() !== "") continue;
    var brut = String(d[i][8]).trim();
    if (!brut) continue;

    // On essaie la reference telle quelle, puis completee de zeros sur
    // deux, trois et quatre chiffres : c est la seule difference entre
    // « 46 » tel que Sheets l a stocke et « 046 » tel que le portail
    // l ecrit.
    var essais = [brut];
    if (/^\d+$/.test(brut)) {
      essais.push(("0" + brut).slice(-2));
      essais.push(("00" + brut).slice(-3));
      essais.push(("000" + brut).slice(-4));
    }
    var v = null;
    for (var j = 0; j < essais.length && !v; j++) v = DATES[essais[j]];
    if (v) {
      k[i][0] = v;
      mis++;
      // On remet la reference en TEXTE, zero de tete compris, pour que le
      // probleme ne revienne pas au prochain appariement.
      if (v && essais.length > 1) {
        var bonne = null;
        for (var j = 0; j < essais.length; j++) {
          if (DATES[essais[j]]) { bonne = essais[j]; break; }
        }
        if (bonne && bonne !== brut) {
          f.getRange(i + 2, 9).setNumberFormat("@").setValue(bonne);
        }
      }
    } else if (d[i][0] === true) {
      reste.push(String(d[i][5]) + " " + brut);
    }
  }

  f.getRange(2, COL_K, nb, 1).setValues(k);
  f.getRange(2, COL_K, nb, 1).setHorizontalAlignment("center");
  Logger.log("Dates completees : " + mis);
  Logger.log("Cochees encore sans date (" + reste.length + ") : "
    + reste.join(", "));
  SpreadsheetApp.getUi().alert("Completees : " + mis
    + "\nEncore sans date : " + reste.length);
}

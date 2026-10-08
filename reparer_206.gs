/**
 * reparer053() — remet la facture ROTEC 5113053 que completerLCL a ecrasee.
 *
 * CE QUI S EST PASSE : mon « complement de zeros » faisait
 * ("00" + ref).slice(-3). Sur « 5113053 », sept caracteres, cela ne
 * complete pas : cela TRONQUE en « 053 ». Et « 053 » est une vraie cle,
 * celle du releve LCL n° 053. Le script a donc remplace la reference de la
 * facture par celle d un releve bancaire, et lui a donne la date de depot de
 * ce releve, le 06/10/2026.
 *
 * On repere la ligne sans ambiguite : fournisseur ROTEC ET reference 053.
 * Le vrai releve 053 porte le fournisseur LCL-70666, il ne risque rien.
 */

function reparer053() {
  var f = feuille_();
  var nb = f.getLastRow() - 1;
  var d = f.getRange(2, 1, nb, 10).getValues();
  var n = 0;

  for (var i = 0; i < nb; i++) {
    var four = String(d[i][5]).trim().toUpperCase();
    var ref = String(d[i][8]).trim();
    if (four !== "ROTEC") continue;
    if (ref !== "053" && ref !== "53") continue;
    var l = i + 2;
    f.getRange(l, 9).setNumberFormat("@").setValue("5113053");
    f.getRange(l, 5).setValue("2026-02-13");
    f.getRange(l, 8).setValue(815.51);
    f.getRange(l, COL_K).setValue("24/06/2026")
      .setHorizontalAlignment("center");
    Logger.log("Ligne " + l + " reparee : reference 5113053, date de"
      + " facture 2026-02-13, montant 815,51, depot 24/06/2026.");
    n++;
  }
  if (!n) Logger.log("Rien a reparer : aucune ligne ROTEC avec 053.");
  try {
    SpreadsheetApp.getUi().alert("Lignes reparees : " + n);
  } catch (e) {
    Logger.log("Pas d interface : " + e);
  }
}

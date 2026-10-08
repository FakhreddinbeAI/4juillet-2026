/**
 * allegerMaintenant() — rend le Sheet rapide. N ECRIT AUCUNE VALEUR.
 *
 * Ce qu il enleve, et pourquoi :
 *  1. LE DECLENCHEUR onChange. rendrePermanent() ecrit 999 cases et recree
 *     le filtre : il modifie donc la grille, et peut se redeclencher
 *     lui-meme. C est a supprimer en premier.
 *  2. LA REGLE A FORMULE « =$A2=TRUE » posee sur 12 000 cellules. Une regle
 *     a formule coute bien plus cher qu une regle de texte : c est le gros
 *     du ralentissement. Le grise des lignes cochees est perdu ; les huit
 *     couleurs d etat, elles, sont reposees.
 *  3. LE FILTRE sur 12 000 cellules. Il ne masquait rien (0 ligne cachee).
 *  4. LES CASES A COCHER des lignes vides au-dela du contenu.
 *
 * Il dit aussi OU est le contenu, pour ne pas avoir a relancer un autre
 * script. Il ne supprime AUCUNE ligne et ne touche pas la colonne L.
 */

var MARGE_L = 60;

function cible_() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var T = ["Depose TGS", "Horodatage", "Etat", "Date", "Fournisseur",
           "Type", "Montant", "Reference"];
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 8) continue;
    var e = fs[i].getRange(1, 1, 1, 8).getValues()[0], bon = true;
    for (var c = 0; c < 8; c++) {
      if (String(e[c]).trim() !== T[c]) { bon = false; break; }
    }
    if (bon) return fs[i];
  }
  throw new Error("ARRET : onglet introuvable. RIEN FAIT.");
}

function allegerMaintenant() {
  // 1. couper le declencheur avant toute chose
  var t = ScriptApp.getProjectTriggers(), coupes = 0;
  for (var i = 0; i < t.length; i++) {
    if (t[i].getHandlerFunction() === "surChangement") {
      ScriptApp.deleteTrigger(t[i]); coupes++;
    }
  }
  Logger.log("Declencheurs surChangement supprimes : " + coupes);

  var f = cible_();
  var maxi = f.getMaxRows();
  var d = f.getRange(1, 1, maxi, 12).getValues();

  // ou est le contenu
  var plages = [], deb = 0, derVraie = 1, coches = 0;
  for (var r = 1; r < maxi; r++) {
    var vide = (d[r][0] !== true);
    for (var c = 1; c < 12 && vide; c++) {
      if (String(d[r][c]).trim() !== "") vide = false;
    }
    if (!vide) {
      if (!deb) deb = r + 1;
      derVraie = r + 1;
      if (d[r][0] === true) coches++;
    } else if (deb) { plages.push(deb + "-" + r); deb = 0; }
  }
  if (deb) plages.push(deb + "-" + maxi);
  var lim = Math.min(maxi, derVraie + MARGE_L);

  // 2. le filtre
  var fi = f.getFilter();
  if (fi) { fi.remove(); Logger.log("Filtre retire."); }

  // 3. les regles : huit couleurs d etat sur la colonne C, bornees.
  //    La regle a formule sur 12 000 cellules n est PAS reposee.
  var C = [["RENOMME", "#d9ead3", "#274e13"],
           ["RECU", "#cfe2f3", "#0b5394"],
           ["A_VERIFIER", "#fce5cd", "#b45f06"],
           ["MANQUANT", "#f4cccc", "#990000"],
           ["DEPOSEE", "#d0e0e3", "#0c343d"],
           ["A_VENIR", "#fff2cc", "#7f6000"],
           ["HORS PERIMETRE", "#efefef", "#666666"],
           ["SANS OBJET", "#efefef", "#666666"]];
  var etat = f.getRange(2, 3, lim - 1, 1);
  var regles = C.map(function (x) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(x[0])
      .setBackground(x[1]).setFontColor(x[2]).setBold(true)
      .setRanges([etat]).build();
  });
  f.setConditionalFormatRules(regles);
  Logger.log("Regles : " + regles.length + " sur C2:C" + lim
    + ". La regle a formule sur 12 000 cellules est SUPPRIMEE.");

  // 4. les cases a cocher des lignes vides au-dela de la limite
  if (lim < maxi) {
    f.getRange(lim + 1, 1, maxi - lim, 12).clearDataValidations();
    Logger.log("Validations retirees de la ligne " + (lim + 1)
      + " a " + maxi + ".");
  } else {
    Logger.log("Aucune validation retiree : du contenu va jusqu a la ligne "
      + derVraie + ".");
  }

  Logger.log("--- OU EST LE CONTENU ---");
  Logger.log("Blocs (" + plages.length + ") : " + plages.join(", "));
  Logger.log("Derniere ligne avec du contenu : " + derVraie);
  Logger.log("Lignes cochees : " + coches);
  SpreadsheetApp.getUi().alert("Allege.\nBlocs de contenu : "
    + plages.length + "\nDerniere ligne : " + derVraie
    + "\nDeclencheurs coupes : " + coupes);
}

/**
 * ajouterLesVingtQuatre() — ecrit les 24 lignes que le collage n a pas
 * reussi a poser, corrige les deux montants Made in Labs, et nettoie la
 * colonne K sur les lignes ajoutees.
 *
 * POURQUOI UN SCRIPT ET PLUS UN COLLAGE : le presse-papiers a echoue deux
 * fois aujourd hui, sans message. Un script, lui, dit ce qu il a fait.
 *
 * IDEMPOTENT : si une reference est deja presente, la ligne n est PAS
 * reecrite. On peut donc le relancer sans rien dupliquer.
 */

var LIGNES = [
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-06-04", "HENRY-SCHEIN", "FACTURE", 381.49, "4287993", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-06-08", "HENRY-SCHEIN", "FACTURE", 124.99, "4293114", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-06-30", "HENRY-SCHEIN", "FACTURE", 231.34, "4317192", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-07-03", "HENRY-SCHEIN", "FACTURE", 31.98, "4320966", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-07-22", "HENRY-SCHEIN", "FACTURE", 31.98, "4336516", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-09-17", "HENRY-SCHEIN", "FACTURE", 269.97, "4377209", ""],
  [false, "A OBTENIR", "A_TRIER", "MANQUANT", "2026-04-18", "HOSTINGER", "FACTURE", "", "", ""],
  [false, "LUCIE PAIE", "A_PAYER", "A_VERIFIER", "", "ROTEC", "FACTURE", "", "5113217", ""],
  [false, "LUCIE PAIE", "A_PAYER", "A_VERIFIER", "", "ROTEC", "FACTURE", "", "5114472", ""],
  [false, "LUCIE PAIE", "A_PAYER", "A_VERIFIER", "2026-01-21", "ROTEC", "FACTURE", "", "5111168", ""],
  [false, "LUCIE PAIE", "A_PAYER", "A_VERIFIER", "2026-09-02", "ROTEC", "FACTURE", "", "5124043", ""],
  [false, "A TRIER", "A_TRIER", "A_VERIFIER", "2026-01-02", "GOOGLE-WORKSPACE", "FACTURE", "", "GCFRD0011327141", "2025-12-01-au-2025-12-31"],
  [false, "A TRIER", "A_TRIER", "RENOMME", "2026-10-05", "HENRY-SCHEIN", "RELANCE", 1071.75, "compte-226502", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-01-14", "ROTEC", "FACTURE", "", "5110778", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-01-15", "ROTEC", "FACTURE", "", "5110828", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-01-16", "ROTEC", "FACTURE", "", "5110950", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-02-14", "ROTEC", "FACTURE", "", "5113053", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-04-10", "ROTEC", "FACTURE", "", "5116617", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-04-18", "ROTEC", "FACTURE", "", "5117001", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-05-12", "ROTEC", "FACTURE", "", "5118293", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-05-14", "ROTEC", "FACTURE", "", "5118531", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-06-05", "ROTEC", "FACTURE", "", "5119917", ""],
  [true, "RIEN", "ENVOYE_TGS", "DEPOSEE", "2026-06-13", "ROTEC", "FACTURE", "", "5120388", ""],
  [false, "A TRIER", "A_TRIER", "A_VERIFIER", "2026-02-28", "ARGOAT", "FACTURE", "", "", ""]
];

var EN_TETE = ["Action", "Cycle", "Etat", "Date", "Fournisseur", "Type",
               "Montant", "Reference", "Periode"];

function feuille2_() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 10) continue;
    var e = fs[i].getRange(1, 2, 1, 9).getValues()[0], bon = true;
    for (var c = 0; c < 9; c++) {
      if (String(e[c]).trim() !== EN_TETE[c]) { bon = false; break; }
    }
    if (bon) return fs[i];
  }
  throw new Error("ARRET : onglet introuvable. RIEN ECRIT.");
}

function derniereVraie_(f, maxi) {
  // La colonne A porte une case a cocher partout : getLastRow() est donc
  // inutilisable. On cherche la derniere ligne dont la colonne F
  // (Fournisseur) contient quelque chose.
  var d = f.getRange(1, 6, maxi, 1).getValues();
  for (var r = maxi - 1; r >= 1; r--) {
    if (String(d[r][0]).trim() !== "") return r + 1;
  }
  return 1;
}

function ajouterLesVingtQuatre() {
  var f = feuille2_();
  var maxi = f.getMaxRows();
  var der = derniereVraie_(f, maxi);
  var nb = der - 1;
  var d = f.getRange(2, 1, nb, 10).getValues();

  // On regarde d abord si le collage a laisse quelque chose en 189.
  var apres = f.getRange(der + 1, 1, 1, 11).getValues()[0];
  var reste = "";
  for (var c = 1; c < 11; c++) {
    if (String(apres[c]).trim() !== "") reste += " col" + (c + 1) + "='"
      + String(apres[c]).substring(0, 40) + "'";
  }
  Logger.log("Derniere ligne avec un fournisseur : " + der);
  Logger.log("Contenu de la ligne " + (der + 1) + " :"
    + (reste || " VIDE"));

  // Une ligne SANS reference — la Hostinger — ne peut pas se reconnaitre
  // par son numero. On la repere par fournisseur + date, sinon une relance
  // du script la dupliquerait.
  function cle_(ref, four, date) {
    ref = String(ref).trim();
    return ref ? "R:" + ref
               : "F:" + String(four).trim() + "|" + String(date).trim();
  }
  var vus = {};
  for (var i = 0; i < nb; i++) {
    vus[cle_(d[i][8], d[i][5], d[i][4])] = i + 2;
  }

  var aj = [], deja = [];
  for (var k = 0; k < LIGNES.length; k++) {
    var c = cle_(LIGNES[k][8], LIGNES[k][5], LIGNES[k][4]);
    if (vus[c]) { deja.push(c + " (ligne " + vus[c] + ")"); continue; }
    vus[c] = -1;
    aj.push(LIGNES[k]);
  }

  if (aj.length) {
    f.getRange(der + 1, 1, aj.length, 10).setValues(aj);
    // K reste vide : remplirDatesPortail y mettra les vraies dates.
    f.getRange(der + 1, 11, aj.length, 1).clearContent();
  }
  Logger.log("AJOUTEES : " + aj.length + " (lignes " + (der + 1) + " a "
    + (der + aj.length) + ")");
  Logger.log("Deja presentes, non reecrites : " + deja.length
    + (deja.length ? " -> " + deja.join(", ") : ""));

  // Les deux corrections a 1 000 EUR chacune.
  var C = {"35195": [1967.00], "35435": [1329.95]};
  var faits = [];
  for (var i = 0; i < nb; i++) {
    var r = String(d[i][8]).trim();
    if (!C[r]) continue;
    var l = i + 2;
    var avant = f.getRange(l, 8).getValue();
    f.getRange(l, 8).setValue(C[r][0]);
    f.getRange(l, 2).setValue("A DEPOSER");
    f.getRange(l, 3).setValue("PAYE");
    faits.push(r + " : " + avant + " -> " + C[r][0]);
  }
  Logger.log("Montants corriges : " + faits.length + " -> "
    + faits.join(" | "));

  try {
    SpreadsheetApp.getUi().alert("Ajoutees : " + aj.length
      + "\nDeja presentes : " + deja.length
      + "\nMontants corriges : " + faits.length
      + "\nDerniere ligne avant ajout : " + der);
  } catch (e) {
    // getUi() echoue hors contexte d interface : le
    // journal suffit, le travail est deja fait.
    Logger.log("Pas d interface : " + e);
  }
}

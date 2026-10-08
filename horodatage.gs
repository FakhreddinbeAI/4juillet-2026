/**
 * Colonne K « Depose le ».
 *
 * remplirDatesPortail() : inscrit la VRAIE date de depot relevee dans
 *   l historique du portail TGS, pour les 113 pieces deja deposees.
 * onEdit() : horodate la ligne des qu on coche la case en colonne A,
 *   et efface la date si on la decoche.
 *
 * L appariement se fait par REFERENCE (colonne I), jamais par numero de
 * ligne : la feuille est triee et sera retriee, un bloc colle a une
 * position serait faux des le premier tri.
 *
 * onEdit est un declencheur SIMPLE : il n y a RIEN a installer, et il ne se
 * declenche PAS sur une modification faite par un script. Aucun risque de
 * boucle, contrairement au onChange qui avait rendu l ancien Sheet
 * inutilisable.
 */

var COL_K = 11;          // la colonne « Depose le »
var COL_CASE = 1;        // la case a cocher
var COL_REF = 9;         // la reference
var DERNIERE = 1000;

var DATES = {
  "020-FC-01179765": "06/10/2026",
  "0440-1601-1250-4730-11": "07/06/2026", "046": "06/10/2026",
  "047": "06/10/2026", "04753-52817600-1": "07/06/2026",
  "04784-61986565-1": "07/06/2026", "048": "06/10/2026",
  "04812-63634805-1": "07/06/2026", "04843-58576697-1": "07/06/2026",
  "04873-50448095-1": "07/06/2026", "049": "06/10/2026",
  "04904-74747500-1": "07/06/2026", "050": "21/09/2026",
  "051": "06/10/2026", "052": "06/10/2026", "053": "06/10/2026",
  "054": "06/10/2026", "055": "06/10/2026", "20240268": "24/06/2026",
  "202543535136": "06/10/2026", "202543954441": "06/10/2026",
  "202544376491": "06/10/2026", "202544804130": "06/10/2026",
  "202545245288": "06/10/2026",
  "21440109300015-26-2-185-023-033": "06/10/2026",
  "2240-8167-3237": "06/10/2026", "2402379458": "06/10/2026",
  "2402408753": "06/10/2026", "2402410567": "06/10/2026",
  "2402412732": "06/10/2026", "24515923": "24/06/2026",
  "24516144": "24/06/2026", "26001": "26/09/2026", "26002": "26/09/2026",
  "26003": "26/09/2026", "26004": "26/09/2026", "26005": "26/09/2026",
  "26006": "26/09/2026", "26007": "26/09/2026", "26008": "26/09/2026",
  "26232180": "05/10/2026", "312100052855": "06/10/2026",
  "312100213292": "06/10/2026", "312100382919": "06/10/2026",
  "312100558302": "06/10/2026", "331150973": "06/10/2026",
  "331172675": "24/06/2026", "45530000": "21/09/2026",
  "5121155": "06/10/2026", "750004747696": "06/10/2026",
  "750004798493": "06/10/2026", "750004815707": "06/10/2026",
  "750004820768": "06/10/2026", "750004820769": "06/10/2026",
  "750004820770": "02/09/2026", "750004832398": "06/10/2026",
  "9060036699": "06/10/2026", "9060107688": "06/10/2026",
  "9060181129": "06/10/2026", "9060182966": "06/10/2026",
  "9060183030": "06/10/2026", "A167": "06/10/2026",
  "AMR-2026-01-05471": "06/10/2026", "D-2606.08953": "06/10/2026",
  "F-2026-02-000008793": "06/10/2026",
  "F-2026-03-000009276": "06/10/2026",
  "F-2026-03-000009829": "06/10/2026",
  "F-2026-04-0000010320": "06/10/2026", "F-2026-06300142": "06/10/2026",
  "F-2026-093001309": "06/10/2026", "F-20260204-4412": "07/06/2026",
  "F-20260304-4565": "07/06/2026", "FA006127": "06/10/2026",
  "FR159171": "06/10/2026", "FRIN25-01591543": "06/10/2026",
  "FRIN25-01709447": "06/10/2026", "FRIN25-01865267": "06/10/2026",
  "FRIN25-01992157": "06/10/2026", "FRIN25-02132567": "06/10/2026",
  "FRIN25-02270457": "06/10/2026", "FRIN25-02316023": "06/10/2026",
  "FRIN25-02486130": "06/10/2026", "FRIN25-02696811": "06/10/2026",
  "GCFRD0011667476": "06/10/2026", "GCFRD0014580910": "06/10/2026",
  "HKTDOLB4-0001": "06/10/2026", "HKTDOLB4-0002": "06/10/2026",
  "HKTDOLB4-0003": "06/10/2026", "HKTDOLB4-0004": "06/10/2026",
  "HKTDOLB4-0005": "06/10/2026", "HKTDOLB4-0006": "06/10/2026",
  "HKTDOLB4-0007": "06/10/2026", "HKTDOLB4-0008": "06/10/2026",
  "HKTDOLB4-0009": "06/10/2026", "INV-2026-01345": "06/10/2026",
  "QP-2025": "21/09/2026", "echeances-2026": "27/07/2026"
};

// Les pieces SANS reference — tickets de carburant, courses, relances sans
// numero — se retrouvent par « FOURNISSEUR|MONTANT ».
var DATES_COUPLE = {
  "MADE-IN-LABS|8316.98": "06/10/2026",
  "PETRO-OUEST|109.15": "06/10/2026", "PETRO-OUEST|122.59": "06/10/2026",
  "PETRO-OUEST|123.01": "06/10/2026", "RECEPT-AI|100.25": "07/06/2026",
  "RECEPT-AI|102.35": "07/06/2026", "RECEPT-AI|105.85": "07/06/2026",
  "RECEPT-AI|121.25": "07/06/2026", "RECEPT-AI|152.05": "07/06/2026",
  "RECEPT-AI|156.60": "07/06/2026", "RECEPT-AI|172.35": "07/06/2026",
  "RECEPT-AI|217.50": "07/06/2026", "RECEPT-AI|90.80": "07/06/2026",
  "SEPTODONT|": "06/10/2026", "SUPER-U-LEGE|126.27": "06/10/2026",
  "SUPER-U-LEGE|145.59": "06/10/2026"
};

// On NE verifie PAS A1 : la case a cocher posee sur A1:A1000 en a ecrase
// le libelle. On s appuie sur B1 a J1, qui suffisent a identifier la feuille.
var EN_TETE = ["Action", "Cycle", "Etat", "Date",
               "Fournisseur", "Type", "Montant", "Reference", "Periode"];

function feuille_() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 10) continue;
    var e = fs[i].getRange(1, 2, 1, 9).getValues()[0], bon = true;
    for (var c = 0; c < 9; c++) {
      if (String(e[c]).trim() !== EN_TETE[c]) { bon = false; break; }
    }
    if (bon) return fs[i];
  }
  throw new Error("ARRET : aucun onglet ne porte l en-tete attendue.");
}

function remplirDatesPortail() {
  var f = feuille_();
  if (String(f.getRange(1, COL_K).getValue()).trim() === "") {
    f.getRange(1, COL_K).setValue("Depose le").setFontWeight("bold")
      .setBackground("#434343").setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    f.setColumnWidth(COL_K, 100);
  }
  var nb = f.getLastRow() - 1;
  if (nb < 1) throw new Error("Feuille vide.");
  var d = f.getRange(2, 1, nb, 10).getValues();
  var out = [], mis = 0, deja = 0, vides = [];
  var k = f.getRange(2, COL_K, nb, 1).getValues();
  for (var i = 0; i < nb; i++) {
    if (String(d[i][5]).trim() === "") { out.push([k[i][0]]); continue; }
    if (String(k[i][0]).trim() !== "") { out.push([k[i][0]]); deja++; continue; }
    var ref = String(d[i][8]).trim();
    var v = ref ? DATES[ref] : null;
    if (!v) {
      var cle = String(d[i][5]).trim() + "|" + montant_(d[i][7]);
      v = DATES_COUPLE[cle];
    }
    if (v) { out.push([v]); mis++; }
    else {
      out.push([""]);
      if (d[i][0] === true) vides.push(String(d[i][5]) + " " + ref);
    }
  }
  f.getRange(2, COL_K, nb, 1).setValues(out);
  f.getRange(2, COL_K, nb, 1).setHorizontalAlignment("center");
  Logger.log("Dates inscrites : " + mis + " / deja remplies : " + deja);
  Logger.log("Cochees SANS date (" + vides.length + ") : "
    + vides.join(", "));
  SpreadsheetApp.getUi().alert("Dates de depot inscrites : " + mis
    + "\nDeja remplies : " + deja
    + "\nCochees sans date : " + vides.length);
}

function montant_(v) {
  if (v === "" || v === null) return "";
  var n = (typeof v === "number") ? v
        : parseFloat(String(v).replace(/[^0-9,.-]/g, "").replace(",", "."));
  return isNaN(n) ? "" : n.toFixed(2);
}

/**
 * Horodate la ligne quand on coche. Declencheur simple : rien a installer.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var r = e.range;
  if (r.getColumn() !== COL_CASE) return;
  if (r.getRow() < 2 || r.getRow() > DERNIERE) return;
  var f = r.getSheet();
  if (String(f.getRange(1, 2).getValue()).trim() !== "Action") return;
  for (var i = 0; i < r.getNumRows(); i++) {
    var ligne = r.getRow() + i;
    var coche = f.getRange(ligne, COL_CASE).getValue() === true;
    var c = f.getRange(ligne, COL_K);
    if (coche) {
      if (String(c.getValue()).trim() === "") {
        c.setValue(Utilities.formatDate(new Date(),
          Session.getScriptTimeZone(), "dd/MM/yyyy"));
        c.setHorizontalAlignment("center");
      }
    } else {
      c.clearContent();
    }
  }
}

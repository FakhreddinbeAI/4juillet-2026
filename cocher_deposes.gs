/**
 * cocherDeposes() — coche en colonne A les pieces reellement deposees sur
 * le portail TGS, d apres l index local des 1298 depots du portail.
 * N ECRIT QU EN A ET B. Ne touche JAMAIS K (vigilance) ni L (liens).
 * Genere le 08/10/2026 : 80 references + 15 couples fournisseur/montant.
 */

var REFS = [
  "020-FC-01179765", "0440-1601-1250-4730-11", "04753-52817600-1",
  "04784-61986565-1", "04812-63634805-1", "04843-58576697-1",
  "04873-50448095-1", "04904-74747500-1", "20240268", "202543535136",
  "202543954441", "202544376491", "202544804130", "202545245288",
  "21440109300015-26-2-185-023-033", "2240-8167-3237", "2402408753",
  "2402410567", "2402412732", "26001", "26002", "26003", "26004", "26005",
  "26006", "26007", "26008", "26232180", "312100052855", "312100213292",
  "312100382919", "312100558302", "331150973", "331172675", "45530000",
  "750004747696", "750004798493", "750004815707", "750004820768",
  "750004820769", "750004832398", "9060107688", "9060181129", "9060182966",
  "9060183030", "A167", "AMR-2026-01-05471", "D-2606.08953",
  "F-2026-02-000008793", "F-2026-03-000009276", "F-2026-03-000009829",
  "F-2026-04-0000010320", "F-2026-06300142", "F-2026-093001309",
  "F-20260204-4412", "F-20260304-4565", "FA006127", "FR159171",
  "FRIN25-01591543", "FRIN25-01709447", "FRIN25-01865267",
  "FRIN25-01992157", "FRIN25-02132567", "FRIN25-02270457",
  "FRIN25-02316023", "FRIN25-02486130", "FRIN25-02696811",
  "GCFRD0011667476", "GCFRD0014580910", "HKTDOLB4-0001", "HKTDOLB4-0002",
  "HKTDOLB4-0003", "HKTDOLB4-0004", "HKTDOLB4-0005", "HKTDOLB4-0006",
  "HKTDOLB4-0007", "HKTDOLB4-0008", "HKTDOLB4-0009", "INV-2026-01345",
  "QP-2025"
];

var COUPLES = [
  ["MADE-IN-LABS", 8316.98], ["PETRO-OUEST", 109.15],
  ["PETRO-OUEST", 122.59], ["PETRO-OUEST", 123.01], ["RECEPT-AI", 100.25],
  ["RECEPT-AI", 102.35], ["RECEPT-AI", 105.85], ["RECEPT-AI", 121.25],
  ["RECEPT-AI", 152.05], ["RECEPT-AI", 156.60], ["RECEPT-AI", 172.35],
  ["RECEPT-AI", 217.50], ["RECEPT-AI", 90.80], ["SUPER-U-LEGE", 126.27],
  ["SUPER-U-LEGE", 145.59]
];

function norm_(v) {
  return String(v).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function montant_(v) {
  if (typeof v === "number") return v;
  var s = String(v).replace(/[^0-9,.-]/g, "").replace(",", ".");
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function cocherDeposes() {
  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var att = {1: "Depose TGS", 2: "Horodatage", 5: "Fournisseur",
             7: "Montant", 8: "Reference"};
  var e = f.getRange(1, 1, 1, 12).getValues()[0];
  for (var c in att) {
    if (String(e[c - 1]).trim() !== att[c]) {
      throw new Error("ARRET colonne " + c + " : attendu '" + att[c]
        + "', trouve '" + String(e[c - 1]).trim() + "'. RIEN ECRIT.");
    }
  }

  var nb = f.getLastRow() - 1;
  if (nb < 1) throw new Error("Feuille vide. Rien ecrit.");
  var d = f.getRange(2, 1, nb, 8).getValues();

  var cible = {};
  var vus = {};
  for (var i = 0; i < REFS.length; i++) vus[norm_(REFS[i])] = 0;

  for (var i = 0; i < nb; i++) {
    var r = norm_(d[i][7]);
    if (r.length >= 4 && vus[r] !== undefined) { cible[i] = 1; vus[r]++; }
  }

  var amb = [];
  for (var j = 0; j < COUPLES.length; j++) {
    var fo = norm_(COUPLES[j][0]), mt = COUPLES[j][1], hits = [];
    for (var i = 0; i < nb; i++) {
      var fs = norm_(d[i][4]), ms = montant_(d[i][6]);
      if (!fs || ms === null) continue;
      if ((fs.indexOf(fo) >= 0 || fo.indexOf(fs) >= 0)
          && Math.abs(ms - mt) < 0.005) hits.push(i);
    }
    if (hits.length === 1) cible[hits[0]] = 1;
    else amb.push(COUPLES[j][0] + " " + mt + " -> " + hits.length + " lignes");
  }

  var horo = new Date();
  var coche = 0, deja = 0;
  for (var i in cible) {
    i = Number(i);
    if (d[i][0] === true) { deja++; continue; }
    f.getRange(i + 2, 1).setValue(true);
    f.getRange(i + 2, 2).setValue(horo);
    coche++;
  }

  var absents = [];
  for (var k = 0; k < REFS.length; k++) {
    if (!vus[norm_(REFS[k])]) absents.push(REFS[k]);
  }

  Logger.log("Cochees : " + coche + " / deja cochees : " + deja);
  Logger.log("Lignes du Sheet : " + nb);
  Logger.log("References attendues introuvables (" + absents.length + ") : "
    + absents.join(", "));
  Logger.log("Couples non tranches (" + amb.length + ") : " + amb.join(" | "));
  SpreadsheetApp.getUi().alert("Cochees : " + coche + "\nDeja : " + deja
    + "\nIntrouvables : " + absents.length + "\nAmbigus : " + amb.length);
}

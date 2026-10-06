/**
 * Ajoute les 30 factures d abonnement de la boite perso.
 *
 * Version COURTE : la premiere faisait 125 lignes et le collage a ete coupe
 * a la ligne 100. Les notes sont sorties des donnees, une par fournisseur.
 *
 * Verifie l en-tete avant d ecrire. Idempotent.
 */
function ajouterAbonnements() {
  var N = {
    DOCTOLIB: "Montant et reference LUS AU RELEVE : le libelle du prelevement"
      + " porte le numero de facture. Date = date du DEBIT.",
    IONOS: "Montant et reference LUS AU RELEVE (Num-CL. K874506958/ Fact.)."
      + " Date = date du DEBIT. Passe de 27,60 a 31,20 en mai.",
    "RECEPT-AI": "Facturee par BUDGIE S.A.S. Pas de reference au releve :"
      + " appariee par MONTANT, unique chaque mois. Reference a lire sur le PDF."
  };

  var D = [
    ["2025-12-09","DOCTOLIB",149.00,"FRIN25-01451287"],
    ["2026-01-12","DOCTOLIB",149.00,"FRIN25-01591543"],
    ["2026-02-06","DOCTOLIB",149.00,"FRIN25-01709447"],
    ["2026-03-09","DOCTOLIB",149.00,"FRIN25-01865267"],
    ["2026-04-13","DOCTOLIB",149.00,"FRIN25-01992157"],
    ["2026-05-12","DOCTOLIB",149.00,"FRIN25-02132567"],
    ["2026-06-09","DOCTOLIB",149.00,"FRIN25-02270457"],
    ["2026-07-13","DOCTOLIB",149.00,"FRIN25-02316023"],
    ["2026-08-10","DOCTOLIB",149.00,"FRIN25-02486130"],
    ["2026-09-14","DOCTOLIB",149.00,"FRIN25-02696811"],
    ["2025-12-17","IONOS",27.60,"202543127270"],
    ["2026-01-14","IONOS",27.60,"202543535136"],
    ["2026-02-16","IONOS",27.60,"202543954441"],
    ["2026-03-16","IONOS",27.60,"202544376491"],
    ["2026-04-15","IONOS",27.60,"202544804130"],
    ["2026-05-18","IONOS",31.20,"202545245288"],
    ["2026-06-10","IONOS",31.20,"312100052855"],
    ["2026-07-10","IONOS",31.20,"312100213292"],
    ["2026-08-12","IONOS",31.20,"312100382919"],
    ["2026-09-10","IONOS",31.20,"312100558302"],
    ["2025-12-17","RECEPT-AI",25.00,""],
    ["2026-01-19","RECEPT-AI",90.80,""],
    ["2026-02-17","RECEPT-AI",100.25,""],
    ["2026-03-17","RECEPT-AI",102.35,""],
    ["2026-04-17","RECEPT-AI",105.85,""],
    ["2026-05-18","RECEPT-AI",121.25,""],
    ["2026-06-17","RECEPT-AI",156.60,""],
    ["2026-07-17","RECEPT-AI",172.35,""],
    ["2026-08-19","RECEPT-AI",152.05,""],
    ["2026-09-21","RECEPT-AI",217.50,""],
  ];

  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var e = f.getRange(1, 1, 1, 11).getValues()[0];
  var A = {1:"Depose TGS",2:"Horodatage",3:"Etat",4:"Date",5:"Fournisseur",
           6:"Type",7:"Montant",8:"Reference",11:"Point de vigilance"};
  for (var c in A) {
    if (String(e[c-1]).trim() !== A[c]) {
      throw new Error("ARRET colonne " + c + " : attendu '" + A[c]
        + "', trouve '" + String(e[c-1]).trim() + "'. Rien ecrit.");
    }
  }

  var n = f.getLastRow(), vus = {};
  f.getRange(2, 5, n-1, 4).getValues().forEach(function (r) {
    vus[String(r[3]).trim() || r[0] + "|" + r[2]] = true;
  });

  var ok = 0, saut = 0;
  for (var i = 0; i < D.length; i++) {
    var L = D[i], cle = L[3] || L[1] + "|" + L[2];
    if (vus[cle]) { saut++; continue; }
    var g = f.getLastRow() + 1;
    f.getRange(g, 1).insertCheckboxes();
    f.getRange(g, 1).setValue(false);
    f.getRange(g, 3, 1, 6).setValues([["RECU", L[0], L[1], "FACTURE", L[2], L[3]]]);
    f.getRange(g, 7).setNumberFormat('#,##0.00" EUR"');
    f.getRange(g, 11).setValue(N[L[1]]);
    vus[cle] = true;
    ok++;
  }
  SpreadsheetApp.flush();
  Logger.log("Ajoutees : " + ok + " / Deja presentes : " + saut);
  Logger.log("Attendu la premiere fois : 30 et 0.");
}

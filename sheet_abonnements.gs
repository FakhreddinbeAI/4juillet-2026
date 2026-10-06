/**
 * Ajoute les 30 factures d abonnement recuperees dans la boite perso.
 *
 * Doctolib et Ionos : montant ET reference lus au RELEVE, le libelle du
 * prelevement les porte. Recept AI : pas de reference au releve, mais un
 * montant different chaque mois, donc appariable.
 *
 * Idempotent : une ligne dont la reference est deja en colonne H est
 * sautee. Verifie l en-tete avant d ecrire.
 */
function ajouterAbonnements() {
  var LIGNES = [
    ["2025-12-09", "DOCTOLIB", 149.00, "FRIN25-01451287",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-01-12", "DOCTOLIB", 149.00, "FRIN25-01591543",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-02-06", "DOCTOLIB", 149.00, "FRIN25-01709447",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-03-09", "DOCTOLIB", 149.00, "FRIN25-01865267",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-04-13", "DOCTOLIB", 149.00, "FRIN25-01992157",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-05-12", "DOCTOLIB", 149.00, "FRIN25-02132567",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-06-09", "DOCTOLIB", 149.00, "FRIN25-02270457",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-07-13", "DOCTOLIB", 149.00, "FRIN25-02316023",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-08-10", "DOCTOLIB", 149.00, "FRIN25-02486130",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2026-09-14", "DOCTOLIB", 149.00, "FRIN25-02696811",
     "Montant et reference LUS AU RELEVE : le libelle du prelevement porte le numero de facture. Date = date du DEBIT, celle de la facture est a confirmer en ouvrant le PDF."],
    ["2025-12-17", "IONOS", 27.60, "202543127270",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-01-14", "IONOS", 27.60, "202543535136",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-02-16", "IONOS", 27.60, "202543954441",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-03-16", "IONOS", 27.60, "202544376491",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-04-15", "IONOS", 27.60, "202544804130",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-05-18", "IONOS", 31.20, "202545245288",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-06-10", "IONOS", 31.20, "312100052855",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-07-10", "IONOS", 31.20, "312100213292",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-08-12", "IONOS", 31.20, "312100382919",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2026-09-10", "IONOS", 31.20, "312100558302",
     "Montant et reference LUS AU RELEVE (libelle 'Num-CL. K874506958/ Fact. ...'). Date = date du DEBIT. Passe de 27,60 a 31,20 en mai."],
    ["2025-12-17", "RECEPT-AI", 25.00, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-01-19", "RECEPT-AI", 90.80, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-02-17", "RECEPT-AI", 100.25, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-03-17", "RECEPT-AI", 102.35, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-04-17", "RECEPT-AI", 105.85, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-05-18", "RECEPT-AI", 121.25, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-06-17", "RECEPT-AI", 156.60, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-07-17", "RECEPT-AI", 172.35, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-08-19", "RECEPT-AI", 152.05, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
    ["2026-09-21", "RECEPT-AI", 217.50, "",
     "Facturee par BUDGIE S.A.S. Aucune reference au releve : appariee par MONTANT, unique chaque mois. Date = date du DEBIT. Reference exacte a lire sur le PDF."],
  ];

  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  var e = f.getRange(1, 1, 1, 12).getValues()[0];
  var attendu = { 1: "Depose TGS", 2: "Horodatage", 3: "Etat", 4: "Date",
                  5: "Fournisseur", 6: "Type", 7: "Montant", 8: "Reference",
                  11: "Point de vigilance" };
  for (var col in attendu) {
    if (String(e[col - 1]).trim() !== attendu[col]) {
      throw new Error("ARRET : colonne " + col + " devrait etre '"
        + attendu[col] + "' mais contient '" + String(e[col - 1]).trim()
        + "'. Rien n a ete ecrit.");
    }
  }

  var n = f.getLastRow();
  var vus = {};
  f.getRange(2, 8, n - 1, 1).getValues().forEach(function (r) {
    var v = String(r[0]).trim();
    if (v) vus[v] = true;
  });
  var montants = {};
  f.getRange(2, 5, n - 1, 3).getValues().forEach(function (r) {
    montants[String(r[0]).trim() + "|" + r[2]] = true;
  });

  var ajoutees = 0, sautees = 0;
  for (var i = 0; i < LIGNES.length; i++) {
    var L = LIGNES[i];
    var cle = L[3] ? L[3] : L[1] + "|" + L[2];
    if ((L[3] && vus[L[3]]) || (!L[3] && montants[cle])) { sautees++; continue; }

    var ligne = f.getLastRow() + 1;
    f.getRange(ligne, 1).insertCheckboxes();
    f.getRange(ligne, 1).setValue(false);
    f.getRange(ligne, 3).setValue("RECU");
    f.getRange(ligne, 4).setValue(L[0]);
    f.getRange(ligne, 5).setValue(L[1]);
    f.getRange(ligne, 6).setValue("FACTURE");
    f.getRange(ligne, 7).setValue(L[2]);
    f.getRange(ligne, 7).setNumberFormat('#,##0.00\\ "\u20ac"');
    f.getRange(ligne, 8).setValue(L[3]);
    f.getRange(ligne, 11).setValue(L[4]);
    ajoutees++;
    if (L[3]) vus[L[3]] = true; else montants[cle] = true;
  }

  SpreadsheetApp.flush();
  Logger.log("Ajoutees : " + ajoutees + " / Deja presentes : " + sautees);
  Logger.log("Attendu la premiere fois : 30 et 0.");
  Logger.log("Total des lignes : " + f.getLastRow());
}

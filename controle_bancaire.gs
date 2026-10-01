/**
 * CONTROLE BANCAIRE 2026 — cases à cocher et horodatage automatique
 *
 * ATTENTION, c'est le piège de la dernière fois : ce script doit être créé
 * DEPUIS LA FEUILLE — Extensions → Apps Script — et surtout PAS comme un
 * nouveau projet Apps Script autonome. Dans un projet autonome,
 * getActiveSpreadsheet() renvoie null et onEdit ne se déclenche jamais.
 *
 * Mode d'emploi :
 *   1. ouvrir la feuille CONTROLE BANCAIRE 2026
 *   2. Extensions → Apps Script
 *   3. coller ce fichier, enregistrer
 *   4. lancer installer() une seule fois, accepter l'autorisation
 *   5. cocher une case : la date et l'heure s'écrivent à côté
 */

var COL_ETAT       = 9;   // I
var COL_DEPOSE     = 11;  // K  — la case à cocher
var COL_HORODATAGE = 12;  // L  — rempli automatiquement
var PREMIERE_LIGNE = 2;   // la ligne 1 est l'en-tête


function feuille_() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur) {
    throw new Error(
      "Aucun classeur actif. Ce script a été créé comme projet autonome : " +
      "il faut le recréer depuis la feuille, par Extensions puis Apps Script.");
  }
  return classeur.getSheets()[0];
}


/** À lancer UNE SEULE FOIS. Met en place les cases, le figeage et les couleurs. */
function installer() {
  var f = feuille_();
  var derniere = f.getLastRow();
  var nb = derniere - PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Feuille vide, rien à installer."); return; }

  // 1. de vraies cases à cocher sur la colonne K
  var plageCases = f.getRange(PREMIERE_LIGNE, COL_DEPOSE, nb, 1);
  plageCases.insertCheckboxes();

  // 2. en-tête figé et lisible
  f.setFrozenRows(1);
  var enTete = f.getRange(1, 1, 1, f.getLastColumn());
  enTete.setFontWeight("bold").setBackground("#1f3864").setFontColor("#ffffff");

  // 3. largeurs : le libellé et la note ont besoin de place
  f.setColumnWidth(4, 330);   // libelle
  f.setColumnWidth(8, 230);   // justificatif attendu
  f.setColumnWidth(10, 120);  // lien
  f.setColumnWidth(13, 420);  // note

  // 4. couleur sur l'état, pour voir les trous d'un coup d'oeil
  var plageEtat = f.getRange(PREMIERE_LIGNE, COL_ETAT, nb, 1);
  var regles = [];
  regles.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("A OBTENIR")
      .setBackground("#f4cccc").setFontColor("#990000")
      .setRanges([plageEtat]).build());
  regles.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("PRESENT")
      .setBackground("#d9ead3").setFontColor("#274e13")
      .setRanges([plageEtat]).build());
  regles.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("SANS OBJET")
      .setBackground("#efefef").setFontColor("#666666")
      .setRanges([plageEtat]).build());

  // on ajoute aux règles existantes au lieu de les écraser
  var existantes = f.getConditionalFormatRules();
  f.setConditionalFormatRules(existantes.concat(regles));

  // 5. l'horodatage est écrit par le script, pas à la main
  f.getRange(PREMIERE_LIGNE, COL_HORODATAGE, nb, 1)
   .setNumberFormat("dd/MM/yyyy HH:mm")
   .setBackground("#fff2cc");

  Logger.log("Installation terminée sur " + nb + " ligne(s). " +
             "Coche une case de la colonne K pour vérifier l'horodatage.");
}


/**
 * Déclencheur simple. Tourne à chaque modification de cellule.
 * Coché   → écrit la date et l'heure en L.
 * Décoché → efface L, pour qu'un dépôt annulé ne laisse pas de fausse trace.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var f = e.range.getSheet();
  if (f.getIndex() !== 1) return;                  // seulement le 1er onglet
  if (e.range.getColumn() !== COL_DEPOSE) return;  // seulement la colonne K
  if (e.range.getRow() < PREMIERE_LIGNE) return;   // jamais l'en-tête

  var hauteur = e.range.getNumRows();
  for (var i = 0; i < hauteur; i++) {
    var ligne = e.range.getRow() + i;
    var coche = f.getRange(ligne, COL_DEPOSE).getValue() === true;
    var cible = f.getRange(ligne, COL_HORODATAGE);
    if (coche) {
      // on n'écrase pas un horodatage déjà posé : la première fois fait foi
      if (!cible.getValue()) cible.setValue(new Date());
    } else {
      cible.clearContent();
    }
  }
}


/** Récapitulatif dans le journal. Pratique avant de répondre au comptable. */
function recapitulatif() {
  var f = feuille_();
  var derniere = f.getLastRow();
  var nb = derniere - PREMIERE_LIGNE + 1;
  if (nb < 1) { Logger.log("Feuille vide."); return; }

  var donnees = f.getRange(PREMIERE_LIGNE, 1, nb, 13).getValues();
  var parEtat = {}, deposes = 0, aDeposer = 0;

  for (var i = 0; i < donnees.length; i++) {
    var etat   = String(donnees[i][COL_ETAT - 1]);
    var debit  = parseFloat(donnees[i][4]) || 0;
    var credit = parseFloat(donnees[i][5]) || 0;
    if (!parEtat[etat]) parEtat[etat] = [0, 0];
    parEtat[etat][0] += 1;
    parEtat[etat][1] += debit + credit;
    if (donnees[i][COL_DEPOSE - 1] === true) deposes++; else aDeposer++;
  }

  Logger.log("--- CONTROLE BANCAIRE 2026 ---");
  for (var etat in parEtat) {
    Logger.log(etat + " : " + parEtat[etat][0] + " mouvement(s), " +
               parEtat[etat][1].toFixed(2) + " EUR");
  }
  Logger.log("Deposes sur le portail TGS : " + deposes);
  Logger.log("Restant a deposer : " + aDeposer);
}

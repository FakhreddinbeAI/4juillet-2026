/**
 * MENU TGS — incrementer la feuille depuis le Drive
 * A coller dans le MEME projet Apps Script que tableau_tgs.gs.
 *
 * Ajoute un menu « TGS » dans la barre de la feuille : un clic, pas besoin
 * d ouvrir l editeur. Recharge la feuille apres le collage pour le voir.
 *
 * CE QUE CA CORRIGE. Les liens « ouvrir » poses jusqu ici etaient des
 * RECHERCHES Drive sur le nom : elles ne prouvent rien, et c est ce qui a
 * fait echouer le lot 1 — quatre pieces marquees RENOMME dont le fichier ne
 * portait pas ce nom. En important depuis le Drive on connait l identifiant,
 * donc on ecrit un lien DIRECT. Un lien qui s ouvre, c est un fichier qui
 * existe.
 */

var DOSSIER_FACTURATION = "1Wl82iXKZmGD4iNzYuVN06gQ6jYKnLxCt";

var M_DEPOSE = 1, M_ETAT = 3, M_DATE = 4, M_FOURN = 5, M_TYPE = 6;
var M_MONTANT = 7, M_REF = 8, M_PERIODE = 9, M_FICHIER = 10, M_LIEN = 12;
var M_NB_COL = 12, M_LIGNE1 = 2;


function onOpen() {
  SpreadsheetApp.getUi().createMenu("TGS")
    .addItem("Importer les nouvelles pieces du Drive", "importerDepuisDrive")
    .addItem("Verifier les liens (audit)",             "reconcilier"  )
    .addSeparator()
    .addItem("File d attente a deposer",               "fileDAttente")
    .addItem("Rapprocher le portail",                  "cocherDepuisPortail")
    .addToUi();
}


function cleNom_(n) {
  return String(n || "").replace(/^.*[\\\/]/, "").trim().toLowerCase();
}


/**
 * Decoupe un nom conforme a la convention :
 *   AAAA-MM-JJ_FOURNISSEUR_TYPE[_MONTANT][_REFERENCE][_Pdebut-au-fin][_DUPLICATA]
 *
 * Analyse par morceaux et non par une regex unique : montant ET reference
 * sont facultatifs, et une reference peut contenir des tirets — une regex
 * gloutonne avalerait le bloc de periode.
 *
 * LE PIEGE, verifie sur de vrais noms : une reference peut n etre QUE des
 * chiffres (26009 pour un releve BNP, 26232180 pour l affiliation AG2R,
 * 90049585 chez Septodont). Elle serait alors prise pour le montant, et la
 * piece refusee. Le montant porte TOUJOURS un point et deux decimales
 * — 21.60, 990.00, 8316.98 — c est ce qui les distingue. On exige donc le
 * point decimal, sans quoi le morceau part en reference.
 *
 * Et la reference est bien facultative : la relance Made in Labs du 17/08
 * n en porte aucune.
 */
function decouper_(nom) {
  var base = nom.replace(/\.pdf$/i, "");
  var p = base.split("_");
  if (p.length < 3) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p[0])) return null;
  if (!/^[A-Z]+$/.test(p[2])) return null;

  var o = { date: p[0], fournisseur: p[1], type: p[2],
            montant: "", reference: "", periode: "" };
  var i = 3;
  if (i < p.length && /^\d+\.\d{2}$/.test(p[i])) { o.montant = p[i]; i++; }

  var ref = [];
  for (; i < p.length; i++) {
    var m = /^P(\d{4}-\d{2}-\d{2})-au-(\d{4}-\d{2}-\d{2})$/.exec(p[i]);
    if (m) { o.periode = m[1] + "-au-" + m[2]; continue; }
    if (p[i] === "DUPLICATA") continue;
    ref.push(p[i]);
  }
  o.reference = ref.join("_");
  return (o.montant || o.reference) ? o : null;
}


/** Ajoute en bas de la feuille toute piece du Drive encore absente. */
function importerDepuisDrive() {
  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var nb = f.getLastRow() - M_LIGNE1 + 1;

  var connus = {};
  if (nb > 0) {
    var v = f.getRange(M_LIGNE1, M_FICHIER, nb, 1).getValues();
    for (var i = 0; i < v.length; i++) {
      var k = cleNom_(v[i][0]);
      if (k) connus[k] = true;
    }
  }

  var it = DriveApp.getFolderById(DOSSIER_FACTURATION).getFilesByType("application/pdf");
  var ajoutes = 0, deja = 0, horsConvention = [];

  while (it.hasNext()) {
    var fic = it.next(), nom = fic.getName();
    if (connus[cleNom_(nom)]) { deja++; continue; }
    var d = decouper_(nom);
    if (!d) { horsConvention.push(nom); continue; }

    var l = f.getLastRow() + 1;
    f.getRange(l, 1, 1, M_NB_COL).setValues([[
      false, "", "RENOMME", d.date, d.fournisseur, d.type,
      d.montant ? Number(d.montant) : "", d.reference, d.periode, nom, "", ""
    ]]);
    f.getRange(l, M_LIEN).setRichTextValue(
      SpreadsheetApp.newRichTextValue().setText("ouvrir")
        .setLinkUrl(fic.getUrl()).build());
    f.getRange(l, M_DEPOSE).insertCheckboxes();
    ajoutes++;
  }
  SpreadsheetApp.flush();

  Logger.log("Import : " + ajoutes + " ajoutee(s), " + deja + " deja presente(s).");
  if (horsConvention.length) {
    Logger.log("Hors convention, NON importees (" + horsConvention.length + ") :");
    for (var h = 0; h < horsConvention.length; h++) Logger.log("   " + horsConvention[h]);
  }
}


/**
 * AUDIT. Pour chaque ligne, cherche le fichier dans le Drive par son nom
 * exact. Trouve -> lien direct. Introuvable -> la cellule le DIT.
 * C est ce controle qui manquait : il aurait signale les quatre pieces du
 * lot 1 avant d envoyer Chrome les chercher pour rien.
 */
function reparerLiens() {
  var f = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var nb = f.getLastRow() - M_LIGNE1 + 1;
  if (nb < 1) { Logger.log("Feuille vide."); return; }

  var noms = f.getRange(M_LIGNE1, M_FICHIER, nb, 1).getValues();
  var ok = 0, absents = [], vides = 0;

  for (var i = 0; i < nb; i++) {
    var nom = String(noms[i][0] || "").trim();
    var cel = f.getRange(M_LIGNE1 + i, M_LIEN);
    if (!nom) { cel.clearContent(); vides++; continue; }

    var it = DriveApp.getFilesByName(nom);
    if (it.hasNext()) {
      cel.setRichTextValue(SpreadsheetApp.newRichTextValue().setText("ouvrir")
        .setLinkUrl(it.next().getUrl()).build());
      ok++;
    } else {
      cel.setValue("ABSENT DU DRIVE").setFontColor("#990000").setFontWeight("bold");
      absents.push((M_LIGNE1 + i) + " : " + nom);
    }
  }
  SpreadsheetApp.flush();

  Logger.log("Audit : " + ok + " lien(s) direct(s), " + absents.length +
             " absent(s) du Drive, " + vides + " ligne(s) sans nom.");
  for (var a = 0; a < absents.length; a++) Logger.log("   " + absents[a]);
}

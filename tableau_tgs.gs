/**
 * TGS 2026 — pièces à déposer : mise en forme et cases à cocher
 *
 * LE PIÈGE, c'est celui de juillet : ce script doit être créé DEPUIS LA
 * FEUILLE — Extensions → Apps Script — et jamais comme projet autonome.
 * Dans un projet autonome, getActiveSpreadsheet() renvoie null et onEdit ne
 * se déclenche pas.
 *
 * Mode d'emploi :
 *   1. ouvrir la feuille TGS 2026 — pièces à déposer
 *   2. Extensions → Apps Script
 *   3. coller ce fichier, enregistrer
 *   4. lancer installer(), accepter l'autorisation
 *   5. cocher une case : la date et l'heure s'écrivent à côté
 *
 * POURQUOI C'EST DECOUPE EN ETAPES. La premiere version faisait tout d'une
 * traite et s'est cassee sur « Service Spreadsheets failed », une erreur
 * interne de Google : Apps Script accumule les ecritures et les envoie au
 * dernier moment, donc un echec en fin de parcours peut emporter des etapes
 * qui avaient l'air passees. Chaque etape appelle maintenant flush(), donc
 * elle est ecrite pour de bon avant que la suivante commence, et le journal
 * dit exactement ou on s'est arrete.
 *
 * ET POURQUOI ON PEUT RELANCER. Chaque etape se nettoie avant d'agir :
 * relancer installer() dix fois donne le meme resultat qu'une fois. C'est
 * indispensable ici, puisque la premiere tentative s'est arretee au milieu.
 *
 * Colonnes : A dépôt, B horodatage, C état, D date, E fournisseur, F type,
 * G montant, H référence, I période, J nom de fichier, K vigilance.
 * Le script AJOUTE une colonne L « ouvrir », cliquable, qui lance une
 * recherche Drive sur le nom exact du fichier. Un clic et on est sur la pièce.
 */

var COL_DEPOSE     = 1;   // A
var COL_HORODATAGE = 2;   // B
var COL_ETAT       = 3;   // C
var COL_MONTANT    = 7;   // G
var COL_FICHIER    = 10;  // J
var COL_VIGILANCE  = 11;  // K
var COL_LIEN       = 12;  // L — ajoutee par le script
var NB_COLONNES    = 12;
var PREMIERE_LIGNE = 2;


function feuille_() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur) {
    throw new Error(
      "Aucun classeur actif : ce script a été créé comme projet autonome. " +
      "Il faut le recréer depuis la feuille, par Extensions puis Apps Script.");
  }
  return classeur.getSheets()[0];
}


/** Nombre de lignes de données. Rend 0 si la feuille est vide. */
function nbLignes_(f) {
  var n = f.getLastRow() - PREMIERE_LIGNE + 1;
  return n > 0 ? n : 0;
}


/**
 * Convertit "1 353,76" en nombre. Rend null si la cellule est vide.
 * En JavaScript, \s couvre deja l espace insecable U+00A0 et l espace
 * fine insecable U+202F : inutile de les lister, et surtout pas de les
 * ecrire en clair dans le source, ou ils seraient invisibles et abimes par un
 * copier-coller.
 */
function enNombre_(v) {
  if (typeof v === "number") return v;
  if (!v) return null;
  var s = String(v).replace(/\s/g, "").replace(",", ".");
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}


/**
 * A LANCER. Enchaine les six etapes, en enregistrant apres chacune.
 * Relancable sans rien abimer ni empiler.
 *
 * Si une etape casse encore sur une erreur interne Google, le journal nomme
 * la derniere etape passee : relance installer(), les etapes deja faites
 * seront simplement refaites a l'identique.
 */
function installer() {
  var etapes = [
    ["1. cases a cocher",   etape1_cases],
    ["2. en-tete",          etape2_entete],
    ["3. montants",         etape3_montants],
    ["4. colonne ouvrir",   etape4_liens],
    ["5. couleurs",         etape5_couleurs],
    ["6. filtre",           etape6_filtre]
  ];

  for (var i = 0; i < etapes.length; i++) {
    var nom = etapes[i][0];
    try {
      etapes[i][1]();
      SpreadsheetApp.flush();   // ecrit pour de bon avant de passer a la suite
      Logger.log("OK   " + nom);
    } catch (err) {
      Logger.log("ECHEC " + nom + " : " + err.message);
      Logger.log("Les etapes precedentes sont enregistrees. " +
                 "Relance installer() : elles seront refaites a l'identique, " +
                 "sans doublon.");
      throw err;
    }
  }
  Logger.log("Installation terminee. Coche une case en colonne A : " +
             "la date et l'heure doivent s'ecrire en B.");
}


/** Etape 1 : de vraies cases a cocher, a la place des FALSE. */
function etape1_cases() {
  var f = feuille_();
  var nb = nbLignes_(f);
  if (!nb) throw new Error("Feuille vide.");
  // insertCheckboxes convertit les FALSE existants en cases decochees,
  // et ne change rien si les cases sont deja la.
  f.getRange(PREMIERE_LIGNE, COL_DEPOSE, nb, 1).insertCheckboxes();
}


/** Etape 2 : en-tete, figeage, largeurs, corps du tableau. */
function etape2_entete() {
  var f = feuille_();
  var nb = nbLignes_(f);

  f.setFrozenRows(1);
  f.setFrozenColumns(3);               // depot, horodatage et etat restent visibles
  f.getRange(1, COL_LIEN).setValue("Ouvrir");
  f.getRange(1, 1, 1, NB_COLONNES)
   .setFontWeight("bold")
   .setBackground("#1f3864")
   .setFontColor("#ffffff")
   .setVerticalAlignment("middle")
   .setWrap(true);
  f.setRowHeight(1, 40);

  // largeurs, pensees pour ne pas avoir a faire defiler
  var largeurs = [90, 130, 105, 95, 170, 105, 100, 180, 200, 420, 460, 75];
  for (var c = 0; c < largeurs.length; c++) f.setColumnWidth(c + 1, largeurs[c]);

  f.getRange(PREMIERE_LIGNE, 1, nb, NB_COLONNES)
   .setVerticalAlignment("top").setFontSize(10);
  f.getRange(PREMIERE_LIGNE, COL_VIGILANCE, nb, 1).setWrap(true);
  f.getRange(PREMIERE_LIGNE, COL_FICHIER, nb, 1)
   .setWrap(false).setFontFamily("Courier New");
  f.getRange(PREMIERE_LIGNE, COL_ETAT, nb, 1).setHorizontalAlignment("center");

  // l'horodatage est ecrit par le script, jamais a la main
  f.getRange(PREMIERE_LIGNE, COL_HORODATAGE, nb, 1)
   .setNumberFormat("dd/MM/yyyy HH:mm")
   .setBackground("#fff2cc")
   .setHorizontalAlignment("center");
}


/**
 * Etape 3 : les montants deviennent de vrais nombres, donc sommables.
 * Relancable : un nombre repasse dans enNombre_() ressort identique.
 *
 * Le format est ecrit #,##0.00 et non « # ##0.00 » : la virgule est le jeton
 * de groupement attendu par Sheets, qui l'affiche ensuite selon la langue de
 * la feuille — donc avec une espace en francais. Un espace ecrit en dur dans
 * le motif n'est pas un jeton reconnu.
 */
function etape3_montants() {
  var f = feuille_();
  var nb = nbLignes_(f);
  var plage = f.getRange(PREMIERE_LIGNE, COL_MONTANT, nb, 1);
  var vals = plage.getValues();
  var convertis = 0;
  for (var i = 0; i < vals.length; i++) {
    var n = enNombre_(vals[i][0]);
    if (n !== null) { vals[i][0] = n; convertis++; } else { vals[i][0] = ""; }
  }
  plage.setValues(vals);
  plage.setNumberFormat('#,##0.00\\ "€"').setHorizontalAlignment("right");
  Logger.log("     " + convertis + " montants sur " + nb + " convertis en nombres.");
}


/**
 * Etape 4 : la colonne « ouvrir », une recherche Drive sur le nom exact du
 * fichier. Aucun identifiant a maintenir, et ca continue de marcher si la
 * piece est deplacee d'un dossier a l'autre.
 *
 * AUCUNE FORMULE. La premiere version posait un HYPERLINK(...) via
 * setFormulas() et toute la colonne affichait #ERROR!. J'avais ecrit ici que
 * « Apps Script attend toujours la syntaxe en-US, donc la virgule » : c'est
 * faux. setFormulas() n'adapte pas le separateur d'arguments, donc une
 * formule a virgules arrive telle quelle dans un classeur en francais, qui
 * attend des points-virgules, et ne sait pas l'analyser — #ERROR! est une
 * erreur de syntaxe, pas de valeur.
 *
 * Plutot que de parier sur le bon separateur, on se passe de formule : le
 * lien est pose directement sur le texte avec setRichTextValues(), et l'URL
 * est construite en JavaScript. Insensible a la langue du classeur, et
 * aucune dependance a ENCODEURL ni a HYPERLINK.
 *
 * Contrepartie assumee : le lien est fige au moment de l'installation. Si un
 * nom de fichier change en colonne J, il faut relancer etape4_liens().
 */
function etape4_liens() {
  var f = feuille_();
  var nb = nbLignes_(f);
  var noms = f.getRange(PREMIERE_LIGNE, COL_FICHIER, nb, 1).getValues();

  // On vide d'abord : ca enleve les #ERROR! laisses par les versions a
  // formule, et ca laisse une trace visible meme si la suite echoue.
  var plage = f.getRange(PREMIERE_LIGNE, COL_LIEN, nb, 1);
  plage.clearContent();
  SpreadsheetApp.flush();

  // Cellule par cellule, et SURTOUT on saute les lignes sans nom de fichier.
  // La version precedente construisait pour elles un
  // newRichTextValue().setText("") : Apps Script refuse un texte riche vide
  // et levait une exception avant la moindre ecriture, ce qui laissait les
  // #ERROR! en place et donnait l'impression que rien ne s'etait passe.
  var poses = 0, sautees = 0, echecs = 0, premiereErreur = "";
  for (var i = 0; i < nb; i++) {
    var nom = String(noms[i][0] || "").trim();
    if (!nom) { sautees++; continue; }
    try {
      var url = "https://drive.google.com/drive/search?q=" + encodeURIComponent(nom);
      f.getRange(PREMIERE_LIGNE + i, COL_LIEN).setRichTextValue(
        SpreadsheetApp.newRichTextValue().setText("ouvrir").setLinkUrl(url).build());
      poses++;
    } catch (err) {
      echecs++;
      if (!premiereErreur) premiereErreur = "ligne " + (PREMIERE_LIGNE + i) +
                                           " : " + err.message;
    }
  }

  plage.setHorizontalAlignment("center").setFontSize(9);
  Logger.log("     " + poses + " liens poses, " + sautees +
             " lignes sans nom de fichier, " + echecs + " echecs.");
  if (echecs) Logger.log("     premiere erreur -> " + premiereErreur);
}


/**
 * Etape 5 : couleur sur l'etat, pour voir les trous sans lire.
 *
 * On REMPLACE les regles au lieu d'ajouter aux existantes. L'ancienne version
 * faisait getConditionalFormatRules() puis push : relancee, elle empilait les
 * memes regles en double, puis en triple. Cette feuille est entierement
 * geree par le script et n'a aucune regle posee a la main, donc tout
 * remplacer est sans perte.
 */
function etape5_couleurs() {
  var f = feuille_();
  var nb = nbLignes_(f);
  var plageEtat = f.getRange(PREMIERE_LIGNE, COL_ETAT, nb, 1);
  var corps     = f.getRange(PREMIERE_LIGNE, 1, nb, NB_COLONNES);

  var couleurs = [
    ["RENOMME",    "#d9ead3", "#274e13"],   // pret a deposer
    ["RECU",       "#cfe2f3", "#0b5394"],   // recu, a renommer
    ["A_VERIFIER", "#fce5cd", "#b45f06"],   // doute
    ["MANQUANT",   "#f4cccc", "#990000"]    // absent
  ];

  var regles = [];
  for (var k = 0; k < couleurs.length; k++) {
    regles.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(couleurs[k][0])
      .setBackground(couleurs[k][1]).setFontColor(couleurs[k][2]).setBold(true)
      .setRanges([plageEtat]).build());
  }
  // une ligne cochee passe en gris : le depose s'efface visuellement
  regles.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=$A" + PREMIERE_LIGNE + "=TRUE")
    .setFontColor("#999999")
    .setRanges([corps]).build());

  f.setConditionalFormatRules(regles);
}


/** Etape 6 : un filtre, pour isoler un etat ou un fournisseur. */
function etape6_filtre() {
  var f = feuille_();
  var filtre = f.getFilter();
  if (filtre) filtre.remove();        // sinon createFilter() leve une erreur
  SpreadsheetApp.flush();
  f.getRange(1, 1, f.getLastRow(), NB_COLONNES).createFilter();
}


/**
 * Déclencheur simple.
 * Coché   → la date et l'heure s'écrivent en B.
 * Décoché → B est effacé, pour qu'un dépôt annulé ne laisse pas de trace.
 * Un horodatage déjà posé n'est jamais réécrit : la première fois fait foi.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var f = e.range.getSheet();
  if (f.getIndex() !== 1) return;
  if (e.range.getColumn() !== COL_DEPOSE) return;
  if (e.range.getRow() < PREMIERE_LIGNE) return;

  for (var i = 0; i < e.range.getNumRows(); i++) {
    var ligne = e.range.getRow() + i;
    var coche = f.getRange(ligne, COL_DEPOSE).getValue() === true;
    var cible = f.getRange(ligne, COL_HORODATAGE);
    if (coche) {
      if (!cible.getValue()) cible.setValue(new Date());
    } else {
      cible.clearContent();
    }
  }
}


/** Récapitulatif dans le journal. À lancer avant de répondre au comptable. */
function recapitulatif() {
  var f = feuille_();
  var nb = nbLignes_(f);
  if (!nb) { Logger.log("Feuille vide."); return; }

  var d = f.getRange(PREMIERE_LIGNE, 1, nb, NB_COLONNES).getValues();
  var parEtat = {}, deposes = 0, totalDepose = 0;

  for (var i = 0; i < d.length; i++) {
    var etat = String(d[i][COL_ETAT - 1]);
    var m = enNombre_(d[i][COL_MONTANT - 1]) || 0;
    if (!parEtat[etat]) parEtat[etat] = [0, 0];
    parEtat[etat][0]++;
    parEtat[etat][1] += m;
    if (d[i][COL_DEPOSE - 1] === true) { deposes++; totalDepose += m; }
  }

  Logger.log("--- TGS 2026 ---");
  for (var e in parEtat) {
    Logger.log(e + " : " + parEtat[e][0] + " piece(s), " +
               parEtat[e][1].toFixed(2) + " EUR");
  }
  Logger.log("Deposees sur le portail : " + deposes + " pour " +
             totalDepose.toFixed(2) + " EUR");
  Logger.log("Restant a deposer : " + (nb - deposes));
}


/**
 * Diagnostic. N'ECRIT RIEN. A lancer si installer() casse encore, pour
 * savoir ce qui est deja en place avant de relancer.
 */
function diagnostic() {
  var f = feuille_();
  Logger.log("Feuille : " + f.getName());
  Logger.log("Langue du classeur : " +
             SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale() +
             " (fr_FR attend le point-virgule dans les formules)");
  Logger.log("Lignes de donnees : " + nbLignes_(f));
  Logger.log("Colonnes utilisees : " + f.getLastColumn());
  Logger.log("Lignes figees : " + f.getFrozenRows() +
             " / colonnes figees : " + f.getFrozenColumns());
  Logger.log("Regles de mise en forme conditionnelle : " +
             f.getConditionalFormatRules().length + " (5 attendues)");
  Logger.log("Filtre pose : " + (f.getFilter() ? "oui" : "non"));
  Logger.log("En-tete L : " + f.getRange(1, COL_LIEN).getValue());

  var a2 = f.getRange(PREMIERE_LIGNE, COL_DEPOSE);
  Logger.log("A" + PREMIERE_LIGNE + " est une case a cocher : " +
             (a2.getDataValidation() ? "oui" : "non") +
             " / valeur : " + a2.getValue());
  var g2 = f.getRange(PREMIERE_LIGNE, COL_MONTANT);
  Logger.log("G" + PREMIERE_LIGNE + " type : " + typeof g2.getValue() +
             " (number attendu) / valeur : " + g2.getValue());
  var l2 = f.getRange(PREMIERE_LIGNE, COL_LIEN);
  Logger.log("L" + PREMIERE_LIGNE + " formule : " +
             (l2.getFormula() || "aucune (normal : lien en texte riche)"));
  Logger.log("L" + PREMIERE_LIGNE + " texte : " + (l2.getValue() || "vide") +
             " / lien : " +
             (l2.getRichTextValue().getLinkUrl() || "AUCUN — relancer etape4_liens()"));
}

/**
 * actualiser.gs — met a jour le Sheet de suivi SANS LE RECREER.
 *
 * POURQUOI CE SCRIPT EXISTE
 * Mon acces au Drive sait renommer et deplacer un fichier, pas ecrire dedans.
 * Resultat : a chaque mise a jour je fabriquais un NOUVEAU Sheet, et il fallait
 * refaire toute la mise en forme. Trois fois de suite. Ce script inverse le
 * sens : je depose un fichier « vue_tgs.csv » sur le Drive, et c est le Sheet
 * qui vient le chercher. La feuille, son adresse, ses couleurs et ses cases a
 * cocher ne changent plus jamais.
 *
 * CE QU IL FAIT
 *   1. trouve le fichier « vue_tgs.csv » le plus recent du Drive
 *   2. releve les cases COCHEES A LA MAIN que le registre ignore encore,
 *      et les rapporte au lieu de les ecraser en silence
 *   3. reecrit les lignes 2 a N des colonnes A a J
 *   4. efface le surplus si la nouvelle vue est plus courte
 *   5. retrie par la colonne Action
 *   6. ecrit un journal dans l onglet « journal »
 *
 * CE QU IL NE FAIT PAS
 * Il ne touche ni a la mise en forme, ni aux cases a cocher elles-memes (la
 * validation reste posee sur A2:A1000), ni a l en-tete, ni au filtre.
 */

var ENTETE = ['Depose TGS', 'Action', 'Cycle', 'Etat', 'Date', 'Fournisseur',
              'Type', 'Montant', 'Reference', 'Periode'];
var NOM_CSV = 'vue_tgs.csv';

function onOpen() {
  // getUi() n existe pas hors contexte interface. On n en fait donc jamais
  // dependre le travail : si le menu ne peut pas se poser, tant pis, la
  // fonction reste appelable depuis l editeur.
  try {
    SpreadsheetApp.getUi()
      .createMenu('TGS')
      .addItem('Actualiser depuis le CSV', 'actualiser')
      .addToUi();
  } catch (e) {}
}

/** L onglet reconnu PAR SON EN-TETE, et jamais par sa position ni son nom.
 *  A1 porte une case a cocher : sa valeur lue est un booleen, pas le libelle.
 *  On compare donc B1:J1 seulement. */
function feuilleDeSuivi(classeur) {
  var trouvees = [];
  var feuilles = classeur.getSheets();
  for (var i = 0; i < feuilles.length; i++) {
    var f = feuilles[i];
    if (f.getLastColumn() < 10) continue;
    var l1 = f.getRange(1, 2, 1, 9).getValues()[0];
    var ok = true;
    for (var j = 0; j < 9; j++) {
      if (String(l1[j]).trim() !== ENTETE[j + 1]) { ok = false; break; }
    }
    if (ok) trouvees.push(f);
  }
  if (trouvees.length !== 1) {
    throw new Error('Il faut EXACTEMENT un onglet dont B1:J1 porte l en-tete '
      + 'attendu. Trouve : ' + trouvees.length + '. Rien n a ete modifie.');
  }
  return trouvees[0];
}

/** La derniere ligne QUI PORTE UNE DONNEE, et non getLastRow().
 *  Les cases a cocher sont posees jusqu a la ligne 1000 : getLastRow() renvoie
 *  donc 1000 meme quand il n y a que 271 pieces, et on croirait avoir 728
 *  lignes a effacer. On lit la colonne F (Fournisseur), qui n est jamais vide
 *  sur une vraie ligne et ne porte aucune mise en forme anticipee. */
function derniereLigne(f) {
  var haut = f.getMaxRows();
  if (haut < 2) return 1;
  var col = f.getRange(2, 6, haut - 1, 1).getValues();
  for (var i = col.length - 1; i >= 0; i--) {
    if (String(col[i][0]).trim() !== '') return i + 2;
  }
  return 1;
}

function montant(txt) {
  var t = String(txt == null ? '' : txt).trim();
  if (!t) return '';
  // « 1353,76 » en France, « 1353.76 » si l export change un jour.
  var n = Number(t.replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? t : n;
}

function actualiser() {
  var classeur = SpreadsheetApp.getActive();
  var f = feuilleDeSuivi(classeur);

  // --- le CSV le plus recent qui porte ce nom
  var it = DriveApp.getFilesByName(NOM_CSV), fichier = null;
  while (it.hasNext()) {
    var g = it.next();
    if (!fichier || g.getLastUpdated() > fichier.getLastUpdated()) fichier = g;
  }
  if (!fichier) {
    throw new Error('Aucun fichier « ' + NOM_CSV + ' » sur le Drive. '
      + 'Rien n a ete modifie.');
  }
  var lignes = Utilities.parseCsv(fichier.getBlob().getDataAsString('UTF-8'));
  if (!lignes.length || String(lignes[0][1]).trim() !== 'Action') {
    throw new Error('Le CSV ne commence pas par l en-tete attendu. '
      + 'Rien n a ete modifie.');
  }
  var data = lignes.slice(1).filter(function (l) {
    return l.join('').trim() !== '';
  });

  // --- AVANT d ecrire : les coches posees a la main que le CSV ignore.
  // C est le canal de retour qui me manquait : quand elle coche une piece
  // que j ignore encore, je veux l apprendre, pas l effacer.
  var finAvant = derniereLigne(f);
  var manuelles = [], inconnues = [];
  if (finAvant > 1) {
    var avant = f.getRange(2, 1, finAvant - 1, 10).getValues();
    var attendu = {};
    for (var k = 0; k < data.length; k++) {
      var cle = String(data[k][8]).trim() || (String(data[k][5]).trim() + '|'
                + String(data[k][7]).trim());
      attendu[cle] = String(data[k][0]).trim().toUpperCase() === 'TRUE';
    }
    for (var r = 0; r < avant.length; r++) {
      var coche = avant[r][0] === true || String(avant[r][0]).toUpperCase() === 'TRUE';
      if (!coche) continue;
      var c = String(avant[r][8]).trim() || (String(avant[r][5]).trim() + '|'
              + String(avant[r][7]).trim());
      // Deux cas, et les DEUX comptent. Ne retenir que le premier laissait
      // passer en silence celui qui m importe le plus.
      var decrit = String(avant[r][5]).trim() + ' ' + String(avant[r][8]).trim()
                   + ' ' + String(avant[r][7]).trim();
      if (attendu[c] === false) {
        // le registre connait la piece et la croit non deposee
        manuelles.push(decrit);
      } else if (attendu[c] === undefined) {
        // le registre ne connait pas du tout cette ligne
        inconnues.push(decrit);
      }
    }
  }

  // --- ecriture
  var sortie = data.map(function (l) {
    return [
      String(l[0]).trim().toUpperCase() === 'TRUE',
      l[1], l[2], l[3], l[4], l[5], l[6], montant(l[7]), l[8], l[9]
    ];
  });
  // --- LES FORMATS AVANT LES VALEURS. Dans l autre ordre, Sheets reinterprete
  // ce qu on vient d ecrire et on ne s en apercoit pas.
  //   I (Reference) en texte brut : « 046 » avait ete lu comme le nombre 46 et
  //   les dix releves LCL 046 a 055 avaient perdu leur zero de tete. C est la
  //   meme faute que le « 053 » qui avait ecrase un vrai releve.
  //   E (Date) en AAAA-MM-JJ : qu elle soit vue comme du texte ou comme une
  //   vraie date, elle s affiche comme le registre l ecrit.
  var basFormat = Math.min(1000, f.getMaxRows());
  if (basFormat > 1) {
    f.getRange(2, 9, basFormat - 1, 1).setNumberFormat('@');
    f.getRange(2, 5, basFormat - 1, 1).setNumberFormat('yyyy-mm-dd');
  }
  var zeros = 0;
  for (var z = 0; z < sortie.length; z++) {
    var ref = String(sortie[z][8]);
    if (/^0\d+$/.test(ref)) zeros++;
  }

  if (sortie.length) {
    f.getRange(2, 1, sortie.length, 10).setValues(sortie);
  }
  // le surplus, si la vue a maigri
  if (finAvant > sortie.length + 1) {
    f.getRange(sortie.length + 2, 1, finAvant - sortie.length - 1, 10)
     .clearContent();
  }

  // --- tri par l action. Le chiffre en tete fait l ordre : ce qui reste a
  // faire remonte, ce qui est fait descend.
  if (sortie.length > 1) {
    f.getRange(2, 1, sortie.length, 10).sort([{ column: 2, ascending: true },
                                              { column: 6, ascending: true }]);
  }

  // --- journal
  var par = {}, somme = {};
  for (var i = 0; i < sortie.length; i++) {
    var a = String(sortie[i][1]).trim();
    par[a] = (par[a] || 0) + 1;
    if (typeof sortie[i][7] === 'number') somme[a] = (somme[a] || 0) + sortie[i][7];
  }
  var txt = ['Actualise le ' + Utilities.formatDate(new Date(),
             Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'),
             'Source : ' + NOM_CSV + ' du ' + Utilities.formatDate(
               fichier.getLastUpdated(), Session.getScriptTimeZone(),
               'dd/MM/yyyy HH:mm'),
             'Lignes ecrites : ' + sortie.length,
             'Lignes effacees en fin de tableau : '
               + Math.max(0, finAvant - sortie.length - 1),
             'Colonne I forcee en texte : ' + zeros + ' reference(s) a zero de '
               + 'tete preservee(s)', ''];
  Object.keys(par).sort().forEach(function (a) {
    txt.push('  ' + a + '  ' + par[a] + ' lignes  '
             + (somme[a] ? somme[a].toFixed(2) + ' EUR' : ''));
  });
  if (manuelles.length) {
    txt.push('', 'ATTENTION — ' + manuelles.length + ' case(s) cochee(s) a la '
             + 'main sur des pieces que le registre croit NON deposees. Elles '
             + 'viennent d etre DECOCHEES par l actualisation. A me signaler '
             + 'pour que le registre les apprenne :');
    manuelles.forEach(function (m) { txt.push('  ' + m); });
  } else {
    txt.push('', 'Aucune case cochee a la main en dehors du registre.');
  }
  if (inconnues.length) {
    txt.push('', 'ATTENTION — ' + inconnues.length + ' ligne(s) cochee(s) que le '
             + 'registre ne connait PAS DU TOUT (ajoutee(s) a la main, ou reste(s) '
             + 'd une vue plus ancienne). Elles viennent d etre ECRASEES. '
             + 'A me signaler :');
    inconnues.forEach(function (m) { txt.push('  ' + m); });
  }

  var j = classeur.getSheetByName('journal') || classeur.insertSheet('journal');
  j.clear();
  j.getRange(1, 1, txt.length, 1).setValues(txt.map(function (x) { return [x]; }));

  try {
    SpreadsheetApp.getUi().alert(txt.join('\n'));
  } catch (e) {}
  return txt.join('\n');
}

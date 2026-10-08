# -*- coding: utf-8 -*-
"""Genere horodatage.gs : colonne K « Depose le ».

DEUX MECANIQUES DANS UN SEUL FICHIER :
  1. remplirDatesPortail() inscrit la VRAIE date de depot lue dans
     l historique du portail, pour tout ce qui est deja depose.
  2. onEdit() horodate la ligne des qu on coche la case en colonne A.

Pourquoi un appariement par REFERENCE et non par numero de ligne : la
feuille a ete triee par Chrome, et elle sera retriee. Un bloc colle a une
position donnee serait faux des le premier tri. Une table reference -> date
reste juste quel que soit l ordre."""
import io, csv, re

L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]

def nz(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())

dates = {}
for l in io.open('historique_portail_statuts.txt', encoding='utf-8'):
    c = [x.strip() for x in l.split('|')]
    if len(c) >= 3 and c[2]:
        dates[c[0]] = c[2]

par_ref, par_couple, sans = {}, {}, []
for p in P:
    if p['cycle'] != 'ENVOYE_TGS':
        continue
    ref = nz(p['reference'])
    cites = [nz(x) for x in re.findall(r"'([^']{6,90})'", p.get('note') or '')]
    mt = nz((p['montant'] or '').replace('.', ' '))
    best = None
    for nom, d in dates.items():
        z = nz(nom)
        mots = [m for m in re.split(r'[^a-z0-9]+',
                p['fournisseur'].lower()) if len(m) >= 4]
        # UNE REFERENCE COURTE NE SUFFIT PAS A ELLE SEULE. Les releves LCL
        # portent « 046 » a « 055 » : trois chiffres qui se retrouvent dans
        # des dizaines de noms de depot. Sous cinq caracteres, on exige en
        # plus que le nom du fournisseur figure dans le nom du depot.
        ok = (len(ref) >= 5 and ref in z) \
             or (3 <= len(ref) < 5 and ref in z
                 and any(m in nom.lower() for m in mots)) \
             or any(c and (c in z or z in c) for c in cites)
        if not ok and not ref and mt and len(mt) >= 4:
            # piece sans reference : fournisseur ET montant dans le nom
            ok = mt in z and any(m in nom.lower() for m in mots)
        if ok and (best is None or d > best):
            best = d
    if not best:
        sans.append(p); continue
    # TOUTE reference non vide sert de cle, meme courte : la recherche dans
    # le Sheet est une egalite exacte sur la colonne I, pas une inclusion.
    # Sans cela les dix releves LCL tombaient sur la meme cle
    # ("LCL-70666", "") et partageaient une seule date.
    if ref:
        par_ref[p['reference'].strip()] = best
    else:
        par_couple[(p['fournisseur'].strip(),
                    (p['montant'] or '').strip())] = best

def bloc(d, larg=70):
    out, cur = [], ''
    for k, v in sorted(d.items()):
        it = '"%s": "%s"' % (k if isinstance(k, str) else k[0] + '|' + k[1], v)
        add = (', ' if cur else '') + it
        if len(cur) + len(add) > larg:
            out.append(cur + ','); cur = it
        else:
            cur += add
    if cur: out.append(cur)
    return out

gs = '''/**
 * Colonne K « Depose le ».
 *
 * remplirDatesPortail() : inscrit la VRAIE date de depot relevee dans
 *   l historique du portail TGS, pour les %d pieces deja deposees.
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
  %s
};

// Les pieces SANS reference — tickets de carburant, courses, relances sans
// numero — se retrouvent par « FOURNISSEUR|MONTANT ».
var DATES_COUPLE = {
  %s
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
    + "\\nDeja remplies : " + deja
    + "\\nCochees sans date : " + vides.length);
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
''' % (len(par_ref) + len(par_couple), "\n  ".join(bloc(par_ref)),
       "\n  ".join(bloc(par_couple)))
io.open('horodatage.gs', 'w', encoding='utf-8').write(gs)
print("dates par reference : %d" % len(par_ref))
print("dates par fournisseur+montant : %d" % len(par_couple))
print("sans date : %d" % len(sans))
for p in sans:
    print("   %-16s %s %s" % (p['fournisseur'], p['reference'] or '(sans ref)',
          p['montant'] or ''))
print("octets : %d / lignes : %d" % (len(gs.encode()), gs.count('\n')))

# -*- coding: utf-8 -*-
"""Genere synchroniser.gs : ajoute au Sheet les pieces du registre qui n y
sont pas. Le diff est fait DANS le Sheet, pas ici : une lecture de Drive ne
rend qu un echantillon des lignes, et conclure dessus serait deviner."""
import io, csv, json
L = [l for l in io.open('registre_2026.csv', encoding='utf-8')
     if l.strip() and not l.startswith('#')]
r = list(csv.reader(L, delimiter=';')); h = r[0]
P = [dict(zip(h, x)) for x in r[1:] if len(x) >= len(h)]

def net(v):
    v = (v or '').strip()
    return '' if v.lower() in ('none', 'nan') else v

def nomfic(p):
    d, f, t = net(p['date_piece']), net(p['fournisseur']), net(p['type'])
    m, ref, per = net(p['montant']), net(p['reference']), net(p['periode'])
    if not (d and f):
        return ''
    bout = [d, f, t or 'FACTURE']
    if m: bout.append(m)
    if ref: bout.append(ref)
    n = '_'.join(bout)
    if per: n += '_P' + per
    return n + '.pdf'

lignes = []
for p in P:
    env = p['cycle'] == 'ENVOYE_TGS'
    # La colonne K « Point de vigilance » reste VIDE sur les lignes
    # ajoutees. Mes notes de registre font 81 Ko a elles seules, et un
    # fichier de cette taille a colle dans Apps Script est exactement ce qui
    # se tronque. Le registre reste la source ; le Sheet est la vue.
    note = ''
    lignes.append({
        "env": env, "etat": net(p['etat']), "date": net(p['date_piece']),
        "four": net(p['fournisseur']), "type": net(p['type']),
        "mt": net(p['montant']), "ref": net(p['reference']),
        "per": net(p['periode']), "nom": nomfic(p), "vig": note,
    })

js = ",\n  ".join(json.dumps(x, ensure_ascii=True, sort_keys=True)
                  for x in lignes)
gs = '''/**
 * synchroniser() — ajoute au Sheet les pieces du registre qui n y sont pas.
 * N AJOUTE QUE DES LIGNES. Ne modifie, ne coche et n efface JAMAIS une
 * ligne existante. Ne touche pas la colonne L (les liens Drive).
 * L onglet est reconnu PAR SES EN-TETES, pas par sa position : le classeur
 * contient trois onglets et le premier s appelle « Untitled ».
 * Genere par gen_sync.py le 08/10/2026 — %d pieces au registre.
 */

var REG = [
  %s
];

var EN_TETE = ["Depose TGS", "Horodatage", "Etat", "Date", "Fournisseur",
               "Type", "Montant", "Reference"];

function nz_(v) {
  return String(v).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function nombre_(v) {
  if (typeof v === "number") return v;
  var s = String(v).replace(/[^0-9,.-]/g, "").replace(",", ".");
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function onglet_() {
  var fs = SpreadsheetApp.getActiveSpreadsheet().getSheets(), ok = [];
  for (var i = 0; i < fs.length; i++) {
    if (fs[i].getLastColumn() < 8) continue;
    var e = fs[i].getRange(1, 1, 1, 8).getValues()[0], bon = true;
    for (var c = 0; c < 8; c++) {
      if (String(e[c]).trim() !== EN_TETE[c]) { bon = false; break; }
    }
    if (bon) ok.push(fs[i]);
  }
  if (ok.length === 0) {
    throw new Error("ARRET : aucun onglet ne porte l en-tete attendue. "
      + "RIEN ECRIT.");
  }
  if (ok.length > 1) {
    throw new Error("ARRET : " + ok.length + " onglets portent la meme "
      + "en-tete. Je ne devine pas lequel. RIEN ECRIT.");
  }
  return ok[0];
}

function synchroniser() {
  var f = onglet_();
  var nb = f.getLastRow() - 1;
  var d = nb > 0 ? f.getRange(2, 1, nb, 8).getValues() : [];

  var refs = {}, couples = {}, reel = 0;
  for (var i = 0; i < nb; i++) {
    var r = nz_(d[i][7]);
    if (r.length >= 4) refs[r] = 1;
    var fo = nz_(d[i][4]), ms = nombre_(d[i][6]);
    if (fo) {
      reel++;
      if (ms !== null) couples[fo + "|" + ms.toFixed(2)] = 1;
    }
  }

  var horo = new Date(), aj = [], sautees = 0;
  for (var k = 0; k < REG.length; k++) {
    var p = REG[k];
    var r = nz_(p.ref), m = nombre_(p.mt);
    var vu = (r.length >= 4 && refs[r])
      || (r.length < 4 && m !== null
          && couples[nz_(p.four) + "|" + m.toFixed(2)]);
    if (vu) { sautees++; continue; }
    aj.push([p.env, p.env ? horo : "", p.etat, p.date, p.four, p.type,
             m === null ? "" : m, p.ref, p.per, p.nom, p.vig]);
    if (r.length >= 4) refs[r] = 1;
    else if (m !== null) couples[nz_(p.four) + "|" + m.toFixed(2)] = 1;
  }

  if (aj.length) {
    f.getRange(nb + 2, 1, aj.length, 11).setValues(aj);
  }

  Logger.log("Onglet : " + f.getName());
  Logger.log("Lignes reelles avant : " + reel + " / registre : " + REG.length);
  Logger.log("Deja presentes : " + sautees + " / AJOUTEES : " + aj.length);
  for (var k = 0; k < aj.length; k++) {
    Logger.log("  + " + aj[k][4] + " " + aj[k][7] + " " + aj[k][6]
      + "  [" + (aj[k][0] ? "cochee" : "non cochee") + "]");
  }
  SpreadsheetApp.getUi().alert("Ajoutees : " + aj.length
    + "\\nDeja presentes : " + sautees + "\\nOnglet : " + f.getName());
}
''' % (len(lignes), js)
io.open('synchroniser.gs', 'w', encoding='utf-8').write(gs)
print("%d pieces, %d octets" % (len(lignes), len(gs.encode())))

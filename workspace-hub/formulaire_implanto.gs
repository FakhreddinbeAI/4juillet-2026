/**
 * CORRECTIONS DU FORMULAIRE « QUESTIONNAIRE DE PRÉ-CONSULTATION IMPLANTOLOGIE » (V3)
 * Projet Apps Script autonome, à exécuter une fois depuis le compte contact@.
 *
 *   formulaire_inventaire()  liste les sections et les questions, ne modifie RIEN
 *   formulaire_appliquer()   applique les corrections ; peut être relancé sans rien doubler
 *
 * Corrections :
 *  1. mention d'information (RGPD) ajoutée à la fin de la description du formulaire
 *  2. « Fumez-vous ? » : l'avertissement passe en description, l'option « ⚠️ Tabagisme… » est retirée
 *  3. les réponses NON à l'âge, à la dent manquante et à « pose d'implant » mènent à une page de fin
 *     (chacune de ces questions termine sa section, seule façon d'avoir le saut de section)
 *  4. case « Consentement » obligatoire après « Demande libre »
 * Reste à la main : passer « pathologies » en « Cases à cocher » (FormApp ne sait pas changer un type).
 *
 * Ne lit ni ne modifie aucune réponse. Aucun titre de question n'est changé (le Workspace Hub les lit).
 */
const FX = {
  // ID d'édition du formulaire (entre /d/ et /edit) : ne donne aucun accès sans le compte du cabinet.
  // Le script n'utilise que FormApp : Google ne demande que l'accès aux formulaires, pas au Drive.
  ID: '1549mkhGTY3qYCLoG50a8gSqHtRyLar5V49eSiR8claA',
  TITRE: 'QUESTIONNAIRE DE PRÉ-CONSULTATION IMPLANTOLOGIE',
  Q: {
    age:     /plus de 18 ans/i,
    patient: /^nom et pr[ée]nom|^nom complet/i,
    dent:    /dent manquante/i,
    implant: /ici pour une pose/i,
    patho:   /pathologies/i,
    tabac:   /fumez/i,
    demande: /demande libre/i
  },
  NON: /^\s*non\b/i,
  OPTION_TABAC_A_RETIRER: /^\s*⚠️|tabagisme\s*>/i,
  AIDE_TABAC: '⚠️ Au-delà de 10 cigarettes par jour, le risque d\'échec de l\'implant est multiplié par 3. Un sevrage est recommandé.',
  MARQUE_RGPD: '🔒 Vos données',
  RGPD: '🔒 Vos données — Ce questionnaire est destiné au Cabinet d\'Implantologie de Legé (SELARL TIGHZA, 1 rue de Chambord, 44650 Legé). ' +
        'Vos réponses, y compris les informations de santé, servent uniquement à évaluer si une consultation d\'implantologie est adaptée ' +
        'et à vous recontacter. Elles sont lues par le praticien et l\'équipe du cabinet, hébergées sur Google Workspace, et conservées ' +
        '12 mois si aucune consultation n\'a lieu (sinon dans votre dossier patient). Vous pouvez y accéder, les rectifier ou demander ' +
        'leur suppression en écrivant à contact@implantologielege.com, et saisir la CNIL (cnil.fr).',
  FIN_TITRE: 'Ce questionnaire n\'est pas adapté à votre demande',
  FIN_TEXTE: 'Ce questionnaire concerne uniquement le remplacement de dents manquantes par des implants. Pour une consultation, ' +
             'des soins ou un détartrage, prenez rendez-vous avec votre dentiste ou en consultation générale sur Doctolib. ' +
             'Merci d\'avoir pris le temps de répondre.',
  SECTIONS: { age: 'Vos coordonnées', dent: 'Votre demande', implant: 'Votre santé et votre situation' },
  CONSENTEMENT: 'Consentement',
  CONSENTEMENT_OPTION: 'J\'accepte que le cabinet utilise mes réponses pour évaluer ma demande et me recontacter.'
};

/* ---------- POINTS D'ENTRÉE ---------- */

function formulaire_inventaire() {
  const form = fx_formulaire_();
  Logger.log('Formulaire : ' + form.getTitle() + ' — ' + form.getEditUrl());
  Logger.log('Description : ' + (form.getDescription().indexOf(FX.MARQUE_RGPD) > -1 ? 'contient déjà la mention RGPD' : 'sans mention RGPD'));
  fx_lister_(form);
  const r = fx_reperer_(form);
  Logger.log('Contrôles : ' + (r.erreurs.length ? '⚠️ ' + r.erreurs.join(' | ') : 'OK, formulaire_appliquer() peut tourner'));
}

function formulaire_appliquer() {
  const form = fx_formulaire_();
  const r = fx_reperer_(form);
  if (r.erreurs.length) throw new Error('Rien n\'a été modifié : ' + r.erreurs.join(' | '));
  const T = FormApp.ItemType;
  const fait = [];

  // 1. Mention d'information
  if (form.getDescription().indexOf(FX.MARQUE_RGPD) < 0) {
    form.setDescription((form.getDescription() ? form.getDescription() + '\n\n' : '') + FX.RGPD);
    fait.push('mention RGPD ajoutée');
  } else fait.push('mention RGPD déjà là');

  // 2. Tabac
  const tabac = r.tabac.asMultipleChoiceItem();
  const avant = tabac.getChoices();
  const garder = avant.filter(function (c) { return !FX.OPTION_TABAC_A_RETIRER.test(c.getValue()); });
  if (garder.length < avant.length) {
    tabac.setChoices(garder.map(function (c) { return tabac.createChoice(c.getValue()); }));
    fait.push('option d\'avertissement tabac retirée');
  }
  if (tabac.getHelpText().indexOf('sevrage') < 0) { tabac.setHelpText(FX.AIDE_TABAC); fait.push('avertissement tabac en description'); }

  // 3a. Chaque question « STOP » termine sa section (coupure juste après, si absente)
  ['age', 'dent', 'implant'].forEach(function (k) {
    if (fx_coupureApres_(form, r[k], FX.SECTIONS[k])) fait.push('nouvelle section « ' + FX.SECTIONS[k] + ' » après la question ' + k);
  });

  // 4. Consentement, juste après « Demande libre »
  if (!form.getItems(T.CHECKBOX).some(function (it) { return it.getTitle() === FX.CONSENTEMENT; })) {
    const c = form.addCheckboxItem().setTitle(FX.CONSENTEMENT).setChoiceValues([FX.CONSENTEMENT_OPTION]).setRequired(true);
    form.moveItem(c.getIndex(), r.demande.getIndex() + 1);
    fait.push('case Consentement ajoutée après « Demande libre »');
  }

  // 3b. Page de fin, toujours en dernier. Le « aller à » d'un saut de section règle la sortie de la section
  //     QUI LE PRÉCÈDE : SUBMIT ici = la dernière section normale envoie le formulaire, les patients éligibles
  //     ne voient jamais la page de fin. Après la page de fin, le formulaire s'envoie (c'est la dernière).
  let fin = form.getItems(T.PAGE_BREAK).filter(function (it) { return it.getTitle() === FX.FIN_TITRE; })[0];
  if (!fin) {
    fin = form.addPageBreakItem().setTitle(FX.FIN_TITRE).setHelpText(FX.FIN_TEXTE);
    fait.push('page de fin ajoutée');
  } else if (fin.getIndex() !== form.getItems().length - 1) {
    form.moveItem(fin.getIndex(), form.getItems().length - 1);
  }
  fin = fin.asPageBreakItem();
  fin.setGoToPage(FormApp.PageNavigationType.SUBMIT);
  fait.push('après la dernière section normale : « Envoyer le formulaire »');

  // 3d. NON → page de fin ; toute autre réponse → section suivante
  ['age', 'dent', 'implant'].forEach(function (k) {
    const mc = r[k].asMultipleChoiceItem();
    let nbNon = 0;
    mc.setChoices(mc.getChoices().map(function (c) {
      if (FX.NON.test(c.getValue())) { nbNon++; return mc.createChoice(c.getValue(), fin); }
      return mc.createChoice(c.getValue(), FormApp.PageNavigationType.CONTINUE);
    }));
    fait.push(k + ' : ' + (nbNon ? nbNon + ' réponse(s) NON → page de fin' : '⚠️ aucune option NON trouvée, rien à rediriger'));
  });

  fait.forEach(function (x) { Logger.log('✓ ' + x); });
  Logger.log('À FAIRE À LA MAIN : question « pathologies » → type « Cases à cocher » (menu du type, à droite du titre).');
  Logger.log('--- Structure après corrections ---');
  fx_lister_(form);
}

/* ---------- OUTILS ---------- */

function fx_formulaire_() {
  const form = FormApp.openById(FX.ID);
  if (form.getTitle().trim() !== FX.TITRE) throw new Error('Ce n\'est pas le bon formulaire : « ' + form.getTitle() + ' »');
  return form;
}

/** Repère les questions utiles et vérifie l'ordre attendu, avant toute modification. */
function fx_reperer_(form) {
  const T = FormApp.ItemType, r = { erreurs: [] };
  const items = form.getItems();
  Object.keys(FX.Q).forEach(function (k) {
    const trouves = items.filter(function (it) { return it.getType() !== T.PAGE_BREAK && FX.Q[k].test(String(it.getTitle()).trim()); });
    if (trouves.length !== 1) { r.erreurs.push(trouves.length + ' question(s) « ' + k + ' »'); return; }
    r[k] = trouves[0];
  });
  if (r.erreurs.length) return r;
  ['age', 'dent', 'implant', 'tabac'].forEach(function (k) {
    if (r[k].getType() !== T.MULTIPLE_CHOICE) r.erreurs.push('« ' + k + ' » n\'est pas à choix multiples (' + r[k].getType() + ')');
  });
  const i = function (k) { return r[k].getIndex(); };
  if (!(i('age') < i('dent') && i('dent') < i('implant'))) r.erreurs.push('ordre inattendu : âge, puis dent manquante, puis implant');
  if (!(i('patient') < i('dent'))) r.erreurs.push('« Nom et Prénom » doit venir avant « dent manquante » (coordonnées des patients à réorienter)');
  if (!(i('implant') < i('demande'))) r.erreurs.push('« Demande libre » doit venir après « implant »');
  return r;
}

/** Insère une nouvelle section juste après la question, sauf si une section y commence déjà. */
function fx_coupureApres_(form, item, titre) {
  const items = form.getItems(), j = item.getIndex() + 1;
  if (j < items.length && items[j].getType() === FormApp.ItemType.PAGE_BREAK) return false;
  const pb = form.addPageBreakItem().setTitle(titre);
  form.moveItem(pb.getIndex(), j);
  return true;
}

function fx_lister_(form) {
  const T = FormApp.ItemType;
  let section = 1;
  Logger.log('== Section 1 (début du formulaire)');
  form.getItems().forEach(function (it) {
    const t = it.getType();
    if (t === T.PAGE_BREAK) {
      const pb = it.asPageBreakItem();
      const nav = pb.getPageNavigationType();
      Logger.log('== Section ' + (++section) + ' : ' + it.getTitle() + (nav && String(nav) !== 'CONTINUE' ? '  [après la section PRÉCÉDENTE → ' + nav + (pb.getGoToPage() ? ' « ' + pb.getGoToPage().getTitle() + ' »' : '') + ']' : ''));
      return;
    }
    let ligne = '  #' + it.getIndex() + ' [' + t + ']' + (fx_requis_(it) ? ' (obligatoire)' : '') + ' ' + it.getTitle();
    if (t === T.MULTIPLE_CHOICE) {
      ligne += '\n      choix : ' + it.asMultipleChoiceItem().getChoices().map(function (c) {
        const nav = c.getPageNavigationType();
        return c.getValue() + (c.getGotoPage() ? ' → « ' + c.getGotoPage().getTitle() + ' »' : nav && String(nav) !== 'CONTINUE' ? ' → ' + nav : '');
      }).join(' | ');
    }
    Logger.log(ligne);
  });
}

function fx_requis_(it) {
  try {
    const conv = { MULTIPLE_CHOICE: 'asMultipleChoiceItem', CHECKBOX: 'asCheckboxItem', TEXT: 'asTextItem', PARAGRAPH_TEXT: 'asParagraphTextItem',
                   LIST: 'asListItem', DATE: 'asDateItem', SCALE: 'asScaleItem', GRID: 'asGridItem', CHECKBOX_GRID: 'asCheckboxGridItem' }[String(it.getType())];
    return conv ? it[conv]().isRequired() : false;
  } catch (e) { return false; }
}

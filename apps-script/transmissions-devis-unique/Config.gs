/**
 * Config.gs — configuration de CE projet, utilisée quand la propriété de script du même nom
 * n'est pas définie. Depuis le 20/10/2026, une seule application sert les deux classeurs :
 * le menu « Filière » en haut de l'application choisit Implanto ou Autres devis.
 * Tout le monde se connecte avec le compte du cabinet ; déploiement en accès « Moi uniquement ».
 */
var API_CONFIG = {
  SPREADSHEET_ID: '1ZNutOD1xstRfXWslXduR4OGusxcW2Eq05iynA6juXYU',          // Transmissions devis — Implanto
  SPREADSHEET_ID_AUTRES: '1kQyAve0QEr4tou_xGV6d6UG3zwvRL7dE5DQ-yiKYZ1k',   // Transmissions devis — Autres devis
  FILIERE: 'implanto',
  AGENDA_ID: 'contact@implantologielege.com',
  COMPTES_AUTORISES: 'contact@implantologielege.com'
};

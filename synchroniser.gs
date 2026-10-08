/**
 * synchroniser() — ajoute au Sheet les pieces du registre qui n y sont pas.
 * N AJOUTE QUE DES LIGNES. Ne modifie, ne coche et n efface JAMAIS une
 * ligne existante. Ne touche pas la colonne L (les liens Drive).
 * L onglet est reconnu PAR SES EN-TETES, pas par sa position : le classeur
 * contient trois onglets et le premier s appelle « Untitled ».
 * Genere par gen_sync.py le 08/10/2026 — 172 pieces au registre.
 */

var REG = [
  {"date": "2026-07-29", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-07-29_COFICA_FACTURE_1353.76_750004820769_P2026-01-05-au-2026-02-04.pdf", "per": "2026-01-05-au-2026-02-04", "ref": "750004820769", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-29", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-07-29_COFICA_FACTURE_1353.76_750004820768_P2026-02-05-au-2026-03-04.pdf", "per": "2026-02-05-au-2026-03-04", "ref": "750004820768", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-28", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-07-28_COFICA_FACTURE_1353.76_750004815707_P2026-08-05-au-2026-09-04.pdf", "per": "2026-08-05-au-2026-09-04", "ref": "750004815707", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-25", "env": false, "etat": "MANQUANT", "four": "COFICA", "mt": "1353.76", "nom": "2026-02-25_COFICA_FACTURE_1353.76_P2026-03-05-au-2026-04-04.pdf", "per": "2026-03-05-au-2026-04-04", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-27", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-03-27_COFICA_FACTURE_1353.76_750004747696_P2026-04-05-au-2026-05-04.pdf", "per": "2026-04-05-au-2026-05-04", "ref": "750004747696", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-24", "env": false, "etat": "MANQUANT", "four": "COFICA", "mt": "1353.76", "nom": "2026-04-24_COFICA_FACTURE_1353.76_P2026-05-05-au-2026-06-04.pdf", "per": "2026-05-05-au-2026-06-04", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-28", "env": false, "etat": "RECU", "four": "COFICA", "mt": "1353.76", "nom": "2026-05-28_COFICA_FACTURE_1353.76_750004781830_P2026-06-05-au-2026-07-04.pdf", "per": "2026-06-05-au-2026-07-04", "ref": "750004781830", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-26", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-06-26_COFICA_FACTURE_1353.76_750004798493_P2026-07-05-au-2026-08-04.pdf", "per": "2026-07-05-au-2026-08-04", "ref": "750004798493", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-31", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-07-31_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0013852502_P2026-07-01-au-2026-07-31.pdf", "per": "2026-07-01-au-2026-07-31", "ref": "GCFRD0013852502", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-31", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-08-31_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0014124467_P2026-08-01-au-2026-08-31.pdf", "per": "2026-08-01-au-2026-08-31", "ref": "GCFRD0014124467", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-31", "env": true, "etat": "DEPOSEE", "four": "GOOGLE-WORKSPACE", "mt": "87.41", "nom": "2026-01-31_GOOGLE-WORKSPACE_FACTURE_87.41_GCFRD0011667476_P2026-01-01-au-2026-01-31.pdf", "per": "2026-01-01-au-2026-01-31", "ref": "GCFRD0011667476", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-28", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-02-28_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0011894244_P2026-02-01-au-2026-02-28.pdf", "per": "2026-02-01-au-2026-02-28", "ref": "GCFRD0011894244", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-31", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-03-31_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0012241282_P2026-03-01-au-2026-03-31.pdf", "per": "2026-03-01-au-2026-03-31", "ref": "GCFRD0012241282", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-30", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-04-30_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0012563912_P2026-04-01-au-2026-04-30.pdf", "per": "2026-04-01-au-2026-04-30", "ref": "GCFRD0012563912", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-31", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-05-31_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0013126604_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "GCFRD0013126604", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-30", "env": false, "etat": "RENOMME", "four": "GOOGLE-WORKSPACE", "mt": "91.08", "nom": "2026-06-30_GOOGLE-WORKSPACE_FACTURE_91.08_GCFRD0013433498_P2026-06-01-au-2026-06-30.pdf", "per": "2026-06-01-au-2026-06-30", "ref": "GCFRD0013433498", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-30", "env": true, "etat": "DEPOSEE", "four": "GOOGLE-WORKSPACE", "mt": "105.48", "nom": "2026-09-30_GOOGLE-WORKSPACE_FACTURE_105.48_GCFRD0014580910_P2026-09-01-au-2026-09-30.pdf", "per": "2026-09-01-au-2026-09-30", "ref": "GCFRD0014580910", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-07-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0007_P2026-07-13-au-2026-08-13.pdf", "per": "2026-07-13-au-2026-08-13", "ref": "HKTDOLB4-0007", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-13", "env": false, "etat": "RENOMME", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-07-13_ANTHROPIC_RECU_108.00_2842-1119-2935.pdf", "per": "", "ref": "2842-1119-2935", "type": "RECU", "vig": ""},
  {"date": "2026-08-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-08-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0008_P2026-08-13-au-2026-09-13.pdf", "per": "2026-08-13-au-2026-09-13", "ref": "HKTDOLB4-0008", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-08-13_ANTHROPIC_RECU_108.00_2240-8167-3237.pdf", "per": "", "ref": "2240-8167-3237", "type": "RECU", "vig": ""},
  {"date": "2026-09-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-09-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0009_P2026-09-13-au-2026-10-13.pdf", "per": "2026-09-13-au-2026-10-13", "ref": "HKTDOLB4-0009", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-09", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "21.60", "nom": "2026-02-09_ANTHROPIC_FACTURE_21.60_HKTDOLB4-0001_P2026-02-09-au-2026-03-09.pdf", "per": "2026-02-09-au-2026-03-09", "ref": "HKTDOLB4-0001", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-09", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "21.60", "nom": "2026-03-09_ANTHROPIC_FACTURE_21.60_HKTDOLB4-0002_P2026-03-09-au-2026-04-09.pdf", "per": "2026-03-09-au-2026-04-09", "ref": "HKTDOLB4-0002", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-09", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "21.60", "nom": "2026-04-09_ANTHROPIC_FACTURE_21.60_HKTDOLB4-0003_P2026-04-09-au-2026-05-09.pdf", "per": "2026-04-09-au-2026-05-09", "ref": "HKTDOLB4-0003", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "88.69", "nom": "2026-04-13_ANTHROPIC_FACTURE_88.69_HKTDOLB4-0004_P2026-04-13-au-2026-05-13.pdf", "per": "2026-04-13-au-2026-05-13", "ref": "HKTDOLB4-0004", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-05-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0005_P2026-05-13-au-2026-06-13.pdf", "per": "2026-05-13-au-2026-06-13", "ref": "HKTDOLB4-0005", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-13", "env": true, "etat": "DEPOSEE", "four": "ANTHROPIC", "mt": "108.00", "nom": "2026-06-13_ANTHROPIC_FACTURE_108.00_HKTDOLB4-0006_P2026-06-13-au-2026-07-13.pdf", "per": "2026-06-13-au-2026-07-13", "ref": "HKTDOLB4-0006", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-01", "env": false, "etat": "RENOMME", "four": "ARGOAT", "mt": "45.00", "nom": "2026-04-01_ARGOAT_FACTURE_45.00_ARG12031_P2026-03-01-au-2026-03-31.pdf", "per": "2026-03-01-au-2026-03-31", "ref": "ARG12031", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-01", "env": false, "etat": "RENOMME", "four": "ARGOAT", "mt": "38.00", "nom": "2026-06-01_ARGOAT_FACTURE_38.00_ARG12869_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "ARG12869", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-01", "env": false, "etat": "RENOMME", "four": "ARGOAT", "mt": "32.00", "nom": "2026-07-01_ARGOAT_FACTURE_32.00_ARG13312_P2026-06-01-au-2026-06-30.pdf", "per": "2026-06-01-au-2026-06-30", "ref": "ARG13312", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-31", "env": false, "etat": "RENOMME", "four": "ARGOAT", "mt": "45.00", "nom": "2026-07-31_ARGOAT_FACTURE_45.00_ARG13747_P2026-07-01-au-2026-07-31.pdf", "per": "2026-07-01-au-2026-07-31", "ref": "ARG13747", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "ARGOAT", "mt": "", "nom": "", "per": "2026-04-01-au-2026-04-30", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-16", "env": false, "etat": "RECU", "four": "MUTUALEASE", "mt": "182.30", "nom": "2026-03-16_MUTUALEASE_FACTURE_182.30_020-FL-32158803_P2026-04-01-au-2026-06-30.pdf", "per": "2026-04-01-au-2026-06-30", "ref": "020-FL-32158803", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-30", "env": true, "etat": "DEPOSEE", "four": "MUTUALEASE", "mt": "", "nom": "2026-06-30_MUTUALEASE_FACTURE_020-FC-01179765.pdf", "per": "", "ref": "020-FC-01179765", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "CMV-MEDIFORCE", "mt": "80.00", "nom": "", "per": "2026-01-01-au-2026-01-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-01", "env": false, "etat": "MANQUANT", "four": "ARIES", "mt": "990.00", "nom": "2026-01-01_ARIES_FACTURE_990.00_P2026-01-01-au-2026-01-31.pdf", "per": "2026-01-01-au-2026-01-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-01", "env": true, "etat": "DEPOSEE", "four": "ARIES", "mt": "990.00", "nom": "2026-02-01_ARIES_FACTURE_990.00_F-2026-02-000008793_P2026-02-01-au-2026-02-28.pdf", "per": "2026-02-01-au-2026-02-28", "ref": "F-2026-02-000008793", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-01", "env": true, "etat": "DEPOSEE", "four": "ARIES", "mt": "990.00", "nom": "2026-03-01_ARIES_FACTURE_990.00_F-2026-03-000009276_P2026-03-01-au-2026-03-31.pdf", "per": "2026-03-01-au-2026-03-31", "ref": "F-2026-03-000009276", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-30", "env": true, "etat": "DEPOSEE", "four": "ARIES", "mt": "990.00", "nom": "2026-03-30_ARIES_FACTURE_990.00_F-2026-03-000009829_P2026-04-01-au-2026-04-30.pdf", "per": "2026-04-01-au-2026-04-30", "ref": "F-2026-03-000009829", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-30", "env": true, "etat": "DEPOSEE", "four": "ARIES", "mt": "990.00", "nom": "2026-04-30_ARIES_FACTURE_990.00_F-2026-04-0000010320_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "F-2026-04-0000010320", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-31", "env": true, "etat": "DEPOSEE", "four": "ARIES", "mt": "990.00", "nom": "2026-05-31_ARIES_FACTURE_990.00_INV-2026-01345_P2026-06-01-au-2026-06-30.pdf", "per": "2026-06-01-au-2026-06-30", "ref": "INV-2026-01345", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "SANS OBJET", "four": "ARIES", "mt": "990.00", "nom": "", "per": "2026-07-01-au-2026-07-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "SANS OBJET", "four": "ARIES", "mt": "990.00", "nom": "", "per": "2026-08-01-au-2026-08-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-03", "env": false, "etat": "RECU", "four": "MACSF", "mt": "229.39", "nom": "2026-06-03_MACSF_ATTESTATION_229.39_7904376-52_P2026-07-01-au-2027-06-30.pdf", "per": "2026-07-01-au-2027-06-30", "ref": "7904376-52", "type": "ATTESTATION", "vig": ""},
  {"date": "2026-08-31", "env": false, "etat": "RENOMME", "four": "ADF", "mt": "389.00", "nom": "2026-08-31_ADF_FACTURE_389.00_C-30800_P2026-11-24-au-2026-11-28.pdf", "per": "2026-11-24-au-2026-11-28", "ref": "C-30800", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-01-06_CANVA_FACTURE_12.00_04753-52817600-1_P2026-01-01-au-2026-01-31.pdf", "per": "2026-01-01-au-2026-01-31", "ref": "04753-52817600-1", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-02-06_CANVA_FACTURE_12.00_04784-61986565-1_P2026-02-01-au-2026-02-28.pdf", "per": "2026-02-01-au-2026-02-28", "ref": "04784-61986565-1", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-03-06_CANVA_FACTURE_12.00_04812-63634805-1_P2026-03-01-au-2026-03-31.pdf", "per": "2026-03-01-au-2026-03-31", "ref": "04812-63634805-1", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-04-06_CANVA_FACTURE_12.00_04843-58576697-1_P2026-04-01-au-2026-04-30.pdf", "per": "2026-04-01-au-2026-04-30", "ref": "04843-58576697-1", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-05-06_CANVA_FACTURE_12.00_04873-50448095-1_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "04873-50448095-1", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-06", "env": true, "etat": "DEPOSEE", "four": "CANVA", "mt": "12.00", "nom": "2026-06-06_CANVA_FACTURE_12.00_04904-74747500-1_P2026-06-01-au-2026-06-30.pdf", "per": "2026-06-01-au-2026-06-30", "ref": "04904-74747500-1", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "SANS OBJET", "four": "CANVA", "mt": "12.00", "nom": "", "per": "2026-07-01-au-2026-07-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "SANS OBJET", "four": "CANVA", "mt": "12.00", "nom": "", "per": "2026-08-01-au-2026-08-31", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "SANS OBJET", "four": "CANVA", "mt": "12.00", "nom": "", "per": "2026-09-01-au-2026-09-30", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-30", "env": true, "etat": "DEPOSEE", "four": "LA-FRAISE", "mt": "119.00", "nom": "2026-06-30_LA-FRAISE_FACTURE_119.00_F-2026-06300142.pdf", "per": "", "ref": "F-2026-06300142", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-17", "env": true, "etat": "DEPOSEE", "four": "MADE-IN-LABS", "mt": "8316.98", "nom": "2026-08-17_MADE-IN-LABS_RELANCE_8316.98.pdf", "per": "", "ref": "", "type": "RELANCE", "vig": ""},
  {"date": "2026-05-31", "env": false, "etat": "RECU", "four": "MADE-IN-LABS", "mt": "3522.72", "nom": "2026-05-31_MADE-IN-LABS_FACTURE_3522.72_35684_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "35684", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "MANQUANT", "four": "MADE-IN-LABS", "mt": "3089.02", "nom": "", "per": "2026-06-01-au-2026-06-30", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-31", "env": false, "etat": "RECU", "four": "MADE-IN-LABS", "mt": "1705.24", "nom": "2026-07-31_MADE-IN-LABS_FACTURE_1705.24_36187_P2026-07-01-au-2026-07-31.pdf", "per": "2026-07-01-au-2026-07-31", "ref": "36187", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-27", "env": true, "etat": "DEPOSEE", "four": "SEPTODONT", "mt": "", "nom": "2026-08-27_SEPTODONT_RELANCE.pdf", "per": "", "ref": "", "type": "RELANCE", "vig": ""},
  {"date": "2026-07-28", "env": false, "etat": "RENOMME", "four": "GACD", "mt": "548.73", "nom": "2026-07-28_GACD_FACTURE_548.73_2402391923.pdf", "per": "", "ref": "2402391923", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-29", "env": true, "etat": "DEPOSEE", "four": "GACD", "mt": "716.16", "nom": "2026-08-29_GACD_FACTURE_716.16_2402408753.pdf", "per": "", "ref": "2402408753", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-01", "env": true, "etat": "DEPOSEE", "four": "GACD", "mt": "61.15", "nom": "2026-09-01_GACD_FACTURE_61.15_2402410567.pdf", "per": "", "ref": "2402410567", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-04", "env": true, "etat": "DEPOSEE", "four": "GACD", "mt": "645.59", "nom": "2026-09-04_GACD_FACTURE_645.59_2402412732.pdf", "per": "", "ref": "2402412732", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "GACD", "mt": "", "nom": "", "per": "2026-01-01-au-2026-06-30", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-04", "env": true, "etat": "DEPOSEE", "four": "NEOHM", "mt": "1132.80", "nom": "2026-06-04_NEOHM_FACTURE_1132.80_FR159171.pdf", "per": "", "ref": "FR159171", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-04", "env": true, "etat": "DEPOSEE", "four": "NOTRE-ACCORD", "mt": "345.48", "nom": "2026-02-04_NOTRE-ACCORD_FACTURE_345.48_F-20260204-4412.pdf", "per": "", "ref": "F-20260204-4412", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-04", "env": true, "etat": "DEPOSEE", "four": "NOTRE-ACCORD", "mt": "483.68", "nom": "2026-03-04_NOTRE-ACCORD_FACTURE_483.68_F-20260304-4565.pdf", "per": "", "ref": "F-20260304-4565", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-06", "env": false, "etat": "RENOMME", "four": "CPAM-VENDEE", "mt": "96.75", "nom": "2026-08-06_CPAM-VENDEE_INDU_96.75_2606534061.pdf", "per": "", "ref": "2606534061", "type": "INDU", "vig": ""},
  {"date": "2026-08-07", "env": false, "etat": "RENOMME", "four": "URSSAF", "mt": "", "nom": "2026-08-07_URSSAF_AFFILIATION_527258240324.pdf", "per": "", "ref": "527258240324", "type": "AFFILIATION", "vig": ""},
  {"date": "", "env": false, "etat": "A_VENIR", "four": "MACSF", "mt": "", "nom": "", "per": "2026-01-01-au-2026-12-31", "ref": "P15-001-ou-F0015", "type": "ATTESTATION", "vig": ""},
  {"date": "2026-01-31", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-01-31_BNP-2112_RELEVE_26001_P2026-01-01-au-2026-01-31.pdf", "per": "2026-01-01-au-2026-01-31", "ref": "26001", "type": "RELEVE", "vig": ""},
  {"date": "2026-02-28", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-02-28_BNP-2112_RELEVE_26002_P2026-02-01-au-2026-02-28.pdf", "per": "2026-02-01-au-2026-02-28", "ref": "26002", "type": "RELEVE", "vig": ""},
  {"date": "2026-03-31", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-03-31_BNP-2112_RELEVE_26003_P2026-03-01-au-2026-03-31.pdf", "per": "2026-03-01-au-2026-03-31", "ref": "26003", "type": "RELEVE", "vig": ""},
  {"date": "2026-04-30", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-04-30_BNP-2112_RELEVE_26004_P2026-04-01-au-2026-04-30.pdf", "per": "2026-04-01-au-2026-04-30", "ref": "26004", "type": "RELEVE", "vig": ""},
  {"date": "2026-05-31", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-05-31_BNP-2112_RELEVE_26005_P2026-05-01-au-2026-05-31.pdf", "per": "2026-05-01-au-2026-05-31", "ref": "26005", "type": "RELEVE", "vig": ""},
  {"date": "2026-06-30", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-06-30_BNP-2112_RELEVE_26006_P2026-06-01-au-2026-06-30.pdf", "per": "2026-06-01-au-2026-06-30", "ref": "26006", "type": "RELEVE", "vig": ""},
  {"date": "2026-07-31", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-07-31_BNP-2112_RELEVE_26007_P2026-07-01-au-2026-07-31.pdf", "per": "2026-07-01-au-2026-07-31", "ref": "26007", "type": "RELEVE", "vig": ""},
  {"date": "2026-08-31", "env": true, "etat": "DEPOSEE", "four": "BNP-2112", "mt": "", "nom": "2026-08-31_BNP-2112_RELEVE_26008_P2026-08-01-au-2026-08-31.pdf", "per": "2026-08-01-au-2026-08-31", "ref": "26008", "type": "RELEVE", "vig": ""},
  {"date": "2026-05-26", "env": true, "etat": "DEPOSEE", "four": "STRAUMANN", "mt": "100.74", "nom": "2026-05-26_STRAUMANN_FACTURE_100.74_9060107688.pdf", "per": "", "ref": "9060107688", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-16", "env": false, "etat": "MANQUANT", "four": "STRAUMANN", "mt": "100.74", "nom": "2026-06-16_STRAUMANN_FACTURE_100.74_9060125749.pdf", "per": "", "ref": "9060125749", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-30", "env": false, "etat": "RECU", "four": "STRAUMANN", "mt": "88.80", "nom": "2026-06-30_STRAUMANN_AVOIR_88.80_9060136144.pdf", "per": "", "ref": "9060136144", "type": "AVOIR", "vig": ""},
  {"date": "2026-07-24", "env": false, "etat": "RECU", "four": "STRAUMANN", "mt": "112.68", "nom": "2026-07-24_STRAUMANN_RELANCE_112.68.pdf", "per": "", "ref": "", "type": "RELANCE", "vig": ""},
  {"date": "2026-07-23", "env": false, "etat": "RECU", "four": "ONCD", "mt": "462.00", "nom": "2026-07-23_ONCD_RELANCE_462.00_262785280708_P2026-01-01-au-2026-12-31.pdf", "per": "2026-01-01-au-2026-12-31", "ref": "262785280708", "type": "RELANCE", "vig": ""},
  {"date": "2026-07-22", "env": true, "etat": "DEPOSEE", "four": "ANTAI", "mt": "50.00", "nom": "2026-07-22_ANTAI_FACTURE_50.00_21440109300015-26-2-185-023-033.pdf", "per": "", "ref": "21440109300015-26-2-185-023-033", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-29", "env": true, "etat": "DEPOSEE", "four": "LA-CASCADE", "mt": "69.20", "nom": "2026-07-29_LA-CASCADE_TICKET_69.20_A167.pdf", "per": "", "ref": "A167", "type": "TICKET", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "A-IDENTIFIER", "mt": "", "nom": "", "per": "", "ref": "Scan2026-07-30_121631", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "A-IDENTIFIER", "mt": "", "nom": "", "per": "", "ref": "Scan2026-07-30_121442", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-16", "env": true, "etat": "DEPOSEE", "four": "DGFIP", "mt": "22.00", "nom": "2026-02-16_DGFIP_RELANCE_22.00_AMR-2026-01-05471.pdf", "per": "", "ref": "AMR-2026-01-05471", "type": "RELANCE", "vig": ""},
  {"date": "2026-05-07", "env": false, "etat": "RENOMME", "four": "NOTE-HONORAIRES", "mt": "232.00", "nom": "2026-05-07_NOTE-HONORAIRES_FACTURE_232.00_2825.pdf", "per": "", "ref": "2825", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-18", "env": false, "etat": "RECU", "four": "ROTEC", "mt": "1004.50", "nom": "2026-02-18_ROTEC_RELANCE_1004.50_C012667.pdf", "per": "", "ref": "C012667", "type": "RELANCE", "vig": ""},
  {"date": "2025-11-13", "env": true, "etat": "DEPOSEE", "four": "DGFIP-AMENDES", "mt": "75.00", "nom": "2025-11-13_DGFIP-AMENDES_FACTURE_75.00_0440-1601-1250-4730-11.pdf", "per": "", "ref": "0440-1601-1250-4730-11", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-30", "env": true, "etat": "DEPOSEE", "four": "LA-FRAISE", "mt": "119.00", "nom": "2026-09-30_LA-FRAISE_FACTURE_119.00_F-2026-093001309_P2026-09-30-au-2026-10-30.pdf", "per": "2026-09-30-au-2026-10-30", "ref": "F-2026-093001309", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-30", "env": true, "etat": "DEPOSEE", "four": "EXECOM", "mt": "334.80", "nom": "2026-06-30_EXECOM_FACTURE_334.80_FA006127.pdf", "per": "", "ref": "FA006127", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-28", "env": true, "etat": "DEPOSEE", "four": "COFICA", "mt": "1353.76", "nom": "2026-08-28_COFICA_FACTURE_1353.76_750004832398_P2026-09-05-au-2026-10-04.pdf", "per": "2026-09-05-au-2026-10-04", "ref": "750004832398", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-16", "env": true, "etat": "DEPOSEE", "four": "STRAUMANN", "mt": "172.74", "nom": "2026-09-16_STRAUMANN_FACTURE_172.74_9060181129.pdf", "per": "", "ref": "9060181129", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-18", "env": true, "etat": "DEPOSEE", "four": "STRAUMANN", "mt": "33.21", "nom": "2026-09-18_STRAUMANN_FACTURE_33.21_9060182966.pdf", "per": "", "ref": "9060182966", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-18", "env": true, "etat": "DEPOSEE", "four": "STRAUMANN", "mt": "97.72", "nom": "2026-09-18_STRAUMANN_FACTURE_97.72_9060183030.pdf", "per": "", "ref": "9060183030", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-25", "env": false, "etat": "RENOMME", "four": "SEPTODONT", "mt": "359.02", "nom": "2026-06-25_SEPTODONT_FACTURE_359.02_90049585.pdf", "per": "", "ref": "90049585", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-28", "env": false, "etat": "RENOMME", "four": "SEPTODONT", "mt": "364.73", "nom": "2026-07-28_SEPTODONT_FACTURE_364.73_90056093.pdf", "per": "", "ref": "90056093", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-28", "env": false, "etat": "RENOMME", "four": "SEPTODONT", "mt": "383.63", "nom": "2026-07-28_SEPTODONT_FACTURE_383.63_90056020.pdf", "per": "", "ref": "90056020", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-03", "env": false, "etat": "RENOMME", "four": "SEPTODONT", "mt": "15.40", "nom": "2026-09-03_SEPTODONT_FACTURE_15.40_90060529.pdf", "per": "", "ref": "90060529", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-11", "env": false, "etat": "RENOMME", "four": "SEPTODONT", "mt": "763.76", "nom": "2026-09-11_SEPTODONT_RELANCE_763.76_1034064.pdf", "per": "", "ref": "1034064", "type": "RELANCE", "vig": ""},
  {"date": "2026-06-04", "env": true, "etat": "DEPOSEE", "four": "ZFX", "mt": "253.99", "nom": "2026-06-04_ZFX_RELANCE_253.99_D-2606.08953.pdf", "per": "", "ref": "D-2606.08953", "type": "RELANCE", "vig": ""},
  {"date": "2026-02-13", "env": false, "etat": "RECU", "four": "ZFX", "mt": "253.99", "nom": "2026-02-13_ZFX_FACTURE_253.99_R-2602.52453.pdf", "per": "", "ref": "R-2602.52453", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-15", "env": false, "etat": "RENOMME", "four": "CPAM-VENDEE", "mt": "96.75", "nom": "2026-06-15_CPAM-VENDEE_RELANCE_96.75_LOT466.pdf", "per": "", "ref": "LOT466", "type": "RELANCE", "vig": ""},
  {"date": "2026-06-20", "env": true, "etat": "DEPOSEE", "four": "AG2R-AGIRC-ARRCO", "mt": "", "nom": "2026-06-20_AG2R-AGIRC-ARRCO_AFFILIATION_26232180.pdf", "per": "", "ref": "26232180", "type": "AFFILIATION", "vig": ""},
  {"date": "2026-09-30", "env": false, "etat": "RENOMME", "four": "BNP-2112", "mt": "", "nom": "2026-09-30_BNP-2112_RELEVE_26009_P2026-09-01-au-2026-09-30.pdf", "per": "2026-09-01-au-2026-09-30", "ref": "26009", "type": "RELEVE", "vig": ""},
  {"date": "2026-08-31", "env": true, "etat": "DEPOSEE", "four": "SCM-LEGESMILE", "mt": "9787.35", "nom": "2026-08-31_SCM-LEGESMILE_RELEVE_9787.35_45530000_P2025-01-01-au-2025-12-31.pdf", "per": "2025-01-01-au-2025-12-31", "ref": "45530000", "type": "RELEVE", "vig": ""},
  {"date": "2026-03-31", "env": true, "etat": "DEPOSEE", "four": "SCM-LEGESMILE", "mt": "120314.80", "nom": "2026-03-31_SCM-LEGESMILE_RELEVE_120314.80_QP-2025_P2025-01-01-au-2025-12-31.pdf", "per": "2025-01-01-au-2025-12-31", "ref": "QP-2025", "type": "RELEVE", "vig": ""},
  {"date": "2026-04-09", "env": false, "etat": "RECU", "four": "ORMCO", "mt": "19.98", "nom": "2026-04-09_ORMCO_FACTURE_19.98_331172674.pdf", "per": "", "ref": "331172674", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-11", "env": false, "etat": "RECU", "four": "ORMCO", "mt": "19.98", "nom": "2026-04-11_ORMCO_FACTURE_19.98_331173068.pdf", "per": "", "ref": "331173068", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-13", "env": false, "etat": "RECU", "four": "ORMCO", "mt": "19.98", "nom": "2026-04-13_ORMCO_FACTURE_19.98_331173646.pdf", "per": "", "ref": "331173646", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-03", "env": false, "etat": "HORS PERIMETRE", "four": "ORMCO", "mt": "1348.66", "nom": "2026-06-03_ORMCO_FACTURE_1348.66_331190204.pdf", "per": "", "ref": "331190204", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-01", "env": false, "etat": "RENOMME", "four": "ORMCO", "mt": "19.20", "nom": "2026-04-01_ORMCO_AR_19.20_retour-cheque.pdf", "per": "", "ref": "retour-cheque", "type": "AR", "vig": ""},
  {"date": "2026-02-05", "env": true, "etat": "DEPOSEE", "four": "ORMCO", "mt": "19.20", "nom": "2026-02-05_ORMCO_FACTURE_19.20_331150973.pdf", "per": "", "ref": "331150973", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-09", "env": true, "etat": "DEPOSEE", "four": "ORMCO", "mt": "19.98", "nom": "2026-04-09_ORMCO_FACTURE_19.98_331172675.pdf", "per": "", "ref": "331172675", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-16", "env": true, "etat": "DEPOSEE", "four": "PETRO-OUEST", "mt": "109.15", "nom": "2026-05-16_PETRO-OUEST_TICKET_109.15.pdf", "per": "", "ref": "", "type": "TICKET", "vig": ""},
  {"date": "2026-06-07", "env": true, "etat": "DEPOSEE", "four": "SUPER-U-LEGE", "mt": "126.27", "nom": "2026-06-07_SUPER-U-LEGE_TICKET_126.27.pdf", "per": "", "ref": "", "type": "TICKET", "vig": ""},
  {"date": "2026-06-18", "env": true, "etat": "DEPOSEE", "four": "PETRO-OUEST", "mt": "123.01", "nom": "2026-06-18_PETRO-OUEST_TICKET_123.01.pdf", "per": "", "ref": "", "type": "TICKET", "vig": ""},
  {"date": "2026-07-20", "env": true, "etat": "DEPOSEE", "four": "PETRO-OUEST", "mt": "122.59", "nom": "2026-07-20_PETRO-OUEST_TICKET_122.59.pdf", "per": "", "ref": "", "type": "TICKET", "vig": ""},
  {"date": "2026-09-14", "env": true, "etat": "DEPOSEE", "four": "SUPER-U-LEGE", "mt": "145.59", "nom": "2026-09-14_SUPER-U-LEGE_TICKET_145.59.pdf", "per": "", "ref": "", "type": "TICKET", "vig": ""},
  {"date": "2025-12-05", "env": false, "etat": "HORS PERIMETRE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2025-12-05_DOCTOLIB_FACTURE_149.00_FRIN25-01451287.pdf", "per": "", "ref": "FRIN25-01451287", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-07", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-01-07_DOCTOLIB_FACTURE_149.00_FRIN25-01591543.pdf", "per": "", "ref": "FRIN25-01591543", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-04", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-02-04_DOCTOLIB_FACTURE_149.00_FRIN25-01709447.pdf", "per": "", "ref": "FRIN25-01709447", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-05", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-03-05_DOCTOLIB_FACTURE_149.00_FRIN25-01865267.pdf", "per": "", "ref": "FRIN25-01865267", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-08", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-04-08_DOCTOLIB_FACTURE_149.00_FRIN25-01992157.pdf", "per": "", "ref": "FRIN25-01992157", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-07", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-05-07_DOCTOLIB_FACTURE_149.00_FRIN25-02132567.pdf", "per": "", "ref": "FRIN25-02132567", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-03", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-06-03_DOCTOLIB_FACTURE_149.00_FRIN25-02270457.pdf", "per": "", "ref": "FRIN25-02270457", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-08", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-07-08_DOCTOLIB_FACTURE_149.00_FRIN25-02316023.pdf", "per": "", "ref": "FRIN25-02316023", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-05", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-08-05_DOCTOLIB_FACTURE_149.00_FRIN25-02486130.pdf", "per": "", "ref": "FRIN25-02486130", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-09", "env": true, "etat": "DEPOSEE", "four": "DOCTOLIB", "mt": "149.00", "nom": "2026-09-09_DOCTOLIB_FACTURE_149.00_FRIN25-02696811.pdf", "per": "", "ref": "FRIN25-02696811", "type": "FACTURE", "vig": ""},
  {"date": "2025-12-17", "env": false, "etat": "HORS PERIMETRE", "four": "IONOS", "mt": "27.60", "nom": "2025-12-17_IONOS_FACTURE_27.60_202543127270.pdf", "per": "", "ref": "202543127270", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-09", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "27.60", "nom": "2026-01-09_IONOS_FACTURE_27.60_202543535136.pdf", "per": "", "ref": "202543535136", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-09", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "27.60", "nom": "2026-02-09_IONOS_FACTURE_27.60_202543954441.pdf", "per": "", "ref": "202543954441", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-09", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "27.60", "nom": "2026-03-09_IONOS_FACTURE_27.60_202544376491.pdf", "per": "", "ref": "202544376491", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-09", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "27.60", "nom": "2026-04-09_IONOS_FACTURE_27.60_202544804130.pdf", "per": "", "ref": "202544804130", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-10", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "31.20", "nom": "2026-05-10_IONOS_FACTURE_31.20_202545245288.pdf", "per": "", "ref": "202545245288", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-08", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "31.20", "nom": "2026-06-08_IONOS_FACTURE_31.20_312100052855.pdf", "per": "", "ref": "312100052855", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-08", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "31.20", "nom": "2026-07-08_IONOS_FACTURE_31.20_312100213292.pdf", "per": "", "ref": "312100213292", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-08", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "31.20", "nom": "2026-08-08_IONOS_FACTURE_31.20_312100382919.pdf", "per": "", "ref": "312100382919", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-08", "env": true, "etat": "DEPOSEE", "four": "IONOS", "mt": "31.20", "nom": "2026-09-08_IONOS_FACTURE_31.20_312100558302.pdf", "per": "", "ref": "312100558302", "type": "FACTURE", "vig": ""},
  {"date": "2025-12-17", "env": false, "etat": "HORS PERIMETRE", "four": "RECEPT-AI", "mt": "25.00", "nom": "2025-12-17_RECEPT-AI_FACTURE_25.00.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-01-19", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "90.80", "nom": "2026-01-19_RECEPT-AI_FACTURE_90.80.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-17", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "100.25", "nom": "2026-02-17_RECEPT-AI_FACTURE_100.25.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-17", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "102.35", "nom": "2026-03-17_RECEPT-AI_FACTURE_102.35.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-17", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "105.85", "nom": "2026-04-17_RECEPT-AI_FACTURE_105.85.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-18", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "121.25", "nom": "2026-05-18_RECEPT-AI_FACTURE_121.25.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-17", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "156.60", "nom": "2026-06-17_RECEPT-AI_FACTURE_156.60.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-07-17", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "172.35", "nom": "2026-07-17_RECEPT-AI_FACTURE_172.35.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-08-19", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "152.05", "nom": "2026-08-19_RECEPT-AI_FACTURE_152.05.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-21", "env": true, "etat": "DEPOSEE", "four": "RECEPT-AI", "mt": "217.50", "nom": "2026-09-21_RECEPT-AI_FACTURE_217.50.pdf", "per": "", "ref": "", "type": "FACTURE", "vig": ""},
  {"date": "2026-09-25", "env": false, "etat": "RENOMME", "four": "COFICA", "mt": "1353.76", "nom": "2026-09-25_COFICA_FACTURE_1353.76_750004848906_P2026-10-05-au-2026-11-04.pdf", "per": "2026-10-05-au-2026-11-04", "ref": "750004848906", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-31", "env": false, "etat": "RECU", "four": "MADE-IN-LABS", "mt": "967.00", "nom": "2026-03-31_MADE-IN-LABS_FACTURE_967.00_35195.pdf", "per": "", "ref": "35195", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-30", "env": false, "etat": "RECU", "four": "MADE-IN-LABS", "mt": "329.95", "nom": "2026-04-30_MADE-IN-LABS_FACTURE_329.95_35435.pdf", "per": "", "ref": "35435", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-31", "env": false, "etat": "RECU", "four": "BONGERT", "mt": "98.85", "nom": "2026-03-31_BONGERT_FACTURE_98.85_24515704.pdf", "per": "", "ref": "24515704", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-28", "env": false, "etat": "RECU", "four": "BONGERT", "mt": "40.40", "nom": "2026-02-28_BONGERT_FACTURE_40.40_24515266.pdf", "per": "", "ref": "24515266", "type": "FACTURE", "vig": ""},
  {"date": "2025-07-15", "env": false, "etat": "HORS PERIMETRE", "four": "BONGERT", "mt": "977.40", "nom": "2025-07-15_BONGERT_FACTURE_977.40_24511761.pdf", "per": "", "ref": "24511761", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-01", "env": true, "etat": "DEPOSEE", "four": "NTJ", "mt": "", "nom": "2026-04-01_NTJ_FACTURE_20240268.pdf", "per": "", "ref": "20240268", "type": "FACTURE", "vig": ""},
  {"date": "2026-05-04", "env": false, "etat": "A_VERIFIER", "four": "NTJ", "mt": "", "nom": "2026-05-04_NTJ_FACTURE_20240280.pdf", "per": "", "ref": "20240280", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-01", "env": false, "etat": "A_VERIFIER", "four": "NTJ", "mt": "", "nom": "2026-06-01_NTJ_FACTURE_20240293.pdf", "per": "", "ref": "20240293", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-03", "env": false, "etat": "A_VERIFIER", "four": "STRAUMANN", "mt": "", "nom": "2026-02-03_STRAUMANN_FACTURE_9060024519.pdf", "per": "", "ref": "9060024519", "type": "FACTURE", "vig": ""},
  {"date": "2026-02-19", "env": false, "etat": "A_VERIFIER", "four": "STRAUMANN", "mt": "", "nom": "2026-02-19_STRAUMANN_FACTURE_9060036137.pdf", "per": "", "ref": "9060036137", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-17", "env": false, "etat": "A_VERIFIER", "four": "STRAUMANN", "mt": "", "nom": "2026-04-17_STRAUMANN_FACTURE_9060082089.pdf", "per": "", "ref": "9060082089", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "GACD", "mt": "", "nom": "", "per": "", "ref": "2402336461", "type": "FACTURE", "vig": ""},
  {"date": "", "env": false, "etat": "A_VERIFIER", "four": "GACD", "mt": "", "nom": "", "per": "", "ref": "2402321857", "type": "FACTURE", "vig": ""},
  {"date": "2026-06-05", "env": false, "etat": "RECU", "four": "OSSEO-SHOP", "mt": "219.50", "nom": "2026-06-05_OSSEO-SHOP_FACTURE_219.50_FA2026-008162.pdf", "per": "", "ref": "FA2026-008162", "type": "FACTURE", "vig": ""},
  {"date": "2026-03-15", "env": false, "etat": "RECU", "four": "BONGERT", "mt": "271.45", "nom": "2026-03-15_BONGERT_FACTURE_271.45_24515482.pdf", "per": "", "ref": "24515482", "type": "FACTURE", "vig": ""},
  {"date": "2025-11-30", "env": false, "etat": "HORS PERIMETRE", "four": "BONGERT", "mt": "809.20", "nom": "2025-11-30_BONGERT_FACTURE_809.20_24513834.pdf", "per": "", "ref": "24513834", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-15", "env": true, "etat": "DEPOSEE", "four": "BONGERT", "mt": "100.60", "nom": "2026-04-15_BONGERT_FACTURE_100.60_24515923.pdf", "per": "", "ref": "24515923", "type": "FACTURE", "vig": ""},
  {"date": "2026-04-30", "env": true, "etat": "DEPOSEE", "four": "BONGERT", "mt": "158.85", "nom": "2026-04-30_BONGERT_FACTURE_158.85_24516144.pdf", "per": "", "ref": "24516144", "type": "FACTURE", "vig": ""}
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
  try {
    SpreadsheetApp.getUi().alert("Ajoutees : " + aj.length
      + "\nDeja presentes : " + sautees + "\nOnglet : " + f.getName());
  } catch (e) {
    // getUi() echoue hors contexte d interface : le
    // journal suffit, le travail est deja fait.
    Logger.log("Pas d interface : " + e);
  }
}

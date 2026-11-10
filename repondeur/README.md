# Repondeur local du cabinet

Remplace Recept AI par une machine posee au cabinet. Rien ne sort : ni les
voix, ni les noms, ni les transcriptions.

## Ce que ca fait

1. **Decroche et guide** — une annonce, puis quatre questions enregistrees une
   a une : nom, motif, praticien, numero et moment de rappel.
2. **Transcrit sur place** — Whisper tourne sur la machine. Ollama (facultatif)
   ajoute un resume d'une ligne et une categorie d'organisation.
3. **Boucle interne** — chaque message devient une fiche dans un tableau
   ouvert sur les postes du cabinet : *a traiter → pris par X → clos*.
   Une fiche qui attend plus de 4 h passe en rouge.

Ce n'est pas une IA qui improvise au telephone : les questions sont fixes,
donc pas de latence et pas de phrase inventee. La conversation libre demande
une carte graphique ; elle peut se greffer plus tard sur le meme socle.

## Les fichiers

| Fichier | Role |
|---|---|
| `config.py` | Tout ce qui se regle : equipe, categories, delais, modeles |
| `asterisk/extensions.conf` | Le deroule de l'appel |
| `asterisk/annonces.txt` | Les textes a enregistrer (**a relire**) |
| `asterisk/convertir_annonces.sh` | Met tes enregistrements au format Asterisk |
| `traiter_message.py` | Appel enregistre → fiche dans la base |
| `tableau.py` | Le tableau web + la purge |

## Installation (mini-PC sous Debian ou Ubuntu)

```bash
sudo apt install asterisk ffmpeg python3-pip
```

```bash
sudo pip install faster-whisper --break-system-packages
```

```bash
sudo cp -r . /opt/repondeur && sudo mkdir -p /var/spool/repondeur /var/lib/repondeur && sudo chown asterisk: /var/spool/repondeur /var/lib/repondeur
```

Puis :

- **Annonces** : enregistre les six phrases de `annonces.txt` au dictaphone,
  nomme-les `accueil`, `q_nom`, `q_motif`, `q_praticien`, `q_rappel`, `merci`,
  et passe-les par `convertir_annonces.sh`.
- **Deroule** : colle `asterisk/extensions.conf` dans `/etc/asterisk/extensions.conf`.
- **Ligne** : ouvre une ligne SIP chez un operateur (OVH, par exemple),
  declare-la dans `/etc/asterisk/pjsip.conf` avec `context=repondeur`, et
  programme sur la ligne du cabinet un **renvoi sur non-reponse et sur
  occupation** vers ce numero. Le numero du cabinet ne change pas.
- **Tableau** : lance `tableau.py` au demarrage (service systemd, utilisateur
  `asterisk`), et ouvre `http://<adresse-du-mini-pc>:8080` sur les postes.
- **Purge** : `tableau.py --purger` une fois par jour (cron).

## Brancher N8N

- `GET /synthese.json` donne les compteurs (a traiter, pris, en retard, par
  categorie) sans aucun nom : a lire toutes les heures pour une relance, et
  le matin pour le brief.
- `REPONDEUR_WEBHOOK` previent N8N a chaque nouveau message (identifiant,
  categorie, heure uniquement).

## Ce qui est teste, ce qui ne l'est pas

Teste : creation des fiches, appel raccroche en cours, doublons, tableau,
passage en retard, cloture, lecture des sons, purge, conversion des annonces.

**Pas teste ici** (pas de telephonie ni de modele dans l'environnement de
developpement) : le deroule Asterisk sur un vrai appel, la transcription
Whisper, le resume Ollama. A valider sur le mini-PC avec un appel d'essai.

## Garde-fous

- Le tableau n'a pas de mot de passe : il doit rester sur le reseau interne
  du cabinet, jamais expose a Internet.
- Le modele ne classe que l'organisation. Il n'evalue ni urgence ni gravite.
- La consigne d'urgence dans l'annonce d'accueil est a rediger par le praticien.
- Sons et fiches clos sont effaces apres 30 jours (`CONSERVATION_JOURS`).

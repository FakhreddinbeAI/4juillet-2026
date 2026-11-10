# Repondeur local du cabinet

Remplace Recept AI par une machine posee au cabinet. Rien ne sort : ni les
voix, ni les noms, ni les transcriptions.

## Ce que ca fait

1. **Decroche et converse** — un agent vocal local dit l'annonce d'accueil,
   puis echange librement avec l'appelant pour prendre un message complet :
   nom, motif, praticien, numero et moment de rappel.
2. **Cree la fiche** — a la fin de l'appel, la conversation devient une fiche
   (resume, categorie, transcription, enregistrement).
3. **Boucle interne** — la fiche arrive dans un tableau ouvert sur les postes
   du cabinet : *a traiter → pris par X → clos*. Au-dela de 4 h d'attente,
   elle passe en rouge.

Si l'agent ne tourne pas (panne, mise a jour), Asterisk bascule seul sur un
**repondeur guide** : quatre questions fixes, sans IA, memes fiches.

## Ce que l'agent a le droit de dire

- Il prend le message et donne les informations de `infos_cabinet.txt`.
- Il ne donne **aucun avis medical**, n'evalue ni urgence ni gravite, ne pose
  ni ne deplace aucun rendez-vous, ne donne aucun prix.
- L'annonce d'accueil est une phrase **fixe** (`AGENT_ACCUEIL` dans
  `config.py`) : c'est la que va ta consigne d'urgence, dite a chaque
  appelant, mot pour mot. Le modele ne la redige pas et ne trie rien.
- L'annonce dit que c'est un assistant automatique et que l'appel est enregistre.

Un modele local peut malgre tout sortir de ses consignes. Ecoute les
premiers appels dans le tableau avant de lui faire confiance.

## Les fichiers

| Fichier | Role |
|---|---|
| `config.py` | Tout ce qui se regle : annonces, equipe, delais, modeles |
| `infos_cabinet.txt` | Ce que l'agent peut dire du cabinet (**a remplir**) |
| `agent_vocal.py` | L'agent de conversation |
| `essai_agent.py` | Faux appel, sans telephone ni modele, pour verifier l'installation |
| `asterisk/extensions.conf` | Le deroule de l'appel et la bascule de secours |
| `asterisk/annonces.txt` | Textes du repondeur guide (**a relire**) |
| `asterisk/convertir_annonces.sh` | Met tes enregistrements au format Asterisk |
| `traiter_message.py` | Repondeur guide : appel enregistre → fiche |
| `tableau.py` | Le tableau web + la purge |

## Le materiel

La conversation libre demande une **carte graphique NVIDIA avec 16 Go de
memoire video** et 32 Go de RAM : un PC tour, pas un mini-PC. Sans carte
graphique, seul le repondeur guide est utilisable (reponses trop lentes).

## Installation (Debian ou Ubuntu, pilote NVIDIA installe)

```bash
sudo apt install asterisk ffmpeg netcat-openbsd python3-pip
```

```bash
sudo pip install faster-whisper piper-tts numpy --break-system-packages
```

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

```bash
ollama pull gemma3:12b
```

```bash
sudo cp -r . /opt/repondeur && sudo mkdir -p /var/spool/repondeur /var/lib/repondeur /opt/repondeur/voix && sudo chown asterisk: /var/spool/repondeur /var/lib/repondeur
```

Puis :

- **Voix** : telecharge une voix francaise Piper (`fr_FR-siwis-medium.onnx`
  et son `.onnx.json`) dans `/opt/repondeur/voix/`.
- **Annonce et infos** : complete `AGENT_ACCUEIL` dans `config.py` et
  `infos_cabinet.txt`. L'agent refuse de demarrer tant qu'il reste des crochets.
- **Verification** : `essai_agent.py` joue un faux appel et doit afficher
  « Essai reussi ».
- **Deroule** : colle `asterisk/extensions.conf` dans `/etc/asterisk/extensions.conf`.
- **Secours** : enregistre les six annonces de `asterisk/annonces.txt` et
  passe-les par `convertir_annonces.sh`.
- **Ligne** : ouvre une ligne SIP chez un operateur (OVH, par exemple),
  declare-la dans `/etc/asterisk/pjsip.conf` avec `context=accueil`, et
  programme sur la ligne du cabinet un **renvoi sur non-reponse et sur
  occupation** vers ce numero. Le numero du cabinet ne change pas.
- **Services** : lance `agent_vocal.py` et `tableau.py` au demarrage (systemd,
  utilisateur `asterisk`), et ouvre `http://<adresse-de-la-machine>:8080`
  sur les postes.
- **Purge** : `tableau.py --purger` une fois par jour (cron).

## Regler la conversation

| Reglage (`config.py`) | Effet |
|---|---|
| `AGENT_FIN_PHRASE` | Silence qui rend la parole a l'agent. Plus court = plus vif, mais coupe ceux qui hesitent |
| `AGENT_SEUIL` | Sensibilite au bruit de fond de la ligne |
| `AGENT_MODELE` | Le modele Ollama qui repond |
| `AGENT_DUREE_MAX`, `AGENT_TOURS_MAX` | Garde-fous : l'agent conclut de lui-meme |

L'agent n'ecoute pas pendant qu'il parle : l'appelant ne peut pas lui couper
la parole. Ses phrases sont courtes pour cette raison.

## Brancher N8N

- `GET /synthese.json` donne les compteurs (a traiter, pris, en retard, par
  categorie) sans aucun nom : a lire toutes les heures pour une relance, et
  le matin pour le brief.
- `REPONDEUR_WEBHOOK` previent N8N a chaque nouveau message (identifiant,
  categorie, heure uniquement).

## Ce qui est teste, ce qui ne l'est pas

Teste, avec des moteurs factices : le dialogue avec Asterisk (protocole
AudioSocket), le decoupage des prises de parole, la fin d'appel, l'appelant
muet, l'appel raccroche, la creation des fiches, le tableau, la purge.

**Pas teste** (ni telephonie, ni carte graphique, ni modele dans
l'environnement de developpement) : le deroule Asterisk sur un vrai appel,
l'ecoute Whisper, la voix Piper, les reponses du modele et leur respect des
consignes, le temps de reponse reel. Prevois une demi-journee de mise au
point sur la machine, avec des appels d'essai.

## Garde-fous

- Le tableau n'a pas de mot de passe : il doit rester sur le reseau interne
  du cabinet, jamais expose a Internet.
- L'agent n'ecoute que la machine elle-meme (127.0.0.1).
- Sons et fiches clos sont effaces apres 30 jours (`CONSERVATION_JOURS`).

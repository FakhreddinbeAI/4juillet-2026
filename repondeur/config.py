"""Reglages du repondeur. Tout ce qui change d'un cabinet a l'autre est ici."""
import os

# Ou Asterisk depose les enregistrements (un sous-dossier par appel).
DOSSIER_APPELS = os.environ.get("REPONDEUR_APPELS", "/var/spool/repondeur")
# La base locale des messages. Elle ne quitte jamais la machine du cabinet.
BASE = os.environ.get("REPONDEUR_BASE", "/var/lib/repondeur/messages.db")

# Les questions posees a l'appelant, dans l'ordre. La cle est le nom du
# fichier enregistre par Asterisk (1_nom.wav, 2_motif.wav...) et de la colonne.
ETAPES = ["nom", "motif", "praticien", "rappel"]

# Liste proposee dans le tableau pour « qui prend le message ».
EQUIPE = ["Secretaire", "Assistante 1", "Assistante 2", "Dr 1", "Dr 2", "Dr 3"]

# Categories d'ORGANISATION (jamais de gravite clinique).
CATEGORIES = ["rendez-vous", "annulation", "devis", "suite de soin",
              "laboratoire", "administratif", "autre"]

# Un message « a traiter » depuis plus longtemps que ca passe en retard.
RETARD_HEURES = 4
# Les sons et transcriptions sont effaces apres ce delai (messages clos).
CONSERVATION_JOURS = 30

# Transcription locale (faster-whisper). « small » tient sur un mini-PC sans GPU.
WHISPER_MODELE = os.environ.get("REPONDEUR_WHISPER", "small")

# Resume local par Ollama. Laisser vide pour s'en passer : le tableau
# affiche alors la transcription brute, ce qui suffit pour demarrer.
OLLAMA_URL = os.environ.get("REPONDEUR_OLLAMA", "")  # ex. http://localhost:11434
OLLAMA_MODELE = os.environ.get("REPONDEUR_OLLAMA_MODELE", "mistral")

# Webhook N8N prevenu a chaque nouveau message. Il ne recoit NI nom NI
# numero NI texte : seulement l'identifiant, la categorie et l'heure.
WEBHOOK = os.environ.get("REPONDEUR_WEBHOOK", "")

PORT_TABLEAU = int(os.environ.get("REPONDEUR_PORT", "8080"))

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


# ---------------------------------------------------------------------------
# Agent vocal (conversation libre). Demande une carte graphique.
# ---------------------------------------------------------------------------
AGENT_PORT = int(os.environ.get("REPONDEUR_AGENT_PORT", "9092"))
AGENT_OLLAMA = os.environ.get("REPONDEUR_AGENT_OLLAMA", "http://localhost:11434")
AGENT_MODELE = os.environ.get("REPONDEUR_AGENT_MODELE", "gemma3:12b")
AGENT_WHISPER = os.environ.get("REPONDEUR_AGENT_WHISPER", "large-v3-turbo")
# Voix Piper (fichier .onnx telecharge une fois, voir README).
PIPER_VOIX = os.environ.get("REPONDEUR_VOIX", "/opt/repondeur/voix/fr_FR-siwis-medium.onnx")

# Phrases FIXES, dites telles quelles : le modele ne les redige pas.
# A RELIRE. La consigne d'urgence est une consigne de soin : elle est a toi.
# Garde les accents ici : la voix de synthese en a besoin pour bien prononcer.
# L'agent refuse de demarrer tant qu'il reste un passage entre crochets.
AGENT_ACCUEIL = (
    "Bonjour, cabinet dentaire [NOM DU CABINET]. Je suis l'assistant vocal "
    "automatique du cabinet, le secrétariat n'est pas disponible. "
    "[CONSIGNE URGENCE A REDIGER PAR LE PRATICIEN] "
    "Cet appel est enregistré pour que l'équipe puisse vous rappeler. "
    "Que puis-je noter pour vous ?")
AGENT_AU_REVOIR = "Je transmets à l'équipe, qui vous rappellera. Au revoir."
AGENT_RELANCE = "Je ne vous entends pas. Êtes-vous toujours en ligne ?"

AGENT_SEUIL = 500         # volume au-dela duquel une trame compte comme de la voix
AGENT_FIN_PHRASE = 0.7    # secondes de silence qui terminent une prise de parole
AGENT_SILENCE_MAX = 8     # secondes sans rien entendre avant la relance
AGENT_TOURS_MAX = 14      # prises de parole de l'appelant avant de conclure
AGENT_DUREE_MAX = 240     # secondes d'appel avant de conclure

#!/usr/bin/env python3
"""Agent vocal local : converse librement avec l'appelant, puis cree la fiche.

Asterisk lui passe le son de l'appel par AudioSocket (voir
asterisk/extensions.conf). Trois moteurs tournent sur la machine :
Whisper ecoute, un modele Ollama repond, Piper parle. Rien ne sort du cabinet.

    agent_vocal.py        lance l'agent (port 9092, machine locale uniquement)
"""
import array
import asyncio
import collections
import json
import math
import os
import re
import sys
import urllib.request
import uuid
import wave

import config
from traiter_message import enregistrer

TRAME = 320  # 20 ms de son telephonique : 8 kHz, 16 bits, mono
FIN = "[FIN]"

CONSIGNES = """Tu es l'assistant vocal du repondeur d'un cabinet dentaire. Tu parles au telephone, en francais, avec des phrases courtes et naturelles, une seule question a la fois.

Ton seul role : prendre un message complet pour que l'equipe rappelle. Il te faut :
1. le nom et le prenom de l'appelant ;
2. le motif de l'appel ;
3. le praticien qui le suit, s'il en a un ;
4. le numero et le moment ou le rappeler.
Fais epeler le nom s'il est difficile. Reformule le message en une phrase pour le faire confirmer, puis conclus.

Ce que tu ne fais jamais :
- aucun avis medical, aucun conseil de soin, aucun medicament, aucune evaluation d'urgence ou de gravite. A toute question de sante tu reponds que tu ne peux pas y repondre et que tu la transmets a l'equipe ;
- aucun rendez-vous donne, deplace ou annule : tu notes la demande, l'equipe confirmera ;
- aucun prix, aucun devis, aucune promesse de delai de rappel ;
- aucune information inventee. Si la reponse n'est pas dans les informations ci-dessous, tu dis que tu le notes pour l'equipe.

Informations pratiques que tu peux donner :
{infos}

Quand le message est complet et confirme, ou si l'appelant veut raccrocher, dis au revoir et termine ta reponse par """ + FIN + "."

EXTRACTION = """Voici la transcription d'un appel au repondeur d'un cabinet dentaire.
Reponds en JSON avec exactement ces cles : "nom", "motif", "praticien", "rappel", "resume", "categorie".
- reprends ce que l'appelant a dit, sans rien ajouter ; chaine vide si l'information manque ;
- "rappel" : numero et moment de rappel ;
- "resume" : une phrase factuelle ;
- "categorie" : une seule parmi {categories}.
Tu n'evalues ni l'urgence ni la gravite.

{transcription}"""


def volume(trame):
    echantillons = array.array("h", trame[:len(trame) // 2 * 2])
    if not echantillons:
        return 0
    return math.sqrt(sum(x * x for x in echantillons) / len(echantillons))


def ollama(chemin, corps, flux=False):
    requete = urllib.request.Request(
        config.AGENT_OLLAMA.rstrip("/") + chemin,
        data=json.dumps({**corps, "model": config.AGENT_MODELE, "stream": flux,
                         "keep_alive": -1}).encode(),
        headers={"Content-Type": "application/json"})
    return urllib.request.urlopen(requete, timeout=120)


class MoteursLocaux:
    """Whisper + Ollama + Piper. Charges une fois au demarrage."""

    def __init__(self):
        import numpy
        from faster_whisper import WhisperModel
        from piper import PiperVoice
        self.np = numpy
        self.whisper = WhisperModel(config.AGENT_WHISPER, device="auto",
                                    compute_type="auto")
        self.voix = PiperVoice.load(config.PIPER_VOIX)

    def ecouter(self, son):
        np = self.np
        signal = np.frombuffer(son, dtype=np.int16).astype(np.float32) / 32768
        # Whisper attend du 16 kHz : on double la cadence du son telephonique.
        signal = np.interp(np.arange(0, len(signal), 0.5),
                           np.arange(len(signal)), signal).astype(np.float32)
        segments, _ = self.whisper.transcribe(signal, language="fr", beam_size=1,
                                              vad_filter=True)
        return " ".join(s.text.strip() for s in segments).strip()

    def penser(self, messages):
        with ollama("/api/chat", {"messages": messages,
                                  "options": {"num_predict": 160}}, flux=True) as r:
            for ligne in r:
                if ligne.strip():
                    yield json.loads(ligne).get("message", {}).get("content", "")

    def extraire(self, consigne):
        with ollama("/api/generate", {"prompt": consigne, "format": "json"}) as r:
            return json.loads(json.loads(r.read())["response"])

    def dire(self, texte):
        np = self.np
        if hasattr(self.voix, "synthesize_stream_raw"):      # piper < 1.3
            brut = b"".join(self.voix.synthesize_stream_raw(texte))
        else:                                                 # piper >= 1.3
            brut = b"".join(m.audio_int16_bytes for m in self.voix.synthesize(texte))
        signal = np.frombuffer(brut, dtype=np.int16).astype(np.float32)
        cadence = self.voix.config.sample_rate
        pas = max(1, cadence // 8000)  # lissage avant de descendre a 8 kHz
        signal = np.convolve(signal, np.ones(pas) / pas, mode="same")
        cibles = np.arange(0, len(signal), cadence / 8000)
        return np.interp(cibles, np.arange(len(signal)), signal).astype(np.int16).tobytes()


class Appel:
    def __init__(self, moteurs, lecteur, ecrivain, dossier, infos):
        self.m, self.lecteur, self.ecrivain = moteurs, lecteur, ecrivain
        self.dossier = dossier
        self.messages = [{"role": "system", "content": CONSIGNES.format(infos=infos)}]
        self.echanges = []                    # (qui, texte) pour la transcription
        self.tours = asyncio.Queue()          # prises de parole de l'appelant
        self.a_l_ecoute = asyncio.Event()     # faux pendant que l'agent parle
        self.son = wave.open(os.path.join(dossier, "appel.wav"), "wb")
        self.son.setnchannels(1)
        self.son.setsampwidth(2)
        self.son.setframerate(8000)

    async def ecouter(self):
        """Lit le son de l'appelant et le decoupe en prises de parole."""
        parole, avant = bytearray(), collections.deque(maxlen=10)
        fortes = calmes = attente = 0
        try:
            while True:
                # Asterisk envoie du son en continu : 30 s sans rien = ligne morte.
                entete = await asyncio.wait_for(self.lecteur.readexactly(3), 30)
                taille = int.from_bytes(entete[1:], "big")
                donnees = await self.lecteur.readexactly(taille) if taille else b""
                if entete[0] == 0x00:   # l'appelant a raccroche
                    break
                if entete[0] != 0x10:   # autre chose que du son
                    continue
                self.son.writeframes(donnees)
                if not self.a_l_ecoute.is_set():
                    parole.clear()
                    avant.clear()
                    fortes = calmes = attente = 0
                    continue
                fort = volume(donnees) > config.AGENT_SEUIL
                if not parole:
                    avant.append(donnees)
                    fortes = fortes + 1 if fort else 0
                    attente += 1
                    if fortes >= 3:     # 60 ms de voix : la personne parle
                        parole.extend(b"".join(avant))
                        calmes = 0
                    elif attente * 0.02 > config.AGENT_SILENCE_MAX:
                        self.a_l_ecoute.clear()
                        await self.tours.put(b"")
                else:
                    parole.extend(donnees)
                    calmes = 0 if fort else calmes + 1
                    if calmes * 0.02 >= config.AGENT_FIN_PHRASE or len(parole) > 16000 * 45:
                        self.a_l_ecoute.clear()
                        await self.tours.put(bytes(parole))
        except (asyncio.IncompleteReadError, ConnectionError, asyncio.TimeoutError):
            pass
        await self.tours.put(None)

    async def emettre(self, son):
        """Envoie du son a l'appelant, au rythme de la parole."""
        boucle = asyncio.get_running_loop()
        echeance = boucle.time()
        for debut in range(0, len(son), TRAME):
            trame = son[debut:debut + TRAME].ljust(TRAME, b"\0")
            self.ecrivain.write(b"\x10" + len(trame).to_bytes(2, "big") + trame)
            await self.ecrivain.drain()
            echeance += 0.02
            await asyncio.sleep(max(0, echeance - boucle.time()))

    async def dire(self, phrase):
        phrase = phrase.replace(FIN, "").strip()
        if re.search(r"\w", phrase):
            await self.emettre(await asyncio.to_thread(self.m.dire, phrase))

    async def parler(self, texte):
        """Dit une phrase fixe, puis rend la parole."""
        self.a_l_ecoute.clear()
        self.echanges.append(("Assistant", texte))
        for phrase in re.split(r"(?<=[.!?])\s+", texte):
            await self.dire(phrase)
        self.a_l_ecoute.set()

    async def repondre(self):
        """Fait repondre le modele, phrase par phrase. Vrai si l'appel se termine."""
        flux = self.m.penser(self.messages)
        texte = tampon = ""
        while (morceau := await asyncio.to_thread(next, flux, None)) is not None:
            texte += morceau
            tampon += morceau
            while (coupe := re.search(r"[.!?]\s", tampon)):
                await self.dire(tampon[:coupe.end()])
                tampon = tampon[coupe.end():]
        await self.dire(tampon)
        propre = texte.replace(FIN, "").strip()
        self.messages.append({"role": "assistant", "content": propre})
        self.echanges.append(("Assistant", propre))
        self.a_l_ecoute.set()
        return FIN in texte

    async def derouler(self):
        boucle = asyncio.get_running_loop()
        debut = boucle.time()
        ecoute = asyncio.create_task(self.ecouter())
        silences = prises = 0
        try:
            await self.parler(config.AGENT_ACCUEIL)
            while (tour := await self.tours.get()) is not None:
                if tour == b"":
                    silences += 1
                    if silences >= 2:
                        await self.parler(config.AGENT_AU_REVOIR)
                        break
                    await self.parler(config.AGENT_RELANCE)
                    continue
                texte = await asyncio.to_thread(self.m.ecouter, tour)
                if not texte:           # un bruit, pas une phrase
                    self.a_l_ecoute.set()
                    continue
                silences, prises = 0, prises + 1
                self.echanges.append(("Appelant", texte))
                self.messages.append({"role": "user", "content": texte})
                if prises > config.AGENT_TOURS_MAX or \
                        boucle.time() - debut > config.AGENT_DUREE_MAX:
                    await self.parler(config.AGENT_AU_REVOIR)
                    break
                if await self.repondre():
                    break
        except ConnectionError:
            pass
        except Exception as erreur:     # un moteur en panne ne doit pas perdre l'appel
            print(f"appel interrompu : {erreur}", file=sys.stderr)
        finally:
            try:
                await self.raccrocher(ecoute)
            finally:                    # quoi qu'il arrive, la fiche est creee
                self.son.close()
                await asyncio.to_thread(self.cloturer)

    async def raccrocher(self, ecoute):
        ecoute.cancel()
        await asyncio.gather(ecoute, return_exceptions=True)
        try:
            self.ecrivain.write(b"\x00\x00\x00")   # demande a Asterisk de raccrocher
            await self.ecrivain.drain()
            # Laisse Asterisk fermer de son cote : couper le premier
            # pourrait avaler la fin de la derniere phrase.
            await asyncio.wait_for(self.vider(), 2)
        except (ConnectionError, asyncio.TimeoutError):
            pass
        self.ecrivain.close()

    async def vider(self):
        while await self.lecteur.read(4096):
            pass

    def cloturer(self):
        """Transforme la conversation en fiche pour le tableau."""
        if not any(qui == "Appelant" for qui, _ in self.echanges):
            return None  # personne n'a parle
        transcription = "\n".join(f"{qui} : {texte}" for qui, texte in self.echanges)
        fiche = {}
        try:
            fiche = self.m.extraire(EXTRACTION.format(
                categories=config.CATEGORIES, transcription=transcription))
        except Exception as erreur:
            print(f"extraction indisponible : {erreur}", file=sys.stderr)
        categorie = fiche.get("categorie")
        if categorie not in config.CATEGORIES:
            categorie = "autre"
        numero = ""
        try:
            with open(os.path.join(self.dossier, "numero.txt")) as f:
                numero = f.read().strip()
        except OSError:
            pass
        reponses = {etape: str(fiche.get(etape) or "") for etape in config.ETAPES}
        resume = str(fiche.get("resume") or "(conversation a lire)")
        return enregistrer(self.dossier, numero, reponses, resume, categorie, transcription)


def lire_infos():
    chemin = os.path.join(os.path.dirname(os.path.abspath(__file__)), "infos_cabinet.txt")
    with open(chemin, encoding="utf-8") as f:
        return f.read().strip()


async def servir(moteurs, port=None):
    infos = lire_infos()

    async def accueillir(lecteur, ecrivain):
        try:
            entete = await lecteur.readexactly(3)
            identifiant = await lecteur.readexactly(int.from_bytes(entete[1:], "big"))
            if entete[0] != 0x01 or len(identifiant) != 16:
                raise ValueError("ce n'est pas un appel AudioSocket")
            dossier = os.path.join(config.DOSSIER_APPELS, str(uuid.UUID(bytes=identifiant)))
            os.makedirs(dossier, exist_ok=True)
        except Exception as erreur:
            print(f"connexion refusee : {erreur}", file=sys.stderr)
            ecrivain.close()
            return
        await Appel(moteurs, lecteur, ecrivain, dossier, infos).derouler()

    # 127.0.0.1 : seul Asterisk, sur la meme machine, peut s'y connecter.
    return await asyncio.start_server(accueillir, "127.0.0.1", port or config.AGENT_PORT)


async def principal():
    if "[" in config.AGENT_ACCUEIL + lire_infos():
        sys.exit("Annonce d'accueil (config.py) ou infos_cabinet.txt a completer : "
                 "il reste un passage entre crochets.")
    print("Chargement des moteurs...")
    serveur = await servir(MoteursLocaux())
    print(f"Agent vocal pret sur le port {config.AGENT_PORT}")
    async with serveur:
        await serveur.serve_forever()


if __name__ == "__main__":
    asyncio.run(principal())

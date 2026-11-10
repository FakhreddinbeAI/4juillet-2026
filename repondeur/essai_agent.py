#!/usr/bin/env python3
"""Essai de l'agent vocal sans telephone ni modele.

Joue un faux appel contre l'agent avec des moteurs factices : verifie le
dialogue avec Asterisk, le decoupage des prises de parole, la fin d'appel et
la creation de la fiche. Ne dit rien de la qualite d'ecoute ou de reponse.

    REPONDEUR_APPELS=/tmp/essai REPONDEUR_BASE=/tmp/essai/m.db ./essai_agent.py
"""
import asyncio
import os
import struct
import uuid

import agent_vocal
import config
from traiter_message import ouvrir_base

PORT = 9093
VOIX = struct.pack("<160h", *([4000, -4000] * 80))   # 20 ms de « voix »
CALME = b"\0" * 320


class MoteursFactices:
    def __init__(self):
        self.entendu = iter(["Bonjour, c'est Mme X.", "Je voudrais deplacer mon rendez-vous."])
        self.reponses = iter([["Bien note. ", "Quel est le motif ", "de votre appel ? "],
                              ["C'est transmis. Au revoir. ", agent_vocal.FIN]])
        self.dit = []

    def ecouter(self, son):
        assert len(son) > 320 * 20, "prise de parole tronquee"
        return next(self.entendu)

    def penser(self, messages):
        yield from next(self.reponses)

    def dire(self, texte):
        self.dit.append(texte)
        return CALME * 3

    def extraire(self, consigne):
        assert "Mme X" in consigne
        return {"nom": "Mme X", "motif": "deplacer un rendez-vous", "praticien": "",
                "rappel": "", "resume": "Souhaite deplacer son rendez-vous.",
                "categorie": "rendez-vous"}


async def appeler(identifiant, prises, raccroche_tot=False):
    lecteur, ecrivain = await asyncio.open_connection("127.0.0.1", PORT)
    ecrivain.write(b"\x01\x00\x10" + identifiant.bytes)
    recu = {"trames": 0, "fin": False}

    async def recevoir():
        try:
            while True:
                entete = await lecteur.readexactly(3)
                await lecteur.readexactly(int.from_bytes(entete[1:], "big"))
                if entete[0] == 0x00:
                    recu["fin"] = True
                    return
                recu["trames"] += 1
        except asyncio.IncompleteReadError:
            pass

    async def envoyer(trame, nombre):
        for _ in range(nombre):
            if recu["fin"]:             # l'agent a raccroche : on se tait
                return
            ecrivain.write(b"\x10\x01\x40" + trame)
            await ecrivain.drain()
            await asyncio.sleep(0.002)

    reception = asyncio.create_task(recevoir())
    await envoyer(CALME, 150)               # l'accueil est en cours
    if raccroche_tot:
        ecrivain.write(b"\x00\x00\x00")
        await ecrivain.drain()
    for _ in range(0 if raccroche_tot else prises):
        await envoyer(VOIX, 40)
        await envoyer(CALME, 150)           # silence : la prise de parole se termine
    await asyncio.wait_for(reception, 10)
    ecrivain.close()                        # comme Asterisk apres un raccroche
    return recu


async def essai():
    config.AGENT_SILENCE_MAX = 60           # pas de relance pendant l'essai
    moteurs = MoteursFactices()
    serveur = await agent_vocal.servir(moteurs, PORT)
    async with serveur:
        un, deux = uuid.uuid4(), uuid.uuid4()
        os.makedirs(os.path.join(config.DOSSIER_APPELS, str(un)), exist_ok=True)
        with open(os.path.join(config.DOSSIER_APPELS, str(un), "numero.txt"), "w") as f:
            f.write("+33600000000\n")
        recu = await appeler(un, prises=2)
        assert recu["fin"], "l'agent n'a pas raccroche apres " + agent_vocal.FIN
        assert recu["trames"] > 0, "aucun son recu"
        await appeler(deux, prises=0, raccroche_tot=True)
        await asyncio.sleep(0.5)

    dit = " | ".join(moteurs.dit)
    assert "Quel est le motif de votre appel ?" in dit, dit   # phrase recollee
    assert agent_vocal.FIN not in dit, dit
    lignes = ouvrir_base().execute("SELECT * FROM messages").fetchall()
    assert len(lignes) == 1, f"{len(lignes)} fiche(s) : l'appel raccroche ne doit rien creer"
    fiche = lignes[0]
    assert fiche["nom"] == "Mme X" and fiche["categorie"] == "rendez-vous"
    assert fiche["numero"] == "+33600000000"
    assert "Appelant : Je voudrais deplacer" in fiche["transcription"]
    assert os.path.getsize(os.path.join(fiche["dossier"], "appel.wav")) > 10000
    print("Essai reussi :", fiche["resume"])


if __name__ == "__main__":
    asyncio.run(essai())

#!/bin/sh
# Met des enregistrements (dictaphone du telephone, m4a, mp3, wav...) au
# format attendu par Asterisk : wav mono 8 kHz 16 bits.
#   convertir_annonces.sh mes_enregistrements/ /usr/share/asterisk/sounds/repondeur/
set -e
src="${1:?dossier source}"; dst="${2:?dossier destination}"
mkdir -p "$dst"
for f in "$src"/*; do
  nom=$(basename "${f%.*}")
  ffmpeg -loglevel error -y -i "$f" -ac 1 -ar 8000 -sample_fmt s16 "$dst/$nom.wav"
  echo "$dst/$nom.wav"
done

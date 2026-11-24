#!/usr/bin/env bash
# Folge 1 bauen: drei Abschnitte rendern (Straße 0–13,9 s, Wohnzimmer 13,9–41,5 s, Straße/Endkarte 41,5–50 s), Ton mischen, MP4 erzeugen.
# Aufruf: ./make_folge01.sh [ordner]   (Rendern ca. 2 h; einzelne Abschnitte: STEPS="a b c mix")
set -euo pipefail; cd "$(dirname "$0")"; F=${1:-/tmp/f01}; STEPS=${STEPS:-"a b c mix"}
for s in $STEPS; do case $s in
  a) node render.js "folge01.html?part=street&seg=a" "$F/a" 13.916667 24 0 ;;
  b) node render.js "folge01.html?part=room" "$F/b" 27.583333 24 13.916667 ;;
  c) node render.js "folge01.html?part=street&seg=c" "$F/c" 8.5 24 41.5 ;;
  mix)
    mkdir -p "$F/all"; i=0; for d in a b c; do for f in "$F/$d"/f*.jpg; do ln -sf "$f" "$F/all/$(printf 'f%05d.jpg' $i)"; i=$((i+1)); done; done; echo "frames: $i"
    python3 mix_f01.py "$F/mix.wav"
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -i "$F/mix.wav" -c:v libx264 -preset slow -b:v 9M -pass 1 -pix_fmt yuv420p -an -f mp4 -passlogfile "$F/x264" /dev/null
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -i "$F/mix.wav" -c:v libx264 -preset slow -b:v 9M -pass 2 -pix_fmt yuv420p -passlogfile "$F/x264" -c:a aac -b:a 192k -shortest -movflags +faststart folge01.mp4
    echo "fertig: folge01.mp4" ;;
esac; done

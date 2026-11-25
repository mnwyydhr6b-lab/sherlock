#!/usr/bin/env bash
# Folge 3 bauen: zwei Abschnitte rendern (a: 0–29,75 s, b: 29,75–46,5 s; Grenze = verdeckter Schnitt), Ton mischen, MP4.
# Aufruf: ./make_folge03.sh [ordner]   (einzelne Schritte: STEPS="a b mix")
set -euo pipefail; cd "$(dirname "$0")"; F=${1:-/tmp/f03}; STEPS=${STEPS:-"a b mix"}
for s in $STEPS; do case $s in
  a) node render.js "folge03.html?seg=a" "$F/a" 29.75 24 0 ;;
  b) node render.js "folge03.html?seg=b" "$F/b" 16.75 24 29.75 ;;
  mix)
    mkdir -p "$F/all"; i=0; for d in a b; do for f in "$F/$d"/f*.jpg; do ln -sf "$f" "$F/all/$(printf 'f%05d.jpg' $i)"; i=$((i+1)); done; done; echo "frames: $i"
    python3 mix_f03.py "$F/mix.wav"
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -c:v libx264 -preset slow -b:v 9M -pass 1 -pix_fmt yuv420p -an -f mp4 -passlogfile "$F/x264" /dev/null
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -i "$F/mix.wav" -c:v libx264 -preset slow -b:v 9M -pass 2 -pix_fmt yuv420p -passlogfile "$F/x264" -c:a aac -b:a 192k -shortest -movflags +faststart folge03.mp4
    echo "fertig: folge03.mp4" ;;
esac; done

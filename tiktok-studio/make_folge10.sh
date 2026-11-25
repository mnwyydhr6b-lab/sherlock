#!/usr/bin/env bash
# Folge 10 bauen (ein Drehort: Schulhof): Frames rendern, Ton mischen, MP4. Aufruf: ./make_folge10.sh [ordner]   STEPS="render mix"
set -euo pipefail; cd "$(dirname "$0")"; F=${1:-/tmp/f10}; STEPS=${STEPS:-"render mix"}
for s in $STEPS; do case $s in
  render) node render.js "folge10.html" "$F/all" 50 24 0 ;;
  mix)
    python3 mix_f10.py "$F/mix.wav"
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -c:v libx264 -preset slow -b:v 9M -pass 1 -pix_fmt yuv420p -an -f mp4 -passlogfile "$F/x264" /dev/null
    ffmpeg -y -v error -framerate 24 -i "$F/all/f%05d.jpg" -i "$F/mix.wav" -c:v libx264 -preset slow -b:v 9M -pass 2 -pix_fmt yuv420p -passlogfile "$F/x264" -c:a aac -b:a 192k -shortest -movflags +faststart folge10.mp4
    echo "fertig: folge10.mp4" ;;
esac; done

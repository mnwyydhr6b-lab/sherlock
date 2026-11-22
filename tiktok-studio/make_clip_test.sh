#!/usr/bin/env bash
# Testclip bauen: Frames rendern, Ton mischen, MP4 erzeugen.  Aufruf: ./make_clip_test.sh [ordner]
set -euo pipefail; cd "$(dirname "$0")"; F=${1:-/tmp/clip_frames}; D=8.0
node render.js clip_test.html "$F" $D 30
# Ton: Nacht-Atmo, gedämpfte Partymusik (wird lauter), Partygemurmel, Schritte bis zum Stehenbleiben (~5,8 s), dumpfer Schlag beim Zähler-Abfall (~6,8 s)
ffmpeg -y -v error -i audio/night_amb.mp3 -i audio/music.mp3 -i audio/crowd.mp3 -i audio/steps_walk.mp3 -i audio/hit.mp3 -filter_complex "\
[0]volume=0.28[a];[1]lowpass=f=520,volume='0.05+0.11*t/8':eval=frame[b];[2]lowpass=f=1400,volume='0.03+0.05*t/8':eval=frame[c];\
[3]atrim=0:5.9,afade=t=out:st=5.3:d=0.6,volume=0.6[d];[4]adelay=6770|6770,volume=0.75[e];\
[a][b][c][d][e]amix=inputs=5:normalize=0,atrim=0:$D,afade=t=out:st=7.4:d=0.6[out]" -map "[out]" -c:a pcm_s16le /tmp/clip_test_mix.wav
ffmpeg -y -v error -framerate 30 -i "$F/f%05d.jpg" -i /tmp/clip_test_mix.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart clip_test.mp4
echo "fertig: clip_test.mp4"

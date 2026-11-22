#!/usr/bin/env bash
# Erzeugt die Bewegungsbibliothek assets/moves/moves_m.glb + moves_f.glb neu (Skelett in T-Pose + Animationen, ohne Kleidung).
# Quelle: Ara3D (github.com/olatunde85/3d-gen, MIT; Figurendaten CC0 MakeHuman, Bewegungen CMU-Mocap, kommerziell nutzbar).
# Braucht Node 20+ und Netz zu npm + GitHub (die CLI lädt beim ersten Lauf ca. 50 MB Figurendaten).
# Verwendung in Szenen: kit_retarget.js (loadMoves + retarget).
set -euo pipefail
cd "$(dirname "$0")"; T=$(mktemp -d); export ARA3D_CACHE="${ARA3D_CACHE:-$T/cache}"
MOVES="idle,texting,phone_call,talk_gestures,talk,sit_idle,sit_down,stand_up,laugh,laugh_hard,cry,wave,point,thumbs_up,clap,look_around,lean_wall,walk,walk_slouch,cheer,dance_groove,dance_bounce,open_door,handshake,pick_up,bow"
for k in m f; do g=$([ $k = m ] && echo 1 || echo 0); mu=$([ $k = m ] && echo 0.6 || echo 0.5)
  cat > "$T/moves_$k.json" <<J
{"kind":"ara-character","version":1,"params":{"name":"moves_$k","gender":$g,"ageYears":20,"height":0.75,"muscle":$mu,"caucasian":1,"african":0,"asian":0,
 "outfit":"none","top":"none","bottom":"none","shoes":"none","hair":"none","detail":"low","rig":"game","faceBones":false,"faceShapes":true,"speechShapes":false,"restPose":"T"}}
J
done
npx -y ara3d@0.13.0 export --params "$T/moves_m.json" --params "$T/moves_f.json" --animations "$MOVES" --out "$T/out"
mkdir -p assets/moves && cp "$T/out/moves_m.glb" "$T/out/moves_f.glb" assets/moves/
rm -rf "$T"; ls -la assets/moves

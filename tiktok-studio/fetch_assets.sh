#!/usr/bin/env bash
# Fallback: lädt die 3D-Assets neu (falls tiktok-studio/assets fehlt). Alle Assets sind CC0 (Quaternius).
# Quellen:
#   Figuren + 86 Animationen: github.com/NafisRayan/Animate-Rigged-Humanoid-No-Blender (test/human_*.glb)
#   Frisuren + Haut-Texturen:  dasselbe Repo, Ordner "Universal Base Characters[Standard]"
#   Autos:                     github.com/Touhid-HZ/shooter-asset-library (assets/vehicles/q-cars-*.glb)
#   Gebäude/Natur/Straße:      github.com/trebeljahr/quaternius-showcase (public/glb/*) – nur für ältere Tests
set -euo pipefail
cd "$(dirname "$0")"; T=$(mktemp -d)
fetch() { # repo, sparse paths...
  local r=$1; shift; local d="$T/${r//\//_}"
  git clone -q --filter=blob:none --no-checkout --depth 1 "https://github.com/$r" "$d"
  (cd "$d" && git sparse-checkout init --no-cone && printf '%s\n' "$@" > .git/info/sparse-checkout && git checkout -q HEAD); echo "$d"; }
U=$(fetch NafisRayan/Animate-Rigged-Humanoid-No-Blender "/test/human_male.glb" "/test/human_female.glb" "/Universal Base Characters\[Standard\]/Universal Base Characters\[Standard\]/Hairstyles/Origin at 0/glTF (Godot)/*" "/Universal Base Characters\[Standard\]/Universal Base Characters\[Standard\]/Base Characters/Textures/*")
mkdir -p assets/ubc assets/hair assets/skin assets/cars
cp "$U"/test/human_*.glb assets/ubc/
UB="$U/Universal Base Characters[Standard]/Universal Base Characters[Standard]"
cp "$UB/Hairstyles/Origin at 0/glTF (Godot)/"Hair_*.{gltf,bin} assets/hair/
cp "$UB/Base Characters/Textures/"T_Hair_*.png assets/hair/ 2>/dev/null || true
cp "$UB/Hairstyles/Origin at 0/glTF (Godot)/"T_Hair_*.png assets/hair/ 2>/dev/null || true
for f in T_Superhero_Male_Ligh.png T_Superhero_Male_Dark.png T_Superhero_Female_Light_BaseColor.png T_Superhero_Female_Dark_BaseColor.png; do cp "$UB/Base Characters/Textures/$f" assets/skin/; done
C=$(fetch Touhid-HZ/shooter-asset-library "/assets/vehicles/q-cars-*.glb")
cp "$C"/assets/vehicles/q-cars-*.glb assets/cars/
rm -rf "$T"; echo "Assets fertig:"; du -sh assets/*

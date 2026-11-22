# TikTok-Studio (Klötzchen-3D)

Test-Setup für das Format „Ungeschriebene Regeln“: 3D-Klötzchen-Welt in Ego-Perspektive, gerendert mit three.js in Headless-Chromium.

- `scene_strasse.html`: Testszene (nächtliche Straße, Weg zur Party, Regel Nr. 1)
- `render.js`: rendert Einzelbilder: `node render.js scene_strasse.html out_clip 8 30`
- `sfx_street.mp3`: Straßen-Atmo (ElevenLabs)
- `regel1_test.mp4`: 8-Sekunden-Testclip

Setup: `npm install` (three.js), danach Video bauen mit
`ffmpeg -framerate 30 -i out_clip/f%05d.jpg -i sfx_street.mp3 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest out.mp4`

## Spielwelt-Look (Videospiel-Stil, menschennahe Figuren)

- `spielwelt.html`: deutsche Vorstadtstraße bei Nacht, Partyhaus mit Vorgarten, Gäste, Held mit Handy am Gartentor
- `kit_human.js`: Figuren auf Basis der Quaternius *Universal Base Characters* (CC0) mit prozeduraler Kleidung, Frisuren, Sneakern, Arm-IK
- `kit_house.js`: prozedurales Einfamilienhaus (Biberschwanz-Dach, Rollläden, Fenster mit Innenraum-Atlas, Garage, Vordach)
- `kit_nature.js`, `kit_street.js`, `kit_world.js`: Bäume, Hecken, Rasen, Laternen, Mülltonnen, Ballons, Lichterketten, Texturen
- `spielwelt_keyvisual.png`: Key-Visual (1080×1920)

Assets (nicht im Repo, unter `assets/`): `ubc/human_male.glb`, `ubc/human_female.glb`, `hair/`, `skin/` (Quaternius UBC, CC0) und `cars/` (Quaternius Cars, CC0).
Rendern: `node still.js "spielwelt.html?pinkI=0.7&exp=1.12&sat=1.15" out.png 2`

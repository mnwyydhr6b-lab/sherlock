# TikTok-Studio (Klötzchen-3D)

Test-Setup für das Format „Ungeschriebene Regeln“: 3D-Klötzchen-Welt in Ego-Perspektive, gerendert mit three.js in Headless-Chromium.

- `scene_strasse.html`: Testszene (nächtliche Straße, Weg zur Party, Regel Nr. 1)
- `render.js`: rendert Einzelbilder: `node render.js scene_strasse.html out_clip 8 30`
- `sfx_street.mp3`: Straßen-Atmo (ElevenLabs)
- `regel1_test.mp4`: 8-Sekunden-Testclip

Setup: `npm install` (three.js), danach Video bauen mit
`ffmpeg -framerate 30 -i out_clip/f%05d.jpg -i sfx_street.mp3 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest out.mp4`

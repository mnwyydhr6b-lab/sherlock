# Übergabe – TikTok-Projekt „Ungeschriebene Regeln“

> Lebendes Dokument. Stand: 22.11.2026. Wird bis zum Start laufend ergänzt.
> Neuer Chat: Diese Datei zuerst komplett lesen, dann bei **„7. Nächste Schritte“** weitermachen.

## 1. Ziel und Rahmen

- Deutscher TikTok-Creator, ca. 2.700 Follower. Ziel: 10.000 Follower → **Creator Rewards Program (CRP)**.
- CRP-Voraussetzungen laut Drittquellen (Nov. 2026; in TikTok Studio gegenprüfen):
  - 18+
  - 10.000 Follower
  - 100.000 Videoaufrufe in den letzten 30 Tagen
  - **nur Videos ab 1 Minute werden vergütet**
  - nur Originalinhalte
- Rahmenbedingungen:
  - komplett gesichtslos (faceless), Sprache Deutsch
  - tägliches Posten möglich
  - Nutzer hat nur ein iPhone und keine 3D-Erfahrung → Claude produziert alles in der Cloud.
- Kosten: Higgsfield ist zu teuer (nicht nutzen). ElevenLabs ist als verbundener Dienst verfügbar (Ton, Stimmen).
- Posten ist erst ab ca. **29.11.2026** möglich. Bis dahin wird alles rundherum vorbereitet.

## 2. Format

- **Nische:** „Ungeschriebene Regeln“ – Lebensregeln für Jüngere, die die echte Welt noch nicht kennen, z. B. „Wenn du nicht eingeladen bist, geh nicht hin.“
  - Erzählt als spannende 3D-Geschichte mit eigenen Figuren, kaum Text zum Lesen.
  - Vorbild: Wertevermittlung wie im Adler-Gleichnis, Stil wie die viralen 3D-„Was wäre, wenn …?“-Videos.
- **Aufbau einer Folge** (aus dem Piloten „Regel Nr. 1“, 42 s):
  - Hook draußen: Er läuft, sieht Leons Party-Story und geht innerhalb von 5 s hin.
  - Zähler **„Selbstrespekt“** oben im Bild fällt in Stufen (100 → 85 → 72 → 55 → 38 → 19 → 5 %) und blinkt rot bei jedem Abfall.
  - Mit dem Zähler verliert die Welt Farbe (Sättigung sinkt).
  - Figuren sprechen nur kurze Sätze (ElevenLabs).
  - Erzähler-Untertitel in kurzen Sätzen.
  - **Ende wie im „9 Schüsse“-Video:**
    - dunkles Overlay
    - weißer Titel „Was wäre, wenn …?“
    - gelbe kursive Frage, z. B. „Wärst du trotzdem hingegangen?“ (lädt zum Kommentieren ein)
- **Länge:** Pilot 40–45 s. Wegen der CRP-Regel ab 1 Minute ist die Länge noch offen, siehe Abschnitt 7.
- **Regel Nr. 1 – Pilot-Skript (Untertitel / Stimmen):**
  - 4,1 s: „Vielleicht haben sie’s vergessen.“
  - 8,6 s: Leon: „Oh … hey.“
  - 10,3 s: Du: „Ich bleib nur kurz.“
  - 13,6 s: „Erst merkt es keiner.“
  - 17,8 s: „Dann merkt es jeder.“
  - 25,0 s: „Seit 3 Wochen geplant.“
  - 28,5 s: Flüstern: „Wer hat den eingeladen?“
  - 34,3 s: „Du bist geblieben. Die Stimmung nicht.“
  - Ende: „Was wäre, wenn du hingehst, obwohl du nicht eingeladen bist?“ und „Wärst du trotzdem hingegangen?“
  - Er drängt sich rein und bleibt; nur die Stimmung der anderen kippt. Keine Afterparty.

## 3. Look – „Spielwelt“ (vom Nutzer freigegeben am 22.11.2026)

- Look: wie ein 3D-Videospiel, menschennahe Figuren, aber nicht realistisch (Richtung Sims).
- Welt: deutsche Vorstadt bei Nacht mit Partyhaus.
- Key-Visual: `tiktok-studio/spielwelt_keyvisual.png`
- **Abgelehnt, nicht wieder vorschlagen:**
  - Klötzchen-, Minecraft-, Roblox- und Comic-Look, Holz-Spielzeugwelt („Holzwelt“)
  - Mystery, Märchen-Bürokratie, Alltags-Krimi-Rätsel, „seltsame Orte“, Aufzug-Horror
  - reine Wissens- oder Fakten-Inhalte, Inhalte ohne eigene Figuren
- Die alten Pilot-Videos `regel1*.mp4` (Klötzchen-Look) dienen nur noch als Referenz für Timing und Dramaturgie.

## 4. Technik

**Repo und Setup**

- Repo `mnwyydhr6b-lab/sherlock`, Branch `claude/wizardly-rubin-v81hm1`, alles im Ordner `tiktok-studio/`.
- Setup in einer neuen Cloud-Session: `cd tiktok-studio && npm install`.
  - Installiert three 0.170 sowie die Schriften Inter und EB Garamond.
  - Chromium und Playwright sind im Container vorinstalliert.
- Rendering: three.js in Headless-Chromium mit SwiftShader. Ein 2×-Standbild dauert etwa 30–60 s.

**Befehle**

- Standbild rendern:
  ```
  node still.js "spielwelt.html?pinkI=0.7&exp=1.12&sat=1.15" out.png 2
  ```
  Danach mit PIL (Lanczos) von 2160×3840 auf 1080×1920 verkleinern.
- Video rendern:
  - `render.js` rendert Bildfolgen über `window.renderFrame(t)` (so beim alten Piloten `regel1_v4.html`).
  - **Für die Spielwelt gibt es noch keine Zeitleiste und keine Animation** → Abschnitt 7.
- Ton:
  - `mix.py` mischt die Tonspur (ffmpeg: adelay, amix).
  - Klänge und Stimmen liegen in `audio/`.
- Encoding für TikTok: libx264, Two-Pass mit 9 Mbit/s (CRF mit Filmkorn wurde 271 MB groß).

**Szenen-Parameter von `spielwelt.html` (URL)**

| Parameter | Wirkung |
|---|---|
| `cx`, `cy`, `cz` / `tx`, `ty`, `tz` / `fov` | Kamera-Position / Blickziel / Brennweite |
| `hx`, `hz`, `hry` | Position und Drehung des Helden |
| `hanim` | Animation des Helden |
| `exp`, `sat`, `con`, `vig`, `bloom`, `ap`, `dof=0` | Bildlook |
| `pinkI`, `hemi`, `moon`, `lampI`, `env` | Licht |
| `nochar=1` | ohne Figuren (schnelle Tests) |

**Bausteine (Kits)**

- `kit_human.js`
  - Figuren aus den Quaternius *Universal Base Characters* (CC0) mit 86 Animationen.
  - Prozedurale Kleidung:
    - Oberteil `hoodie`, `tee`, `shirt` oder `jacket`
    - Jeans und Sneaker
  - Frisuren: SimpleParted, Buzzed, Long, Buns, BuzzedFemale, Beard
  - Haut: `light` oder `dark`
  - Weitere Funktionen:
    - `slim` für eine schlankere Statur
    - `armIK(root, 'l'|'r', zielWelt, poleRichtung)`
    - `rotBoneWorld()`
  - Nützliche Animationen:
    - Stehen und Reden: Idle_Loop, Idle_Talking_Loop, Idle_TalkingPhone_Loop, Idle_FoldArms_Loop, Idle_No_Loop
    - Bewegung: Dance_Loop, Walk_Loop, Walk_Formal_Loop, Jog_Fwd_Loop, Push_Loop
    - Sitzen: Sitting_Idle_Loop, Sitting_Talking_Loop
    - Gesten: Consume, Interact, Yes, Hit_Chest
  - Handy-Pose: Idle_Loop plus `armIK` der rechten Hand vor die Brust, Kopf über `rotBoneWorld` nach unten geneigt (siehe `spielwelt.html`).
- `kit_house.js` – `makeHouse()`: prozedurales Einfamilienhaus.
  - Biberschwanz-Dach, Rollläden, Fenster mit Innenraum-Atlas (`TILE.*`, Party-Fenster mit tanzenden Silhouetten)
  - offene Tür mit beleuchtetem Flur, Vordach, Wandlampe, Hausnummer, Garage, Dachfenster, Schornstein
- `kit_nature.js`: Bäume aus Laub-Büscheln, Hecken, Büsche, Grasbüschel.
- `kit_street.js`: Straßenlaterne, Mülltonnen (grau, blau, braun), Torpfeiler, Gartentor, Briefkasten, Zone-30- und Straßenschild, Ballons, Lichterketten, Becher, Pappschild.
- `kit_world.js`: prozedurale Texturen mit triplanarem Mapping (Putz, Gehwegplatten, Pflaster, Asphalt, Rasen, Ziegel, Dachziegel, Rollladen, Garagentor, Holz).

**Assets**

- Liegen in `tiktok-studio/assets/` (ubc, hair, skin, cars; CC0).
- Ersatz-Download mit `./fetch_assets.sh`. Die Quellen stehen im Skript.

**ElevenLabs**

- Die Anmeldung übernimmt der Proxy; als Header `xi-api-key: dummy` mitsenden.
- Endpunkte:
  - `/v1/text-to-speech/{voice}` (eleven_v3, `language_code: de`, Audio-Tags wie `[whispers]`)
  - `/v1/sound-generation`
  - `/v1/speech-to-text` (scribe_v1)
- Stimmen:
  - Leon: `IeQubAjK1ujbppIdhJw4`
  - Du: `UFMIjG2r9JyefPpfkQoL`
  - Flüstern: `RMDEjuHXo5bcQLkbu6MB`

**Bekannte Stolpersteine**

- Halsausschnitt der Kleidung als Zylinder statt Ebene, sonst entsteht ein Loch an der Schulter (behoben).
- Dünne Objekte mit `cast: false`, sonst werfen sie Mond-Schattenlinien.
- Pinkes Partylicht sparsam einsetzen (`pinkI` ca. 0,7), sonst wird die Hauswand komplett pink.
- Netzwerk:
  - Gesperrt: kenney.nl, quaternius.com, poly.pizza, opengameart, tiktok.com
  - GitHub per `git clone` funktioniert.
  - api.github.com liefert 403; für Suchen `gh api -X GET search/...` nutzen.

## 5. Nutzer-Vorlieben (wichtig)

- Mag Videos, die man ohne Lesen versteht, mit 3D-Optik, Spannung und Gänsehaut.
- Will eigene Figuren und Details – „die Details machen es aus“.
- Will auf Deutsch kurz und klar informiert werden.
- Antwortet manchmal nicht auf Auswahl-Dialoge; dann einfache Textoptionen anbieten.

## 6. Vorbereitung bis zum Start (Checkliste)

- [x] Spielwelt gebaut und freigegeben, Assets im Repo gesichert
- [ ] Länge der Folgen festlegen (CRP: ab 1 Minute)
- [ ] Kanal-Auftritt: bestehender Account oder neuer, Name, Bio, Profilbild im Spielwelt-Look
- [ ] Folgenliste: 30 Regeln, nach Viral-Potenzial sortiert
- [ ] Skripte für die ersten 7–10 Folgen (Hook, Ablauf, Sätze, Zähler-Stufen, Endfrage)
- [ ] Serien-Bibel: Hauptfigur, wiederkehrende Figuren, Orte, Stimmen, Musik, Ende-Karte
- [ ] Posting-Plan: Uhrzeiten, Captions, Hashtags, Titelbilder, KI-Kennzeichnung
- [ ] Animations-System für die Spielwelt (Zeitleiste, Kamerafahrten, Laufen, Ton) und Testclip
- [ ] Optional: Vorrat an fertigen Videos für die erste Woche

## 7. Nächste Schritte

Wird beim Abschluss der Vorbereitung ausgefüllt.

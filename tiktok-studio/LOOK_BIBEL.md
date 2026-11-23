# Look-Bibel – „Ungeschriebene Regeln“

Diese Datei legt fest, wie die Serie aussieht. **Vor jeder neuen Szene lesen und die Referenzbilder in `look/` ansehen** (mit dem Read-Tool kann Claude Bilder anschauen).

## 1. Der Look in einem Satz

**Klötzchen-Figuren in einer detaillierten 3D-Spielwelt:** Die Figuren bestehen aus weichen, abgerundeten Blöcken mit gezeichnetem, ausdrucksstarkem Gesicht. Die Welt dagegen ist eine stilisierte, aber sehr detailreiche deutsche Alltagswelt mit filmischem Licht. Dieser Kontrast ist unser Erkennungszeichen.

- Seit 23.11.2026 (vom Nutzer freigegeben). Die alten menschennahen Figuren (UBC mit Fingern, Kleidungshüllen) sind abgelöst, weil sie immer wieder Fehler hatten (Handy in der Hand, verschwundene Hand, Loch am Hals).
- Die Welt (Straße, Partyhaus, Zimmer, Schule, alle Details) bleibt unverändert.

## 2. Referenzbilder (`look/`)

| Datei | Zeigt |
|---|---|
| `besetzung.png` | Alle 8 festen Figuren nebeneinander (Farben, Frisuren, Kleidung) |
| `hauptfigur_du.png` | „Du“ von vorne, schräg, seitlich, hinten |
| `mimik.png` | Gesichtsausdrücke von Du und Mia (happy, laugh, sad, angry, surprised, awkward, sideeye, shocked, neutral) |
| `bewegungen.png` | Härtetest: 16 übertragene Bewegungen an allen Figuren |
| `set_strasse_nacht.png` | Set 1: Lindenweg nachts, Partyhaus Nr. 7, Gartentor, Ballons, Lichterketten |
| `set_zimmer_bett.png` / `set_zimmer_schreibtisch.png` | Set 2: Jugendzimmer von „Du“ nachts (LED-Streifen, Gaming-Ecke) |
| `set_schule_tag.png` | Set 3: Gesamtschule Lindenhof bei Tag, Schulhof |
| `uebersicht_sets.png` | Alle Sets nebeneinander |
| `../kanal/profilbild.png` | Profilbild des Kanals „Regeln TV“: Du mit Sonnenbrille, goldener Aura und verschränkten Armen, Szene `profil_aura.html?v=3` |

Der Look gilt als getroffen, wenn ein neues Bild neben diesen Referenzen wie aus demselben Spiel aussieht.

## 3. Feste Regeln

**Technik**
- Jede Szene startet mit `createStage({ preset })` aus `kit_look.js`. Nie einen eigenen Renderer, eigenes Licht oder eigene Nachbearbeitung bauen.
- Presets:

  | Preset | Einsatz |
  |---|---|
  | `nacht` | Außen, blaue Stunde/Nacht |
  | `abend` | Sonnenuntergang |
  | `tag` | Sonne, Quellwolken |
  | `innen_nacht` | Innenraum, Licht von Lampen |
  | `innen_tag` | Innenraum mit Sonne durchs Fenster |
  | `studio` | Figuren-Tests |

- Fertige Orte kommen aus den Sets: `set_strasse.js`, `set_zimmer.js`, `set_schule.js`.
- Neue Orte nur aus den Baukästen bauen:
  - Innenräume: `kit_interior.js`
  - Häuser: `kit_house.js`
  - Pflanzen: `kit_nature.js`
  - Straßenmöbel und Party-Deko: `kit_street.js`
  - Texturen: `kit_world.js`

**Figuren (Klötzchen, `kit_block.js`)**
- Nur `spawnBlock('du' | 'mia' | 'leon' | 'jasmin' | 'tarik' | 'ben' | 'mama' | 'papa', { x, y, z, ry, anim, time })` verwenden. Aussehen steht in `BLOCK_CAST`.
- Farben, Frisuren und Kleidung der festen Figuren **nie** ändern.
- Statisten: `spawnBlock('ben', { spec: { … } })` für Männer bzw. `spawnBlock('mia', { spec: { … } })` für Frauen (der Name bestimmt nur Skelett und Statur), mit eigenen Farben: `spec: { shirt: 0x…, pants: 0x…, hair: 0x…, hairStyle: 'short'|'buzz'|'long'|'bun', top: 'hoodie'|'jacket'|'shirt'|'tee', skin: 0x… }`. Immer andere Farben als die feste Besetzung.
- Aufbau: Jeder Block hängt starr an einem Knochen des Skeletts. Es gibt keine Finger, keine Haut und keine Kleidungshülle. Deshalb kann nichts durchstechen oder verschwinden.
- Die Figuren nutzen das Skelett der alten Figuren, darum laufen alle 86 Skelett-Animationen (z. B. `Idle_Loop`, `Walk_Loop`, `Dance_Loop`, `Sitting_Idle_Loop`) und alle Posen-Helfer aus `kit_cast.js` (`sitOn`, `faceTo`, `lookAt`, `holdCup`, `posePhone`).

**Mimik**
- Gesicht: `h.userData.blockFace.set(ausdruck, { talk, blink, look, blush })`
  - Ausdrücke: `neutral`, `happy`, `laugh`, `sad`, `angry`, `surprised`, `awkward`, `sideeye`, `shocked`, `smirk`, `cool` (halb geschlossene Lider + Grinsen, lässig/souverän; genutzt im Profilbild)
  - `talk` 0…1 öffnet den Mund (aus der Stimme: `lipAt(t, hüllkurve, start, 0.8)`), `blink` 0/1 (`blinkAt(t, seed)`), `look: [x, y]` Blickrichtung (−1…1), `blush` 0…1 rote Wangen
  - Im Video jedes Frame neu setzen. Fertige Gesichter werden gecacht, das kostet kaum Zeit.
- Alte Aufrufe `h.userData.face.expr(...)` / `face.set({ jawOpen, blink })` funktionieren weiter.

**Keine Extra-Effekte** (Nutzer-Entscheidung 23.11.): keine Risse, keine abfallenden Blöcke, kein Glas-Splitter-Bild. Es bleibt beim normalen Format: Zähler „SELBSTRESPEKT“ mit rotem Blinken beim Abfall, Untertitel, Endkarte. Gefühle zeigen die Gesichter der Figuren.

**Bewegungen (Motion-Capture, `kit_retarget.js`)**
- 26 fertige Bewegungen: `Idle`, `Texting`, `Phone call`, `Talk with gestures`, `Talk`, `Sit idle (chair)`, `Sit down (chair)`, `Stand up (chair)`, `Laugh`, `Laugh hard`, `Cry`, `Wave`, `Point`, `Thumbs up`, `Clap`, `Look around`, `Lean on wall`, `Walk`, `Slouch walk`, `Cheer`, `Dance (groove)`, `Dance (party bounce)`, `Open door`, `Handshake`, `Pick up (ground)`, `Bow`.
- Standbild: `await loadBlockMoves(); playMove(h, 'Texting', 2.0)`.
- Video: `await loadBlockMoves(); prepMoves(h, ['Texting', 'Laugh'])`, dann im `Actor` als `{ anim: 'Ara:Texting', at: … }` und jedes Frame `syncPhone(h)` (zeigt das Handy nur während Texting/Phone call).
- Das Handy liegt dabei richtig in der Hand. Hände an Kopf oder an der anderen Hand werden automatisch nachgeführt.

**Formen und Oberflächen (Welt)**
- Abgerundete Boxen (`rbox`) statt scharfer Kästen.
- Flächen immer mit Textur: `triMat` + `T.plaster`, `T.pavers`, `T.laminat` usw.
- Keine großen einfarbigen, flachen Flächen. Kein facettierter Low-Poly-Look.

**Licht und Farben**
- Nacht: blau-violettes Grundlicht, warme Lampen, pinke Akzente nur bei Party/Gefühl.
- Tag: warme Sonne, blauer Himmel.
- Innen: Licht kommt von sichtbaren Quellen (Lampe, LED, Monitor, Handy).
- Pink-Licht sparsam einsetzen (`pinkI` ca. 0,7).

**Kamera – Ego-Perspektive (Standard)**
- Die Serie wird **aus der Sicht von „Du“** erzählt: Der Zuschauer sieht, was Du sieht. Du selbst sieht man nicht (höchstens Hände, Handy und Hoodie, wenn er nach unten schaut).
- `povHide(du)` blendet Kopf und Haare von Du aus. Kamera pro Frame mit `povPose(du, …)` → `{ eye, dir }`:
  - Gehen/Stehen: `povPose(du, { steady: true, pitch: -0.06, bob: 0.012, t })` – ruhige Kamera auf Augenhöhe, leichtes Wippen beim Gehen
  - Kopf folgt der Animation: `povPose(du)`
  - **Handy wie in Spielen:** `const ph = povPhoneRig(stage, du, { screen: partyStoryTex() })`, pro Frame `ph.set(k)` (0 = unten aus dem Bild, 1 = hochkant vor dir, Bildschirm zu dir, Klötzchen-Hände halten es). Eigene Bildschirm-Inhalte als Canvas-Textur übergeben (Vorlage: `partyStoryTex()` in `kit_block.js`). Dabei die Kamera nur leicht nach unten neigen.
  - **Chats (Nutzer-Entscheidung 23.11.): immer auf dem Handy in deinen Händen**, nicht als 2D-Einblendung. `chatTex({ name, msgs: [{ me, text, time }], seen: 'Gelesen 22:14', typing })` zeichnet einen Chat mit großer Schrift; `ph.set(1, 1)` holt das Handy zum Lesen näher an die Augen. Nachrichten im Video nacheinander zeigen: sobald eine neue dazukommt, `ph.setScreen(chatTex({ … msgs: bisher }))` (Texturen vorab einmal pro Stand erzeugen) und ein „Pling“ in den Ton legen. Beispiel: `chat_test.html` (Standard `mode=hand`; `mode=overlay` nur, falls mal sehr viel Text kommt).
  - Der Handy-Bildschirm leuchtet bewusst knapp unter der Bloom-Schwelle, damit die Schrift scharf bleibt.
  - Blick zu Personen: `dir` zum Kopf/Gesicht der Person hin mischen (die anderen reagieren mit ihren Gesichtern)
  - Übergänge mit `smooth()` zwischen den Blickrichtungen mischen (siehe `clip_test.html`), Bildwinkel 60–70
  - Schnell testen: `pov_test.html?shot=leute|handy`
- Format 1080×1920 (Hochkant).
- Bildwinkel (fov): außen 44–56, innen 52–62, Gesicht nah 36–42.
- Gegenüber stehende Figuren so platzieren, dass ihre Gesichter gut im Bild sind: Ihre Reaktionen erzählen die Geschichte.
- Tiefenschärfe auf das, was Du gerade ansieht (`stage.setFocus(punkt)`): Gesicht der Person oder Handy.

**Texte in der Welt**
- Immer Deutsch und mit erfundenen Namen (Lindenweg, Gesamtschule Lindenhof, „Schneider“).
- Keine echten Marken und keine Logos.

**Verboten**
- Pixel-Texturen wie Minecraft, Roblox-Look, Comic mit Konturlinien
- realistische Figuren (getestet und abgelehnt: Ara3D/MakeHuman) und menschennahe Figuren mit Fingern (zu fehleranfällig)
- Holz-Spielzeug-Welt
- reines Schwarz in Schatten, Neon überall

## 4. Arbeitsablauf für jede neue Szene

1. Set und Preset wählen. Figuren mit `spawnBlock` setzen, Bewegungen mit `playMove`/`prepMoves`, Posen mit den Helfern:
   - `sitOn` – sitzen (mit `Sitting_Idle_Loop`)
   - `faceTo` / `lookAt` – Blickrichtung
   - `holdCup` – Becher halten, `posePhone` – Handy im Sitzen
2. Schneller Test: `node still.js "szene.html?dof=0" test.png 0.5` (ca. 15 s). Das Bild **ansehen** und mit den Referenzen vergleichen.
3. Kamera und Licht nachjustieren. URL-Parameter helfen beim Ausprobieren:
   - Kamera: `cx`, `cy`, `cz`, `tx`, `ty`, `tz`, `fov`
   - Bildlook: `exp`, `sat`, `bloom`, `ap`
4. Finales Bild: `node still.js "szene.html?hq" out.png 2`, danach mit PIL (Lanczos) auf 1080×1920 verkleinern.
   - Video: `node render.js szene.html ordner <sekunden> 24` (ohne `hq`), danach ffmpeg wie in `make_clip_test.sh`.
   - Vor dem ersten Video-Frame `stage.limitLights(fokuspunkt, 8)` aufrufen.
5. Figuren-Härtetest bei neuen Bewegungen: `block_lineup.html?moves=…` rendern und prüfen.
6. Neuer Ort: Referenzbild nach `look/` legen und hier in Abschnitt 2 eintragen.

## 5. Sets und wichtige Punkte (Anker)

**Straße (`set_strasse.js`)**
- Straße entlang z, auf beiden Seiten durchgehend bebaut (Partyhaus Nr. 7 rechts, Haustür bei (12.5 / 0.4), dazu einfachere Nachbarhäuser mit Hecken) und an beiden Straßenrändern parkende Autos (eigene Liste über die Option `cars`).
- Anker im Objekt `ANCHOR`: `gate`, `heroAtGate`, `door`, `doorStep`, `yard`, `sidewalkR(z)`, `sidewalkL(z)`.
- Option `party: false` liefert eine normale Nacht ohne Deko. Mit Preset `tag` ist es dieselbe Straße bei Tag.

**Zimmer (`set_zimmer.js`)**
- Raum 4,2 × 3,8 m. Südwand ist für die Kamera weggeschnitten.
- Anker im Objekt `ZANCHOR`:
  - Sitzen: `bedSide`, `bedFoot`, `chairSeat`
  - Gaming: `keyboard`, `mouse`, `monitor`
- Optionen: `ledColor`, `ledI`, `duvet`, `accent`.

**Schule (`set_schule.js`)**
- Zaun bei z = 3,5 mit Tor. Fassade bei z = −24.
- Anker im Objekt `SCHANCHOR`: `pingpong`, `treeBench(i)`, `busStop`, `entrance`, `yard`.

## 6. Bekannte Stolpersteine

- Canvas-Verläufe nach `translate()` werden mitverschoben → Verläufe immer um (0, 0) definieren.
- Dünne Objekte (Seile, Stangen) mit `cast: false` erzeugen, sonst entstehen Schattenlinien.
- Fenster-Innenräume leuchten über `setWindowGlow`: nachts ca. 1,25, tags ca. 0,03.
- Figuren immer zuerst zur Szene hinzufügen, dann posieren (`posePhone`, `holdCup` brauchen `h.parent`).
- Sitzende Figuren: Animation `Sitting_Idle_Loop` und dann `sitOn(h, sitzpunkt)`.
- Der Klötzchen-Kopf ist groß: Bei Bewegungen mit Hand am Kopf (Phone call, Cry) und bei hohen Stuhllehnen kurz im Testbild prüfen.
- URL-Parameter `ty` ist für die Kamera reserviert (Blickziel), nicht für eigene Zwecke verwenden.
- Ein Standbild in doppelter Auflösung dauert 30–60 s. Tests deshalb mit Faktor 0,5 und `dof=0`.

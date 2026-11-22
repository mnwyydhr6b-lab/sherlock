# Look-Bibel – „Ungeschriebene Regeln“

Diese Datei legt fest, wie die Serie aussieht. **Vor jeder neuen Szene lesen und die Referenzbilder in `look/` ansehen** (mit dem Read-Tool kann Claude Bilder anschauen).

## 1. Der Look in einem Satz

Stilisierte 3D-Videospiel-Welt (Richtung Sims) mit menschennahen Figuren, die bewusst nicht realistisch sind. Weiche Formen, abgerundete Kanten, viele kleine Alltagsdetails aus Deutschland und filmisches Licht.

## 2. Referenzbilder (`look/`)

| Datei | Zeigt |
|---|---|
| `besetzung.png` | Alle festen Figuren nebeneinander (Kleidung, Frisur, Hautfarbe) |
| `hauptfigur_du.png` | „Du“ von vorne, schräg, seitlich, hinten (Hoodie mit Kapuze, Kordeln, Bauchtasche) |
| `set_strasse_nacht.png` | Set 1: Lindenweg nachts, Partyhaus Nr. 7, Gartentor, Ballons, Lichterketten |
| `set_zimmer_bett.png` / `set_zimmer_schreibtisch.png` | Set 2: Jugendzimmer von „Du“ nachts (LED-Streifen, Gaming-Ecke) |
| `set_schule_tag.png` | Set 3: Gesamtschule Lindenhof bei Tag, Schulhof mit Tischtennisplatte |
| `mimik.png` | Gesichtsausdrücke von Du und Mia (neutral, freut sich, lacht, traurig, wütend, überrascht, Seitenblick, peinlich berührt) |
| `profilbild.png` | Profilbild (Du, verschränkte Arme) |

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
  | `studio` | Charakterbögen |

- Fertige Orte kommen aus den Sets:
  - `set_strasse.js`
  - `set_zimmer.js`
  - `set_schule.js`
- Neue Orte nur aus den Baukästen bauen:
  - Innenräume: `kit_interior.js`
  - Häuser: `kit_house.js`
  - Pflanzen: `kit_nature.js`
  - Straßenmöbel und Party-Deko: `kit_street.js`
  - Texturen: `kit_world.js`

**Figuren**
- Nur `spawn('du' | 'ben' | 'leon' | 'mia' | 'jasmin' | 'tarik' | 'mama' | 'papa')` aus `kit_cast.js` verwenden.
- Kleidung, Farben und Frisuren der festen Figuren **nie** ändern.
- Statisten mit `makeHuman()` bauen, mit anderen Farben, damit sie nicht wie die feste Besetzung aussehen.

**Formen und Oberflächen**
- Abgerundete Boxen (`rbox`) statt scharfer Kästen.
- Flächen immer mit Textur: `triMat` + `T.plaster`, `T.pavers`, `T.laminat` usw.
- Keine großen einfarbigen, flachen Flächen. Kein facettierter Low-Poly-Look.

**Licht und Farben**
- Nacht: blau-violettes Grundlicht, warme Lampen, pinke Akzente nur bei Party/Gefühl.
- Tag: warme Sonne, blauer Himmel.
- Innen: Licht kommt von sichtbaren Quellen (Lampe, LED, Monitor, Handy).
- Pink-Licht sparsam einsetzen (`pinkI` ca. 0,7).

**Mimik und Gestik**
- Emotionen über `face.expr(...)` zeigen, beim Sprechen immer `lipAt` verwenden, alle Figuren blinzeln lassen (`blinkAt`).
- Starke Gefühle von „Du“ lieber über Ich-Perspektive, Körpersprache (Animationen), Licht und Ton erzählen statt über Großaufnahmen.
- Fingergesten sind noch nicht verlässlich. Bis der Hand-Baukasten steht, Hände über Animationen und `armIK` führen und keine Fingerposen von Hand bauen.

**Kamera**
- Format 1080×1920 (Hochkant).
- Bildwinkel (fov): außen 46–56, innen 52–62.
- Kamerahöhe 1,5–1,9 m oder Über-die-Schulter.
- Tiefenschärfe auf den Kopf der Hauptfigur (`stage.build({ focus })`, Blende 0,0006–0,0009).

**Texte in der Welt**
- Immer Deutsch und mit erfundenen Namen (Lindenweg, Gesamtschule Lindenhof, „Schneider“).
- Keine echten Marken und keine Logos.

**Verboten**
- Klötzchen-, Minecraft-, Roblox- und Comic-Look mit Konturlinien
- Holz-Spielzeug-Look
- Fotorealismus
- reines Schwarz in Schatten
- Neon überall

## 4. Arbeitsablauf für jede neue Szene

1. Set und Preset wählen. Figuren mit `spawn` setzen, Posen mit den Helfern:
   - `posePhone` – Handy halten
   - `sitOn` – sitzen
   - `faceTo` / `lookAt` – Blickrichtung
   - `holdCup` – Becher halten
   - `armIK` – Hand an einen Punkt führen
2. Schneller Test: `node still.js "szene.html?dof=0" test.png 1` (ca. 20 s). Das Bild **ansehen** und mit den Referenzen vergleichen.
3. Kamera und Licht nachjustieren. URL-Parameter helfen beim Ausprobieren:
   - Kamera: `cx`, `cy`, `cz`, `tx`, `ty`, `tz`, `fov`
   - Bildlook: `exp`, `sat`, `bloom`, `ap`
4. Finales Bild: `node still.js "szene.html?hq" out.png 2`, danach mit PIL (Lanczos) auf 1080×1920 verkleinern.
   - Video: `node render.js szene.html ordner <sekunden> 24` (ohne `hq`, ca. 5,6 s pro Frame), danach ffmpeg wie in `make_clip_test.sh`.
   - Vor dem ersten Video-Frame `stage.limitLights(fokuspunkt, 8)` aufrufen.
5. Neuer Ort: Referenzbild nach `look/` legen und hier in Abschnitt 2 eintragen.

## 5. Sets und wichtige Punkte (Anker)

**Straße (`set_strasse.js`)**
- Straße entlang z. Partyhaus rechts, Haustür bei (12.5 / 0.4).
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
- Figuren immer zuerst zur Szene hinzufügen, dann posieren (`posePhone` braucht `h.parent`).
- Sitzende Figuren: Animation `Sitting_Idle_Loop` und dann `sitOn(h, sitzpunkt)`.
- Ein Standbild in doppelter Auflösung dauert 30–60 s. Tests deshalb mit Faktor 1 und `dof=0`.

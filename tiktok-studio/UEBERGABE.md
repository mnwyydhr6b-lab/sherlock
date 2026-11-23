# Übergabe – TikTok-Projekt „Ungeschriebene Regeln“

> Lebendes Dokument. Stand: 23.11.2026. Wird bis zum Start laufend ergänzt.
> **Wichtigste Änderung am 23.11.:** Die Figuren sind jetzt **Klötzchen-Figuren** (`kit_block.js`) in der unveränderten, detaillierten Spielwelt. Alles dazu steht in `LOOK_BIBEL.md`.
> Neuer Chat: Diese Datei zuerst komplett lesen, dann **`LOOK_BIBEL.md`** lesen und die Bilder in **`look/`** ansehen. Danach bei **„7. Nächste Schritte“** weitermachen.

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
- **Account:** Der bestehende Account (ca. 2.700 Follower) wird weitergenutzt und auf die neue Nische umgestellt (entschieden am 22.11.).
- **Kanal (23.11.):** Name **„Regeln TV“**, Bio **„Regeln für mehr Selbstrespekt“**, Profilbild `kanal/profilbild.png`.

## 2. Format

- **Nische:** „Ungeschriebene Regeln“ – Lebensregeln für Jüngere, die die echte Welt noch nicht kennen, z. B. „Wenn du nicht eingeladen bist, geh nicht hin.“
  - Erzählt als spannende 3D-Geschichte mit eigenen Figuren, kaum Text zum Lesen.
  - Vorbild: Wertevermittlung wie im Adler-Gleichnis, Stil wie die viralen 3D-„Was wäre, wenn …?“-Videos.
- **Aufbau einer Folge** (aus dem Piloten „Regel Nr. 1“, 42 s):
  - Hook draußen: Er läuft, sieht Leons Party-Story und geht innerhalb von 5 s hin.
  - Zähler **„Selbstrespekt“** oben im Bild fällt in Stufen (100 → 85 → 72 → 55 → 38 → 19 → 5 %) und blinkt rot bei jedem Abfall.
  - Mit dem Zähler verliert die Welt Farbe (Sättigung sinkt).
  - **Ego-Perspektive:** Alles wird aus der Sicht von „Du“ gezeigt. Keine Extra-Effekte (keine Risse o. Ä., Nutzer 23.11.: „Es soll alles normal bleiben.“).
  - Figuren sprechen nur kurze Sätze (ElevenLabs).
  - Erzähler-Untertitel in kurzen Sätzen.
  - **Ende wie im „9 Schüsse“-Video:**
    - dunkles Overlay
    - weißer Titel „Was wäre, wenn …?“
    - gelbe kursive Frage, z. B. „Wärst du trotzdem hingegangen?“ (lädt zum Kommentieren ein)
- **Länge (entschieden am 22.11.):** **50 Sekunden pro Folge bis 10.000 Follower.** Danach (CRP) auf 61–70 s umstellen, weil nur Videos ab 1 Minute vergütet werden.
  - Pilot-Referenz: 42 s.
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

## 3. Look – Klötzchen-Figuren in der „Spielwelt“ (Welt freigegeben am 22.11., Figuren am 23.11.2026)

- **Figuren:** weiche Klötzchen mit gezeichnetem, ausdrucksstarkem Gesicht (`kit_block.js`). Nutzer: „Ja das passt sehr gut.“
  - Abgelöst: die menschennahen Figuren mit Fingern und Kleidungshüllen (immer wieder Fehler: Handy in der Faust, Hand weg, Loch am Hals) und realistische Figuren (Ara3D, „zu realistisch“).
- **Welt:** bleibt komplett, wie sie ist („die hat mir gefallen mit den ganzen Details“). Deutschland im Alltag, stilisiert, sehr detailreich, filmisches Licht. Drei fertige Orte im selben Look:
  - Straße/Partyhaus bei Nacht
  - Jugendzimmer
  - Schule bei Tag
- **Look-Regeln, Referenzbilder und Arbeitsablauf: `LOOK_BIBEL.md` + Ordner `look/`.** Damit lassen sich neue Orte im gleichen Look bauen.
- Key-Visual: `tiktok-studio/spielwelt_keyvisual.png` (aktuelle Fassung: `look/set_strasse_nacht.png`)
- **Abgelehnt, nicht wieder vorschlagen:**
  - Minecraft-Pixel-Look, Roblox-Look, Comic-Look, Holz-Spielzeugwelt („Holzwelt“)
  - realistische Figuren, menschennahe Figuren mit Fingern (fehleranfällig), Low-Poly-Fertigfiguren
  - Mystery, Märchen-Bürokratie, Alltags-Krimi-Rätsel, „seltsame Orte“, Aufzug-Horror
  - reine Wissens- oder Fakten-Inhalte, Inhalte ohne eigene Figuren
- Die alten Pilot-Videos `regel1*.mp4` (Pixel-Klötzchen in einfacher Welt) dienen nur noch als Referenz für Timing und Dramaturgie.

## 4. Technik

**Repo und Setup**

- Repo `mnwyydhr6b-lab/sherlock`, Branch `claude/wizardly-rubin-v81hm1`, alles im Ordner `tiktok-studio/`.
- Setup in einer neuen Cloud-Session: `cd tiktok-studio && npm install`.
  - Installiert three 0.170 sowie die Schriften Inter und EB Garamond.
  - Chromium und Playwright sind im Container vorinstalliert.
- Rendering: three.js in Headless-Chromium mit SwiftShader. Ein 2×-Standbild dauert etwa 30–60 s.

**Befehle**

- Standbild rendern (Szenen-Seiten: `spielwelt.html`, `zimmer.html?shot=bett|desk`, `schule.html`; Figuren-Tests: `block_lineup.html` mit Breite/Höhe 1920 1080, `block_test.html?shot=strasse|nah|peinlich`):
  ```
  node still.js "spielwelt.html" out.png 2
  node still.js "block_lineup.html?moves=Texting,Laugh" out.png 1 1920 1080
  ```
  Danach mit PIL (Lanczos) von 2160×3840 auf 1080×1920 verkleinern.
- Video rendern:
  - Befehl: `node render.js clip_test.html <ordner> <sekunden> 24` → JPG-Bildfolge, danach mit ffmpeg zu MP4 (komplett: `./make_clip_test.sh`).
  - **Vorlage für jede Folge: `clip_test.html`** (10-s-Testclip in Ego-Perspektive mit Klötzchen: Du geht die bebaute Straße entlang zur Party, bleibt am Tor stehen und schaut zu den Gästen, deren Gesichter umschlagen, der Zähler fällt, dann holt er das Handy hoch – hochkant vor dir, Leons Story auf dem Bildschirm (`povPhoneRig`); Zähler und Untertitel).
  - `kit_anim.js`:
    - `Actor`: Animationen mit Überblendung, Laufweg, Drehung, `after`-Hook für Kopf/IK
    - `clipSpeed`: Laufgeschwindigkeit messen, damit die Füße nicht rutschen
    - `keys`, `cameraAt`: Keyframes und Kamerafahrt
  - `kit_hud.js` (Serien-Overlay):
    - Ort/Uhrzeit, Zähler „SELBSTRESPEKT“ mit rotem Blinken
    - Untertitel, Endkarte „Was wäre, wenn …?“ und gelbe Frage
  - Wichtig: Alles ist eine Funktion der Zeit `t`, deshalb ist jedes Frame reproduzierbar.
  - **Render-Tempo (optimiert am 22.11.):** ca. 5,6 s pro Frame bei 1080×1920, vorher 12,4 s.
    - Empfehlung: **24 fps** – eine 50-s-Folge sind 1.200 Frames, also ca. **1,9 h** Renderzeit (im Hintergrund laufen lassen).
    - Paralleles Rendern bringt nur ca. 10 %, weil SwiftShader die 4 Kerne schon nutzt.
  - Eingebaute Optimierungen:
    - Laub mit Detailstufe 1 und Lambert-Material
    - Schatten-Stellvertreter für Bäume und Hecken (Ebene 3)
    - Umgebungsverdeckung in halber Auflösung; die Tiefenschärfe nutzt deren Tiefe
    - Himmelslicht (Env-Map) nur auf glänzenden Materialien, matte Flächen über ein stärkeres Hemisphärenlicht
    - Triplanar-Texturen mit einer Projektion statt drei
    - PCF-Schatten
    - `stage.limitLights(punkt, 8)`
  - Für Standbilder (Key-Visuals, Referenzen) `?hq` anhängen: alles in höchster Qualität (feines Laub, volle Nachbearbeitung, weiche Schatten). Für Videos ohne `hq` rendern.
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

**Aufbau (neu seit 22.11.)**

- `kit_look.js` – `createStage({ preset })`: Renderer, Himmel, Licht und Nachbearbeitung als feste Presets.
  - Presets: `nacht`, `abend`, `tag`, `innen_nacht`, `innen_tag`, `studio`
  - Methoden: `view()`, `build({ focus })`, `aimKey()`, `ready()`
- `kit_block.js` – **die Figuren der Serie:** `spawnBlock(name)`, Gesicht `blockFace.set()`, Bewegungen `loadBlockMoves()` / `playMove()` / `prepMoves()` / `syncPhone()`, Ego-Perspektive `povHide()` / `povPose()` / `povCamera()` / `povPhoneRig()` (Handy vor der Kamera wie in Spielen). Details in `LOOK_BIBEL.md`.
- `kit_retarget.js` + `assets/moves/` – 26 Motion-Capture-Bewegungen (Ara3D-Bibliothek, CMU-Mocap, kommerziell nutzbar) werden auf unser Skelett übertragen. Neu erzeugen: `./make_moves.sh` (braucht npm und GitHub).
- `kit_cast.js` – Skelett/Grunddaten der Besetzung (`spawn` wird intern von `spawnBlock` genutzt), plus Posen-Helfer:
  - `posePhone` (Handy halten), `holdCup` (Becher halten), `sitOn` (sitzen)
  - `faceTo` (Figur zu einem Punkt drehen), `lookAt` (Kopf zu einem Punkt drehen)
- `kit_interior.js` – `makeRoom()` mit Fenstern, Türen, Heizkörper und Rollladenkasten.
  - Möbel: Bett, Schreibtisch, Gaming-Stuhl, Monitor, Tastatur, Lampe, Schrank, Regal
  - Deko: Poster, Teppich, LED-Streifen, Pflanze, Rucksack, Klamotten, Dose
- Sets:
  - `set_strasse.js` (`buildStrasse`)
  - `set_zimmer.js` (`buildZimmer`)
  - `set_schule.js` (`buildSchule`: Schulhof, Tischtennis, Basketball, Fahrräder, Bushaltestelle)
- `still.js` nimmt optional Breite und Höhe an.

**Bausteine (Kits)**

- `kit_human.js` (nur noch Unterbau: Skelett, 86 Animationen, `armIK`, `rotBoneWorld`; die menschlichen Körper, Kleidung und Gesichter darin werden von `spawnBlock` ausgeblendet)
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
  - Handy-Pose: `posePhone(h)` aus `kit_cast.js`.
  - **Mimik (seit 22.11.):** prozedurale Gesichtsausdrücke, denn die UBC-Köpfe haben keine Blendshapes.
    - Ausdrücke: `h.userData.face.expr('happy' | 'laugh' | 'sad' | 'angry' | 'surprised' | 'shocked' | 'smirk' | 'sideeye' | 'awkward' | 'neutral', stärke)`
    - Einzelwerte: `face.set({ smileL, smileR, frown, jawOpen, blink, wide, squint, lookL, lookR, lookUp, lookDown, browsUp, browsInnerUp, browsAngry })`
    - Im Video jedes Frame: `face.reset(); face.set(werte)`
    - Blinzeln: `blinkAt(t, seed)`. Lippen zur Stimme: `lipAt(t, hüllkurve, start, 0.42)`. Die Hüllkurve kommt aus `python3 envelope.py audio/x.mp3 24 > audio/x.env.json`.
    - (Veraltet: galt für die alten Gesichter. Für Klötzchen gilt `blockFace.set()`, Referenz `look/mimik.png`.)
  - `lookAt(h, punkt, k)` dreht Hals und Kopf jetzt exakt zum Ziel, auch wenn die Animation den Kopf neigt.
  - Kleidungsdetails: Hoodie mit Kapuze, Kordeln und Bauchtasche; Jacke mit Reißverschluss; Hemd mit Knopfleiste.
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
- Handy bei übertragenen Bewegungen: im Video jedes Frame `syncPhone(h)` aufrufen, sonst bleibt es nach `Texting` sichtbar.
- Klötzchen-Kopf ist groß: Hand-am-Kopf-Bewegungen und hohe Stuhllehnen im Testbild prüfen.
- **Schwarze Blöcke im Video** (23.11. behoben): Ein einzelner ungültiger Pixel (NaN) wird von Tiefenschärfe und Leuchteffekt zu einem großen schwarzen Rechteck verschmiert. Ursache war das Bump-Mapping an hauchdünnen Fasen schräger Giebelkanten.
  - Fix 1: `triMat` in `kit_world.js` rechnet die Bump-Normale jetzt NaN-sicher.
  - Fix 2: Sicherheitsnetz `nanGuard()` in `kit_look.js` ersetzt ungültige Pixel vor allen Effekten durch ihre Nachbarn.
  - Falls es wieder auftaucht: `node diag_nan.js clip_test.html 0.21,0.38` findet die ungültigen Pixel und nennt das Objekt darunter.
- Netzwerk:
  - Gesperrt: kenney.nl, quaternius.com, poly.pizza, opengameart, tiktok.com
  - Freigegeben (23.11.): files.makehumancommunity.org (nur für `make_moves.sh` nötig; die fertigen Bewegungen liegen schon in `assets/moves/`)
  - GitHub per `git clone` funktioniert.
  - api.github.com liefert 403; für Suchen `gh api -X GET search/...` nutzen.

## 5. Nutzer-Vorlieben (wichtig)

- Mag Videos, die man ohne Lesen versteht, mit 3D-Optik, Spannung und Gänsehaut.
- Will eigene Figuren und Details – „die Details machen es aus“.
- Will auf Deutsch kurz und klar informiert werden.
- Antwortet manchmal nicht auf Auswahl-Dialoge; dann einfache Textoptionen anbieten.
- **Fehler im Bild stören ihn sehr** (fehlende Hand, Handy durch die Hand, Loch am Hals). Vor jedem Zeigen Testbilder selbst genau prüfen, besonders Hände, Hals, Handy und Kopf.
- Will auffallen, aber **ohne Spielereien**: Klötzchen-Figuren in der detaillierten Welt, Ego-Perspektive, normales Format. Vorgeschlagene Effekte (Risse, abfallende Blöcke, Glas-Sprünge) hat er abgelehnt.

## 6. Vorbereitung bis zum Start (Checkliste)

- [x] Spielwelt gebaut und freigegeben, Assets im Repo gesichert
- [x] Länge der Folgen: 50 s bis 10k, danach 61–70 s
- [x] Account: bestehender Account wird weitergenutzt
- [x] **Kanal-Auftritt (entschieden 23.11.):** Anzeigename **„Regeln TV“**, Bio **„Regeln für mehr Selbstrespekt“**, Profilbild **`kanal/profilbild.png`** (Du mit Sonnenbrille, goldener Aura, verschränkten Armen; 1080×1080).
  - In der App trägt der Nutzer das selbst ein. Alte, unpassende Videos auf „Nur ich“ stellen: entscheidet der Nutzer.
- [x] Folgenliste → `folgenliste.md`. Der Nutzer hat **1, 3, 4, 9 und 10** als Start-Folgen gewählt (⭐).
- [~] Skripte: Entwurf Folge 1 (50 s) in `skripte/folge01_regel1.md`. **Hook und Aufbau will der Nutzer pro Folge gemeinsam festlegen**, deshalb ist der Entwurf nicht final.
- [ ] Serien-Bibel: Hauptfigur, wiederkehrende Figuren, Orte, Stimmen, Musik, Ende-Karte
- [ ] Posting-Plan: Uhrzeiten, Captions, Hashtags, Titelbilder, KI-Kennzeichnung (Nutzer 23.11.: „jetzt nicht so wichtig“)
- [x] Animations-System für die Spielwelt (`kit_anim.js`, `kit_hud.js`) und Testclip `clip_test.mp4`
- [x] Look-Baukasten, feste Besetzung und drei Sets (Straße, Jugendzimmer, Schule) mit Referenzbildern in `look/`
- [x] **Klötzchen-Figuren** (`kit_block.js`): ganze Besetzung, Mimik, 26 Bewegungen, Härtetest (`look/bewegungen.png`), Szenen umgestellt, Video-Vorlage in Ego-Perspektive (23.11.)
- [x] `LOOK_BIBEL.md`: Regeln und Arbeitsablauf für neue Orte
- [~] Handy-Chat (23.11.): `chatTex()` in `kit_block.js` zeichnet Chats (Nachrichten, „Gelesen“, „schreibt …“), Beispiel `chat_test.html?mode=hand|overlay`: **1 im Handy in deinen Händen** (`phone.set(1, 1)` holt es zum Lesen näher) oder **2 groß eingeblendet**. Auswahl des Nutzers offen.
- [ ] Optional: Vorrat an fertigen Videos für die erste Woche

## 7. Nächste Schritte

**Plan des Nutzers:** bis Samstag, 28.11.2026, jeden Tag **eine Folge drehen**, damit der Look sitzt und ein Vorrat entsteht. Gepostet wird ab ca. 29.11.

| Tag | Folge | Drehorte | Neu zu bauen |
|---|---|---|---|
| Mo 23.11. | ⭐ 1 – Nicht eingeladen → nicht hingehen | Jugendzimmer, Straße, Partyhaus innen | **Party-Wohnzimmer**, Handy-Story-Einblendung |
| Di 24.11. | ⭐ 3 – Lass niemanden allein nach Hause gehen | Straße nachts (`party: false`), Fußweg | ggf. dunkler Fußweg/Park |
| Mi 25.11. | ⭐ 4 – Wer mit dir lästert, lästert auch über dich | Schulhof (Tag) | ggf. Ecke/Flur zum Belauschen |
| Do 26.11. | ⭐ 9 – Steh nicht daneben | Bushaltestelle, Bus | **Bus innen** |
| Fr 27.11. | ⭐ 10 – Lach nicht mit, wenn über dich gelacht wird | Schulhof (Tag) | – |
| Sa 28.11. | Puffer: Nacharbeiten oder eine weitere Folge | – | – |

**Ablauf pro Folge**
1. **Mit dem Nutzer** Hook und Aufbau festlegen. Kurz vorschlagen, Nutzer entscheidet.
   - Rahmen: 50 s, Zähler „Selbstrespekt“, Endkarte „Was wäre, wenn …?“ und gelbe Frage
2. Fehlende Drehorte mit den Baukästen bauen. Referenzbild nach `look/` legen und in der Look-Bibel eintragen.
3. Szene als `folgeNN.html` nach dem Muster von `clip_test.html` anlegen:
   - Figuren mit `spawnBlock`, Bewegungen mit `prepMoves` + `Actor` (`anim: 'Ara:…'` oder Skelett-Clips wie `Walk_Loop`), jedes Frame `syncPhone`
   - Gesichter jedes Frame mit `blockFace.set(ausdruck, { blink: blinkAt(t, seed), talk: lipAt(...) })`
   - Kamera in Ego-Perspektive über `povPose` (siehe `clip_test.html`), Overlay über `kit_hud`
   - Testbilder genau prüfen (Hände, Handy, Kopf), erst dann rendern
4. Testbilder an markanten Zeitpunkten rendern, ansehen und Feedback holen.
5. Video rendern (24 fps, ca. 2 h im Hintergrund).
6. Stimmen und Geräusche mit ElevenLabs erzeugen und mischen (wie in `make_clip_test.sh`).
   - Lautheit auf −16 LUFS
   - Datei `folgeNN.mp4` committen und dem Nutzer schicken

**Noch offen** (kann parallel laufen)
- Handy-Chat: Nutzer wählt Variante 1 (im Handy) oder 2 (groß eingeblendet), siehe `chat_test.html`. Chats kommen u. a. in Folge 2, 3 (letzte Nachricht) und 6 vor.
- Posting-Plan (niedrige Priorität):
  - Uhrzeiten, Captions, Hashtags
  - einheitliche Titelbilder „Regel Nr. X“
  - KI-Kennzeichnung (KI-Stimmen) in TikTok prüfen

## 8. So startet der neue Chat

1. Den neuen Chat mit demselben Repository `mnwyydhr6b-lab/sherlock` starten.
   - Am besten in derselben Umgebung, damit ElevenLabs verbunden ist.
2. Erste Nachricht:
   „Hol dir den Branch `claude/wizardly-rubin-v81hm1`, lies `tiktok-studio/UEBERGABE.md` komplett und mach bei Abschnitt 7 weiter.“
3. Claude im neuen Chat führt `cd tiktok-studio && npm install` aus und prüft mit einem Standbild (`node still.js "spielwelt.html?dof=0" test.png 0.5`), dass Spielwelt und Klötzchen-Figuren rendern.

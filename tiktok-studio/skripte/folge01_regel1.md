# Folge 1 – „Wenn du nicht eingeladen bist, geh nicht hin.“ (50 s, Spielwelt)

Grundlage ist das freigegebene Pilot-Skript (42 s), verlängert auf 50 s und umgesetzt mit den neuen Sets.

## Rahmen

- **Zähler „Selbstrespekt“:** 100 → 85 → 72 → 55 → 38 → 19 → 5 %. Bei jedem Abfall rotes Aufblinken und ein dumpfer Schlag (`hit.mp3`).
- **Farben:** Die Welt verliert mit dem Zähler Farbe (Sättigung 1,15 → 0,3).
- **Ton:** gedämpfte Partymusik (Tiefpass), lauter, sobald die Tür aufgeht. Bei 40 s stoppt die Musik (`music_stop.mp3`).
- **Neues Set nötig:** **Party-Wohnzimmer** (aus `kit_interior`):
  - Sofa, Couchtisch mit Bechern und Chips, Lichterketten, Lautsprecher
  - Partylicht pink/blau, Fenster zur Straße
  - Wand mit Gruppenfoto „DIE GANG ♥“, auf dem „Du“ fehlt

## Ablauf

**0,0–3,0 · Jugendzimmer, nachts (`set_zimmer`, `innen_nacht`)**
- Bild: „Du“ sitzt auf der Bettkante, das Handy leuchtet. Nahaufnahme auf den Bildschirm mit Leons Story: Party, Ballons, „18“.
- Text: Titel „Was wäre, wenn du hingehst, obwohl du nicht eingeladen bist?“ (weiß, Garamond), blendet bei 2,6 s aus.
- Ton: Handy vibriert (`vibrate.mp3`).

**3,0–9,0 · Lindenweg, nachts (`set_strasse`, `nacht`)**
- Bild: „Du“ läuft den Gehweg entlang zum Partyhaus, die Kamera fährt mit. Vorlage ist `clip_test.html`.
- Text: Untertitel 4,0–6,6 s: „Vielleicht haben sie’s vergessen.“
- Ton: Schritte, Nacht-Atmo, gedämpfte Musik.

**9,0–15,0 · Haustür**
- 9,4 s: Klingeln (`doorbell.mp3`).
- 10,2 s: Leon öffnet, Licht und Musik schwappen raus. Leon (Stimme): „Oh … hey.“ → Zähler **85**.
- 12,6 s: „Du“: „Ich bleib nur kurz.“ → Zähler **72**.
- Bild: Leons Blick geht kurz über die Schulter nach innen.

**15,0–22,0 · Party-Wohnzimmer**
- „Du“ drängt sich rein, steht am Rand. Gäste tanzen (Dance_Loop), Jasmin und Mia reden.
- Text:
  - 15,5–18,5 s: „Erst merkt es keiner.“
  - 19,0–21,8 s: „Dann merkt es jeder.“ → Zähler **55** bei 20,0 s.
- Bild: Köpfe drehen sich nacheinander zu ihm (`lookAt`).

**22,0–30,0 · Details**
- 22,0–24,5 s: Nahaufnahme Gruppenfoto „DIE GANG ♥“ – er ist nicht drauf. Text: „Seit 3 Wochen geplant.“ → Zähler **38** bei 24,0 s.
- 26,5 s: Jasmin flüstert Mia etwas zu. Flüsterstimme: „Wer hat den eingeladen?“ → Zähler **19** bei 28,0 s.

**30,0–44,0 · Stimmung kippt**
- Gäste gehen nach und nach aus dem Raum (Walk_Loop zur Tür). Lichterkette flackert. „Du“ bleibt mit Becher allein am Sofa.
- 40,0 s: Musik stoppt.
- 41,0–43,8 s: Text „Du bist geblieben. Die Stimmung nicht.“ → Zähler **5** bei 42,0 s.

**44,0–50,0 · Endkarte**
- Bild: dunkles Overlay.
- Text: weißer Titel „Was wäre, wenn du hingehst, obwohl du nicht eingeladen bist?“, dazu gelbe kursive Frage „Wärst du trotzdem hingegangen?“ (ab 45,2 s).
- Ton: Drone (`drone.mp3`) klingt aus.

## Stimmen (ElevenLabs, eleven_v3, `language_code: de`)

- Leon `IeQubAjK1ujbppIdhJw4`: „[awkward] Oh … hey.“
- Du `UFMIjG2r9JyefPpfkQoL`: „[unsure] Ich bleib nur kurz.“
- Flüstern `RMDEjuHXo5bcQLkbu6MB`: „[whispers] Wer hat den eingeladen?“
- Die Dateien aus dem Piloten liegen schon in `audio/` (`leon.mp3`, `du.mp3`, `whisper.mp3`).

## Caption-Vorschlag

Wärst du hingegangen? 👀 #ungeschriebeneregeln #party #freundschaft #fyp

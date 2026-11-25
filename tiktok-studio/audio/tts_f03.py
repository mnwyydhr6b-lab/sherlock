# Stimmen + Geräusche für Folge 3 („Lass niemanden allein nach Hause gehen.“). Aufruf: python3 tts_f03.py [name ...]
import json, subprocess, sys
DU, LEON, MIA = "UFMIjG2r9JyefPpfkQoL", "IeQubAjK1ujbppIdhJw4", "krYs4UGlOJ9RA8enVbqQ"
lines = {
 "f03_mia_geh": (MIA, "[cheerful, a bit tipsy, calling out] Ich geh dann! Ist ja nicht weit!"),
 "f03_du_hook": (DU, "[unsure, quietly to himself] Wird schon gehen... [hesitant] oder?"),
 "f03_leon_runde": (LEON, "[loud, cheerful, partying] Ey, komm! Noch 'ne Runde!"),
 "f03_du_was": (DU, "[confused, worried] Was? ...Da läuft einer hinter ihr?"),
 "f03_leon_chill": (LEON, "[dismissive, laughing it off] Die übertreibt doch. Chill."),
 "f03_du_bestimmt": (DU, "[unsure, quietly] ...ja. Bestimmt."),
 "f03_mia_mailbox": (MIA, "[cheerful, recorded voicemail greeting] Hey, hier ist Mia! Sprich mir einfach drauf!"),
 "f03_du_mitgehen": (DU, "[whispers, guilty, regretful] Ich hätte mitgehen sollen."),
 "f03_leon_wohin": (LEON, "[confused, shouting after him] Ey! Wo willst du hin?"),
 "f03_mia_hallo": (MIA, "[scared, whispering, shaky] ...Hallo?"),
 "f03_du_bleib": (DU, "[out of breath, running, urgent] Bleib, wo du bist! Ich bin gleich da!"),
 "f03_mia_danke": (MIA, "[relieved, shaky voice, close to tears] Danke... dass du gekommen bist."),
 "f03_du_heim": (DU, "[out of breath, warm, calm] Komm. Ich bring dich heim."),
}
sfx = {
 "f03_sfx_ring": ("Phone call ringback tone heard through a smartphone speaker, two European ring tones, quiet", 4.5),
 # f03_sfx_beep: synthetischer Sinuston (ffmpeg sine 1000 Hz, 0,42 s) – der erzeugte Ton enthielt Stimmgeräusche
 "f03_sfx_run": ("Footsteps of one teenager sprinting fast on a paved sidewalk at night, sneakers, heavy breathing", 8.0),
 # f03_sfx_tap: synthetischer Klick (ffmpeg Rauschen 35 ms) – der erzeugte Ton klang wie ein Wort
 "f03_sfx_street": ("Quiet suburban street at night, distant traffic, faint wind, crickets, very calm", 12.0),
}
want = lambda n: len(sys.argv) == 1 or n in sys.argv[1:]
for name, (vid, text) in lines.items():
    if not want(name): continue
    body = json.dumps({"text": text, "model_id": "eleven_v3", "language_code": "de", "voice_settings": {"stability": 0.0}})
    r = subprocess.run(["curl", "-s", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128", "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", body, "-o", f"{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True); print(name, r.stdout)
for name, (text, d) in sfx.items():
    if not want(name): continue
    body = json.dumps({"text": text, "duration_seconds": d})
    r = subprocess.run(["curl", "-s", "-X", "POST", "https://api.elevenlabs.io/v1/sound-generation", "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", body, "-o", f"{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True); print(name, r.stdout)

# Stimmen + Geräusche für Folge 10 („Lach nicht mit, wenn über dich gelacht wird.“). Aufruf: python3 tts_f10.py [name ...]
import json, subprocess, sys
DU, TARIK, JASMIN, MIA = "UFMIjG2r9JyefPpfkQoL", "SfAtBxtKeIJ5PJmhPaty", "JudZUClAOU1jP3wA2eDG", "krYs4UGlOJ9RA8enVbqQ"  # Tarik: Chris Beck (jung, frech)
lines = {
 "f10_du_hook": (DU, "[embarrassed, forced laugh] Ha... ja... voll lustig."),
 "f10_tarik_opa": (TARIK, "[mocking] Ey, hast du den Hoodie von deinem Opa?"),
 "f10_du_safe": (DU, "[forced laugh] Haha... ja klar, safe."),
 "f10_tarik_lena": (TARIK, "[laughing, mocking] Erzähl mal, wie Lena dich gestern hat abblitzen lassen!"),
 "f10_du_peinlich": (DU, "[laughs too loud, insecure] Hahaha! Ja... war schon peinlich."),
 "f10_jasmin_film": (JASMIN, "[giggling] Warte, nochmal! Ich film!"),
 "f10_du_nee": (DU, "[calm, serious, hurt] Nee. ...Das ist nicht witzig."),
 "f10_tarik_chill": (TARIK, "[defensive, awkward] Chill... war nur Spaß."),
 "f10_du_fuerdich": (DU, "[quiet, firm] Für dich vielleicht."),
 "f10_mia_recht": (MIA, "[quietly, guilty] ...er hat recht."),
}
sfx = {
 "f10_sfx_spill": ("Backpack zipper bursts open, books, pencil case and a plastic lunchbox fall onto concrete schoolyard pavement", 2.2),
 "f10_sfx_laugh1": ("Group of four teenagers laughing loudly and mockingly at someone, outdoor schoolyard, close", 3.0),
 "f10_sfx_laugh2": ("Group of teenagers bursting into loud mocking laughter, one guy howling, outdoors, close", 3.5),
 "f10_sfx_yard": ("Busy school yard ambience during break, distant kids chatting and shouting, birds, daytime", 10.0),
 "f10_sfx_ping": ("Short smartphone social media notification ping", 1.0),
 "f10_sfx_rise": ("Soft warm uplifting short chime, single gentle swell, positive feeling", 2.0),
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

# Stimmen für Folge 1 (ElevenLabs eleven_v3, Deutsch). Aufruf: python3 tts_f01.py [name ...]
import json, subprocess, sys
DU, LEON = "UFMIjG2r9JyefPpfkQoL", "IeQubAjK1ujbppIdhJw4"
JASMIN, MIA = "JudZUClAOU1jP3wA2eDG", "krYs4UGlOJ9RA8enVbqQ"   # Lola (jung, selbstbewusst) / Laura (jung, freundlich)
WHISPER = "RMDEjuHXo5bcQLkbu6MB"
# v2 (24.11.): mehr Emotion – Audio-Tags + stability 0.0 ("Creative")
lines = {
 "f01_du_hook": (DU, "[disappointed] Eine Party? [hurt] Ohne mich? [sighs] ...Vielleicht haben sie's vergessen."),
 "f01_du_abchecken": (DU, "[hesitant] Ach... [sighs] ich geh mal kurz abchecken."),
 "f01_du_hey": (DU, "[cheerful, trying too hard] Hey, na?!"),
 "f01_du_party": (DU, "[overly enthusiastic] Geile Party!"),
 "f01_du_anstossen": (DU, "[nervous, hopeful] Anstoßen?"),
 "f01_jasmin_danke": (JASMIN, "[cold, unimpressed] ...Danke."),
 "f01_mia_passt": (MIA, "[annoyed, dismissive] Ne... passt schon."),
 "f01_leon_kreis": (LEON, "[awkward, uncomfortable] Ey... [sighs] ist heute eher so 'n kleiner Kreis."),
 "f01_whisper": (WHISPER, "[whispers, mocking] Wer hat den eingeladen?"),
}
for name, (vid, text) in lines.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
    body = json.dumps({"text": text, "model_id": "eleven_v3", "language_code": "de", "voice_settings": {"stability": 0.0}})
    r = subprocess.run(["curl", "-s", "-X", "POST", f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
        "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", body, "-o", f"{name}.mp3", "-w", "%{http_code}"], capture_output=True, text=True)
    print(name, r.stdout)

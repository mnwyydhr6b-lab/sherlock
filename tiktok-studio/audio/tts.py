import json, subprocess
lines = {
 "leon": ("IeQubAjK1ujbppIdhJw4", "[awkward] Oh... hey."),
 "du": ("UFMIjG2r9JyefPpfkQoL", "[unsure] Ich bleib nur kurz."),
 "whisper": ("RMDEjuHXo5bcQLkbu6MB", "[whispers] Wer hat den eingeladen?"),
}
for name, (vid, text) in lines.items():
    for model in ["eleven_v3", "eleven_multilingual_v2"]:
        t = text if model == "eleven_v3" else text.split("] ",1)[1]
        body = json.dumps({"text": t, "model_id": model, "language_code": "de"} if model=="eleven_v3" else {"text": t, "model_id": model})
        r = subprocess.run(["curl","-s","-X","POST",f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128",
            "-H","xi-api-key: dummy","-H","Content-Type: application/json","-d",body,"-o",f"{name}.mp3","-w","%{http_code}"], capture_output=True, text=True)
        print(name, model, r.stdout)
        if r.stdout == "200": break

import json, subprocess, sys
sfx = {
 "vibrate": ("Smartphone vibrating twice in a pocket, short buzz buzz", 2),
 "steps_fast": ("Fast hurried footsteps on a city sidewalk at night, sneakers", 4),
 "doorbell": ("Classic house doorbell ding dong, heard from outside, muffled bass music behind the door", 3),
 "door_open": ("Front door swings open quickly, loud party music and crowd suddenly gets louder", 3),
 "bump": ("Two people bump shoulders, clothes rustle and a dull body thud", 1.2),
 "crowd": ("Indoor house party crowd chatter, young people talking and laughing, no music", 12),
 "hit": ("Deep cinematic low impact boom, short, dark", 1.5),
 "music_stop": ("Party music suddenly stops, record player power down slowing to silence", 2),
 "drone": ("Dark sad low ambient drone tone, slowly fading, cinematic ending", 8),
 "music": ("Upbeat electronic house party music, 124 bpm, punchy kick drum and bass, no vocals, seamless loop", 22),
}
for name, (text, dur) in sfx.items():
    body = json.dumps({"text": text, "duration_seconds": dur, "prompt_influence": 0.6})
    r = subprocess.run(["curl","-s","-X","POST","https://api.elevenlabs.io/v1/sound-generation","-H","xi-api-key: dummy",
        "-H","Content-Type: application/json","-d",body,"-o",f"{name}.mp3","-w","%{http_code}"], capture_output=True, text=True)
    print(name, r.stdout)

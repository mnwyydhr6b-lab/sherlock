# Tonspur für Folge 1 (50 s). Aufruf: python3 mix_f01.py out.wav
# Zeiten passen zu folge01.html (T, VOICE, COUNTER). Musik läuft durchgehend (src_start = Filmzeit), nur Filter/Lautstärke wechseln je Ort.
import subprocess, sys
A = 'audio/'; OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_f01.wav'; L = 50.0
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '3', '-i', A + 'music.mp3', '-t', '52', '-ar', '44100', '-ac', '2', A + 'bed50.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '4', '-i', A + 'crowd.mp3', '-t', '52', '-ar', '44100', '-ac', '2', A + 'crowd50.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '5', '-i', A + 'night_amb.mp3', '-t', '52', '-ar', '44100', '-ac', '2', A + 'night50.wav'], check=True)
inputs, chains = [], []
def add(path, start, filt='', vol=1.0, fin=0.0, fout=0.0, dur=None, src_start=0.0):
    idx = len(inputs) // 2; inputs.extend(['-i', path])
    f = f'[{idx}:a]aresample=44100,aformat=channel_layouts=stereo'
    if dur is not None: f += f',atrim={src_start}:{src_start + dur},asetpts=PTS-STARTPTS'
    if filt: f += ',' + filt
    if fin: f += f',afade=t=in:st=0:d={fin}'
    if fout and dur: f += f',afade=t=out:st={max(0, dur - fout)}:d={fout}'
    f += f',volume={vol},adelay={int(start * 1000)}|{int(start * 1000)}[a{idx}]'
    chains.append(f); return idx
bed, crowd, night = A + 'bed50.wav', A + 'crowd50.wav', A + 'night50.wav'
def music(t0, t1, filt, vol, fin=0.25, fout=0.25): add(bed, t0, filt, vol, fin, fout, dur=t1 - t0, src_start=t0)
CUT_IN, CUT_OUT, CLOSE = 13.917, 41.5, 42.6
# ---- Straße: Nacht-Atmo, Musik von weitem (wird beim Näherkommen lauter), Schritte
add(night, 0.0, '', 0.30, 0.3, 0.4, dur=CUT_IN, src_start=0)
music(0.0, 4.2, 'lowpass=f=420', 0.10, fin=0.4)
music(4.2, 8.4, 'lowpass=f=480', 0.16)
music(8.4, 11.6, 'lowpass=f=600', 0.20)
music(11.6, CUT_IN, 'lowpass=f=1300', 0.30, fout=0.1)
add(crowd, 8.4, 'lowpass=f=1500', 0.12, 0.6, 0.1, dur=CUT_IN - 8.4, src_start=8.4)
add(A + 'steps_walk.mp3', 0.0, '', 0.55, 0, 0.3, dur=4.25)
add(A + 'steps_walk.mp3', 8.4, '', 0.55, 0.1, 0.1, dur=CUT_IN - 8.4)
# ---- Wohnzimmer: Musik voll, unter Dialogen leiser
music(CUT_IN, 21.2, '', 0.62, fin=0.08)
music(21.2, 29.2, 'lowpass=f=5000', 0.40)
music(29.2, 35.2, '', 0.55)
music(35.2, 41.3, 'lowpass=f=4500', 0.36, fout=0.15)
add(crowd, CUT_IN, '', 0.42, 0.1, 0.3, dur=CUT_OUT - CUT_IN, src_start=CUT_IN)
add(A + 'steps_walk.mp3', CUT_IN, 'volume=0.8', 0.5, 0, 0.2, dur=1.8, src_start=0.5)
add(A + 'steps_walk.mp3', 29.3, '', 0.45, 0, 0.2, dur=1.2, src_start=1.0)
add(A + 'steps_walk.mp3', 33.0, '', 0.45, 0, 0.2, dur=0.8, src_start=2.0)
# ---- Schluss draußen: Tür geht zu, dumpf -> Party drinnen wird wieder laut, dann Endkarte mit Drone
music(CUT_OUT, CLOSE, 'lowpass=f=2400', 0.38, fin=0.05, fout=0.08)
music(CLOSE, 50.0, 'lowpass=f=380', 0.42, fin=0.05, fout=1.5)
add(night, CUT_OUT, '', 0.30, 0.2, 1.5, dur=L - CUT_OUT, src_start=CUT_OUT)
add(A + 'door_close.mp3', CLOSE - 0.35, '', 0.85)
add(A + 'laugh_muffled.mp3', 43.3, 'lowpass=f=1800', 0.55, 0.3, 1.2, dur=5.5)
add(A + 'drone.mp3', 44.8, '', 0.55, 1.2, 1.0, dur=5.2)
# ---- Stimmen (Startzeiten wie VOICE in folge01.html)
for n, t, v in [('f01_du_hook', 0.15, 1.2), ('f01_du_abchecken', 6.2, 1.2), ('f01_du_hey', 10.45, 1.15), ('f01_du_party', 21.3, 1.15), ('f01_jasmin_danke', 23.15, 1.2),
                ('f01_du_anstossen', 25.6, 1.15), ('f01_mia_passt', 26.75, 1.2), ('f01_leon_kreis', 37.6, 1.2)]:
    add(A + n + '.mp3', t, '', v)
add(A + 'f01_whisper.mp3', 35.3, 'pan=stereo|c0=1.0*c0|c1=0.4*c1', 1.3)
# ---- Zähler-Abfälle: dumpfer Schlag
for ht in [11.5, 24.2, 28.6, 31.4, 37.0, 43.0]: add(A + 'hit.mp3', ht, '', 0.7)
n = len(chains)
fc = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad,atrim=0:{L},loudnorm=I=-16:TP=-1.5:LRA=11[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-c:a', 'pcm_s16le', OUT], check=True)
print('mix ok', OUT)

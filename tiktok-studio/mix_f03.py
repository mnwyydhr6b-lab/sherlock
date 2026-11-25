# Tonspur für Folge 3 (46,5 s). Aufruf: python3 mix_f03.py out.wav
# Zeiten passen zu folge03.html (CUT1, CUT2, RUN, VOICE, COUNTER). Partymusik kommt aus dem Haus: draußen dumpf, im Vorgarten lauter,
# nach der Mailbox dumpf (Schock), beim Wegrennen leiser, danach nur noch Nacht-Atmo, Schritte und Atem.
import subprocess, sys
A = 'audio/'; OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_f03.wav'; L = 46.5
CUT1, CUT2, RUN, END = 7.9, 714 / 24, 27.4, 40.4
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '3', '-i', A + 'music.mp3', '-t', '48', '-ar', '44100', '-ac', '2', A + 'bed50.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '4', '-i', A + 'crowd.mp3', '-t', '48', '-ar', '44100', '-ac', '2', A + 'crowd50.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '6', '-i', A + 'night_amb.mp3', '-t', '48', '-ar', '44100', '-ac', '2', A + 'night50.wav'], check=True)
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
def music(t0, t1, filt, vol, fin=0.2, fout=0.2): add(bed, t0, filt, vol, fin, fout, dur=t1 - t0, src_start=t0)
PHONE = 'highpass=f=380,lowpass=f=3400'  # Stimme/Ton aus dem Handy
# ---- A: vor dem Tor (Musik dumpf aus dem Haus), Nacht-Atmo, Mias Schritte
add(night, 0.0, '', 0.30, 0.2, 0.3, dur=CUT1, src_start=0)
music(0.0, 5.4, 'lowpass=f=800', 0.20, fin=0.3)
music(5.4, CUT1, 'lowpass=f=1100', 0.26, fout=0.05)
add(crowd, 0.0, 'lowpass=f=1200', 0.08, 0.3, 0.05, dur=CUT1)
add(A + 'steps_walk.mp3', 1.95, 'lowpass=f=2500', 0.22, 0.1, 1.5, dur=4.5)
add(A + 'steps_walk.mp3', 7.05, '', 0.45, 0.05, 0.05, dur=CUT1 - 7.05, src_start=1.0)
# ---- B: Vorgarten (Musik und Leute laut, unter Dialogen leiser), nach der Mailbox dumpf
music(CUT1, 9.4, 'lowpass=f=3200', 0.46, fin=0.03)
music(9.4, 17.0, 'lowpass=f=2200', 0.32)
music(17.0, 24.4, 'lowpass=f=2600', 0.36)
music(24.4, RUN, 'lowpass=f=330', 0.30, fin=0.25)
music(RUN, CUT2, 'lowpass=f=450', 0.22, fout=1.6)
add(crowd, CUT1, 'lowpass=f=3000', 0.26, 0.03, 0.3, dur=24.4 - CUT1, src_start=CUT1)
add(crowd, 24.4, 'lowpass=f=420', 0.14, 0.25, 0.8, dur=CUT2 - 24.4, src_start=24.4)
add(night, CUT1, '', 0.10, 0.1, 0.5, dur=RUN - CUT1, src_start=CUT1)
for t in (8.4, 17.1): add(A + 'vibrate.mp3', t, '', 0.9, 0, 0.2, dur=1.2)
for t in (18.9, 29.0): add(A + 'f03_sfx_tap.mp3', t, '', 0.7)
add(A + 'f03_sfx_ring.mp3', 19.0, PHONE, 0.55, 0.01, 0.05, dur=1.5)
add(A + 'f03_sfx_ring.mp3', 20.15, PHONE, 0.55, 0.01, 0.1, dur=1.35)
add(A + 'f03_mia_mailbox.mp3', 21.6, PHONE, 1.15)
add(A + 'f03_sfx_beep.mp3', 24.35, PHONE, 0.5)
# ---- Rennen + C: Straße weiter unten (Nacht-Atmo, Schritte, Atem), Endkarte mit Drone
add(night, RUN, '', 0.34, 0.6, 2.0, dur=L - RUN, src_start=RUN)
add(A + 'f03_sfx_run.mp3', RUN, '', 0.55, 0.2, 0.5, dur=34.25 - RUN)
add(A + 'f03_sfx_ring.mp3', 29.1, PHONE, 0.5, 0.01, 0.05, dur=1.1)
add(A + 'drone.mp3', END + 0.2, '', 0.5, 1.2, 1.2, dur=L - END - 0.2)
# ---- Stimmen (Startzeiten wie VOICE in folge03.html)
for n, t, v, filt in [('f03_mia_geh', 0.25, 1.05, ''), ('f03_du_hook', 2.3, 1.15, ''), ('f03_leon_runde', 5.1, 1.1, ''), ('f03_du_was', 9.5, 1.2, ''), ('f03_leon_chill', 12.6, 1.15, ''),
                      ('f03_du_bestimmt', 14.6, 1.2, ''), ('f03_du_mitgehen', 25.2, 1.35, ''), ('f03_leon_wohin', 27.9, 0.8, 'lowpass=f=3500'), ('f03_mia_hallo', 30.3, 1.3, PHONE),
                      ('f03_du_bleib', 31.7, 1.15, ''), ('f03_mia_danke', 35.3, 1.2, ''), ('f03_du_heim', 38.35, 1.2, '')]:
    add(A + n + '.mp3', t, filt, v)
# ---- Zähler: dumpfer Schlag beim Abfall, warmer Ton beim Steigen
for ht in [6.9, 16.7, 24.5, 26.9]: add(A + 'hit.mp3', ht, '', 0.65)
for rt in [28.3, 35.7]: add(A + 'f10_sfx_rise.mp3', rt, '', 0.45)
n = len(chains)
fc = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad,atrim=0:{L},loudnorm=I=-16:TP=-1.5:LRA=11[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-c:a', 'pcm_s16le', OUT], check=True)
print('mix ok', OUT)

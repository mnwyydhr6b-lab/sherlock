# Tonspur für Folge 10 (50 s). Aufruf: python3 mix_f10.py out.wav   – Zeiten wie VOICE/LAUGH/COUNTER in folge10.html
import subprocess, sys
A = 'audio/'; OUT = sys.argv[1] if len(sys.argv) > 1 else 'mix_f10.wav'; L = 50.0
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '5', '-i', A + 'f10_sfx_yard.mp3', '-t', '52', '-ar', '44100', '-ac', '2', A + 'yard50.wav'], check=True)
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
yard = A + 'yard50.wav'
# Schulhof-Atmo: normal -> beim Blick auf die Story dumpf (Erkenntnis) -> nach „Nee.“ leiser (Stille in der Gruppe)
add(yard, 0.0, '', 0.32, 0.2, 0.3, dur=24.6, src_start=0)
add(yard, 24.6, 'lowpass=f=500', 0.30, 0.3, 0.4, dur=6.2, src_start=24.6)
add(yard, 30.8, '', 0.28, 0.4, 0.3, dur=2.5, src_start=30.8)
add(yard, 33.3, '', 0.16, 0.3, 1.2, dur=10.9, src_start=33.3)
add(A + 'f10_sfx_spill.mp3', 0.12, '', 0.95)
for t, f, v in [(0.9, 'f10_sfx_laugh1', 0.75), (8.85, 'f10_sfx_laugh2', 0.75), (15.55, 'f10_sfx_laugh2', 0.85), (22.2, 'f10_sfx_laugh1', 0.75)]: add(A + f + '.mp3', t, '', v)
add(A + 'f10_sfx_ping.mp3', 24.3, '', 0.7)
add(A + 'drone.mp3', 25.0, 'lowpass=f=900', 0.35, 1.0, 1.5, dur=6.0)
add(A + 'steps_walk.mp3', 4.7, '', 0.45, 0.05, 0.2, dur=2.1)
add(A + 'steps_walk.mp3', 40.95, '', 0.45, 0.1, 0.6, dur=3.2, src_start=1.0)
add(A + 'f10_sfx_rise.mp3', 39.9, '', 0.6)
add(A + 'drone.mp3', 43.8, '', 0.5, 1.2, 1.0, dur=6.2)
for n, t, v in [('f10_du_hook', 1.6, 1.2), ('f10_tarik_opa', 7.0, 1.2), ('f10_du_safe', 9.2, 1.15), ('f10_tarik_lena', 12.6, 1.2), ('f10_du_peinlich', 16.0, 1.15),
                ('f10_jasmin_film', 19.7, 1.15), ('f10_du_nee', 33.0, 1.2), ('f10_tarik_chill', 36.4, 1.2), ('f10_du_fuerdich', 38.9, 1.2), ('f10_mia_recht', 41.6, 1.2)]:
    add(A + n + '.mp3', t, '', v)
for ht in [10.5, 17.0, 22.6, 28.0]: add(A + 'hit.mp3', ht, '', 0.7)
n = len(chains)
fc = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad,atrim=0:{L},loudnorm=I=-16:TP=-1.5:LRA=11[out]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', fc, '-map', '[out]', '-ar', '44100', '-c:a', 'pcm_s16le', OUT], check=True)
print('mix ok', OUT)

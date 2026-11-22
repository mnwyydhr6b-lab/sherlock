import subprocess
A = 'audio/'
# prepare music bed versions (looped to 46s)
subprocess.run(['ffmpeg','-v','error','-y','-stream_loop','2','-i',A+'music.mp3','-t','46','-ar','44100','-ac','2',A+'bed.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-stream_loop','1','-i',A+'crowd.mp3','-t','24','-ar','44100','-ac','2',A+'crowd2.wav'],check=True)
inputs, chains = [], []
def add(path, start, filt='', vol=1.0, fin=0.0, fout=0.0, dur=None, src_start=0.0):
    idx = len(inputs) // 2; inputs.extend(['-i', path])
    f = f'[{idx}:a]aresample=44100,aformat=channel_layouts=stereo'
    if dur is not None: f += f',atrim={src_start}:{src_start+dur},asetpts=PTS-STARTPTS'
    if filt: f += ',' + filt
    if fin: f += f',afade=t=in:st=0:d={fin}'
    if fout and dur: f += f',afade=t=out:st={max(0,dur-fout)}:d={fout}'
    f += f',volume={vol},adelay={int(start*1000)}|{int(start*1000)}[a{idx}]'
    chains.append(f); return idx
bed = A+'bed.wav'
# street
add('sfx_street.mp3', 0.0, vol=0.75, dur=7.0, fout=0.4)
add(A+'vibrate.mp3', 0.85, vol=0.9)
add(bed, 1.0, 'highpass=f=600,lowpass=f=3200', vol=0.22, dur=3.1, fin=0.2, fout=0.4)
add(A+'steps_fast.mp3', 4.0, vol=0.85, dur=3.1, fout=0.3)
add(bed, 4.0, 'lowpass=f=280', vol=0.55, dur=3.2, fin=1.5, fout=0.2, src_start=3.0)
# door
add(bed, 7.0, 'lowpass=f=380', vol=0.5, dur=1.2, fout=0.2, src_start=6.0)
add(A+'doorbell.mp3', 7.35, vol=0.8, dur=1.6, fout=0.3)
add(A+'door_open.mp3', 8.05, vol=0.55, dur=2.0, fout=0.6)
add(bed, 8.1, 'lowpass=f=2600', vol=0.5, dur=2.3, fin=0.3, fout=0.3, src_start=7.1)
add(A+'leon.mp3', 8.55, vol=1.25)
add(A+'bump.mp3', 10.95, vol=0.9)
add(A+'du.mp3', 10.25, vol=1.15)
add(bed, 10.1, 'lowpass=f=4000', vol=0.6, dur=3.2, fin=0.3, fout=0.3, src_start=9.1)
# party: full -> muffled -> slowed
add(bed, 13.0, '', vol=0.85, dur=4.4, fin=0.3, fout=0.4, src_start=12.0)
add(bed, 17.0, 'lowpass=f=3000', vol=0.75, dur=5.4, fin=0.4, fout=0.4, src_start=16.0)
add(bed, 22.0, 'lowpass=f=1400', vol=0.7, dur=5.4, fin=0.4, fout=0.4, src_start=21.0)
add(bed, 27.0, 'asetrate=44100*0.88,aresample=44100,lowpass=f=650', vol=0.75, dur=6.55, fin=0.4, fout=0.15, src_start=26.0)
add(A+'crowd2.wav', 13.0, 'volume=\'0.5-0.3*min(1,t/9)\':eval=frame', vol=1.0, dur=14.5, fin=0.6, fout=1.2)
add(A+'whisper.mp3', 28.45, 'pan=stereo|c0=0.35*c0|c1=1.0*c1', vol=1.3)
for ht in [9.2, 11.6, 19.5, 25.8, 30.0, 34.2]:
    add(A+'hit.mp3', ht, vol=0.75)
add(A+'music_stop.mp3', 33.4, vol=0.75)
add(A+'drone.mp3', 35.4, vol=0.7, dur=6.6, fin=1.5, fout=0.8)
n = len(chains)
fc = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,alimiter=limit=0.9,apad,atrim=0:42[out]'
cmd = ['ffmpeg','-v','error','-y'] + inputs + ['-filter_complex', fc, '-map','[out]','-ar','44100','-c:a','pcm_s16le','mix.wav']
subprocess.run(cmd, check=True)
print('mix ok')

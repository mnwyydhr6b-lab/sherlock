#!/usr/bin/env python3
# Lautstärke-Hüllkurve einer Sprachdatei für die Mundbewegung:  python3 envelope.py audio/du.mp3 24 > audio/du.env.json
import sys, json, subprocess, struct, math
f, fps = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 24
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
n = len(raw) // 2; s = struct.unpack('<%dh' % n, raw[:n * 2]); w = 16000 // fps
vals = [math.sqrt(sum(x * x for x in s[i:i + w]) / max(1, len(s[i:i + w]))) / 32768 for i in range(0, n, w)]
mx = max(vals) or 1; vals = [round(min(1, v / mx * 1.1), 3) for v in vals]
# leichte Glättung, kurze Pausen schließen den Mund
vals = [round((vals[max(0, i - 1)] + 2 * vals[i] + vals[min(len(vals) - 1, i + 1)]) / 4, 3) for i in range(len(vals))]
print(json.dumps({'fps': fps, 'values': vals}))

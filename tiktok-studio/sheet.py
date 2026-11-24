# Kontaktbogen aus Testbildern: python3 sheet.py out.png in1.png in2.png ... (beschriftet mit dem Zeitpunkt)
import sys
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]; w, h = ims[0].size; cols = min(len(ims), 5); rows = (len(ims) + cols - 1) // cols
o = Image.new('RGB', (w * cols, h * rows)); d = ImageDraw.Draw(o)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * h; o.paste(im, (x, y)); d.rectangle([x, y, x + 90, y + 26], fill=(0, 0, 0)); d.text((x + 6, y + 6), f.rsplit('_', 1)[-1].replace('.png', '') + ' s', fill=(255, 255, 0))
o.save(out)

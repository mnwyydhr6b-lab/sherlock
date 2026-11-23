// Usage: node diag_nan.js <page.html> <t1,t2,...>
// Fehlersuche für schwarze Blöcke im Video: Ein einzelner Pixel mit NaN/Inf (oder > 65504, Überlauf im Half-Float-Puffer)
// wird vom Leuchteffekt (Bloom) zu einem großen schwarzen Rechteck verschmiert. Das Skript rendert die Szene zum Zeitpunkt t
// in einen Float-Puffer, sucht solche Pixel und nennt das Objekt darunter. Braucht window.renderFrame (Video-Seiten).
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const [page_, times = '0'] = process.argv.slice(2);
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.setDefaultTimeout(0);
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto(`http://127.0.0.1:${port}/${page_}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 300000 });
  for (const t of times.split(',').map(parseFloat)) {
    const r = await page.evaluate((t) => {
      window.renderFrame(t);
      const st = window.__stage, THREE = st.THREE, R = st.renderer;
      const sz = R.getDrawingBufferSize(new THREE.Vector2()), W = sz.x, H = sz.y;
      const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });
      R.setRenderTarget(rt); R.render(st.scene, st.camera);
      const buf = new Float32Array(W * H * 4); R.readRenderTargetPixels(rt, 0, 0, W, H, buf); R.setRenderTarget(null); rt.dispose();
      const bad = [], hot = []; let maxV = 0;
      for (let i = 0; i < W * H; i++) {
        const a = buf[i * 4], b = buf[i * 4 + 1], c = buf[i * 4 + 2];
        if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) bad.push(i);
        else { const m = Math.max(a, b, c); if (m > maxV) maxV = m; if (m > 60000) hot.push(i); }
      }
      const vis = (o) => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
      const ray = new THREE.Raycaster();
      const who = (i) => {
        const x = i % W, y = Math.floor(i / W);
        ray.setFromCamera(new THREE.Vector2((x + 0.5) / W * 2 - 1, (y + 0.5) / H * 2 - 1), st.camera);
        const hit = ray.intersectObjects(st.scene.children, true).find(h => vis(h.object));
        const out = { x, y: H - 1 - y, v: [buf[i * 4], buf[i * 4 + 1], buf[i * 4 + 2]].map(n => Number.isFinite(n) ? +n.toFixed(1) : String(n)) };
        if (!hit) return out;
        const chain = []; let o = hit.object; while (o && chain.length < 6) { chain.push(o.name || o.type); o = o.parent; }
        const m = Array.isArray(hit.object.material) ? hit.object.material[hit.face?.materialIndex ?? 0] : hit.object.material;
        return { ...out, dist: +hit.distance.toFixed(3), chain: chain.join(' < '), mat: m && `${m.type}:${m.name || ''}`, col: m && m.color && m.color.getHexString(),
          p: hit.point.toArray().map(n => +n.toFixed(2)) };
      };
      return { t, W, H, maxV: +maxV.toFixed(1), nBad: bad.length, nHot: hot.length, bad: bad.slice(0, 8).map(who), hot: hot.slice(0, 4).map(who) };
    }, t);
    console.log(JSON.stringify(r, null, 1));
  }
  await browser.close(); server.close();
});

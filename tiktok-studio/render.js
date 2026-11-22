// Usage: node render.js <page.html> <outDir> <seconds> <fps> [startSec]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const [page_, outDir, secs = '2', fps = '30', start = '0'] = process.argv.slice(2);
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d);
  });
}).listen(0, async () => {
  const port = server.address().port;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto(`http://127.0.0.1:${port}/${page_}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const n = Math.round(parseFloat(secs) * parseInt(fps));
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = parseFloat(start) + i / parseInt(fps);
    await page.evaluate(tt => window.renderFrame(tt), t);
    await page.screenshot({ path: path.join(outDir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (i % 30 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
  console.log(`done ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close(); server.close();
});

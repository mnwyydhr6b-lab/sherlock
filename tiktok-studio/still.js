// Usage: node still.js <page.html> <out.png> [scale]
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const [page_, out, scale = '2'] = process.argv.slice(2);
const root = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0, async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: parseFloat(scale) });
  page.setDefaultTimeout(0); page.on('console', m => { if (!m.text().includes('GL Driver')) console.log('PAGE:', m.type(), m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/${page_}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 300000 });
  await page.evaluate(() => window.renderStill());
  await page.screenshot({ path: out, type: 'png', timeout: 0 });
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close(); server.close();
});

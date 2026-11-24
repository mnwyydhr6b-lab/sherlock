// Testbilder an mehreren Zeitpunkten (Seite nur einmal laden). Usage: node shots.js <page.html> <outPrefix> <t1,t2,...> [scale=0.5]
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [page_, out, times, scale = '0.5'] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const p = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); });
}).listen(0, async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: parseFloat(scale) });
  page.setDefaultTimeout(0); page.on('console', m => { if (!m.text().includes('GL Driver') && !m.text().includes('Interleaved')) console.log('PAGE:', m.type(), m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${page_}`);
  await page.waitForFunction('window.ready === true', null, { timeout: 300000 });
  for (const t of times.split(',')) { await page.evaluate(tt => window.renderFrame(tt), parseFloat(t)); await page.screenshot({ path: `${out}_${t}.png`, type: 'png' }); console.log('shot', t); }
  await browser.close(); server.close();
});

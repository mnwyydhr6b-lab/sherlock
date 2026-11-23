// kit_hud.js – Serien-Overlay (wie im Piloten): Ort/Uhrzeit, Zähler "SELBSTRESPEKT", Untertitel, Endkarte "Was wäre, wenn …?" + gelbe Frage.
const CSS = `
@font-face{font-family:Garamond;src:url(./node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-500-normal.woff2) format('woff2');font-style:normal;font-weight:500}
@font-face{font-family:Garamond;src:url(./node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-500-italic.woff2) format('woff2');font-style:italic;font-weight:500}
@font-face{font-family:Inter;src:url(./node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2) format('woff2');font-weight:700}
@font-face{font-family:Inter;src:url(./node_modules/@fontsource/inter/files/inter-latin-800-normal.woff2) format('woff2');font-weight:800}
.hud{position:absolute;left:70px;top:300px;color:#fff;font-family:Inter,sans-serif;text-shadow:0 2px 10px rgba(0,0,0,.8);z-index:5}
.hud .loc{font-weight:700;font-size:22px;letter-spacing:3px;opacity:.85;margin-bottom:14px}
.hud .lab{font-weight:800;font-size:24px;letter-spacing:4px}
.hud .num{font-weight:800;font-size:64px;line-height:1.05;transform-origin:left center}
.band{position:absolute;left:0;right:0;top:1200px;height:220px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.55),rgba(0,0,0,0));z-index:4}
.sub{position:absolute;left:90px;right:90px;top:1238px;text-align:center;color:#fff;font-family:Garamond,serif;font-style:italic;font-size:54px;line-height:1.15;text-shadow:0 2px 12px rgba(0,0,0,.9);z-index:5}
.dark{position:absolute;inset:0;background:#05060c;z-index:6;pointer-events:none}
.flash{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(255,40,40,0) 55%,rgba(255,30,30,.45) 100%);z-index:6;pointer-events:none}
.title{position:absolute;left:110px;right:110px;top:560px;text-align:center;color:#fff;font-family:Garamond,serif;font-size:76px;line-height:1.12;text-shadow:0 3px 18px rgba(0,0,0,.9);z-index:7}
.crk{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:4;pointer-events:none}
.question{position:absolute;left:90px;right:90px;top:1060px;text-align:center;color:#f2cf55;font-family:Garamond,serif;font-style:italic;font-size:60px;text-shadow:0 3px 14px rgba(0,0,0,.9);z-index:7}`;
export async function createHUD(parent = document.getElementById('wrap')) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; };
  const hud = el('hud', '<div class="loc"></div><div class="lab">SELBSTRESPEKT</div><div class="num">100 %</div>');
  const band = el('band'), sub = el('sub'), dark = el('dark'), flash = el('flash'), title = el('title'), question = el('question');
  const crk = document.createElement('canvas'); crk.className = 'crk'; crk.width = 1080; crk.height = 1920; parent.appendChild(crk); const cg = crk.getContext('2d');
  [band, sub, dark, flash, title, question].forEach(d => d.style.opacity = 0);
  await Promise.all(['500 40px Garamond', 'italic 500 40px Garamond', '700 20px Inter', '800 30px Inter'].map(f => document.fonts.load(f))); await document.fonts.ready;
  return {
    hud(op = 1) { hud.style.opacity = op; },
    loc(text) { hud.querySelector('.loc').textContent = text; },
    // Zähler: Wert in %, flash 0..1 (rot aufblinken bei einem Abfall)
    counter(v, fl = 0) { const n = hud.querySelector('.num'); n.textContent = Math.round(v) + ' %'; n.style.color = fl > 0.05 ? `rgb(255,${255 - 190 * fl | 0},${255 - 190 * fl | 0})` : '#fff'; n.style.transform = `scale(${1 + 0.12 * fl})`; flash.style.opacity = fl * 0.8; },
    sub(text, op = 1) { sub.textContent = text; sub.style.opacity = op; band.style.opacity = op * 0.9; },
    dark(op) { dark.style.opacity = op; },
    // Ego-Perspektive: das Bild springt wie Glas. level = Anzahl Einschläge (0…5), grow = Wachstum des neuesten (0…1)
    cracks(level = 0, grow = 1) { cg.clearRect(0, 0, 1080, 1920); for (let i = 0; i < Math.min(level, IMPACTS.length); i++) drawImpact(cg, IMPACTS[i], i === Math.ceil(level) - 1 ? grow : 1, 11 + i * 7); },
    // roter, pulsierender Rand (peinlich), 0…1
    redEdge(k) { flash.style.opacity = Math.max(+flash.style.opacity || 0, k * 0.75); },
    end(t, q, opT, opQ) { title.textContent = t; question.textContent = q; title.style.opacity = opT; question.style.opacity = opQ; },
  };
}
// Glas-Sprünge: Einschlagpunkte (feste Reihenfolge, damit jede Folge gleich aussieht)
const IMPACTS = [[930, 260], [140, 1500], [880, 1640], [180, 520], [620, 980]];
function drawImpact(g, [cx, cy], grow, seed) {
  let s = seed * 7919 + 17; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rays = 9 + Math.floor(r() * 4), R = (380 + r() * 260) * grow; const rayPts = [];
  for (let k = 0; k < rays; k++) { const a = (k / rays) * Math.PI * 2 + r() * 0.5; const pts = [[cx, cy]]; let x = cx, y = cy, ang = a; const segs = 6;
    for (let j = 1; j <= segs; j++) { ang += (r() - 0.5) * 0.35; const len = (R / segs) * (0.6 + r() * 0.8); x += Math.cos(ang) * len; y += Math.sin(ang) * len; pts.push([x, y]); } rayPts.push(pts); }
  const stroke = (pts, w) => { for (const [col, off, lw] of [['rgba(0,0,0,0.45)', 2, w + 1.5], ['rgba(255,255,255,0.88)', 0, w]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + off, y + off) : g.moveTo(x + off, y + off)); g.stroke(); } };
  rayPts.forEach(p => stroke(p, 2.6));
  // Querrisse (Spinnennetz) zwischen benachbarten Strahlen
  for (const ring of [2, 4]) for (let k = 0; k < rays; k++) { if (r() < 0.25) continue; const a = rayPts[k][ring], b = rayPts[(k + 1) % rays][ring]; if (a && b) stroke([a, [(a[0] + b[0]) / 2 + (r() - 0.5) * 20, (a[1] + b[1]) / 2 + (r() - 0.5) * 20], b], 1.8); }
  // zersplitterte Mitte
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, rr = (18 + r() * 22) * grow; k ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill();
}
// Zählerverlauf aus Keys [[t, wert], ...]: Wert und Blinken (nach jedem Abfall 0.7 s)
export function counterAt(t, ks) { let v = ks[0][1], fl = 0; for (let i = 1; i < ks.length; i++) { const [kt, kv] = ks[i], pv = ks[i - 1][1]; if (t >= kt) { const k = Math.min(1, (t - kt) / 0.6); const s = k * k * (3 - 2 * k); v = pv + (kv - pv) * s; fl = Math.max(fl, 1 - Math.min(1, (t - kt) / 0.7)); } } return { v, fl }; }

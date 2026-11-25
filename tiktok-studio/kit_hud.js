// kit_hud.js – Serien-Overlay: Ort/Uhrzeit, Zähler "SELBSTRESPEKT", Untertitel und die einheitliche Endkarte (seit 23.11.):
// dunkles Bild -> klein "REGEL NR. X" -> Regel groß in Weiß -> gelbe kursive Frage -> klein "Folge für Regel Nr. X+1". Pro Frame: hud.endCard(t - start, { nr, rule, question })
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

.rnr{position:absolute;left:0;right:0;top:520px;text-align:center;color:#fff;font-family:Inter,sans-serif;font-weight:800;font-size:34px;letter-spacing:10px;opacity:.9;z-index:7}
.rnr:after{content:'';display:block;width:90px;height:4px;background:#f2cf55;margin:26px auto 0}
.rule{position:absolute;left:100px;right:100px;top:640px;text-align:center;color:#fff;font-family:Garamond,serif;font-size:80px;line-height:1.12;text-shadow:0 3px 18px rgba(0,0,0,.9);z-index:7}
.follow{position:absolute;left:0;right:0;top:1500px;text-align:center;color:#fff;font-family:Inter,sans-serif;font-weight:700;font-size:30px;letter-spacing:3px;opacity:.85;z-index:7}
.hookq{position:absolute;left:80px;right:80px;top:560px;text-align:center;color:#fff;font-family:Garamond,serif;font-size:70px;line-height:1.12;text-shadow:0 3px 18px rgba(0,0,0,.95),0 0 40px rgba(0,0,0,.6);z-index:7}
.question{position:absolute;left:90px;right:90px;top:1060px;text-align:center;color:#f2cf55;font-family:Garamond,serif;font-style:italic;font-size:60px;text-shadow:0 3px 14px rgba(0,0,0,.9);z-index:7}`;
export async function createHUD(parent = document.getElementById('wrap')) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; parent.appendChild(d); return d; };
  const hud = el('hud', '<div class="loc"></div><div class="lab">SELBSTRESPEKT</div><div class="num">100 %</div>');
  const band = el('band'), sub = el('sub'), dark = el('dark'), flash = el('flash'), title = el('title'), question = el('question'), rnr = el('rnr'), rule = el('rule'), follow = el('follow'), hookq = el('hookq');
  [band, sub, dark, flash, title, question, rnr, rule, follow, hookq].forEach(d => d.style.opacity = 0);
  await Promise.all(['500 40px Garamond', 'italic 500 40px Garamond', '700 20px Inter', '800 30px Inter'].map(f => document.fonts.load(f))); await document.fonts.ready;
  return {
    hud(op = 1) { hud.style.opacity = op; },
    loc(text) { hud.querySelector('.loc').textContent = text; },
    // Zähler: Wert in %, flash 0..1 (rot aufblinken bei einem Abfall)
    counter(v, fl = 0, up = false) { const n = hud.querySelector('.num'); n.textContent = Math.round(v) + ' %';
      n.style.color = fl > 0.05 ? (up ? `rgb(${255 - 160 * fl | 0},255,${255 - 120 * fl | 0})` : `rgb(255,${255 - 190 * fl | 0},${255 - 190 * fl | 0})`) : '#fff'; n.style.transform = `scale(${1 + 0.12 * fl})`;
      flash.style.background = up ? 'radial-gradient(ellipse at 50% 50%,rgba(60,255,120,0) 55%,rgba(60,255,120,.35) 100%)' : ''; flash.style.opacity = fl * 0.8; },
    // Hook-Frage oben groß (seit Folge 10): „Was wäre, wenn …?“
    hook(text, op = 1) { hookq.textContent = text; hookq.style.top = '560px'; hookq.style.opacity = op; },
    // Untertitel-Höhe (Pixel von oben, Standard 1238) – z. B. höher setzen, solange das Handy unten im Bild ist
    subTop(px = 1238) { sub.style.top = px + 'px'; band.style.top = (px - 38) + 'px'; },
    sub(text, op = 1) { sub.textContent = text; sub.style.opacity = op; band.style.opacity = op * 0.9; },
    dark(op) { dark.style.opacity = op; },
    // Einheitliche Endkarte. lt = Sekunden seit Beginn der Endkarte (< 0: unsichtbar). Dauer ca. 5 s.
    // hook: Hook-Frage vom Anfang erscheint zuerst noch einmal (ca. 1,6 s), danach Regel/Frage (Ende verbindet sich mit dem Anfang)
    endCard(lt, { nr, rule: r, question: q, follow: f = `Folge für Regel Nr. ${nr + 1}`, hook = null }) { const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
      const sh = hook ? 1.8 : 0; if (hook && lt > 0) { hookq.textContent = hook; hookq.style.top = '760px'; hookq.style.opacity = sm((lt - 0.2) / 0.4) * (1 - sm((lt - 1.5) / 0.35)); }
      const d = sm(lt / 0.6), a = sm((lt - sh - 0.3) / 0.5), b = sm((lt - sh - 0.7) / 0.6), c = sm((lt - sh - 1.9) / 0.6), e = sm((lt - sh - 2.8) / 0.6);
      dark.style.opacity = d * 0.82; rnr.textContent = `REGEL NR. ${nr}`; rule.textContent = r; question.textContent = q; follow.textContent = f;
      rnr.style.opacity = a * 0.9; rule.style.opacity = b; rule.style.transform = `translateY(${(1 - b) * 24}px)`; question.style.opacity = c; question.style.top = '1180px'; follow.style.opacity = e * 0.85;
      if (lt > 0) { hud.style.opacity = 1 - d; sub.style.opacity = 0; band.style.opacity = 0; } },
    end(t, q, opT, opQ) { title.textContent = t; question.textContent = q; title.style.opacity = opT; question.style.opacity = opQ; },
  };
}
// Zählerverlauf aus Keys [[t, wert], ...]: Wert und Blinken (nach jedem Abfall 0.7 s)
export function counterAt(t, ks) { let v = ks[0][1], fl = 0, up = false; for (let i = 1; i < ks.length; i++) { const [kt, kv] = ks[i], pv = ks[i - 1][1]; if (t >= kt) { const k = Math.min(1, (t - kt) / 0.6); const s = k * k * (3 - 2 * k); v = pv + (kv - pv) * s; const f = 1 - Math.min(1, (t - kt) / 0.7); if (f > fl) { fl = f; up = kv > pv; } } } return { v, fl, up }; } // up: Zähler steigt (grün)

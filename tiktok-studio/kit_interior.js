// kit_interior.js – Innenräume: makeRoom (Wände mit Fenstern/Türen, Boden, Decke, Fußleisten, Heizkörper, Rollladenkasten)
// und Möbel-Bausteine (Bett, Schreibtisch, Gaming-Stuhl, Monitor, Tastatur, Lampe, Schrank, Regal, Poster, Teppich, LED-Streifen, Pflanze, Rucksack, Klamotten).
// Konvention: Möbel stehen mit der Unterseite auf y = 0, Vorderseite zeigt nach +z.
import * as THREE from 'three';
import { T, triMat, std, rbox, add, cnv, tex, makeRng, blobGeo } from './kit_world.js';

export const mPaint = (color) => triMat({ map: T.paint.map, bump: T.paint.bump, scale: 1.0, color, roughness: 0.92, bumpScale: 0.3 });
export const mFabric = (color, rep = 2) => { const m = T.fabric.map.clone(); m.needsUpdate = true; m.repeat.set(rep, rep); return std(color, 0.95, 0, { map: m }); };
const WHITE = () => std(0xf3f2ee, 0.45);

// ---------------------------------------------------------------- room
// o: { w, d, h, wall, wallColors:{n,s,e,w}, floor:'laminat'|'fliesen'|'teppich', floorColor, ceiling, cut:['s'], windows:[{wall,x,y,w,h,sash,curtains,radiator,shutter}], doors:[{wall,x,w,h,open,color}] }
export function makeRoom(o = {}) {
  const W = o.w ?? 4.2, D = o.d ?? 3.8, H = o.h ?? 2.55, TH = 0.15; const g = new THREE.Group(); const cut = o.cut || [];
  const defs = { n: { len: W + 2 * TH, pos: [0, 0, -D / 2], ry: 0 }, s: { len: W + 2 * TH, pos: [0, 0, D / 2], ry: Math.PI }, w: { len: D, pos: [-W / 2, 0, 0], ry: Math.PI / 2 }, e: { len: D, pos: [W / 2, 0, 0], ry: -Math.PI / 2 } };
  g.userData = { W, D, H, walls: {} };
  for (const [k, wd] of Object.entries(defs)) {
    if (cut.includes(k)) continue;
    const wg = new THREE.Group(); wg.position.set(...wd.pos); wg.rotation.y = wd.ry; g.add(wg); g.userData.walls[k] = wg;
    const wins = (o.windows || []).filter(x => x.wall === k), doors = (o.doors || []).filter(x => x.wall === k);
    const s = new THREE.Shape(); s.moveTo(-wd.len / 2, 0); s.lineTo(wd.len / 2, 0); s.lineTo(wd.len / 2, H); s.lineTo(-wd.len / 2, H); s.lineTo(-wd.len / 2, 0);
    for (const h of [...wins, ...doors.map(d => ({ ...d, y: 0, h: d.h ?? 2.05, w: d.w ?? 0.9 }))]) { const p = new THREE.Path(); p.moveTo(h.x - h.w / 2, h.y); p.lineTo(h.x - h.w / 2, h.y + h.h); p.lineTo(h.x + h.w / 2, h.y + h.h); p.lineTo(h.x + h.w / 2, h.y); p.lineTo(h.x - h.w / 2, h.y); s.holes.push(p); }
    const wm = mPaint((o.wallColors && o.wallColors[k]) ?? o.wall ?? 0xdfe3ea);
    add(wg, new THREE.ExtrudeGeometry(s, { depth: TH, bevelEnabled: false }), wm, 0, 0, -TH);
    // skirting board (split at doors)
    const segs = [[-wd.len / 2 + (k === 'n' || k === 's' ? TH : 0), wd.len / 2 - (k === 'n' || k === 's' ? TH : 0)]];
    for (const d of doors) { const dw = d.w ?? 0.9; for (let i = segs.length - 1; i >= 0; i--) { const [a, b] = segs[i]; const l = d.x - dw / 2 - 0.06, r = d.x + dw / 2 + 0.06; if (r > a && l < b) { segs.splice(i, 1); if (l > a) segs.push([a, l]); if (b > r) segs.push([r, b]); } } }
    for (const [a, b] of segs) add(wg, rbox(b - a, 0.07, 0.016, 0.004), WHITE(), (a + b) / 2, 0.035, 0.008);
    for (const w of wins) windowIn(wg, w, TH);
    for (const d of doors) doorIn(wg, { ...d, w: d.w ?? 0.9, h: d.h ?? 2.05 }, TH);
  }
  // floor + ceiling
  const fm = o.floor === 'fliesen' ? triMat({ map: T.pavers.map, bump: T.pavers.bump, scale: 1 / 1.2, color: o.floorColor ?? 0xe8e6e0, roughness: 0.35, bumpScale: 0.4 })
    : o.floor === 'teppich' ? mFabric(o.floorColor ?? 0x8a8a90, 6) : triMat({ map: T.laminat.map, bump: T.laminat.bump, scale: 1 / 2.4, color: o.floorColor ?? 0xffffff, roughness: 0.5, bumpScale: 0.45 });
  add(g, new THREE.PlaneGeometry(W + 0.3, D + 0.3), fm, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const ceil = add(g, new THREE.BoxGeometry(W + 0.3, 0.12, D + 0.3), mPaint(o.ceiling ?? 0xf4f4f2), 0, H + 0.06, 0); ceil.castShadow = true;
  return g;
}
function windowIn(wg, w, TH) {
  const frame = WHITE(); const fw = 0.065, fd = 0.07, z = -TH / 2;
  const ring = (ww, hh, b, d) => { const s = new THREE.Shape(); s.moveTo(-ww / 2, 0); s.lineTo(ww / 2, 0); s.lineTo(ww / 2, hh); s.lineTo(-ww / 2, hh); s.lineTo(-ww / 2, 0); const p = new THREE.Path(); p.moveTo(-ww / 2 + b, b); p.lineTo(-ww / 2 + b, hh - b); p.lineTo(ww / 2 - b, hh - b); p.lineTo(ww / 2 - b, b); p.lineTo(-ww / 2 + b, b); s.holes.push(p); return new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }); };
  add(wg, ring(w.w, w.h, fw, fd), frame, w.x, w.y, z - fd / 2);
  const n = w.sash ?? (w.w > 1.0 ? 2 : 1), iw = w.w - 2 * fw, ih = w.h - 2 * fw, mull = 0.08, sw = (iw - (n - 1) * mull) / n;
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0, depthWrite: false });
  for (let k = 1; k < n; k++) add(wg, rbox(mull, ih, fd, 0.008), frame, w.x - iw / 2 + k * sw + (k - 0.5) * mull, w.y + w.h / 2, z);
  for (let k = 0; k < n; k++) { const cx = w.x - iw / 2 + sw / 2 + k * (sw + mull);
    add(wg, ring(sw, ih, 0.055, 0.055), frame, cx, w.y + fw, z - 0.02);
    const gl = add(wg, new THREE.PlaneGeometry(sw - 0.1, ih - 0.1), glass, cx, w.y + fw + ih / 2, z + 0.005, { cast: false, recv: false });
    // handle
    const hx = cx + (k % 2 ? -1 : 1) * (sw / 2 - 0.035); add(wg, rbox(0.03, 0.05, 0.025, 0.006), frame, hx, w.y + w.h / 2, z + 0.05); add(wg, rbox(0.022, 0.13, 0.02, 0.008), frame, hx, w.y + w.h / 2 - 0.06, z + 0.07); }
  // inner sill
  add(wg, rbox(w.w + 0.12, 0.03, 0.24, 0.006), std(0xe9e6df, 0.4), w.x, w.y - 0.015, 0.06);
  // roller shutter box + strap + winder
  if (w.shutter !== false) { add(wg, rbox(w.w + 0.12, 0.22, 0.07, 0.01), WHITE(), w.x, w.y + w.h + 0.13, 0.035); const sx = w.x + w.w / 2 + 0.09;
    add(wg, new THREE.PlaneGeometry(0.022, w.y + w.h + 0.02 - 1.05), std(0x8a8a8a, 0.7), sx, (w.y + w.h + 0.02 + 1.05) / 2, 0.012, { cast: false }); add(wg, rbox(0.06, 0.16, 0.04, 0.01), WHITE(), sx, 1.0, 0.02); }
  // radiator below
  if (w.radiator !== false && w.y > 0.6) { const rw = Math.min(w.w * 0.95, 1.4), rh = Math.min(0.55, w.y - 0.25); const c = cnv(256, 64), x = c.getContext('2d'); x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, 256, 64); for (let i = 0; i < 256; i += 8) { x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(i, 0, 2, 64); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(i + 3, 0, 2, 64); }
    const t = tex(c); t.repeat.set(rw / 0.5, 1); add(wg, rbox(rw, rh, 0.1, 0.015), std(0xffffff, 0.4, 0, { map: t }), w.x, 0.14 + rh / 2, 0.08); add(wg, new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12), std(0xf2f2ee, 0.35), w.x + rw / 2 + 0.05, 0.14 + rh - 0.05, 0.1); }
  // curtains
  if (w.curtains) { for (const sd of [-1, 1]) { const cw = 0.55, ch = w.y + w.h + 0.25 - 0.05; const geo = new THREE.PlaneGeometry(cw, ch, 24, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 28) * 0.035); geo.computeVertexNormals();
      add(wg, geo, std(w.curtains, 0.95, 0, { side: THREE.DoubleSide }), w.x + sd * (w.w / 2 + 0.22), 0.05 + ch / 2, 0.16); }
    add(wg, new THREE.CylinderGeometry(0.012, 0.012, w.w + 1.1, 8), std(0x2b2b2e, 0.4, 0.6), w.x, w.y + w.h + 0.3, 0.16, { rz: Math.PI / 2 }); }
}
function doorIn(wg, d, TH) {
  const white = std(d.frameColor ?? 0xf3f2ee, 0.4); const fz = -TH / 2;
  for (const sd of [-1, 1]) add(wg, rbox(0.07, d.h + 0.05, TH + 0.04, 0.01), white, d.x + sd * (d.w / 2 + 0.02), (d.h + 0.05) / 2, fz);
  add(wg, rbox(d.w + 0.11, 0.07, TH + 0.04, 0.01), white, d.x, d.h + 0.03, fz);
  const leaf = new THREE.Group(); leaf.position.set(d.x - d.w / 2 + 0.01, 0, 0.0); wg.add(leaf); leaf.rotation.y = -(d.open ?? 0);
  add(leaf, rbox(d.w - 0.03, d.h - 0.02, 0.04, 0.008), std(d.color ?? 0xf6f5f1, 0.45), (d.w - 0.03) / 2, (d.h - 0.02) / 2, 0.02);
  const hx = d.w - 0.12; add(leaf, new THREE.CylinderGeometry(0.025, 0.025, 0.012, 16), std(0xc8ccd0, 0.25, 0.9), hx, 1.05, 0.046, { rx: Math.PI / 2 }); add(leaf, rbox(0.13, 0.018, 0.02, 0.008), std(0xc8ccd0, 0.25, 0.9), hx - 0.055, 1.05, 0.065);
}

// ---------------------------------------------------------------- furniture
export function makeBed({ w = 1.4, l = 2.0, frame = 0xe9e4dc, duvet = 0x34446a, pillow = 0xf0eee8, seed = 3 } = {}) {
  const g = new THREE.Group(); const r = makeRng(seed); const fm = std(frame, 0.55);
  add(g, rbox(w + 0.08, 0.26, l + 0.06, 0.02), fm, 0, 0.18, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, rbox(0.06, 0.06, 0.06, 0.01), fm, sx * (w / 2 - 0.02), 0.03, sz * (l / 2 - 0.02));
  add(g, rbox(w + 0.1, 0.95, 0.07, 0.025), fm, 0, 0.47, -l / 2 - 0.02);
  add(g, rbox(w, 0.2, l - 0.02, 0.05), std(0xf2f0ea, 0.85), 0, 0.41, 0.01);
  // duvet: sheet lying on the mattress, folding down over the sides and the foot end
  { const L = l * 0.74, hang = 0.24; const dg = new THREE.PlaneGeometry(w + 2 * hang, L + hang, 48, 48); dg.rotateX(-Math.PI / 2); const p = dg.attributes.position; const top = 0.53;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), z = p.getZ(i) - hang / 2; let y = top; const hw = w / 2 + 0.015;
      if (Math.abs(x) > hw) { const e = Math.abs(x) - hw; y -= e; x = Math.sign(x) * (hw + Math.min(e, 0.03) * 0.6 + 0.01 * Math.sin(z * 14)); }
      const zEnd = L / 2 + 0.01; if (z > zEnd) { const e = z - zEnd; y = Math.min(y, top - e); z = zEnd + Math.min(e, 0.03) * 0.6; }
      y += 0.016 * Math.sin(x * 8 + z * 5) * Math.sin(z * 4.3 + 1) + 0.007 * Math.sin(x * 21 + z * 17) + 0.03 * Math.exp(-Math.pow((z + L * 0.25) * 3, 2));
      p.setXYZ(i, x, y, z); }
    dg.computeVertexNormals(); const dm = mFabric(duvet, 3); dm.side = THREE.DoubleSide; add(g, dg, dm, 0, 0, l / 2 - L / 2 + 0.02); }
  // pillows
  for (let i = 0; i < 2; i++) { const pg = rbox(0.62, 0.15, 0.42, 0.07, 3); const pp = pg.attributes.position; for (let k = 0; k < pp.count; k++) { const y = pp.getY(k); pp.setY(k, y * (1 - Math.pow(Math.abs(pp.getX(k)) / 0.31, 2) * 0.5)); } pg.computeVertexNormals();
    const m = add(g, pg, mFabric(pillow, 2), (i - 0.5) * 0.68 * (w > 1.2 ? 1 : 0), 0.58, -l / 2 + 0.3); m.rotation.y = (r() - 0.5) * 0.2; m.rotation.x = -0.12; if (w <= 1.2 && i) m.visible = false; }
  g.userData.seatY = 0.53; return g;
}
export function makeDesk({ w = 1.4, d = 0.7, h = 0.75, top = 0xf2f1ed, legs = 0x2b2b2e } = {}) {
  const g = new THREE.Group(); add(g, rbox(w, 0.035, d, 0.01), std(top, 0.45), 0, h - 0.0175, 0);
  for (const sx of [-1, 1]) { add(g, rbox(0.05, h - 0.035, 0.05, 0.01), std(legs, 0.4, 0.6), sx * (w / 2 - 0.06), (h - 0.035) / 2, d / 2 - 0.06); add(g, rbox(0.05, h - 0.035, 0.05, 0.01), std(legs, 0.4, 0.6), sx * (w / 2 - 0.06), (h - 0.035) / 2, -d / 2 + 0.06); }
  add(g, rbox(w - 0.12, 0.05, 0.03, 0.01), std(legs, 0.4, 0.6), 0, h - 0.1, -d / 2 + 0.06); g.userData.topY = h; return g;
}
export function makeGamingChair({ main = 0x1c1c20, accent = 0xc0302a } = {}) {
  const g = new THREE.Group(); const mm = std(main, 0.6), am = std(accent, 0.55);
  add(g, rbox(0.52, 0.11, 0.5, 0.04), mm, 0, 0.5, 0); add(g, rbox(0.12, 0.112, 0.5, 0.03), am, 0, 0.501, 0);
  const back = new THREE.Group(); back.position.set(0, 0.55, -0.24); back.rotation.x = -0.12; g.add(back);
  add(back, rbox(0.52, 0.8, 0.1, 0.05), mm, 0, 0.4, 0); add(back, rbox(0.14, 0.8, 0.102, 0.03), am, 0, 0.4, 0); add(back, rbox(0.3, 0.16, 0.12, 0.05), mm, 0, 0.88, 0);
  for (const sx of [-1, 1]) { add(g, rbox(0.06, 0.2, 0.06, 0.02), mm, sx * 0.27, 0.62, 0.02); add(g, rbox(0.09, 0.035, 0.26, 0.015), mm, sx * 0.27, 0.73, 0.04); }
  add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12), std(0x888c90, 0.3, 0.9), 0, 0.27, 0);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = add(g, rbox(0.33, 0.04, 0.05, 0.015), mm, Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.16); leg.rotation.y = -a; add(g, new THREE.SphereGeometry(0.03, 10, 8), mm, Math.cos(a) * 0.31, 0.035, Math.sin(a) * 0.31); }
  return g;
}
export function makeMonitor({ w = 0.62, h = 0.36, map = null } = {}) {
  const g = new THREE.Group(); add(g, rbox(w + 0.02, h + 0.02, 0.03, 0.008), std(0x111114, 0.35), 0, 0.12 + h / 2, 0);
  const scr = add(g, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1.4 }), 0, 0.12 + h / 2, 0.0155, { cast: false });
  add(g, rbox(0.05, 0.14, 0.04, 0.01), std(0x1a1a1e, 0.4), 0, 0.07, -0.03); add(g, rbox(0.24, 0.015, 0.16, 0.006), std(0x1a1a1e, 0.4), 0, 0.0075, 0); g.userData.screen = scr; return g;
}
export function makeKeyboard() { const g = new THREE.Group(); add(g, rbox(0.44, 0.022, 0.14, 0.006), std(0x141416, 0.5), 0, 0.011, 0);
  const c = cnv(256, 32), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 256, 0); ['#ff3b6b', '#ffb03b', '#3bff8a', '#3bb0ff', '#b03bff'].forEach((col, i) => gr.addColorStop(i / 4, col)); x.fillStyle = gr; x.fillRect(0, 0, 256, 32);
  for (let i = 0; i < 14; i++) for (let j = 0; j < 4; j++) add(g, rbox(0.024, 0.008, 0.024, 0.003), std(0x202024, 0.6), -0.19 + i * 0.029, 0.026, -0.045 + j * 0.03, { cast: false });
  add(g, new THREE.PlaneGeometry(0.45, 0.15), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, opacity: 0.9, toneMapped: false }), 0, 0.0235, 0, { rx: -Math.PI / 2, cast: false }); return g; }
export function makeDeskLamp({ on = true, color = 0xffd9a8 } = {}) { const g = new THREE.Group(); const m = std(0x2b2b2e, 0.4, 0.6);
  add(g, new THREE.CylinderGeometry(0.07, 0.08, 0.02, 20), m, 0, 0.01, 0); const a = add(g, new THREE.CylinderGeometry(0.01, 0.01, 0.38, 8), m, 0, 0.2, 0); a.rotation.z = 0.25; const b2 = add(g, new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8), m, -0.12, 0.47, 0.0); b2.rotation.z = -1.0;
  add(g, new THREE.ConeGeometry(0.07, 0.11, 20, 1, true), std(0x2b2b2e, 0.4, 0.6, { side: THREE.DoubleSide }), -0.25, 0.5, 0, { rz: 0.6 }); if (on) { add(g, new THREE.SphereGeometry(0.025, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 4 }), -0.24, 0.47, 0); const L = new THREE.PointLight(color, 2.2, 3.2, 2); L.position.set(-0.27, 0.42, 0); g.add(L); } return g; }
export function makeWardrobe({ w = 1.0, h = 2.0, d = 0.58, color = 0xf2f1ed } = {}) { const g = new THREE.Group(); const m = std(color, 0.5);
  add(g, rbox(w, h, d, 0.012), m, 0, h / 2, 0); add(g, new THREE.PlaneGeometry(0.004, h - 0.04), std(0x9a9a96, 0.6), 0, h / 2, d / 2 + 0.001, { cast: false });
  for (const sx of [-1, 1]) add(g, rbox(0.018, 0.22, 0.03, 0.008), std(0x9aa0a6, 0.3, 0.8), sx * 0.05, h * 0.52, d / 2 + 0.015); return g; }
export function makeShelf({ w = 0.9, seed = 5, books = 12 } = {}) { const g = new THREE.Group(); const r = makeRng(seed); add(g, rbox(w, 0.025, 0.22, 0.006), std(0xf2f1ed, 0.5), 0, 0, 0);
  const cols = [0x8a2b2b, 0x2b5a8a, 0xd9c27a, 0x3a6b3a, 0x2b2b2e, 0xe8e2d4, 0xb85a2a]; let x = -w / 2 + 0.04;
  for (let i = 0; i < books && x < w / 2 - 0.25; i++) { const bw = 0.025 + r() * 0.025, bh = 0.17 + r() * 0.08; add(g, rbox(bw, bh, 0.15 + r() * 0.04, 0.004), std(cols[i % cols.length], 0.7), x + bw / 2, 0.0125 + bh / 2, 0); x += bw + 0.003; }
  add(g, new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16), std(0xd8cdbd, 0.6), w / 2 - 0.12, 0.057, 0); const pl = new THREE.Mesh(blobGeo(2, 0.25, 3, seed), std(0x3f6b2a, 0.8)); pl.scale.set(0.09, 0.08, 0.09); pl.position.set(w / 2 - 0.12, 0.14, 0); pl.castShadow = true; g.add(pl);
  add(g, rbox(0.06, 0.11, 0.05, 0.01), std(0xffc94a, 0.4), w / 2 - 0.25, 0.07, 0.02); return g; }
export function makePoster(w, h, draw, { tape = true } = {}) { const c = cnv(Math.round(512 * w / h), 512); draw(c.getContext('2d'), c.width, c.height); const g = new THREE.Group();
  add(g, new THREE.PlaneGeometry(w, h), std(0xffffff, 0.6, 0, { map: tex(c) }), 0, 0, 0, { cast: false }); if (tape) for (const [sx, sy] of [[-1, 1], [1, 1]]) add(g, new THREE.PlaneGeometry(0.06, 0.025), std(0xf2efe0, 0.6, 0, { transparent: true, opacity: 0.8 }), sx * (w / 2 - 0.02), sy * (h / 2 - 0.01), 0.001, { cast: false, rz: sx * 0.6 }); return g; }
export function makeRug(w, d, draw) { const c = cnv(512, Math.round(512 * d / w)); draw(c.getContext('2d'), c.width, c.height); const m = add(new THREE.Group(), new THREE.PlaneGeometry(w, d), std(0xffffff, 0.98, 0, { map: tex(c) }), 0, 0.004, 0, { rx: -Math.PI / 2, cast: false }); return m.parent; }
// LED-Streifen entlang Punkten (Weltkoordinaten innerhalb der Gruppe); lights = Anzahl Punktlichter
export function makeLED(points, { color = 0xb45aff, glow = 6, lights = 3, intensity = 2.2, dist = 4 } = {}) { const g = new THREE.Group(); const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0);
  add(g, new THREE.TubeGeometry(curve, points.length * 20, 0.008, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: glow }), 0, 0, 0, { cast: false });
  for (let i = 0; i < lights; i++) { const p = curve.getPointAt((i + 0.5) / lights); const L = new THREE.PointLight(color, intensity, dist, 1.8); L.position.copy(p).add(new THREE.Vector3(0, -0.12, 0)); g.add(L); } return g; }
export function makePottedPlant({ h = 0.8, seed = 2, pot = 0xd8cdbd } = {}) { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.16, 0.12, 0.3, 20), std(pot, 0.6), 0, 0.15, 0); const r = makeRng(seed);
  const geo = blobGeo(2, 0.3, 3, seed); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(geo, std([0x3f6b2a, 0x4f7f30, 0x2f5520][i % 3], 0.75)); const a = r() * 6.28, rr = r() * 0.14; m.position.set(Math.cos(a) * rr, 0.35 + r() * (h - 0.35), Math.sin(a) * rr); m.scale.set(0.13, 0.1, 0.13).multiplyScalar(0.8 + r() * 0.5); m.rotation.set(r() * 3, r() * 3, r() * 3); m.castShadow = true; g.add(m); } return g; }
export function makeBackpack(color = 0x2b3a5a) { const g = new THREE.Group(); add(g, rbox(0.32, 0.44, 0.18, 0.06), std(color, 0.85), 0, 0.22, 0); add(g, rbox(0.24, 0.18, 0.06, 0.04), std(new THREE.Color(color).multiplyScalar(0.8), 0.85), 0, 0.15, 0.1); add(g, new THREE.TorusGeometry(0.05, 0.012, 6, 14, Math.PI), std(0x1a1a1e, 0.7), 0, 0.44, 0, { rx: 0 }); return g; }
export function makeClothes(colors = [0x3a3a40, 0xd8d4cc, 0x2f6b4f], seed = 4) { const g = new THREE.Group(); const r = makeRng(seed); colors.forEach((c, i) => { const geo = blobGeo(2, 0.35, 2.5, seed + i); const m = new THREE.Mesh(geo, mFabric(c, 2)); m.scale.set(0.24, 0.05, 0.18); m.position.set((r() - 0.5) * 0.12, 0.03 + i * 0.045, (r() - 0.5) * 0.1); m.rotation.y = r() * 3; m.castShadow = m.receiveShadow = true; g.add(m); }); return g; }
export function makeCan(color = 0x1fbf5a) { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.033, 0.033, 0.155, 20), std(color, 0.3, 0.7), 0, 0.0775, 0); add(g, new THREE.CylinderGeometry(0.03, 0.033, 0.01, 20), std(0xc8ccd0, 0.25, 0.9), 0, 0.16, 0); return g; }

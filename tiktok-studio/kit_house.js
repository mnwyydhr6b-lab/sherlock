// kit_house.js – procedural German detached house (Einfamilienhaus) with fake window interiors
import * as THREE from 'three';
import { T, triMat, std, phys, rbox, add, cnv, tex, makeRng } from './kit_world.js';

// ---------------------------------------------------------------- window interior atlas (4x4 tiles)
export const TILE = { warm: 0, warm2: 1, bed: 2, tv: 3, kitchen: 4, dark: 5, darkCurtain: 6, stairs: 7, party1: 8, party2: 9, party3: 10, party4: 11, disco: 12, curtainLit: 13, darkBlue: 14, party5: 15 };
let ATLAS = null;
export function interiorAtlas() {
  if (ATLAS) return ATLAS;
  const S = 256, c = cnv(S * 4, S * 4), g = c.getContext('2d'); const r = makeRng(77);
  const tile = (i, fn) => { const x = (i % 4) * S, y = ((i / 4) | 0) * S; g.save(); g.beginPath(); g.rect(x, y, S, S); g.clip(); g.translate(x, y); fn(); g.restore(); };
  const grad = (stops, x0 = 0, y0 = 0, x1 = 0, y1 = S) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => gr.addColorStop(o, col)); return gr; };
  const radial = (x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, col]) => gr.addColorStop(o, col)); return gr; };
  const curtains = (col, w = 46) => { for (const sx of [0, S - w]) { const gr = g.createLinearGradient(sx, 0, sx + w, 0); for (let k = 0; k <= 6; k++) gr.addColorStop(k / 6, k % 2 ? col : shade(col, 0.6)); g.fillStyle = gr; g.fillRect(sx, 0, w, S); } };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const rr = ((n >> 16) & 255) * k, gg = ((n >> 8) & 255) * k, bb = (n & 255) * k; return `rgb(${rr | 0},${gg | 0},${bb | 0})`; };
  const person = (x, y, s, col, arms = 0) => { g.fillStyle = col; g.beginPath(); g.arc(x, y - 62 * s, 11 * s, 0, 6.28); g.fill(); g.beginPath(); g.roundRect(x - 16 * s, y - 50 * s, 32 * s, 62 * s, 12 * s); g.fill();
    g.lineWidth = 8 * s; g.lineCap = 'round'; g.strokeStyle = col; g.beginPath(); if (arms === 1) { g.moveTo(x - 12 * s, y - 44 * s); g.lineTo(x - 26 * s, y - 80 * s); g.moveTo(x + 12 * s, y - 44 * s); g.lineTo(x + 28 * s, y - 78 * s); } else if (arms === 2) { g.moveTo(x + 12 * s, y - 44 * s); g.lineTo(x + 30 * s, y - 84 * s); g.moveTo(x - 12 * s, y - 44 * s); g.lineTo(x - 22 * s, y - 14 * s); } else { g.moveTo(x - 14 * s, y - 44 * s); g.lineTo(x - 20 * s, y - 8 * s); g.moveTo(x + 14 * s, y - 44 * s); g.lineTo(x + 20 * s, y - 8 * s); } g.stroke(); };
  // 0 warm living room
  tile(0, () => { g.fillStyle = grad([[0, '#ffcf8a'], [0.6, '#e89a52'], [1, '#6b3a1e']]); g.fillRect(0, 0, S, S); g.fillStyle = radial(128, 40, 4, 150, [[0, 'rgba(255,245,210,1)'], [1, 'rgba(255,200,120,0)']]); g.fillRect(0, 0, S, S);
    g.fillStyle = '#4a2a18'; g.fillRect(150, 70, 52, 40); g.fillStyle = '#d9b27a'; g.fillRect(155, 75, 42, 30); g.fillStyle = '#3a2216'; g.beginPath(); g.roundRect(40, 170, 180, 60, 14); g.fill(); g.fillStyle = '#5a3424'; g.fillRect(48, 150, 164, 30); curtains('#b0562e'); });
  // 1 warm living room with plant & shelf
  tile(1, () => { g.fillStyle = grad([[0, '#ffd99a'], [0.7, '#d98a4a'], [1, '#5a301a']]); g.fillRect(0, 0, S, S); g.fillStyle = radial(60, 120, 4, 120, [[0, 'rgba(255,240,200,0.95)'], [1, 'rgba(255,200,120,0)']]); g.fillRect(0, 0, S, S);
    g.fillStyle = '#3b2415'; g.fillRect(150, 40, 70, 200); g.fillStyle = '#c98a4a'; for (let k = 0; k < 5; k++) g.fillRect(156, 50 + k * 38, 58, 4); for (let k = 0; k < 14; k++) { g.fillStyle = ['#8a2b2b', '#2b5a8a', '#d9c27a', '#3a6b3a'][k % 4]; g.fillRect(158 + (k % 7) * 8, 26 + Math.floor(k / 7) * 38 + 30, 6, 22); }
    g.fillStyle = '#2f5a2a'; for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(70 + Math.sin(k) * 22, 150 + Math.cos(k * 1.7) * 26, 22, 9, k, 0, 6.28); g.fill(); } g.fillStyle = '#7a4a2a'; g.fillRect(55, 185, 32, 40); curtains('#c9a06a', 30); });
  // 2 bedroom, blinds half down
  tile(2, () => { g.fillStyle = grad([[0, '#ffe0a8'], [1, '#c27a3e']]); g.fillRect(0, 0, S, S); g.fillStyle = '#c9b8a0'; for (let y = 0; y < 120; y += 9) { g.fillRect(0, y, S, 6); } g.fillStyle = '#3a2a22'; g.fillRect(30, 200, 200, 56); g.fillStyle = '#e8d8c0'; g.fillRect(40, 190, 90, 20); });
  // 3 TV glow
  tile(3, () => { g.fillStyle = '#0b1230'; g.fillRect(0, 0, S, S); g.fillStyle = radial(150, 120, 6, 200, [[0, 'rgba(120,170,255,0.95)'], [0.5, 'rgba(50,80,190,0.5)'], [1, 'rgba(10,20,60,0)']]); g.fillRect(0, 0, S, S); g.fillStyle = '#05070f'; g.beginPath(); g.arc(80, 190, 26, 0, 6.28); g.fill(); g.fillRect(40, 200, 90, 60); g.fillRect(0, 225, S, 40); });
  // 4 kitchen (cool white)
  tile(4, () => { g.fillStyle = grad([[0, '#f4f7ff'], [1, '#b8c2d0']]); g.fillRect(0, 0, S, S); g.fillStyle = '#e8ecef'; g.fillRect(0, 0, S, 70); g.fillStyle = '#9aa4ae'; for (let k = 0; k < 4; k++) g.fillRect(8 + k * 62, 6, 56, 58); g.fillStyle = '#5a6470'; g.fillRect(0, 190, S, 70); g.fillStyle = '#d0d6dc'; g.fillRect(0, 182, S, 10); g.fillStyle = '#c9c9c9'; g.fillRect(180, 120, 40, 62); g.fillStyle = '#4a7a3a'; g.beginPath(); g.arc(60, 165, 16, 0, 6.28); g.fill(); });
  // 5 dark room
  tile(5, () => { g.fillStyle = grad([[0, '#141821'], [1, '#07090d']]); g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(80,90,120,0.25)'; g.fillRect(150, 40, 60, 90); });
  // 6 dark with curtains
  tile(6, () => { g.fillStyle = '#0c0e14'; g.fillRect(0, 0, S, S); curtains('#2a2630', 70); });
  // 7 stairwell
  tile(7, () => { g.fillStyle = grad([[0, '#e8b070'], [1, '#6a3a1e']]); g.fillRect(0, 0, S, S); g.fillStyle = '#5a3420'; for (let k = 0; k < 8; k++) g.fillRect(k * 30, 230 - k * 26, 34, 26 + k * 26); g.strokeStyle = '#2a1a10'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 190); g.lineTo(256, -20); g.stroke(); });
  // 8-11, 15 party
  const party = (i, a, b, c2) => tile(i, () => { g.fillStyle = grad([[0, a], [0.55, b], [1, c2]]); g.fillRect(0, 0, S, S);
    for (let k = 0; k < 3; k++) { g.fillStyle = radial(40 + r() * 180, 40 + r() * 80, 2, 90 + r() * 60, [[0, ['rgba(255,120,240,0.9)', 'rgba(120,200,255,0.8)', 'rgba(255,230,120,0.8)'][k]], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 0, S, S); }
    // string lights
    g.strokeStyle = 'rgba(40,20,40,0.6)'; g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= S; x += 8) g.lineTo(x, 22 + Math.sin(x / S * Math.PI) * 26); g.stroke(); for (let x = 8; x < S; x += 22) { g.fillStyle = radial(x, 22 + Math.sin(x / S * Math.PI) * 26 + 4, 0, 9, [[0, '#fff6d0'], [0.4, 'rgba(255,220,140,0.9)'], [1, 'rgba(255,200,120,0)']]); g.fillRect(x - 10, 10 + Math.sin(x / S * Math.PI) * 26, 20, 20); }
    const sil = 'rgba(40,10,50,0.92)'; const n = 2 + ((i * 7) % 3); for (let k = 0; k < n; k++) person(40 + k * (180 / n) + r() * 30, 262 + r() * 10, 1.15 + r() * 0.5, sil, (k + i) % 3); });
  party(8, '#ff7ad9', '#c43aa8', '#4a1050'); party(9, '#ff9ae0', '#d14ab6', '#5a1460'); party(10, '#b06bff', '#7a2fd0', '#2a0a50'); party(11, '#ff6aa8', '#e0408a', '#501030'); party(15, '#8ac8ff', '#a050e0', '#301060');
  // 12 disco dots
  tile(12, () => { g.fillStyle = grad([[0, '#d04ac0'], [1, '#30104a']]); g.fillRect(0, 0, S, S); for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; g.beginPath(); g.arc(r() * S, r() * S, 1.5 + r() * 3, 0, 6.28); g.fill(); } person(80, 262, 1.5, 'rgba(30,8,40,0.95)', 1); person(170, 266, 1.4, 'rgba(30,8,40,0.95)', 2); });
  // 13 closed curtains lit
  tile(13, () => { const gr = g.createLinearGradient(0, 0, S, 0); for (let k = 0; k <= 12; k++) gr.addColorStop(k / 12, k % 2 ? '#ffc070' : '#e08a40'); g.fillStyle = gr; g.fillRect(0, 0, S, S); g.fillStyle = grad([[0, 'rgba(255,255,255,0.15)'], [1, 'rgba(0,0,0,0.35)']]); g.fillRect(0, 0, S, S); });
  // 14 dark bluish
  tile(14, () => { g.fillStyle = grad([[0, '#1a2238'], [1, '#090c14']]); g.fillRect(0, 0, S, S); });
  // inner frame shadow for all tiles
  for (let i = 0; i < 16; i++) tile(i, () => { const v = g.createLinearGradient(0, 0, 0, S); v.addColorStop(0, 'rgba(0,0,0,0.45)'); v.addColorStop(0.12, 'rgba(0,0,0,0)'); g.fillStyle = v; g.fillRect(0, 0, S, S); });
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; ATLAS = t; return t;
}
export function glassGeo(w, h, tileIdx) { const geo = new THREE.PlaneGeometry(w, h); const uv = geo.attributes.uv; const tx = tileIdx % 4, ty = (tileIdx / 4) | 0; const pad = 0.01;
  for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, (tx + pad + u * (1 - 2 * pad)) / 4, 1 - (ty + pad + (1 - v) * (1 - 2 * pad)) / 4); } return geo; }

// ---------------------------------------------------------------- shared materials
let M = null;
function mats() {
  if (M) return M;
  const atlas = interiorAtlas();
  M = {
    pvc: std(0xf4f4f2, 0.32), anth: std(0x2b2f34, 0.45, 0.2), alu: std(0xb9bec4, 0.32, 0.75), zinc: std(0x9aa1a8, 0.38, 0.8), steel: std(0xd8dde2, 0.2, 0.9),
    glass: new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.04, metalness: 0.1, emissiveMap: atlas, emissive: 0xffffff, emissiveIntensity: 1.25 }),
    shutter: (() => { const m = T.shutter.map.clone(); m.needsUpdate = true; m.repeat.set(1, 6); return std(0xe9e9e6, 0.5, 0.1, { map: m }); })(),
    concrete: triMat({ map: T.pavers.map, bump: T.pavers.bump, scale: 1 / 2.4, color: 0xd8d6d0, roughness: 0.85, bumpScale: 0.6 }),
    canopy: new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.28, depthWrite: false }),
  };
  return M;
}

// Fensterglas mit Innenraum-Kachel (gemeinsames Material, Leuchtkraft über setWindowGlow)
export function windowGlass(w, h, tile) { return new THREE.Mesh(glassGeo(w, h, tile), mats().glass); }
// Leuchtkraft aller Fenster-Innenräume (Nacht ~1.25, Tag ~0.12)
export function setWindowGlow(v) { mats().glass.emissiveIntensity = v; }

// ---------------------------------------------------------------- house
// o: { w, d, floors, fh, plinth, pitch, wall, plinthColor, roof, trim, seed, front:[...], back:[...], left:[...], right:[...], door:{x,w,h,color,open,light}, chimney:[x,z], garage:{w,d,color,doorColor}, velux:[[x,s]...] }
// opening: { x, y, w, h, sash, tile, shutter, lit }
export function makeHouse(o) {
  const m = mats(); const rnd = makeRng(o.seed || 3);
  const W = o.w ?? 10, D = o.d ?? 9, F = o.floors ?? 2, FH = o.fh ?? 2.8, PL = o.plinth ?? 0.45, WT = 0.3;
  const H = PL + F * FH; const p = THREE.MathUtils.degToRad(o.pitch ?? 38), tp = Math.tan(p);
  const RT = 0.24, EO = 0.55, GO = 0.4;
  const g = new THREE.Group(); g.userData.H = H;
  const wallMat = triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 0.5, color: o.wall ?? 0xf1ece2, roughness: 0.93, bumpScale: 0.9 });
  const plinthMat = triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 1.6, color: o.plinthColor ?? 0x6c6c6a, roughness: 0.95, bumpScale: 2.0 });
  const trim = o.trim ? std(o.trim, 0.35) : m.pvc;

  // facade builder: facade space x right, y up, outer surface z=0, wall into -z
  const facade = (width, height, gable, openings, door) => {
    const fg = new THREE.Group();
    const s = new THREE.Shape(); s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, height); if (gable) s.lineTo(0, height + gable.peak), s.lineTo(-width / 2, height); else s.lineTo(-width / 2, height); s.lineTo(-width / 2, 0);
    if (gable) { s.curves = []; s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, gable.side); s.lineTo(0, gable.peak); s.lineTo(-width / 2, gable.side); s.lineTo(-width / 2, 0); }
    const holes = [...openings]; if (door) holes.push({ x: door.x, y: PL, w: door.w, h: door.h, isDoor: true });
    for (const h of holes) { const hp = new THREE.Path(); hp.moveTo(h.x - h.w / 2, h.y); hp.lineTo(h.x - h.w / 2, h.y + h.h); hp.lineTo(h.x + h.w / 2, h.y + h.h); hp.lineTo(h.x + h.w / 2, h.y); hp.lineTo(h.x - h.w / 2, h.y); s.holes.push(hp); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: WT, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 2 });
    add(fg, geo, wallMat, 0, 0, -WT);
    // plinth band
    const pb = add(fg, rbox(width + 0.06, PL, 0.06, 0.012), plinthMat, 0, PL / 2, 0.02);
    for (const h of openings) {
      const inset = 0.11, fd = 0.07, fw = 0.07;
      // frame ring
      const fs = new THREE.Shape(); fs.moveTo(-h.w / 2, 0); fs.lineTo(h.w / 2, 0); fs.lineTo(h.w / 2, h.h); fs.lineTo(-h.w / 2, h.h); fs.lineTo(-h.w / 2, 0);
      const fh2 = new THREE.Path(); fh2.moveTo(-h.w / 2 + fw, fw); fh2.lineTo(-h.w / 2 + fw, h.h - fw); fh2.lineTo(h.w / 2 - fw, h.h - fw); fh2.lineTo(h.w / 2 - fw, fw); fh2.lineTo(-h.w / 2 + fw, fw); fs.holes.push(fh2);
      add(fg, new THREE.ExtrudeGeometry(fs, { depth: fd, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 }), trim, h.x, h.y, -inset - fd);
      const n = h.sash ?? (h.w > 1.1 ? 2 : 1); const iw = h.w - 2 * fw, ih = h.h - 2 * fw; const mull = 0.08; const sw = (iw - (n - 1) * mull) / n;
      for (let k = 1; k < n; k++) add(fg, rbox(mull, ih, fd, 0.01), trim, h.x - iw / 2 + k * sw + (k - 0.5) * mull, h.y + h.h / 2, -inset - fd / 2);
      for (let k = 0; k < n; k++) { const cx = h.x - iw / 2 + sw / 2 + k * (sw + mull);
        // sash ring
        const ss = new THREE.Shape(); ss.moveTo(-sw / 2, 0); ss.lineTo(sw / 2, 0); ss.lineTo(sw / 2, ih); ss.lineTo(-sw / 2, ih); ss.lineTo(-sw / 2, 0); const sh = new THREE.Path(); const b = 0.05; sh.moveTo(-sw / 2 + b, b); sh.lineTo(-sw / 2 + b, ih - b); sh.lineTo(sw / 2 - b, ih - b); sh.lineTo(sw / 2 - b, b); sh.lineTo(-sw / 2 + b, b); ss.holes.push(sh);
        add(fg, new THREE.ExtrudeGeometry(ss, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), trim, cx, h.y + fw, -inset - 0.03);
        const tileIdx = Array.isArray(h.tile) ? h.tile[k % h.tile.length] : h.tile;
        const gm = add(fg, glassGeo(sw - 2 * b, ih - 2 * b, tileIdx ?? TILE.dark), m.glass, cx, h.y + fw + ih / 2, -inset - 0.05, { cast: false }); gm.userData.tile = tileIdx; }
      // sill
      add(fg, rbox(h.w + 0.12, 0.035, 0.22, 0.008), m.alu, h.x, h.y - 0.02, -0.03);
      // roller shutter
      if (h.shutter) { const sh = Math.min(1, h.shutter) * (h.h - 0.02); const sm = add(fg, new THREE.PlaneGeometry(h.w - 0.01, sh), h.shutterMat || m.shutter, h.x, h.y + h.h - sh / 2, -0.06, { cast: false }); add(fg, rbox(h.w - 0.01, 0.045, 0.03, 0.008), m.alu, h.x, h.y + h.h - sh, -0.06); }
      // reveal shadow helper: dark lining inside the opening (makes depth read)
    }
    return fg;
  };
  // ---- walls
  const frontF = facade(W, H, null, o.front || [], o.door); frontF.position.z = D / 2; g.add(frontF);
  const backF = facade(W, H, null, o.back || [], null); backF.rotation.y = Math.PI; backF.position.z = -D / 2; g.add(backF);
  const gable = { side: H + WT * tp, peak: H + (D / 2) * tp };
  const rightF = facade(D - 2 * WT, H, gable, o.right || [], null); rightF.rotation.y = Math.PI / 2; rightF.position.x = W / 2; g.add(rightF);
  const leftF = facade(D - 2 * WT, H, gable, o.left || [], null); leftF.rotation.y = -Math.PI / 2; leftF.position.x = -W / 2; g.add(leftF);
  // inner dark volume so nothing shows through gaps (kept behind the hallway)
  { const dd = D - 0.7 - (o.door && o.door.open ? 2.9 : 0); add(g, new THREE.BoxGeometry(W - 0.7, H + D / 2 * tp - 0.4, dd), std(0x0a0a0c, 1), 0, (H + D / 2 * tp - 0.4) / 2, -D / 2 + 0.35 + dd / 2, { cast: false, recv: false }); }

  // ---- roof
  const L = (D / 2 + EO) / Math.cos(p) + 0.05, Wr = W + 2 * GO;
  const roofMap = T.roof.map.clone(); roofMap.needsUpdate = true; roofMap.repeat.set(Wr / 2.4, L / 2.4); const roofBump = T.roof.bump.clone(); roofBump.needsUpdate = true; roofBump.repeat.copy(roofMap.repeat);
  const tileMat = std(o.roof ?? 0x45484e, 0.55, 0.05, { map: roofMap, bumpMap: roofBump, bumpScale: 2.2 });
  const fascia = std(o.fascia ?? 0x2b2f34, 0.5, 0.1), soffit = std(0xf2f0ea, 0.8);
  const slabMats = [fascia, fascia, tileMat, soffit, fascia, fascia];
  for (const side of [1, -1]) {
    const sg = new THREE.Group(); if (side < 0) sg.rotation.y = Math.PI; g.add(sg);
    const zc = (D / 2 + EO) / 2; const yu = H + (D / 2 - zc) * tp;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(Wr, RT, L), slabMats); slab.castShadow = slab.receiveShadow = true;
    slab.position.set(0, yu + RT / 2 * Math.cos(p), zc + RT / 2 * Math.sin(p)); slab.rotation.x = p; sg.add(slab);
    // gutter + eave point
    const eY = slab.position.y + (-RT / 2) * Math.cos(p) - (L / 2) * Math.sin(p), eZ = slab.position.z + (-RT / 2) * Math.sin(p) + (L / 2) * Math.cos(p);
    const gut = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, Wr, 14, 1, true, Math.PI / 2, Math.PI), m.zinc); gut.rotation.z = Math.PI / 2; gut.position.set(0, eY - 0.02, eZ + 0.06); gut.material.side = THREE.DoubleSide; gut.castShadow = true; sg.add(gut);
    if (side > 0) { for (const dx of [W / 2 - 0.18, -W / 2 + 0.18]) { // downpipes
        const top = new THREE.Vector3(dx, eY - 0.08, eZ + 0.06), bend = new THREE.Vector3(dx, eY - 0.55, D / 2 + 0.1); const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, top.distanceTo(bend), 10), m.zinc); seg.position.copy(top).add(bend).multiplyScalar(0.5); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(bend).normalize()); seg.castShadow = true; sg.add(seg);
        add(sg, new THREE.CylinderGeometry(0.045, 0.045, bend.y - 0.15, 10), m.zinc, dx, (bend.y + 0.15) / 2, D / 2 + 0.1); add(sg, new THREE.CylinderGeometry(0.055, 0.055, 0.3, 10), m.zinc, dx, 0.3, D / 2 + 0.1);
        for (let k = 1; k < 4; k++) add(sg, rbox(0.03, 0.03, 0.12, 0.005), m.zinc, dx, k * bend.y / 4, D / 2 + 0.05); } }
    // roof windows
    for (const [vx, vs] of (side > 0 ? (o.velux || []) : [])) { const vw = new THREE.Group(); slab.add(vw); vw.position.set(vx, RT / 2 + 0.035, -L / 2 + vs * L);
      add(vw, rbox(0.85, 0.08, 1.15, 0.02), std(0x2b2f34, 0.4, 0.3), 0, 0, 0); const gl = add(vw, glassGeo(0.7, 0.98, o.veluxTile ?? TILE.dark), m.glass, 0, 0.045, 0, { cast: false }); gl.rotation.x = -Math.PI / 2; }
  }
  // ridge cap
  const ridgeY = H + (D / 2) * tp + RT / Math.cos(p) - 0.03; g.userData.ridgeY = ridgeY;
  add(g, new THREE.CylinderGeometry(0.12, 0.12, Wr, 12), std(o.roof ?? 0x45484e, 0.6), 0, ridgeY, 0, { rz: Math.PI / 2 });
  // chimney
  if (o.chimney) { const [cx, cz] = o.chimney; const ys = H + (D / 2 - Math.abs(cz)) * tp; const top = ridgeY + 0.9; const hC = top - (ys - 0.5);
    const cm = triMat({ map: T.brick.map, bump: T.brick.bump, scale: 0.5, color: 0xffffff, roughness: 0.9, bumpScale: 1.2 });
    add(g, rbox(0.7, hC, 0.7, 0.02), o.chimneyMat === 'slate' ? std(0x33363b, 0.7) : cm, cx, ys - 0.5 + hC / 2, cz); add(g, rbox(0.86, 0.08, 0.86, 0.02), std(0x55585c, 0.7), cx, top + 0.04, cz); add(g, new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12), m.zinc, cx + 0.12, top + 0.25, cz); }

  // ---- door + entrance
  if (o.door) { const dr = o.door; const dz = D / 2; const dg = new THREE.Group(); dg.position.z = dz; g.add(dg);
    // frame
    const fw = 0.08; for (const sx of [-1, 1]) add(dg, rbox(fw, dr.h, 0.09, 0.01), trim, dr.x + sx * (dr.w / 2 - fw / 2), PL + dr.h / 2, -0.14); add(dg, rbox(dr.w, fw, 0.09, 0.01), trim, dr.x, PL + dr.h - fw / 2, -0.14);
    const leafW = dr.w - 2 * fw, leafH = dr.h - fw; const leaf = new THREE.Group(); const hingeX = dr.x - dr.w / 2 + fw; leaf.position.set(hingeX, PL, -0.16); dg.add(leaf);
    add(leaf, rbox(leafW, leafH, 0.07, 0.012), std(dr.color ?? 0x2b2f34, 0.45, 0.25), leafW / 2, leafH / 2, 0);
    const dglass = add(leaf, glassGeo(0.16, leafH - 0.5, dr.glassTile ?? TILE.curtainLit), m.glass, leafW * 0.72, leafH / 2, 0.037, { cast: false });
    add(leaf, new THREE.CylinderGeometry(0.014, 0.014, 0.9, 8), m.steel, leafW * 0.2, leafH * 0.48, 0.075);
    if (dr.open) { leaf.rotation.y = dr.open; // swing inward (toward -z): rotate around hinge
      // lit hallway box
      const hw = dr.w + 0.6, hd = 2.4, hh = dr.h + 0.4; const hallMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: dr.hallColor ?? 0xff6ad5, emissiveIntensity: 1.0, side: THREE.BackSide });
      const hall = add(dg, new THREE.BoxGeometry(hw, hh, hd), hallMat, dr.x, PL + hh / 2 - 0.01, -WT - hd / 2 + 0.01, { cast: false, recv: false });
      const floorM = std(0x6a4a3a, 0.6); add(dg, new THREE.PlaneGeometry(hw, hd), floorM, dr.x, PL + 0.005, -WT - hd / 2, { rx: -Math.PI / 2, cast: false });
      // silhouettes in hallway
      for (const [px, pz, s] of dr.silhouettes || []) { const sil = new THREE.Mesh(new THREE.CapsuleGeometry(0.2 * s, 1.1 * s, 4, 10), new THREE.MeshBasicMaterial({ color: 0x2a0b30 })); sil.position.set(dr.x + px, PL + 0.75 * s, -WT - pz); dg.add(sil); const hd2 = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 12, 10), sil.material); hd2.position.set(dr.x + px, PL + 1.5 * s, -WT - pz); dg.add(hd2); }
    }
    // canopy
    add(dg, new THREE.BoxGeometry(dr.w + 0.7, 0.025, 1.05), m.canopy, dr.x, PL + dr.h + 0.32, 0.53, { cast: false }); for (const sx of [-1, 1]) { const br = add(dg, new THREE.CylinderGeometry(0.012, 0.012, 0.9, 6), m.steel, dr.x + sx * (dr.w / 2 + 0.25), PL + dr.h + 0.7, 0.42, { cast: false }); br.rotation.x = -0.9; }
    add(dg, rbox(dr.w + 0.72, 0.04, 0.05, 0.01), m.steel, dr.x, PL + dr.h + 0.32, 1.05, { cast: false });
    // wall lamp + number + bell
    const lampX = dr.x + dr.w / 2 + 0.38; add(dg, rbox(0.12, 0.3, 0.1, 0.02), std(0x2b2f34, 0.4, 0.4), lampX, PL + 1.85, 0.05); add(dg, rbox(0.09, 0.24, 0.02, 0.01), new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 1.1 }), lampX, PL + 1.85, 0.105, { cast: false });
    const wl = new THREE.PointLight(0xffd2a0, dr.lampIntensity ?? 3.0, 5, 2); wl.position.set(lampX, PL + 1.8, 0.35); dg.add(wl);
    const num = cnv(128, 128); { const c = num.getContext('2d'); c.fillStyle = '#2b2f34'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#f4f4f4'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(dr.number ?? 7), 64, 68); }
    add(dg, new THREE.PlaneGeometry(0.2, 0.2), std(0xffffff, 0.4, 0, { map: tex(num) }), dr.x - dr.w / 2 - 0.32, PL + 1.85, 0.012, { cast: false });
    add(dg, rbox(0.1, 0.22, 0.03, 0.01), m.steel, dr.x - dr.w / 2 - 0.32, PL + 1.3, 0.02);
    // steps + landing
    add(dg, rbox(dr.w + 0.9, PL, 1.1, 0.02), m.concrete, dr.x, PL / 2, 0.55); add(dg, rbox(dr.w + 0.9, PL * 2 / 3, 0.34, 0.02), m.concrete, dr.x, PL / 3, 1.27); add(dg, rbox(dr.w + 0.9, PL / 3, 0.34, 0.02), m.concrete, dr.x, PL / 6, 1.61);
    g.userData.door = { x: dr.x, z: dz + 1.8, y: 0 };
  }
  // ---- garage
  if (o.garage) { const ga = o.garage; const gw = ga.w ?? 3.3, gd = ga.d ?? 6.5, gh = 2.75; const gx = -W / 2 - gw / 2 - 0.02; const gz = D / 2 - gd / 2 - (ga.setback ?? 0.4);
    const gg = new THREE.Group(); gg.position.set(gx, 0, gz); g.add(gg);
    add(gg, rbox(gw, gh, gd, 0.02), wallMat, 0, gh / 2, 0); add(gg, rbox(gw + 0.1, 0.22, gd + 0.1, 0.02), fascia, 0, gh + 0.06, 0);
    const gm = T.garage.map.clone(); gm.needsUpdate = true; gm.repeat.set(1, 2.1 / 1.0 / 4 * 4 / 2.1 * 2.1 / 1);
    add(gg, new THREE.PlaneGeometry(2.5, 2.12), std(ga.doorColor ?? 0xe6e6e4, 0.45, 0.2, { map: gm }), 0, 1.06, gd / 2 + 0.012, { cast: false });
    for (const sx of [-1, 1]) add(gg, rbox(0.06, 2.16, 0.05, 0.01), trim, sx * 1.28, 1.08, gd / 2 + 0.02); add(gg, rbox(2.62, 0.06, 0.05, 0.01), trim, 0, 2.15, gd / 2 + 0.02);
    add(gg, rbox(0.2, 0.12, 0.1, 0.02), std(0x2b2f34, 0.4), 1.45, 2.4, gd / 2 + 0.05);
    g.userData.garage = { x: gx, z: gz + gd / 2, w: gw };
  }
  return g;
}

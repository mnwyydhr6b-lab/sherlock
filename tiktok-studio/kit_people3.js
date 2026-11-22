// ================= faces & people (detail kit v3: 32px faces, blinking, lip-sync) =================
const SKINS = [0xc98d5f, 0xe2b48c, 0x8d5a3b, 0xf0c8a0, 0x6b432b, 0xd9a274];
const HAIRS = [0x2a1a10, 0x6b4423, 0xd9b45a, 0x111111, 0x8a3b1e, 0x3b2a20];
const EYES = [0x4a2c1a, 0x3a6ea5, 0x3f7a4a, 0x2a1a10];
let GT = 0; // global time, set every frame
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = typeof c === 'string' ? c : hex(c); g.fillRect(x, y, w, h); };
function faceTex(o, expr, blink, talk) {
  const { skin, hair, style, eye, stubble, freckles } = o;
  return pixTex(32, 32, (g) => {
    px(g, skin, 0, 0, 32, 32);
    // soft shading
    px(g, shade(skin, 1.05), 4, 4, 24, 8); px(g, shade(skin, 0.92), 0, 0, 2, 32); px(g, shade(skin, 0.92), 30, 0, 2, 32);
    px(g, shade(skin, 0.88), 2, 29, 28, 3); px(g, shade(skin, 0.94), 4, 27, 24, 2);
    const hd = shade(hair, 0.75), hl = shade(hair, 1.25);
    // hair fringe with strands
    if (style !== 'buzz') {
      px(g, hair, 0, 0, 32, 4);
      for (let x = 0; x < 32; x += 3) px(g, (x / 3) % 2 ? hd : hl, x, 1, 1, 2);
      px(g, hd, 0, 4, 32, 1);
      if (style === 'short') { px(g, hair, 0, 4, 9, 2); px(g, hair, 22, 4, 10, 2); px(g, hair, 3, 6, 3, 1); px(g, hair, 0, 4, 3, 9); px(g, hair, 29, 4, 3, 9); }
      if (style === 'long') { px(g, hair, 0, 4, 32, 3); px(g, hair, 0, 7, 4, 20); px(g, hair, 28, 7, 4, 20); px(g, hd, 4, 7, 1, 18); px(g, hd, 27, 7, 1, 18); px(g, hair, 11, 7, 10, 1); }
      if (style === 'afro') { px(g, hair, 0, 4, 32, 3); px(g, hair, 0, 7, 2, 8); px(g, hair, 30, 7, 2, 8); for (let x = 1; x < 31; x += 4) px(g, hl, x, 2, 2, 2); }
      if (style === 'bun') { px(g, hair, 0, 4, 7, 2); px(g, hair, 25, 4, 7, 2); px(g, hair, 0, 6, 2, 10); px(g, hair, 30, 6, 2, 10); }
    } else { px(g, shade(hair, 1.2), 0, 0, 32, 2); for (let x = 0; x < 32; x += 2) px(g, shade(hair, 1.35), x, 2, 1, 1); }
    // brows
    const browC = shade(hair, 0.65);
    const brow = (x0, y0, slope, flip) => { for (let i = 0; i < 6; i++) { const yy = y0 + Math.round(slope * (flip ? 5 - i : i) / 5); px(g, browC, x0 + i, yy, 1, 2); } };
    const by = 9;
    if (expr === 'annoyed') { brow(6, by - 1, 2, false); brow(20, by - 1, 2, true); }
    else if (expr === 'stare') { brow(6, by - 2, 0); brow(20, by - 2, 0); }
    else if (expr === 'awkward') { brow(6, by - 2, -1, false); brow(20, by, 0); }
    else if (expr === 'sad') { brow(6, by, -2, false); brow(20, by, -2, true); }
    else if (expr === 'laugh' || expr === 'smile') { brow(6, by - 1, 0); brow(20, by - 1, 0); }
    else { brow(6, by, 0); brow(20, by, 0); }
    // eyes
    const eyeAt = (x0) => {
      if (blink || expr === 'laugh') { px(g, '#1b1410', x0, 14, 6, 1); px(g, '#1b1410', x0, 13, 1, 1); px(g, '#1b1410', x0 + 5, 13, 1, 1); px(g, shade(skin, 0.85), x0, 12, 6, 1); return; }
      const big = expr === 'stare';
      px(g, '#1b1410', x0 - (big ? 1 : 0), 11, 6 + (big ? 2 : 0), 1); // lash line
      px(g, '#1b1410', x0 - 1, 12, 1, 1); px(g, '#1b1410', x0 + 6, 11, 1, 1);
      px(g, '#f6f4f0', x0, 12, 6, big ? 5 : 4);
      px(g, eye, x0 + 2, 12, 3, big ? 4 : 3); px(g, '#120c08', x0 + 3, 13, 1, 2);
      px(g, '#ffffff', x0 + 2, 12, 1, 1);
      px(g, shade(skin, 0.85), x0, 16 + (big ? 1 : 0), 6, 1);
    };
    eyeAt(6); eyeAt(20);
    // nose
    px(g, shade(skin, 0.9), 15, 15, 2, 5); px(g, shade(skin, 0.8), 14, 20, 4, 1); px(g, shade(skin, 0.65), 14, 20, 1, 1); px(g, shade(skin, 0.65), 17, 20, 1, 1);
    // cheeks / freckles / stubble
    if (expr === 'smile' || expr === 'laugh') { px(g, '#e8958c', 4, 19, 4, 2); px(g, '#e8958c', 24, 19, 4, 2); }
    if (freckles) for (const [fx, fy] of [[7, 18], [9, 19], [5, 20], [23, 18], [25, 19], [27, 20]]) px(g, shade(skin, 0.75), fx, fy, 1, 1);
    if (stubble) for (let i = 0; i < 40; i++) px(g, shade(hair, 0.9), 6 + ((i * 7) % 20), 24 + ((i * 3) % 6), 1, 1);
    // mouth
    const lipU = shade(skin, 0.58), lipL = shade(skin, 0.72), dark = '#3a1210';
    const mx = 11, my = 24;
    if (talk) { px(g, dark, mx + 2, my - 1, 6, 4); px(g, lipU, mx + 1, my - 2, 8, 1); px(g, lipL, mx + 1, my + 3, 8, 1); px(g, '#c0504a', mx + 3, my + 2, 4, 1); }
    else if (expr === 'smile') { px(g, lipU, mx + 1, my, 8, 1); px(g, lipL, mx + 2, my + 1, 6, 1); px(g, lipU, mx, my - 1, 1, 1); px(g, lipU, mx + 9, my - 1, 1, 1); }
    else if (expr === 'laugh') { px(g, dark, mx, my - 1, 10, 5); px(g, '#ffffff', mx + 1, my - 1, 8, 1); px(g, '#c0504a', mx + 2, my + 2, 6, 2); px(g, lipU, mx - 1, my - 2, 1, 1); px(g, lipU, mx + 10, my - 2, 1, 1); }
    else if (expr === 'awkward') { px(g, lipU, mx + 1, my, 6, 1); px(g, lipU, mx + 7, my - 1, 3, 1); px(g, lipL, mx + 2, my + 1, 5, 1); }
    else if (expr === 'annoyed') { px(g, lipU, mx + 1, my, 8, 1); px(g, lipL, mx + 2, my + 1, 6, 1); px(g, lipU, mx, my + 1, 1, 1); px(g, lipU, mx + 9, my + 1, 1, 1); }
    else if (expr === 'stare') { px(g, dark, mx + 3, my - 1, 4, 3); px(g, lipU, mx + 3, my - 2, 4, 1); px(g, lipL, mx + 3, my + 2, 4, 1); }
    else if (expr === 'sad') { px(g, lipU, mx + 1, my + 1, 8, 1); px(g, lipU, mx, my + 2, 1, 1); px(g, lipU, mx + 9, my + 2, 1, 1); px(g, '#8cc8ff', 8, 17, 1, 6); px(g, '#8cc8ff', 23, 17, 1, 6); }
    else { px(g, lipU, mx + 1, my, 8, 1); px(g, lipL, mx + 2, my + 1, 6, 1); }
  });
}
const headSideTex = (o) => pixTex(32, 32, (g) => {
  const { skin, hair, style } = o;
  px(g, skin, 0, 0, 32, 32); px(g, shade(skin, 0.88), 0, 29, 32, 3);
  px(g, hair, 0, 0, 32, 6);
  if (style === 'long') px(g, hair, 0, 0, 32, 27); else if (style !== 'buzz') { px(g, hair, 14, 0, 18, 16); px(g, shade(hair, 0.8), 14, 15, 18, 1); px(g, hair, 4, 6, 4, 8); }
  else px(g, shade(hair, 1.2), 10, 0, 22, 10);
  // ear
  px(g, shade(skin, 0.92), 10, 13, 5, 7); px(g, shade(skin, 0.72), 11, 15, 2, 3);
});
const headBackTex = (o) => pixTex(32, 32, (g) => { const { skin, hair, style } = o; const h = style === 'buzz' ? 12 : style === 'long' ? 32 : 22; px(g, hair, 0, 0, 32, h); for (let x = 1; x < 32; x += 4) px(g, shade(hair, 0.8), x, 2, 1, h - 4); if (h < 32) px(g, skin, 0, h, 32, 32 - h); });

function topTex(type, c1, c2, skin, part, seed) {
  return pixTex(32, 32, (g) => {
    px(g, c1, 0, 0, 32, 32);
    const d = shade(c1, 0.78), dd = shade(c1, 0.62), l = shade(c1, 1.15);
    // fabric noise + hem
    for (let i = 0; i < 60; i++) px(g, ((i * 13) % 7) > 3 ? shade(c1, 0.95) : shade(c1, 1.04), (i * 11) % 32, (i * 17) % 32, 1, 1);
    px(g, d, 0, 29, 32, 3); px(g, dd, 0, 29, 32, 1);
    if (part === 'front') {
      if (type === 'tee') {
        px(g, skin, 12, 0, 8, 2); px(g, skin, 13, 2, 6, 1); px(g, skin, 14, 3, 4, 1); px(g, d, 11, 0, 1, 3); px(g, d, 20, 0, 1, 3); px(g, d, 12, 3, 1, 1); px(g, d, 19, 3, 1, 1); px(g, d, 13, 4, 6, 1);
        const pc = [0xffffff, 0x111111, 0xff4d4d, 0xffd34d][seed % 4];
        const kind = seed % 4;
        if (kind === 0) { // smiley
          px(g, pc, 11, 10, 10, 10); px(g, c1, 13, 12, 2, 2); px(g, c1, 17, 12, 2, 2); px(g, c1, 13, 16, 6, 1); px(g, c1, 12, 15, 1, 1); px(g, c1, 19, 15, 1, 1);
        } else if (kind === 1) { // wave
          for (let x = 8; x < 24; x++) { const y = 14 + Math.round(Math.sin(x * 0.8) * 2); px(g, pc, x, y, 1, 2); } px(g, pc, 8, 19, 16, 1);
        } else if (kind === 2) { // block text
          px(g, pc, 9, 10, 14, 3); px(g, pc, 9, 15, 10, 2); px(g, pc, 9, 19, 12, 2);
        } else { px(g, pc, 10, 11, 12, 8); px(g, c1, 12, 13, 8, 4); px(g, pc, 14, 14, 4, 2); }
      } else if (type === 'hoodie') {
        px(g, d, 7, 0, 18, 4); px(g, dd, 12, 0, 8, 2); px(g, d, 6, 4, 2, 2); px(g, d, 24, 4, 2, 2);
        px(g, '#f2f2f2', 12, 4, 1, 9); px(g, '#f2f2f2', 19, 4, 1, 9); px(g, '#d0d0d0', 11, 13, 2, 2); px(g, '#d0d0d0', 19, 13, 2, 2);
        px(g, d, 7, 18, 18, 10); px(g, c1, 9, 20, 14, 7); px(g, dd, 7, 18, 18, 1); px(g, dd, 7, 18, 1, 10); px(g, dd, 24, 18, 1, 10);
        if (seed % 2) { px(g, l, 13, 8, 6, 4); px(g, dd, 14, 9, 4, 2); }
      } else if (type === 'jacket') {
        px(g, c2, 10, 0, 12, 29); for (let y = 6; y < 28; y += 4) px(g, shade(c2, 0.85), 12, y, 8, 1);
        px(g, dd, 9, 0, 1, 32); px(g, dd, 22, 0, 1, 32); for (let y = 0; y < 32; y += 2) { px(g, '#bdbdbd', 8, y, 1, 1); px(g, '#bdbdbd', 23, y, 1, 1); }
        px(g, l, 3, 0, 6, 6); px(g, l, 23, 0, 6, 6); px(g, dd, 3, 6, 6, 1); px(g, dd, 23, 6, 6, 1);
        px(g, dd, 2, 18, 6, 1); px(g, dd, 24, 18, 6, 1); px(g, dd, 4, 13, 4, 1);
      } else if (type === 'shirt') {
        px(g, skin, 12, 0, 8, 3); px(g, skin, 13, 3, 6, 2); px(g, skin, 14, 5, 4, 2); px(g, skin, 15, 7, 2, 1);
        px(g, d, 10, 0, 2, 6); px(g, d, 20, 0, 2, 6); px(g, l, 8, 0, 3, 4); px(g, l, 21, 0, 3, 4);
        px(g, d, 15, 8, 2, 21); for (let y = 10; y < 29; y += 5) px(g, '#e8e8e8', 15, y, 2, 2);
        px(g, d, 5, 10, 6, 5); px(g, dd, 5, 10, 6, 1); px(g, '#e8e8e8', 7, 12, 2, 1);
      }
    } else if (part === 'back') {
      if (type === 'hoodie') { px(g, d, 6, 0, 20, 8); px(g, dd, 8, 6, 16, 2); px(g, dd, 15, 0, 2, 6); }
      if (type === 'jacket') { px(g, d, 0, 0, 32, 4); px(g, dd, 15, 4, 2, 25); }
      if (type === 'shirt') { px(g, d, 0, 0, 32, 3); px(g, d, 4, 6, 24, 1); }
    } else { px(g, d, 0, 0, 3, 32); px(g, dd, 0, 0, 1, 32); }
  });
}
const armTex = (type, c1, skin) => pixTex(16, 32, (g) => {
  if (type === 'tee') { px(g, c1, 0, 0, 16, 11); px(g, shade(c1, 0.72), 0, 10, 16, 2); px(g, skin, 0, 12, 16, 20); px(g, shade(skin, 0.9), 0, 12, 16, 1); px(g, shade(skin, 0.94), 0, 12, 3, 20); }
  else { px(g, c1, 0, 0, 16, 32); px(g, shade(c1, 0.86), 0, 6, 2, 22); for (let y = 8; y < 26; y += 6) px(g, shade(c1, 0.9), 3, y, 10, 1); px(g, shade(c1, 0.7), 0, 26, 16, 6); px(g, shade(c1, 0.6), 0, 26, 16, 1); }
});
const handTex = (skin) => pixTex(16, 16, (g) => { px(g, skin, 0, 0, 16, 16); px(g, shade(skin, 0.86), 0, 0, 16, 2); for (const x of [4, 8, 12]) px(g, shade(skin, 0.75), x, 8, 1, 8); px(g, shade(skin, 1.06), 2, 3, 12, 3); });
const legTex = (type, c, side) => pixTex(16, 32, (g) => {
  px(g, c, 0, 0, 16, 32);
  for (let i = 0; i < 50; i++) px(g, ((i * 5) % 7) > 3 ? shade(c, 0.93) : shade(c, 1.06), (i * 7) % 16, (i * 13) % 32, 1, 1);
  if (type === 'jeans') {
    px(g, shade(c, 1.22), 4, 14, 8, 5); px(g, shade(c, 1.12), 3, 13, 10, 1);
    px(g, shade(c, 0.6), 0, 0, 16, 2); px(g, '#c9a24a', 7, 0, 2, 2); // belt + buckle
    if (!side) { px(g, shade(c, 0.72), 1, 3, 6, 1); px(g, shade(c, 0.72), 6, 4, 1, 4); px(g, '#d9a441', 1, 9, 1, 1); }
    else { px(g, shade(c, 0.8), 7, 2, 2, 26); }
    px(g, shade(c, 1.15), 0, 28, 16, 4); px(g, shade(c, 0.7), 0, 27, 16, 1);
  } else { px(g, shade(c, 0.85), 0, 28, 16, 4); px(g, shade(c, 0.6), 0, 0, 16, 2); if (side) { px(g, '#eeeeee', 6, 2, 2, 26); px(g, '#eeeeee', 9, 2, 2, 26); } }
});
const shoeTex = (c, top) => pixTex(16, 16, (g) => {
  px(g, '#f2f2f2', 0, 0, 16, 16);
  if (top) { px(g, '#dcdcdc', 4, 2, 8, 11); for (let y = 3; y < 12; y += 2) px(g, '#ffffff', 4, y, 8, 1); px(g, c, 0, 13, 16, 3); }
  else { px(g, c, 2, 4, 12, 3); px(g, c, 9, 3, 4, 1); px(g, '#bdbdbd', 0, 11, 16, 5); px(g, '#9a9a9a', 0, 11, 16, 1); px(g, shade(c, 0.8), 13, 2, 3, 6); }
});

const ALL_PEOPLE = [];
class Person {
  constructor(sc, o) {
    const g = new THREE.Group(); this.g = g; this.o = o; this.scene = sc; ALL_PEOPLE.push(this);
    const seed = o.seed ?? 0; this.seed = seed;
    const skin = o.skin ?? SKINS[0], hair = o.hair ?? HAIRS[0];
    const style = o.hairStyle ?? (o.longHair ? 'long' : ['short', 'buzz', 'afro', 'short', 'bun'][seed % 5]);
    const topType = o.top ?? ['tee', 'hoodie', 'jacket', 'tee'][seed % 4];
    const c1 = o.shirt ?? 0xffffff, c2 = o.shirt2 ?? [0xffffff, 0x222222, 0xf2c230, 0xff5a5a][seed % 4];
    const pantsC = o.pants ?? 0x2b3a67, pantsType = o.pantsType ?? (seed % 3 === 2 ? 'joggers' : 'jeans');
    this.fo = { skin, hair, style, eye: o.eye ?? EYES[seed % 4], stubble: o.stubble ?? (seed % 6 === 4), freckles: o.freckles ?? (seed % 7 === 3) };
    this.faceCache = new Map(); this.curExpr = o.expr || 'smile'; this.talk = o.talk || [];
    this.faceMat = mat({ map: this.faceFor(this.curExpr, false, false) });
    const sideM = mat({ map: headSideTex(this.fo) }), backM = mat({ map: headBackTex(this.fo) }), topM = mat({ color: style === 'buzz' ? shade(hair, 1.2) : hair });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), [sideM, sideM, topM, mat({ color: skin }), this.faceMat, backM]);
    head.position.y = 1.68; head.castShadow = true; g.add(head); this.head = head;
    const hm = mat({ color: hair, roughness: 0.95 }), hm2 = mat({ color: shade(hair, 0.82), roughness: 0.95 });
    const hb = (w, h, d, x, y, z, m = hm) => { const ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.position.set(x, y, z); ms.castShadow = true; head.add(ms); return ms; };
    if (style === 'short') { hb(0.54, 0.1, 0.54, 0, 0.29, 0); hb(0.56, 0.08, 0.2, 0, 0.27, 0.18, hm2); hb(0.18, 0.06, 0.12, -0.1, 0.33, 0.12); hb(0.54, 0.28, 0.06, 0, 0.1, -0.27); }
    if (style === 'long') { hb(0.54, 0.11, 0.54, 0, 0.29, 0); hb(0.56, 0.66, 0.1, 0, -0.08, -0.26); hb(0.06, 0.5, 0.36, -0.27, -0.03, -0.06, hm2); hb(0.06, 0.5, 0.36, 0.27, -0.03, -0.06, hm2); hb(0.3, 0.06, 0.14, 0.06, 0.32, 0.16, hm2); }
    if (style === 'afro') { hb(0.68, 0.3, 0.64, 0, 0.36, -0.03); hb(0.64, 0.4, 0.14, 0, 0.12, -0.27); hb(0.08, 0.3, 0.4, -0.31, 0.15, -0.05); hb(0.08, 0.3, 0.4, 0.31, 0.15, -0.05); for (let i = 0; i < 6; i++) hb(0.14, 0.1, 0.14, -0.22 + (i % 3) * 0.22, 0.52, -0.2 + Math.floor(i / 3) * 0.3, hm2); }
    if (style === 'bun') { hb(0.54, 0.08, 0.54, 0, 0.28, 0); hb(0.2, 0.18, 0.2, 0, 0.38, -0.16, hm2); hb(0.54, 0.3, 0.06, 0, 0.1, -0.27); hb(0.22, 0.03, 0.22, 0, 0.3, -0.16, mat({ color: 0xff4fd8 })); }
    if (o.cap) { const cm = mat({ color: o.cap }); const cap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.15, 0.56), cm); cap.position.y = 0.31; head.add(cap); const brim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.26), cm); brim.position.set(0, 0.25, 0.36); head.add(brim); const logo = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.01), mat({ color: 0xffffff })); logo.position.set(0, 0.33, 0.285); head.add(logo); const btn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.06), cm); btn.position.y = 0.4; head.add(btn); }
    if (o.glasses) { const gm = mat({ color: 0x111111 }); for (const gx of [-0.12, 0.12]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.02), gm); f.position.set(gx, 0.03, 0.26); head.add(f); const lens = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.01), mat({ color: 0x9fd0ff, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.35 })); lens.position.set(gx, 0.03, 0.272); head.add(lens); } const br = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), gm); br.position.set(0, 0.05, 0.26); head.add(br); for (const sx of [-0.255, 0.255]) { const arm_ = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.26), gm); arm_.position.set(sx, 0.05, 0.13); head.add(arm_); } }
    if (o.earring) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat({ color: 0xffcf40, metalness: 0.8, roughness: 0.3 })); e.position.set(0.26, -0.08, 0.02); head.add(e); }
    const front = mat({ map: topTex(topType, c1, c2, skin, 'front', seed) }), back = mat({ map: topTex(topType, c1, c2, skin, 'back', 0) }), side = mat({ map: topTex(topType, c1, c2, skin, 'side', 0) });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.32), [side, side, mat({ color: c1 }), mat({ color: c1 }), front, back]);
    torso.position.y = 1.07; torso.castShadow = true; g.add(torso); this.torso = torso;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.2), mat({ color: shade(skin, 0.85) })); neck.position.y = 1.44; g.add(neck);
    if (topType === 'hoodie') { const hood = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.14), mat({ color: shade(c1, 0.8) })); hood.position.set(0, 1.47, -0.16); g.add(hood); }
    if (topType === 'jacket') { for (const sx of [-1, 1]) { const col = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), mat({ color: shade(c1, 1.1) })); col.position.set(sx * 0.17, 1.4, 0.15); col.rotation.z = sx * 0.3; g.add(col); } }
    if (o.chain) { const cm = mat({ color: 0xffcf40, metalness: 0.85, roughness: 0.28, emissive: 0x2a1c00 }); for (const [cx, cy, w] of [[-0.09, 1.36, 0.05], [0.09, 1.36, 0.05], [-0.05, 1.3, 0.05], [0.05, 1.3, 0.05], [0, 1.26, 0.06]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, 0.02), cm); c.position.set(cx, cy, 0.17); g.add(c); } const pend = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.02), cm); pend.position.set(0, 1.21, 0.17); g.add(pend); }
    if (o.headphones) { const hp = mat({ color: 0x1a1a1a }); for (const sx of [-0.2, 0.2]) { const cup = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.14), hp); cup.position.set(sx, 1.4, 0.06); g.add(cup); } const band = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.05), hp); band.position.set(0, 1.4, -0.1); g.add(band); }
    if (o.bag) { const bg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.16), mat({ color: o.bag })); bg.position.set(0, 1.1, -0.25); g.add(bg); }
    const am = mat({ map: armTex(topType, c1, skin) });
    const mkLimb = (w, h, d, m, x, y) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, -h / 2, 0); const ms = new THREE.Mesh(geo, m); ms.castShadow = true; piv.add(ms); g.add(piv); return piv; };
    this.armL = mkLimb(0.2, 0.72, 0.22, am, -0.42, 1.42); this.armR = mkLimb(0.2, 0.72, 0.22, am, 0.42, 1.42);
    const hmat = mat({ map: handTex(skin) }), sk = mat({ color: skin });
    for (const [a, sx] of [[this.armL, 1], [this.armR, -1]]) { const hnd = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.15, 0.21), [sk, sk, sk, sk, hmat, hmat]); hnd.position.y = -0.77; a.add(hnd); const th = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.07), sk); th.position.set(sx * 0.1, -0.74, 0.07); a.add(th); }
    if (o.watch) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.24), mat({ color: o.watch, metalness: 0.6, roughness: 0.3 })); w.position.y = -0.62; this.armL.add(w); const face = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.02), mat({ color: 0x111111, emissive: 0x223344 })); face.position.set(0, -0.62, 0.12); this.armL.add(face); }
    const lf = mat({ map: legTex(pantsType, pantsC, false) }), ls = mat({ map: legTex(pantsType, pantsC, true) });
    const legMats = [ls, ls, mat({ color: pantsC }), mat({ color: pantsC }), lf, lf];
    this.legL = mkLimb(0.28, 0.72, 0.28, legMats, -0.155, 0.72); this.legR = mkLimb(0.28, 0.72, 0.28, legMats, 0.155, 0.72);
    const shoeC = o.shoes ?? [0xff3b3b, 0x2f6bff, 0x111111, 0x46d18a][seed % 4];
    const sSide = mat({ map: shoeTex(shoeC, false) }), sTop = mat({ map: shoeTex(shoeC, true) }), sole = mat({ color: 0xbdbdbd });
    for (const l of [this.legL, this.legR]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.38), [sSide, sSide, sTop, sole, sSide, sSide]); s.position.set(0, -0.68, 0.04); s.castShadow = true; l.add(s); }
    g.scale.setScalar(o.scale ?? 1);
    g.position.set(o.x ?? 0, 0, o.z ?? 0); g.rotation.y = o.ry ?? 0;
    sc.add(g);
  }
  faceFor(e, blink, talk) { const k = e + (blink ? 'b' : '') + (talk ? 't' : ''); let t = this.faceCache.get(k); if (!t) { t = faceTex(this.fo, e, blink, talk); this.faceCache.set(k, t); } return t; }
  expr(e) { this.curExpr = e; }
  updateFace(t) {
    const period = 3.1 + (this.seed % 5) * 0.47, ph = (t + this.seed * 0.73) % period;
    const blink = ph < 0.13;
    let talk = false; for (const [a, b] of this.talk) if (t >= a && t < b) talk = Math.sin((t - a) * 26) > -0.2;
    const m = this.faceFor(this.curExpr, blink, talk);
    if (this.faceMat.map !== m) { this.faceMat.map = m; this.faceMat.needsUpdate = true; }
  }
  rest() { for (const l of [this.armL, this.armR, this.legL, this.legR]) l.rotation.set(0, 0, 0); this.head.rotation.set(0, 0, 0); this.g.position.y = 0; this.torso.rotation.set(0, 0, 0); }
  breathe(t) { const b = Math.sin(t * 1.6 + this.seed) * 0.008; this.torso.scale.set(1, 1 + b, 1 + b * 1.5); }
  dance(t, amt = 1, style = 0) {
    const k = t * 2.07 * Math.PI * 2 / 2 + style * 1.3;
    const b = Math.abs(Math.sin(k)) * 0.08 * amt;
    this.g.position.y = b;
    if (style % 3 === 0) { this.armL.rotation.z = -(2.4 + Math.sin(k) * 0.4) * amt; this.armR.rotation.z = (2.4 + Math.sin(k + 1) * 0.4) * amt; }
    else if (style % 3 === 1) { this.armL.rotation.x = -Math.sin(k) * 1.2 * amt; this.armR.rotation.x = Math.sin(k) * 1.2 * amt; this.armR.rotation.z = 0.3 * amt; }
    else { this.armR.rotation.z = (2.7 + Math.sin(k * 2) * 0.3) * amt; this.armL.rotation.x = -0.6 * amt + Math.sin(k) * 0.3 * amt; }
    this.head.rotation.x = Math.sin(k * 2) * 0.12 * amt; this.head.rotation.y = Math.sin(k * 0.5) * 0.2 * amt;
    this.torso.rotation.y = Math.sin(k) * 0.12 * amt;
    this.legL.rotation.x = Math.sin(k) * 0.25 * amt; this.legR.rotation.x = -Math.sin(k) * 0.25 * amt;
  }
  walk(t, speed = 1) {
    const k = t * 9 * speed;
    this.legL.rotation.x = Math.sin(k) * 0.6; this.legR.rotation.x = -Math.sin(k) * 0.6;
    this.armL.rotation.x = -Math.sin(k) * 0.45; this.armR.rotation.x = Math.sin(k) * 0.45;
    this.g.position.y = Math.abs(Math.cos(k)) * 0.04;
  }
  idle(t, s = 0) { this.head.rotation.y = Math.sin(t * 0.7 + s) * 0.15; this.armR.rotation.x = Math.sin(t * 1.3 + s) * 0.08; this.g.position.y = 0; this.breathe(t); }
  chat(t, s = 0) { this.head.rotation.y = Math.sin(t * 0.9 + s) * 0.25; this.head.rotation.x = Math.sin(t * 2.1 + s) * 0.06; this.armR.rotation.x = -0.5 - 0.35 * Math.max(0, Math.sin(t * 2.3 + s)); this.armR.rotation.z = 0.25; this.breathe(t); }
  face(tx, tz, k = 1) { const a = Math.atan2(tx - this.g.position.x, tz - this.g.position.z); this.g.rotation.y = lerpAngle(this.g.rotation.y, a, k); }
}

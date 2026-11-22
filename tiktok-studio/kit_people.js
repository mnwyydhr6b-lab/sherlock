// ================= faces & people (detail kit v2) =================
const SKINS = [0xc98d5f, 0xe2b48c, 0x8d5a3b, 0xf0c8a0, 0x6b432b, 0xd9a274];
const HAIRS = [0x2a1a10, 0x6b4423, 0xd9b45a, 0x111111, 0x8a3b1e, 0x3b2a20];
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = typeof c === 'string' ? c : hex(c); g.fillRect(x, y, w, h); };
function faceTex(skin, hair, style, expr) {
  return pixTex(16, 16, (g) => {
    px(g, skin, 0, 0, 16, 16);
    const sh = shade(skin, 0.86), dk = '#1b1410', lip = shade(skin, 0.62);
    // hair fringe
    if (style !== 'buzz') { px(g, hair, 0, 0, 16, 2); px(g, shade(hair, 0.8), 0, 2, 16, 1); }
    else px(g, shade(hair, 1.25), 0, 0, 16, 1);
    if (style === 'short') { px(g, hair, 0, 2, 5, 1); px(g, hair, 11, 2, 5, 1); px(g, hair, 0, 3, 2, 3); px(g, hair, 14, 3, 2, 3); }
    if (style === 'long') { px(g, hair, 0, 2, 16, 2); px(g, hair, 0, 4, 2, 9); px(g, hair, 14, 4, 2, 9); px(g, hair, 6, 3, 4, 1); }
    if (style === 'afro') { px(g, hair, 0, 2, 16, 2); px(g, hair, 0, 4, 1, 4); px(g, hair, 15, 4, 1, 4); }
    if (style === 'bun') { px(g, hair, 0, 2, 4, 1); px(g, hair, 12, 2, 4, 1); px(g, hair, 0, 3, 1, 5); px(g, hair, 15, 3, 1, 5); }
    // brows
    const brow = (x, y, slope) => { for (let i = 0; i < 3; i++) px(g, shade(hair, 0.7), x + i, y + Math.round(slope * (i - 1)), 1, 1); };
    if (expr === 'annoyed') { brow(3, 5, 0.7); brow(10, 5, -0.7); }
    else if (expr === 'stare') { brow(3, 4, 0); brow(10, 4, 0); }
    else if (expr === 'awkward') { brow(3, 4, -0.5); brow(10, 5, 0); }
    else if (expr === 'sad') { brow(3, 5, -0.7); brow(10, 5, 0.7); }
    else { brow(3, 5, 0); brow(10, 5, 0); }
    // eyes
    if (expr === 'laugh') { px(g, dk, 3, 7, 3, 1); px(g, dk, 3, 6, 1, 1); px(g, dk, 5, 6, 1, 1); px(g, dk, 10, 7, 3, 1); px(g, dk, 10, 6, 1, 1); px(g, dk, 12, 6, 1, 1); }
    else {
      px(g, '#f4f4f4', 3, 7, 3, 2); px(g, '#f4f4f4', 10, 7, 3, 2);
      const pw = expr === 'stare' ? 2 : 1;
      px(g, dk, 4, 7, pw, 2); px(g, dk, 11, 7, pw, 2);
      px(g, '#ffffff', 4, 7, 1, 1); px(g, '#ffffff', 11, 7, 1, 1);
    }
    // nose
    px(g, sh, 7, 9, 2, 2); px(g, shade(skin, 0.75), 7, 10, 2, 1);
    // cheeks
    if (expr === 'smile' || expr === 'laugh') { px(g, '#e9928a', 2, 10, 2, 1); px(g, '#e9928a', 12, 10, 2, 1); }
    // mouth
    if (expr === 'smile') { px(g, lip, 6, 12, 4, 1); px(g, lip, 5, 11, 1, 1); px(g, lip, 10, 11, 1, 1); }
    else if (expr === 'laugh') { px(g, '#4a1a16', 5, 11, 6, 3); px(g, '#ffffff', 5, 11, 6, 1); px(g, '#d0605a', 6, 13, 4, 1); }
    else if (expr === 'awkward') { px(g, lip, 6, 12, 3, 1); px(g, lip, 9, 11, 2, 1); }
    else if (expr === 'annoyed') { px(g, lip, 6, 12, 4, 1); px(g, lip, 5, 13, 1, 1); px(g, lip, 10, 13, 1, 1); }
    else if (expr === 'stare') { px(g, '#4a1a16', 7, 12, 2, 2); }
    else if (expr === 'sad') { px(g, lip, 6, 12, 4, 1); px(g, lip, 5, 13, 1, 1); px(g, lip, 10, 13, 1, 1); px(g, '#7fc4ff', 4, 9, 1, 3); px(g, '#7fc4ff', 11, 9, 1, 3); }
    else px(g, lip, 6, 12, 4, 1);
    // chin shade
    px(g, sh, 4, 15, 8, 1);
  });
}
const headSideTex = (skin, hair, style) => pixTex(16, 16, (g) => {
  px(g, skin, 0, 0, 16, 16); px(g, hair, 0, 0, 16, 3);
  if (style === 'long') px(g, hair, 0, 0, 16, 13); else if (style !== 'buzz') px(g, hair, 8, 0, 8, 8);
  px(g, shade(skin, 0.8), 5, 7, 2, 3); px(g, shade(skin, 0.86), 0, 15, 16, 1);
});
const headBackTex = (skin, hair, style) => pixTex(16, 16, (g) => { px(g, hair, 0, 0, 16, style === 'buzz' ? 6 : style === 'long' ? 16 : 11); if (style !== 'long') px(g, skin, 0, style === 'buzz' ? 6 : 11, 16, 5); });

function topTex(type, c1, c2, skin, part, printSeed) {
  return pixTex(16, 16, (g) => {
    px(g, c1, 0, 0, 16, 16);
    const d = shade(c1, 0.78), l = shade(c1, 1.18);
    px(g, d, 0, 15, 16, 1); // hem
    if (part === 'front') {
      if (type === 'tee') { px(g, skin, 6, 0, 4, 1); px(g, skin, 7, 1, 2, 1); px(g, d, 5, 0, 1, 2); px(g, d, 10, 0, 1, 2);
        const pc = [0xffffff, 0x111111, 0xff4d4d, 0xffd34d][printSeed % 4];
        if (printSeed % 3 === 0) { px(g, pc, 5, 5, 6, 1); px(g, pc, 5, 7, 6, 1); px(g, pc, 6, 9, 4, 1); }
        else if (printSeed % 3 === 1) { px(g, pc, 6, 5, 4, 4); px(g, c1, 7, 6, 2, 2); }
        else { px(g, pc, 4, 6, 8, 2); }
      } else if (type === 'hoodie') {
        px(g, d, 3, 0, 10, 2); px(g, shade(c1, 0.6), 6, 0, 4, 1);
        px(g, '#f2f2f2', 6, 2, 1, 4); px(g, '#f2f2f2', 9, 2, 1, 4);
        px(g, d, 3, 9, 10, 5); px(g, c1, 4, 10, 8, 3); px(g, shade(c1, 0.7), 3, 9, 10, 1);
      } else if (type === 'jacket') {
        px(g, c2, 5, 0, 6, 15); px(g, d, 4, 0, 1, 16); px(g, d, 11, 0, 1, 16);
        px(g, l, 2, 0, 3, 3); px(g, l, 11, 0, 3, 3); px(g, '#c9c9c9', 4, 4, 1, 1); px(g, '#c9c9c9', 11, 4, 1, 1);
        px(g, shade(c2, 0.85), 5, 14, 6, 1);
      } else if (type === 'shirt') {
        px(g, skin, 6, 0, 4, 2); px(g, skin, 7, 2, 2, 2); px(g, d, 5, 0, 1, 3); px(g, d, 10, 0, 1, 3);
        px(g, d, 8, 4, 1, 11); for (let y = 5; y < 15; y += 3) px(g, '#dcdcdc', 7, y, 1, 1);
        px(g, d, 2, 4, 3, 2);
      }
    } else if (part === 'back') {
      if (type === 'hoodie') { px(g, d, 3, 0, 10, 4); px(g, shade(c1, 0.65), 4, 3, 8, 1); }
      if (type === 'jacket') px(g, d, 0, 0, 16, 2);
    } else { px(g, d, 0, 0, 2, 16); }
  });
}
const armTex = (type, c1, skin) => pixTex(8, 16, (g) => {
  if (type === 'tee' || type === 'shirt' && false) { px(g, c1, 0, 0, 8, 6); px(g, shade(c1, 0.75), 0, 5, 8, 1); px(g, skin, 0, 6, 8, 10); px(g, shade(skin, 0.9), 0, 6, 8, 1); }
  else { px(g, c1, 0, 0, 8, 16); px(g, shade(c1, 0.85), 0, 4, 1, 12); px(g, shade(c1, 0.72), 0, 13, 8, 3); }
});
const legTex = (type, c, side) => pixTex(8, 16, (g) => {
  px(g, c, 0, 0, 8, 16);
  if (type === 'jeans') { px(g, shade(c, 1.22), 2, 7, 4, 3); px(g, shade(c, 0.8), 0, 0, 8, 1); if (!side) { px(g, shade(c, 0.75), 0, 1, 3, 1); px(g, shade(c, 0.75), 2, 2, 1, 2); } px(g, shade(c, 1.15), 0, 14, 8, 2); px(g, shade(c, 0.7), 0, 13, 8, 1); }
  else { px(g, shade(c, 0.85), 0, 14, 8, 2); if (side) px(g, '#eeeeee', 3, 0, 2, 14); }
});
const shoeTex = (c, top) => pixTex(8, 8, (g) => { px(g, '#f2f2f2', 0, 0, 8, 8); if (top) { px(g, '#d8d8d8', 2, 1, 4, 5); px(g, '#ffffff', 2, 2, 4, 1); px(g, '#ffffff', 2, 4, 4, 1); } else { px(g, c, 1, 2, 6, 2); px(g, '#bdbdbd', 0, 6, 8, 2); } });

const faceCache = new Map();
class Person {
  constructor(sc, o) {
    const g = new THREE.Group(); this.g = g; this.o = o;
    const skin = o.skin ?? SKINS[0], hair = o.hair ?? HAIRS[0];
    const style = o.hairStyle ?? (o.longHair ? 'long' : ['short', 'buzz', 'afro', 'short', 'bun'][(o.seed ?? 0) % 5]);
    const topType = o.top ?? ['tee', 'hoodie', 'jacket', 'tee'][(o.seed ?? 0) % 4];
    const c1 = o.shirt ?? 0xffffff, c2 = o.shirt2 ?? [0xffffff, 0x222222, 0xf2c230, 0xff5a5a][(o.seed ?? 0) % 4];
    const pantsC = o.pants ?? 0x2b3a67, pantsType = o.pantsType ?? ((o.seed ?? 0) % 3 === 2 ? 'joggers' : 'jeans');
    this.faces = {};
    for (const e of ['neutral', 'smile', 'laugh', 'stare', 'awkward', 'annoyed', 'sad']) this.faces[e] = faceTex(skin, hair, style, e);
    this.faceMat = mat({ map: this.faces[o.expr || 'smile'] });
    const sideM = mat({ map: headSideTex(skin, hair, style) }), backM = mat({ map: headBackTex(skin, hair, style) }), topM = mat({ color: style === 'buzz' ? shade(hair, 1.2) : hair });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), [sideM, sideM, topM, mat({ color: skin }), this.faceMat, backM]);
    head.position.y = 1.68; head.castShadow = true; g.add(head); this.head = head;
    const hm = mat({ color: hair, roughness: 0.95 });
    const hb = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hm); m.position.set(x, y, z); m.castShadow = true; head.add(m); return m; };
    if (style === 'short') { hb(0.54, 0.1, 0.54, 0, 0.29, 0); hb(0.56, 0.08, 0.2, 0, 0.27, 0.18); hb(0.54, 0.28, 0.06, 0, 0.1, -0.27); }
    if (style === 'long') { hb(0.54, 0.11, 0.54, 0, 0.29, 0); hb(0.56, 0.66, 0.1, 0, -0.08, -0.26); hb(0.06, 0.5, 0.36, -0.27, -0.03, -0.06); hb(0.06, 0.5, 0.36, 0.27, -0.03, -0.06); }
    if (style === 'afro') { hb(0.68, 0.3, 0.64, 0, 0.36, -0.03); hb(0.64, 0.4, 0.14, 0, 0.12, -0.27); hb(0.08, 0.3, 0.4, -0.31, 0.15, -0.05); hb(0.08, 0.3, 0.4, 0.31, 0.15, -0.05); }
    if (style === 'bun') { hb(0.54, 0.08, 0.54, 0, 0.28, 0); hb(0.2, 0.18, 0.2, 0, 0.38, -0.16); hb(0.54, 0.3, 0.06, 0, 0.1, -0.27); }
    if (o.cap) { const cm = mat({ color: o.cap }); const cap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.15, 0.56), cm); cap.position.y = 0.31; head.add(cap); const brim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.26), cm); brim.position.set(0, 0.25, 0.36); head.add(brim); const logo = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.01), mat({ color: 0xffffff })); logo.position.set(0, 0.33, 0.285); head.add(logo); }
    if (o.glasses) { const gm = mat({ color: 0x111111 }); for (const gx of [-0.12, 0.12]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.02), gm); f.position.set(gx, 0.03, 0.26); head.add(f); const lens = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.01), mat({ color: 0x9fd0ff, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.35 })); lens.position.set(gx, 0.03, 0.272); head.add(lens); } const br = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), gm); br.position.set(0, 0.05, 0.26); head.add(br); }
    if (o.earring) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat({ color: 0xffcf40, metalness: 0.8, roughness: 0.3 })); e.position.set(0.26, -0.08, 0.02); head.add(e); }
    const front = mat({ map: topTex(topType, c1, c2, skin, 'front', o.seed ?? 0) }), back = mat({ map: topTex(topType, c1, c2, skin, 'back', 0) }), side = mat({ map: topTex(topType, c1, c2, skin, 'side', 0) });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.32), [side, side, mat({ color: c1 }), mat({ color: c1 }), front, back]);
    torso.position.y = 1.07; torso.castShadow = true; g.add(torso); this.torso = torso;
    if (topType === 'hoodie') { const hood = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.14), mat({ color: shade(c1, 0.8) })); hood.position.set(0, 1.47, -0.16); g.add(hood); }
    if (o.chain) { const cm = mat({ color: 0xffcf40, metalness: 0.85, roughness: 0.28, emissive: 0x2a1c00 }); for (const [cx, cy, w] of [[-0.09, 1.36, 0.05], [0.09, 1.36, 0.05], [-0.05, 1.3, 0.05], [0.05, 1.3, 0.05], [0, 1.26, 0.06]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, 0.02), cm); c.position.set(cx, cy, 0.17); g.add(c); } const pend = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.02), cm); pend.position.set(0, 1.21, 0.17); g.add(pend); }
    if (o.headphones) { const hp = mat({ color: 0x1a1a1a }); for (const sx of [-0.2, 0.2]) { const cup = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.14), hp); cup.position.set(sx, 1.4, 0.06); g.add(cup); } const band = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.05), hp); band.position.set(0, 1.4, -0.1); g.add(band); }
    const am = mat({ map: armTex(topType, c1, skin) });
    const mkLimb = (w, h, d, m, x, y) => { const piv = new THREE.Group(); piv.position.set(x, y, 0); const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, -h / 2, 0); const ms = new THREE.Mesh(geo, m); ms.castShadow = true; piv.add(ms); g.add(piv); return piv; };
    this.armL = mkLimb(0.2, 0.72, 0.22, am, -0.42, 1.42); this.armR = mkLimb(0.2, 0.72, 0.22, am, 0.42, 1.42);
    const sk = mat({ color: skin });
    for (const a of [this.armL, this.armR]) { const hnd = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.14, 0.21), sk); hnd.position.y = -0.76; a.add(hnd); }
    if (o.watch) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.24), mat({ color: o.watch, metalness: 0.6, roughness: 0.3 })); w.position.y = -0.62; this.armL.add(w); }
    const lf = mat({ map: legTex(pantsType, pantsC, false) }), ls = mat({ map: legTex(pantsType, pantsC, true) });
    const legMats = [ls, ls, mat({ color: pantsC }), mat({ color: pantsC }), lf, lf];
    this.legL = mkLimb(0.28, 0.72, 0.28, legMats, -0.155, 0.72); this.legR = mkLimb(0.28, 0.72, 0.28, legMats, 0.155, 0.72);
    const shoeC = o.shoes ?? [0xff3b3b, 0x2f6bff, 0x111111, 0x46d18a][(o.seed ?? 0) % 4];
    const sSide = mat({ map: shoeTex(shoeC, false) }), sTop = mat({ map: shoeTex(shoeC, true) }), sole = mat({ color: 0xbdbdbd });
    for (const l of [this.legL, this.legR]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.38), [sSide, sSide, sTop, sole, sSide, sSide]); s.position.set(0, -0.68, 0.04); s.castShadow = true; l.add(s); }
    g.scale.setScalar(o.scale ?? 1);
    g.position.set(o.x ?? 0, 0, o.z ?? 0); g.rotation.y = o.ry ?? 0;
    sc.add(g);
  }
  expr(e) { const m = this.faces[e] || this.faces.neutral; if (this.faceMat.map !== m) { this.faceMat.map = m; this.faceMat.needsUpdate = true; } }
  rest() { for (const l of [this.armL, this.armR, this.legL, this.legR]) l.rotation.set(0, 0, 0); this.head.rotation.set(0, 0, 0); this.g.position.y = 0; this.torso.rotation.set(0, 0, 0); }
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
  idle(t, s = 0) { this.head.rotation.y = Math.sin(t * 0.7 + s) * 0.15; this.armR.rotation.x = Math.sin(t * 1.3 + s) * 0.08; this.g.position.y = 0; }
  face(tx, tz, k = 1) { const a = Math.atan2(tx - this.g.position.x, tz - this.g.position.z); this.g.rotation.y = lerpAngle(this.g.rotation.y, a, k); }
}

// ================= props kit =================
function canvasTex(w, h, draw, nearest = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; } t.userData = { c, g }; return t;
}
function plane(sc, w, h, tex, x, y, z, ry = 0, emissive = 0) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, emissive: emissive ? 0xffffff : 0x000000, emissiveMap: emissive ? tex : null, emissiveIntensity: emissive });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; sc.add(p); return p;
}
function balloon(sc, color, x, y, z, s = 1) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18 * s, 1), new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.1, flatShading: true }));
  b.scale.y = 1.15; b.castShadow = true; g.add(b);
  const knot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), mat({ color })); knot.position.y = -0.21 * s; g.add(knot);
  const str = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.6, 0.006), mat({ color: 0xdddddd })); str.position.y = -0.52 * s; g.add(str);
  g.position.set(x, y, z); sc.add(g); return g;
}
function garland(sc, text, x1, x2, y, z, ry = 0, cols = [0xff4fd8, 0x4fb0ff, 0xffd84f, 0x5bff8a, 0xffffff]) {
  const g = new THREE.Group(); const n = text.length;
  for (let i = 0; i < n; i++) {
    if (text[i] === ' ') continue;
    const tex = canvasTex(64, 80, (c) => { c.fillStyle = hex(cols[i % cols.length]); c.beginPath(); c.moveTo(0, 0); c.lineTo(64, 0); c.lineTo(32, 80); c.fill(); c.fillStyle = '#1a1a1a'; c.font = '800 34px Inter'; c.textAlign = 'center'; c.fillText(text[i], 32, 40); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.33), new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 0.9 }));
    const k = i / (n - 1); p.position.set(lerp(x1, x2, k), y - Math.sin(k * Math.PI) * 0.22, 0); g.add(p);
  }
  const cord = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1), 0.01, 0.01), mat({ color: 0xeeeeee })); cord.position.set((x1 + x2) / 2, y + 0.16, 0); g.add(cord);
  g.position.z = z; g.rotation.y = ry; sc.add(g); return g;
}
function pizzaBox(sc, x, y, z, ry = 0, open = false) {
  const tex = canvasTex(64, 64, (c) => { c.fillStyle = '#e8d3a8'; c.fillRect(0, 0, 64, 64); c.strokeStyle = '#b8955c'; c.lineWidth = 3; c.strokeRect(4, 4, 56, 56); c.fillStyle = '#c0392b'; c.font = '800 13px Inter'; c.textAlign = 'center'; c.fillText('PIZZA', 32, 36); }, true);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), [mat({ color: 0xd9c194 }), mat({ color: 0xd9c194 }), mat({ map: tex }), mat({ color: 0xd9c194 }), mat({ color: 0xd9c194 }), mat({ color: 0xd9c194 })]);
  b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = true; sc.add(b); return b;
}
function cup(sc, x, y, z, tipped = false, color = 0xe02b2b) {
  const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), mat({ color, roughness: 0.4 })); c.position.set(x, y + (tipped ? 0.05 : 0.07), z);
  if (tipped) c.rotation.z = Math.PI / 2; c.castShadow = true; sc.add(c); return c;
}
function confetti(sc, x0, z0, x1, z1, n, y = 0.005) {
  const geo = new THREE.PlaneGeometry(0.05, 0.03); geo.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.6 });
  const im = new THREE.InstancedMesh(geo, m, n); const d = new THREE.Object3D(); const cols = [0xff4fd8, 0x4fb0ff, 0xffd84f, 0x5bff8a, 0xffffff, 0xff6a3a];
  for (let i = 0; i < n; i++) { d.position.set(lerp(x0, x1, rnd()), y + rnd() * 0.004, lerp(z0, z1, rnd())); d.rotation.set(0, rnd() * 6.28, 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
  im.receiveShadow = true; sc.add(im); return im;
}
function bookshelf(sc, x, z, ry = 0) {
  const g = new THREE.Group(); const wood = mat({ color: 0x6b4a2e });
  const box = (w, h, d, m, bx, by, bz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(bx, by, bz); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  box(1.2, 0.05, 0.35, wood, 0, 0.02, 0); for (let sy = 0.45; sy < 2; sy += 0.45) box(1.2, 0.04, 0.35, wood, 0, sy, 0); box(0.04, 1.8, 0.35, wood, -0.6, 0.9, 0); box(0.04, 1.8, 0.35, wood, 0.6, 0.9, 0); box(1.2, 1.8, 0.02, mat({ color: 0x4a3320 }), 0, 0.9, -0.17);
  const bc = [0xc0392b, 0x2e86de, 0xf1c40f, 0x27ae60, 0x8e44ad, 0xecf0f1, 0x34495e, 0xe67e22];
  for (let s = 0; s < 4; s++) { let bx = -0.55; while (bx < 0.5) { const w = 0.04 + rnd() * 0.05, h = 0.25 + rnd() * 0.12; box(w, h, 0.24, mat({ color: bc[(rnd() * 8) | 0] }), bx + w / 2, 0.04 + s * 0.45 + h / 2, 0.02); bx += w + 0.005; if (rnd() < 0.12) bx += 0.12; } }
  g.position.set(x, 0, z); g.rotation.y = ry; sc.add(g); return g;
}
function plant(sc, x, z, s = 1) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat({ color: 0xc8643c })); pot.position.y = 0.2; pot.castShadow = true; g.add(pot);
  const lm = [mat({ color: 0x2f7d3c }), mat({ color: 0x3f9a4c }), mat({ color: 0x276a33 })];
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6 + rnd() * 0.5, 0.05), lm[i % 3]); l.geometry.translate(0, 0.3, 0); l.position.y = 0.38; l.rotation.set((rnd() - .5) * 0.9, i * 0.9, (rnd() - .5) * 0.9); l.castShadow = true; g.add(l); }
  g.position.set(x, 0, z); g.scale.setScalar(s); sc.add(g); return g;
}
function poster(sc, w, h, x, y, z, ry, draw) { const t = canvasTex(128, Math.round(128 * h / w), draw); const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.03), mat({ color: 0x111111 })); frame.position.set(x, y, z); frame.rotation.y = ry; sc.add(frame); const p = plane(sc, w, h, t, 0, 0, 0.02, 0); frame.add(p); p.position.set(0, 0, 0.017); return frame; }

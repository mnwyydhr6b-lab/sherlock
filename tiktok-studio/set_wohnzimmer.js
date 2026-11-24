// set_wohnzimmer.js – Set 4: Party-Wohnzimmer im Partyhaus Lindenweg 7 (Leons 18. Geburtstag), nachts.
// Raum: x -3.2..3.2, z -2.6..2.6, Decke 2.6. Eingang (offene Tür) in der Südwand bei x = 2.2, dahinter Flur bis z = 5.2.
// Westwand: Sofa + Couchtisch; Nordwand: zwei Fenster zur Straße, Sideboard, Girlande „ALLES GUTE LEON“; Nordost-Ecke: Party-Lautsprecher, Ballons, „18“;
// Ostwand: Gruppenfoto „DIE GANG ♥“ (Du fehlt), Regal, Stehlampe. Mitte: Tanzfläche.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { T, triMat, std, rbox, add, cnv, tex, makeRng } from './kit_world.js';
import { makeRoom, mFabric, mPaint, makeShelf, makePottedPlant, makeRug, makePoster, makeLED } from './kit_interior.js';
import { makeBalloon, stringBetween, makeStringLights, makeCup } from './kit_street.js';
import { makeHouse, TILE, setWindowGlow } from './kit_house.js';
import { makeStreetLamp } from './kit_street.js';
import { BLOCK_CAST } from './kit_block.js';

export const WANCHOR = {
  hallStart: new THREE.Vector3(2.2, 0, 4.4),   // Du startet im Flur, Blick -z in den Raum
  doorway: new THREE.Vector3(2.2, 0, 2.6),
  sofaSeats: [new THREE.Vector3(-2.55, 0.47, -0.35), new THREE.Vector3(-2.55, 0.47, 0.45), new THREE.Vector3(-2.55, 0.47, 1.2)], // Becken-Sitzpunkte, Blick +x
  table: new THREE.Vector3(-1.55, 0.42, 0.4),
  dance: new THREE.Vector3(0.9, 0, -1.2),       // Mitte der Tanzfläche
  speaker: new THREE.Vector3(2.75, 0, -2.2),
  photo: new THREE.Vector3(3.17, 1.5, -0.45),   // Gruppenfoto an der Ostwand (Mitte)
  sideboard: new THREE.Vector3(0.0, 0.8, -2.35),
};

// ---------------------------------------------------------------- Requisiten
function makeSofa({ len = 2.3, color = 0x5a6478, seed = 4 } = {}) { // Vorderseite +z, Sitzfläche y ≈ 0.45
  const g = new THREE.Group(); const f = mFabric(color, 3), f2 = mFabric(new THREE.Color(color).multiplyScalar(0.85).getHex(), 3); const r = makeRng(seed);
  add(g, rbox(len, 0.28, 0.9, 0.06, 3), f2, 0, 0.22, 0); // Sockel
  for (let i = 0; i < 3; i++) { const w = (len - 0.36) / 3; add(g, rbox(w - 0.02, 0.16, 0.66, 0.07, 3), f, -len / 2 + 0.18 + w / 2 + i * w, 0.43, 0.1); // Sitzkissen
    const bk = add(g, rbox(w - 0.03, 0.46, 0.2, 0.08, 3), f, -len / 2 + 0.18 + w / 2 + i * w, 0.72, -0.27); bk.rotation.x = -0.12; }
  add(g, rbox(len, 0.5, 0.16, 0.05, 3), f2, 0, 0.6, -0.38); // Rückenlehne
  for (const sx of [-1, 1]) add(g, rbox(0.18, 0.56, 0.9, 0.07, 3), f2, sx * (len / 2 - 0.09), 0.36, 0); // Armlehnen
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, new THREE.CylinderGeometry(0.025, 0.02, 0.08, 10), std(0x2a2420, 0.5), sx * (len / 2 - 0.1), 0.04, sz * 0.36);
  // Deko-Kissen
  for (const [x, c, rz] of [[-len / 2 + 0.38, 0xe8b04a, 0.2], [len / 2 - 0.4, 0xd8d4cc, -0.15]]) { const p = add(g, rbox(0.4, 0.38, 0.13, 0.06, 3), mFabric(c, 2), x, 0.66, -0.15); p.rotation.set(-0.25, (r() - 0.5) * 0.3, rz); }
  return g;
}
function makeCoffeeTable() { const g = new THREE.Group(); const wood = triMat({ map: T.wood.map, bump: T.wood.bump, scale: 1.2, color: 0xc89a6a, roughness: 0.5, bumpScale: 0.3 });
  add(g, rbox(1.15, 0.05, 0.62, 0.012), wood, 0, 0.395, 0); add(g, rbox(1.05, 0.025, 0.52, 0.008), wood, 0, 0.12, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(g, rbox(0.045, 0.38, 0.045, 0.01), std(0x2b2b2e, 0.4, 0.6), sx * 0.52, 0.19, sz * 0.26);
  return g; }
function makeSideboard(w = 1.8) { const g = new THREE.Group(); const m = std(0xf2efe8, 0.45), wood = triMat({ map: T.wood.map, bump: T.wood.bump, scale: 1.2, color: 0xb88a5a, roughness: 0.5, bumpScale: 0.3 });
  add(g, rbox(w, 0.62, 0.42, 0.015), m, 0, 0.41, 0); add(g, rbox(w + 0.02, 0.03, 0.44, 0.01), wood, 0, 0.735, 0);
  for (let i = 0; i < 3; i++) { add(g, rbox(w / 3 - 0.02, 0.56, 0.01, 0.006), std(0xeae6de, 0.45), -w / 3 + i * w / 3, 0.41, 0.212); add(g, rbox(0.1, 0.012, 0.02, 0.005), std(0x2b2b2e, 0.3, 0.7), -w / 3 + i * w / 3, 0.62, 0.225); }
  for (const sx of [-1, 1]) add(g, rbox(0.04, 0.1, 0.04, 0.01), std(0x2b2b2e, 0.4, 0.6), sx * (w / 2 - 0.08), 0.05, 0.12);
  g.userData.topY = 0.75; return g; }
// Flasche ohne Etikett (grün/braun/klar)
export function makeBottle(color = 0x2f6a3a, h = 0.27) { const g = new THREE.Group(); const pts = []; const r = 0.036;
  [[0, 0], [r, 0], [r, h * 0.55], [r * 0.9, h * 0.62], [r * 0.42, h * 0.75], [r * 0.38, h * 0.95], [r * 0.42, h * 0.97], [r * 0.42, h], [0, h]].forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
  add(g, new THREE.LatheGeometry(pts, 18), std(color, 0.12, 0.05, { transparent: true, opacity: 0.88 }), 0, 0, 0);
  add(g, new THREE.CylinderGeometry(r * 0.44, r * 0.44, 0.012, 12), std(0xc8b060, 0.3, 0.8), 0, h + 0.004, 0); return g; }
function makeBowl(fill = 0xe8b84a) { const g = new THREE.Group(); const pts = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(0.03 + Math.sin(a) * 0.12, 0.09 - Math.cos(a) * 0.09)); }
  add(g, new THREE.LatheGeometry(pts, 24), std(0xf2f0ea, 0.3, 0, { side: THREE.DoubleSide }), 0, 0, 0);
  const r = makeRng(7); for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = r() * 0.09; const c = add(g, new THREE.CircleGeometry(0.022, 7), std(fill, 0.6, 0, { side: THREE.DoubleSide }), Math.cos(a) * d, 0.07 + r() * 0.025, Math.sin(a) * d); c.rotation.set(-Math.PI / 2 + (r() - 0.5) * 1.2, 0, r() * 3); }
  return g; }
function makePizzaBox(open = true) { const g = new THREE.Group(); const card = std(0xd8c29a, 0.9); add(g, rbox(0.36, 0.035, 0.36, 0.004), card, 0, 0.0175, 0);
  const pc = cnv(256, 256); { const x = pc.getContext('2d'); x.fillStyle = '#d8c29a'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#e0a050'; x.beginPath(); x.arc(128, 128, 112, 0, 6.28); x.fill(); x.fillStyle = '#e8c860'; x.beginPath(); x.arc(128, 128, 96, 0, 6.28); x.fill(); x.fillStyle = '#d8d0bc'; x.beginPath(); x.moveTo(128, 128); x.arc(128, 128, 114, 0.2, 2.4); x.closePath(); x.fill(); x.fillStyle = '#b8362a'; for (let i = 0; i < 9; i++) { const a = 2.5 + i * 0.4, d = 30 + (i * 23) % 55; x.beginPath(); x.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, 11, 0, 6.28); x.fill(); } }
  add(g, new THREE.PlaneGeometry(0.34, 0.34), std(0xffffff, 0.8, 0, { map: tex(pc) }), 0, 0.036, 0, { rx: -Math.PI / 2, cast: false });
  if (open) { const lid = new THREE.Group(); lid.position.set(0, 0.035, -0.18); lid.rotation.x = -1.9; g.add(lid); add(lid, rbox(0.36, 0.01, 0.36, 0.004), card, 0, 0, 0.18); }
  return g; }
function makeSpeaker() { const g = new THREE.Group(); add(g, rbox(0.46, 1.0, 0.4, 0.04), std(0x151518, 0.55), 0, 0.5, 0);
  const ring = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff3ac8, emissiveIntensity: 3.0 });
  for (const [y, r] of [[0.68, 0.15], [0.3, 0.12]]) { add(g, new THREE.CylinderGeometry(r, r, 0.02, 32), std(0x0c0c0e, 0.8), 0, y, 0.205, { rx: Math.PI / 2 }); add(g, new THREE.TorusGeometry(r + 0.012, 0.008, 6, 40), ring, 0, y, 0.215); add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), std(0x2a2a2e, 0.4, 0.4), 0, y, 0.22, { rx: Math.PI / 2 }); }
  add(g, rbox(0.3, 0.04, 0.06, 0.01), std(0x2a2a2e, 0.4), 0, 0.94, 0.19); add(g, rbox(0.06, 0.012, 0.01, 0.004), new THREE.MeshStandardMaterial({ emissive: 0x5affb0, emissiveIntensity: 2 }), 0.08, 0.94, 0.222);
  g.userData.ring = ring; return g; }
function makeFloorLamp() { const g = new THREE.Group(); const m = std(0x2b2b2e, 0.35, 0.6); add(g, new THREE.CylinderGeometry(0.15, 0.17, 0.03, 24), m, 0, 0.015, 0); add(g, new THREE.CylinderGeometry(0.012, 0.012, 1.55, 8), m, 0, 0.8, 0);
  add(g, new THREE.CylinderGeometry(0.17, 0.24, 0.3, 24, 1, true), std(0xf2e6cc, 0.8, 0, { side: THREE.DoubleSide, emissive: 0xffc890, emissiveIntensity: 0.55 }), 0, 1.6, 0); return g; }
// Gruppenfoto „DIE GANG ♥“: Polaroid-Stil, 5 Klötzchen-Köpfe der Clique (Du fehlt)
function photoCanvas() { const W = 512, H = 400, c = cnv(W, H), g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3a2a6a'); bg.addColorStop(0.6, '#c85a8a'); bg.addColorStop(1, '#ffb07a'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,240,200,0.9)'; g.beginPath(); g.arc(400, 110, 36, 0, 6.28); g.fill();
  g.fillStyle = '#2a1a3a'; g.fillRect(0, 300, W, 100);
  const who = ['tarik', 'mia', 'leon', 'jasmin', 'ben']; const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  who.forEach((n, i) => { const s = BLOCK_CAST[n]; const x = 60 + i * 98, y = 150 + (i % 2) * 14, hs = 70;
    g.fillStyle = hex(s.shirt); g.fillRect(x - 40, y + hs * 0.62, 80, 140); // Oberkörper
    g.fillStyle = hex(s.skin); g.fillRect(x - hs / 2, y - hs / 2 + 30, hs, hs); // Kopf
    g.fillStyle = hex(s.hair); g.fillRect(x - hs / 2 - 3, y - hs / 2 + 22, hs + 6, s.hairStyle === 'buzz' ? 12 : 20); if (s.hairStyle === 'long') { g.fillRect(x - hs / 2 - 6, y - hs / 2 + 26, 10, hs + 10); g.fillRect(x + hs / 2 - 4, y - hs / 2 + 26, 10, hs + 10); } if (s.hairStyle === 'bun') { g.fillRect(x - 12, y - hs / 2 + 4, 24, 20); }
    g.fillStyle = '#1a1210'; g.beginPath(); g.arc(x - 13, y + 28, 4.5, 0, 6.28); g.arc(x + 13, y + 28, 4.5, 0, 6.28); g.fill();
    g.strokeStyle = '#7a2a2a'; g.lineWidth = 4; g.beginPath(); g.arc(x, y + 40, 14, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); // Lachen
    if (i === 1 || i === 3) { g.strokeStyle = hex(s.skin); g.lineWidth = 16; g.beginPath(); g.moveTo(x + 40, y + 110); g.lineTo(x + 70, y + 60); g.stroke(); } }); // Arme um die Schultern
  // Polaroid-Rahmen mit Schrift
  const P = cnv(560, 560), p = P.getContext('2d'); p.fillStyle = '#f6f3ec'; p.fillRect(0, 0, 560, 560); p.drawImage(c, 24, 24, 512, 400);
  p.fillStyle = '#26222a'; p.font = 'bold 62px "Comic Sans MS", Marker Felt, Arial'; p.textAlign = 'center'; p.fillText('DIE GANG', 250, 512); p.fillStyle = '#e0306a'; p.fillText('♥', 430, 514);
  return P; }
function makeGarland(a, b, text) { // Wimpelkette mit Buchstaben, von a nach b
  const g = new THREE.Group(); const n = text.length; const cols = ['#ff5ab4', '#ffd84a', '#4ad8ff', '#b46aff', '#5aff9a'];
  const mid = a.clone().lerp(b, 0.5); mid.y -= 0.32; const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.004, 4), std(0xf2f2f2, 0.6)));
  const dir = b.clone().sub(a).normalize(); const ry = Math.atan2(-dir.z, dir.x);
  for (let i = 0; i < n; i++) { const ch = text[i]; if (ch === ' ') continue; const p = curve.getPoint((i + 0.5) / n);
    const c = cnv(128, 160), x = c.getContext('2d'); x.fillStyle = cols[i % cols.length]; x.beginPath(); x.moveTo(0, 0); x.lineTo(128, 0); x.lineTo(64, 160); x.closePath(); x.fill(); x.fillStyle = '#ffffff'; x.font = 'bold 76px Arial'; x.textAlign = 'center'; x.fillText(ch, 64, 78);
    const m = add(g, new THREE.PlaneGeometry(0.16, 0.2), std(0xffffff, 0.8, 0, { map: tex(c), transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 }), p.x, p.y - 0.1, p.z, { cast: false }); m.rotation.y = ry; m.rotation.z = (i % 3 - 1) * 0.04; }
  return g; }

// ---------------------------------------------------------------- Aufbau
export async function buildWohnzimmer(stage, o = {}) {
  const { scene } = stage; const r = makeRng(17); const sway = [];
  setWindowGlow(1.25);
  const room = makeRoom({ w: 6.4, d: 5.2, h: 2.6, wall: 0xe4dccf, wallColors: { w: 0x5a4a6a }, floorColor: 0xe8d8c4,
    windows: [{ wall: 'n', x: -1.6, y: 0.85, w: 1.3, h: 1.4, sash: 2, curtains: 0x8a3a6a }, { wall: 'n', x: 1.55, y: 0.85, w: 1.3, h: 1.4, sash: 2, curtains: 0x8a3a6a }],
    doors: [{ wall: 's', x: -2.2, w: 0.95, h: 2.1, open: 1.6, color: 0xf6f5f1 }] });
  scene.add(room);
  // ---- Flur hinter der Tür (warmes Licht, Garderobe, Schuhe)
  { const hall = new THREE.Group(); scene.add(hall); const wm = mPaint(0xeee4d4); const fl = triMat({ map: T.laminat.map, bump: T.laminat.bump, scale: 1 / 2.4, color: 0xe0c8a8, roughness: 0.5, bumpScale: 0.45 });
    add(hall, new THREE.PlaneGeometry(1.8, 2.8), fl, 2.2, 0.001, 4.1, { rx: -Math.PI / 2, cast: false });
    add(hall, new THREE.BoxGeometry(0.12, 2.6, 2.8), wm, 1.25, 1.3, 4.1); add(hall, new THREE.BoxGeometry(0.12, 2.6, 2.8), wm, 3.15, 1.3, 4.1);
    add(hall, new THREE.BoxGeometry(2.0, 2.6, 0.12), wm, 2.2, 1.3, 5.5); add(hall, new THREE.BoxGeometry(2.0, 0.12, 2.8), wm, 2.2, 2.66, 4.1);
    for (const [z, c] of [[3.5, 0x2b2f3a], [3.9, 0xa8482a], [4.3, 0x3a5a3a]]) { add(hall, rbox(0.05, 0.05, 0.05, 0.01), std(0x2b2b2e, 0.4, 0.6), 3.07, 1.75, z); add(hall, rbox(0.12, 0.7, 0.36, 0.05), mFabric(c, 2), 3.0, 1.38, z); }
    for (const [x, z, c] of [[1.45, 3.4, 0xf4f4f4], [1.5, 3.75, 0x1a1a1a], [1.45, 4.2, 0xd8262c], [1.55, 4.6, 0xf4f4f4]]) { const s = add(hall, rbox(0.11, 0.08, 0.27, 0.03), std(c, 0.6), x, 0.04, z); s.rotation.y = (r() - 0.5) * 0.6; }
    const hl = new THREE.PointLight(0xffd2a0, 2.2, 6, 1.8); hl.position.set(2.2, 2.35, 4.2); hall.add(hl);
    add(hall, new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshStandardMaterial({ emissive: 0xffe0b0, emissiveIntensity: 3 }), 2.2, 2.52, 4.2, { cast: false }); }
  // ---- Sofa + Couchtisch + Teppich (Westwand)
  const sofa = makeSofa({ len: 2.4 }); sofa.rotation.y = Math.PI / 2; sofa.position.set(-2.72, 0, 0.42); scene.add(sofa);
  const rug = makeRug(2.2, 1.6, (g, W, H) => { g.fillStyle = '#c8bca8'; g.fillRect(0, 0, W, H); g.strokeStyle = '#8a3a6a'; g.lineWidth = 16; g.strokeRect(24, 24, W - 48, H - 48); g.strokeStyle = '#e8b04a'; g.lineWidth = 5; g.strokeRect(48, 48, W - 96, H - 96); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(80,60,50,${Math.random() * 0.12})`; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); } });
  rug.rotation.y = Math.PI / 2; rug.position.set(-1.6, 0, 0.4); scene.add(rug);
  const ct = makeCoffeeTable(); ct.rotation.y = Math.PI / 2; ct.position.set(-1.55, 0, 0.4); scene.add(ct);
  const cupCols = [0xd8262c, 0xd8262c, 0x2a5ad8, 0xd8262c, 0xd8262c];
  const onTable = (obj, x, z, ry = 0) => { obj.position.set(x, 0.42, z); obj.rotation.y = ry; scene.add(obj); return obj; };
  onTable(makeBowl(), -1.5, 0.05); onTable(makePizzaBox(), -1.6, 0.62, 0.3);
  for (const [x, z, c, hh] of [[-1.3, 0.3, 0x2f6a3a, 0.27], [-1.75, 0.2, 0x6a3a1a, 0.25], [-1.38, 0.85, 0x2f6a3a, 0.27], [-1.82, -0.1, 0xb8c8c0, 0.32]]) onTable(makeBottle(c, hh), x, z);
  { const fallen = makeBottle(0x6a3a1a, 0.25); fallen.rotation.z = Math.PI / 2; fallen.position.set(-1.85, 0.458, 0.95); fallen.rotation.y = 0.5; scene.add(fallen); }
  cupCols.forEach((c, i) => { const cp = makeCup(c); cp.position.set(-1.35 - (i % 3) * 0.17, 0.42 + 0.06, 0.45 + (i - 2) * 0.16 + (i % 2) * 0.05); scene.add(cp); });
  for (const [x, z] of [[-0.6, 1.6], [0.4, 2.2], [-2.9, -1.6], [2.6, 0.9]]) { const cp = makeCup(0xd8262c); cp.position.set(x, 0.06, z); scene.add(cp); } // Becher auf dem Boden
  { const cp = makeCup(0xd8262c); cp.rotation.z = Math.PI / 2; cp.position.set(-0.3, 0.045, 0.9); scene.add(cp); }
  const fl = makeFloorLamp(); fl.position.set(-2.85, 0, -1.25); scene.add(fl);
  { const L = new THREE.PointLight(0xffc890, 2.0, 5, 1.8); L.position.set(-2.8, 1.5, -1.1); scene.add(L); }
  // Bild über dem Sofa
  const art = makePoster(1.1, 0.75, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1a3a5a'); gr.addColorStop(1, '#e88a5a'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,240,220,0.85)'; g.beginPath(); g.arc(W * 0.7, H * 0.4, H * 0.18, 0, 6.28); g.fill(); g.fillStyle = '#0e1a2a'; g.beginPath(); g.moveTo(0, H); g.lineTo(W * 0.3, H * 0.5); g.lineTo(W * 0.55, H * 0.8); g.lineTo(W * 0.8, H * 0.45); g.lineTo(W, H * 0.7); g.lineTo(W, H); g.fill(); }, { tape: false });
  art.rotation.y = Math.PI / 2; art.position.set(-3.165, 1.6, 0.42); scene.add(art);
  add(scene, rbox(1.16, 0.81, 0.03, 0.01), std(0x2a2420, 0.4), -3.205, 1.6, 0.42, { ry: Math.PI / 2 });
  // ---- Nordwand: Sideboard mit Getränken, Girlande
  const sb = makeSideboard(1.6); sb.position.set(0.0, 0, -2.35); scene.add(sb);
  for (let i = 0; i < 7; i++) { const b = makeBottle([0x2f6a3a, 0x6a3a1a, 0xb8c8c0, 0x2f6a3a][i % 4], 0.25 + (i % 3) * 0.03); b.position.set(-0.6 + i * 0.13, 0.75, -2.3 + (i % 2) * 0.08); scene.add(b); }
  for (let i = 0; i < 6; i++) { const cp = makeCup(0xd8262c); cp.position.set(0.35 + (i % 3) * 0.1, 0.75 + 0.06 + Math.floor(i / 3) * 0.1, -2.25); scene.add(cp); } // Becherstapel
  { const bw = makeBowl(0xc8743a); bw.position.set(-0.55, 0.75, -2.22); scene.add(bw); }
  scene.add(makeGarland(new THREE.Vector3(-2.9, 2.35, -2.5), new THREE.Vector3(2.9, 2.35, -2.5), 'ALLES GUTE LEON'));
  // ---- Nordost-Ecke: Lautsprecher, Ballons, „18“
  const sp = makeSpeaker(); sp.position.set(2.75, 0, -2.25); sp.rotation.y = -0.6; scene.add(sp);
  { const base = new THREE.Vector3(2.85, 0.02, -1.35); const cols = [0xff5ab4, 0xffffff, 0xffc94a, 0xb46aff, 0xff8ad0]; const br = makeRng(3);
    cols.forEach((c, i) => { const b = makeBalloon(c, { metal: i === 2 ? 0.6 : 0, glow: 0.08 }); const a = i / cols.length * 6.28; const p = base.clone().add(new THREE.Vector3(Math.cos(a) * 0.2, 1.15 + (i % 3) * 0.22, Math.sin(a) * 0.22)); b.position.copy(p); b.rotation.z = (br() - 0.5) * 0.3; scene.add(b); sway.push(b); scene.add(stringBetween(base, p.clone().add(new THREE.Vector3(0, -0.22, 0)), 0.03)); });
    const font = await new FontLoader().loadAsync('node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
    const foil = new THREE.MeshPhysicalMaterial({ color: 0xf2c45a, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 0x8a5a10, emissiveIntensity: 0.25 });
    const tg = new TextGeometry('18', { font, size: 0.42, depth: 0.06, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 5 }); tg.center();
    const t18 = new THREE.Mesh(tg, foil); t18.position.set(2.35, 1.95, -2.4); t18.rotation.y = -0.15; t18.castShadow = true; scene.add(t18); sway.push(t18); scene.add(stringBetween(new THREE.Vector3(2.35, 2.6, -2.45), t18.position.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.01));
    for (let i = 0; i < 3; i++) { const b = makeBalloon([0xffc94a, 0xff5ab4, 0xffffff][i], { glow: 0.05 }); b.position.set(-2.7 + i * 0.3, 0.17, -2.2 + (i % 2) * 0.25); b.rotation.z = 1.2 + i; scene.add(b); } } // Ballons auf dem Boden
  // ---- Ostwand: Gruppenfoto, Regal, Pflanze
  { const pt = tex(photoCanvas()); const fr = new THREE.Group(); fr.position.copy(WANCHOR.photo); fr.rotation.y = -Math.PI / 2; scene.add(fr);
    add(fr, rbox(0.72, 0.72, 0.035, 0.01), std(0x1e1a18, 0.45), 0, 0, 0.0); add(fr, new THREE.PlaneGeometry(0.62, 0.62), std(0xffffff, 0.55, 0, { map: pt }), 0, 0, 0.019, { cast: false });
    const spot = new THREE.SpotLight(0xffe0c0, 2.6, 3.5, 0.5, 0.6, 1.5); spot.position.set(2.3, 2.5, -0.45); spot.target.position.copy(WANCHOR.photo); scene.add(spot, spot.target); }
  const shelf = makeShelf({ w: 1.1, books: 16, seed: 9 }); shelf.rotation.y = -Math.PI / 2; shelf.position.set(3.09, 1.55, 1.1); scene.add(shelf);
  const shelf2 = makeShelf({ w: 1.1, books: 10, seed: 3 }); shelf2.rotation.y = -Math.PI / 2; shelf2.position.set(3.09, 1.1, 1.1); scene.add(shelf2);
  const plant = makePottedPlant({ h: 1.1, seed: 4 }); plant.position.set(2.85, 0, 1.95); scene.add(plant);
  // ---- Licht: Lichterketten unter der Decke, LED-Streifen pink, Partylicht pink/blau
  const sl = makeStringLights([new THREE.Vector3(-3.1, 2.5, -2.5), new THREE.Vector3(3.1, 2.5, -0.6), new THREE.Vector3(-3.1, 2.5, 1.0), new THREE.Vector3(3.1, 2.5, 2.5)], { sag: 0.12, spacing: 0.28, glow: 5 }); scene.add(sl);
  const led = makeLED([new THREE.Vector3(-3.17, 2.55, -2.57), new THREE.Vector3(3.17, 2.55, -2.57)], { color: 0xff4ad0, lights: 2, intensity: 0.9, dist: 4 }); scene.add(led);
  const pink = new THREE.PointLight(0xff3ac8, o.pinkI ?? 3.0, 6, 1.6); pink.position.set(2.3, 1.2, -1.9); scene.add(pink);
  const blue = new THREE.PointLight(0x4a6aff, o.blueI ?? 2.6, 6, 1.6); blue.position.set(-1.0, 2.2, -1.6); scene.add(blue);
  const warm = new THREE.PointLight(0xffb070, 1.6, 5, 1.8); warm.position.set(0.5, 2.2, 1.3); scene.add(warm);
  const fillL = new THREE.PointLight(0xff9ad8, 1.2, 5, 1.8); fillL.position.set(1.6, 1.7, 1.8); scene.add(fillL);
  // ---- draußen: Straße mit Nachbarhaus und Laterne (durch die Fenster)
  { const h = makeHouse({ seed: 31, w: 9.5, d: 8.5, floors: 2, fh: 2.7, pitch: 42, wall: 0xe9eef0, roof: 0x3a3d42, front: [{ x: -2.6, y: 1.3, w: 1.4, h: 1.3, tile: TILE.tv }, { x: 2.6, y: 1.3, w: 1.4, h: 1.3, tile: TILE.warm }, { x: -2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.dark, shutter: 1 }, { x: 2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.bed }], door: { x: 0, w: 1.1, h: 2.1, color: 0x2b2f34, glassTile: TILE.stairs, number: 8, lampIntensity: 2 }, chimney: [2, -1] });
    h.position.set(0, -0.3, -21); scene.add(h); add(scene, new THREE.PlaneGeometry(60, 20), std(0x1a1c22, 0.9), 0, -0.3, -13, { rx: -Math.PI / 2, cast: false });
    const lamp = makeStreetLamp({ glow: 9 }); lamp.position.set(-3, -0.3, -9); scene.add(lamp); }
  stage.aimKey(new THREE.Vector3(0, 0, 0), [-6, 20, -25]);
  const ring = sp.userData.ring, bulbs = sl.children[sl.children.length - 1];
  return { room, WANCHOR, sway, lights: { pink, blue, warm, fillL },
    // Partylicht pulsiert mit der Musik (ca. 124 bpm), Lichterkette flackert leicht
    beatAt(t, k = 1) { const b = Math.pow(0.5 + 0.5 * Math.cos(t * Math.PI * 2 * 2.07), 3); pink.intensity = (o.pinkI ?? 3.0) * (0.75 + 0.4 * b * k); blue.intensity = (o.blueI ?? 2.6) * (0.8 + 0.35 * (1 - b) * k); ring.emissiveIntensity = 2 + 2.5 * b * k;
      sway.forEach((s, i) => { s.rotation.z = Math.sin(t * 0.9 + i) * 0.05; }); } };
}

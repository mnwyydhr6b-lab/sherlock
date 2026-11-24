// set_strasse.js – Set 1: deutsche Vorstadtstraße "Lindenweg" mit Partyhaus Nr. 7.
// buildStrasse(stage, { party: true|false }) baut alles auf; Koordinaten: Straße entlang z, Partyhaus rechts (x > 0), Tür bei z = 0.4.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { T, triMat, std, rbox, add, makeRng } from './kit_world.js';
import { makeHouse, TILE, setWindowGlow } from './kit_house.js';
import { makeTree, makeHedge, makeShrub, makeGrass } from './kit_nature.js';
import { makeStreetLamp, makeBin, makePillar, makeGate, makeMailbox, makeSign, makeBalloon, stringBetween, makeStringLights, makeCup, makeCardboardSign } from './kit_street.js';

export const SW = 0.12; // Gehweg-/Gartenhöhe
// wichtige Punkte im Set (für Figuren und Kamera)
export const ANCHOR = {
  gate: new THREE.Vector3(6.25, SW, 3.0),        // Gartentor Partyhaus
  heroAtGate: new THREE.Vector3(5.35, SW, 3.05),  // Held vor dem Tor (Key-Visual)
  door: new THREE.Vector3(12.5, SW + 0.45, 0.4),  // Haustür (Podest)
  doorStep: new THREE.Vector3(11.75, SW + 0.45, 0.55),
  yard: new THREE.Vector3(9.6, SW, 0.8),
  sidewalkR: (z) => new THREE.Vector3(4.75, SW, z), // Mitte rechter Gehweg
  sidewalkL: (z) => new THREE.Vector3(-4.75, SW, z),
  road: (z) => new THREE.Vector3(0, 0, z),
};

export async function buildStrasse(stage, o = {}) {
  const { scene, qn } = stage; const party = o.party ?? true; const day = stage.P.sky?.[0]?.[1] === '#3f7fd8';
  const rnd = makeRng(99); const sway = [];
  setWindowGlow(day ? 0.12 : 1.25);
  // ---------------- ground
  const asph = triMat({ map: T.asphalt.map, bump: T.asphalt.bump, scale: 0.25, color: 0xb8bcc8, roughness: 0.82, bumpScale: 0.6 });
  add(scene, new THREE.PlaneGeometry(7.2, 160), asph, 0, 0, -10, { rx: -Math.PI / 2, cast: false });
  const pav = triMat({ map: T.pavers.map, bump: T.pavers.bump, scale: 1 / 2.4, color: 0xc9c7c2, roughness: 0.8, bumpScale: 0.7 });
  const curbM = triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 2.0, color: 0xa9a7a2, roughness: 0.7, bumpScale: 0.6 });
  for (const s of [-1, 1]) {
    add(scene, new THREE.BoxGeometry(2.5, SW, 160), pav, s * 4.75, SW / 2, -10, { cast: false });
    for (let z = -90; z < 70; z += 1.0) add(scene, rbox(0.18, SW + 0.02, 0.985, 0.025), curbM, s * 3.59, (SW + 0.02) / 2 - 0.01, z + 0.5, { cast: false });
    for (const z of [-20, 4, 28]) add(scene, new THREE.PlaneGeometry(0.32, 0.5), std(0x151515, 0.6, 0.8), s * 3.32, 0.006, z, { rx: -Math.PI / 2, cast: false });
  }
  add(scene, new THREE.CircleGeometry(0.32, 32), std(0x2a2a2c, 0.5, 0.7), -0.9, 0.007, -2.5, { rx: -Math.PI / 2, cast: false });
  const lawnM = triMat({ map: T.grass.map, bump: T.grass.bump, scale: 0.5, color: 0xc4d0b4, roughness: 0.95, bumpScale: 1.0 });
  for (const s of [-1, 1]) add(scene, new THREE.PlaneGeometry(40, 160), lawnM, s * 26, SW + 0.002, -10, { rx: -Math.PI / 2, cast: false });
  const pfl = triMat({ map: T.pflaster.map, bump: T.pflaster.bump, scale: 0.5, color: 0xd8d0c6, roughness: 0.85, bumpScale: 0.8 });

  // ---------------- houses
  const partyFront = party ? [
    { x: -3.15, y: 0.75, w: 2.4, h: 2.0, sash: 3, tile: [TILE.party1, TILE.party2, TILE.party3] },
    { x: 2.25, y: 1.95, w: 0.6, h: 0.75, sash: 1, tile: TILE.curtainLit },
    { x: 3.85, y: 1.35, w: 1.3, h: 1.3, sash: 2, tile: [TILE.party4, TILE.disco] },
    { x: -3.15, y: 4.0, w: 1.3, h: 1.35, sash: 2, tile: [TILE.party5, TILE.party1] },
    { x: -0.85, y: 4.0, w: 1.0, h: 1.35, sash: 1, tile: TILE.darkCurtain, shutter: 0.35 },
    { x: 1.6, y: 4.0, w: 1.3, h: 1.35, sash: 2, tile: TILE.bed, shutter: 0.15 },
    { x: 3.9, y: 4.4, w: 0.7, h: 0.9, sash: 1, tile: TILE.dark, shutter: 1.0 },
  ] : [
    { x: -3.15, y: 0.75, w: 2.4, h: 2.0, sash: 3, tile: [TILE.warm, TILE.warm2, TILE.warm] },
    { x: 2.25, y: 1.95, w: 0.6, h: 0.75, sash: 1, tile: TILE.dark },
    { x: 3.85, y: 1.35, w: 1.3, h: 1.3, sash: 2, tile: TILE.kitchen },
    { x: -3.15, y: 4.0, w: 1.3, h: 1.35, sash: 2, tile: TILE.tv },
    { x: -0.85, y: 4.0, w: 1.0, h: 1.35, sash: 1, tile: TILE.darkCurtain, shutter: 0.35 },
    { x: 1.6, y: 4.0, w: 1.3, h: 1.35, sash: 2, tile: TILE.bed, shutter: 0.15 },
    { x: 3.9, y: 4.4, w: 0.7, h: 0.9, sash: 1, tile: TILE.dark, shutter: 1.0 },
  ];
  const gableW = (lit) => [{ x: -2.0, y: 1.3, w: 1.0, h: 1.25, sash: 1, tile: lit ? TILE.party2 : TILE.warm }, { x: 1.8, y: 1.3, w: 1.0, h: 1.25, sash: 1, tile: TILE.dark, shutter: 0.6 }, { x: -2.0, y: 4.0, w: 1.0, h: 1.3, sash: 1, tile: TILE.dark }, { x: 0, y: 6.3, w: 0.75, h: 0.95, sash: 1, tile: TILE.warm2 }];
  const partyHouse = makeHouse({ seed: 1, w: 10.5, d: 9, floors: 2, fh: 2.75, pitch: 40, wall: 0xf4efe6, roof: 0x5c616b, front: partyFront, right: gableW(party), left: gableW(false),
    back: [{ x: -2, y: 1.3, w: 1.2, h: 1.25, tile: party ? TILE.party3 : TILE.warm }, { x: 2, y: 4.0, w: 1.2, h: 1.3, tile: TILE.dark }],
    door: party ? { x: 0.4, w: 1.15, h: 2.15, color: 0x2b2f34, open: o.doorOpen ?? 1.25, hallColor: 0xff5ac8, silhouettes: o.silhouettes ?? [[0.25, 1.1, 1.0], [-0.3, 1.9, 0.95]], number: 7, glassTile: TILE.party1, lampIntensity: 1.0 }
      : { x: 0.4, w: 1.15, h: 2.15, color: 0x2b2f34, number: 7, glassTile: TILE.stairs, lampIntensity: day ? 0 : 1.5 },
    chimney: [2.8, -1.3], garage: { w: 3.3, d: 6.5, setback: 0.6 }, velux: [[-2.6, 0.42], [2.2, 0.42]], veluxTile: party ? TILE.party5 : TILE.dark });
  partyHouse.rotation.y = -Math.PI / 2; partyHouse.position.set(12.5 + 4.5, SW, 0); scene.add(partyHouse);
  const nb1 = makeHouse({ seed: 2, w: 9.5, d: 8.5, floors: 2, fh: 2.7, pitch: 45, wall: 0xeadcb8, roof: 0x8a3f2e, fascia: 0xf2f0ea,
    front: [{ x: -2.6, y: 1.3, w: 1.4, h: 1.3, tile: TILE.tv }, { x: 2.6, y: 1.3, w: 1.4, h: 1.3, tile: [TILE.warm, TILE.warm2] }, { x: -2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.dark, shutter: 1 }, { x: 0, y: 3.95, w: 0.9, h: 1.3, tile: TILE.stairs }, { x: 2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.dark, shutter: 0.5 }],
    right: gableW(false), left: gableW(false), door: { x: 0, w: 1.1, h: 2.1, color: 0x6b4a2e, glassTile: TILE.stairs, number: 9, lampIntensity: day ? 0 : 2.5 }, chimney: [-2.5, -1.2], garage: { w: 3.2, d: 6.2 } });
  nb1.rotation.y = -Math.PI / 2; nb1.position.set(13.0 + 4.25, SW, 20.5); scene.add(nb1);
  const nb2 = makeHouse({ seed: 3, w: 11, d: 9, floors: 2, fh: 2.75, pitch: 35, wall: 0xdfe5e8, roof: 0x34373c,
    front: [{ x: -3.4, y: 1.3, w: 1.8, h: 1.3, tile: TILE.kitchen }, { x: 3.2, y: 0.75, w: 2.2, h: 1.95, sash: 3, tile: TILE.warm }, { x: -3.4, y: 4.0, w: 1.3, h: 1.3, tile: TILE.dark, shutter: 0.8 }, { x: 0.2, y: 4.0, w: 1.0, h: 1.3, tile: TILE.darkBlue }, { x: 3.2, y: 4.0, w: 1.3, h: 1.3, tile: TILE.bed }],
    right: gableW(false), left: gableW(false), door: { x: 0.2, w: 1.1, h: 2.1, color: 0x8a1f1f, glassTile: TILE.warm, number: 5, lampIntensity: day ? 0 : 2.5 }, chimney: [3.0, -1.0], garage: { w: 3.3, d: 6.5 } });
  nb2.rotation.y = -Math.PI / 2; nb2.position.set(13.0 + 4.5, SW, -21.5); scene.add(nb2);
  for (const [z, wall, roof, seed] of [[-20, 0xf0e6d2, 0x7a3a2a, 4], [1, 0xe9eef0, 0x3a3d42, 5], [22, 0xf2e2c8, 0x5a3a2e, 6]]) {
    const h = makeHouse({ seed, w: 10, d: 8.5, floors: 2, fh: 2.7, pitch: 42, wall, roof,
      front: [{ x: -2.8, y: 1.3, w: 1.4, h: 1.3, tile: [TILE.warm, TILE.tv][seed % 2] }, { x: 2.8, y: 1.3, w: 1.4, h: 1.3, tile: TILE.kitchen }, { x: -2.8, y: 3.95, w: 1.2, h: 1.3, tile: TILE.dark, shutter: 1 }, { x: 2.8, y: 3.95, w: 1.2, h: 1.3, tile: TILE.bed }],
      door: { x: 0, w: 1.1, h: 2.1, color: 0x2b2f34, glassTile: TILE.stairs, number: 6 + seed * 2, lampIntensity: day ? 0 : 2.0 }, chimney: [2.5, -1] });
    h.rotation.y = Math.PI / 2; h.position.set(-(13.0 + 4.25), SW, z); scene.add(h); }

  // ---------------- weitere Häuser auf beiden Seiten (einfacher gebaut), damit die Straße durchgehend bebaut ist
  { const walls = [0xf2eadb, 0xe6ddcf, 0xdde4e6, 0xefe2c4, 0xe8d6c6, 0xd9dccf, 0xf0e8e0], roofs = [0x7a3a2a, 0x3a3d42, 0x5a3a2e, 0x8a3f2e, 0x4a4f57, 0x6b2f26];
    const tiles = [TILE.warm, TILE.tv, TILE.kitchen, TILE.dark, TILE.warm2, TILE.stairs, TILE.darkCurtain];
    const simple = (seed, side, z) => { const r = makeRng(seed * 13 + 7), pick = (a) => a[Math.floor(r() * a.length)];
      const t = () => (r() < 0.32 && !day ? TILE.dark : pick(tiles));
      const h = makeHouse({ seed, w: 9 + r() * 2.5, d: 8.5, floors: 2, fh: 2.7, pitch: 36 + r() * 12, wall: pick(walls), roof: pick(roofs),
        front: [{ x: -2.7, y: 1.3, w: 1.4, h: 1.3, tile: t() }, { x: 2.7, y: 1.3, w: 1.4, h: 1.3, tile: t() }, { x: -2.7, y: 3.95, w: 1.2, h: 1.3, tile: t(), shutter: r() < 0.4 ? 1 : 0 }, { x: 2.7, y: 3.95, w: 1.2, h: 1.3, tile: t(), shutter: r() < 0.3 ? 0.5 : 0 }],
        door: { x: 0, w: 1.1, h: 2.1, color: pick([0x2b2f34, 0x6b4a2e, 0x8a1f1f, 0x2a4a3a]), glassTile: TILE.stairs, number: seed, lampIntensity: day ? 0 : 1.6 }, chimney: r() < 0.6 ? [2.4, -1] : null, garage: r() < 0.35 ? { w: 3.2, d: 6.2 } : null });
      h.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; h.position.set(side * (13.0 + 4.25), SW, z); scene.add(h);
      const hd = makeHedge(7.5, 0.8, 0.55, { seed: seed + 3 }); hd.rotation.y = Math.PI / 2; hd.position.set(side * 6.25, SW, z + (r() - 0.5) * 2); scene.add(hd); };
    let sd = 11; for (const z of [-84, -63, -42, 41.5, 62]) simple(sd++, 1, z);
    for (const z of [-83, -62, -41, 43, 64]) simple(sd++, -1, z); }

  // ---------------- party lot (Garten Nr. 7)
  const P = { gateZ: 3.0, fenceX: 6.25 };
  add(scene, new THREE.PlaneGeometry(7.4, 3.4), pfl, 6.0 + 3.7, SW + 0.006, -6.9, { rx: -Math.PI / 2, cast: false });
  add(scene, new THREE.PlaneGeometry(2.6, 3.4), pfl, 3.5 + 1.25, SW + 0.004, -6.9, { rx: -Math.PI / 2, cast: false });
  { const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(6.4, 0, P.gateZ), new THREE.Vector3(9.2, 0, 2.6), new THREE.Vector3(10.65, 0, 0.45));
    const slabM = triMat({ map: T.pavers.map, bump: T.pavers.bump, scale: 0.9, color: 0xd6d2ca, roughness: 0.85, bumpScale: 0.6 });
    for (let i = 0; i < 7; i++) { const t = i / 6; const p = curve.getPoint(t), tg = curve.getTangent(t); const s = add(scene, rbox(0.62, 0.06, 0.95, 0.02), slabM, p.x, SW + 0.02, p.z, { cast: false }); s.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2; }
    for (const t of [0.15, 0.5, 0.85]) { const p = curve.getPoint(t); const q = p.clone().add(new THREE.Vector3(0.25, 0, 0.75)); add(scene, new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), std(0x2b2f34, 0.5, 0.5), q.x, SW + 0.2, q.z); add(scene, new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: day ? 0 : 3 }), q.x, SW + 0.43, q.z, { cast: false }); } }
  { const h1 = makeHedge(7.0, 0.85, 0.6, { seed: 3 }); h1.rotation.y = Math.PI / 2; h1.position.set(P.fenceX, SW, (2.3 + -4.9) / 2 - 0.2); scene.add(h1);
    const h2 = makeHedge(5.4, 0.85, 0.6, { seed: 4 }); h2.rotation.y = Math.PI / 2; h2.position.set(P.fenceX, SW, (3.7 + 9.3) / 2 + 0.05); scene.add(h2);
    for (const z of [2.35, 3.65]) { const p = makePillar(1.05); p.position.set(P.fenceX, SW, z); scene.add(p); }
    const gate = makeGate(1.02, 0.95, party ? -1.9 : 0); gate.position.set(P.fenceX + 0.05, SW, 2.48); scene.add(gate);
    const mb = makeMailbox(); mb.rotation.y = -Math.PI / 2; mb.position.set(P.fenceX - 0.22, SW + 0.75, 3.65); scene.add(mb);
    if (party) { const sign = makeCardboardSign(['PARTY', '→ :)']); sign.rotation.y = -Math.PI / 2; sign.position.set(P.fenceX - 0.215, SW + 0.62, 2.35); sign.rotation.z = 0.06; scene.add(sign); } }
  for (const [x, z, r] of [[11.9, -3.6, 0.42], [11.9, -1.6, 0.36], [11.9, 2.2, 0.4], [11.9, 4.2, 0.45], [7.0, 7.6, 0.5], [7.0, -3.9, 0.45]]) { const s = makeShrub(r, { seed: Math.round(x * 10 + z * 7) }); s.position.set(x, SW, z); scene.add(s); }
  const maple = makeTree({ h: 4.4, crown: 1.6, seed: 17, palette: [0xb02a1e, 0xd2421f, 0x8e1c1a, 0xe0632a], trunk: 0x3a2c24, clumps: 330, clumpScale: 0.62 }); maple.position.set(10.0, SW, -6.2); scene.add(maple);
  { const gr = makeGrass(5.6, 13.5, 5200, { seed: 21, skip: (x, z) => { const wx = 9.4 + x, wz = 1.4 + z; return (wx > 10.3 && Math.abs(wz - 0.4) < 1.2) || (wx > 7.5 && wx < 10.8 && Math.abs(wz - (3.0 - (wx - 6.4) * 0.55)) < 0.45); } }); gr.position.set(9.4, SW, 1.4); scene.add(gr); }

  // ---------------- street furniture
  const lampLights = [];
  for (const [x, z, flip] of [[3.85, qn('lampZ', 6.6), 1], [3.85, -15, 1], [-3.85, -3, -1], [-3.85, 22, -1]]) { const l = makeStreetLamp({ glow: day ? 0 : 9 }); l.position.set(x, SW, z); if (flip < 0) l.rotation.y = Math.PI; scene.add(l); l.updateMatrixWorld(true);
    if (day) continue;
    const hp = l.userData.head.getWorldPosition(new THREE.Vector3()); const sp = new THREE.SpotLight(0xffd6a0, qn('lampI', 60), 22, 0.95, 0.75, 1.6); sp.position.copy(hp).add(new THREE.Vector3(0, -0.08, 0)); sp.target.position.copy(hp).add(new THREE.Vector3(flip * 0.6, -5, 0)); scene.add(sp, sp.target); lampLights.push(sp); }
  if (lampLights[0]) { lampLights[0].castShadow = true; lampLights[0].shadow.mapSize.set(2048, 2048); lampLights[0].shadow.bias = -0.0002; lampLights[0].shadow.normalBias = 0.02; }
  for (const [x, z, seed, pal] of [[4.35, 14.5, 31, 0], [4.35, -9.5, 32, 1], [4.35, -29, 33, 0], [-4.35, 8, 34, 1], [-4.35, -12, 35, 0], [-4.35, 30, 36, 1]]) {
    const palette = pal ? [0xd9a02a, 0xe8b83a, 0xc77a1e, 0x9aa23a] : [0x5d8a2e, 0x7a9a34, 0x4a7428, 0xc9a02e];
    const t = makeTree({ h: 8.5, crown: 2.9, seed, palette, clumps: 280, clumpScale: 0.62 }); t.position.set(x, SW, z); t.rotation.y = rnd() * 6; scene.add(t);
    add(scene, new THREE.BoxGeometry(1.2, 0.02, 1.2), std(0x2a2018, 1), x, SW + 0.005, z, { cast: false }); }
  for (const [x, z, s] of [[28, 6, 41], [30, -10, 42], [26, 24, 43], [-30, -4, 44], [-28, 14, 45]]) { const t = makeTree({ h: 11, crown: 3.8, seed: s, palette: [0x2f4a2a, 0x3a5a2e, 0x24381f], clumps: 220, clumpScale: 0.7 }); t.position.set(x, SW, z); scene.add(t); }
  { const z30 = makeSign('zone30'); z30.position.set(3.82, SW, 11.6); z30.rotation.y = -Math.PI / 2; scene.add(z30);
    const st = makeSign('street', 'Lindenweg'); st.position.set(-3.82, SW, 13.5); st.rotation.y = Math.PI / 2; scene.add(st); }
  for (const [i, lid] of [[0, 0x2b2f34], [1, 0x1f5fbf], [2, 0x7a4a24]]) { const b = makeBin(lid); b.position.set(5.55, SW, -12.0 - i * 0.68); b.rotation.y = -Math.PI / 2 + (i - 1) * 0.08; scene.add(b); }

  // ---------------- cars
  const loader = new GLTFLoader(); const load = (p) => loader.loadAsync('assets/' + p);
  const cars = { n1: await load('cars/q-cars-normalcar1.glb'), n2: await load('cars/q-cars-normalcar2.glb'), suv: await load('cars/q-cars-suv.glb') };
  const carPaint = (ob, col) => ob.traverse(m => { if (!m.isMesh) return; m.castShadow = m.receiveShadow = true; const n = (m.material.name || '').toLowerCase();
    if (/glass|window/.test(n)) m.material = new THREE.MeshPhysicalMaterial({ color: 0x0c1016, roughness: 0.05, metalness: 0.2 });
    else if (/body|paint|main|car/.test(n) || m.material.color.getHSL({}).s > 0.25) m.material = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.32, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.08 }); });
  const parked = [['n1', -2.4, -6.5, Math.PI, 0x2a4f7a], ['n2', -2.4, 12, Math.PI, 0xc9c9c9], ['suv', -2.4, -22, Math.PI, 0x7a1f22], ['n1', 2.4, -14.5, 0, 0x30343a], ['n2', 2.4, 19, 0, 0x4a5a3a], ['suv', 9.0, -6.9, -Math.PI / 2, 0x1d1f24],
    // weitere parkende Autos an beiden Straßenrändern
    ['n2', -2.4, -33, Math.PI, 0x8a8f96], ['n1', -2.4, -47, Math.PI, 0x1f3a5a], ['suv', -2.4, -60, Math.PI, 0x2b2b30], ['n1', -2.4, 26, Math.PI, 0x6a1f1f], ['suv', -2.4, 39, Math.PI, 0xd8d8d8], ['n2', -2.4, 54, Math.PI, 0x2f4a3a],
    ['suv', 2.4, -28, 0, 0xc8c2b4], ['n2', 2.4, -41, 0, 0x7a2a2a], ['n1', 2.4, -55, 0, 0x5a6a7a], ['n1', 2.4, 31, 0, 0x1d1f24], ['n2', 2.4, 46, 0, 0x3a5a8a], ['suv', 2.4, 60, 0, 0x4a4a4e]];
  for (const [k, x, z, ry, col] of (o.cars ?? parked)) {
    const ob = cars[k].scene.clone(true); ob.position.set(x, x > 6 ? SW : 0, z); ob.rotation.y = ry; carPaint(ob, col); scene.add(ob); }

  // ---------------- party props
  if (party) {
    const base = new THREE.Vector3(P.fenceX, SW + 1.12, 3.65);
    const cols = [0xff5ab4, 0xffffff, 0xffc94a, 0xb46aff, 0xff8ad0, 0xf4d2c8]; const br = makeRng(8);
    cols.forEach((c, i) => { const b = makeBalloon(c, { metal: i === 2 || i === 5 ? 0.6 : 0 }); const a = i / cols.length * 6.28; const p = base.clone().add(new THREE.Vector3(Math.cos(a) * 0.28 - 0.1, 1.05 + (i % 3) * 0.24, Math.sin(a) * 0.3 + 0.05)); b.position.copy(p); b.rotation.z = (br() - 0.5) * 0.3; scene.add(b); sway.push(b); scene.add(stringBetween(base, p.clone().add(new THREE.Vector3(0, -0.22, 0)), 0.04)); });
    const font = await new FontLoader().loadAsync('node_modules/three/examples/fonts/helvetiker_bold.typeface.json');
    const foil = new THREE.MeshPhysicalMaterial({ color: 0xf2c45a, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 0x8a5a10, emissiveIntensity: 0.25 });
    const tg = new TextGeometry(o.balloonNumber ?? '18', { font, size: 0.34, depth: 0.05, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 6 }); tg.center();
    const t18 = new THREE.Mesh(tg, foil); t18.position.copy(base).add(new THREE.Vector3(-0.15, 1.3, -0.62)); t18.rotation.y = -Math.PI / 2 + 0.3; t18.rotation.z = 0.08; t18.castShadow = true; scene.add(t18); sway.push(t18); scene.add(stringBetween(base, t18.position.clone().add(new THREE.Vector3(0, -0.3, 0)), 0.03));
    const eave = (zz) => new THREE.Vector3(12.5 - 0.55, SW + 0.45 + 2 * 2.75 - 0.15, zz);
    scene.add(makeStringLights([eave(-4.5), new THREE.Vector3(10.0, SW + 3.1, -6.2), new THREE.Vector3(P.fenceX, SW + 1.12, 2.35)], { sag: 0.28 }));
    scene.add(makeStringLights([eave(4.6), new THREE.Vector3(P.fenceX + 0.1, SW + 1.15, 3.65)], { sag: 0.35 }));
    scene.add(makeStringLights([eave(-5.2), eave(5.2)], { sag: 0.06, spacing: 0.4, color: 0xff9ae0 }));
    { const n = 900; const geo = new THREE.PlaneGeometry(0.018, 0.028); geo.rotateX(-Math.PI / 2); const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), n); const d = new THREE.Object3D(), c = new THREE.Color(); const cc = [0xff4fb8, 0xffd84a, 0x4ad8ff, 0xffffff, 0xb46aff, 0x5aff9a]; const r = makeRng(55);
      for (let i = 0; i < n; i++) { let x, z; if (i < 520) { const a = r() * 6.28, rr = Math.pow(r(), 0.6) * 2.2; x = P.fenceX - 0.9 + Math.cos(a) * rr * 0.9; z = 3.0 + Math.sin(a) * rr * 1.3; if (x > P.fenceX - 0.1) x = P.fenceX - 0.1 - r() * 0.5; } else { const t = r(); x = 6.4 + t * 4.2 + (r() - 0.5) * 0.9; z = 3.0 - t * 2.6 + (r() - 0.5) * 0.9; }
        d.position.set(x, SW + 0.004 + r() * 0.004 + (x > P.fenceX ? 0.04 : 0), z); d.rotation.set((r() - 0.5) * 0.3, r() * 6.3, (r() - 0.5) * 0.3); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, c.set(cc[i % cc.length])); }
      im.receiveShadow = true; scene.add(im); }
    for (const [x, z] of [[11.55, -0.4], [11.2, 1.25]]) { const c = makeCup(); c.position.set(x, SW + 0.45 + 0.06, z); scene.add(c); }
    for (const [x, y, z, c, i] of [[10.4, 1.4, -3.15, 0xff4fc8, 5], [10.6, 1.6, 3.85, 0xb45aff, 3.5], [11.3, 1.2, 0.4, 0xff6ad5, 4], [10.2, 4.4, -3.15, 0x9a6aff, 1.5]]) { const L = new THREE.PointLight(c, qn('pinkI', 0.7) * i, 9, 1.7); L.position.set(x, SW + y, z); scene.add(L); }
    const slL = new THREE.PointLight(0xffc070, 2.5, 6, 1.8); slL.position.set(8.4, SW + 2.6, 0.5); scene.add(slL);
    for (const z of [2.0, 4.1]) { const gl = new THREE.PointLight(0xffc27a, qn('gateI', 1.6), 4.5, 1.8); gl.position.set(P.fenceX - 0.6, SW + 1.9, z); scene.add(gl); }
  }
  stage.aimKey(new THREE.Vector3(8, 0, 0));
  sway.forEach((o, i) => { o.userData.base = { p: o.position.clone(), r: o.rotation.clone(), i }; });
  // Ballons im Wind bewegen: swayAt(t) jedes Frame aufrufen
  const swayAt = (t) => sway.forEach(o => { const { p, r, i } = o.userData.base; o.rotation.z = r.z + 0.07 * Math.sin(t * 1.1 + i * 1.7); o.rotation.x = r.x + 0.05 * Math.sin(t * 0.8 + i); o.position.y = p.y + 0.025 * Math.sin(t * 0.9 + i * 2.1); });
  return { SW, ANCHOR, lampLights, partyHouse, swayAt };
}

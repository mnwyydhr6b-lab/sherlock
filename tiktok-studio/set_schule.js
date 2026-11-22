// set_schule.js – Set 3: Schule bei Tag – Schulgebäude, Schulhof (Bäume mit Rundbänken, Tischtennisplatte, Basketballkorb, Fahrradständer) und Bushaltestelle.
// Koordinaten: Straße entlang x bei z 6..13, Gehweg z 3.5..6, Zaun bei z = 3.5 (Tor x -2..2), Schulhof z -22..3.5, Schulfassade bei z = -24.
import * as THREE from 'three';
import { T, triMat, std, rbox, add, cnv, tex, makeRng } from './kit_world.js';
import { windowGlass, TILE, setWindowGlow } from './kit_house.js';
import { makeTree, makeHedge, makeShrub } from './kit_nature.js';
import { makeStreetLamp, makeBin } from './kit_street.js';

export const SCHANCHOR = {
  gate: new THREE.Vector3(0, 0.0, 3.5),
  busStop: new THREE.Vector3(8.0, 0.12, 4.6),     // im Wartehäuschen
  pingpong: new THREE.Vector3(-0.5, 0, -6.0),
  treeBench: (i) => [new THREE.Vector3(-9, 0, -7), new THREE.Vector3(9, 0, -9), new THREE.Vector3(-13, 0, -16), new THREE.Vector3(14, 0, -16)][i],
  entrance: new THREE.Vector3(0, 0, -23),
  yard: new THREE.Vector3(0, 0, -6),
};

function makeBike(color = 0x2f6fbf, seed = 1) { const g = new THREE.Group(); const fm = std(color, 0.35, 0.5), tm = std(0x111111, 0.8), mm = std(0xb8bcc0, 0.3, 0.9);
  for (const x of [-0.52, 0.52]) { add(g, new THREE.TorusGeometry(0.33, 0.022, 8, 32), tm, x, 0.35, 0); add(g, new THREE.TorusGeometry(0.31, 0.006, 4, 32), mm, x, 0.35, 0); for (let k = 0; k < 8; k++) { const sp = add(g, new THREE.CylinderGeometry(0.003, 0.003, 0.6, 4), mm, x, 0.35, 0); sp.rotation.z = k * Math.PI / 8; } }
  const tube = (a, b, r = 0.018) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, A.distanceTo(B), 8), fm); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); m.castShadow = true; g.add(m); };
  tube([-0.52, 0.35, 0], [-0.05, 0.38, 0]); tube([-0.05, 0.38, 0], [-0.12, 0.85, 0]); tube([-0.12, 0.85, 0], [0.42, 0.82, 0]); tube([-0.05, 0.38, 0], [0.42, 0.82, 0]); tube([-0.52, 0.35, 0], [-0.12, 0.85, 0]); tube([0.42, 0.82, 0], [0.52, 0.35, 0]); tube([0.42, 0.82, 0], [0.4, 1.0, 0]);
  add(g, rbox(0.04, 0.03, 0.5, 0.01), tm, 0.4, 1.0, 0); add(g, rbox(0.22, 0.05, 0.1, 0.03), tm, -0.14, 0.9, 0); return g; }
function makeTreeBench(r = 1.1) { const g = new THREE.Group(); const wood = std(0x9a6a3e, 0.7); const n = 16;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const p = add(g, rbox(0.42, 0.04, 0.4, 0.01), wood, Math.cos(a) * r, 0.45, Math.sin(a) * r); p.rotation.y = -a + Math.PI / 2; }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(g, rbox(0.06, 0.43, 0.06, 0.01), std(0x3a3d42, 0.5, 0.6), Math.cos(a) * r, 0.215, Math.sin(a) * r); } return g; }
function makePingPong() { const g = new THREE.Group(); const con = triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 1.5, color: 0x9a9a96, roughness: 0.9, bumpScale: 0.8 });
  add(g, rbox(2.74, 0.08, 1.525, 0.02), std(0x2f6b4a, 0.6), 0, 0.72, 0); add(g, new THREE.PlaneGeometry(2.7, 0.02), std(0xf2f2f2, 0.6), 0, 0.762, 0, { rx: -Math.PI / 2, cast: false }); add(g, new THREE.PlaneGeometry(0.02, 1.48), std(0xf2f2f2, 0.6), 0, 0.762, 0, { rx: -Math.PI / 2, cast: false });
  for (const x of [-0.9, 0.9]) add(g, rbox(0.3, 0.68, 1.1, 0.03), con, x, 0.34, 0); add(g, rbox(0.04, 0.16, 1.6, 0.01), std(0x3a3d42, 0.4, 0.7), 0, 0.84, 0); return g; }
function makeHoop() { const g = new THREE.Group(); const m = std(0x2b5aa8, 0.4, 0.6); add(g, new THREE.CylinderGeometry(0.07, 0.08, 3.4, 16), m, 0, 1.7, 0);
  const arm = add(g, rbox(0.08, 0.08, 0.9, 0.02), m, 0, 3.2, 0.42); add(g, rbox(1.8, 1.05, 0.05, 0.02), std(0xf4f4f2, 0.4), 0, 3.35, 0.9); add(g, new THREE.PlaneGeometry(0.59, 0.45), std(0xd8262c, 0.5), 0, 3.25, 0.927, { cast: false });
  add(g, new THREE.TorusGeometry(0.23, 0.012, 8, 32), std(0xe8702a, 0.4, 0.5), 0, 3.05, 1.18, { rx: Math.PI / 2 }); const net = add(g, new THREE.CylinderGeometry(0.23, 0.15, 0.38, 16, 3, true), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true }), 0, 2.86, 1.18); net.castShadow = false; return g; }
function makeBusShelter() { const g = new THREE.Group(); const frame = std(0x3a3d42, 0.45, 0.6); const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfefff, transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false });
  for (const [x, z] of [[-1.7, -0.75], [1.7, -0.75], [-1.7, 0.6], [1.7, 0.6]]) add(g, rbox(0.07, 2.45, 0.07, 0.01), frame, x, 1.225, z);
  add(g, rbox(3.6, 0.1, 1.6, 0.02), frame, 0, 2.48, -0.05); add(g, new THREE.BoxGeometry(3.4, 2.1, 0.02), glass, 0, 1.2, -0.75, { cast: false });
  add(g, new THREE.BoxGeometry(0.02, 2.1, 1.3), glass, -1.7, 1.2, -0.08, { cast: false });
  // ad panel on the right side
  const c = cnv(256, 400), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#ffcf3a'); gr.addColorStop(1, '#ff6a3a'); x.fillStyle = gr; x.fillRect(0, 0, 256, 400); x.fillStyle = '#1a1a1a'; x.font = 'bold 44px Arial'; x.textAlign = 'center'; x.fillText('SOMMER', 128, 90); x.fillText('FEST', 128, 140); x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 250, 70, 0, 6.28); x.fill(); x.fillStyle = '#ff6a3a'; x.font = 'bold 34px Arial'; x.fillText('12.7.', 128, 262); x.fillStyle = '#1a1a1a'; x.font = '20px Arial'; x.fillText('Stadtpark · Eintritt frei', 128, 370);
  add(g, rbox(0.12, 1.85, 1.25, 0.02), frame, 1.7, 1.2, -0.08); for (const sx of [-1, 1]) add(g, new THREE.PlaneGeometry(1.15, 1.75), new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex(c), emissive: 0xffffff, emissiveMap: tex(c), emissiveIntensity: 0.35 }), 1.7 + sx * 0.062, 1.2, -0.08, { ry: sx * Math.PI / 2, cast: false });
  // bench
  add(g, rbox(2.2, 0.05, 0.42, 0.015), std(0x9a6a3e, 0.7), -0.2, 0.46, -0.45); for (const x2 of [-1.1, 0.7]) add(g, rbox(0.05, 0.44, 0.35, 0.01), frame, x2, 0.22, -0.45); return g; }
function makeBusSign() { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.04, 0.04, 2.9, 12), std(0x9aa0a6, 0.35, 0.8), 0, 1.45, 0);
  const c = cnv(256, 256), x = c.getContext('2d'); x.fillStyle = '#ffd400'; x.beginPath(); x.arc(128, 128, 124, 0, 6.28); x.fill(); x.strokeStyle = '#1f8a3a'; x.lineWidth = 10; x.stroke(); x.fillStyle = '#1f8a3a'; x.font = 'bold 170px Arial'; x.textAlign = 'center'; x.fillText('H', 128, 190);
  for (const s of [1, -1]) add(g, new THREE.CircleGeometry(0.24, 40), std(0xffffff, 0.4, 0, { map: tex(c) }), 0, 2.72, s * 0.012, { ry: s < 0 ? Math.PI : 0, cast: false });
  const p = cnv(256, 64), y = p.getContext('2d'); y.fillStyle = '#1f8a3a'; y.fillRect(0, 0, 256, 64); y.fillStyle = '#fff'; y.font = 'bold 28px Arial'; y.textAlign = 'center'; y.fillText('Lindenhof Schule', 128, 42);
  for (const s of [1, -1]) add(g, new THREE.PlaneGeometry(0.62, 0.155), std(0xffffff, 0.4, 0, { map: tex(p) }), 0, 2.36, s * 0.012, { ry: s < 0 ? Math.PI : 0, cast: false });
  add(g, rbox(0.34, 0.46, 0.06, 0.01), std(0xf2f2f2, 0.4), 0, 1.6, 0.05); return g; }
function schoolBuilding() { const g = new THREE.Group(); const L = 40, D = 14, FH = 3.6, NF = 3, H = NF * FH + 0.6;
  const plaster = triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 0.3, color: 0xeae6dc, roughness: 0.9, bumpScale: 0.35 });
  add(g, rbox(L, H, D, 0.03), plaster, 0, H / 2, -D / 2);
  add(g, rbox(L + 0.2, 0.5, D + 0.2, 0.03), std(0x5a5e66, 0.6), 0, H + 0.2, -D / 2);
  const frame = std(0x3a3d42, 0.4, 0.5); const panelCols = [0x2a9d8f, 0xe9a23b, 0x2a9d8f, 0xe76f51]; const winW = 1.55, gap = 0.25;
  for (let f = 0; f < NF; f++) { const y0 = f * FH + (f === 0 ? 0.9 : 0.95);
    for (let x = -L / 2 + 1.2; x < L / 2 - 1.2; x += winW + gap) { if (f === 0 && Math.abs(x + winW / 2) < 3.2) continue;
      const cx = x + winW / 2; const gl = windowGlass(winW, 1.75, [TILE.kitchen, TILE.kitchen, TILE.warm2, TILE.dark][(Math.abs(Math.round(cx * 3)) + f) % 4]); gl.position.set(cx, y0 + 0.875, 0.012); g.add(gl);
      add(g, rbox(winW + 0.08, 0.07, 0.08, 0.01), frame, cx, y0 + 1.75 + 0.02, 0.03); add(g, rbox(winW + 0.08, 0.07, 0.1, 0.01), frame, cx, y0 - 0.02, 0.04); add(g, rbox(0.06, 1.75, 0.07, 0.01), frame, x, y0 + 0.875, 0.03);
      add(g, rbox(winW, 0.55, 0.04, 0.01), std(panelCols[(Math.round((x + L) / 1.8) + f) % 4], 0.6), cx, y0 - 0.38, 0.02); } }
  // entrance: glass hall + canopy + sign
  add(g, rbox(6.2, 6.6, 0.5, 0.02), std(0x3a3d42, 0.4, 0.5), 0, 3.3, 0.1); const eg = windowGlass(5.8, 6.2, TILE.darkBlue); eg.position.set(0, 3.25, 0.36); g.add(eg);
  for (let i = -2; i <= 2; i++) add(g, rbox(0.06, 6.2, 0.06, 0.01), frame, i * 1.45, 3.25, 0.4); add(g, rbox(5.8, 0.06, 0.06, 0.01), frame, 0, 2.6, 0.4);
  add(g, rbox(8, 0.25, 3.2, 0.02), std(0xf2f2ee, 0.5), 0, 3.0, 1.6); for (const x of [-3.8, 3.8]) add(g, new THREE.CylinderGeometry(0.09, 0.09, 3.0, 12), frame, x, 1.5, 3.0);
  const c = cnv(1024, 96), x = c.getContext('2d'); x.clearRect(0, 0, 1024, 96); x.fillStyle = '#2b3656'; x.font = 'bold 72px Arial'; x.textAlign = 'center'; x.fillText('GESAMTSCHULE LINDENHOF', 512, 74);
  add(g, new THREE.PlaneGeometry(11, 1.03), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true, roughness: 0.5 }), 0, 7.4, 0.04, { cast: false });
  return g; }

export async function buildSchule(stage, o = {}) {
  const { scene } = stage; const rnd = makeRng(7); setWindowGlow(o.windowGlow ?? 0.03);
  // ground: road, sidewalk, curb, schoolyard asphalt, lawn beyond
  const asph = triMat({ map: T.asphalt.map, bump: T.asphalt.bump, scale: 0.25, color: 0xc8ccd4, roughness: 0.85, bumpScale: 0.6 });
  add(scene, new THREE.PlaneGeometry(120, 7.2), asph, 0, 0, 9.5, { rx: -Math.PI / 2, cast: false });
  for (let x = -50; x < 50; x += 6) add(scene, new THREE.PlaneGeometry(3, 0.14), std(0xf2f0e8, 0.6), x, 0.004, 9.5, { rx: -Math.PI / 2, cast: false });
  const pav = triMat({ map: T.pavers.map, bump: T.pavers.bump, scale: 1 / 2.4, color: 0xd4d2cc, roughness: 0.8, bumpScale: 0.7 });
  add(scene, new THREE.BoxGeometry(120, 0.12, 2.6), pav, 0, 0.06, 4.8, { cast: false });
  for (let x = -55; x < 55; x += 1) add(scene, rbox(0.985, 0.14, 0.18, 0.025), triMat({ map: T.plaster.map, bump: T.plaster.bump, scale: 2.0, color: 0xb0aea8, roughness: 0.7, bumpScale: 0.6 }), x + 0.5, 0.06, 6.0, { cast: false });
  add(scene, new THREE.BoxGeometry(120, 0.12, 2.6), pav, 0, 0.06, 14.3, { cast: false });
  const yard = triMat({ map: T.pflaster.map, bump: T.pflaster.bump, scale: 0.55, color: 0xe2d8cc, roughness: 0.9, bumpScale: 0.7 });
  add(scene, new THREE.PlaneGeometry(60, 27), yard, 0, 0.003, -10, { rx: -Math.PI / 2, cast: false });
  add(scene, new THREE.PlaneGeometry(200, 200), triMat({ map: T.grass.map, bump: T.grass.bump, scale: 0.5, color: 0xd4e0bc, roughness: 0.95 }), 0, -0.01, 0, { rx: -Math.PI / 2, cast: false });
  // court lines + hopscotch
  { const c = cnv(512, 512), x = c.getContext('2d'); x.clearRect(0, 0, 512, 512); x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 6; x.strokeRect(10, 10, 492, 492); x.beginPath(); x.moveTo(10, 256); x.lineTo(502, 256); x.stroke(); x.beginPath(); x.arc(256, 256, 60, 0, 6.28); x.stroke(); x.beginPath(); x.arc(256, 10, 130, 0, Math.PI); x.stroke(); x.beginPath(); x.arc(256, 502, 130, Math.PI, 0); x.stroke();
    add(scene, new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true, roughness: 0.8, depthWrite: false }), -15, 0.006, -12, { rx: -Math.PI / 2, cast: false }); }
  // building
  const sch = schoolBuilding(); sch.position.set(0, 0, -24); scene.add(sch);
  // fence along z = 3.5 with gate opening x -2..2
  { const m = std(0x2b5a3a, 0.45, 0.5); for (let x = -30; x <= 30; x += 0.15) { if (Math.abs(x) < 2.1) continue; add(scene, rbox(0.025, 1.3, 0.025, 0.006), m, x, 0.65, 3.5); }
    for (const y of [0.15, 1.2]) for (const [a, b] of [[-30, -2.1], [2.1, 30]]) add(scene, rbox(b - a, 0.05, 0.05, 0.01), m, (a + b) / 2, y, 3.5);
    for (const x of [-2.15, 2.15]) add(scene, rbox(0.12, 1.6, 0.12, 0.02), m, x, 0.8, 3.5); }
  // trees with round benches, shrubs along the fence
  for (const [i, s] of [[0, 61], [1, 62], [2, 63], [3, 64]]) { const p = SCHANCHOR.treeBench(i); const t = makeTree({ h: 10, crown: 3.6, seed: s, palette: [0x4f7f2a, 0x6b9a34, 0x3d6a24, 0x8aa83a], clumps: 320, clumpScale: 0.62 }); t.position.copy(p); scene.add(t); const b = makeTreeBench(1.0); b.position.copy(p); scene.add(b); }
  for (let x = -26; x < 26; x += 3.2) { if (Math.abs(x) < 3.5) continue; const s = makeShrub(0.55 + rnd() * 0.2, { seed: Math.round(x * 7 + 100) }); s.position.set(x, 0, 2.7); scene.add(s); }
  const pp = makePingPong(); pp.position.copy(SCHANCHOR.pingpong); pp.rotation.y = 0.2; scene.add(pp);
  const hoop = makeHoop(); hoop.position.set(-15, 0, -18.4); scene.add(hoop);
  // bike racks + bikes along the fence (inside)
  { const m = std(0xb8bcc0, 0.3, 0.9); for (let i = 0; i < 8; i++) { const x = -13 + i * 0.9; add(scene, new THREE.TorusGeometry(0.35, 0.025, 8, 20, Math.PI), m, x, 0.0, 1.6, { ry: Math.PI / 2 }); if (i % 2 === 0 || i === 5) { const b = makeBike([0x2f6fbf, 0xd8262c, 0x2b2b2e, 0x3aa06a, 0xf2c230][i % 5], i); b.rotation.y = Math.PI / 2; b.position.set(x + 0.1, 0, 1.6); scene.add(b); } } }
  for (const x of [-6, 6]) { const b = makeBin(0xe8702a, 0xe8702a); b.position.set(x, 0, 2.2); b.scale.setScalar(0.85); scene.add(b); }
  // bus stop on the sidewalk
  const sh = makeBusShelter(); sh.position.set(8.0, 0.12, 4.9); scene.add(sh);
  const bs = makeBusSign(); bs.position.set(10.3, 0.12, 5.6); scene.add(bs);
  const lamp = makeStreetLamp({ glow: 0 }); lamp.position.set(-8, 0.12, 5.75); lamp.rotation.y = -Math.PI / 2; scene.add(lamp);
  // houses / trees across the street (background)
  for (const [x, s] of [[-18, 71], [-6, 72], [12, 73], [26, 74]]) { const t = makeTree({ h: 9, crown: 3.2, seed: s, palette: [0x4f7f2a, 0x6b9a34, 0x3d6a24], clumps: 240, clumpScale: 0.65 }); t.position.set(x, 0.12, 15.8); scene.add(t); }
  stage.aimKey(new THREE.Vector3(0, 0, -6));
  return { SCHANCHOR };
}

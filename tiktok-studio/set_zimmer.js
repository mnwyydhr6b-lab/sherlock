// set_zimmer.js – Set 2: Jugendzimmer von "Du" (nachts: LED-Streifen, Monitor, Schreibtischlampe; Blick aus dem Fenster auf Nachbarhäuser).
// Raum: x -2.1..2.1, z -1.9..1.9, Decke 2.55; Südwand (z = +1.9) ist für die Kamera weggeschnitten.
import * as THREE from 'three';
import { std, rbox, add, cnv, tex, makeRng } from './kit_world.js';
import { makeRoom, makeBed, makeDesk, makeGamingChair, makeMonitor, makeKeyboard, makeDeskLamp, makeWardrobe, makeShelf, makePoster, makeRug, makeLED, makePottedPlant, makeBackpack, makeClothes, makeCan } from './kit_interior.js';
import { makeHouse, TILE, setWindowGlow } from './kit_house.js';
import { makeTree } from './kit_nature.js';
import { makeStreetLamp } from './kit_street.js';

export const ZANCHOR = {
  bedFoot: new THREE.Vector3(-1.33, 0.56, 0.02),  // Sitzpunkt (Becken) am Fußende des Betts, Blick +z
  bedSide: new THREE.Vector3(-0.72, 0.56, -0.5),  // Sitzpunkt (Becken) an der Bettkante, Blick +x
  bedLie: new THREE.Vector3(-1.35, 0.55, -0.6),
  chairSeat: new THREE.Vector3(1.15, 0.56, 0.4),  // Sitzpunkt Schreibtischstuhl (Blick +x zum Monitor)
  keyboard: new THREE.Vector3(1.55, 0.79, 0.3), mouse: new THREE.Vector3(1.55, 0.79, 0.72), monitor: new THREE.Vector3(1.9, 1.05, 0.35),
  window: new THREE.Vector3(0.3, 1.4, -1.9),
  center: new THREE.Vector3(0.2, 0, 0.4),
};

export function buildZimmer(stage, o = {}) {
  const { scene } = stage; const night = o.night ?? true; const r = makeRng(12);
  setWindowGlow(night ? 1.25 : 0.12);
  const room = makeRoom({ w: 4.2, d: 3.8, h: 2.55, wall: 0xd9dde3, wallColors: { w: o.accent ?? 0x2b3656 }, floorColor: 0xf2ece4, cut: o.cut ?? ['s'],
    windows: [{ wall: 'n', x: 0.3, y: 0.95, w: 1.3, h: 1.35, sash: 2, curtains: 0x4a5068 }] });
  scene.add(room);
  // ---- bed against west wall, head north
  const bed = makeBed({ w: 1.4, l: 2.0, frame: 0xe2dcd2, duvet: o.duvet ?? 0x3a4a72, seed: 3 }); bed.position.set(-1.33, 0, -0.85); scene.add(bed);
  const nightstand = add(scene, rbox(0.42, 0.5, 0.4, 0.015), std(0xe2dcd2, 0.5), -1.83 + 0.21 + 0.03, 0.25, -1.9 + 0.22 + 0.02); // small, in the corner next to bed head
  nightstand.position.set(-0.4, 0.25, -1.65);
  // ---- wardrobe + desk on east wall
  const wardrobe = makeWardrobe({ w: 1.0, h: 2.05, d: 0.58 }); wardrobe.rotation.y = -Math.PI / 2; wardrobe.position.set(2.1 - 0.3, 0, -1.33); scene.add(wardrobe);
  const desk = makeDesk({ w: 1.4, d: 0.7 }); desk.rotation.y = -Math.PI / 2; desk.position.set(2.1 - 0.36, 0, 0.35); scene.add(desk);
  const scrC = cnv(512, 288); { const g = scrC.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 288); gr.addColorStop(0, '#1a0b3a'); gr.addColorStop(0.55, '#5a1a7a'); gr.addColorStop(0.62, '#ff6ab0'); gr.addColorStop(1, '#120820'); g.fillStyle = gr; g.fillRect(0, 0, 512, 288);
    g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(256, 160, 48, Math.PI, 0); g.fill(); g.fillStyle = '#2a0f45'; g.beginPath(); g.moveTo(0, 190); for (let x = 0; x <= 512; x += 32) g.lineTo(x, 150 + Math.sin(x * 0.05) * 18 + (x % 64 ? 12 : -10)); g.lineTo(512, 288); g.lineTo(0, 288); g.fill();
    g.strokeStyle = 'rgba(255,90,200,0.7)'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(256 + (i - 4) * 20, 190); g.lineTo(256 + (i - 4) * 140, 288); g.stroke(); } for (let y = 200; y < 288; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = 'bold 18px Arial'; g.fillText('LEVEL 7', 20, 30); g.fillRect(380, 18, 110, 10); g.fillStyle = '#3bff8a'; g.fillRect(382, 20, 80, 6); }
  const mon = makeMonitor({ w: 0.62, h: 0.35, map: tex(scrC) }); mon.rotation.y = -Math.PI / 2; mon.position.set(2.1 - 0.2, 0.75, 0.35); scene.add(mon);
  const kb = makeKeyboard(); kb.rotation.y = -Math.PI / 2; kb.position.set(2.1 - 0.55, 0.75, 0.3); scene.add(kb);
  add(scene, rbox(0.12, 0.035, 0.07, 0.015), std(0x141416, 0.5), 2.1 - 0.55, 0.767, 0.72);
  const lamp = makeDeskLamp({ on: o.deskLamp ?? true }); lamp.rotation.y = Math.PI; lamp.position.set(2.1 - 0.2, 0.75, -0.2); scene.add(lamp);
  const can = makeCan(0x1fbf5a); can.position.set(2.1 - 0.45, 0.75, 0.85); scene.add(can);
  // headphones on desk
  add(scene, new THREE.TorusGeometry(0.09, 0.012, 8, 24, Math.PI), std(0x1a1a1e, 0.5), 2.1 - 0.35, 0.76, -0.05, { rx: -Math.PI / 2 + 0.2 });
  const chair = makeGamingChair({ accent: 0x2f6b4f }); chair.rotation.y = Math.PI / 2 - 0.35; chair.position.set(1.15, 0, 0.45); scene.add(chair);
  const clothes = makeClothes([0x3a3a40, 0xd8d4cc, 0x8a2b2b], 4); clothes.position.set(1.12, 0.56, 0.45); clothes.rotation.y = 0.4; scene.add(clothes);
  const shelf = makeShelf({ w: 1.0, books: 14 }); shelf.rotation.y = -Math.PI / 2; shelf.position.set(2.1 - 0.11, 1.62, 0.35); scene.add(shelf);
  // ---- posters
  const p1 = makePoster(0.6, 0.85, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a1060'); gr.addColorStop(0.55, '#ff5a8a'); gr.addColorStop(0.75, '#ffb35a'); gr.addColorStop(1, '#2a1030'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(W / 2, H * 0.62, W * 0.24, 0, 6.28); g.fill(); g.fillStyle = '#1a0a24'; g.fillRect(0, H * 0.7, W, H * 0.3); for (const x of [0.18, 0.8]) { g.fillRect(W * x - 3, H * 0.4, 6, H * 0.35); for (let k = 0; k < 6; k++) { g.save(); g.translate(W * x, H * 0.4); g.rotate(k * 1.05); g.fillRect(0, -3, W * 0.14, 6); g.restore(); } } g.fillStyle = '#fff'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.fillText("SUMMER '26", W / 2, H * 0.12); });
  p1.rotation.y = Math.PI / 2; p1.position.set(-2.1 + 0.005, 1.55, -1.05); scene.add(p1);
  const p2 = makePoster(0.5, 0.7, (g, W, H) => { g.fillStyle = '#111'; g.fillRect(0, 0, W, H); g.fillStyle = '#e8702a'; g.beginPath(); g.arc(W / 2, H * 0.45, W * 0.3, 0, 6.28); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H * 0.45, W * 0.3, 0, 6.28); g.moveTo(W * 0.2, H * 0.45); g.lineTo(W * 0.8, H * 0.45); g.moveTo(W / 2, H * 0.45 - W * 0.3); g.lineTo(W / 2, H * 0.45 + W * 0.3); g.stroke(); g.fillStyle = '#fff'; g.font = 'bold 54px Arial'; g.textAlign = 'center'; g.fillText('NO DAYS OFF', W / 2, H * 0.88); });
  p2.rotation.y = Math.PI / 2; p2.position.set(-2.1 + 0.005, 1.6, -0.25); scene.add(p2);
  const p3 = makePoster(0.45, 0.6, (g, W, H) => { g.fillStyle = '#e9e4d8'; g.fillRect(0, 0, W, H); g.fillStyle = '#2b3656'; for (let i = 0; i < 260; i++) { const x = (i * 37) % W, y = (i * 53) % H; g.beginPath(); g.arc(x, y, 4, 0, 6.28); g.fill(); } g.fillStyle = '#c0302a'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('BERLIN', W / 2, H * 0.92); });
  p3.rotation.y = -Math.PI / 2; p3.position.set(2.1 - 0.005, 1.7, -0.6); scene.add(p3);
  // ---- rug, plant, backpack, sneakers
  const rug = makeRug(1.7, 1.15, (g, W, H) => { g.fillStyle = '#d8d2c6'; g.fillRect(0, 0, W, H); g.strokeStyle = '#2b3656'; g.lineWidth = 14; g.strokeRect(20, 20, W - 40, H - 40); g.fillStyle = '#c9c2b4'; for (let i = 0; i < 2000; i++) g.fillRect(Math.random() * W, Math.random() * H, 2, 2); });
  rug.position.set(0.25, 0, 0.45); scene.add(rug);
  const plant = makePottedPlant({ h: 0.9 }); plant.position.set(1.4, 0, -1.55); scene.add(plant);
  const bp = makeBackpack(0x2b3a5a); bp.position.set(-0.35, 0, 0.75); bp.rotation.y = 0.6; bp.rotation.z = 0.1; scene.add(bp);
  // ---- LED strip under the ceiling (n, w, e walls)
  const y = 2.47, ins = 0.03; const led = makeLED([new THREE.Vector3(-2.1 + ins, y, 1.9), new THREE.Vector3(-2.1 + ins, y, -1.9 + ins), new THREE.Vector3(2.1 - ins, y, -1.9 + ins), new THREE.Vector3(2.1 - ins, y, 1.9)], { color: o.ledColor ?? 0xa45aff, lights: 5, intensity: o.ledI ?? 1.0, dist: 4.5 });
  if (night) scene.add(led);
  // ---- monitor + screen glow
  if (night) { const mL = new THREE.PointLight(0x9a7aff, 1.0, 3, 2); mL.position.set(1.4, 1.0, 0.35); scene.add(mL); }
  // ---- outside: neighbour houses + street lamp + tree, seen through the window (north)
  const out = new THREE.Group(); scene.add(out);
  add(out, new THREE.PlaneGeometry(80, 40), std(0x1a1c22, 0.9), 0, -3.0, -24, { rx: -Math.PI / 2, cast: false });
  for (const [x, seed, wall, roof] of [[-5.5, 21, 0xe9eef0, 0x3a3d42], [6.5, 22, 0xf0e6d2, 0x7a3a2a]]) {
    const h = makeHouse({ seed, w: 9.5, d: 8.5, floors: 2, fh: 2.7, pitch: 42, wall, roof, front: [{ x: -2.6, y: 1.3, w: 1.4, h: 1.3, tile: TILE.warm }, { x: 2.6, y: 1.3, w: 1.4, h: 1.3, tile: TILE.tv }, { x: -2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.dark, shutter: 1 }, { x: 2.6, y: 3.95, w: 1.2, h: 1.3, tile: TILE.bed }], door: { x: 0, w: 1.1, h: 2.1, color: 0x2b2f34, glassTile: TILE.stairs, number: 4, lampIntensity: night ? 2 : 0 }, chimney: [2, -1] });
    h.position.set(x, -3.0, -22); scene.add(h); }
  const sl = makeStreetLamp({ glow: night ? 9 : 0 }); sl.position.set(1.5, -3.0, -12); sl.rotation.y = Math.PI / 2; scene.add(sl);
  if (night) { const L = new THREE.PointLight(0xffd6a0, 30, 14, 1.6); L.position.set(1.5, 2.6, -13.2); scene.add(L); }
  const tr = makeTree({ h: 8, crown: 2.8, seed: 51, palette: [0x2f4a2a, 0x3a5a2e, 0x24381f], clumps: 100 }); tr.position.set(-9.5, -3.0, -12); scene.add(tr);
  // moonlight through the window
  stage.aimKey(new THREE.Vector3(0, 0, 0), [6, 22, -30]);
  return { room, ZANCHOR, chair, desk, monitor: mon, keyboard: kb, bed };
}

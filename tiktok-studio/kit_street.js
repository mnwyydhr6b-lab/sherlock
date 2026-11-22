// kit_street.js – German street furniture + party props
import * as THREE from 'three';
import { T, triMat, std, rbox, add, cnv, tex, makeRng } from './kit_world.js';

// modern street light: pole at origin, arm toward local -x (over the road). Returns group with userData.head (world-ish local pos)
export function makeStreetLamp(o = {}) {
  const g = new THREE.Group(); const H = o.h ?? 5.2; const metal = std(0x50565c, 0.5, 0.6);
  add(g, new THREE.CylinderGeometry(0.06, 0.09, H, 14), metal, 0, H / 2, 0);
  add(g, new THREE.CylinderGeometry(0.12, 0.13, 0.5, 14), metal, 0, 0.25, 0);
  const arm = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, H - 0.05, 0), new THREE.Vector3(0, H + 0.45, 0), new THREE.Vector3(-0.9, H + 0.5, 0));
  add(g, new THREE.TubeGeometry(arm, 16, 0.045, 10), metal);
  const head = new THREE.Group(); head.position.set(-1.15, H + 0.5, 0); g.add(head);
  add(head, rbox(0.62, 0.09, 0.26, 0.04), std(0x3c4146, 0.4, 0.5), 0, 0, 0);
  add(head, new THREE.PlaneGeometry(0.5, 0.18), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: o.color ?? 0xffd9a8, emissiveIntensity: o.glow ?? 9 }), 0, -0.047, 0, { rx: Math.PI / 2, cast: false });
  g.userData.head = head;
  return g;
}

// 240 l wheelie bin (Mülltonne); lid colour codes: grey=Rest, blue=Papier, brown=Bio, yellow=Gelbe Tonne
export function makeBin(lid = 0x2b2f34, body = 0x3a3d42) {
  const g = new THREE.Group(); const bm = std(body, 0.55, 0), lm = std(lid, 0.5, 0);
  const b = add(g, rbox(0.58, 0.98, 0.72, 0.05), bm, 0, 0.53, 0); b.scale.set(1, 1, 1);
  add(g, rbox(0.64, 0.07, 0.8, 0.03), lm, 0, 1.06, 0.02); add(g, rbox(0.5, 0.05, 0.08, 0.02), lm, 0, 1.02, -0.4);
  for (const sx of [-1, 1]) add(g, new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), std(0x111111, 0.8), sx * 0.27, 0.1, -0.33, { rz: Math.PI / 2 });
  add(g, rbox(0.56, 0.05, 0.05, 0.02), std(0x222222, 0.6), 0, 0.9, -0.39);
  return g;
}

// garden pillar with cap
export function makePillar(h = 1.15, mat = null) {
  const g = new THREE.Group(); const m = mat ?? triMat({ map: T.brick.map, bump: T.brick.bump, scale: 0.5, color: 0xffffff, roughness: 0.9, bumpScale: 1.2 });
  add(g, rbox(0.4, h, 0.4, 0.02), m, 0, h / 2, 0); add(g, rbox(0.5, 0.07, 0.5, 0.02), std(0x8d8a84, 0.8), 0, h + 0.035, 0); return g;
}
// metal gate (bars) spanning local x
export function makeGate(w = 1.1, h = 1.0, open = 0) {
  const g = new THREE.Group(); const m = std(0x2b2f34, 0.45, 0.6); const leaf = new THREE.Group(); g.add(leaf); leaf.rotation.y = open;
  add(leaf, rbox(w, 0.05, 0.04, 0.01), m, w / 2, h - 0.05, 0); add(leaf, rbox(w, 0.05, 0.04, 0.01), m, w / 2, 0.15, 0);
  for (let i = 0; i <= Math.round(w / 0.11); i++) add(leaf, rbox(0.022, h - 0.1, 0.022, 0.005), m, 0.02 + i * (w - 0.04) / Math.round(w / 0.11), h / 2 + 0.05, 0);
  return g;
}
export function makeMailbox() {
  const g = new THREE.Group(); add(g, rbox(0.36, 0.42, 0.16, 0.02), std(0x2b2f34, 0.35, 0.5), 0, 0, 0); add(g, rbox(0.28, 0.03, 0.02, 0.01), std(0xc8ccd0, 0.25, 0.9), 0, 0.1, 0.085);
  const lab = cnv(128, 32); { const c = lab.getContext('2d'); c.fillStyle = '#e8e8e8'; c.fillRect(0, 0, 128, 32); c.fillStyle = '#222'; c.font = 'bold 20px Inter, Arial'; c.fillText('Schneider', 8, 23); }
  add(g, new THREE.PlaneGeometry(0.14, 0.035), std(0xffffff, 0.5, 0, { map: tex(lab) }), 0, -0.1, 0.081, { cast: false }); return g;
}
// traffic sign on a pole; kind 'zone30' | 'street'
export function makeSign(kind, text = '') {
  const g = new THREE.Group(); const pole = std(0x9aa0a6, 0.35, 0.8); add(g, new THREE.CylinderGeometry(0.03, 0.03, 2.9, 10), pole, 0, 1.45, 0);
  const c = cnv(256, kind === 'street' ? 64 : 320); const x = c.getContext('2d');
  if (kind === 'zone30') { x.fillStyle = '#ffffff'; x.fillRect(0, 0, 256, 320); x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 308); x.beginPath(); x.arc(128, 120, 86, 0, 6.28); x.fillStyle = '#d4202a'; x.fill(); x.beginPath(); x.arc(128, 120, 64, 0, 6.28); x.fillStyle = '#fff'; x.fill(); x.fillStyle = '#111'; x.font = 'bold 84px Arial'; x.textAlign = 'center'; x.fillText('30', 128, 150); x.font = 'bold 62px Arial'; x.fillText('ZONE', 128, 290);
    add(g, new THREE.PlaneGeometry(0.42, 0.525), std(0xffffff, 0.35, 0, { map: tex(c) }), 0, 2.55, 0.035, { cast: false }); add(g, rbox(0.44, 0.545, 0.02, 0.01), pole, 0, 2.55, 0.02); }
  else { x.fillStyle = '#f4f4f2'; x.fillRect(0, 0, 256, 64); x.strokeStyle = '#111'; x.lineWidth = 4; x.strokeRect(4, 4, 248, 56); x.fillStyle = '#111'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.fillText(text, 128, 44);
    for (const s of [1, -1]) add(g, new THREE.PlaneGeometry(0.75, 0.19), std(0xffffff, 0.4, 0, { map: tex(c) }), 0.3 * 0, 2.95, s * 0.012, { ry: s < 0 ? Math.PI : 0, cast: false }); add(g, rbox(0.77, 0.2, 0.02, 0.01), pole, 0, 2.95, 0); }
  return g;
}

// --------------------------------------------------------------- party props
export function makeBalloon(color, o = {}) {
  const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15, metalness: o.metal ?? 0, emissive: new THREE.Color(color).multiplyScalar(o.glow ?? 0.12) });
  const b = add(g, new THREE.SphereGeometry(0.17, 28, 20), m, 0, 0, 0); b.scale.set(1, 1.18, 1);
  add(g, new THREE.ConeGeometry(0.025, 0.05, 10), m, 0, -0.21, 0, { rx: Math.PI });
  return g;
}
// thin string between two world points (as a slightly sagging tube)
export function stringBetween(a, b, sag = 0.05, color = 0xf2f2f2, r = 0.003) {
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag; mid.x += sag * 0.5;
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 12, r, 4), new THREE.MeshBasicMaterial({ color }));
}
// string lights along catenary between points; returns group + bulb positions
export function makeStringLights(points, o = {}) {
  const g = new THREE.Group(); const bulbs = []; const wire = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  for (let i = 0; i < points.length - 1; i++) { const a = points[i], b = points[i + 1]; const sag = o.sag ?? 0.35; const mid = a.clone().lerp(b, 0.5); mid.y -= sag * 2;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b); g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.007, 4), wire));
    const len = a.distanceTo(b); const n = Math.max(2, Math.round(len / (o.spacing ?? 0.32))); for (let k = 1; k < n; k++) bulbs.push(curve.getPoint(k / n)); }
  const geo = new THREE.SphereGeometry(o.r ?? 0.03, 10, 8); geo.scale(1, 1.3, 1);
  const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: o.color ?? 0xffc878, emissiveIntensity: o.glow ?? 6 }), bulbs.length);
  const d = new THREE.Object3D(); bulbs.forEach((p, i) => { d.position.copy(p).add(new THREE.Vector3(0, -0.035, 0)); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); g.add(im);
  g.userData.bulbs = bulbs; return g;
}
export function makeCup(color = 0xd8262c) { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.045, 0.032, 0.12, 16, 1, true), std(color, 0.4, 0, { side: THREE.DoubleSide }), 0, 0, 0); add(g, new THREE.TorusGeometry(0.045, 0.004, 6, 20), std(0xffffff, 0.4), 0, 0.06, 0, { rx: Math.PI / 2 }); add(g, new THREE.CircleGeometry(0.032, 16), std(color, 0.4), 0, -0.059, 0, { rx: -Math.PI / 2 }); return g; }
export function makeCardboardSign(lines) {
  const c = cnv(256, 192), x = c.getContext('2d'); x.fillStyle = '#c49a64'; x.fillRect(0, 0, 256, 192); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(90,60,30,${Math.random() * 0.15})`; x.fillRect(Math.random() * 256, Math.random() * 192, 3, 2); }
  x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.font = 'bold 54px "Comic Sans MS", Marker Felt, Arial'; lines.forEach((l, i) => x.fillText(l, 128 + (i % 2 ? 4 : -3), 72 + i * 66));
  x.fillStyle = 'rgba(230,230,220,0.75)'; x.fillRect(100, 0, 56, 16);
  const g = new THREE.Group(); add(g, new THREE.BoxGeometry(0.5, 0.375, 0.01), [std(0x9a7448, 0.9), std(0x9a7448, 0.9), std(0x9a7448, 0.9), std(0x9a7448, 0.9), std(0xffffff, 0.9, 0, { map: tex(c) }), std(0x9a7448, 0.9)], 0, 0, 0); return g;
}

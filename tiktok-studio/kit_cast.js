// kit_cast.js – feste Besetzung der Serie (immer gleiche Kleidung/Frisur) + Posen-Helfer.
// spawn('du', { x, y, z, ry, anim, time }) erzeugt die Figur; Figuren NIE frei neu erfinden, sondern hier ergänzen.
import * as THREE from 'three';
import { makeHuman, armIK, rotBoneWorld, loadHumanAssets } from './kit_human.js';
import { rbox, add } from './kit_world.js';
import { makeCup } from './kit_street.js';
export { loadHumanAssets };

export const CAST = {
  // Hauptfigur "Du": ca. 17, grüner Hoodie, Jeans, weiße Sneaker mit grünem Akzent
  du: { label: 'Du', role: 'Hauptfigur', sex: 'male', skin: 'light', hair: 'SimpleParted', hairColor: 0x2e1d12, top: { type: 'hoodie', color: 0x2f6b4f }, pants: { color: 0x3b5a8c }, shoes: 0xf2f2f2, shoeAccent: 0x2f6b4f, slim: 0.86 },
  // Leon: Gastgeber, beliebt, blond, weißes T-Shirt
  leon: { label: 'Leon', role: 'Gastgeber, beliebt', sex: 'male', skin: 'light', hair: 'Buzzed', hairColor: 0xb08a50, top: { type: 'tee', color: 0xf4f4f4 }, pants: { color: 0x22304a }, shoes: 0xffffff, slim: 0.88 },
  // Mia: der Schwarm, rotbraune lange Haare, gelbe Jacke
  mia: { label: 'Mia', role: 'Schwarm', sex: 'female', skin: 'light', hair: 'Long', hairColor: 0x8a3b1e, top: { type: 'jacket', color: 0xf2c230 }, pants: { color: 0x3b5a8c }, shoes: 0xf2f2f2, slim: 0.88 },
  // Jasmin: Mias beste Freundin, Dutt, pinkes T-Shirt
  jasmin: { label: 'Jasmin', role: 'Mias beste Freundin', sex: 'female', skin: 'dark', hair: 'Buns', hairColor: 0x1b1210, top: { type: 'tee', color: 0xe05aa8 }, pants: { color: 0x2b2b33 }, shoes: 0x111111, slim: 0.88 },
  // Tarik: aus der Clique, schwarze Jacke
  tarik: { label: 'Tarik', role: 'Clique', sex: 'male', skin: 'dark', hair: 'Buzzed', hairColor: 0x111111, top: { type: 'jacket', color: 0x1f2024 }, pants: { color: 0x2a2a2e }, shoes: 0xf2f2f2, slim: 0.88 },
  // Ben: bester Kumpel von "Du", roter Hoodie
  ben: { label: 'Ben', role: 'bester Kumpel', sex: 'male', skin: 'light', hair: 'Buzzed', hairColor: 0x5a3a22, top: { type: 'hoodie', color: 0xb8322e }, pants: { color: 0x2b2b33 }, shoes: 0x2b2b33, shoeAccent: 0xf2f2f2, slim: 0.9 },
  // Eltern
  mama: { label: 'Mama', role: 'Mutter', sex: 'female', skin: 'light', hair: 'Long', hairColor: 0x8a6a3a, top: { type: 'jacket', color: 0xc8b89a }, pants: { color: 0x2b2b33 }, shoes: 0x3a3a3a, slim: 0.9 },
  papa: { label: 'Papa', role: 'Vater', sex: 'male', skin: 'light', hair: 'Buzzed', hairColor: 0x6a6a6a, beard: true, top: { type: 'shirt', color: 0x9ab8d8 }, pants: { color: 0x2b2b33 }, shoes: 0x4a3020, slim: 0.95 },
};
export function spawn(name, o = {}) { const base = CAST[name]; if (!base) throw new Error('unknown cast ' + name); const h = makeHuman({ ...base, ...o, top: { ...base.top, ...(o.top || {}) }, pants: { ...base.pants, ...(o.pants || {}) } }); h.userData.castName = name; return h; }

// Hilfsrichtungen einer Figur
function axes(h) { const ry = h.rotation.y; return { f: new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)), rt: new THREE.Vector3(-Math.cos(ry), 0, Math.sin(ry)), up: new THREE.Vector3(0, 1, 0) }; }

// Handy vor der Brust halten und draufschauen. Gibt die Handy-Gruppe zurück (userData.screen = Bildschirm-Mesh)
export function posePhone(h, { hand = 'r', forward = 0.27, side = 0.0, height = -0.04, neck = 0.16, head = 0.3, turn = -0.12, roll = -0.9, light = 0.035, screenColor = 0xffc2ee, screenMap = null, twoHands = false } = {}) {
  const b = h.userData.bones; const { f, rt, up } = axes(h); const sgn = hand === 'r' ? 1 : -1;
  h.updateMatrixWorld(true);
  const chest = b.spine_03.getWorldPosition(new THREE.Vector3());
  const tgt = chest.clone().addScaledVector(f, forward).addScaledVector(rt, side * sgn).addScaledVector(up, height);
  armIK(h, hand, tgt, new THREE.Vector3(0, -1, 0).addScaledVector(rt, 0.8 * sgn).addScaledVector(f, -0.35));
  if (twoHands) { const o = hand === 'r' ? 'l' : 'r'; armIK(h, o, tgt.clone().addScaledVector(rt, -0.1 * sgn).addScaledVector(up, -0.03), new THREE.Vector3(0, -1, 0).addScaledVector(rt, -0.8 * sgn).addScaledVector(f, -0.35)); }
  const left = rt.clone().negate();
  rotBoneWorld(h, b.neck_01, left, neck); rotBoneWorld(h, b.Head, left, head); rotBoneWorld(h, b.Head, up, turn * sgn);
  rotBoneWorld(h, b['hand_' + hand], f, roll * sgn);
  const ph = new THREE.Group();
  add(ph, rbox(0.075, 0.155, 0.009, 0.006), new THREE.MeshPhysicalMaterial({ color: 0x15151a, roughness: 0.25, clearcoat: 1 }), 0, 0, 0);
  const screen = add(ph, new THREE.PlaneGeometry(0.067, 0.145), new THREE.MeshBasicMaterial({ color: screenMap ? 0xffffff : screenColor, map: screenMap, toneMapped: false }), 0, 0, 0.0052, { cast: false });
  if (light > 0) { const pl = new THREE.PointLight(0xffc8f0, light, 0.7, 2); pl.position.set(0, 0.04, 0.16); ph.add(pl); }
  h.updateMatrixWorld(true);
  const hb = b['hand_' + hand]; const hp = hb.getWorldPosition(new THREE.Vector3()); const mid = (b['middle_01_' + hand] || hb).getWorldPosition(new THREE.Vector3()); const hd = b.Head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.05, 0));
  ph.position.copy(hp.clone().lerp(mid, 0.75).addScaledVector(up, 0.035)); ph.up.copy(f).add(up).normalize(); ph.lookAt(hd);
  h.parent.add(ph); ph.updateMatrixWorld(true); ph.applyMatrix4(new THREE.Matrix4().copy(hb.matrixWorld).invert()); hb.add(ph);
  ph.userData.screen = screen; return ph;
}
// Becher in die Hand
export function holdCup(h, hand = 'r', color = 0xd8262c) { h.updateMatrixWorld(true); const hb = h.userData.bones['hand_' + hand]; const c = makeCup(color); c.position.copy(hb.getWorldPosition(new THREE.Vector3())).add(new THREE.Vector3(0, 0.02, 0)); h.parent.add(c); c.updateMatrixWorld(true); c.applyMatrix4(new THREE.Matrix4().copy(hb.matrixWorld).invert()); hb.add(c); return c; }
// Figur zu einem Punkt drehen (nur um die Hochachse)
export function faceTo(h, p) { h.rotation.y = Math.atan2(p.x - h.position.x, p.z - h.position.z); h.updateMatrixWorld(true); }
// Kopf leicht zu einem Punkt drehen (max. ca. 60°)
export function lookAt(h, p, k = 0.7) { const b = h.userData.bones; h.updateMatrixWorld(true); const hp = b.Head.getWorldPosition(new THREE.Vector3()); const { f } = axes(h);
  const d = p.clone().sub(hp); const yaw = Math.atan2(d.x, d.z) - Math.atan2(f.x, f.z); const yw = Math.atan2(Math.sin(yaw), Math.cos(yaw)); const pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
  rotBoneWorld(h, b.neck_01, new THREE.Vector3(0, 1, 0), yw * k * 0.4); rotBoneWorld(h, b.Head, new THREE.Vector3(0, 1, 0), yw * k * 0.6);
  const left = new THREE.Vector3(Math.cos(h.rotation.y + yw * k), 0, -Math.sin(h.rotation.y + yw * k)); rotBoneWorld(h, b.Head, left, pitch * k); }

// Sitzen: Becken der Figur (mit Sitz-Animation, z. B. Sitting_Idle_Loop) genau auf einen Sitzpunkt (Weltkoordinaten) setzen
export function sitOn(h, seat, { lift = 0.02 } = {}) { h.updateMatrixWorld(true); const pel = h.userData.bones.pelvis.getWorldPosition(new THREE.Vector3());
  h.position.x += seat.x - pel.x; h.position.z += seat.z - pel.z; h.position.y += seat.y + lift - pel.y; h.updateMatrixWorld(true); }

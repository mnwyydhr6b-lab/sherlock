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

// ---------------------------------------------------------------- Hände (Finger exakt aus der Bind-Pose kalibriert)
// Bind-Pose der UBC-Figuren: Arme waagerecht, Handflächen nach unten. Daraus kennt jede Hand ihre Achsen:
//   pn = Handflächen-Normale (aus der Handfläche heraus), fd = Fingerrichtung, ac = vom kleinen Finger zum Zeigefinger.
// Finger werden absolut zur flachen Bind-Hand gebeugt: curl = [Grundgelenk, Mittelgelenk, Endgelenk] in Radiant (+ = zur Handfläche).
const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];
function handData(h, side) {
  const ud = h.userData; ud._hand = ud._hand || {}; if (ud._hand[side]) return ud._hand[side];
  const b = ud.bones, sk = ud.body.skeleton;
  const BW = (bone) => new THREE.Matrix4().copy(sk.boneInverses[sk.bones.indexOf(bone)]).invert();
  const P = (bone) => new THREE.Vector3().setFromMatrixPosition(BW(bone));
  const QW = (bone) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(BW(bone)));
  const toLocal = (bone, v) => v.clone().applyQuaternion(QW(bone).invert()).normalize();
  const hand = b['hand_' + side], pnB = new THREE.Vector3(0, -1, 0);
  const fdB = P(b['middle_01_' + side]).sub(P(hand)).normalize();
  const acB = P(b['index_01_' + side]).sub(P(b['pinky_01_' + side])).normalize();
  const fingers = {};
  for (const f of FINGERS) { const ph = [1, 2, 3].map(k => b[`${f}_0${k}_${side}`]);
    const restQ = ph.map(bone => { const m = BW(bone.parent).invert().multiply(BW(bone)); const q = new THREE.Quaternion(); m.decompose(new THREE.Vector3(), q, new THREE.Vector3()); return q; });
    const dir = P(ph[1]).sub(P(ph[0])).normalize();
    // Beugeachse: Fingerspitze dreht zur Handfläche; der Daumen dreht zur Handfläche und quer zum kleinen Finger
    const toward = f === 'thumb' ? P(b['pinky_01_' + side]).sub(P(ph[0])).normalize().addScaledVector(pnB, 0.6).normalize() : pnB;
    const axis = new THREE.Vector3().crossVectors(dir, toward).normalize();
    fingers[f] = { ph, restQ, axisL: ph.map(bone => toLocal(bone, axis)), spreadL: toLocal(ph[0], pnB) };
  }
  return (ud._hand[side] = { hand, pnL: toLocal(hand, pnB), fdL: toLocal(hand, fdB), acL: toLocal(hand, acB), fingers });
}
// Achsen einer Hand in Weltkoordinaten (aktuelle Pose)
export function handAxes(h, side = 'r') { const H = handData(h, side); h.updateMatrixWorld(true); const q = H.hand.getWorldQuaternion(new THREE.Quaternion());
  return { wrist: H.hand.getWorldPosition(new THREE.Vector3()), pn: H.pnL.clone().applyQuaternion(q), fd: H.fdL.clone().applyQuaternion(q), ac: H.acL.clone().applyQuaternion(q) }; }
// Einen Finger beugen (absolut zur flachen Hand); spread = Spreizen im Grundgelenk
export function setFinger(h, side, f, curl = [0, 0, 0], spread = 0) { const F = handData(h, side).fingers[f];
  F.ph.forEach((bone, k) => { const q = F.restQ[k].clone(); if (k === 0 && spread) q.multiply(new THREE.Quaternion().setFromAxisAngle(F.spreadL, spread)); q.multiply(new THREE.Quaternion().setFromAxisAngle(F.axisL[k], curl[k] || 0)); bone.quaternion.copy(q); });
  h.updateMatrixWorld(true); }
// Fertige Handhaltungen
export const HAND_POSES = {
  flach:   { thumb: [0, 0, 0], index: [0, 0, 0], middle: [0, 0, 0], ring: [0, 0, 0], pinky: [0, 0, 0] },
  locker:  { thumb: [0.15, 0.2, 0.15], index: [0.2, 0.3, 0.2], middle: [0.28, 0.38, 0.25], ring: [0.34, 0.45, 0.3], pinky: [0.4, 0.5, 0.35] },
  faust:   { thumb: [0.5, 0.6, 0.5], index: [1.45, 1.6, 0.9], middle: [1.5, 1.65, 0.9], ring: [1.5, 1.65, 0.9], pinky: [1.45, 1.6, 0.9] },
  zeigen:  { thumb: [0.5, 0.6, 0.5], index: [0.05, 0.05, 0.02], middle: [1.5, 1.65, 0.9], ring: [1.5, 1.65, 0.9], pinky: [1.45, 1.6, 0.9] },
  daumen:  { thumb: [-0.2, 0, 0], index: [1.45, 1.6, 0.9], middle: [1.5, 1.65, 0.9], ring: [1.5, 1.65, 0.9], pinky: [1.45, 1.6, 0.9] },
  handy:   { thumb: [0.35, 0.25, 0.2], index: [0.1, 1.3, 0.55], middle: [0.12, 1.35, 0.6], ring: [0.16, 1.4, 0.62], pinky: [0.22, 1.45, 0.65] },
};
export function handPose(h, side, name) { const p = typeof name === 'string' ? HAND_POSES[name] : name; for (const f of FINGERS) if (p[f]) setFinger(h, side, f, p[f], p.spread ? p.spread[f] || 0 : 0); }

// EXPERIMENTELL (noch nicht fertig, nicht verwenden): Handy mit echtem Griff – Handfläche zum Gesicht, Finger um den Handyrand.
export function posePhoneGrip(h, { hand = 'r', forward = 0.27, side = 0.0, height = -0.04, neck = 0.16, head = 0.3, turn = -0.12, light = 0.035, screenColor = 0xffc2ee, screenMap = null, twoHands = false, tilt = 0.35, otherHand = 'locker' } = {}) {
  const b = h.userData.bones; const { f, rt, up } = axes(h); const sgn = hand === 'r' ? 1 : -1;
  h.updateMatrixWorld(true);
  const chest = b.spine_03.getWorldPosition(new THREE.Vector3());
  const tgt = chest.clone().addScaledVector(f, forward).addScaledVector(rt, side * sgn).addScaledVector(up, height);
  armIK(h, hand, tgt, new THREE.Vector3(0, -1, 0).addScaledVector(rt, 0.8 * sgn).addScaledVector(f, -0.35));
  const left = rt.clone().negate();
  rotBoneWorld(h, b.neck_01, left, neck); rotBoneWorld(h, b.Head, left, head); rotBoneWorld(h, b.Head, up, turn * sgn);
  // Unterarm + Hand so drehen, dass die Handfläche zu den Augen zeigt (Drehung um die Unterarmachse, halb Unterarm, halb Handgelenk)
  const eye = b.Head.getWorldPosition(new THREE.Vector3()).addScaledVector(up, 0.06).addScaledVector(f, 0.08);
  const lo = b['lowerarm_' + hand], hb = b['hand_' + hand];
  for (let it = 0; it < 2; it++) { h.updateMatrixWorld(true); const W = hb.getWorldPosition(new THREE.Vector3()); const ax = W.clone().sub(lo.getWorldPosition(new THREE.Vector3())).normalize();
    const A = handAxes(h, hand); const want = eye.clone().sub(W).normalize();
    const p1 = A.pn.clone().projectOnPlane(ax).normalize(), p2 = want.clone().projectOnPlane(ax).normalize();
    const ang = Math.atan2(new THREE.Vector3().crossVectors(p1, p2).dot(ax), p1.dot(p2)); rotBoneWorld(h, lo, ax, ang * 0.5); rotBoneWorld(h, hb, ax, ang * 0.5); }
  // Handgelenk etwas abknicken, damit der Bildschirm zu den Augen kippt
  { const A = handAxes(h, hand); const want = eye.clone().sub(A.wrist).normalize(); const axl = A.ac.clone(); const p1 = A.pn.clone().projectOnPlane(axl).normalize(), p2 = want.projectOnPlane(axl).normalize();
    const ang = Math.atan2(new THREE.Vector3().crossVectors(p1, p2).dot(axl), p1.dot(p2)); rotBoneWorld(h, hb, axl, ang * tilt); }
  handPose(h, hand, 'handy');
  if (otherHand && !twoHands) handPose(h, hand === 'r' ? 'l' : 'r', otherHand);
  if (twoHands) { const o = hand === 'r' ? 'l' : 'r'; armIK(h, o, tgt.clone().addScaledVector(rt, -0.1 * sgn).addScaledVector(up, -0.03), new THREE.Vector3(0, -1, 0).addScaledVector(rt, -0.8 * sgn).addScaledVector(f, -0.35)); }
  // Handy aus den Gelenkpositionen platzieren: Rückseite auf Handfläche/Fingern, ferner Rand in der Beuge der Mittelgelenke
  h.updateMatrixWorld(true);
  const A = handAxes(h, hand); const W = A.wrist; const pos = (n) => b[n + '_' + hand].getWorldPosition(new THREE.Vector3());
  const fin = ['index', 'middle', 'ring', 'pinky'];
  const pipFd = fin.reduce((s, n) => s + pos(n + '_02').sub(W).dot(A.fd), 0) / 4;
  const backPn = Math.max(...fin.flatMap(n => [pos(n + '_01'), pos(n + '_02')].map(p => p.sub(W).dot(A.pn)))) + 0.0105;
  const acMid = fin.reduce((s, n) => s + pos(n + '_01').sub(W).dot(A.ac), 0) / 4;
  const PW = 0.072, PH = 0.15, PT = 0.009;
  const center = W.clone().addScaledVector(A.fd, pipFd - 0.0095 - PW / 2).addScaledVector(A.pn, backPn + PT / 2).addScaledVector(A.ac, acMid + 0.012);
  let ph = h.userData.phone;
  if (!ph) { ph = new THREE.Group();
    add(ph, rbox(PW, PH, PT, 0.006), new THREE.MeshPhysicalMaterial({ color: 0x15151a, roughness: 0.25, clearcoat: 1 }), 0, 0, 0);
    ph.userData.screen = add(ph, new THREE.PlaneGeometry(PW - 0.007, PH - 0.01), new THREE.MeshBasicMaterial({ color: screenMap ? 0xffffff : screenColor, map: screenMap, toneMapped: false }), 0, 0, PT / 2 + 0.0004, { cast: false });
    if (light > 0) { const pl = new THREE.PointLight(0xffc8f0, light, 0.7, 2); pl.position.set(0, 0.04, 0.16); ph.add(pl); }
    h.userData.phone = ph; }
  // Lage: Breite entlang der Finger, Höhe vom kleinen Finger zum Zeigefinger, Bildschirm zeigt aus der Handfläche
  const Z = A.pn.clone().normalize(), Y = A.ac.clone().projectOnPlane(Z).normalize(), X = new THREE.Vector3().crossVectors(Y, Z);
  const m = new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(center);
  if (ph.parent !== hb) { if (ph.parent) ph.parent.remove(ph); hb.add(ph); }
  ph.matrixAutoUpdate = true; m.premultiply(new THREE.Matrix4().copy(hb.matrixWorld).invert()); m.decompose(ph.position, ph.quaternion, ph.scale);
  h.updateMatrixWorld(true);
  return ph;
}
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
// Kopf (und etwas Hals) genau zu einem Punkt drehen; k = Anteil (1 = ganz hinschauen)
function headForwardLocal(h) { const body = h.userData.body, b = h.userData.bones; if (h.userData._hf) return h.userData._hf; const i = body.skeleton.bones.indexOf(b.Head);
  const bq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().copy(body.skeleton.boneInverses[i]).invert()); return (h.userData._hf = new THREE.Vector3(0, 0, 1).applyQuaternion(bq.invert()).normalize()); }
function aimBoneAt(h, bone, p, k) { h.updateMatrixWorld(true); const lf = headForwardLocal(h); const fwd = lf.clone().applyQuaternion(b0(h).Head.getWorldQuaternion(new THREE.Quaternion()));
  const dir = p.clone().sub(b0(h).Head.getWorldPosition(new THREE.Vector3())).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(fwd, dir); q.slerp(new THREE.Quaternion(), 1 - k);
  const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()), bq = bone.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pq.invert().multiply(q.multiply(bq))); h.updateMatrixWorld(true); }
const b0 = (h) => h.userData.bones;
export function lookAt(h, p, k = 0.9) { const b = b0(h); aimBoneAt(h, b.neck_01, p, 0.35 * k); aimBoneAt(h, b.Head, p, k); }

// Sitzen: Becken der Figur (mit Sitz-Animation, z. B. Sitting_Idle_Loop) genau auf einen Sitzpunkt (Weltkoordinaten) setzen
export function sitOn(h, seat, { lift = 0.02 } = {}) { h.updateMatrixWorld(true); const pel = h.userData.bones.pelvis.getWorldPosition(new THREE.Vector3());
  h.position.x += seat.x - pel.x; h.position.z += seat.z - pel.z; h.position.y += seat.y + lift - pel.y; h.updateMatrixWorld(true); }

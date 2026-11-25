// kit_block.js – Klötzchen-Figuren: weiche Würfel-Teile auf dem Figuren-Skelett, gezeichnetes Gesicht mit Mimik.
// Alle Teile sind starr an Knochen gehängt (keine Haut, keine Finger, keine Kleidungshülle) -> nichts kann verschwinden oder durchstechen.
// Bewegungen: alle Animationen des Skeletts (UBC-Clips + übertragene Bewegungen aus kit_retarget) funktionieren direkt.
//
//   const du = spawnBlock('du', { x, y, z, ry, anim: 'Idle_Loop' }); scene.add(du);
//   du.userData.blockFace.set('happy', { talk: 0.6, blink: 0 })   // Gesicht
// Bewegungen (Motion-Capture, siehe kit_retarget):
//   await loadBlockMoves();  playMove(du, 'Texting', 2.0)           // Standbild
//   prepMoves(du, ['Texting', 'Talk with gestures']) -> Actor-Segmente mit anim: 'Ara:Texting' usw.; pro Frame syncPhone(du)
import * as THREE from 'three';
import { rbox, std } from './kit_world.js';
import { spawn, CAST } from './kit_cast.js';
import { loadMoves, retarget, showPhone } from './kit_retarget.js';

// Farben/Teile der festen Besetzung im Klötzchen-Stil
export const BLOCK_CAST = {
  du:     { skin: 0xf0c4a0, hair: 0x3a2618, hairStyle: 'short', top: 'hoodie', shirt: 0x2f8a5f, pants: 0x3b62a8, shoes: 0xf4f4f4, eyes: 0x5a3a22 },
  mia:    { skin: 0xf3cfb0, hair: 0xa8482a, hairStyle: 'long', top: 'jacket', shirt: 0xf5c42c, shirt2: 0xffffff, pants: 0x4a6fae, shoes: 0xf4f4f4, eyes: 0x3d7a4a, lashes: true },
  leon:   { skin: 0xf2c9a6, hair: 0xd8b064, hairStyle: 'short', top: 'tee', shirt: 0xf6f6f6, pants: 0x24345a, shoes: 0xffffff, eyes: 0x3a6aa0 },
  jasmin: { skin: 0x8a5a3c, hair: 0x1b1210, hairStyle: 'bun', top: 'tee', shirt: 0xe85aa8, pants: 0x2b2b33, shoes: 0x1a1a1a, eyes: 0x3a2214, lashes: true },
  tarik:  { skin: 0xb98a62, hair: 0x141414, hairStyle: 'buzz', top: 'jacket', shirt: 0x24262b, shirt2: 0xd8d8d8, pants: 0x2a2a2e, shoes: 0xf4f4f4, eyes: 0x2a1a10 },
  ben:    { skin: 0xf0c4a0, hair: 0x5a3a22, hairStyle: 'buzz', top: 'hoodie', shirt: 0xc23a32, pants: 0x2b2b33, shoes: 0x2b2b33, eyes: 0x4a3a2a },
  mama:   { skin: 0xf0c8a8, hair: 0x8a6a3a, hairStyle: 'long', top: 'jacket', shirt: 0xd2c2a2, shirt2: 0xf4efe6, pants: 0x2b2b33, shoes: 0x3a3a3a, eyes: 0x4a3a2a, lashes: true },
  papa:   { skin: 0xeec2a0, hair: 0x7a7a7a, hairStyle: 'short', top: 'shirt', shirt: 0x9ab8d8, pants: 0x2b2b33, shoes: 0x4a3020, eyes: 0x4a3a2a, beard: true },
};

const toy = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45, ...extra });
const shade = (c, k) => { const col = new THREE.Color(c); col.multiplyScalar(k); return col; };

// ---------------------------------------------------------------- Gesicht (Canvas, transparent; Haut kommt vom Würfel)
const FACES = {
  neutral:  { brow: [0, 0], eye: 1, mouth: 'flat' },
  happy:    { brow: [0.05, 0], eye: 0.9, mouth: 'smile' },
  laugh:    { brow: [0.1, 0], eye: 0.35, mouth: 'open_smile' },
  sad:      { brow: [-0.05, 0.35], eye: 0.85, mouth: 'frown', tear: false },
  angry:    { brow: [-0.08, -0.45], eye: 0.8, mouth: 'tight' },
  surprised:{ brow: [0.22, 0], eye: 1.2, mouth: 'o' },
  awkward:  { brow: [0.05, 0.3], eye: 0.95, mouth: 'wobble', blush: 0.7, sweat: true },
  smirk:    { brow: [0.02, -0.12], eye: 0.85, mouth: 'smirk' },
  sideeye:  { brow: [-0.04, -0.15], eye: 0.8, mouth: 'flat_side', look: [0.35, 0] },
  shocked:  { brow: [0.25, 0.1], eye: 1.3, mouth: 'big_o' },
  cool:     { brow: [-0.03, -0.22], eye: 1, lid: 0.42, mouth: 'smirk' }, // lässig/souverän: halb geschlossene Lider, Grinsen (Profilbild „Aura“)
};
export function drawFace(spec, name, { blink = 0, talk = 0, look = null, blush = 0 } = {}) {
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  const F = FACES[name] || FACES.neutral; const lk = look || F.look || [0, 0];
  const ink = '#2a1d18', ex = 0.2 * S, ey = 0.44 * S, er = 0.085 * S;
  // Wangen (Röte)
  const bl = Math.max(blush, F.blush || 0);
  if (bl > 0) for (const sx of [-1, 1]) { const gr = g.createRadialGradient(S / 2 + sx * 0.28 * S, 0.62 * S, 0, S / 2 + sx * 0.28 * S, 0.62 * S, 0.11 * S); gr.addColorStop(0, `rgba(255,70,80,${0.55 * bl})`); gr.addColorStop(1, 'rgba(255,70,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); }
  // Augen
  const open = Math.max(0.06, F.eye * (1 - blink));
  for (const sx of [-1, 1]) { const cx = S / 2 + sx * ex, h = er * Math.min(1.25, open);
    if (open < 0.25 || name === 'laugh') { g.strokeStyle = ink; g.lineWidth = 0.028 * S; g.lineCap = 'round'; g.beginPath(); if (name === 'laugh') g.arc(cx, ey + er * 0.35, er * 0.75, Math.PI * 1.15, Math.PI * 1.85); else { g.moveTo(cx - er * 0.8, ey); g.quadraticCurveTo(cx, ey + er * 0.35, cx + er * 0.8, ey); } g.stroke(); continue; }
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(cx, ey, er * 0.92, h, 0, 0, Math.PI * 2); g.fill();
    const ix = cx + lk[0] * er * 0.45, iy = ey + lk[1] * er * 0.4; g.fillStyle = '#' + new THREE.Color(spec.eyes).getHexString(); g.beginPath(); g.ellipse(ix, iy, er * 0.58, Math.min(h, er * 0.62), 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#120c0a'; g.beginPath(); g.ellipse(ix, iy, er * 0.3, Math.min(h * 0.9, er * 0.34), 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ix - er * 0.22, iy - er * 0.24, er * 0.17, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(ix + er * 0.2, iy + er * 0.18, er * 0.07, 0, Math.PI * 2); g.fill();
    if (F.lid) { // Oberlid: oberen Teil des Auges wegschneiden, Lidkante als Linie, kleiner Glanzpunkt darunter
      const top = ey - h - 2, cut = ey - h + 2 * h * F.lid; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(cx - er * 1.15, top, er * 2.3, cut - top); g.restore();
      const yy = (cut - ey) / h, hw = er * 0.92 * Math.sqrt(Math.max(0, 1 - yy * yy)) + er * 0.1;
      g.strokeStyle = ink; g.lineWidth = 0.032 * S; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - hw, cut + sx * er * 0.05); g.quadraticCurveTo(cx, cut - er * 0.05, cx + hw, cut - sx * er * 0.05); g.stroke();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ix - er * 0.18, cut + er * 0.22, er * 0.12, 0, Math.PI * 2); g.fill(); }
    if (spec.lashes) { g.strokeStyle = ink; g.lineWidth = 0.014 * S; g.beginPath(); g.ellipse(cx, ey, er * 0.95, h * 1.02, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
    if (blink > 0 && blink < 1) { g.fillStyle = 'rgba(0,0,0,0)'; } }
  // Brauen
  const [bUp, bTilt] = F.brow; g.strokeStyle = '#' + shade(spec.hair, 0.8).getHexString(); g.lineWidth = 0.034 * S; g.lineCap = 'round';
  for (const sx of [-1, 1]) { const cx = S / 2 + sx * ex, by = ey - er * 1.55 - bUp * S; const inner = cx - sx * er * 0.75, outer = cx + sx * er * 0.75; const tilt = bTilt * er * 0.9;
    g.beginPath(); g.moveTo(inner, by - tilt); g.quadraticCurveTo(cx, by - er * 0.2, outer, by + tilt * 0.3); g.stroke(); }
  // Mund
  const mx = S / 2, my = 0.7 * S; const mw = 0.13 * S; let m = F.mouth; if (talk > 0.15 && !['o', 'big_o', 'open_smile'].includes(m)) m = talk > 0.55 ? 'talk_big' : 'talk';
  g.lineWidth = 0.028 * S; g.strokeStyle = ink; g.fillStyle = '#5a1a22';
  const openMouth = (w, h, smile = 0) => { g.beginPath(); g.moveTo(mx - w, my - smile * h * 0.3); g.quadraticCurveTo(mx, my + h * (1 + smile), mx + w, my - smile * h * 0.3); g.quadraticCurveTo(mx, my - h * 0.25, mx - w, my - smile * h * 0.3); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(mx, my - h * 0.02, w * 0.62, h * 0.18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e06a78'; g.beginPath(); g.ellipse(mx, my + h * 0.55, w * 0.45, h * 0.28, 0, 0, Math.PI * 2); g.fill(); };
  if (m === 'flat') { g.beginPath(); g.moveTo(mx - mw * 0.55, my); g.lineTo(mx + mw * 0.55, my); g.stroke(); }
  else if (m === 'smirk') { g.beginPath(); g.moveTo(mx - mw * 0.55, my + 0.005 * S); g.quadraticCurveTo(mx + mw * 0.1, my + 0.03 * S, mx + mw * 0.7, my - 0.035 * S); g.stroke(); }
  else if (m === 'flat_side') { g.beginPath(); g.moveTo(mx - mw * 0.4, my + 0.01 * S); g.lineTo(mx + mw * 0.6, my - 0.012 * S); g.stroke(); }
  else if (m === 'smile') { g.beginPath(); g.moveTo(mx - mw * 0.8, my - 0.02 * S); g.quadraticCurveTo(mx, my + 0.08 * S, mx + mw * 0.8, my - 0.02 * S); g.stroke(); }
  else if (m === 'open_smile') openMouth(mw, 0.1 * S, 0.6);
  else if (m === 'frown') { g.beginPath(); g.moveTo(mx - mw * 0.7, my + 0.03 * S); g.quadraticCurveTo(mx, my - 0.05 * S, mx + mw * 0.7, my + 0.03 * S); g.stroke(); }
  else if (m === 'tight') { g.beginPath(); g.moveTo(mx - mw * 0.6, my + 0.01 * S); g.quadraticCurveTo(mx, my - 0.015 * S, mx + mw * 0.6, my + 0.01 * S); g.stroke(); }
  else if (m === 'wobble') { g.beginPath(); g.moveTo(mx - mw * 0.75, my); for (let i = 1; i <= 6; i++) g.lineTo(mx - mw * 0.75 + i * mw * 0.25, my + (i % 2 ? -0.018 : 0.018) * S); g.stroke(); }
  else if (m === 'o') { g.beginPath(); g.ellipse(mx, my + 0.01 * S, mw * 0.32, 0.05 * S, 0, 0, Math.PI * 2); g.fill(); }
  else if (m === 'big_o') { g.beginPath(); g.ellipse(mx, my + 0.02 * S, mw * 0.5, 0.085 * S, 0, 0, Math.PI * 2); g.fill(); }
  else if (m === 'talk') openMouth(mw * 0.6, 0.06 * S, 0.1);
  else if (m === 'talk_big') openMouth(mw * 0.75, 0.1 * S, 0.15);
  // Schweißtropfen (peinlich)
  if (F.sweat) { g.fillStyle = 'rgba(140,200,255,0.95)'; g.beginPath(); const sx = S * 0.86, sy = S * 0.2; g.moveTo(sx, sy); g.quadraticCurveTo(sx + 0.05 * S, sy + 0.1 * S, sx, sy + 0.12 * S); g.quadraticCurveTo(sx - 0.05 * S, sy + 0.1 * S, sx, sy); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ---------------------------------------------------------------- Figur bauen
export function spawnBlock(name, o = {}) {
  const spec = { ...BLOCK_CAST[name], ...(o.spec || {}) };
  const h = spawn(name, { anim: o.anim || 'Idle_Loop', time: o.time ?? 0.5, x: o.x ?? 0, y: o.y ?? 0, z: o.z ?? 0, ry: o.ry ?? 0 });
  const ud = h.userData, b = ud.bones, sk = ud.body.skeleton;
  h.traverse(m => { if (m.isMesh && !m.userData.block) m.visible = false; });
  // in Bind-Pose (T-Pose) bauen, Teile starr an Knochen hängen
  const saved = new Map(); h.traverse(x => { if (x.isBone) saved.set(x, [x.position.clone(), x.quaternion.clone(), x.scale.clone()]); });
  const saveP = h.position.clone(), saveQ = h.quaternion.clone(); h.position.set(0, 0, 0); h.quaternion.identity();
  ud.mixer.stopAllAction(); sk.pose(); h.updateMatrixWorld(true);
  const P = (n) => b[n].getWorldPosition(new THREE.Vector3());
  const parts = []; ud.headBindQ = b.Head.getWorldQuaternion(new THREE.Quaternion());
  const put = (bone, geo, mat, pos, { rot = null, cast = true } = {}) => { const m = new THREE.Mesh(geo, mat); m.userData.block = true; m.castShadow = cast; m.receiveShadow = true; m.position.copy(pos); if (rot) m.quaternion.copy(rot);
    m.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(b[bone].matrixWorld).invert(); m.applyMatrix4(inv); b[bone].add(m); parts.push(m); return m; };
  const along = (a, c) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize());
  const seg = (bone, a, c, w, d, mat, ext0 = 0, ext1 = 0) => { const dir = c.clone().sub(a).normalize(); const a2 = a.clone().addScaledVector(dir, -ext0), c2 = c.clone().addScaledVector(dir, ext1); const len = a2.distanceTo(c2);
    return put(bone, rbox(w, len, d, Math.min(w, d) * 0.22, 3), mat, a2.clone().lerp(c2, 0.5), { rot: along(a2, c2) }); };
  const female = CAST[name] && CAST[name].sex === 'female';
  const mSkin = toy(spec.skin, { roughness: 0.55, clearcoat: 0.15 }), mTop = toy(spec.shirt), mTop2 = toy(shade(spec.shirt, 0.82)), mPants = toy(spec.pants, { roughness: 0.7, clearcoat: 0.1 }), mShoe = toy(spec.shoes), mSole = toy(0xdedede), mHair = toy(spec.hair, { roughness: 0.6 }), mHair2 = toy(shade(spec.hair, 0.82), { roughness: 0.6 });
  // Kopf: großer weicher Würfel, Gesicht als Folie vorne
  const head = P('Head'), HS = female ? 0.27 : 0.285, NECK = o.neck ?? 0.05; const hc = head.clone().add(new THREE.Vector3(0, HS * 0.5 + 0.02 + NECK, 0.025)); // Kopf sitzt auf einem sichtbaren Hals (seit 24.11.)
  const headM = put('Head', rbox(HS, HS, HS * 0.94, HS * 0.14, 4), mSkin, hc);
  const faceMat = new THREE.MeshStandardMaterial({ map: drawFace(spec, 'neutral'), transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = put('Head', new THREE.PlaneGeometry(HS * 0.9, HS * 0.9), faceMat, hc.clone().add(new THREE.Vector3(0, 0, HS * 0.47 + 0.0015)), { cast: false });
  // Haare
  const top = hc.y + HS / 2, back = hc.z - HS * 0.47;
  const hb = (w, hh, d, x, y, z, m = mHair) => put('Head', rbox(w, hh, d, Math.min(w, hh, d) * 0.3, 3), m, new THREE.Vector3(hc.x + x, y, hc.z + z));
  if (spec.hairStyle === 'short') { hb(HS * 1.04, HS * 0.24, HS * 1.0, 0, top + HS * 0.0, -HS * 0.02); // Oberkopf mit etwas Volumen
    // Pony aus drei Strähnen (verschieden hoch, leicht schräg) statt einer Kante
    [[-0.3, 0.17, 0.0], [0.02, 0.21, 0.12], [0.33, 0.15, -0.1]].forEach(([x, hh, rz]) => put('Head', rbox(HS * 0.38, HS * hh, HS * 0.2, HS * 0.06, 3), mHair2, new THREE.Vector3(hc.x + x * HS, top - HS * 0.06 - hh * HS * 0.25, hc.z + HS * 0.42), { rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, 0, rz)) }));
    hb(HS * 1.05, HS * 0.46, HS * 0.13, 0, top - HS * 0.24, -HS * 0.47); hb(HS * 0.1, HS * 0.34, HS * 0.62, -HS * 0.52, top - HS * 0.2, -HS * 0.1, mHair2); hb(HS * 0.1, HS * 0.34, HS * 0.62, HS * 0.52, top - HS * 0.2, -HS * 0.1, mHair2); }
  if (spec.hairStyle === 'buzz') { hb(HS * 1.03, HS * 0.1, HS * 0.98, 0, top + HS * 0.0, 0); hb(HS * 1.04, HS * 0.32, HS * 0.08, 0, top - HS * 0.18, -HS * 0.47); }
  if (spec.hairStyle === 'long') { hb(HS * 1.08, HS * 0.2, HS * 1.04, 0, top - HS * 0.02, 0); hb(HS * 1.12, HS * 1.25, HS * 0.16, 0, top - HS * 0.62, -HS * 0.5); hb(HS * 0.12, HS * 1.0, HS * 0.7, -HS * 0.55, top - HS * 0.5, -HS * 0.12, mHair2); hb(HS * 0.12, HS * 1.0, HS * 0.7, HS * 0.55, top - HS * 0.5, -HS * 0.12, mHair2); hb(HS * 0.62, HS * 0.13, HS * 0.2, -HS * 0.18, top - HS * 0.1, HS * 0.42, mHair2); }
  if (spec.hairStyle === 'bun') { hb(HS * 1.06, HS * 0.16, HS * 1.02, 0, top - HS * 0.02, 0); hb(HS * 0.42, HS * 0.36, HS * 0.42, 0, top + HS * 0.16, -HS * 0.18, mHair2); hb(HS * 1.06, HS * 0.42, HS * 0.1, 0, top - HS * 0.24, -HS * 0.47); }
  if (spec.beard) hb(HS * 1.0, HS * 0.26, HS * 0.1, 0, hc.y - HS * 0.38, HS * 0.46, mHair2);
  // Rumpf (Oberteil) am oberen Rücken, Hüfte an der Hüfte
  const sp1 = P('spine_01'), nk = P('neck_01'), pel = P('pelvis');
  const TW = female ? 0.36 : 0.42, TD = female ? 0.21 : 0.23;
  const tTop = nk.y + 0.01, tBot = pel.y + 0.02; const tc = new THREE.Vector3(0, (tTop + tBot) / 2, (sp1.z + nk.z) / 2 + 0.01);
  put('spine_02', rbox(TW, tTop - tBot, TD, 0.05, 3), mTop, tc);
  put('pelvis', rbox(TW * 0.94, 0.17, TD * 0.96, 0.045, 3), mPants, new THREE.Vector3(0, pel.y - 0.04, tc.z));
  // Hals: Haut-Block vom Oberteil bis unter den Kopf (hängt am Halsknochen, biegt mit)
  { const nb = hc.y - HS / 2 + 0.03, nt = tTop - 0.03; const nw = female ? 0.105 : 0.12; put('neck_01', rbox(nw, nb - nt, nw * 0.92, 0.03, 3), mSkin, new THREE.Vector3(0, (nb + nt) / 2, hc.z - 0.035)); }
  // Oberteil-Details
  const fz = tc.z + TD / 2;
  if (spec.top === 'hoodie') { put('spine_03', rbox(TW * 0.82, 0.1, 0.14, 0.045, 3), mTop2, new THREE.Vector3(0, tTop - 0.01, tc.z - TD * 0.42)); // Kapuze
    put('spine_02', rbox(TW * 0.56, 0.12, 0.02, 0.02, 2), mTop2, new THREE.Vector3(0, tBot + 0.1, fz + 0.004)); // Bauchtasche
    for (const sx of [-1, 1]) put('spine_03', rbox(0.016, 0.13, 0.016, 0.006, 2), toy(0xf4f4f4), new THREE.Vector3(sx * 0.05, tTop - 0.1, fz + 0.012)).userData.povHide = true; } // Kordeln: in der Ego-Perspektive zu nah an der Kamera
  if (spec.top === 'jacket') { put('spine_02', rbox(0.014, tTop - tBot - 0.02, 0.012, 0.005, 2), toy(shade(spec.shirt, 0.55)), new THREE.Vector3(0, tc.y, fz + 0.003));
    for (const sx of [-1, 1]) put('spine_03', rbox(0.12, 0.08, 0.05, 0.02, 2), toy(shade(spec.shirt, 1.05)), new THREE.Vector3(sx * 0.09, tTop - 0.02, fz - 0.01), { rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, sx * 0.4)) }); }
  if (spec.top === 'shirt') { put('spine_02', rbox(0.012, tTop - tBot - 0.04, 0.012, 0.005, 2), toy(0xffffff), new THREE.Vector3(0, tc.y, fz + 0.003)); }
  if (spec.top === 'tee') { put('spine_03', rbox(0.12, 0.02, 0.02, 0.008, 2), toy(shade(spec.shirt, 0.85)), new THREE.Vector3(0, tTop - 0.015, fz)); }
  // Arme: Oberarm (Ärmel), Unterarm (Ärmel, beim T-Shirt Haut), Hand (Fäustling)
  const short = spec.top === 'tee';
  for (const s of ['l', 'r']) { const sh = P('upperarm_' + s), el = P('lowerarm_' + s), wr = P('hand_' + s), mid = P('middle_01_' + s);
    seg('upperarm_' + s, sh, el, 0.12, 0.12, mTop, 0.05, 0.02);
    seg('lowerarm_' + s, el, wr, 0.11, 0.11, short ? mSkin : mTop, 0.01, -0.005);
    if (!short) seg('lowerarm_' + s, wr.clone().lerp(el, 0.12), wr, 0.118, 0.118, mTop2, 0, 0.004); // Bündchen
    const hd = mid.clone().sub(wr).normalize(); seg('hand_' + s, wr, wr.clone().addScaledVector(hd, 0.1), 0.085, 0.1, mSkin, -0.004, 0); // Fäustling (flach wie eine Hand)
    const th = P('thumb_02_' + s); seg('hand_' + s, wr.clone().addScaledVector(hd, 0.03), th, 0.035, 0.035, mSkin, 0, 0.01); }
  // Beine + Schuhe
  for (const s of ['l', 'r']) { const hp = P('thigh_' + s), kn = P('calf_' + s), an = P('foot_' + s), ball = P('ball_' + s);
    seg('thigh_' + s, hp, kn, 0.15, 0.16, mPants, 0.04, 0.02); seg('calf_' + s, kn, an, 0.135, 0.14, mPants, 0.02, -0.01);
    const sc = new THREE.Vector3((an.x + ball.x) / 2, 0.055, (an.z + ball.z) / 2 + 0.02);
    put('foot_' + s, rbox(0.13, 0.09, 0.27, 0.03, 3), mShoe, sc); put('foot_' + s, rbox(0.134, 0.025, 0.275, 0.01, 2), mSole, sc.clone().setY(0.014)); }
  // Pose wiederherstellen
  for (const [x, [p, q, s]] of saved) { x.position.copy(p); x.quaternion.copy(q); x.scale.copy(s); }
  h.position.copy(saveP); h.quaternion.copy(saveQ); h.updateMatrixWorld(true);
  if (o.anim) { const clip = ud.clips.find(c => c.name === o.anim); if (clip) { const a = ud.mixer.clipAction(clip); a.play(); ud.mixer.setTime(o.time ?? 0.5); } }
  // Gesicht steuern
  const cache = new Map();
  ud.blockFace = { set(name = 'neutral', opt = {}) { const key = [name, (opt.blink || 0) > 0.5 ? 1 : 0, Math.round((opt.talk || 0) * 3), opt.look ? opt.look.join(',') : '', Math.round((opt.blush || 0) * 4)].join('|');
    let t = cache.get(key); if (!t) { t = drawFace(spec, name, { ...opt, blink: (opt.blink || 0) > 0.5 ? 1 : 0, talk: Math.round((opt.talk || 0) * 3) / 3, blush: opt.blush || 0 }); cache.set(key, t); }
    if (faceMat.map !== t) { faceMat.map = t; faceMat.needsUpdate = true; } } };
  ud.blockParts = parts; ud.blockSpec = spec; ud.eyeLocal = new THREE.Vector3(0, hc.y + 0.01, hc.z + HS * 0.3);
  // Kompatibilität: alter Gesichts-Aufruf (face.expr / face.set) steuert das gezeichnete Gesicht
  let cur = 'neutral', curBlink = 0, curTalk = 0;
  ud.face = { expr(name, k = 1, extra = {}) { cur = FACES[name] ? name : 'neutral'; curTalk = extra.jawOpen || 0; curBlink = extra.blink || 0; ud.blockFace.set(cur, { talk: curTalk, blink: curBlink }); return ud.face; },
    set(vals = {}) { if ('jawOpen' in vals) curTalk = vals.jawOpen; if ('blink' in vals) curBlink = vals.blink; ud.blockFace.set(cur, { talk: curTalk, blink: curBlink }); return ud.face; },
    reset() { curTalk = 0; curBlink = 0; ud.blockFace.set(cur); return ud.face; } };
  return h;
}

// ---------------------------------------------------------------- Bewegungen (übertragene Motion-Capture-Clips)
let MOVES = null;
export async function loadBlockMoves() { if (!MOVES) MOVES = { m: await loadMoves('m'), f: await loadMoves('f') }; return MOVES; }
// Clips für eine Figur vorbereiten (danach im Actor als anim: 'Ara:<Name>' nutzbar). Namen: siehe make_moves.sh / LOOK_BIBEL.
export function prepMoves(h, names) { if (!MOVES) throw new Error('zuerst await loadBlockMoves()'); const lib = CAST[h.userData.castName] && CAST[h.userData.castName].sex === 'female' ? MOVES.f : MOVES.m; return names.map(n => retarget(h, lib, n)); }
// Standbild: Bewegung zum Zeitpunkt t zeigen
export function playMove(h, name, t = 1) { const [c] = prepMoves(h, [name]); const mx = h.userData.mixer; mx.stopAllAction(); mx.clipAction(c).play(); mx.setTime(t); h.userData.applyBuild(); showPhone(h, !!c.userData.phone); h.updateMatrixWorld(true); return c; }
// Video: Handy nur zeigen, solange eine Handy-Bewegung (Texting, Phone call) überwiegt – jedes Frame nach actor.update(t) aufrufen
export function syncPhone(h) { let on = false; for (const a of h.userData.mixer._actions) { const c = a.getClip(); if (c.userData && c.userData.phone && a.getEffectiveWeight() > 0.5) on = true; } showPhone(h, on); }

// ---------------------------------------------------------------- Ego-Perspektive (die Serie wird aus der Sicht von „Du“ erzählt)
// Kopf, Haare und Gesicht von „Du“ ausblenden (der Rest – Hoodie, Arme, Hände – bleibt im Bild, wenn man nach unten schaut)
export function povHide(h, on = true, { body = false } = {}) { const head = h.userData.bones.Head; head.traverse(o => { if (o.isMesh && o.userData.block) o.visible = !on; }); h.traverse(o => { if (o.isMesh && o.userData.povHide) o.visible = !on; });
  // body: true -> auch Rumpf, Hüfte und Beine ausblenden (wie in Ego-Spielen: nur Arme und Hände sichtbar), z. B. beim Blick aufs Handy
  for (const o of h.userData.blockParts || []) { const bn = o.parent && o.parent.name || ''; if (/^(spine_0[1-3]|pelvis|thigh_|calf_|foot_|ball_)/.test(bn)) o.visible = on && body ? false : !o.userData.povHide || !on; } }
// Blick von „Du“: Augenpunkt + Richtung. Kopf-Modus folgt dem Kopf (Animation), ruhiger Modus nutzt Körperposition + Blickrichtung des Körpers.
export function povPose(h, { forward = 0.11, up = 0.17, pitch = 0, steady = false, bob = 0, t = 0 } = {}) {
  h.updateMatrixWorld(true);
  if (steady) { const eye = h.localToWorld(h.userData.eyeLocal.clone()); eye.y += bob * Math.sin(t * Math.PI * 2 * 1.7);
    const ry = h.rotation.y; const dir = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)); dir.y = Math.sin(pitch); return { eye, dir: dir.normalize() }; }
  const hb = h.userData.bones.Head; const q = hb.getWorldQuaternion(new THREE.Quaternion()).multiply(h.userData.headBindQ.clone().invert());
  const f = new THREE.Vector3(0, 0, 1).applyQuaternion(q), u = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
  const eye = hb.getWorldPosition(new THREE.Vector3()).addScaledVector(u, up).addScaledVector(f, forward);
  const dir = f.clone(); if (pitch) dir.applyAxisAngle(new THREE.Vector3().crossVectors(f, u).normalize(), pitch); return { eye, dir: dir.normalize() };
}
// Kamera setzen (Blick von „Du“). look = Weltpunkt, k = Anteil zum Punkt hin.
export function povCamera(stage, h, { look = null, k = 0, fov = 64, ...o } = {}) {
  const { eye, dir } = povPose(h, o); if (look && k > 0) dir.lerp(look.clone().sub(eye).normalize(), k).normalize();
  const cam = stage.camera; cam.position.copy(eye); cam.up.set(0, 1, 0); cam.lookAt(eye.clone().add(dir)); cam.fov = fov; cam.near = 0.03; cam.updateProjectionMatrix();
  return eye;
}

// Handy in der Ego-Perspektive (wie in Spielen): hochkant vor der Kamera, Bildschirm zu dir, deine Klötzchen-Hände halten es von unten.
// const ph = povPhoneRig(stage, du, { screen: canvasTextur }); pro Frame: ph.set(k)  (k 0 = unten aus dem Bild, 1 = vor dir)
export function povPhoneRig(stage, h, { screen = null, screenColor = 0x9ad0ff, tilt = -0.32 } = {}) {
  const spec = h.userData.blockSpec, cam = stage.camera; if (!cam.parent) stage.scene.add(cam);
  const g = new THREE.Group(); g.name = 'PovPhone'; const ph = new THREE.Group(); ph.rotation.x = tilt; g.add(ph);
  const mk = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; return m; };
  ph.add(mk(rbox(0.074, 0.152, 0.01, 0.009, 3), new THREE.MeshPhysicalMaterial({ color: 0x141418, roughness: 0.28, clearcoat: 1 }), 0, 0, 0));
  // Bildschirm knapp unter der Leucht-Schwelle des Bloom (sonst bekommt die Schrift einen Schein und wird unscharf)
  const scrM = new THREE.MeshBasicMaterial({ color: screen ? 0xffffff : screenColor, map: screen, toneMapped: false }); if (screen) scrM.color.setScalar(0.8);
  const scr = mk(new THREE.PlaneGeometry(0.066, 0.142), scrM, 0, 0, 0.0052); ph.add(scr);
  const skin = toy(shade(spec.skin, 0.8), { clearcoat: 0.1 }), sleeve = toy(spec.shirt), cuff = toy(shade(spec.shirt, 0.82));
  // linke Hand hält das Handy von hinten unten, rechte Hand von rechts, Daumen am Bildschirm
  ph.add(mk(rbox(0.09, 0.075, 0.045, 0.014, 3), skin, -0.012, -0.075, -0.028, 0.25, 0, 0.18));
  ph.add(mk(rbox(0.024, 0.05, 0.026, 0.009, 2), skin, -0.047, -0.058, 0.002, 0, 0, -0.45));
  ph.add(mk(rbox(0.065, 0.08, 0.048, 0.014, 3), skin, 0.06, -0.075, -0.014, 0.1, 0, -0.25));
  ph.add(mk(rbox(0.022, 0.05, 0.024, 0.008, 2), skin, 0.036, -0.052, 0.01, 0.15, 0, 0.6));
  // Ärmel laufen nach unten aus dem Bild
  ph.add(mk(rbox(0.11, 0.3, 0.11, 0.025, 3), sleeve, -0.07, -0.26, -0.06, 0.55, 0, 0.32)); ph.add(mk(rbox(0.118, 0.04, 0.118, 0.015, 2), cuff, -0.03, -0.125, -0.045, 0.55, 0, 0.32));
  ph.add(mk(rbox(0.11, 0.3, 0.11, 0.025, 3), sleeve, 0.12, -0.25, -0.05, 0.5, 0, -0.42)); ph.add(mk(rbox(0.118, 0.04, 0.118, 0.015, 2), cuff, 0.085, -0.115, -0.035, 0.5, 0, -0.42));
  const glow = new THREE.PointLight(0xffc8e8, 0.025, 0.5, 2); glow.position.set(0, 0.02, 0.1); ph.add(glow);
  cam.add(g); g.visible = false;
  const down = new THREE.Vector3(0.02, -0.5, -0.33), up = new THREE.Vector3(0.0, -0.085, -0.33);
  const near = new THREE.Vector3(0.0, -0.048, -0.245); // zum Lesen näher an die Augen (Chats)
  return { group: g, screen: scr,
    // neuen Bildschirm-Inhalt zeigen (z. B. chatTex mit einer Nachricht mehr, sobald sie im Video auftaucht)
    setScreen(t) { scrM.map = t; scrM.color.setScalar(0.8); scrM.needsUpdate = true; },
    set(k, zoom = 0) { g.visible = k > 0.005; const s = k * k * (3 - 2 * k), z = zoom * zoom * (3 - 2 * zoom); g.position.lerpVectors(down, up, s).lerp(near, z * s); g.rotation.z = (1 - s) * 0.18; } };
}
// Rechte Hand in der Ego-Perspektive (wie povPhoneRig an der Kamera): winken oder Becher halten/anstoßen.
// const hd = povHandRig(stage, du, { cup: true }); pro Frame hd.set(k, { wave: t })  (k 0 = unten aus dem Bild, 1 = oben; wave: Zeit -> Winken)
export function povHandRig(stage, h, { cup = false, cupColor = 0xd8262c } = {}) {
  const spec = h.userData.blockSpec, cam = stage.camera; if (!cam.parent) stage.scene.add(cam);
  const g = new THREE.Group(); g.name = 'PovHand'; const arm = new THREE.Group(); g.add(arm);
  const mk = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; arm.add(m); return m; };
  const skin = toy(shade(spec.skin, 0.85), { clearcoat: 0.1 }), sleeve = toy(spec.shirt), cuff = toy(shade(spec.shirt, 0.82));
  if (cup) { mk(rbox(0.07, 0.075, 0.07, 0.016, 3), skin, 0, 0, 0); mk(rbox(0.024, 0.045, 0.026, 0.009, 2), skin, -0.04, 0.01, 0.01, 0, 0, 0.3); // Faust um den Becher, Daumen
    const cm = std(cupColor, 0.4, 0, { side: THREE.DoubleSide }); mk(new THREE.CylinderGeometry(0.047, 0.034, 0.125, 18, 1, true), cm, 0, 0.035, 0); mk(new THREE.TorusGeometry(0.047, 0.004, 6, 22), std(0xffffff, 0.4), 0, 0.097, 0, Math.PI / 2);
    mk(new THREE.CircleGeometry(0.045, 18), std(0xd8b040, 0.3, 0, { emissive: 0x3a2a08, emissiveIntensity: 0.3 }), 0, 0.075, 0, -Math.PI / 2); } // Getränk
  else { mk(rbox(0.085, 0.1, 0.05, 0.016, 3), skin, 0, 0.02, 0); mk(rbox(0.024, 0.05, 0.026, 0.009, 2), skin, -0.052, 0.008, 0.004, 0, 0, 0.5); } // offene Klötzchen-Hand (Handrücken zu dir)
  mk(rbox(0.1, 0.34, 0.1, 0.025, 3), sleeve, 0.02, -0.21, 0.03, 0.15, 0, -0.12); mk(rbox(0.108, 0.04, 0.108, 0.015, 2), cuff, 0.006, -0.055, 0.008, 0.15, 0, -0.12);
  cam.add(g); g.visible = false;
  const down = cup ? new THREE.Vector3(0.09, -0.42, -0.36) : new THREE.Vector3(0.16, -0.55, -0.56), up = cup ? new THREE.Vector3(0.085, -0.15, -0.48) : new THREE.Vector3(0.112, -0.085, -0.56);
  const toast = new THREE.Vector3(0.075, -0.1, -0.56);
  return { group: g, set(k, { wave = null, raise = 0 } = {}) { g.visible = k > 0.005; const s = k * k * (3 - 2 * k), r = raise * raise * (3 - 2 * raise); g.position.lerpVectors(down, up, s).lerp(toast, r * s);
    arm.rotation.set(-0.15 - 0.2 * r, 0, wave !== null ? Math.sin(wave * 11) * 0.22 * s : 0.05); } };
}
// Bildschirm-Inhalt: Chat (Messenger, dunkel). msgs: [{ me, text, time }], seen: 'Gelesen 22:14', typing: true = „schreibt …“-Blase.
// Große Schrift, damit man es im Video lesen kann. Gibt eine CanvasTexture zurück (.image = Canvas, auch für 2D-Einblendungen nutzbar).
export function chatTex({ name = 'Mia', status = 'online', avatar = 0xa8482a, clock = '22:14', msgs = [], seen = '', typing = false } = {}) {
  const K = 2, W = 330, H = 710, c = document.createElement('canvas'); c.width = W * K; c.height = H * K; const g = c.getContext('2d'); g.scale(K, K);
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#12161f'); bg.addColorStop(1, '#0b0e14'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#e8eaf0'; g.font = '600 15px Inter, sans-serif'; g.textBaseline = 'middle'; g.fillText(clock, 22, 18); rr(W - 46, 11, 26, 13, 3); g.strokeStyle = '#e8eaf0'; g.lineWidth = 1.5; g.stroke(); g.fillRect(W - 44, 13, 17, 9);
  g.fillStyle = '#171c27'; g.fillRect(0, 34, W, 66); g.fillStyle = '#9aa3b5'; g.font = '300 34px Inter, sans-serif'; g.fillText('‹', 12, 66);
  const av = '#' + new THREE.Color(avatar).getHexString(); g.fillStyle = av; g.beginPath(); g.arc(56, 67, 20, 0, 6.29); g.fill(); g.fillStyle = '#fff'; g.font = '700 19px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(name[0], 56, 68); g.textAlign = 'left';
  g.fillStyle = '#f2f4f8'; g.font = '700 21px Inter, sans-serif'; g.fillText(name, 86, 58); g.fillStyle = status === 'online' ? '#5fd38a' : '#8a93a6'; g.font = '500 14px Inter, sans-serif'; g.fillText(status, 86, 81);
  g.fillStyle = '#232a38'; rr(W / 2 - 34, 116, 68, 24, 12); g.fill(); g.fillStyle = '#aab3c5'; g.font = '600 13px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('Heute', W / 2, 128); g.textAlign = 'left';
  let y = 158; const maxW = 230;
  for (const m of msgs) { g.font = '600 27px Inter, sans-serif'; const tw = Math.min(maxW, g.measureText(m.text).width); const bw = tw + 30 + 58, bh = 50; const x = m.me ? W - 14 - bw : 14;
    g.fillStyle = m.me ? '#1f8a5f' : '#2a3140'; rr(x, y, bw, bh, 18); g.fill();
    g.fillStyle = '#ffffff'; g.fillText(m.text, x + 15, y + bh / 2 + 1, maxW);
    g.fillStyle = m.me ? 'rgba(255,255,255,0.75)' : '#9aa3b5'; g.font = '500 12px Inter, sans-serif'; g.fillText(m.time || '', x + bw - (m.me ? 56 : 44), y + bh - 13);
    if (m.me) { g.strokeStyle = seen ? '#6cc8ff' : 'rgba(255,255,255,0.75)'; g.lineWidth = 1.8; g.lineCap = 'round'; for (const dx of [0, 5]) { g.beginPath(); g.moveTo(x + bw - 22 + dx, y + bh - 13); g.lineTo(x + bw - 18 + dx, y + bh - 9); g.lineTo(x + bw - 11 + dx, y + bh - 18); g.stroke(); } }
    y += bh + 12; }
  if (seen) { g.fillStyle = '#8f98ab'; g.font = '600 16px Inter, sans-serif'; g.textAlign = 'right'; g.fillText(seen, W - 18, y + 6); g.textAlign = 'left'; y += 30; }
  if (typing) { g.fillStyle = '#2a3140'; rr(14, y, 74, 40, 18); g.fill(); g.fillStyle = '#c3cad8'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(35 + i * 16, y + 20, 4.5, 0, 6.29); g.fill(); } }
  g.fillStyle = '#171c27'; g.fillRect(0, H - 70, W, 70); g.fillStyle = '#232a38'; rr(14, H - 56, W - 78, 42, 21); g.fill(); g.fillStyle = '#7d869a'; g.font = '500 16px Inter, sans-serif'; g.fillText('Nachricht', 30, H - 35);
  g.fillStyle = '#1f8a5f'; g.beginPath(); g.arc(W - 36, H - 35, 21, 0, 6.29); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W - 44, H - 44); g.lineTo(W - 26, H - 35); g.lineTo(W - 44, H - 26); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// Bildschirm-Inhalt: Story von Leon (Party heute), für Handy-Szenen
export function partyStoryTex() {
  const c = document.createElement('canvas'); c.width = 330; c.height = 710; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 710); bg.addColorStop(0, '#2a1a5e'); bg.addColorStop(0.55, '#a03a9a'); bg.addColorStop(1, '#ff7aa8'); g.fillStyle = bg; g.fillRect(0, 0, 330, 710);
  for (let i = 0; i < 40; i++) { g.fillStyle = `hsla(${(i * 47) % 360},90%,70%,0.8)`; g.fillRect((i * 83) % 330, (i * 131) % 710, 8, 4); }
  g.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 3; i++) g.fillRect(14 + i * 103, 14, 97, 4);
  g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(40, 52, 18, 0, 6.28); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 20px Inter, sans-serif'; g.textBaseline = 'middle'; g.fillText('leon_07', 68, 52);
  g.textAlign = 'center'; g.font = '800 54px Inter, sans-serif'; g.fillText('PARTY', 165, 300); g.fillText('HEUTE', 165, 360); g.font = 'bold 26px Inter, sans-serif'; g.fillText('Lindenweg 7 · ab 21 Uhr', 165, 420);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(20, 640, 290, 46); g.fillStyle = 'rgba(255,255,255,0.8)'; g.font = '20px Inter, sans-serif'; g.fillText('Nachricht senden …', 165, 664);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

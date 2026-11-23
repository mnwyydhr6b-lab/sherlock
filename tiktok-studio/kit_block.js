// kit_block.js – Klötzchen-Figuren: weiche Würfel-Teile auf dem Figuren-Skelett, gezeichnetes Gesicht mit Mimik.
// Alle Teile sind starr an Knochen gehängt (keine Haut, keine Finger, keine Kleidungshülle) -> nichts kann verschwinden oder durchstechen.
// Bewegungen: alle Animationen des Skeletts (UBC-Clips + übertragene Bewegungen aus kit_retarget) funktionieren direkt.
//
//   const du = spawnBlock('du', { x, y, z, ry, anim: 'Idle_Loop' }); scene.add(du);
//   du.userData.blockFace.set('happy', { talk: 0.6, blink: 0 })   // Gesicht
//   du.userData.blush(0.8)                                         // rot werden (peinlich)
import * as THREE from 'three';
import { rbox } from './kit_world.js';
import { spawn, CAST } from './kit_cast.js';

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
  sideeye:  { brow: [-0.04, -0.15], eye: 0.8, mouth: 'flat_side', look: [0.35, 0] },
  shocked:  { brow: [0.25, 0.1], eye: 1.3, mouth: 'big_o' },
};
function drawFace(spec, name, { blink = 0, talk = 0, look = null, blush = 0 } = {}) {
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
  const parts = [];
  const put = (bone, geo, mat, pos, { rot = null, cast = true } = {}) => { const m = new THREE.Mesh(geo, mat); m.userData.block = true; m.castShadow = cast; m.receiveShadow = true; m.position.copy(pos); if (rot) m.quaternion.copy(rot);
    m.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(b[bone].matrixWorld).invert(); m.applyMatrix4(inv); b[bone].add(m); parts.push(m); return m; };
  const along = (a, c) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.clone().sub(a).normalize());
  const seg = (bone, a, c, w, d, mat, ext0 = 0, ext1 = 0) => { const dir = c.clone().sub(a).normalize(); const a2 = a.clone().addScaledVector(dir, -ext0), c2 = c.clone().addScaledVector(dir, ext1); const len = a2.distanceTo(c2);
    return put(bone, rbox(w, len, d, Math.min(w, d) * 0.22, 3), mat, a2.clone().lerp(c2, 0.5), { rot: along(a2, c2) }); };
  const female = CAST[name] && CAST[name].sex === 'female';
  const mSkin = toy(spec.skin, { roughness: 0.55, clearcoat: 0.15 }), mTop = toy(spec.shirt), mTop2 = toy(shade(spec.shirt, 0.82)), mPants = toy(spec.pants, { roughness: 0.7, clearcoat: 0.1 }), mShoe = toy(spec.shoes), mSole = toy(0xdedede), mHair = toy(spec.hair, { roughness: 0.6 }), mHair2 = toy(shade(spec.hair, 0.82), { roughness: 0.6 });
  // Kopf: großer weicher Würfel, Gesicht als Folie vorne
  const head = P('Head'), HS = female ? 0.27 : 0.285; const hc = head.clone().add(new THREE.Vector3(0, HS * 0.5 + 0.02, 0.025));
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
  // Oberteil-Details
  const fz = tc.z + TD / 2;
  if (spec.top === 'hoodie') { put('spine_03', rbox(TW * 0.82, 0.1, 0.14, 0.045, 3), mTop2, new THREE.Vector3(0, tTop - 0.01, tc.z - TD * 0.42)); // Kapuze
    put('spine_02', rbox(TW * 0.56, 0.12, 0.02, 0.02, 2), mTop2, new THREE.Vector3(0, tBot + 0.1, fz + 0.004)); // Bauchtasche
    for (const sx of [-1, 1]) put('spine_03', rbox(0.016, 0.13, 0.016, 0.006, 2), toy(0xf4f4f4), new THREE.Vector3(sx * 0.05, tTop - 0.1, fz + 0.012)); }
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
  const cache = new Map(); let blushV = 0;
  ud.blockFace = { set(name = 'neutral', opt = {}) { const key = [name, (opt.blink || 0) > 0.5 ? 1 : 0, Math.round((opt.talk || 0) * 3), opt.look ? opt.look.join(',') : '', Math.round(Math.max(blushV, opt.blush || 0) * 4)].join('|');
    let t = cache.get(key); if (!t) { t = drawFace(spec, name, { ...opt, blink: (opt.blink || 0) > 0.5 ? 1 : 0, talk: Math.round((opt.talk || 0) * 3) / 3, blush: Math.max(blushV, opt.blush || 0) }); cache.set(key, t); }
    if (faceMat.map !== t) { faceMat.map = t; faceMat.needsUpdate = true; } } };
  ud.blush = (v) => { blushV = v; mSkin.emissive = new THREE.Color(0xff3040); mSkin.emissiveIntensity = 0.12 * v; };
  ud.blockParts = parts; ud.blockSpec = spec;
  return h;
}

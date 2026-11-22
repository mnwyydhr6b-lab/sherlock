// kit_retarget.js – fertige Bewegungen (Ara3D-Bibliothek, CMU-Motion-Capture) auf unsere Figuren übertragen.
// Quelle: assets/moves/moves_m.glb / moves_f.glb (Skelett in T-Pose mit Mixamo-Namen + Clips, erzeugt mit make_moves.sh).
// Prinzip: Für jedes Gelenk wird die Drehung gegenüber der T-Pose in Weltkoordinaten übernommen (beide Skelette stehen in T-Pose),
// die Hüfte wird mit dem Beinlängen-Verhältnis verschoben. Das Handy der Quelle wird als eigenes Objekt mitgeführt.
//
//   const moves = await loadMoves('m');                 // oder 'f'
//   const clip = retarget(du, moves, 'Texting');        // -> AnimationClip für unsere Figur (Name 'Ara:Texting')
//   new Actor(du, { segs: [{ anim: 'Ara:Texting', at: 0 }] })   // wie jede andere Animation verwenden
//   faceFromMoves(du, clip, t)                          // Gesicht aus dem Clip (Lachen, Weinen ...) -> face.set-Werte
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { armIK } from './kit_human.js';

// unsere Knochen (UBC) -> Mixamo-Namen der Quelle
export const BONE_MAP = { pelvis: 'Hips', spine_01: 'Spine', spine_02: 'Spine1', spine_03: 'Spine2', neck_01: 'Neck', Head: 'Head' };
for (const [s, S] of [['l', 'Left'], ['r', 'Right']]) {
  Object.assign(BONE_MAP, { [`clavicle_${s}`]: `${S}Shoulder`, [`upperarm_${s}`]: `${S}Arm`, [`lowerarm_${s}`]: `${S}ForeArm`, [`hand_${s}`]: `${S}Hand`,
    [`thigh_${s}`]: `${S}UpLeg`, [`calf_${s}`]: `${S}Leg`, [`foot_${s}`]: `${S}Foot`, [`ball_${s}`]: `${S}ToeBase` });
  for (const [f, F] of [['thumb', 'Thumb'], ['index', 'Index'], ['middle', 'Middle'], ['ring', 'Ring'], ['pinky', 'Pinky']]) for (let k = 1; k <= 3; k++) BONE_MAP[`${f}_0${k}_${s}`] = `${S}Hand${F}${k}`;
}

// Finger: Richtung jedes Glieds direkt von der Quelle übernehmen (die Ruhe-Finger der beiden Skelette sind verschieden gebogen)
const FINGER_AIM = {};
for (const [s, S] of [['l', 'Left'], ['r', 'Right']]) for (const [f, F] of [['thumb', 'Thumb'], ['index', 'Index'], ['middle', 'Middle'], ['ring', 'Ring'], ['pinky', 'Pinky']]) for (let k = 1; k <= 3; k++) FINGER_AIM[`${f}_0${k}_${s}`] = [`${S}Hand${F}${k}`, `${S}Hand${F}${k + 1}`];

const CACHE = {};
export async function loadMoves(kind = 'm', base = '') {
  if (CACHE[kind]) return CACHE[kind];
  const g = await new GLTFLoader().loadAsync(`${base}assets/moves/moves_${kind}.glb`);
  const scene = g.scene; const bones = {}; let skel = null, faceMesh = null; const phoneParts = [];
  scene.traverse(o => { if (o.isBone) bones[o.name] = o; if (o.isSkinnedMesh) { skel = skel || o.skeleton; const mn = (o.material && o.material.name) || '';
    if (/^phone/i.test(mn)) phoneParts.push(o); else if (o.morphTargetDictionary && 'jawOpen' in o.morphTargetDictionary) faceMesh = faceMesh || o; } });
  // Handy-Teile in den Raum des Phone-Gelenks umrechnen (sie hängen zu 100 % an diesem Gelenk)
  const phone = new THREE.Group(); phone.name = 'AraPhone';
  if (bones.Phone && skel) { const pi = skel.bones.indexOf(bones.Phone);
    for (const m of phoneParts) { const geo = m.geometry.clone(); geo.applyMatrix4(m.bindMatrix); geo.applyMatrix4(skel.boneInverses[pi]); ['skinIndex', 'skinWeight'].forEach(a => geo.deleteAttribute(a)); geo.morphAttributes = {};
      const mesh = new THREE.Mesh(geo, m.material.clone()); mesh.castShadow = true; mesh.name = m.material.name; phone.add(mesh); } }
  return (CACHE[kind] = { scene, bones, skel, clips: g.animations, phone, faceMesh });
}

const V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
// Clip übertragen. Ergebnis wird in h.userData.clips eingetragen (Name 'Ara:<Clipname>').
export function retarget(h, moves, clipName, { fps = 30, name = null, palmGap = 0.016, contacts = true } = {}) {
  const ud = h.userData, tb = ud.bones, body = ud.body; const outName = name || 'Ara:' + clipName;
  const have = ud.clips.find(c => c.name === outName); if (have) return have;
  const clip = moves.clips.find(c => c.name === clipName) || moves.clips.find(c => c.name.toLowerCase().startsWith(clipName.toLowerCase()));
  if (!clip) throw new Error('move not found: ' + clipName + ' (have: ' + moves.clips.map(c => c.name).join(', ') + ')');
  const sB = moves.bones, sScene = moves.scene;
  // Figur vorübergehend in den Ursprung (Rechnung im Figurenraum)
  const saveP = h.position.clone(), saveQ = h.quaternion.clone(), saveS = h.scale.clone(); h.position.set(0, 0, 0); h.quaternion.identity(); h.scale.set(1, 1, 1);
  const saveL = new Map(); h.traverse(o => { if (o.isBone) saveL.set(o, [o.position.clone(), o.quaternion.clone(), o.scale.clone()]); });
  ud.mixer.stopAllAction(); body.skeleton.pose(); h.updateMatrixWorld(true);
  const rootBone = tb.root || tb.pelvis.parent; const order = []; rootBone.traverse(o => { if (o.isBone) order.push(o); });
  const tBindW = {}, tBindL = {}, tBindP = {}; for (const b of order) { tBindW[b.name] = b.getWorldQuaternion(Q()); tBindL[b.name] = b.quaternion.clone(); tBindP[b.name] = b.getWorldPosition(V()); }
  const dirL = {}; for (const b of order) { const c = b.children.find(o => o.isBone); if (c) dirL[b.name] = c.position.clone().normalize(); } // Richtung zum Kindgelenk im Knochenraum
  const rootParentQ = rootBone.parent.getWorldQuaternion(Q());
  moves.skel.pose(); sScene.updateMatrixWorld(true);
  const sBindWinv = {}, sBindP = {}; for (const [n, b] of Object.entries(sB)) { sBindWinv[n] = b.getWorldQuaternion(Q()).invert(); sBindP[n] = b.getWorldPosition(V()); }
  const ratio = tBindP.pelvis.y / sBindP.Hips.y;
  const footMinT = () => Math.min(...['foot_l', 'foot_r', 'ball_l', 'ball_r'].filter(n => tb[n]).map(n => tb[n].getWorldPosition(V()).y));
  const footMinS = () => Math.min(...['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase'].filter(n => sB[n]).map(n => sB[n].getWorldPosition(V()).y));
  const tFoot0 = Math.min(...['foot_l', 'foot_r', 'ball_l', 'ball_r'].filter(n => tBindP[n]).map(n => tBindP[n].y)), sFoot0 = Math.min(...['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase'].filter(n => sBindP[n]).map(n => sBindP[n].y));
  const handLen = (b, c) => b.distanceTo(c);
  const sScale = handLen(tBindP.hand_l, tBindP.middle_01_l) / handLen(sBindP.LeftHand, sBindP.LeftHandMiddle1);
  const mixer = new THREE.AnimationMixer(sScene); mixer.clipAction(clip).play();
  const N = Math.max(2, Math.round(clip.duration * fps) + 1); const times = [];
  const qT = new Map(order.map(b => [b.name, []])), pelP = [];
  // Handy: an welcher Hand hängt es? (die im Mittel nähere)
  const hasPhone = !!sB.Phone && clip.tracks.some(tr => tr.name.startsWith('Phone.'));
  let phoneHand = null; const phP = [], phQ = [], phS = [];
  if (hasPhone) { let dl = 0, dr = 0; for (let i = 0; i < 6; i++) { mixer.setTime(clip.duration * i / 5); sScene.updateMatrixWorld(true); const p = sB.Phone.getWorldPosition(V()); dl += p.distanceTo(sB.LeftHand.getWorldPosition(V())); dr += p.distanceTo(sB.RightHand.getWorldPosition(V())); } phoneHand = dl <= dr ? 'l' : 'r'; }
  // Gesicht: Blendshape-Werte der Quelle mitschreiben
  const fm = moves.faceMesh, faceKeys = fm ? Object.keys(fm.morphTargetDictionary) : [], faceVals = [];
  for (let i = 0; i < N; i++) {
    const t = Math.min(clip.duration, i / fps); times.push(t); mixer.setTime(t); sScene.updateMatrixWorld(true);
    const W = new Map();
    for (const b of order) { const pW = b.parent && b.parent.isBone ? W.get(b.parent.name) : rootParentQ; const sn = BONE_MAP[b.name]; let qw;
      const fa = FINGER_AIM[b.name];
      if (fa && sB[fa[0]] && sB[fa[1]] && dirL[b.name]) { const base = pW.clone().multiply(tBindL[b.name]); const cur = dirL[b.name].clone().applyQuaternion(base);
        const want = sB[fa[1]].getWorldPosition(V()).sub(sB[fa[0]].getWorldPosition(V())).normalize(); qw = Q().setFromUnitVectors(cur, want).multiply(base); }
      else if (sn && sB[sn]) qw = sB[sn].getWorldQuaternion(Q()).multiply(sBindWinv[sn]).multiply(tBindW[b.name]); else qw = pW.clone().multiply(tBindL[b.name]);
      W.set(b.name, qw); b.quaternion.copy(pW.clone().invert().multiply(qw)); }
    const pw = tBindP.pelvis.clone().add(sB.Hips.getWorldPosition(V()).sub(sBindP.Hips).multiplyScalar(ratio));
    if (ud.applyBuild) ud.applyBuild(); // Körperbau (schlanke Arme/Beine) wie beim Abspielen, damit Hände und Handy genau passen
    const pel = tb.pelvis; pel.parent.updateWorldMatrix(true, false); pel.position.copy(pel.parent.worldToLocal(pw.clone()));
    // Bodenkontakt: stehen die Füße der Quelle auf dem Boden, stehen auch unsere darauf (Beinlängen sind verschieden)
    h.updateMatrixWorld(true); pw.y += (footMinS() - sFoot0) * ratio - (footMinT() - tFoot0);
    const pl = pel.parent.worldToLocal(pw.clone()); pel.position.copy(pl); pelP.push(pl.x, pl.y, pl.z);
    // Berührungen erhalten: Hand am Kopf (Telefonieren, Weinen) und Hand an Hand (Tippen, Klatschen) – Arm per IK nachführen
    if (contacts) { h.updateMatrixWorld(true); const P = (n) => sB[n].getWorldPosition(V()), T = (n) => tb[n].getWorldPosition(V());
      const reach = (side, want, w) => { if (w <= 0.001) return; const hb = tb['hand_' + side]; const keepQ = hb.getWorldQuaternion(Q()); const cur = T('hand_' + side); const goal = cur.clone().lerp(want, w);
        const pole = T('lowerarm_' + side).sub(T('upperarm_' + side).lerp(cur, 0.5)); armIK(h, side, goal, pole.lengthSq() > 1e-8 ? pole.normalize() : new THREE.Vector3(0, -1, 0));
        hb.quaternion.copy(hb.parent.getWorldQuaternion(Q()).invert().multiply(keepQ)); h.updateMatrixWorld(true); };
      // Kopfmitte beider Figuren: Kopfknochen sitzt im Nacken -> 7,5 cm entlang der Kopf-Hochachse
      const dHead = sB.Head.getWorldQuaternion(Q()).multiply(sBindWinv.Head); const up = new THREE.Vector3(0, 0.075, 0).applyQuaternion(dHead);
      const headS = P('Head').add(up), headC = T('Head').add(up);
      const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
      for (const [s, S] of [['l', 'Left'], ['r', 'Right']]) { const dh = P(S + 'Hand').distanceTo(headS); const want = headC.clone().add(P(S + 'Hand').sub(headS));
        const out = want.clone().sub(headC), minR = phoneHand === s ? 0.125 : 0.105; if (out.length() < minR) want.copy(headC).addScaledVector(out.normalize(), minR); // nicht in den Kopf greifen
        reach(s, want, sm(0.3, 0.19, dh)); }
      const dhh = P('LeftHand').distanceTo(P('RightHand')); const wHH = sm(0.3, 0.16, dhh);
      if (wHH > 0.001) { const kSh = tBindP.upperarm_l.distanceTo(tBindP.upperarm_r) / sBindP.LeftArm.distanceTo(sBindP.RightArm); const rel = P('RightHand').sub(P('LeftHand')).multiplyScalar(kSh);
        if (phoneHand === 'l') reach('r', T('hand_l').add(rel), wHH); else if (phoneHand === 'r') reach('l', T('hand_r').sub(rel), wHH);
        else { const mid = T('hand_l').lerp(T('hand_r'), 0.5); reach('l', mid.clone().addScaledVector(rel, -0.5), wHH); reach('r', mid.clone().addScaledVector(rel, 0.5), wHH); } } }
    for (const b of order) { const ql = b.quaternion; qT.get(b.name).push(ql.x, ql.y, ql.z, ql.w); }
    if (hasPhone) { h.updateMatrixWorld(true); const SH = phoneHand === 'l' ? 'LeftHand' : 'RightHand', TH = 'hand_' + phoneHand;
      const dS = sB[SH].getWorldQuaternion(Q()).multiply(sBindWinv[SH]); const off = sB.Phone.getWorldPosition(V()).sub(sB[SH].getWorldPosition(V())).applyQuaternion(dS.clone().invert()).multiplyScalar(sScale);
      const p = tb[TH].getWorldPosition(V()).add(off.applyQuaternion(dS)); p.addScaledVector(new THREE.Vector3(0, -1, 0).applyQuaternion(dS), -palmGap); /* Bind-Handfläche zeigt nach unten (0,-1,0) */ const q = sB.Phone.getWorldQuaternion(Q()); const sc = sB.Phone.getWorldScale(V()); // das Handy ist in Ruhe winzig skaliert (versteckt) und wird im Clip hochskaliert
      // relativ zur Hand speichern: das Handy hängt an der Hand und bleibt so immer in der Handfläche
      const loc = new THREE.Matrix4().compose(p, q, sc).premultiply(new THREE.Matrix4().copy(tb[TH].matrixWorld).invert()); const lp = V(), lq = Q(), ls = V(); loc.decompose(lp, lq, ls);
      phP.push(lp.x, lp.y, lp.z); phQ.push(lq.x, lq.y, lq.z, lq.w); phS.push(ls.x, ls.y, ls.z); }
    if (fm) faceVals.push(faceKeys.map(k => fm.morphTargetInfluences[fm.morphTargetDictionary[k]] || 0));
  }
  mixer.stopAllAction(); mixer.uncacheRoot(sScene);
  // Zustand der Figur wiederherstellen
  for (const [o, [p, q, s]] of saveL) { o.position.copy(p); o.quaternion.copy(q); o.scale.copy(s); }
  h.position.copy(saveP); h.quaternion.copy(saveQ); h.scale.copy(saveS); h.updateMatrixWorld(true);
  const tracks = []; for (const b of order) if (BONE_MAP[b.name] && sB[BONE_MAP[b.name]]) tracks.push(new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, qT.get(b.name)));
  tracks.push(new THREE.VectorKeyframeTrack(`${tb.pelvis.name}.position`, times, pelP));
  if (hasPhone) { const pn = 'AraPhone_' + phoneHand; let ph = h.getObjectByName(pn); if (!ph) { ph = moves.phone.clone(); ph.name = pn; ph.visible = false; tb['hand_' + phoneHand].add(ph); }
    tracks.push(new THREE.VectorKeyframeTrack(pn + '.position', times, phP), new THREE.QuaternionKeyframeTrack(pn + '.quaternion', times, phQ), new THREE.VectorKeyframeTrack(pn + '.scale', times, phS)); }
  const out = new THREE.AnimationClip(outName, clip.duration, tracks);
  out.userData = { face: fm ? { keys: faceKeys, fps, vals: faceVals } : null, phone: hasPhone ? phoneHand : null, source: clip.name };
  ud.clips.push(out);
  return out;
}
// Handy nur zeigen, wenn ein Clip mit Handy läuft (sonst unsichtbar)
export function showPhone(h, on) { for (const s of ['l', 'r']) { const ph = h.getObjectByName('AraPhone_' + s); if (ph) ph.visible = !!on; } }

// Gesichtswerte aus einem übertragenen Clip (ARKit-Namen -> unsere face.set-Namen)
export function faceFromMoves(clip, t) {
  const F = clip.userData && clip.userData.face; if (!F) return {};
  const d = clip.duration; const tt = ((t % d) + d) % d; const i = Math.min(F.vals.length - 1, Math.round(tt * F.fps)); const v = F.vals[i]; const g = (k) => { const j = F.keys.indexOf(k); return j < 0 ? 0 : v[j]; };
  return { jawOpen: g('jawOpen'), smileL: g('mouthSmile'), smileR: g('mouthSmile'), frown: g('mouthFrown'), blink: Math.max(g('eyeBlinkLeft'), g('eyeBlinkRight')),
    wide: Math.max(g('eyeWideLeft'), g('eyeWideRight')), squint: Math.max(g('eyeSquintLeft'), g('eyeSquintRight')), browsInnerUp: g('browInnerUp'),
    browsUp: Math.max(g('browOuterUpLeft'), g('browOuterUpRight')), browsAngry: Math.max(g('browDownLeft'), g('browDownRight')) };
}

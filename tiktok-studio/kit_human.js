// Human character kit: Quaternius Universal Base Characters (CC0) + procedural clothing shells + hair
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const A = {};
export async function loadHumanAssets(base = 'assets/') {
  const [m, f] = await Promise.all([loader.loadAsync(base + 'ubc/human_male.glb'), loader.loadAsync(base + 'ubc/human_female.glb')]);
  A.male = m; A.female = f;
  A.hair = {};
  for (const h of ['SimpleParted', 'Buzzed', 'Long', 'Buns', 'BuzzedFemale', 'Beard']) A.hair[h] = await loader.loadAsync(base + 'hair/Hair_' + h + '.gltf');
  const t = (p) => { const x = texLoader.load(base + 'skin/' + p); x.flipY = false; x.colorSpace = THREE.SRGBColorSpace; return x; };
  A.skin = { male: { light: t('T_Superhero_Male_Ligh.png'), dark: t('T_Superhero_Male_Dark.png') }, female: { light: t('T_Superhero_Female_Light_BaseColor.png'), dark: t('T_Superhero_Female_Dark_BaseColor.png') } };
  await new Promise(r => setTimeout(r, 300));
  return A;
}

// ---------- fabric textures ----------
function fabricCanvas(kind, base) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const col = new THREE.Color(base);
  g.fillStyle = '#' + col.getHexString(); g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    let v;
    if (kind === 'denim') v = ((x + y) % 4 < 2 ? 0.93 : 1.06) * (0.92 + Math.random() * 0.16);
    else if (kind === 'knit') v = (Math.sin(x * 0.9) * 0.5 + 0.5) * 0.08 + 0.94 + (Math.random() - 0.5) * 0.06;
    else v = 0.95 + Math.random() * 0.1;
    const i = (y * 256 + x) * 4; img.data[i] = Math.min(255, img.data[i] * v); img.data[i + 1] = Math.min(255, img.data[i + 1] * v); img.data[i + 2] = Math.min(255, img.data[i + 2] * v);
  }
  g.putImageData(img, 0, 0);
  return c;
}
function fabricMat(kind, color, o = {}) {
  const t = new THREE.CanvasTexture(fabricCanvas(kind, color)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(kind === 'denim' ? 14 : 10, kind === 'denim' ? 14 : 10); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshPhysicalMaterial(Object.assign({ map: t, roughness: 0.88, sheen: 0.6, sheenRoughness: 0.7, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35) }, o));
}

// ---------- clothing shell from the body mesh (smoothed, inflated, clipped) ----------
function boneRestPos(body, name) { const i = body.skeleton.bones.findIndex(b => b.name === name); const m = new THREE.Matrix4().copy(body.skeleton.boneInverses[i]).invert(); return new THREE.Vector3().setFromMatrixPosition(m); }
function distToSeg(p, a, b) { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return { d: p.distanceTo(a.clone().addScaledVector(ab, t)), t, q: a.clone().addScaledVector(ab, t) }; }
function shell(body, test, opts, material, name) {
  const src = body.geometry; const geo = src.clone();
  const pos = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
  const bones = body.skeleton.bones; const keep = new Uint8Array(pos.count); const dom = new Array(pos.count); const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } } dom[i] = bones[best].name; v.fromBufferAttribute(pos, i); if (test(dom[i], v)) keep[i] = 1; }
  const idx = src.index.array; const out = [];
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2]; if (keep[a] || keep[b] || keep[c]) out.push(a, b, c); }
  // include one ring of neighbours so clip planes (not triangle edges) define the hems
  const used = new Uint8Array(pos.count); for (const i of out) used[i] = 1;
  // weld by position for smoothing adjacency (UV seams split vertices)
  const key = (i) => `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  const weld = new Map(); const rep = new Int32Array(pos.count);
  for (let i = 0; i < pos.count; i++) { if (!used[i]) continue; const k = key(i); if (!weld.has(k)) weld.set(k, i); rep[i] = weld.get(k); }
  const nb = new Map(); const addN = (a, b) => { a = rep[a]; b = rep[b]; if (a === b) return; if (!nb.has(a)) nb.set(a, new Set()); nb.get(a).add(b); };
  for (let t = 0; t < out.length; t += 3) { const [a, b, c] = [out[t], out[t + 1], out[t + 2]]; addN(a, b); addN(b, a); addN(b, c); addN(c, b); addN(a, c); addN(c, a); }
  const P = new Map(); for (const r of nb.keys()) P.set(r, new THREE.Vector3().fromBufferAttribute(pos, r));
  for (let it = 0; it < (opts.smooth ?? 6); it++) { const NP = new Map(); for (const [r, s] of nb) { const avg = new THREE.Vector3(); s.forEach(o => avg.add(P.get(o) || P.get(r))); avg.divideScalar(s.size); NP.set(r, P.get(r).clone().lerp(avg, 0.55)); } NP.forEach((p, r) => P.set(r, p)); }
  // radial shaping around limb axes (straight trouser legs / loose sleeves)
  const axes = (opts.axes || []).map(([b0, b1, R0, R1, k]) => ({ a: boneRestPos(body, b0), b: boneRestPos(body, b1), R0, R1, k }));
  for (const [r, p] of P) {
    for (const ax of axes) { const { d, t, q } = distToSeg(p, ax.a, ax.b); const R = ax.R0 + (ax.R1 - ax.R0) * t; if (d < R * 1.8 && t > 0.0 && t < 1.0) { const dir = p.clone().sub(q).normalize(); const nd = d + (R - d) * ax.k; if (nd > d) p.copy(q.clone().addScaledVector(dir, nd)); } }
  }
  for (let i = 0; i < pos.count; i++) if (used[i]) { const p = P.get(rep[i]); pos.setXYZ(i, p.x, p.y, p.z); }
  geo.setIndex(out); geo.computeVertexNormals();
  const groups = new Map(); for (let i = 0; i < pos.count; i++) if (used[i]) { const r = rep[i]; if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); }
  const avgNormals = () => { const n = geo.attributes.normal; for (const ids of groups.values()) { if (ids.length < 2) continue; const a = new THREE.Vector3(); for (const i of ids) a.add(new THREE.Vector3().fromBufferAttribute(n, i)); a.normalize(); for (const i of ids) n.setXYZ(i, a.x, a.y, a.z); } n.needsUpdate = true; };
  avgNormals();
  // inflate along smoothed normals
  const nor = geo.attributes.normal; const bind = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { if (!used[i]) continue; v.fromBufferAttribute(pos, i); const o = opts.offset(dom[i], v); pos.setXYZ(i, v.x + nor.getX(i) * o, v.y + nor.getY(i) * o, v.z + nor.getZ(i) * o); }
  for (let i = 0; i < pos.count; i++) { const p = new THREE.Vector3().fromBufferAttribute(src.attributes.position, i); bind[i * 3] = p.x; bind[i * 3 + 1] = p.y; bind[i * 3 + 2] = p.z; }
  geo.setAttribute('bindPos', new THREE.BufferAttribute(bind, 3)); geo.computeVertexNormals(); avgNormals();
  const mat = material.clone(); mat.side = THREE.DoubleSide; addClip(mat, opts.clip || [], opts.bands || [], opts.extra || '');
  const m = new THREE.SkinnedMesh(geo, mat); m.name = name; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
  m.bind(body.skeleton, body.bindMatrix); return m;
}
// discard fragments on the wrong side of bind-space planes: [px,py,pz, nx,ny,nz] keep where dot(p-p0,n) > 0
// GLSL expression: is the bind-space position on the kept side of a clip entry?
// [px,py,pz,nx,ny,nz] = plane; optional 7th value R limits the cut to a vertical cylinder of radius R around (px,pz)
function insideExpr(p) { const pl = `dot(vBindPos - vec3(${p[0].toFixed(4)},${p[1].toFixed(4)},${p[2].toFixed(4)}), vec3(${p[3].toFixed(4)},${p[4].toFixed(4)},${p[5].toFixed(4)})) >= 0.0`;
  return p.length > 6 ? `(${pl} || length(vBindPos.xz - vec2(${p[0].toFixed(4)},${p[2].toFixed(4)})) > ${p[6].toFixed(4)})` : `(${pl})`; }
// Stoff-Details im Bindungsraum (Körpermitte vorne = x 0, Front = +z): Reißverschluss, Bauchtasche, Knopfleiste
const TOP_DETAIL = (nk, sp) => ({
  jacket: `if (vBindPos.z > 0.0 && vBindPos.y < ${(1.49 + nk).toFixed(4)}) { float ax = abs(vBindPos.x); if (ax < 0.0055) diffuseColor.rgb *= 0.32; else if (ax < 0.017) diffuseColor.rgb *= 0.86; }`,
  hoodie: `if (vBindPos.z > 0.02 && vBindPos.y > ${(1.02 + sp).toFixed(4)} && vBindPos.y < ${(1.175 + sp).toFixed(4)}) { float t = (vBindPos.y - ${(1.02 + sp).toFixed(4)}) / 0.155; float hw = mix(0.135, 0.085, t); float ax = abs(vBindPos.x);
    if (ax < hw) { float e = min(hw - ax, min(vBindPos.y - ${(1.02 + sp).toFixed(4)}, ${(1.175 + sp).toFixed(4)} - vBindPos.y)); diffuseColor.rgb *= (e < 0.006 ? 0.6 : 0.95); } }`,
  shirt: `if (vBindPos.z > 0.0 && vBindPos.y < ${(1.49 + nk).toFixed(4)}) { float ax = abs(vBindPos.x); if (ax < 0.004) diffuseColor.rgb *= 0.78; float by = fract(vBindPos.y / 0.075); if (ax < 0.009 && by < 0.12) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92), 0.85); }`,
});
function addClip(mat, planes, bands = [], extra = '') {
  if (!planes.length && !bands.length && !extra) return;
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 bindPos;\nvarying vec3 vBindPos;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBindPos = bindPos;');
    const tests = planes.map(p => `if (!(${insideExpr(p)})) discard;`).join('\n');
    const bandCode = bands.map(b => `{ float dd = dot(vBindPos - vec3(${b[0].toFixed(4)},${b[1].toFixed(4)},${b[2].toFixed(4)}), vec3(${b[3].toFixed(4)},${b[4].toFixed(4)},${b[5].toFixed(4)})); if (dd < ${b[6].toFixed(4)}) { float rib = 0.5 + 0.5 * sin(vBindPos.x * 900.0 + vBindPos.z * 900.0); diffuseColor.rgb *= ${b[7].toFixed(3)} * (0.92 + 0.08 * rib); } }`).join('\n');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vBindPos;').replace('void main() {', 'void main() {\n' + tests).replace('#include <map_fragment>', '#include <map_fragment>\n' + bandCode + '\n' + extra);
  };
  mat.customProgramCacheKey = () => JSON.stringify(planes) + JSON.stringify(bands) + extra;
}
const TOP_B = new Set(['spine_01', 'spine_02', 'spine_03', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r']);
const LEG_B = new Set(['pelvis', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r']);
const FOOT_B = new Set(['foot_l', 'foot_r', 'ball_l', 'ball_r', 'ball_leaf_l', 'ball_leaf_r']);

export function makeHuman(o) {
  const src = o.sex === 'female' ? A.female : A.male;
  const root = SkeletonUtils.clone(src.scene);
  let body = null, eyebrows = null, eyes = null;
  root.traverse(m => { if (m.isSkinnedMesh) { m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; if (/superhero/i.test(m.name)) body = m; if (/eyebrow/i.test(m.name)) eyebrows = m; if (/^eyes$/i.test(m.name)) eyes = m; } });
  body.material = body.material.clone(); body.material.map = A.skin[o.sex === 'female' ? 'female' : 'male'][o.skin || 'light']; body.material.needsUpdate = true;
  if (eyebrows) { eyebrows.material = eyebrows.material.clone(); eyebrows.material.color = new THREE.Color(o.hairColor ?? 0x3a2416); }
  const bindY = (v) => v.y; // model space (feet at 0)
  const parent = body.parent;
  // ---- top ----
  const top = o.top || { type: 'hoodie', color: 0x2f6b4f };
  const topMat = fabricMat(top.type === 'shirt' ? 'plain' : 'knit', top.color);
  const loose = top.type === 'hoodie' ? 0.026 : top.type === 'jacket' ? 0.03 : 0.014;
  const shortSleeve = top.type === 'tee';
  const sh = boneRestPos(body, 'upperarm_l'), el = boneRestPos(body, 'lowerarm_l'), wr = boneRestPos(body, 'hand_l');
  const shR = boneRestPos(body, 'upperarm_r'), elR = boneRestPos(body, 'lowerarm_r'), wrR = boneRestPos(body, 'hand_r');
  const armCut = (s0, e0, frac, side) => { const p = s0.clone().lerp(e0, frac); const n = s0.clone().sub(e0).normalize(); return [p.x, p.y, p.z, n.x, n.y, n.z]; };
  const hemY = top.type === 'hoodie' ? 0.965 : top.type === 'tee' ? 0.99 : 0.975;
  const nkR = boneRestPos(body, 'neck_01'); const NK = nkR.y - 1.5205, SP = boneRestPos(body, 'spine_03').y - 1.3109; // Höhen sind am Männerkörper gemessen; NK/SP verschieben sie für den Frauenkörper
  const topClip = [[0, hemY, 0, 0, 1, 0], [nkR.x, 1.535 + NK, nkR.z, 0, -1, 0, 0.088]];
  if (shortSleeve) { topClip.push(armCut(sh, el, 0.55, 'l')); topClip.push(armCut(shR, elR, 0.55, 'r')); }
  else { topClip.push(armCut(el, wr, 0.9, 'l')); topClip.push(armCut(elR, wrR, 0.9, 'r')); }
  const topMesh = shell(body, (bn, v) => TOP_B.has(bn) || (bn === 'pelvis' && v.y > hemY - 0.03) || bn === 'neck_01' || bn === 'hand_l' || bn === 'hand_r',
    { smooth: 10, offset: (bn, v) => bn.startsWith('lowerarm') ? loose * 0.85 : bn.startsWith('upperarm') ? loose : bn === 'neck_01' ? 0.01 : loose * 1.15,
      axes: [['upperarm_l', 'lowerarm_l', 0.07, 0.065, 0.5], ['upperarm_r', 'lowerarm_r', 0.07, 0.065, 0.5], ['lowerarm_l', 'hand_l', 0.062, 0.05, 0.5], ['lowerarm_r', 'hand_r', 0.062, 0.05, 0.5], ['pelvis', 'neck_01', 0.17, 0.15, 0.35]], clip: topClip, extra: TOP_DETAIL(NK, SP)[top.type] || '',
      bands: top.type === 'hoodie' ? [[0, hemY, 0, 0, 1, 0, 0.055, 0.86], topClip[2].slice(0, 6).concat([0.05, 0.86]), topClip[3].slice(0, 6).concat([0.05, 0.86])] : [[0, hemY, 0, 0, 1, 0, 0.02, 0.9]] }, topMat, 'top');
  parent.add(topMesh);
  // cuffs + hem bands (rib knit) for hoodies
  // ---- pants (straight jeans) ----
  const pants = o.pants || { color: 0x3b5a8c };
  const pantsMesh = shell(body, (bn, v) => LEG_B.has(bn) || bn === 'spine_01' || bn === 'foot_l' || bn === 'foot_r',
    { smooth: 14, offset: (bn, v) => bn === 'pelvis' || bn === 'spine_01' ? 0.022 : 0.018,
      axes: [['thigh_l', 'calf_l', 0.088, 0.074, 0.6], ['thigh_r', 'calf_r', 0.088, 0.074, 0.6], ['calf_l', 'foot_l', 0.072, 0.066, 0.7], ['calf_r', 'foot_r', 0.072, 0.066, 0.7]],
      clip: [[0, 1.02, 0, 0, -1, 0], [0, 0.105, 0, 0, 1, 0]], bands: [[0, 1.02, 0, 0, -1, 0, 0.035, 0.78], [0, 0.105, 0, 0, 1, 0, 0.03, 1.12]] }, fabricMat('denim', pants.color), 'pants');
  parent.add(pantsMesh);
  // hide the body wherever a garment covers it (no skin poking through), and the bare feet
  { const g = body.geometry; const p = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight; const bones = body.skeleton.bones; const cov = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) { let best = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; best = si.getComponent(i, k); } } const bn = bones[best].name; const y = p.getY(i);
      cov[i * 2] = (TOP_B.has(bn) || bn === 'neck_01' || (bn === 'pelvis' && y > hemY - 0.03)) ? 1 : 0; cov[i * 2 + 1] = (LEG_B.has(bn) || bn === 'spine_01' || bn === 'foot_l' || bn === 'foot_r') ? 1 : 0; }
    g.setAttribute('cov', new THREE.BufferAttribute(cov, 2)); g.setAttribute('bindPos', p.clone()); }
  { const tp = topClip.map(q => insideExpr(q)).join(' && ');
    const pp = `vBindPos.y < 1.02 && vBindPos.y > 0.105`;
    body.material.userData.uMouthOpen = { value: 0 };
    // Innenseite des Kopfes dunkel rendern (Sicherheitsnetz: durch den offenen Mund nie „durch den Kopf“ schauen)
    const headY0 = (FACE_LM[o.sex === 'female' ? 'female' : 'male'].chinY - 0.06).toFixed(4);
    body.material.side = THREE.DoubleSide; body.material.shadowSide = THREE.BackSide;
    body.material.onBeforeCompile = (sh) => {
      sh.uniforms.uMouthOpen = body.material.userData.uMouthOpen;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 bindPos;\nattribute vec2 cov;\nattribute float mouthMask;\nvarying float vMouthMask;\nvarying vec3 vBindPos;\nvarying vec2 vCov;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMouthMask = mouthMask;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvBindPos = bindPos; vCov = cov;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uMouthOpen;\nvarying float vMouthMask;\nvarying vec3 vBindPos;\nvarying vec2 vCov;').replace('#include <map_fragment>', '#include <map_fragment>\n if (vMouthMask > 0.995 && uMouthOpen > 0.015) discard;\n diffuseColor.rgb *= mix(vec3(1.0), vec3(0.45, 0.22, 0.24), clamp(vMouthMask / 0.6, 0.0, 1.0) * clamp(uMouthOpen * 6.0, 0.0, 1.0));')
        .replace('#include <opaque_fragment>', '#include <opaque_fragment>\n if (!gl_FrontFacing) gl_FragColor = vec4(0.016, 0.004, 0.005, 1.0);')
        .replace('void main() {', `void main() {\nif (vBindPos.y < 0.09) discard;\nif (!gl_FrontFacing && vBindPos.y < ${headY0}) discard;\nif (vCov.x > 0.5 && ${tp}) discard;\nif (vCov.y > 0.5 && ${pp}) discard;`);
    };
    body.material.customProgramCacheKey = () => 'body-' + headY0 + tp; }
  // ---- rigid accessories on bones ----
  const bonesBy = {}; body.skeleton.bones.forEach(b => bonesBy[b.name] = b);
  root.updateMatrixWorld(true);
  const attach = (boneName, mesh, worldPos) => { const b = bonesBy[boneName]; const inv = new THREE.Matrix4().copy(b.matrixWorld).invert(); mesh.position.copy(worldPos.clone().applyMatrix4(inv)); b.add(mesh); return mesh; };
  // hair (origin-at-0 meshes, attached to the head bone in rest pose)
  body.skeleton.pose(); root.updateMatrixWorld(true);
  const headRestInv = new THREE.Matrix4().copy(bonesBy.Head.matrixWorld).invert();
  const rootWorld = root.matrixWorld.clone();
  const addHair = (key, color) => { const h = A.hair[key]; if (!h) return; h.scene.updateMatrixWorld(true); h.scene.traverse(m => { if (m.isMesh) {
      const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); g.applyMatrix4(rootWorld); g.applyMatrix4(headRestInv);
      const mat = m.material.clone(); mat.color = new THREE.Color(color); mat.roughness = 0.55;
      const mm = new THREE.Mesh(g, mat); mm.castShadow = true; bonesBy.Head.add(mm); } }); };
  if (o.hair) addHair(o.hair, o.hairColor ?? 0x3a2416);
  if (o.beard) addHair('Beard', o.hairColor ?? 0x3a2416);
  // collar ring at the neckline
  { const nk = bonesBy.neck_01.getWorldPosition(new THREE.Vector3()); const ringMat = topMat.clone(); ringMat.color = topMat.color.clone().multiplyScalar(0.72); const ring = new THREE.Mesh(new THREE.TorusGeometry(top.type === 'tee' ? 0.066 : 0.075, top.type === 'tee' ? 0.01 : 0.024, 12, 40), ringMat); ring.scale.set(1.25, 1.0, 1.0); ring.rotation.x = Math.PI / 2 - 0.25; ring.castShadow = true;
    const hb2 = new THREE.Matrix4().copy(bonesBy.spine_03.matrixWorld).invert(); attach('spine_03', ring, new THREE.Vector3(nk.x, 1.515 + NK, nk.z + 0.005)); ring.quaternion.premultiply(new THREE.Quaternion().setFromRotationMatrix(hb2)); }
  // hood lying on the upper back (roll around the neck + flat pouch), rigid on spine_03
  if (top.type === 'hoodie' && o.hood !== false) { const PB = body.geometry.attributes.position; const nk = boneRestPos(body, 'neck_01');
    let backZ = 1; for (let i = 0; i < PB.count; i++) { if (Math.abs(PB.getY(i) - (1.38 + NK)) < 0.02 && Math.abs(PB.getX(i)) < 0.05) backZ = Math.min(backZ, PB.getZ(i)); }
    const hoodMat = topMat.clone(); hoodMat.side = THREE.DoubleSide; const rollMat = topMat.clone(); rollMat.color = topMat.color.clone().multiplyScalar(0.85);
    const g = new THREE.Group();
    const roll = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.034, 12, 28, Math.PI * 1.25), rollMat); roll.rotation.set(Math.PI / 2 - 0.55, 0, Math.PI + Math.PI * 0.125); roll.scale.set(1.18, 1.0, 1.0); roll.position.set(nk.x, 1.485 + NK, nk.z - 0.005); roll.castShadow = true; g.add(roll);
    const pouchGeo = new THREE.SphereGeometry(0.125, 24, 16); const pouch = new THREE.Mesh(pouchGeo, hoodMat); pouch.scale.set(0.98, 1.05, 0.34); pouch.position.set(nk.x, 1.335 + NK, backZ - loose * 1.15 + 0.004); pouch.rotation.x = -0.52; pouch.castShadow = true; g.add(pouch);
    g.applyMatrix4(new THREE.Matrix4().copy(bonesBy.spine_03.matrixWorld).invert()); bonesBy.spine_03.add(g); }
  // hoodie drawstrings (follow the chest surface in bind pose, rigid on spine_03)
  if (top.type === 'hoodie') { const PB = body.geometry.attributes.position; const cordMat = new THREE.MeshStandardMaterial({ color: o.cordColor ?? 0xf2f2f2, roughness: 0.6 });
    for (const sx of [-1, 1]) { const pts = [];
      for (let k = 0; k <= 6; k++) { const y = 1.495 + NK - k * 0.032, x = sx * (0.042 - k * 0.002); let zmax = -1; for (let i = 0; i < PB.count; i++) { if (Math.abs(PB.getY(i) - y) < 0.012 && Math.abs(PB.getX(i) - x) < 0.015) zmax = Math.max(zmax, PB.getZ(i)); } pts.push(new THREE.Vector3(x, y, zmax + loose * 1.15 + 0.012)); }
      const g = new THREE.Group(); const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0045, 6), cordMat); tube.castShadow = true; g.add(tube);
      const ag = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.022, 8), new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: 0.8, roughness: 0.3 })); ag.position.copy(pts[6]).add(new THREE.Vector3(0, -0.012, 0)); g.add(ag);
      g.applyMatrix4(new THREE.Matrix4().copy(bonesBy.spine_03.matrixWorld).invert()); bonesBy.spine_03.add(g); } }
  // ---- sneakers (rigid, attached to the feet) ----
  for (const sd of ['l', 'r']) {
    const foot = bonesBy['foot_' + sd], ball = bonesBy['ball_' + sd];
    const fp = foot.getWorldPosition(new THREE.Vector3()), bp = ball.getWorldPosition(new THREE.Vector3());
    const dir = bp.clone().sub(fp); dir.y = 0; const len = dir.length() + 0.13; dir.normalize();
    const g = new THREE.Group();
    const upM = new THREE.MeshPhysicalMaterial({ color: o.shoes ?? 0xf2f2f2, roughness: 0.55, clearcoat: 0.2 }), soleM = new THREE.MeshPhysicalMaterial({ color: o.sole ?? 0xffffff, roughness: 0.7 }), acM = new THREE.MeshStandardMaterial({ color: o.shoeAccent ?? 0xd23b3b, roughness: 0.5 });
    const RBG = (w, h, d, r) => new THREE.BoxGeometry(w, h, d, 6, 4, 8);
    const sole = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, len - 0.09, 6, 16), soleM); sole.rotation.x = Math.PI / 2; sole.scale.set(1.05, 1, 0.4); sole.position.y = 0.022; g.add(sole);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, len - 0.11, 8, 16), upM); upper.rotation.x = Math.PI / 2; upper.scale.set(1.0, 1, 0.78); upper.position.set(0, 0.06, -0.01); g.add(upper);
    const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.07, 16), upM); ankle.position.set(0, 0.09, -len / 2 + 0.07); g.add(ankle);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.007, 6, 20, Math.PI), acM); stripe.position.set(0, 0.055, 0.0); stripe.rotation.set(0, Math.PI / 2, 0); g.add(stripe);
    const lace = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.08), new THREE.MeshStandardMaterial({ color: 0xf8f8f8 })); lace.position.set(0, 0.093, 0.035); lace.rotation.x = 0.35; g.add(lace);
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const center = fp.clone().addScaledVector(dir, len * 0.5 - 0.06); center.y = 0;
    g.position.copy(center); g.lookAt(center.clone().add(dir));
    const inv = new THREE.Matrix4().copy(foot.matrixWorld).invert(); g.applyMatrix4(inv); foot.add(g);
  }
  // ---- animation ----
  const mixer = new THREE.AnimationMixer(root);
  const clips = src.animations;
  const play = (name, t = 0) => { mixer.stopAllAction(); const c = clips.find(x => x.name === name) || clips.find(x => x.name.startsWith(name)); const a = mixer.clipAction(c); a.play(); mixer.setTime(t); return a; };
  play(o.anim || 'Idle_Loop', o.time ?? 0.5);
  const slim = o.slim ?? 0.88;
  const applyBuild = () => { for (const [n, s2] of [['upperarm_l', slim], ['upperarm_r', slim], ['lowerarm_l', slim + 0.04], ['lowerarm_r', slim + 0.04], ['thigh_l', slim + 0.02], ['thigh_r', slim + 0.02], ['calf_l', slim + 0.05], ['calf_r', slim + 0.05]]) { const b = bonesBy[n]; if (b) b.scale.set(1, s2, s2); }
    for (const n of ['hand_l', 'hand_r', 'foot_l', 'foot_r']) { const b = bonesBy[n]; const p = b.parent.scale; b.scale.set(1, 1 / p.y, 1 / p.z); } };
  const update = (t) => { mixer.setTime(t); applyBuild(); };
  update(o.time ?? 0.5);
  root.userData = { mixer, play, update, bones: bonesBy, body, applyBuild, clips };
  root.userData.face = faceRig(o.sex === 'female' ? 'female' : 'male', body, eyes, eyebrows);
  if (o.x !== undefined) root.position.set(o.x, o.y ?? 0, o.z ?? 0);
  if (o.ry !== undefined) root.rotation.y = o.ry;
  return root;
}

// ---- simple two-bone IK for an arm: side 'l' | 'r', target hand position (world), pole = world direction the elbow should point to
export function armIK(root, side, target, pole) {
  const b = root.userData.bones; const up = b['upperarm_' + side], lo = b['lowerarm_' + side], ha = b['hand_' + side];
  const V = () => new THREE.Vector3(), Qn = () => new THREE.Quaternion();
  const aim = (bone, child, tgt) => { root.updateMatrixWorld(true); const bp = bone.getWorldPosition(V()), cp = child.getWorldPosition(V());
    const q = Qn().setFromUnitVectors(cp.sub(bp).normalize(), tgt.clone().sub(bp).normalize()); const pq = bone.parent.getWorldQuaternion(Qn()), bq = bone.getWorldQuaternion(Qn());
    bone.quaternion.copy(pq.invert().multiply(q.multiply(bq))); root.updateMatrixWorld(true); };
  root.updateMatrixWorld(true);
  const S = up.getWorldPosition(V()), E0 = lo.getWorldPosition(V()), H0 = ha.getWorldPosition(V());
  const a = S.distanceTo(E0), c = E0.distanceTo(H0); let d = Math.min(S.distanceTo(target), a + c - 1e-3);
  const n = target.clone().sub(S).normalize(); const cosA = (a * a + d * d - c * c) / (2 * a * d); const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const pp = pole.clone().sub(n.clone().multiplyScalar(pole.dot(n))).normalize();
  const E = S.clone().addScaledVector(n, a * cosA).addScaledVector(pp, a * sinA);
  aim(up, lo, E); aim(lo, ha, S.clone().addScaledVector(n, d));
}
// rotate a bone about a world axis
export function rotBoneWorld(root, bone, axis, ang) { root.updateMatrixWorld(true); const qW = new THREE.Quaternion().setFromAxisAngle(axis, ang); const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()); const bq = bone.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pq.invert().multiply(qW.multiply(bq))); root.updateMatrixWorld(true); }

// ---------------------------------------------------------------- Mimik (prozedurale Morph-Targets; die UBC-Köpfe haben keine Blendshapes)
// face.set({ smileL, smileR, frown, jawOpen, blink, wide, squint, lookL, lookR, lookUp, lookDown, browsUp, browsInnerUp, browsAngry })
// face.expr('happy' | 'laugh' | 'sad' | 'angry' | 'surprised' | 'shocked' | 'smirk' | 'sideeye' | 'awkward' | 'neutral', staerke)
export const EXPRESSIONS = {
  neutral: {}, happy: { smileL: 1, smileR: 1, squint: 0.25, browsUp: 0.2 }, laugh: { smileL: 1, smileR: 1, jawOpen: 0.6, squint: 0.5, browsUp: 0.3 },
  sad: { frown: 1, browsInnerUp: 1, squint: 0.2, lookDown: 0.35 }, angry: { browsAngry: 1, frown: 0.5, squint: 0.35 },
  surprised: { browsUp: 1, wide: 0.8, jawOpen: 0.45 }, shocked: { browsUp: 1, wide: 1, jawOpen: 0.85 }, smirk: { smileL: 0.9, browsAngry: 0.15, squint: 0.15 },
  sideeye: { lookL: 1, browsAngry: 0.35, squint: 0.25, smileR: 0.15 }, awkward: { smileL: 0.55, smileR: 0.35, browsInnerUp: 0.6 },
};
const FACE_LM = { male: { mouthY: 1.6245, cornerX: 0.031, cornerY: 1.6205, frontZ: 0.095, chinY: 1.587 }, female: { mouthY: 1.583, cornerX: 0.030, cornerY: 1.5805, frontZ: 0.097, chinY: 1.548 } };
const FACE_DONE = new WeakSet();
const smooth01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const JAW = { dy: 0.015, dz: 0.0035 }; // Unterkiefer-Weg bei jawOpen = 1 (Meter)
// Lippen-Analyse (einmal pro Kopf-Geometrie). Die UBC-Köpfe haben nach innen gerollte Lippen; ihre tiefsten Reihen sind mit einem
// schmalen Streifen verbunden, der den Mund schließt. Ergebnis: Naht-Höhe, Tiefe/Breite des Mundes, je Vertex ein Gewicht
// „gehört zum Unterkiefer“ (Geodäten-Distanz zur unteren vs. oberen Lippenreihe) und eine Maske (1 = Verschluss-Streifen, 0…0,6 = Lippen-Innenseite).
function lipInfo(geo, L) {
  if (geo.userData.lipInfo) return geo.userData.lipInfo;
  const P = geo.attributes.position, n = P.count, X = (i) => P.getX(i), Y = (i) => P.getY(i), Z = (i) => P.getZ(i);
  let minZ = 1; const reg = [];
  for (let i = 0; i < n; i++) if (Math.abs(X(i)) < 0.032 && Math.abs(Y(i) - L.mouthY) < 0.006 && Z(i) > 0.04) { reg.push(i); minZ = Math.min(minZ, Z(i)); }
  const deep = reg.filter(i => Z(i) < minZ + 0.0015);
  let s0 = 0, s1 = 0, s2 = 0, t0 = 0, t1 = 0; for (const i of deep) { const q = X(i) ** 2, y = Y(i); s0++; s1 += q; s2 += q * q; t0 += y; t1 += q * y; }
  const det = (s0 * s2 - s1 * s1) || 1e-12, fa = (t0 * s2 - s1 * t1) / det, fb = (s0 * t1 - s1 * t0) / det;
  const isUp = (i) => Y(i) > fa + fb * X(i) ** 2;
  const xEnd = Math.max(...deep.map(i => Math.abs(X(i)))), innerZ = deep.reduce((s, i) => s + Z(i), 0) / deep.length;
  const cu = deep.filter(i => Math.abs(X(i)) < 0.0035 && isUp(i)), cl = deep.filter(i => Math.abs(X(i)) < 0.0035 && !isUp(i));
  const seamY = cu.length && cl.length ? (Math.min(...cu.map(Y)) + Math.max(...cl.map(Y))) / 2 : fa;
  // Nachbarschaft rund um den Mund (Vertices mit gleicher Position verschweißt), Verschluss-Kanten oben<->unten entfernt
  const canon = new Int32Array(n).fill(-1), rep = [], keyOf = new Map();
  for (let i = 0; i < n; i++) { if (!(Math.abs(X(i)) < 0.08 && Y(i) > L.chinY - 0.08 && Y(i) < L.mouthY + 0.06 && Z(i) > 0)) continue;
    const k = Math.round(X(i) * 1e5) + ',' + Math.round(Y(i) * 1e5) + ',' + Math.round(Z(i) * 1e5); let c = keyOf.get(k); if (c === undefined) { c = rep.length; keyOf.set(k, c); rep.push(i); } canon[i] = c; }
  const m = rep.length, adj = Array.from({ length: m }, () => []), up = new Uint8Array(m), lo = new Uint8Array(m);
  for (const i of deep) (isUp(i) ? up : lo)[canon[i]] = 1;
  const ix = geo.index ? geo.index.array : null;
  if (ix) for (let t = 0; t < ix.length; t += 3) for (let e = 0; e < 3; e++) { const a = canon[ix[t + e]], b = canon[ix[t + (e + 1) % 3]]; if (a < 0 || b < 0 || a === b || (up[a] && lo[b]) || (lo[a] && up[b])) continue;
    const ia = rep[a], ib = rep[b], d = Math.hypot(X(ia) - X(ib), Y(ia) - Y(ib), Z(ia) - Z(ib)); adj[a].push(b, d); adj[b].push(a, d); }
  // Flutfüllung je Lippe ab ihrer innersten Reihe, nur im Lippenband und ohne die Mundwinkel (dort hängen beide Lippen zusammen)
  const xIn = xEnd - 0.001, inBand = (c) => { const i = rep[c]; return Math.abs(X(i)) < xIn && Math.abs(Y(i) - seamY) < 0.008 && Z(i) > innerZ - 0.001; };
  const flood = (seed, block) => { const hit = new Uint8Array(m), st = []; for (let c = 0; c < m; c++) if (seed[c]) { hit[c] = 1; st.push(c); }
    while (st.length) { const u = st.pop(), A = adj[u]; for (let k = 0; k < A.length; k += 2) { const v = A[k]; if (!hit[v] && !block[v] && inBand(v)) { hit[v] = 1; st.push(v); } } } return hit; };
  const hU = flood(up, lo), hL = flood(lo, up);
  const lowerW = new Float32Array(n), mask = new Float32Array(n), zf = (x) => L.frontZ - 0.003 - 20 * x * x;
  // Lippenlinie vorne (Berührung Ober-/Unterlippe) aus den gefluteten Lippen
  let upMin = Infinity, loMax = -Infinity; for (let i = 0; i < n; i++) { const c = canon[i]; if (c < 0 || Math.abs(X(i)) > 0.015 || Z(i) < innerZ + 0.012) continue; if (hU[c] && !hL[c]) upMin = Math.min(upMin, Y(i)); if (hL[c] && !hU[c]) loMax = Math.max(loMax, Y(i)); }
  const lipLine = isFinite(upMin) && isFinite(loMax) ? (upMin + loMax) / 2 : seamY;
  for (let i = 0; i < n; i++) { const c = canon[i];
    // Lippen: aus der Flutfüllung; alles andere (Wangen, Kinn, Mundwinkel): weich über/unter der Lippenlinie
    lowerW[i] = c >= 0 && (hU[c] || hL[c]) ? (hU[c] && hL[c] ? 0.5 : hL[c] ? 1 : 0) : smooth01((lipLine - Y(i)) / 0.004 + 0.5);
    const ax = Math.abs(X(i)); if (ax < xEnd + 0.002 && Math.abs(Y(i) - seamY) < 0.009 && Z(i) > 0.04) { const t = (zf(ax) - Z(i)) / Math.max(0.004, zf(ax) - innerZ); if (t > 0) mask[i] = 0.6 * Math.min(1, t) ** 1.5; } }
  for (const i of deep) { mask[i] = 1; lowerW[i] = isUp(i) ? 0 : 1; }
  // Lippen-Innenseite: Tiefe 0 (Lippenrand) … 1 (innerste Reihe) – für das Abrollen der Unterlippe beim Öffnen
  const foldT = new Float32Array(n);
  for (let i = 0; i < n; i++) { const ax = Math.abs(X(i)); if (ax < xEnd && Math.abs(Y(i) - seamY) < 0.007 && Z(i) > innerZ - 0.0005) foldT[i] = Math.max(0, Math.min(1, (zf(ax) - Z(i)) / Math.max(0.004, zf(ax) - innerZ))); }
  // sichtbare Lippenlinie (wo sich Ober- und Unterlippe vorne berühren) und Tiefe der Lippenvorderkante
  let zLip = 0; for (let i = 0; i < n; i++) if (Math.abs(X(i)) < 0.004 && Math.abs(Y(i) - lipLine) < 0.0015) zLip = Math.max(zLip, Z(i));
  return (geo.userData.lipInfo = { seamY, innerZ, xEnd, lowerW, mask, foldT, lipLine, zLip: zLip || L.frontZ - 0.004, rows: deep.length });
}
// Zahn-Textur: Schneidezähne in der Mitte breiter, zu den Seiten und zum Zahnfleisch hin dunkler (liegt tiefer im Mund)
let TEETH_TEX = null;
function teethTexture() { if (TEETH_TEX) return TEETH_TEX; const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#f2ece0'; g.fillRect(0, 0, 512, 64);
  const eg = g.createLinearGradient(0, 64, 0, 40); eg.addColorStop(0, 'rgba(196,202,214,0.6)'); eg.addColorStop(1, 'rgba(196,202,214,0)'); g.fillStyle = eg; g.fillRect(0, 40, 512, 24);
  const bounds = [0.5]; for (const d of [0.075, 0.14, 0.2, 0.255, 0.305, 0.35, 0.39, 0.43, 0.465]) bounds.push(0.5 - d, 0.5 + d);
  for (const u of bounds) { const x = u * 512, lg = g.createLinearGradient(x - 3, 0, x + 3, 0); lg.addColorStop(0, 'rgba(110,85,70,0)'); lg.addColorStop(0.5, 'rgba(110,85,70,0.55)'); lg.addColorStop(1, 'rgba(110,85,70,0)'); g.fillStyle = lg; g.fillRect(x - 3, 0, 6, 64); }
  const sg = g.createLinearGradient(0, 0, 512, 0); sg.addColorStop(0, 'rgba(30,12,12,0.85)'); sg.addColorStop(0.28, 'rgba(30,12,12,0)'); sg.addColorStop(0.72, 'rgba(30,12,12,0)'); sg.addColorStop(1, 'rgba(30,12,12,0.85)'); g.fillStyle = sg; g.fillRect(0, 0, 512, 64);
  const tg = g.createLinearGradient(0, 0, 0, 22); tg.addColorStop(0, 'rgba(60,25,25,0.55)'); tg.addColorStop(1, 'rgba(60,25,25,0)'); g.fillStyle = tg; g.fillRect(0, 0, 512, 22);
  TEETH_TEX = new THREE.CanvasTexture(c); TEETH_TEX.colorSpace = THREE.SRGBColorSpace; TEETH_TEX.anisotropy = 4; return TEETH_TEX; }
function faceRig(sex, body, eyes, brows) {
  const L = FACE_LM[sex]; const G = (d, r) => Math.exp(-(d / r) * (d / r));
  const morph = (mesh, names, fn) => { if (!mesh) return; const g = mesh.geometry; if (!FACE_DONE.has(g)) { const P = g.attributes.position, n = P.count; const arrs = names.map(() => new Float32Array(n * 3)); const v = new THREE.Vector3();
      for (let i = 0; i < n; i++) { v.fromBufferAttribute(P, i); fn(v, i, (k, dx, dy, dz) => { const a = arrs[k]; a[i * 3] += dx; a[i * 3 + 1] += dy; a[i * 3 + 2] += dz; }); }
      g.morphAttributes.position = arrs.map(a => new THREE.Float32BufferAttribute(a, 3)); g.morphTargetsRelative = true; FACE_DONE.add(g); }
    mesh.morphTargetDictionary = {}; names.forEach((nm, k) => mesh.morphTargetDictionary[nm] = k); mesh.morphTargetInfluences = names.map(() => 0); };
  // --- face (body mesh): jawOpen, smileL, smileR, frown
  const BODY = ['jawOpen', 'smileL', 'smileR', 'frown', 'lipRoll']; // lipRoll wird automatisch aus jawOpen gesetzt
  const LI = body ? lipInfo(body.geometry, L) : null;
  if (body && !body.geometry.attributes.mouthMask) body.geometry.setAttribute('mouthMask', new THREE.BufferAttribute(LI.mask, 1));
  morph(body, BODY, (v, i, add) => { if (v.z < 0.03 || v.y < L.chinY - 0.06 || v.y > L.mouthY + 0.07) return; const ax = Math.abs(v.x), s = Math.sign(v.x) || 1;
    // Unterkiefer: Unterlippe + Kinn nach unten. An den Lippen linsenförmig (Mundwinkel bleiben zu), weiter unten voll.
    const wl = LI.lowerW[i], lens = Math.max(0, 1 - (ax / (LI.xEnd + 0.001)) ** 2) ** 0.8, below = smooth01((LI.lipLine - v.y - 0.003) / 0.012);
    const wj = wl * (lens + (1 - lens) * below) * Math.exp(-((ax / 0.055) ** 4)) * Math.min(1, Math.max(0, (v.y - (L.chinY - 0.04)) / 0.03));
    if (wj > 0) add(0, 0, -JAW.dy * wj, -JAW.dz * wj);
    // Oberlippe hebt sich ein wenig (zeigt die oberen Zähne)
    if (wl < 1) { const fx = Math.exp(-((ax / (L.cornerX * 1.1)) ** 6)); add(0, 0, 0.003 * (1 - wl) * fx * G(v.y - LI.seamY, 0.008), 0); }
    // Unterlippe rollt innen nach unten ab (sonst verdeckt ihre Innenseite die unteren Zähne)
    if (LI.foldT[i] > 0 && wl > 0) add(4, 0, -0.0025 * LI.foldT[i] * wl, -0.0004 * LI.foldT[i] * wl);
    // smile: corner up/out/back + cheek bulge (per side)
    const d = Math.hypot(ax - L.cornerX, v.y - L.cornerY); const w = G(d, 0.014); const dk = Math.hypot(ax - (L.cornerX + 0.012), v.y - (L.cornerY + 0.02)); const wk = G(dk, 0.018);
    const k = s > 0 ? 1 : 2; add(k, s * 0.0042 * w, 0.0115 * w + 0.0065 * wk, -0.0025 * w + 0.0035 * wk);
    // frown: corners down
    add(3, 0, -0.0105 * w, 0.0005 * w); });
  // --- eyes: blink, wide, squint, look
  const EYES = ['blink', 'wide', 'squint', 'lookL', 'lookR', 'lookUp', 'lookDown'];
  if (eyes) { const P = eyes.geometry.attributes.position; const c = { l: new THREE.Vector3(), r: new THREE.Vector3() }, n = { l: 0, r: 0 }; const v = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const sd = v.x > 0 ? 'l' : 'r'; c[sd].add(v); n[sd]++; } c.l.divideScalar(n.l || 1); c.r.divideScalar(n.r || 1);
    const rot = (v, cc, axis, a) => v.clone().sub(cc).applyAxisAngle(axis, a).add(cc).sub(v);
    morph(eyes, EYES, (v, i, add) => { const cc = v.x > 0 ? c.l : c.r; const dy = v.y - cc.y, dx = v.x - cc.x;
      add(0, 0, -dy * 0.92, -0.002); add(1, dx * 0.06, dy * 0.2, 0); add(2, 0, -dy * 0.42, 0);
      let r = rot(v, cc, new THREE.Vector3(0, 1, 0), 0.32); add(3, r.x, r.y, r.z); r = rot(v, cc, new THREE.Vector3(0, 1, 0), -0.32); add(4, r.x, r.y, r.z);
      r = rot(v, cc, new THREE.Vector3(1, 0, 0), -0.25); add(5, r.x, r.y, r.z); r = rot(v, cc, new THREE.Vector3(1, 0, 0), 0.25); add(6, r.x, r.y, r.z); }); }
  // --- brows
  const BROWS = ['browsUp', 'browsInnerUp', 'browsAngry'];
  morph(brows, BROWS, (v, i, add) => { const u = Math.min(1, Math.abs(v.x) / 0.062), s = Math.sign(v.x) || 1;
    add(0, 0, 0.0065, 0.0005); add(1, -s * 0.0012 * (1 - u), 0.011 * Math.pow(1 - u, 1.3), 0); add(2, -s * 0.003 * (1 - u), -0.0085 * Math.pow(1 - u, 1.2) + 0.0025 * u, 0.0018 * (1 - u)); });
  // --- Zähne, Zunge, Mundraum: am Kopf-Knochen, direkt hinter den eingerollten Lippen.
  // Unterkiefer-Teile folgen jawOpen (Morph 0) mit derselben Verschiebung wie die Unterlippe.
  let teeth = null;
  if (body) { const hi = body.skeleton.bones.findIndex(bn => bn.name === 'Head');
    const ly = LI.lipLine, zl = LI.zLip, xe = LI.xEnd;
    const arch = (R, zFront, y0, y1, xw) => { const th = 2 * Math.asin(Math.min(0.99, xw / R)); const g = new THREE.CylinderGeometry(R, R, y1 - y0, 40, 3, true, Math.PI / 2 - th / 2, th); g.rotateY(-Math.PI / 2); g.translate(0, (y0 + y1) / 2, zFront - R); return g; };
    const parts = []; // [Geometrie, Material, Kiefer-Gewicht(y), Textur spiegeln]
    parts.push([arch(0.03, zl - 0.0075, ly - 0.0032, ly + 0.0078, xe + 0.001), 0, () => 0, false]); // obere Zahnreihe (knapp hinter der Oberlippe)
    parts.push([arch(0.028, zl - 0.009, ly - 0.010, ly + 0.0002, xe - 0.001), 3, () => 1, true]);   // untere Zahnreihe (hinter der oberen)
    const tg = new THREE.SphereGeometry(1, 18, 10); tg.scale(0.0165, 0.0045, 0.018); tg.translate(0, ly - 0.0068, zl - 0.031); parts.push([tg, 1, () => 1, false]); // Zunge
    const cy = ly + 0.002, cav = new THREE.SphereGeometry(1, 24, 16); cav.scale(xe + 0.0075, 0.015, 0.03); cav.translate(0, cy, zl - 0.034); parts.push([cav, 2, (y) => smooth01((cy - y) / 0.006), false]); // dunkler Mundraum
    const pos = [], nor = [], uv = [], wj = [], geo = new THREE.BufferGeometry(); let off = 0;
    for (const [g0, mi, wf, flip] of parts) { const g = g0.index ? g0.toNonIndexed() : g0; const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv;
      for (let i = 0; i < P.count; i++) { pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); uv.push(U.getX(i), flip ? 1 - U.getY(i) : U.getY(i)); wj.push(wf(P.getY(i))); }
      geo.addGroup(off, P.count, mi); off += P.count; }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const n = pos.length / 3, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4); for (let i = 0; i < n; i++) { si[i * 4] = hi; sw[i * 4] = 1; }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    const md = new Float32Array(n * 3); for (let i = 0; i < n; i++) { md[i * 3 + 1] = -JAW.dy * wj[i]; md[i * 3 + 2] = -JAW.dz * wj[i]; }
    geo.morphAttributes.position = [new THREE.Float32BufferAttribute(md, 3)]; geo.morphTargetsRelative = true;
    const tt = teethTexture();
    teeth = new THREE.SkinnedMesh(geo, [
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: tt, roughness: 0.42, envMapIntensity: 0.4, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x9c4a55, roughness: 0.5 }),
      new THREE.MeshBasicMaterial({ color: 0x1a0608, side: THREE.BackSide }),
      new THREE.MeshStandardMaterial({ color: 0xd9d2c6, map: tt, roughness: 0.45, envMapIntensity: 0.4, side: THREE.DoubleSide })]);
    teeth.bind(body.skeleton, body.bindMatrix); teeth.frustumCulled = false; teeth.morphTargetInfluences = [0]; body.parent.add(teeth); teeth.visible = false;
    if (typeof location !== 'undefined' && location.search.includes('teethdbg')) { teeth.material.forEach(m => { m.color.set(0xff0000); m.map = null; m.depthTest = false; if (m.emissive) m.emissive = new THREE.Color(0x660000); }); teeth.renderOrder = 999; } }
  const meshes = [[body, BODY], [eyes, EYES], [brows, BROWS]];
  const face = {
    set(vals) { for (const [m, names] of meshes) if (m) names.forEach((nm, k) => { if (nm in vals) m.morphTargetInfluences[k] = vals[nm]; }); if ('jawOpen' in vals && body) { body.material.userData.uMouthOpen.value = vals.jawOpen; body.morphTargetInfluences[4] = Math.min(1, vals.jawOpen * 4); if (teeth) { teeth.morphTargetInfluences[0] = vals.jawOpen; teeth.visible = vals.jawOpen > 0.015; } } return face; },
    reset() { for (const [m, names] of meshes) if (m) m.morphTargetInfluences.fill(0); if (body) body.material.userData.uMouthOpen.value = 0; if (teeth) { teeth.morphTargetInfluences[0] = 0; teeth.visible = false; } return face; },
    expr(name, k = 1, extra = {}) { face.reset(); const e = EXPRESSIONS[name] || {}; const vals = {}; for (const key in e) vals[key] = e[key] * k; face.set({ ...vals, ...extra }); return face; },
  };
  return face;
}

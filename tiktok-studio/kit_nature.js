// kit_nature.js – stylized clumpy trees, hedges, shrubs and grass tufts
import * as THREE from 'three';
import { makeRng, taperTube, blobGeo, std, add } from './kit_world.js';

// Schatten-Stellvertreter: Laub wirft seinen Schatten über eine einfache Form (Ebene 3, nur für Schattenkameras sichtbar).
// Spart beim Video-Rendern sehr viel Zeit; kit_look schaltet Ebene 3 für alle Schattenkameras frei.
export const SHADOW_PROXY_LAYER = 3;
let USE_PROXY = true; export function useShadowProxies(v) { USE_PROXY = v; }
const proxyMat = new THREE.MeshBasicMaterial();
function shadowProxy(parent, geo, x, y, z, sx, sy, sz) { const m = new THREE.Mesh(geo, proxyMat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = false; m.layers.set(SHADOW_PROXY_LAYER); parent.add(m); return m; }
const PROXY_SPHERE = new THREE.SphereGeometry(1, 12, 9);

const leafMat = () => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0 });
  // cheap fake subsurface: lift the shadowed side a little with the leaf colour
  m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * 0.035;'); };
  m.customProgramCacheKey = () => 'leaf'; return m; };

// o: { h, crown, seed, palette:[hex], trunk, clumps, squash }
export function makeTree(o = {}) {
  const r = makeRng(o.seed ?? 1), g = new THREE.Group(); const H = o.h ?? 7, k = H / 7;
  const bark = std(o.trunk ?? 0x4a3b30, 0.92);
  const trunkH = H * (o.trunkFrac ?? 0.42);
  const top = new THREE.Vector3((r() - 0.5) * 0.35 * k, trunkH, (r() - 0.5) * 0.35 * k);
  add(g, taperTube(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.05, 0), new THREE.Vector3((r() - 0.5) * 0.15, trunkH * 0.5, (r() - 0.5) * 0.15), top]), 0.21 * k, 0.13 * k, 14, 12), bark);
  // root flare
  add(g, new THREE.CylinderGeometry(0.2 * k, 0.34 * k, 0.35 * k, 12), bark, 0, 0.12 * k, 0);
  const CR = o.crown ?? H * 0.37; const C = new THREE.Vector3(top.x, trunkH + CR * 0.85, top.z);
  const ends = []; const nb = 5 + Math.floor(r() * 3);
  for (let i = 0; i < nb; i++) { const a = i / nb * 6.283 + r() * 0.7; const end = new THREE.Vector3(C.x + Math.cos(a) * CR * 0.62, C.y + (r() - 0.35) * CR * 0.7, C.z + Math.sin(a) * CR * 0.62);
    const start = top.clone().add(new THREE.Vector3(0, -0.25 * k, 0)); const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.35 * k, 0));
    add(g, taperTube(new THREE.CatmullRomCurve3([start, mid, end]), 0.085 * k, 0.025 * k, 10, 6), bark); ends.push(end); }
  const N = o.clumps ?? 90; const geo = blobGeo(2, 0.2, 2.3, o.seed ?? 1);
  const im = new THREE.InstancedMesh(geo, leafMat(), N); im.castShadow = true; im.receiveShadow = true;
  const d = new THREE.Object3D(), col = new THREE.Color(), sq = o.squash ?? 0.82;
  for (let i = 0; i < N; i++) {
    // point on / inside an ellipsoid shell
    let v; do { v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1); } while (v.lengthSq() > 1 || v.lengthSq() < 0.05);
    const shell = i < N * 0.72 ? 0.82 + r() * 0.18 : 0.35 + r() * 0.4; v.normalize().multiplyScalar(shell);
    d.position.set(C.x + v.x * CR, C.y + v.y * CR * sq, C.z + v.z * CR);
    const s = (0.3 + r() * 0.16) * CR * (o.clumpScale ?? 1); d.scale.set(s, s * 0.82, s); d.rotation.set(r() * 6.3, r() * 6.3, r() * 6.3); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    const pal = o.palette ?? [0x4f7a2a, 0x6b8f30, 0x3d6324]; col.set(pal[Math.floor(r() * pal.length)]);
    const yk = (v.y + 1) / 2; col.multiplyScalar(0.62 + 0.5 * yk + (r() - 0.5) * 0.12); im.setColorAt(i, col);
  }
  g.add(im); g.userData.crownCenter = C; g.userData.crownR = CR;
  if (USE_PROXY) { im.castShadow = false; shadowProxy(g, PROXY_SPHERE, C.x, C.y, C.z, CR * 0.95, CR * sq * 0.95, CR * 0.95); }
  return g;
}

// hedge segment along local x: length, height, depth
export function makeHedge(len, h, dep, o = {}) {
  const r = makeRng(o.seed ?? 5), g = new THREE.Group();
  const base = o.color ?? 0x2d4a22;
  add(g, new THREE.BoxGeometry(len - 0.12, h - 0.1, dep - 0.12), std(new THREE.Color(base).multiplyScalar(0.55), 0.95), 0, (h - 0.1) / 2, 0);
  const areaTop = len * dep, areaSide = len * h, areaEnd = dep * h; const tot = areaTop + 2 * areaSide + 2 * areaEnd; const N = Math.round(tot * (o.density ?? 115));
  const geo = blobGeo(2, 0.22, 3.0, (o.seed ?? 5) + 1); const im = new THREE.InstancedMesh(geo, leafMat(), N); im.castShadow = true; im.receiveShadow = true;
  const d = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < N; i++) { const t = r() * tot; let x, y, z;
    if (t < areaTop) { x = (r() - 0.5) * len; z = (r() - 0.5) * dep; y = h - 0.05 + (r() - 0.5) * 0.06; }
    else if (t < areaTop + 2 * areaSide) { x = (r() - 0.5) * len; y = r() * h; z = (r() < 0.5 ? -1 : 1) * (dep / 2 - 0.04); }
    else { z = (r() - 0.5) * dep; y = r() * h; x = (r() < 0.5 ? -1 : 1) * (len / 2 - 0.04); }
    d.position.set(x, Math.max(0.08, y), z); const s = 0.055 + r() * 0.06; d.scale.set(s, s * 0.85, s); d.rotation.set(r() * 6, r() * 6, r() * 6); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    col.set(base).multiplyScalar(0.8 + r() * 0.55 + (y / h) * 0.35); if (r() < 0.12) col.offsetHSL(0.03, 0, 0.04); im.setColorAt(i, col); }
  if (USE_PROXY) im.castShadow = false;
  g.add(im); return g;
}

// round shrub (boxwood ball / bush)
export function makeShrub(rad, o = {}) {
  const r = makeRng(o.seed ?? 9), g = new THREE.Group(); const base = o.color ?? 0x31502a;
  const N = o.n ?? Math.round(30 * rad * rad + 10); const geo = blobGeo(1, 0.25, 3, (o.seed ?? 9) + 3);
  const im = new THREE.InstancedMesh(geo, leafMat(), N); im.castShadow = true; im.receiveShadow = true; const d = new THREE.Object3D(), col = new THREE.Color();
  add(g, new THREE.SphereGeometry(rad * 0.85, 16, 12), std(new THREE.Color(base).multiplyScalar(0.5), 0.95), 0, rad * 0.9, 0);
  for (let i = 0; i < N; i++) { const v = new THREE.Vector3(r() * 2 - 1, r() * 1.4 - 0.4, r() * 2 - 1).normalize(); d.position.set(v.x * rad * 0.92, rad * 0.9 + v.y * rad * 0.85, v.z * rad * 0.92); const s = rad * (0.24 + r() * 0.12); d.scale.setScalar(s); d.rotation.set(r() * 6, r() * 6, r() * 6); d.updateMatrix(); im.setMatrixAt(i, d.matrix); col.set(o.palette ? o.palette[i % o.palette.length] : base).multiplyScalar(0.75 + r() * 0.45 + v.y * 0.15); im.setColorAt(i, col); }
  if (USE_PROXY) im.castShadow = false;
  g.add(im); return g;
}

// grass tufts scattered in a rectangle (local xz), skipping where skip(x,z) is true
export function makeGrass(w, d, n, o = {}) {
  const r = makeRng(o.seed ?? 13);
  // tuft geometry: 7 bent blades
  const pos = [], cols = [];
  for (let b = 0; b < 7; b++) { const a = b / 7 * 6.28 + r(); const lean = 0.25 + r() * 0.35, hgt = 0.09 + r() * 0.08, wd = 0.012; const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx; const ox = dx * 0.02, oz = dz * 0.02;
    const p0 = [ox - px * wd, 0, oz - pz * wd], p1 = [ox + px * wd, 0, oz + pz * wd], p2 = [ox + dx * lean * hgt, hgt, oz + dz * lean * hgt];
    pos.push(...p0, ...p1, ...p2); cols.push(0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 1.15, 1.15, 1.15); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const nrm = geo.attributes.normal; for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(geo, mat, n); im.receiveShadow = true; const dm = new THREE.Object3D(), col = new THREE.Color(); let k = 0;
  const pal = o.palette ?? [0x3f6b25, 0x507d2c, 0x2f5520, 0x62893a];
  for (let i = 0; i < n * 3 && k < n; i++) { const x = (r() - 0.5) * w, z = (r() - 0.5) * d; if (o.skip && o.skip(x, z)) continue; dm.position.set(x, 0, z); dm.rotation.y = r() * 6.3; const s = 0.8 + r() * 0.7; dm.scale.set(s, s * (0.8 + r() * 0.6), s); dm.updateMatrix(); im.setMatrixAt(k, dm.matrix); col.set(pal[k % pal.length]).multiplyScalar(0.8 + r() * 0.35); im.setColorAt(k, col); k++; }
  im.count = k; return im;
}

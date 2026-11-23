// kit_world.js – procedural textures, triplanar materials and small helpers for the "game look" world
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function makeRng(seed = 1) { let s = (seed >>> 0) % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const R = makeRng(4242);

export function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function tex(c, srgb = true) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; return t; }

// tileable fBm value noise -> Float32Array in [0,1]
export function fbm(w, h, cells = 4, oct = 4, rnd = R, gain = 0.5) {
  const out = new Float32Array(w * h); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) {
    const n = cells << o; const g = new Float32Array(n * n); for (let i = 0; i < n * n; i++) g[i] = rnd();
    for (let y = 0; y < h; y++) { const fy = y / h * n, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = (y0 + 1) % n;
      for (let x = 0; x < w; x++) { const fx = x / w * n, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % n;
        const a = g[y0 * n + x0], b = g[y0 * n + x1], c = g[y1 * n + x0], d = g[y1 * n + x1];
        out[y * w + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy); } }
    tot += amp; amp *= gain; }
  for (let i = 0; i < w * h; i++) out[i] /= tot; return out;
}
function putGray(c, f) { const g = c.getContext('2d'); const id = g.createImageData(c.width, c.height); for (let i = 0; i < c.width * c.height; i++) { const v = Math.max(0, Math.min(255, f(i) * 255)); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); return g; }
function putRGB(c, f) { const g = c.getContext('2d'); const id = g.createImageData(c.width, c.height); for (let i = 0; i < c.width * c.height; i++) { const [r, gg, b] = f(i); id.data[i * 4] = Math.max(0, Math.min(255, r * 255)); id.data[i * 4 + 1] = Math.max(0, Math.min(255, gg * 255)); id.data[i * 4 + 2] = Math.max(0, Math.min(255, b * 255)); id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); return g; }

// ---------------------------------------------------------------- textures (lazy, cached)
const cache = {};
export const T = new Proxy({}, { get(_, k) { if (!cache[k]) cache[k] = GEN[k](); return cache[k]; } });
const GEN = {
  // fine exterior plaster (2 m per tile) – grey, tinted by material colour
  plaster() { const S = 512, n1 = fbm(S, S, 3, 5), n2 = fbm(S, S, 48, 2), n3 = fbm(S, S, 6, 3);
    const m = cnv(S, S), b = cnv(S, S);
    putGray(m, i => 0.9 + (n1[i] - 0.5) * 0.12 + (n2[i] - 0.5) * 0.07 - Math.max(0, n3[i] - 0.62) * 0.35);
    putGray(b, i => 0.5 + (n2[i] - 0.5) * 1.2 + (n1[i] - 0.5) * 0.3);
    return { map: tex(m), bump: tex(b, false) }; },
  // concrete sidewalk slabs 30x30 cm (2.4 m per tile)
  pavers() { const S = 512, n = fbm(S, S, 8, 4), nf = fbm(S, S, 64, 2), r = makeRng(7); const cell = 64; const shade = []; for (let i = 0; i < 64; i++) shade.push((r() - 0.5) * 0.09 - (r() < 0.08 ? 0.07 : 0));
    const m = cnv(S, S), b = cnv(S, S);
    const joint = (x, y) => { const jx = x % cell, jy = y % cell; return Math.min(jx, cell - 1 - jx, jy, cell - 1 - jy); };
    putGray(m, i => { const x = i % S, y = (i / S) | 0; const j = joint(x, y); const s = shade[((y / cell) | 0) * 8 + ((x / cell) | 0)]; let v = 0.6 + s + (n[i] - 0.5) * 0.12 + (nf[i] - 0.5) * 0.08; if (j < 1.5) v = 0.28; else if (j < 3) v -= 0.06; return v; });
    putGray(b, i => { const x = i % S, y = (i / S) | 0; const j = joint(x, y); return j < 1.5 ? 0.0 : j < 3 ? 0.5 : 0.8 + (nf[i] - 0.5) * 0.3; });
    return { map: tex(m), bump: tex(b, false) }; },
  // interlocking driveway pavers (2 m per tile)
  pflaster() { const S = 512, nf = fbm(S, S, 64, 2), r = makeRng(11); const bw = 64, bh = 32; const sh = []; for (let i = 0; i < 300; i++) sh.push((r() - 0.5) * 0.14);
    const m = cnv(S, S), b = cnv(S, S);
    const f = (x, y) => { const row = (y / bh) | 0; const xo = (x + (row % 2) * bw / 2) % S; const jx = xo % bw, jy = y % bh; return [Math.min(jx, bw - 1 - jx, jy, bh - 1 - jy), row * 9 + ((xo / bw) | 0)]; };
    putRGB(m, i => { const x = i % S, y = (i / S) | 0; const [j, id] = f(x, y); let v = 0.52 + sh[id % 300] + (nf[i] - 0.5) * 0.1; if (j < 1.5) v = 0.22; else if (j < 4) v -= (4 - j) * 0.04; return [v * 1.04, v * 0.98, v * 0.93]; });
    putGray(b, i => { const x = i % S, y = (i / S) | 0; const [j] = f(x, y); return j < 1.5 ? 0 : Math.min(1, j / 5) * 0.8 + (nf[i] - 0.5) * 0.2; });
    return { map: tex(m), bump: tex(b, false) }; },
  // asphalt (4 m per tile)
  asphalt() { const S = 1024, n = fbm(S, S, 4, 5), nf = fbm(S, S, 128, 1), r = makeRng(3);
    const m = cnv(S, S), b = cnv(S, S);
    const g = putGray(m, i => 0.2 + (n[i] - 0.5) * 0.09 + (nf[i] - 0.5) * 0.07);
    for (let i = 0; i < 26000; i++) { const v = r(); g.fillStyle = v < 0.5 ? `rgba(200,200,205,${0.15 + r() * 0.25})` : `rgba(10,10,12,${0.2 + r() * 0.3})`; g.fillRect(r() * S, r() * S, 1 + r() * 1.5, 1 + r() * 1.5); }
    // a few repaired patches + cracks
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(25,25,28,0.35)'; const x = r() * S, y = r() * S; g.fillRect(x, y, 120 + r() * 200, 80 + r() * 160); }
    g.strokeStyle = 'rgba(8,8,10,0.6)'; g.lineWidth = 1.6; for (let i = 0; i < 14; i++) { g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
    const gb = putGray(b, i => 0.5 + (nf[i] - 0.5) * 0.8);
    for (let i = 0; i < 20000; i++) { gb.fillStyle = r() < 0.6 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'; gb.fillRect(r() * S, r() * S, 1.5, 1.5); }
    return { map: tex(m), bump: tex(b, false) }; },
  // lawn (2 m per tile)
  grass() { const S = 512, n = fbm(S, S, 4, 4), r = makeRng(5);
    const m = cnv(S, S); const g = putRGB(m, i => { const v = n[i]; return [0.16 + v * 0.08, 0.3 + v * 0.14, 0.09 + v * 0.04]; });
    for (let i = 0; i < 26000; i++) { const x = r() * S, y = r() * S, l = 3 + r() * 6, a = r() * 6.28; const k = r(); g.strokeStyle = `rgba(${(30 + k * 70) | 0},${(70 + k * 90) | 0},${(20 + k * 30) | 0},0.8)`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S; g.fillStyle = ['#b5651d', '#c9822e', '#8a3b12', '#d9a441'][i % 4]; g.beginPath(); g.ellipse(x, y, 3 + r() * 2, 2 + r() * 1.5, r() * 3, 0, 6.28); g.fill(); }
    const b = cnv(S, S); putGray(b, i => 0.3 + n[i] * 0.4);
    return { map: tex(m), bump: tex(b, false) }; },
  // brick (2 m per tile): 8 bricks x 30 rows
  brick() { const S = 512, nf = fbm(S, S, 64, 2), r = makeRng(9); const bw = 64, bh = 17; const col = []; for (let i = 0; i < 400; i++) { const k = r(); col.push([0.55 + k * 0.15, 0.25 + k * 0.08, 0.17 + k * 0.05]); }
    const m = cnv(S, S), b = cnv(S, S);
    const f = (x, y) => { const row = (y / bh) | 0; const xo = (x + (row % 2) * bw / 2) % S; const jx = xo % bw, jy = y % bh; return [Math.min(jx, bw - 1 - jx, jy, bh - 1 - jy), row * 8 + ((xo / bw) | 0)]; };
    putRGB(m, i => { const x = i % S, y = (i / S) | 0; const [j, id] = f(x, y); if (j < 1.6) return [0.62, 0.6, 0.56]; const c = col[id % 400], k = 1 + (nf[i] - 0.5) * 0.25; return [c[0] * k, c[1] * k, c[2] * k]; });
    putGray(b, i => { const x = i % S, y = (i / S) | 0; const [j] = f(x, y); return j < 1.6 ? 0.1 : 0.75 + (nf[i] - 0.5) * 0.3; });
    return { map: tex(m), bump: tex(b, false) }; },
  // roof tiles "Biberschwanz" (2.4 m per tile, rounded tile bottoms point to canvas bottom)
  roof() { const S = 512, r = makeRng(21), nf = fbm(S, S, 32, 3); const m = cnv(S, S), b = cnv(S, S); const g = m.getContext('2d'), gb = b.getContext('2d');
    g.fillStyle = '#202020'; g.fillRect(0, 0, S, S); gb.fillStyle = '#000'; gb.fillRect(0, 0, S, S);
    const tw = 32, rows = 16, rh = S / rows;
    for (let row = -1; row <= rows; row++) { const y0 = row * rh; const off = (row % 2 ? tw / 2 : 0);
      for (let cx = -1; cx <= S / tw; cx++) { const x0 = cx * tw + off; const v = 0.62 + (r() - 0.5) * 0.18; const vv = Math.round(v * 255);
        const path = () => { g.beginPath(); g.moveTo(x0 + 1, y0 - rh * 0.9); g.lineTo(x0 + tw - 1, y0 - rh * 0.9); g.lineTo(x0 + tw - 1, y0 + rh * 0.55); g.quadraticCurveTo(x0 + tw - 1, y0 + rh * 1.05, x0 + tw / 2, y0 + rh * 1.08); g.quadraticCurveTo(x0 + 1, y0 + rh * 1.05, x0 + 1, y0 + rh * 0.55); g.closePath(); };
        // drop shadow on the row below
        g.save(); g.translate(0, 3); path(); g.fillStyle = 'rgba(0,0,0,0.55)'; g.fill(); g.restore();
        path(); const gr = g.createLinearGradient(0, y0 - rh * 0.9, 0, y0 + rh * 1.08); gr.addColorStop(0, `rgb(${vv * 0.7},${vv * 0.7},${vv * 0.7})`); gr.addColorStop(0.75, `rgb(${vv},${vv},${vv})`); gr.addColorStop(1, `rgb(${vv * 1.08},${vv * 1.08},${vv * 1.08})`); g.fillStyle = gr; g.fill();
        // bump: thicker toward the bottom edge
        gb.save(); gb.translate(0, 3); gb.beginPath(); gb.rect(x0, y0, tw, rh); gb.restore();
        { const p = new Path2D(); p.moveTo(x0 + 1, y0 - rh * 0.9); p.lineTo(x0 + tw - 1, y0 - rh * 0.9); p.lineTo(x0 + tw - 1, y0 + rh * 0.55); p.quadraticCurveTo(x0 + tw - 1, y0 + rh * 1.05, x0 + tw / 2, y0 + rh * 1.08); p.quadraticCurveTo(x0 + 1, y0 + rh * 1.05, x0 + 1, y0 + rh * 0.55); p.closePath();
          const gr2 = gb.createLinearGradient(0, y0 - rh * 0.9, 0, y0 + rh * 1.08); gr2.addColorStop(0, '#303030'); gr2.addColorStop(1, '#f0f0f0'); gb.fillStyle = gr2; gb.fill(p); } } }
    // weathering
    const id = g.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) { const k = 0.85 + nf[i] * 0.3; id.data[i * 4] *= k; id.data[i * 4 + 1] *= k; id.data[i * 4 + 2] *= k; } g.putImageData(id, 0, 0);
    return { map: tex(m), bump: tex(b, false) }; },
  // laminate floor, light oak (2.4 m per tile): planks 0.2 m x 1.2 m, staggered
  laminat() { const S = 1024, r = makeRng(17), n = fbm(S, S, 4, 4), g2 = fbm(S, S, 2, 3); const pw = S / 12, pl = S / 2; const tone = []; for (let i = 0; i < 64; i++) tone.push(0.88 + r() * 0.2);
    const m = cnv(S, S), b = cnv(S, S);
    const f = (x, y) => { const row = (y / pw) | 0; const off = (row * 0.37 % 1) * pl; const xo = (x + off) % S; const jx = xo % pl, jy = y % pw; return [Math.min(jx, pl - 1 - jx, jy, pw - 1 - jy), row * 2 + ((xo / pl) | 0)]; };
    putRGB(m, i => { const x = i % S, y = (i / S) | 0; const [j, id] = f(x, y); const k = tone[id % 64]; const grain = Math.sin(y * 0.9 + n[i] * 22 + id * 3) * 0.045 + (g2[i] - 0.5) * 0.12; let v = k + grain; if (j < 1.2) v *= 0.55; return [0.78 * v, 0.6 * v, 0.42 * v]; });
    putGray(b, i => { const x = i % S, y = (i / S) | 0; const [j] = f(x, y); return j < 1.2 ? 0 : 0.7 + (n[i] - 0.5) * 0.2; });
    return { map: tex(m), bump: tex(b, false) }; },
  // painted interior wall (1 m per tile): very fine roller texture
  paint() { const S = 256, n = fbm(S, S, 16, 3), nf = fbm(S, S, 64, 1); const m = cnv(S, S), b = cnv(S, S);
    putGray(m, i => 0.96 + (n[i] - 0.5) * 0.04); putGray(b, i => 0.5 + (nf[i] - 0.5) * 0.9 + (n[i] - 0.5) * 0.2); return { map: tex(m), bump: tex(b, false) }; },
  // knitted / woven fabric (0.5 m per tile) for duvets, rugs, curtains
  fabric() { const S = 256, n = fbm(S, S, 8, 3); const m = cnv(S, S); putGray(m, i => { const x = i % S, y = (i / S) | 0; return 0.86 + Math.sin(x * 1.6) * Math.sin(y * 1.6) * 0.05 + (n[i] - 0.5) * 0.1; }); return { map: tex(m) }; },
  // horizontal roller-shutter slats (1 m per tile)
  shutter() { const S = 256; const m = cnv(S, S), g = m.getContext('2d'); for (let y = 0; y < S; y += 10) { const gr = g.createLinearGradient(0, y, 0, y + 10); gr.addColorStop(0, '#9a9a9a'); gr.addColorStop(0.5, '#e8e8e8'); gr.addColorStop(0.9, '#bdbdbd'); gr.addColorStop(1, '#5a5a5a'); g.fillStyle = gr; g.fillRect(0, y, S, 10); } return { map: tex(m) }; },
  // sectional garage door (1 m per tile vertically)
  garage() { const S = 256; const m = cnv(S, S), g = m.getContext('2d'); g.fillStyle = '#dcdcdc'; g.fillRect(0, 0, S, S); for (let y = 0; y < S; y += 64) { g.fillStyle = '#8a8a8a'; g.fillRect(0, y, S, 3); g.fillStyle = '#f4f4f4'; g.fillRect(0, y + 3, S, 2); } for (let y = 0; y < S; y += 4) { g.fillStyle = 'rgba(0,0,0,0.03)'; g.fillRect(0, y, S, 1); } return { map: tex(m) }; },
  // wood planks (1 m per tile)
  wood() { const S = 256, r = makeRng(13), n = fbm(S, S, 2, 4); const m = cnv(S, S); putRGB(m, i => { const x = i % S, y = (i / S) | 0; const plank = (x / 32) | 0; const k = 0.75 + ((plank * 7919) % 13) / 13 * 0.25; const grain = Math.sin((y * 0.08 + n[i] * 12 + plank * 3)) * 0.06; let v = k + grain; if (x % 32 < 1.5) v *= 0.45; return [0.55 * v, 0.36 * v, 0.22 * v]; }); return { map: tex(m) }; },
};

// ---------------------------------------------------------------- triplanar world-space material
// scale = repeats per metre (1 / texture size in metres)
export function triMat({ map = null, bump = null, scale = 0.5, color = 0xffffff, roughness = 0.85, metalness = 0, bumpScale = 1, physical = false, extra = {} } = {}) {
  const P = physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const mat = new P({ color, roughness, metalness, map, bumpMap: bump, bumpScale, ...extra });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.triScale = { value: scale };
    sh.vertexShader = 'varying vec3 vTriPos;\nvarying vec3 vTriN;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 triW = vec4(transformed, 1.0); vec3 triN = objectNormal;
      #ifdef USE_INSTANCING
        triW = instanceMatrix * triW; triN = mat3(instanceMatrix) * triN;
      #endif
      triW = modelMatrix * triW; vTriPos = triW.xyz; vTriN = normalize(mat3(modelMatrix) * triN);`);
    sh.fragmentShader = 'uniform float triScale;\nvarying vec3 vTriPos;\nvarying vec3 vTriN;\nvec2 triPlaneUV(vec3 p) { vec3 a = abs(vTriN); return (a.x > a.y && a.x > a.z) ? p.zy * triScale : (a.y > a.z ? p.xz * triScale : p.xy * triScale); }\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec2 triUV = triPlaneUV(vTriPos);
        diffuseColor *= texture2D(map, triUV);
      #endif`)
      .replace('#include <bumpmap_pars_fragment>', `
      #ifdef USE_BUMPMAP
        uniform sampler2D bumpMap; uniform float bumpScale;
        float triH(vec3 p) { return texture2D(bumpMap, triPlaneUV(p)).x; }
        vec2 dHdxy_fwd() { vec3 dpx = dFdx(vTriPos), dpy = dFdy(vTriPos); float Hll = bumpScale * triH(vTriPos);
          return vec2(bumpScale * triH(vTriPos + dpx) - Hll, bumpScale * triH(vTriPos + dpy) - Hll); }
        // robust gegen entartete Ableitungen (hauchdünne Fasen-Dreiecke, z. B. an schrägen Giebelkanten): sonst entsteht NaN,
        // und der Leuchteffekt macht daraus einen großen schwarzen Block im Bild. Vergleiche mit ! fangen auch NaN ab.
        vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
          if ( !( abs( dHdxy.x ) < 1e6 && abs( dHdxy.y ) < 1e6 ) ) return surf_norm;
          vec3 sx = dFdx( surf_pos.xyz ), sy = dFdy( surf_pos.xyz ); float lx = dot( sx, sx ), ly = dot( sy, sy );
          if ( !( lx > 1e-20 && ly > 1e-20 && lx < 1e20 && ly < 1e20 ) ) return surf_norm;
          vec3 vSigmaX = sx * inversesqrt( lx ); vec3 vSigmaY = sy * inversesqrt( ly ); vec3 vN = surf_norm;
          vec3 R1 = cross( vSigmaY, vN ); vec3 R2 = cross( vN, vSigmaX ); float fDet = dot( vSigmaX, R1 ) * faceDirection;
          vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 ); vec3 n = abs( fDet ) * surf_norm - vGrad; float ln = dot( n, n );
          return ( ln > 1e-20 && ln < 1e20 ) ? n * inversesqrt( ln ) : surf_norm; }
      #endif`);
  };
  mat.customProgramCacheKey = () => 'tri2' + scale + (map ? 'm' : '') + (bump ? 'b' : '');
  return mat;
}

// ---------------------------------------------------------------- helpers
export const std = (color, roughness = 0.6, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
export const phys = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, ...extra });
export function rbox(w, h, d, r = 0.02, seg = 2) { return new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)); }
export function add(parent, geo, mat, x = 0, y = 0, z = 0, { cast = true, recv = true, rx = 0, ry = 0, rz = 0 } = {}) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = cast; m.receiveShadow = recv; parent.add(m); return m; }
// tapered tube along a curve
export function taperTube(curve, r0, r1, segs = 16, rad = 8) {
  const geo = new THREE.TubeGeometry(curve, segs, 1, rad, false); const pos = geo.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) { const t = i / segs; const c = curve.getPointAt(t); const r = r0 + (r1 - r0) * t; for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, v.x, v.y, v.z); } }
  geo.computeVertexNormals(); return geo;
}
// lumpy blob (for foliage / shrubs)
export function blobGeo(detail = 3, amp = 0.18, freq = 2.2, seed = 1) {
  const r = makeRng(seed); const geo = new THREE.IcosahedronGeometry(1, detail); const pos = geo.attributes.position; const v = new THREE.Vector3();
  const ph = [r() * 6, r() * 6, r() * 6, r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const n = Math.sin(v.x * freq + ph[0]) * Math.sin(v.y * freq * 1.3 + ph[1]) * Math.sin(v.z * freq * 0.9 + ph[2]) + 0.5 * Math.sin(v.x * freq * 2.7 + ph[3]) * Math.sin(v.y * freq * 2.1 + ph[4]) * Math.sin(v.z * freq * 2.4 + ph[5]); v.multiplyScalar(1 + n * amp); pos.setXYZ(i, v.x, v.y, v.z); }
  geo.deleteAttribute('uv'); geo.deleteAttribute('normal');
  const merged = mergeVerts(geo); merged.computeVertexNormals(); return merged;
}
function mergeVerts(geo) { // simple position weld for non-indexed icosahedron
  const pos = geo.attributes.position; const map = new Map(); const verts = []; const idx = [];
  for (let i = 0; i < pos.count; i++) { const k = pos.getX(i).toFixed(4) + ',' + pos.getY(i).toFixed(4) + ',' + pos.getZ(i).toFixed(4); let id = map.get(k); if (id === undefined) { id = verts.length / 3; map.set(k, id); verts.push(pos.getX(i), pos.getY(i), pos.getZ(i)); } idx.push(id); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); return g;
}
// text on a canvas -> texture
export function textTex(w, h, draw) { const c = cnv(w, h); draw(c.getContext('2d'), w, h); return tex(c); }

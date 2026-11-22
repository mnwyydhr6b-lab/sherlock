// kit_anim.js – Zeitleiste für Videos: Figuren-Animationen mit Überblendung, Laufwege, Drehungen, Kamerafahrten.
// Alles ist eine reine Funktion der Zeit t (Sekunden) -> jedes Frame ist reproduzierbar (wichtig fürs Rendern Bild für Bild).
import * as THREE from 'three';

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const lerp = (a, b, k) => a + (b - a) * k;
// Keyframes [[t, v | [v...]], ...] mit weichem Übergang (smoothstep) zwischen den Keys
export function keys(t, ks, ease = smooth) {
  if (t <= ks[0][0]) return ks[0][1]; if (t >= ks[ks.length - 1][0]) return ks[ks.length - 1][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, a] = ks[i - 1], [t1, b] = ks[i]; const k = ease((t - t0) / (t1 - t0)); return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], k)) : lerp(a, b, k); }
}
function angKeys(t, ks) { if (t <= ks[0][0]) return ks[0][1]; if (t >= ks[ks.length - 1][0]) return ks[ks.length - 1][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, a] = ks[i - 1], [t1, b] = ks[i]; let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * smooth((t - t0) / (t1 - t0)); } }
function pathAt(t, ks) { // linear (constant speed) between [t, x, z] keys
  if (t <= ks[0][0]) return [ks[0][1], ks[0][2]]; if (t >= ks[ks.length - 1][0]) { const k = ks[ks.length - 1]; return [k[1], k[2]]; }
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, x0, z0] = ks[i - 1], [t1, x1, z1] = ks[i]; const k = (t - t0) / (t1 - t0); return [lerp(x0, x1, k), lerp(z0, z1, k)]; } }

// Laufgeschwindigkeit einer In-Place-Laufanimation messen (damit die Füße nicht rutschen)
export function clipSpeed(h, name) { const ud = h.userData; const clip = ud.clips.find(c => c.name === name); const mixer = ud.mixer; mixer.stopAllAction(); const a = mixer.clipAction(clip); a.reset(); a.play(); a.setEffectiveWeight(1);
  const p0 = h.position.clone(), r0 = h.rotation.y; h.position.set(0, 0, 0); h.rotation.y = 0;
  const N = 90, S = []; const inv = new THREE.Matrix4();
  for (let i = 0; i <= N; i++) { a.time = clip.duration * i / N; mixer.update(0); h.updateMatrixWorld(true); inv.copy(h.matrixWorld).invert(); S.push(ud.bones.foot_l.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv)); }
  const minY = Math.min(...S.map(p => p.y)); let dz = 0, dt = 0; for (let i = 1; i <= N; i++) if (S[i].y < minY + 0.02 && S[i - 1].y < minY + 0.02) { dz += S[i].z - S[i - 1].z; dt += clip.duration / N; }
  h.position.copy(p0); h.rotation.y = r0; return dt > 0 ? Math.abs(dz / dt) : 1.3; }

// Actor: steuert eine Figur über die Zeit.
// segs: [{ anim, at, fade = 0.35, offset = 0, speed = 1 }]  – ab Zeit "at" läuft "anim", mit Überblendung "fade"
// path: [[t, x, z], ...] – Position (konstante Geschwindigkeit zwischen Keys); ry: [[t, winkel], ...] – Blickrichtung
// after(t, h): optionale Funktion nach dem Pose-Update (z. B. Kopf drehen, IK)
export class Actor {
  constructor(h, { segs, path = null, ry = null, y = null, after = null } = {}) {
    this.h = h; this.segs = segs; this.path = path; this.ry = ry; this.y = y; this.after = after; this.actions = new Map();
    h.userData.mixer.stopAllAction(); for (const s of segs) this.action(s.anim);
  }
  action(name) { if (!this.actions.has(name)) { const ud = this.h.userData; const clip = ud.clips.find(c => c.name === name) || ud.clips.find(c => c.name.startsWith(name)); if (!clip) throw new Error('clip not found: ' + name); const a = ud.mixer.clipAction(clip); a.play(); a.setEffectiveWeight(0); this.actions.set(name, a); } return this.actions.get(name); }
  update(t) {
    const { h, segs } = this; const ud = h.userData;
    let ci = 0; for (let i = 0; i < segs.length; i++) if (segs[i].at <= t) ci = i;
    const cur = segs[ci], prev = ci > 0 ? segs[ci - 1] : null; const k = prev ? smooth((t - cur.at) / (cur.fade ?? 0.35)) : 1;
    for (const a of this.actions.values()) a.setEffectiveWeight(0);
    const set = (s, w) => { const a = this.action(s.anim); const d = a.getClip().duration; a.time = (((t - s.at) * (s.speed ?? 1) + (s.offset ?? 0)) % d + d) % d; a.setEffectiveWeight(w); };
    if (prev && k < 1) { set(prev, 1 - k); set(cur, k); } else set(cur, 1);
    ud.mixer.update(0); ud.applyBuild();
    if (this.path) { const [x, z] = pathAt(t, this.path); h.position.x = x; h.position.z = z; }
    if (this.y) h.position.y = keys(t, this.y);
    if (this.ry) h.rotation.y = angKeys(t, this.ry);
    h.updateMatrixWorld(true);
    if (this.after) this.after(t, h);
  }
}
// Kamerafahrt: keys für pos [x,y,z], target [x,y,z], fov
export function cameraAt(stage, t, { pos, target, fov = null }) { const p = keys(t, pos), g = keys(t, target); stage.camera.position.set(p[0], p[1], p[2]); stage.camera.lookAt(g[0], g[1], g[2]); if (fov) { stage.camera.fov = keys(t, fov); stage.camera.updateProjectionMatrix(); } }

// ---------------------------------------------------------------- Mimik über die Zeit
// Blinzeln: alle 2,5–5 s ein kurzes Blinzeln (0,14 s); seed macht es pro Figur verschieden
export function blinkAt(t, seed = 1) { let s = seed * 9301 % 233280, tt = 0.6 + (s / 233280) * 1.5; while (tt < t + 1) { if (t >= tt && t < tt + 0.14) { const k = (t - tt) / 0.14; return Math.sin(k * Math.PI); } s = (s * 9301 + 49297) % 233280; tt += 2.5 + (s / 233280) * 2.5; } return 0; }
// Mundbewegung aus einer Lautstärke-Hüllkurve (JSON aus envelope.py: { fps, values[] }), Sprechbeginn "start" in Sekunden
export function lipAt(t, env, start = 0, gain = 1.0) { if (!env) return 0; const i = Math.floor((t - start) * env.fps); if (i < 0 || i >= env.values.length) return 0; const v = env.values[i]; return Math.min(1, Math.pow(v, 0.7) * gain); }

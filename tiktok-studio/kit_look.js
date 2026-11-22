// kit_look.js – der feste "Spielwelt"-Look: Renderer, Himmel, Umgebungslicht, Licht-Presets, Nachbearbeitung.
// Jede Szene startet mit createStage({ preset }) – dadurch sehen alle Orte automatisch gleich aus.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { cnv, tex, makeRng } from './kit_world.js';

// ---------------------------------------------------------------- presets
// sky: gradient stops (top -> bottom, horizon ~0.5); key = main directional light (moon / sun) with shadows; rim = second, unshadowed
export const PRESETS = {
  nacht: { sky: [[0, '#060a1e'], [0.22, '#121c46'], [0.36, '#26306a'], [0.43, '#4a3f86'], [0.475, '#9a5a96'], [0.495, '#e98a7e'], [0.505, '#ffb27a'], [0.52, '#3a2a3a'], [1, '#141018']],
    stars: true, moon: true, clouds: 'rgba(255,170,190,0.1)', fog: [0x2a2c4a, 0.012], env: 0.55, envBlobs: 0xffb070, envGround: 0x14121c,
    hemi: [0x5a70d8, 0x221d2a, 0.3], key: [0x9fb4ff, 1.0, -38, 34, 26], rim: [0xff9a6a, 0.35, 60, 8, -40],
    exp: 1.12, sat: 1.15, con: 0.3, vig: 0.85, bloom: 0.5, bth: 0.9, ao: 0.85 },
  abend: { sky: [[0, '#1d2a66'], [0.25, '#3a4a90'], [0.38, '#7a68a8'], [0.45, '#d98a8a'], [0.49, '#ffb27a'], [0.505, '#ffd49a'], [0.52, '#6a4a4a'], [1, '#2a2024']],
    stars: false, moon: false, clouds: 'rgba(255,190,160,0.35)', fog: [0x6a5a78, 0.009], env: 0.8, envBlobs: 0xffc890, envGround: 0x2a2228,
    hemi: [0x8aa0e0, 0x4a3a30, 0.55], key: [0xffb070, 2.6, 60, 9, -30], rim: [0x8aa0ff, 0.5, -40, 30, 30],
    exp: 1.0, sat: 1.12, con: 0.28, vig: 0.75, bloom: 0.4, bth: 0.95, ao: 0.85 },
  tag: { sky: [[0, '#3f7fd8'], [0.3, '#6aa2e6'], [0.45, '#a8cdf2'], [0.5, '#d8eaf8'], [0.52, '#9aa6a0'], [1, '#5a5a50']],
    stars: false, moon: false, clouds: 'rgba(255,255,255,0.85)', fog: [0xb8cce4, 0.005], env: 1.0, envBlobs: null, envGround: 0x6a6658,
    hemi: [0xbcd4ff, 0x6a5a48, 0.9], key: [0xfff0d8, 3.4, 35, 50, 20], rim: [0x9ab8ff, 0.4, -40, 20, -30],
    exp: 1.02, sat: 1.1, con: 0.22, vig: 0.5, bloom: 0.22, bth: 1.0, ao: 0.9 },
  // Innenräume: Himmel nur durchs Fenster sichtbar, Licht kommt vor allem von den Lampen des Sets
  innen_nacht: { base: 'nacht', env: 0.18, hemi: [0x4a5aa0, 0x1a1418, 0.1], key: [0x9fb4ff, 0.45, -38, 34, 26], rim: null, fog: null, exp: 1.15, vig: 0.9, bloom: 0.55, bth: 0.85 },
  innen_tag: { base: 'tag', env: 0.6, hemi: [0xbcd4ff, 0x6a5a48, 0.35], key: [0xfff0d8, 2.6, 35, 50, 20], rim: null, fog: null, exp: 1.0, vig: 0.6, bloom: 0.25 },
  // Charakterbogen / Studio
  studio: { base: 'nacht', stars: false, moon: false, clouds: null, fog: null, env: 0.6, hemi: [0x8a9ad8, 0x2a2430, 0.5], key: [0xffe8d0, 2.2, 3, 6, 8], rim: [0x9ab0ff, 1.6, -4, 5, -6], exp: 1.05, vig: 0.6, bloom: 0.3, bth: 1.0, ao: 0.7 },
};
function resolvePreset(name) { const p = PRESETS[name]; if (!p) throw new Error('unknown preset ' + name); return p.base ? { ...resolvePreset(p.base), ...p } : { ...p }; }

// ---------------------------------------------------------------- sky
function skyTexture(stops) { const c = cnv(8, 1024), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 1024); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 8, 1024); const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; }
export function buildSky(target, P, { withStars = true, moonPos = [186, 128, -161] } = {}) {
  const st = skyTexture(P.sky);
  target.add(new THREE.Mesh(new THREE.SphereGeometry(300, 48, 32), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, fog: false, depthWrite: false })));
  if (withStars && P.stars) { const p = []; const r = makeRng(5); for (let i = 0; i < 900; i++) { const a = r() * 6.283, e = 0.18 + Math.pow(r(), 0.7) * 1.3; p.push(Math.cos(a) * Math.cos(e) * 280, Math.sin(e) * 280, Math.sin(a) * Math.cos(e) * 280); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); target.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 }))); }
  if (withStars && P.moon) { const mt = cnv(256, 256); { const g = mt.getContext('2d'); const gr = g.createRadialGradient(128, 128, 60, 128, 128, 128); gr.addColorStop(0, 'rgba(255,248,225,1)'); gr.addColorStop(0.5, 'rgba(255,240,210,1)'); gr.addColorStop(0.52, 'rgba(255,235,200,0.35)'); gr.addColorStop(1, 'rgba(255,230,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(200,190,170,0.35)'; for (const [x, y, rr] of [[110, 110, 14], [150, 140, 10], [120, 160, 8], [145, 100, 6]]) { g.beginPath(); g.arc(x, y, rr, 0, 6.28); g.fill(); } }
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: tex(mt), transparent: true, fog: false, depthWrite: false })); moon.position.set(...moonPos); moon.lookAt(0, 0, 0); target.add(moon); target.userData.moon = moon; }
  if (withStars && P.clouds) { const day = P.sky === PRESETS.tag.sky; const cl = cnv(1024, 256); { const g = cl.getContext('2d'); const r = makeRng(31);
      if (day) { // puffy cumulus: clusters of soft circles, flat-ish bottoms
        for (let i = 0; i < 22; i++) { const cx = r() * 1024, cy = 80 + r() * 110, sc = 0.5 + r() * 0.7;
          for (let k = 0; k < 7; k++) { const px = cx + (k - 3) * 14 * sc + (r() - 0.5) * 10 * sc, py = cy - Math.sin(k / 6 * Math.PI) * 10 * sc + (r() - 0.5) * 4 * sc, rad = (12 + r() * 12) * sc;
            const gr = g.createRadialGradient(px, py - rad * 0.3, rad * 0.1, px, py, rad); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.7, 'rgba(240,244,252,0.8)'); gr.addColorStop(1, 'rgba(225,232,245,0)'); g.fillStyle = gr; g.beginPath(); g.arc(px, py, rad, 0, 6.28); g.fill(); } } }
      else { for (let i = 0; i < 70; i++) { const x = r() * 1024, y = 90 + r() * 90, w = 80 + r() * 220, h = 8 + r() * 16; const gr = g.createRadialGradient(0, 0, 1, 0, 0, w / 2); gr.addColorStop(0, P.clouds); gr.addColorStop(1, P.clouds.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, h / w); g.beginPath(); g.arc(0, 0, w / 2, 0, 6.28); g.fill(); g.restore(); } } }
    const clT = tex(cl); clT.wrapS = THREE.RepeatWrapping; const cloud = new THREE.Mesh(new THREE.CylinderGeometry(260, 260, day ? 220 : 120, 48, 1, true), new THREE.MeshBasicMaterial({ map: clT, transparent: true, side: THREE.BackSide, fog: false, depthWrite: false })); cloud.position.y = day ? 118 : 30; target.add(cloud); }
}

// ---------------------------------------------------------------- stage
// createStage({ preset, W, H, query }) -> { renderer, scene, camera, P, keyLight, view(), setFocus(), render() }
// URL-Parameter überschreiben Preset-Werte: exp, sat, con, vig, bloom, bth, ao, env, hemi, key, rim, ap, dof, fov, cx..tz
export function createStage({ preset = 'nacht', W = 1080, H = 1920, query = location.search, parent = document.getElementById('wrap') || document.body, shadowSize = 4096, shadowExtent = 22 } = {}) {
  const Q = new URLSearchParams(query); const qn = (k, d) => Q.has(k) ? parseFloat(Q.get(k)) : d;
  // ?hq = höchste Qualität für Standbilder (volles Himmelslicht, volle Auflösung der Nachbearbeitung, weiche Schatten, feines Laub)
  if (Q.has('hq')) ['fullibl', 'fullpost', 'softshadow'].forEach(k => Q.set(k, '1'));
  const P = resolvePreset(Q.get('preset') || preset);
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = !Q.has('noshadow'); renderer.shadowMap.type = Q.has('softshadow') ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = qn('exp', P.exp);
  parent.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  if (P.fog) scene.fog = new THREE.FogExp2(P.fog[0], qn('fogd', P.fog[1]));
  buildSky(scene, P, { withStars: true });
  { const envScene = new THREE.Scene(); buildSky(envScene, P, { withStars: false });
    envScene.add(new THREE.Mesh(new THREE.CircleGeometry(300, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.envGround })));
    if (P.envBlobs) for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; const m = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(P.envBlobs).multiplyScalar(3) })); m.position.set(Math.cos(a) * 120, 12, Math.sin(a) * 120); envScene.add(m); }
    if (P.sky === PRESETS.tag.sky) { const sun = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(14) })); sun.position.set(P.key[2], P.key[3], P.key[4]).normalize().multiplyScalar(200); envScene.add(sun); }
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.02).texture; scene.environmentIntensity = qn('env', P.env); }
  const hemi = new THREE.HemisphereLight(P.hemi[0], P.hemi[1], qn('hemi', P.hemi[2])); scene.add(hemi);
  let keyLight = null, rimLight = null;
  if (P.key) { keyLight = new THREE.DirectionalLight(P.key[0], qn('key', qn('moon', P.key[1]))); keyLight.position.set(P.key[2], P.key[3], P.key[4]); keyLight.castShadow = true; keyLight.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(keyLight.shadow.camera, { left: -shadowExtent, right: shadowExtent, top: shadowExtent, bottom: -shadowExtent, near: 1, far: 160 }); keyLight.shadow.bias = -0.0003; keyLight.shadow.normalBias = 0.03; scene.add(keyLight, keyLight.target); }
  if (P.rim) { rimLight = new THREE.DirectionalLight(P.rim[0], qn('rim', qn('sunset', P.rim[1]))); rimLight.position.set(P.rim[2], P.rim[3], P.rim[4]); scene.add(rimLight); }
  const camera = new THREE.PerspectiveCamera(qn('fov', 46), W / H, 0.05, 600);
  let composer = null, bokeh = null, grade = null;
  const stage = { THREE, renderer, scene, camera, P, Q, qn, keyLight, rimLight, hemi, W, H,
    // Kamera setzen; URL-Parameter cx..tz/fov haben Vorrang (zum schnellen Ausprobieren)
    view({ pos, target, fov } = {}) { camera.fov = qn('fov', fov ?? camera.fov); camera.position.set(qn('cx', pos[0]), qn('cy', pos[1]), qn('cz', pos[2])); camera.lookAt(qn('tx', target[0]), qn('ty', target[1]), qn('tz', target[2])); camera.updateProjectionMatrix(); return stage; },
    // Schatten-Bereich des Hauptlichts auf den Ausschnitt legen
    aimKey(center, offset = null) { if (keyLight) { keyLight.target.position.copy(center); keyLight.position.copy(center).add(offset ? new THREE.Vector3(...offset) : new THREE.Vector3(P.key[2], P.key[3], P.key[4])); } return stage; },
    // nur die wichtigsten Punkt-/Spotlichter aktiv lassen (jedes Licht kostet bei jedem Pixel Rechenzeit). Vor dem ersten Rendern aufrufen.
    limitLights(center, keep = 8) { const L = []; scene.traverse(o => { if ((o.isPointLight || o.isSpotLight) && o.visible) L.push(o); });
      const w = (l) => { const p = l.getWorldPosition(new THREE.Vector3()); const d = Math.max(0.5, p.distanceTo(center)); return l.intensity / (d * d) * (l.isSpotLight ? 3 : 1); };
      L.sort((a, b) => w(b) - w(a)); L.slice(keep).forEach(l => l.visible = false); return stage; },
    build({ focus = null, aperture = 0.0009, maxblur = 0.0045 } = {}) {
      scene.traverse(o => { if (o.isLight && o.shadow) o.shadow.camera.layers.enable(3); }); // Schatten-Stellvertreter (kit_nature)
      composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
      stage.passes = {};
      if (!Q.has('noao')) { const gtao = stage.passes.gtao = new GTAOPass(scene, camera, W, H); gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 1.2, scale: 1, samples: qn('aos', 16) }); gtao.blendIntensity = qn('ao', P.ao ?? 0.85); composer.addPass(gtao); }
      if (qn('dof', 1) > 0 && focus) { bokeh = stage.passes.bokeh = new BokehPass(scene, camera, { focus: camera.position.distanceTo(focus), aperture: qn('ap', aperture), maxblur }); composer.addPass(bokeh); }
      composer.addPass(stage.passes.bloom = new UnrealBloomPass(new THREE.Vector2(W, H), qn('bloom', P.bloom), 0.55, qn('bth', P.bth)));
      composer.addPass(new OutputPass());
      grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, sat: { value: qn('sat', P.sat ?? 1.12) }, con: { value: qn('con', P.con ?? 0.3) }, vig: { value: qn('vig', P.vig ?? 0.8) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform sampler2D tDiffuse; uniform float sat, con, vig; varying vec2 vUv;
          void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; c = mix(c, c*c*(3.0-2.0*c), con); float l = dot(c, vec3(0.299,0.587,0.114)); c = mix(vec3(l), c, sat);
            c += vec3(-0.012, 0.0, 0.03) * (1.0 - l) * (1.0 - l) + vec3(0.025, 0.01, -0.012) * l * l;
            vec2 d = (vUv - 0.5) * vec2(1.0, 0.62); c *= 1.0 - dot(d, d) * vig; gl_FragColor = vec4(c, 1.0); }` });
      composer.addPass(grade); composer.setSize(W, H);
      // Umgebungsverdeckung und Tiefe für die Unschärfe in halber Auflösung (spart viel Zeit, kaum sichtbar)
      if (!Q.has('fullpost')) { if (stage.passes.gtao) stage.passes.gtao.setSize(W / 2, H / 2); if (bokeh) bokeh.renderTargetDepth.setSize(W / 2, H / 2); }
      // Tiefenschärfe nutzt die Tiefe, die die Umgebungsverdeckung ohnehin berechnet (spart einen kompletten Szenen-Durchgang)
      if (bokeh && stage.passes.gtao && !Q.has('fullpost')) { const ao = stage.passes.gtao; bokeh.materialBokeh.defines.DEPTH_PACKING = 0; bokeh.materialBokeh.needsUpdate = true; bokeh.uniforms.tDepth.value = ao.depthTexture;
        bokeh.render = function (r, writeBuffer, readBuffer) { this.uniforms.tColor.value = readBuffer.texture; this.uniforms.nearClip.value = this.camera.near; this.uniforms.farClip.value = this.camera.far;
          if (this.renderToScreen) { r.setRenderTarget(null); this.fsQuad.render(r); } else { r.setRenderTarget(writeBuffer); r.clear(); this.fsQuad.render(r); } }; }
      // Himmelslicht (Env-Map) nur für glänzende Materialien; matte Flächen bekommen es über ein stärkeres Hemisphärenlicht (spart ~2 s pro Bild)
      if (!Q.has('fullibl')) { const env = scene.environment, k = scene.environmentIntensity; const seen = new Set();
        scene.traverse(o => { if (!o.isMesh) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { if (!m || seen.has(m) || !m.isMeshStandardMaterial) continue; seen.add(m);
          const glossy = m.roughness < 0.45 || m.metalness > 0.3 || m.clearcoat > 0; if (glossy && !m.envMap) { m.envMap = env; m.envMapIntensity = k; m.needsUpdate = true; } } });
        scene.environment = null; hemi.intensity += k * (P.iblToHemi ?? 0.55); }
      return stage; },
    setFocus(point) { if (bokeh) bokeh.uniforms.focus.value = camera.position.distanceTo(point); return stage; },
    render() { composer.render(); return true; },
    composer: () => composer,
    // für Standbilder: window.renderStill + window.ready setzen
    ready() { window.renderStill = () => stage.render(); window.ready = true; return stage; },
  };
  return stage;
}

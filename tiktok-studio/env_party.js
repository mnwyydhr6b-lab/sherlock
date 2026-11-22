  // ---- party details (v4) ----
  {
    // remove the old solid kitchen placeholder and build a real kitchen behind the doorway
    sc.children.filter(o => o.isMesh && o.position.x === 9.8 && o.position.z === -3.0).forEach(o => sc.remove(o));
    addBox(sc, 4.0, 0.1, 6.2, mat({ color: 0xd8d2c4 }), 10.2, -0.05, -2.9, false);
    addBox(sc, 4.0, 0.1, 6.2, mat({ color: 0xf2efe8 }), 10.2, 3.25, -2.9, false);
    addBox(sc, 0.2, 3.3, 6.2, mat({ color: 0xe8e2d4 }), 12.3, 1.65, -2.9);
    addBox(sc, 4.0, 3.3, 0.2, mat({ color: 0xe8e2d4 }), 10.2, 1.65, -6.0); addBox(sc, 4.0, 3.3, 0.2, mat({ color: 0xe8e2d4 }), 10.2, 1.65, 0.2);
    // tiles above counter
    { const tile = canvasTex(64, 64, (c) => { c.fillStyle = '#f4f4f4'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#d0d0d0'; for (let i = 0; i < 64; i += 16) { c.fillRect(i, 0, 1, 64); c.fillRect(0, i, 64, 1); } }, true); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(4, 1);
      plane(sc, 3.0, 0.8, tile, 12.19, 1.4, -2.0, -Math.PI / 2); }
    addBox(sc, 0.7, 0.95, 4.0, mat({ color: 0x2f4f6f }), 11.85, 0.47, -2.2); addBox(sc, 0.74, 0.05, 4.04, mat({ color: 0xdedede }), 11.85, 0.97, -2.2, false);
    addBox(sc, 0.8, 2.0, 0.75, mat({ color: 0xe6e6e6, roughness: 0.3 }), 11.8, 1.0, -5.3); addBox(sc, 0.03, 0.5, 0.05, mat({ color: 0x888888 }), 11.38, 1.3, -5.0, false);
    for (let i = 0; i < 6; i++) addBox(sc, 0.1, 0.1, 0.02, mat({ color: [0xff4f4f, 0x4fb0ff, 0xffd84f][i % 3] }), 11.38, 0.9 + (i % 3) * 0.25, -5.4 + Math.floor(i / 3) * 0.25, false); // magnets
    for (let i = 0; i < 9; i++) addBox(sc, 0.1, 0.32, 0.1, mat({ color: [0x1f6b45, 0x8a4a1e, 0xdedede][i % 3], roughness: 0.2 }), 11.7, 1.16, -3.8 + i * 0.3, false);
    addBox(sc, 0.4, 0.06, 0.4, mat({ color: 0xffffff }), 11.6, 1.03, -1.0, false); // plate
    { const kl = new THREE.PointLight(0xfff0d8, 12, 8, 1.5); kl.position.set(10.2, 2.9, -2.9); sc.add(kl); addBox(sc, 0.8, 0.06, 0.8, mat({ color: 0xffffff, emissive: 0xfff0d8, emissiveIntensity: 0.6 }), 10.2, 3.18, -2.9, false); }
    // ceiling string lights across the room
    P.strands = [];
    for (let j = 0; j < 4; j++) { const z0 = -4.5 + j * 2.8; for (let i = 0; i <= 30; i++) { const k = i / 30, x = lerp(-7.8, 7.8, k), y = 3.12 - Math.sin(k * Math.PI) * 0.35;
      const m = mat({ color: 0xfff2c0, emissive: 0xffd27a, emissiveIntensity: 1.4 }); P.strands.push(m); addBox(sc, 0.06, 0.08, 0.06, m, x, y, z0 + Math.sin(k * 9 + j) * 0.05, false); } }
    // volumetric light cones under the moving party lights
    P.cones = [];
    for (const [L, col] of [[P.l1, 0xff2fd0], [P.l2, 0x2f7bff], [P.l3, 0x40ffd0]]) { const cg = new THREE.ConeGeometry(1.1, 3.0, 20, 1, true); cg.translate(0, -1.5, 0);
      const cm = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const cone = new THREE.Mesh(cg, cm); sc.add(cone); P.cones.push([cone, L, cm]); }
    // neon sign
    { const nt = canvasTex(320, 110, (c) => { c.fillStyle = '#0a0612'; c.fillRect(0, 0, 320, 110); c.shadowColor = '#ff4fd8'; c.shadowBlur = 18; c.fillStyle = '#ffb3f0'; c.font = 'italic 800 58px Inter'; c.textAlign = 'center'; c.fillText("LET'S PARTY", 160, 74); });
      P.neon = plane(sc, 2.0, 0.7, nt, 7.98, 2.4, 4.6, -Math.PI / 2, 1.5); }
    // group photo ("die Gang") behind the snack table - you are not in it
    poster(sc, 0.9, 0.62, -5.4, 2.05, -5.95, 0, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#7fc8ff'); gr.addColorStop(1, '#ffe2a0'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = '#e9c46a'; c.fillRect(0, H * 0.72, W, H * 0.28);
      const cols = ['#ff6a6a', '#4aa3ff', '#f4f4f4', '#ffd84f', '#46d18a', '#7c4dff', '#ff9f40']; const skins = ['#e2b48c', '#c98d5f', '#f0c8a0', '#8d5a3b'];
      for (let i = 0; i < 7; i++) { const x0 = 6 + i * 17; c.fillStyle = skins[i % 4]; c.fillRect(x0 + 3, 30, 10, 10); c.fillStyle = i === 3 ? '#d9b45a' : '#3a2a20'; c.fillRect(x0 + 3, 28, 10, 3); c.fillStyle = cols[i]; c.fillRect(x0, 41, 16, 18); c.fillStyle = '#222'; c.fillRect(x0 + 2, 59, 12, 10); }
      c.fillStyle = '#ffffff'; c.font = '800 11px Inter'; c.fillText('DIE GANG ♥ 2026', 6, 14); });
    // gift table
    { addBox(sc, 0.9, 0.75, 1.6, mat({ color: 0xf0f0f0 }), -7.3, 0.375, 1.1); const gc = [0xff4fd8, 0x4fb0ff, 0xffd84f, 0x46d18a, 0xff6a3a];
      for (let i = 0; i < 6; i++) { const s_ = 0.22 + (i % 3) * 0.08; const gx = -7.4 + (i % 2) * 0.35, gz = 0.5 + Math.floor(i / 2) * 0.5; addBox(sc, s_, s_, s_, mat({ color: gc[i % 5] }), gx, 0.75 + s_ / 2, gz); addBox(sc, s_ + 0.01, s_ + 0.01, 0.04, mat({ color: 0xffffff }), gx, 0.75 + s_ / 2, gz, false); addBox(sc, 0.04, s_ + 0.01, s_ + 0.01, mat({ color: 0xffffff }), gx, 0.75 + s_ / 2, gz, false); addBox(sc, 0.12, 0.06, 0.12, mat({ color: 0xffffff }), gx, 0.78 + s_, gz, false); } }
    // birthday cake with 18 candles-number
    { const cx = -4.85, cz = -5.0; addBox(sc, 0.5, 0.18, 0.5, mat({ color: 0xfff4f8 }), cx, 1.08, cz); addBox(sc, 0.36, 0.14, 0.36, mat({ color: 0xff9ccf }), cx, 1.24, cz); for (let i = 0; i < 8; i++) addBox(sc, 0.05, 0.05, 0.05, mat({ color: 0xff3b3b }), cx - 0.2 + (i % 4) * 0.13, 1.18, cz - 0.24 + Math.floor(i / 4) * 0.48, false);
      const num = canvasTex(96, 64, (c) => { c.clearRect(0, 0, 96, 64); c.fillStyle = '#ffd84f'; c.font = '800 54px Inter'; c.textAlign = 'center'; c.fillText('18', 48, 54); });
      const np = plane(sc, 0.22, 0.15, num, cx, 1.4, cz + 0.05, 0); np.material.transparent = true;
      P.flames = []; for (const fx of [-0.05, 0.05]) { const f = addBox(sc, 0.025, 0.05, 0.025, mat({ color: 0xffe08a, emissive: 0xffa030, emissiveIntensity: 3 }), cx + fx, 1.5, cz + 0.05, false); P.flames.push(f); } }
    // rug + coffee table + clutter
    { const rug = canvasTex(128, 96, (c) => { c.fillStyle = '#2f3a6b'; c.fillRect(0, 0, 128, 96); c.strokeStyle = '#e9c46a'; c.lineWidth = 5; c.strokeRect(8, 8, 112, 80); c.fillStyle = '#c0392b'; for (let i = 0; i < 6; i++) c.fillRect(20 + i * 16, 40, 8, 16); }, true);
      const r = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), new THREE.MeshStandardMaterial({ map: rug, roughness: 1 })); r.rotation.x = -Math.PI / 2; r.position.set(-1, 0.006, 4.3); r.receiveShadow = true; sc.add(r);
      addBox(sc, 1.6, 0.4, 0.8, mat({ color: 0x5a3a24 }), -1, 0.2, 4.0); cup(sc, -1.4, 0.4, 3.9); cup(sc, -0.8, 0.4, 4.1, false, 0x2b6be0); addBox(sc, 0.3, 0.06, 0.18, mat({ color: 0x111111 }), -0.5, 0.43, 3.85, false); addBox(sc, 0.35, 0.45, 0.15, mat({ color: 0xf2c230 }), -1.2, 0.62, 4.15).rotation.z = 0.2; }
    // curtains on back-wall windows
    for (const wx of [-4, 0, 4]) for (const sx of [-1.15, 1.15]) addBox(sc, 0.4, 1.9, 0.08, mat({ color: 0x8a2f5a }), wx + sx, 1.85, -5.92);
    // extra guests chatting around the room
    P.extras = [];
    const ex = [[-3.4, -5.0, 0.4, 0xffffff, 'jacket'], [-2.7, -4.6, -2.2, 0xe05aa8, 'tee'], [4.3, 4.3, 2.6, 0x46d18a, 'hoodie'], [3.7, 3.6, 0.6, 0xff9f40, 'tee'], [6.4, 1.6, -1.2, 0x7c4dff, 'jacket'], [6.9, 2.6, -2.6, 0x3ad0d0, 'tee'], [10.6, -2.2, -1.5, 0xff5a5a, 'hoodie'], [-6.6, 2.6, 1.6, 0xf2c230, 'tee']];
    ex.forEach(([x, z, ry, c, top], i) => { const p = new Person(sc, { x, z, ry, seed: 50 + i, shirt: c, top, skin: SKINS[(i * 3) % 6], hair: HAIRS[(i * 5) % 6], longHair: i % 3 === 0, glasses: i === 2, cap: i === 4 ? 0x111111 : null, earring: i % 2 === 0, expr: 'laugh', bag: i === 7 ? 0x6b4a2e : null }); p.home = [x, z]; p.ry0 = ry; P.extras.push(p); });
  }

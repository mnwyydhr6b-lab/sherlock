  // ---- street details (v4) ----
  {
    const bin = (x, z, col, ry = 0) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.95, 0.7), mat({ color: col, roughness: 0.6 })); b.position.y = 0.6; b.castShadow = true; g.add(b);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.07, 0.78), mat({ color: shade(col, 0.85), roughness: 0.6 })); lid.position.y = 1.1; g.add(lid);
      for (const wx of [-0.22, 0.22]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), mat({ color: 0x111111 })); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.22, -0.3); g.add(w); }
      g.position.set(x, 0.12, z); g.rotation.y = ry; sc.add(g); };
    const binCols = [0x3a3d42, 0x2f5fb3, 0xf2c230, 0x6b4423];
    for (const [bx, bz] of [[6.1, -3], [6.1, 7.5], [-6.1, 11], [6.1, 16], [-6.1, -6]]) binCols.forEach((c, i) => bin(bx, bz + i * 0.75, c, bx > 0 ? -Math.PI / 2 : Math.PI / 2));
    // bikes
    const bike = (x, z, col, ry) => { const g = new THREE.Group(); const fm = mat({ color: col, metalness: 0.4, roughness: 0.4 });
      for (const wz of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 6, 14), mat({ color: 0x151515 })); w.position.set(0, 0.36, wz); w.rotation.y = Math.PI / 2; g.add(w); }
      const bar = (l, x0, y0, z0, rx) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, l), fm); m.position.set(x0, y0, z0); m.rotation.x = rx; g.add(m); };
      bar(1.0, 0, 0.62, 0, 0); bar(0.5, 0, 0.48, -0.3, 0.9); bar(0.5, 0, 0.48, 0.3, -0.9);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.25), mat({ color: 0x111111 })); seat.position.set(0, 0.82, -0.3); g.add(seat);
      const hb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.04), mat({ color: 0x222222 })); hb.position.set(0, 0.92, 0.45); g.add(hb);
      g.position.set(x, 0.12, z); g.rotation.set(0, ry, 0.12); sc.add(g); };
    bike(5.9, 2.2, 0x2a9d8f, 0.1); bike(5.95, 3.1, 0xe63946, -0.1); bike(-5.9, 16.5, 0x264653, 0.05);
    // street name sign
    { addBox(sc, 0.08, 3.0, 0.08, mat({ color: 0x777777, metalness: 0.5 }), 3.4, 1.6, 6.5);
      const st = canvasTex(256, 64, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 64); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(5, 5, 246, 54); c.fillStyle = '#111'; c.font = '700 34px Inter'; c.textAlign = 'center'; c.fillText('Lindenstraße', 128, 44); });
      for (const ry of [Math.PI / 2, -Math.PI / 2]) plane(sc, 0.9, 0.22, st, 3.4 + (ry > 0 ? 0.045 : -0.045), 2.9, 6.5, ry); }
    // Spaeti (shop) on the right side
    { const sz = -6.5, sx = 6.45;
      const shopWin = canvasTex(256, 160, (c) => { c.fillStyle = '#fff3d6'; c.fillRect(0, 0, 256, 160); const cols = ['#e63946', '#2a9d8f', '#f4a261', '#264653', '#e9c46a', '#8ab17d'];
        for (let r = 0; r < 4; r++) { c.fillStyle = '#b08a5a'; c.fillRect(0, 36 + r * 32, 256, 4); for (let i = 0; i < 22; i++) { c.fillStyle = cols[(i + r) % 6]; c.fillRect(6 + i * 11, 14 + r * 32, 8, 22); } }
        c.fillStyle = '#e63946'; c.font = '800 18px Inter'; c.fillText('Mate 2,50', 160, 152); });
      plane(sc, 2.4, 1.5, shopWin, sx - 0.06, 1.25, sz, -Math.PI / 2, 0.9);
      const neon = canvasTex(256, 80, (c) => { c.fillStyle = '#0a0a12'; c.fillRect(0, 0, 256, 80); c.shadowColor = '#3ff7ff'; c.shadowBlur = 14; c.fillStyle = '#9ffcff'; c.font = '800 54px Inter'; c.textAlign = 'center'; c.fillText('SPÄTI', 128, 60); });
      plane(sc, 1.6, 0.5, neon, sx - 0.07, 2.5, sz, -Math.PI / 2, 1.6);
      const sl = new THREE.PointLight(0xfff0d0, 10, 7, 2); sl.position.set(sx - 1.2, 1.6, sz); sc.add(sl);
      const nl = new THREE.PointLight(0x40f0ff, 6, 5, 2); nl.position.set(sx - 0.6, 2.6, sz); sc.add(nl);
      addBox(sc, 1.2, 0.08, 0.5, mat({ color: 0x8a8d96 }), sx - 0.4, 0.3, sz - 1.6); // step
    }
    // autumn leaves
    { const geo = new THREE.PlaneGeometry(0.09, 0.06); geo.rotateX(-Math.PI / 2); const n = 900;
      const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.9 }), n); const d = new THREE.Object3D(); const cols = [0xc2541b, 0xd9822b, 0x9c3d12, 0xe0a83a, 0x6b4a2e];
      for (let i = 0; i < n; i++) { const side = rnd() < 0.5 ? -1 : 1; d.position.set(side * lerp(3.1, 6.0, rnd()), 0.255, lerp(-40, 30, rnd())); d.rotation.set(0, rnd() * 6.28, 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, new THREE.Color(cols[i % 5])); }
      sc.add(im); }
    // puddles
    for (const [px_, pz] of [[1.2, -2], [-1.5, 6], [4.2, 9.5], [0.4, 14]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.7 + rnd() * 0.5, 10), new THREE.MeshStandardMaterial({ color: 0x0d1020, roughness: 0.04, metalness: 0.9 })); p.rotation.x = -Math.PI / 2; p.scale.set(1.4, 0.7 + rnd() * 0.4, 1); p.position.set(px_, px_ > 3 ? 0.26 : 0.006, pz); sc.add(p); }
    // license plates + tail lights on parked cars
    sc.traverse((o) => { if (o.isGroup && o.children.length >= 6 && o.children[0].geometry && o.children[0].geometry.parameters && o.children[0].geometry.parameters.depth === 4) {
      const pl = canvasTex(128, 32, (c) => { c.fillStyle = '#f4f4f4'; c.fillRect(0, 0, 128, 32); c.fillStyle = '#1f4aa8'; c.fillRect(0, 0, 14, 32); c.fillStyle = '#111'; c.font = '700 20px Inter'; c.fillText('B-LS 18' + ((rnd() * 9) | 0), 18, 24); });
      for (const zz of [-2.01, 2.01]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), new THREE.MeshStandardMaterial({ map: pl })); p.position.set(0, 0.45, zz); if (zz < 0) p.rotation.y = Math.PI; o.add(p); }
      for (const tx of [-0.7, 0.7]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.03), mat({ color: 0x8a1010, emissive: 0x500000, emissiveIntensity: 1 })); tl.position.set(tx, 0.75, -2.01); o.add(tl); } } });
    // window frames + flower boxes on all street-facing windows (cheap pass over existing window boxes)
    const frameM = mat({ color: 0xe8e4dc }), flowerM = mat({ color: 0xd64c6c }), boxM = mat({ color: 0x6b4a2e });
    const wins = []; sc.traverse((o) => { if (o.isMesh && o.geometry.parameters && o.geometry.parameters.width === 0.1 && o.geometry.parameters.height === 1.2 && o.geometry.parameters.depth === 1.1) wins.push(o); });
    wins.forEach((w, i) => { const sx = Math.sign(w.position.x); const fx = w.position.x - sx * 0.04;
      addBox(sc, 0.06, 0.08, 1.3, frameM, fx, w.position.y + 0.64, w.position.z, false); addBox(sc, 0.08, 0.08, 1.3, frameM, fx, w.position.y - 0.64, w.position.z, false);
      if (i % 4 === 1 && w.position.y < 3) { addBox(sc, 0.25, 0.18, 1.0, boxM, fx - sx * 0.12, w.position.y - 0.75, w.position.z, false); for (let k = 0; k < 4; k++) addBox(sc, 0.12, 0.14, 0.12, k % 2 ? flowerM : mat({ color: 0x3f9a4c }), fx - sx * 0.12, w.position.y - 0.6, w.position.z - 0.35 + k * 0.23, false); } });
    // graffiti
    { const gt = canvasTex(256, 128, (c) => { c.clearRect(0, 0, 256, 128); c.lineWidth = 10; c.lineCap = 'round'; c.strokeStyle = '#ff4fd8'; c.beginPath(); c.moveTo(20, 90); c.bezierCurveTo(60, 10, 90, 120, 130, 40); c.stroke(); c.strokeStyle = '#4fd8ff'; c.beginPath(); c.moveTo(120, 100); c.bezierCurveTo(160, 20, 200, 110, 240, 30); c.stroke(); c.fillStyle = '#ffd84f'; c.font = '800 30px Inter'; c.fillText('KIEZ', 80, 120); });
      const gp = plane(sc, 2.0, 0.7, gt, 6.44, 0.62, 3.4, -Math.PI / 2); gp.material.transparent = true; }
    // stars + moon
    { const sg = new THREE.BufferGeometry(); const pos = []; for (let i = 0; i < 400; i++) { const a = rnd() * 6.28, e = 0.15 + rnd() * 1.2; pos.push(Math.cos(a) * Math.cos(e) * 150, 20 + Math.sin(e) * 120, Math.sin(a) * Math.cos(e) * 150); }
      sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, fog: false })); sc.add(stars);
      const moon = new THREE.Mesh(new THREE.CircleGeometry(4, 20), new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: false })); moon.position.set(-40, 60, -120); moon.lookAt(0, 0, 0); sc.add(moon); }
  }

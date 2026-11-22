  // ---- door + hallway details (v4) ----
  {
    // second nameplate + intercom panel
    plane(sc, 0.16, 0.06, canvasTex(96, 36, (c) => { c.fillStyle = '#d9d9d9'; c.fillRect(0, 0, 96, 36); c.fillStyle = '#222'; c.font = '700 22px Inter'; c.textAlign = 'center'; c.fillText('YILMAZ', 48, 26); }), 0.175, 1.53, 0.9, Math.PI / 2);
    addBox(sc, 0.03, 0.32, 0.22, mat({ color: 0x9a9a9a, metalness: 0.7, roughness: 0.3 }), 0.155, 1.5, 0.9, false);
    for (let i = 0; i < 6; i++) addBox(sc, 0.01, 0.012, 0.12, mat({ color: 0x333333 }), 0.18, 1.62 + i * 0.02, 0.9, false); // speaker grill
    // letterbox + glass panel on the door leaf
    const leaf = door.userData.hinge.children[0];
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.7, 0.35), new THREE.MeshStandardMaterial({ color: 0xffb8f0, emissive: 0xff60d0, emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.85 }));
    glass.position.set(0, 0.45, 0); leaf.add(glass);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.32), mat({ color: 0xc9a227, metalness: 0.8, roughness: 0.3 })); slot.position.set(0, -0.35, 0); leaf.add(slot);
    // plant + umbrella stand outside
    plant(sc, 0.55, -1.0, 0.9);
    // hallway: stairs at the end, family photos, mirror, sideboard with key bowl, pendant lamp, runner rug
    for (let i = 0; i < 8; i++) { addBox(sc, 0.5, 0.18, 0.3, mat({ color: shade(0x6b4a2e, 0.9 + (i % 2) * 0.15) }), -6.85, 0.09 + i * 0.18, -1.0 + i * 0.28); addBox(sc, 0.04, 0.9, 0.04, mat({ color: 0x3a2716 }), -6.62, 0.6 + i * 0.18, -1.0 + i * 0.28, false); }
    addBox(sc, 0.05, 0.05, 2.3, mat({ color: 0x3a2716 }), -6.62, 1.05 + 0.65, -0.02, false).rotation.x = -0.57;
    const famPhoto = (x, y, z, ry, w, h, seedP) => poster(sc, w, h, x, y, z, ry, (c, W, H) => { c.fillStyle = '#d9e8f0'; c.fillRect(0, 0, W, H); c.fillStyle = '#7fb07f'; c.fillRect(0, H * 0.7, W, H * 0.3);
      const n = 2 + (seedP % 3); for (let i = 0; i < n; i++) { const x0 = 12 + i * (W - 24) / n; c.fillStyle = ['#e2b48c', '#c98d5f', '#f0c8a0'][i % 3]; c.fillRect(x0 + 4, H * 0.35, 14, 14); c.fillStyle = ['#ff6a6a', '#4aa3ff', '#ffd84f', '#46d18a'][(i + seedP) % 4]; c.fillRect(x0, H * 0.35 + 15, 22, 26); c.fillStyle = '#5a3a20'; c.fillRect(x0 + 4, H * 0.35 - 3, 14, 4); } });
    famPhoto(-2.2, 1.7, 1.17, Math.PI, 0.45, 0.35, 1); famPhoto(-2.9, 1.95, 1.17, Math.PI, 0.35, 0.45, 2); famPhoto(-3.5, 1.6, 1.17, Math.PI, 0.5, 0.35, 3);
    famPhoto(-4.4, 1.75, -1.17, 0, 0.45, 0.35, 4); famPhoto(-5.1, 1.9, -1.17, 0, 0.35, 0.45, 5);
    { const mir = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.03), new THREE.MeshStandardMaterial({ color: 0xbfd8ff, roughness: 0.05, metalness: 1 })); mir.position.set(-4.2, 1.6, 1.16); sc.add(mir); addBox(sc, 0.56, 0.96, 0.02, mat({ color: 0x2a2a2a }), -4.2, 1.6, 1.175, false); }
    addBox(sc, 1.0, 0.8, 0.35, mat({ color: 0xe8e0d0 }), -3.0, 0.4, -1.0); addBox(sc, 0.25, 0.06, 0.2, mat({ color: 0x3a6ea5 }), -3.2, 0.83, -1.0, false); addBox(sc, 0.05, 0.02, 0.08, mat({ color: 0xc9a227, metalness: 0.8 }), -3.15, 0.87, -0.98, false);
    addBox(sc, 0.08, 0.32, 0.08, mat({ color: 0xff4fd8 }), -2.75, 0.96, -1.0, false); // bottle
    { const runner = canvasTex(64, 256, (c) => { c.fillStyle = '#7a2a3a'; c.fillRect(0, 0, 64, 256); c.fillStyle = '#c9a24a'; c.fillRect(4, 0, 4, 256); c.fillRect(56, 0, 4, 256); for (let y = 8; y < 256; y += 24) { c.fillStyle = '#e6c88a'; c.fillRect(24, y, 16, 8); } }, true);
      const r = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 5.5), new THREE.MeshStandardMaterial({ map: runner, roughness: 1 })); r.rotation.set(-Math.PI / 2, 0, Math.PI / 2); r.position.set(-3.4, 0.055, 0); r.receiveShadow = true; sc.add(r); }
    { const lamp = addBox(sc, 0.35, 0.18, 0.35, mat({ color: 0xfff1c9, emissive: 0xffd27a, emissiveIntensity: 0.8 }), -2.6, 2.45, 0, false); addBox(sc, 0.02, 0.3, 0.02, mat({ color: 0x222222 }), -2.6, 2.65, 0, false); const pl = new THREE.PointLight(0xffd8a0, 6, 6, 2); pl.position.set(-2.6, 2.2, 0); sc.add(pl); }
    // light switch
    addBox(sc, 0.08, 0.12, 0.02, mat({ color: 0xf2f2f2 }), -0.5, 1.25, -1.15, false);
  }

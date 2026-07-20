/* Decorative Penrose-staircase monument — lazy-loaded Three.js scene.
   A fixed orthographic isometric camera views four ascending flights of
   stairs arranged in a diamond loop. The loop closes because the final
   corner is displaced exactly along the camera's view axis from the
   first corner, so both project to the same screen position: the stairs
   appear to rise forever. The camera never moves — rotation would
   expose the trick. Only the girl walks and the clouds drift; all other
   elements are static.
   Sets canvas.dataset.rendered = '1' after the first successful frame
   so the loader can fall back if rendering never happens. */

import * as THREE from '../vendor/three.module.min.js';

export function initCastle(canvas, frame) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(pointer: coarse)').matches || innerWidth < 720;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));

  const scene = new THREE.Scene();

  /* ---------- Penrose geometry constants ----------
     Corners (platform tops, counter-clockwise in plan):
       C0 (0,0,0) → C1 (+x) → C2 (+z) → C3 (−x) → C4 (−z)
     Each flight rises H. The +x and +z runs are longer than the −x and
     −z runs by 2H each, so the loop's end lands at C4 = C0 + 4H·(1,1,1):
     a pure view-axis offset for a camera looking along (1,1,1). */
  const L = 9;
  const H = 1.8;
  const P = 2.7;       // corner platform size
  const STAIR_W = 2.1;
  const corners = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(L + 2 * H, H, 0),
    new THREE.Vector3(L + 2 * H, 2 * H, L + 2 * H),
    new THREE.Vector3(4 * H, 3 * H, L + 2 * H),
    new THREE.Vector3(4 * H, 4 * H, 4 * H) // ≡ C0 on screen
  ];
  const center = new THREE.Vector3(
    (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4,
    2 * H,
    (corners[0].z + corners[1].z + corners[2].z + corners[3].z) / 4
  );
  const VIEW = new THREE.Vector3(1, 1, 1).normalize();

  /* ---------- camera: fixed orthographic isometric ---------- */
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const HALF_H = mobile ? 13.4 : 12.4;
  const lookTarget = center.clone()
    .add(new THREE.Vector3(1, 0, -1).normalize().multiplyScalar(0.5))
    .add(new THREE.Vector3(0, -0.6, 0));
  camera.position.copy(lookTarget).addScaledVector(VIEW, 60);
  camera.lookAt(lookTarget);
  camera.up.set(0, 1, 0);

  /* ---------- palette + shared materials ---------- */
  const C = {
    wall: 0xF2AEBE,      // main pink stone
    wallDeep: 0xE697AB,  // shaded pink
    blush: 0xF6C4CE,
    cream: 0xF6E7DB,
    trim: 0xFBF2EA,      // white stone trim
    tread: 0xF8EAE2,
    riser: 0xF0A9BA,
    dome: 0xB9BFD3,
    glow: 0xFFC98A,      // warm belfry light
    banner: 0xC3A6DC,
    coral: 0xE07A5F,
    lavender: 0xB9A5D6,
    petal: 0xF08CA4,
    hair: 0x3A2E33,
    skin: 0xF1C6A7,
    sage: 0x8FA98A,
    cloud: 0xFCF4EF
  };
  const mats = {};
  function M(color) {
    if (!mats[color]) mats[color] = new THREE.MeshLambertMaterial({ color });
    return mats[color];
  }
  const glowMat = new THREE.MeshBasicMaterial({ color: C.glow });
  const domeMat = new THREE.MeshLambertMaterial({ color: C.dome, flatShading: true });

  /* ---------- lights: warm sunset, no shadow maps ---------- */
  scene.add(new THREE.HemisphereLight(0xFFF2E8, 0xF3B9C6, 1.3));
  const sunLight = new THREE.DirectionalLight(0xFFDDB4, 1.2);
  sunLight.position.set(-14, 20, 6);
  scene.add(sunLight);

  const world = new THREE.Group();
  scene.add(world);

  const box = (w, h, d, c) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c));
  const cyl = (rt, rb, h, c, seg = 10) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c));
  const sph = (r, c, ws = 10, hs = 8) => new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), M(c));
  function place(mesh, x, y, z, parent = world) {
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }

  /* ---------- small decorations ---------- */
  function flower(x, y, z, bloomColor = C.petal) {
    const g = new THREE.Group();
    const stem = cyl(0.045, 0.045, 0.72, C.sage, 5); stem.position.y = 0.36; g.add(stem);
    const leaf1 = sph(0.12, C.sage, 7, 5); leaf1.scale.set(1.7, 0.5, 0.7);
    leaf1.position.set(0.16, 0.3, 0); leaf1.rotation.z = 0.5; g.add(leaf1);
    const leaf2 = leaf1.clone(); leaf2.position.set(-0.15, 0.42, 0.05);
    leaf2.rotation.z = -0.6; g.add(leaf2);
    for (let i = 0; i < 3; i++) {
      const p = sph(0.11, bloomColor, 8, 6);
      const a = (i / 3) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.09, 0.78 + (i % 2) * 0.06, Math.sin(a) * 0.09);
      g.add(p);
    }
    const heart = sph(0.07, 0xF7D9A8, 7, 5); heart.position.y = 0.86; g.add(heart);
    g.position.set(x, y, z);
    world.add(g);
    return g;
  }
  function candle(x, y, z) {
    const g = new THREE.Group();
    const base = cyl(0.1, 0.12, 0.1, C.trim, 8); base.position.y = 0.05; g.add(base);
    const stick = cyl(0.06, 0.06, 0.3, C.cream, 8); stick.position.y = 0.25; g.add(stick);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 6), glowMat);
    fl.position.y = 0.46; fl.scale.y = 1.5; g.add(fl);
    g.position.set(x, y, z);
    world.add(g);
  }
  function orbPillar(x, y, z, orbColor = C.trim) {
    const g = new THREE.Group();
    const post = cyl(0.13, 0.17, 0.72, C.trim, 8); post.position.y = 0.36; g.add(post);
    const cap = cyl(0.2, 0.2, 0.08, C.cream, 8); cap.position.y = 0.76; g.add(cap);
    const orb = sph(0.2, orbColor, 12, 10); orb.position.y = 0.98; g.add(orb);
    g.position.set(x, y, z);
    world.add(g);
  }
  // white-trimmed arched window on a tower face (faces +x or +z toward camera)
  function windowOn(x, y, z, alongX) {
    const g = new THREE.Group();
    const frame_ = box(alongX ? 0.1 : 0.82, 1.25, alongX ? 0.82 : 0.1, C.trim);
    g.add(frame_);
    const inner = box(alongX ? 0.12 : 0.58, 1.0, alongX ? 0.58 : 0.12, C.wallDeep);
    inner.position.set(alongX ? 0.02 : 0, 0, alongX ? 0 : 0.02);
    g.add(inner);
    const archTop = cyl(0.29, 0.29, alongX ? 0.12 : 0.12, C.trim, 10);
    archTop.rotation.z = alongX ? 0 : 0;
    archTop.rotation.x = alongX ? 0 : Math.PI / 2;
    archTop.rotation.z = alongX ? Math.PI / 2 : 0;
    archTop.position.y = 0.62;
    g.add(archTop);
    g.position.set(x, y, z);
    world.add(g);
  }

  /* ---------- staircase loop ---------- */
  const path = [];

  for (let s = 0; s < 4; s++) {
    const A = corners[s], B = corners[s + 1];
    const dir = new THREE.Vector3(Math.sign(B.x - A.x), 0, Math.sign(B.z - A.z));
    const alongX = dir.x !== 0;
    const runLen = Math.abs(alongX ? B.x - A.x : B.z - A.z);

    // corner platform: white stone cap over a pink body
    place(box(P + 0.35, 0.32, P + 0.35, C.trim), A.x, A.y - 0.16, A.z);
    place(box(P, 1, P, C.wall), A.x, A.y - 0.8, A.z);
    place(box(P + 0.5, 0.24, P + 0.5, C.wallDeep), A.x, A.y - 1.4, A.z);

    // flight of steps
    const start = A.clone().addScaledVector(dir, P / 2);
    const stairRun = runLen - P;
    const n = Math.max(5, Math.round(stairRun / 0.85));
    const stepRun = stairRun / n;
    const stepRise = (B.y - A.y) / n;
    for (let i = 0; i < n; i++) {
      const topY = A.y + stepRise * (i + 1);
      const cx = start.x + (alongX ? dir.x * stepRun * (i + 0.5) : 0);
      const cz = start.z + (!alongX ? dir.z * stepRun * (i + 0.5) : 0);
      const stepMesh = box(
        alongX ? stepRun + 0.06 : STAIR_W,
        1.5,
        alongX ? STAIR_W : stepRun + 0.06,
        i % 2 ? C.tread : C.riser
      );
      place(stepMesh, cx, topY - 0.75, cz);
      path.push(new THREE.Vector3(cx, topY, cz));
    }
    path.push(new THREE.Vector3(B.x, B.y, B.z));
  }

  /* ---------- corner towers (with arched windows) ---------- */
  // C1 (right) and C3 (left) get tall pink towers with windows;
  // C2 (top) gets the big central pier; C0 (front) sits on the arch base.
  [[1, 11], [3, 12]].forEach(([ci, towerH]) => {
    const A = corners[ci];
    place(box(P - 0.3, towerH, P - 0.3, C.wall), A.x, A.y - 1.5 - towerH / 2, A.z);
    const half = (P - 0.3) / 2 + 0.06;
    windowOn(A.x + half, A.y - 3.6, A.z, true);
    windowOn(A.x, A.y - 3.4, A.z + half, false);
    windowOn(A.x + half, A.y - 6.4, A.z, true);
  });
  // C2: wide central pier dropping through the middle of the loop
  {
    const A = corners[2];
    place(box(P + 0.2, 15, P + 0.2, C.wall), A.x, A.y - 1.5 - 7.5, A.z);
    const half = (P + 0.2) / 2 + 0.06;
    windowOn(A.x + half, A.y - 4.2, A.z, true);
    windowOn(A.x, A.y - 4.4, A.z + half, false);
    windowOn(A.x + half, A.y - 7.6, A.z, true);
  }

  /* ---------- grand arch base beneath the front corner ---------- */
  {
    const g = new THREE.Group();
    world.add(g);
    g.position.set(corners[0].x, 0, corners[0].z);
    g.rotation.y = -Math.PI / 4; // arch face toward the camera
    const pierL = box(1.5, 8.5, 2.3, C.wall); pierL.position.set(-2, -5.9, 0); g.add(pierL);
    const pierR = box(1.5, 8.5, 2.3, C.wall); pierR.position.set(2, -5.9, 0); g.add(pierR);
    const span = box(5.6, 1.5, 2.3, C.wall); span.position.set(0, -2.3, 0); g.add(span);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.5, 8, 20, Math.PI), M(C.trim));
    ring.position.set(0, -3.2, 0); g.add(ring);
    const sill = box(6, 0.4, 2.6, C.trim); sill.position.set(0, -1.62, 0); g.add(sill);
  }
  /* twin small arches tucked under the right flight */
  {
    const g = new THREE.Group();
    world.add(g);
    g.position.set(9, -3.3, 2.2);
    g.rotation.y = -Math.PI / 4;
    const blockW = 4.6;
    const body = box(blockW, 5.4, 2, C.wall); body.position.y = -2.7; g.add(body);
    const cap = box(blockW + 0.4, 0.4, 2.3, C.trim); cap.position.y = 0; g.add(cap);
    [-1.1, 1.1].forEach((ox) => {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.22, 8, 14, Math.PI), M(C.trim));
      arch.position.set(ox, -3, 1.02); g.add(arch);
      const dark = box(1.15, 2.2, 0.15, C.wallDeep); dark.position.set(ox, -3.9, 1); g.add(dark);
    });
  }

  /* ---------- bell tower (upper right, behind the loop) ---------- */
  {
    const g = new THREE.Group();
    world.add(g);
    g.position.set(21.8, 1.6, 12);
    const bodyH = 13;
    const body = box(3, bodyH, 3, C.wall); body.position.y = bodyH / 2 - 6; g.add(body);
    const band = box(3.5, 0.45, 3.5, C.trim); band.position.y = bodyH - 6.2; g.add(band);
    // belfry with glowing arched openings
    const belfry = box(3.2, 2.8, 3.2, C.cream); belfry.position.y = bodyH - 4.4; g.add(belfry);
    [[1.62, 0, true], [0, 1.62, false]].forEach(([ox, oz, alongX]) => {
      const glow = box(alongX ? 0.12 : 1.1, 1.7, alongX ? 1.1 : 0.12, 0);
      glow.material = glowMat;
      glow.position.set(ox, bodyH - 4.5, oz); g.add(glow);
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.16, 8, 14, Math.PI), M(C.trim));
      arch.position.set(ox === 0 ? 0 : ox + (alongX ? 0.02 : 0), bodyH - 3.9, oz === 0 ? 0 : oz + 0.02);
      arch.rotation.y = alongX ? Math.PI / 2 : 0;
      g.add(arch);
    });
    const cornice = box(3.7, 0.45, 3.7, C.trim); cornice.position.y = bodyH - 2.85; g.add(cornice);
    // faceted gray dome + finial
    const dm = new THREE.Mesh(new THREE.SphereGeometry(1.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    dm.position.y = bodyH - 2.6; g.add(dm);
    const neck = cyl(0.1, 0.14, 0.5, C.trim, 6); neck.position.y = bodyH - 0.8; g.add(neck);
    const tip = sph(0.16, C.trim, 8, 6); tip.position.y = bodyH - 0.45; g.add(tip);
    // lavender banner on the camera-facing corner
    const banner = box(0.55, 1.9, 0.08, C.banner); banner.position.set(0.9, bodyH - 5.6, 1.62); g.add(banner);
    const bTip = box(0.55, 0.3, 0.08, C.trim); bTip.position.set(0.9, bodyH - 4.55, 1.62); g.add(bTip);
  }

  /* ---------- platform decorations ---------- */
  // C0 (front): flowers + candle
  flower(corners[0].x - 0.95, corners[0].y, corners[0].z + 0.85);
  candle(corners[0].x + 0.9, corners[0].y, corners[0].z - 0.8);
  // C1 (right): blue orb pillar + flower
  orbPillar(corners[1].x + 0.85, corners[1].y, corners[1].z - 0.85, 0xA9C6E2);
  flower(corners[1].x - 0.85, corners[1].y, corners[1].z + 0.8, C.lavender);
  // C2 (top): flowers + candle
  flower(corners[2].x + 0.9, corners[2].y, corners[2].z + 0.85);
  candle(corners[2].x - 0.85, corners[2].y, corners[2].z - 0.8);
  // C3 (left): white orb pillar + flower + candle
  orbPillar(corners[3].x - 0.9, corners[3].y, corners[3].z - 0.8);
  flower(corners[3].x + 0.85, corners[3].y, corners[3].z + 0.8, C.petal);

  /* ---------- freestanding flower columns in the clouds ---------- */
  [[-6.2, 0.6, 9.5, 5.5], [19.5, 1.4, 1.2, 6.5]].forEach(([x, y, z, colH]) => {
    const col = box(1.15, colH, 1.15, C.wall);
    place(col, x, y - colH / 2, z);
    place(box(1.5, 0.3, 1.5, C.trim), x, y + 0.15, z);
    flower(x, y + 0.3, z, C.petal);
  });

  /* ---------- sun ---------- */
  const iso = {
    right: new THREE.Vector3(1, 0, -1).normalize(),
    up: new THREE.Vector3(-1, 2, -1).normalize()
  };
  const sunPos = center.clone()
    .addScaledVector(iso.right, -9.4)
    .addScaledVector(iso.up, 9.8)
    .addScaledVector(VIEW, -30);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.95, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xFFF3CE }));
  sun.position.copy(sunPos);
  scene.add(sun);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xFFE9C2, transparent: true, opacity: 0.38 }));
  halo.position.copy(sunPos);
  scene.add(halo);

  /* ---------- clouds ---------- */
  const clouds = [];
  const cloudMat = new THREE.MeshLambertMaterial({ color: C.cloud, transparent: true, opacity: 0.97 });
  function puffCloud(scale = 1) {
    const g = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < puffs; j++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry((0.9 + Math.random() * 1.2) * scale, 9, 7), cloudMat);
      p.position.set(j * 1.3 * scale - puffs * 0.65 * scale, Math.random() * 0.5, Math.random() * 0.9);
      p.scale.y = 0.55;
      g.add(p);
    }
    return g;
  }
  const nRing = mobile ? 7 : 12;
  for (let i = 0; i < nRing; i++) {
    const g = puffCloud(1 + Math.random() * 0.5);
    const a = (i / nRing) * Math.PI * 2;
    const r = 10.5 + Math.random() * 8.5;
    g.position.set(center.x + Math.cos(a) * r, -5 - Math.random() * 5, center.z + Math.sin(a) * r);
    world.add(g);
    clouds.push({ g, speed: (0.09 + Math.random() * 0.12) * (i % 2 ? 1 : -1), a, r });
  }
  // sky accent clouds (kept clear of the sun at top-left)
  [[24.5, 9, 13, 0.8], [-7.5, 3.5, 2.5, 0.55]].forEach(([x, y, z, s]) => {
    const g = puffCloud(s);
    g.position.set(x, y, z);
    world.add(g);
    clouds.push({ g, speed: 0.07, a: 0, r: 0, drift: true });
  });

  /* ---------- tiny walking girl ---------- */
  const girl = new THREE.Group();
  const legL = cyl(0.09, 0.09, 0.5, 0x8FA3C2, 6); legL.position.set(-0.12, 0.25, 0);
  const legR = cyl(0.09, 0.09, 0.5, 0x8FA3C2, 6); legR.position.set(0.12, 0.25, 0);
  const dress = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.72, 8), M(0xEE9AAE)); dress.position.y = 0.82;
  const torso = cyl(0.17, 0.2, 0.3, 0xEE9AAE, 8); torso.position.y = 1.2;
  const armL = cyl(0.06, 0.06, 0.4, 0xEE9AAE, 6); armL.position.set(-0.26, 1.1, 0);
  const armR = cyl(0.06, 0.06, 0.4, 0xEE9AAE, 6); armR.position.set(0.26, 1.1, 0);
  const head = sph(0.22, C.skin, 12, 10); head.position.y = 1.56;
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), M(C.hair));
  hairCap.position.set(0, 1.6, -0.02);
  const ponytail = sph(0.1, C.hair, 8, 8);
  ponytail.position.set(0, 1.5, -0.26);
  ponytail.scale.set(1, 1.6, 1);
  const backpack = box(0.24, 0.3, 0.14, 0xE38AA0); backpack.position.set(0, 1.15, -0.24);
  girl.add(legL, legR, dress, torso, armL, armR, head, hairCap, ponytail, backpack);
  girl.scale.setScalar(0.92);
  world.add(girl);

  /* girl path over the loop; C4 ≡ C0 on screen so the wrap is invisible */
  path.unshift(corners[0].clone());
  const segLens = [];
  let pathLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const l = path[i].distanceTo(path[i + 1]);
    segLens.push(l);
    pathLen += l;
  }
  let pauseDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    pauseDist += segLens[i];
    if (path[i + 1].equals(corners[2])) break;
  }
  const girlState = { d: 0, mode: 'walk', pauseUntil: 0, speed: pathLen / 34, lapPaused: false };

  function pointAt(dist) {
    let d = ((dist % pathLen) + pathLen) % pathLen;
    for (let i = 0; i < segLens.length; i++) {
      if (d <= segLens[i]) {
        const p = path[i].clone().lerp(path[i + 1], segLens[i] ? d / segLens[i] : 0);
        const dirv = path[i + 1].clone().sub(path[i]);
        dirv.y = 0;
        if (dirv.lengthSq() < 1e-6) dirv.set(1, 0, 0);
        return { p, dirv: dirv.normalize() };
      }
      d -= segLens[i];
    }
    return { p: path[0].clone(), dirv: new THREE.Vector3(1, 0, 0) };
  }

  function poseGirl(dist, yawTarget) {
    const { p, dirv } = pointAt(dist);
    girl.position.copy(p);
    const face = yawTarget !== undefined ? yawTarget : Math.atan2(dirv.x, dirv.z);
    let dy = face - girl.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    girl.rotation.y += dy * 0.15;
  }

  function updateGirl(t, dt) {
    if (girlState.mode === 'pause') {
      const target = Math.atan2(sunPos.x - girl.position.x, sunPos.z - girl.position.z);
      poseGirl(girlState.d, target);
      legL.rotation.x *= 0.9; legR.rotation.x *= 0.9;
      armL.rotation.x *= 0.9; armR.rotation.x *= 0.9;
      if (t > girlState.pauseUntil) girlState.mode = 'walk';
      return;
    }
    const before = girlState.d;
    girlState.d += girlState.speed * dt;
    if (girlState.d >= pathLen) {
      girlState.d -= pathLen;       // invisible: C4 and C0 share a screen position
      girlState.lapPaused = false;
    }
    if (!girlState.lapPaused && before < pauseDist && girlState.d >= pauseDist) {
      girlState.lapPaused = true;
      girlState.d = pauseDist;
      girlState.mode = 'pause';
      girlState.pauseUntil = t + 2.4;
      return;
    }
    poseGirl(girlState.d);
    const swing = Math.sin(t * 7) * 0.5;
    legL.rotation.x = swing; legR.rotation.x = -swing;
    armL.rotation.x = -swing * 0.6; armR.rotation.x = swing * 0.6;
    girl.position.y += Math.abs(Math.sin(t * 7)) * 0.045;
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = frame.clientWidth || 300, h = frame.clientHeight || 260;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.left = -HALF_H * aspect;
    camera.right = HALF_H * aspect;
    camera.top = HALF_H;
    camera.bottom = -HALF_H;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); if (reduced) renderOnce(); });
  ro.observe(frame);
  resize();

  /* ---------- render loop with offscreen/hidden pausing ---------- */
  let visible = true, running = false, rafId = 0;
  const clock = new THREE.Clock();

  function markRendered() {
    if (canvas.dataset.rendered) return;
    canvas.dataset.rendered = '1';
    frame.classList.add('scene-ready');
  }

  function ambient(dt) {
    for (const c of clouds) {
      if (c.drift) {
        c.g.position.x += c.speed * dt;
        if (c.g.position.x > 27) c.g.position.x = -11;
      } else {
        c.a += (c.speed * dt) / c.r;
        c.g.position.x = center.x + Math.cos(c.a) * c.r;
        c.g.position.z = center.z + Math.sin(c.a) * c.r;
      }
    }
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    updateGirl(t, dt);
    ambient(dt);
    renderer.render(scene, camera);
    markRendered();
  }

  function renderOnce() {
    poseGirl(pathLen * 0.3);
    renderer.render(scene, camera);
    markRendered();
  }

  function start() {
    if (reduced) { renderOnce(); return; }
    if (running) return;
    running = true;
    clock.start();
    tick();
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !document.hidden) start(); else stop();
  }, { rootMargin: '100px' });
  io.observe(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  // render the first frame immediately so the scene is never blank
  renderOnce();
  start();

  window.addEventListener('pagehide', () => {
    stop();
    io.disconnect();
    ro.disconnect();
    scene.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
  }, { once: true });
}

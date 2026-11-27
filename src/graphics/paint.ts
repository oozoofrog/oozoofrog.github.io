import * as T from "three";

function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Small broken strokes share a direction within each patch, like marks from a dry brush.
export function paintedMap(
  base: string,
  pigments: string[],
  seed: number,
  size = 256,
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const random = seeded(seed);
  for (let i = 0; i < size * 11; i++) {
    const x = random() * size,
      y = random() * size;
    const a = -0.66 + 0.29 * Math.sin(y * 0.04) + random() * 0.64;
    const len = 0.8 + random() ** 2 * 16;
    ctx.strokeStyle = pigments[Math.floor(random() * pigments.length)];
    ctx.globalAlpha = 0.12 + 0.46 * random();
    ctx.lineWidth = 0.45 + random() ** 2 * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + len * 0.58,
      y + Math.sin(a) * len * 0.38,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    ctx.stroke();
  }
  return texture(canvas);
}

function texture(canvas: HTMLCanvasElement) {
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  map.anisotropy = 4;
  return map;
}

export function earthPaint() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#386497";
  ctx.fillRect(0, 0, 768, 384);
  const continents = [
    [
      [-166, 67],
      [-123, 72],
      [-87, 72],
      [-54, 49],
      [-83, 30],
      [-99, 18],
      [-117, 32],
      [-145, 55],
    ],
    [
      [-80, 9],
      [-61, 13],
      [-35, -5],
      [-46, -27],
      [-70, -55],
      [-80, -24],
    ],
    [
      [-15, 34],
      [9, 38],
      [29, 31],
      [51, 13],
      [43, -11],
      [27, -35],
      [17, -30],
      [9, -5],
      [-15, 7],
    ],
    [
      [-11, 36],
      [-5, 55],
      [19, 70],
      [40, 60],
      [67, 71],
      [117, 75],
      [172, 59],
      [145, 49],
      [120, 24],
      [109, 5],
      [93, 26],
      [77, 7],
      [66, 26],
      [51, 14],
      [32, 36],
      [13, 42],
    ],
    [
      [112, -22],
      [131, -12],
      [143, -15],
      [154, -32],
      [142, -41],
      [115, -34],
    ],
    [
      [-54, 60],
      [-20, 76],
      [-34, 83],
      [-65, 78],
    ],
  ];
  for (const polygon of continents) {
    ctx.fillStyle = "#9ca372";
    ctx.beginPath();
    polygon.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * 768,
        y = ((90 - lat) / 180) * 384;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
  const pixels = ctx.getImageData(0, 0, 768, 384).data;
  const random = seeded(473);
  const ocean = ["#173c65", "#204e78", "#6895b3", "#a5bcc6", "#244e90"];
  const land = ["#6a815e", "#b4b789", "#e4cd9e", "#7c915c", "#e2d9b4"];
  for (let i = 0; i < 17000; i++) {
    const x = random() * 768,
      y = random() * 384;
    const choice =
      pixels[4 * (Math.floor(y) * 768 + Math.floor(x))] > 100 ? land : ocean;
    const cloud =
      Math.sin(x * 0.028 + y * 0.042 + 2.3 * Math.sin(y * 0.032)) +
        0.58 * Math.cos(y * 0.082 - x * 0.012) >
      0.9;
    ctx.strokeStyle = cloud
      ? random() > 0.35
        ? "#fff9e8"
        : "#dbe6e2"
      : choice[Math.floor(random() * choice.length)];
    ctx.globalAlpha = 0.35 + random() * 0.61;
    ctx.lineWidth = 0.7 + random() ** 2 * 6;
    const length = 2 + random() ** 2 * 17,
      dy = Math.sin(y * 0.03 + x * 0.012) * length * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + length * 0.6, y + dy * 0.25, x + length, y + dy);
    ctx.stroke();
  }
  return texture(canvas);
}

export function lunarSky(camera: T.OrthographicCamera, target: T.Vector3) {
  const sky = new T.Group();
  sky.position.copy(target);
  sky.quaternion.copy(camera.quaternion);
  const atlas = earthPaint();
  const earth = new T.Mesh(
    new T.SphereGeometry(1.18, 64, 48),
    new T.MeshStandardMaterial({
      map: atlas,
      emissiveMap: atlas,
      roughness: 1,
      emissive: 0xffffff,
      emissiveIntensity: 0.48,
    }),
  );
  earth.position.set(1.27, 1.49, -3.8);
  earth.rotation.set(0.17, -1.33, -0.35);
  sky.add(earth);
  const moon = new T.Mesh(
    new T.IcosahedronGeometry(0.109, 3),
    new T.MeshStandardMaterial({
      map: paintedMap("#e6ba71", ["#906b47", "#fdf1b3", "#b69c7e"], 17, 96),
      roughness: 1,
    }),
  );
  moon.position.set(-1.12, 1.08, -3.2);
  sky.add(moon);
  const ink = new T.LineBasicMaterial({ color: 0x574a3f });
  const stars: T.Vector3[] = [];
  const random = seeded(559);
  for (let i = 0; i < 46; i++) {
    const x = (random() - 0.5) * 3.75,
      y = (random() - 0.5) * 3.7;
    const r = i % 7 === 0 ? 0.041 : 0.009 + random() * 0.009;
    stars.push(
      new T.Vector3(x - r, y, -4),
      new T.Vector3(x + r, y + 0.003, -4),
      new T.Vector3(x, y - r * 1.3, -4),
      new T.Vector3(x + 0.003, y + r * 1.3, -4),
    );
  }
  sky.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(stars), ink));
  return sky;
}

export function lunarGround() {
  const group = new T.Group();
  const random = seeded(355);
  const soil = paintedMap(
    "#c9bba3",
    ["#ded0b6", "#938475", "#776d65", "#f5e6c7", "#ad9983"],
    22,
    512,
  );
  soil.repeat.set(2.6, 2.6);
  const ground = new T.PlaneGeometry(12, 12, 90, 90);
  ground.rotateX(-Math.PI / 2);
  const craters = Array.from({ length: 48 }, () => ({
    x: (random() - 0.5) * 8,
    z: (random() - 0.5) * 8,
    r: 0.12 + random() ** 2 * 0.55,
  }));
  function elevation(x: number, z: number) {
    let y =
      -0.18 + 0.06 * Math.sin(3 * x + 0.9 * z) + 0.045 * Math.cos(3 * z - x);
    for (const c of craters) {
      const q = Math.hypot(c.x - x, c.z - z) / c.r;
      if (q < 1.35)
        y +=
          c.r *
          (0.16 * Math.exp(-((q - 1) ** 2) * 19) -
            0.32 * Math.exp(-q * q * 2.3));
    }
    const distance = Math.hypot(x + 0.26, z * 0.46);
    return T.MathUtils.lerp(
      -0.13,
      y,
      T.MathUtils.smoothstep(distance, 0.98, 1.6),
    );
  }
  const pos = ground.attributes.position;
  for (let i = 0; i < pos.count; i++)
    pos.setY(i, elevation(pos.getX(i), pos.getZ(i)));
  ground.computeVertexNormals();
  const floor = new T.Mesh(
    ground,
    new T.MeshStandardMaterial({ map: soil, roughness: 1 }),
  );
  floor.receiveShadow = true;
  group.add(floor);
  const stone = new T.DodecahedronGeometry(1, 0);
  const gravel = new T.InstancedMesh(
    stone,
    new T.MeshStandardMaterial({ color: 0x94877c, roughness: 1 }),
    140,
  );
  const marker = new T.Object3D();
  for (let i = 0; i < gravel.count; i++) {
    const x = (random() - 0.5) * 8,
      z = (random() - 0.5) * 7,
      r = 0.012 + random() ** 3 * 0.13;
    marker.position.set(x, elevation(x, z), z);
    marker.rotation.set(random(), random(), random());
    marker.scale.set(r * 1.35, r * 0.72, r);
    if (Math.hypot(x + 0.26, z * 0.46) < 0.9) marker.scale.multiplyScalar(0.15);
    marker.updateMatrix();
    gravel.setMatrixAt(i, marker.matrix);
  }
  gravel.castShadow = true;
  group.add(gravel);
  // Fade the back into a low horizon rather than filling the sky with the plane.
  group.scale.z = 0.46;
  return group;
}

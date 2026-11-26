// Run from the repository root with node scripts/astronaut/build.mjs.
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { parts, visor } from "./sculpt.mjs";
import { facialParts, faceToPainting } from "./face.mjs";

const source = await sharp("assets/images/astronaut-paint.webp")
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const originX = 188,
  originY = 442;
const size = 0.0037,
  elevation = 0.39;
const clamp = T.MathUtils.clamp;
const mix = T.MathUtils.lerp;
const smooth = (a, b, x) => T.MathUtils.smoothstep(x, a, b);
const world = (x, y, z) =>
  new T.Vector3((x - 436) * size, (1036 - y) * size, z * size);
const art = new T.Group();
art.name = "Astronaut · original painting view";
art.rotation.x = -elevation;

function station(profile, t) {
  const rows = profile.stations;
  const y = mix(rows[0][0], rows.at(-1)[0], t);
  let i = 0;
  while (i < rows.length - 2 && rows[i + 1][0] < y) i++;
  const a = rows[i],
    b = rows[i + 1],
    prev = rows[Math.max(0, i - 1)],
    next = rows[Math.min(rows.length - 1, i + 2)];
  const dy = b[0] - a[0],
    f = (y - a[0]) / dy;
  const bootLift =
    profile.name.startsWith("Far boot") || profile.name === "Far pressure boot"
      ? 78 * smooth(991, 1124, y)
      : 0;
  return [
    y,
    ...[1, 2, 3, 4].map((k) => {
      const entry = ((b[k] - prev[k]) / (b[0] - prev[0])) * dy;
      const exit = ((next[k] - a[k]) / (next[0] - a[0])) * dy;
      return (
        (k > 2 ? bootLift : 0) +
        mix(a[k], b[k], f) +
        f *
          (1 - f) *
          ((1 - f) * (entry - b[k] + a[k]) + f * (b[k] - a[k] - exit))
      );
    }),
  ];
}

function sample(row, u) {
  const [y, left, right, back, front] = row;
  // Put the texture seam on the back. Positive z faces the reference camera.
  const angle = (u - 0.5) * 2 * Math.PI;
  return [
    (left + right) / 2 + ((right - left) / 2) * Math.sin(angle),
    y,
    (back + front) / 2 + ((front - back) / 2) * Math.cos(angle),
  ];
}
const depthWidth = source.info.width,
  depthHeight = source.info.height;
const frontDepth = new Float32Array(depthWidth * depthHeight).fill(-Infinity);
for (const part of parts) {
  const first = part.stations[0][0],
    last = part.stations.at(-1)[0];
  for (let y = first; y <= last; y++) {
    const [, l, r, b, f] = station(part, (y - first) / (last - first));
    for (let x = Math.ceil(l); x <= r; x++) {
      const cos = Math.sqrt(Math.max(0, 1 - ((2 * x - l - r) / (r - l)) ** 2));
      const z = (f + b + (f - b) * cos) / 2;
      const index = (y - originY) * depthWidth + x - originX;
      frontDepth[index] = Math.max(frontDepth[index], z);
    }
  }
}

const tileW = 384,
  tileH = 320,
  columns = 4,
  atlasW = tileW * columns,
  atlasH = tileH * Math.ceil((parts.length + facialParts.length) / columns);
const atlas = Buffer.alloc(atlasW * atlasH * 3);
const paints = {
  linen: [
    [228, 215, 188],
    [438, 934, 23, 29],
  ],
  boot: [
    [199, 185, 160],
    [447, 987, 21, 30],
  ],
  rubber: [
    [69, 62, 52],
    [517, 1085, 25, 18],
  ],
  collar: [
    [123, 118, 99],
    [429, 857, 22, 21],
  ],
  skin: [
    [153, 174, 77],
    [326, 731, 34, 25],
  ],
  pack: [
    [155, 153, 141],
    [222, 827, 22, 49],
  ],
};
function pixel(x, y) {
  const index =
    (clamp(Math.round(y - originY), 0, depthHeight - 1) * depthWidth +
      clamp(Math.round(x - originX), 0, depthWidth - 1)) *
    3;
  return [source.data[index], source.data[index + 1], source.data[index + 2]];
}
function undercoat(part, u, t, nx, nz) {
  const [base, [px, py, w, h]] = paints[part.pigment];
  const bx = (u * 5 + 0.03 * Math.sin(19 * t)) * Math.PI * 2,
    by = (t * 3 + 0.05 * Math.sin(27 * u)) * Math.PI * 2;
  const brush = pixel(
    px + ((1 + Math.sin(bx)) * w) / 2,
    py + ((1 + Math.sin(by)) * h) / 2,
  );
  let light = 0.89 - 0.085 * nx + 0.066 * Math.cos(Math.PI * t) + 0.048 * nz;
  if (part.pigment === "linen" || part.pigment === "boot") {
    // Narrow folds in the cloth wrap around the arm or leg on its hidden side.
    for (const fold of [0.21, 0.26, 0.69, 0.77]) {
      const dist =
        t -
        fold -
        0.028 * Math.sin(2 * Math.PI * u + 0.6) -
        0.009 * Math.cos(6 * Math.PI * u);
      light -= 0.15 * Math.exp(-((dist / 0.011) ** 2));
      light += 0.08 * Math.exp(-(((dist - 0.015) / 0.012) ** 2));
    }
    const seam = Math.min(Math.abs(u - 0.18), Math.abs(u - 0.82));
    if (seam < 0.004 && Math.sin(t * 210) > 0.01) light *= 0.65;
  }
  if (part.pigment === "rubber") {
    const groove = Math.sin(t * 63 + 3 * Math.cos(u * 9)) + Math.sin(u * 88);
    if (groove > 0.8) light *= 0.65;
  }
  if (part.pigment === "collar") light *= 0.79 + 0.21 * Math.sin(t * 23);
  return base.map((c, i) =>
    clamp((0.79 * c + 0.21 * brush[i]) * light, 0, 255),
  );
}
function geometry(part, uvAt) {
  const ring = part.point ? 96 : 40,
    levels = part.point ? 64 : 32,
    vertices = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= levels; i++) {
    const t = i / levels,
      row = part.point ? null : station(part, t);
    for (let j = 0; j <= ring; j++) {
      const u = j / ring,
        p = world(...(part.point ? faceToPainting(...part.point(u,t)) : sample(row,u)));
      vertices.push(...p.toArray());
      uv.push(...uvAt(u, t));
      if (i < levels && j < ring) {
        const k = i * (ring + 1) + j;
        indices.push(k, k + ring + 1, k + 1, k + 1, k + ring + 1, k + ring + 2);
      }
    }
  }
  for (const i of part.point ? [] : [0, levels]) {
    const row = station(part, i / levels),
      center = world((row[1] + row[2]) / 2, row[0], (row[3] + row[4]) / 2);
    const pole = vertices.length / 3;
    vertices.push(...center.toArray());
    uv.push(...uvAt(0.5, i / levels));
    const k = i * (ring + 1);
    for (let j = 0; j < ring; j++)
      indices.push(
        ...(i === 0 ? [pole, k + j, k + j + 1] : [pole, k + j + 1, k + j]),
      );
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
const painted = new T.MeshBasicMaterial();
painted.name = "Original pigments";
for (const [index, part] of [...parts,...facialParts].entries()) {
  const left = (index % columns) * tileW,
    top = Math.floor(index / columns) * tileH,
    pad = 3;
  const mesh = new T.Mesh(
    geometry(part, (u, t) => [
      (left + pad + u * (tileW - 2 * pad)) / atlasW,
      (top + pad + t * (tileH - 2 * pad)) / atlasH,
    ]),
    painted,
  );
  mesh.name = part.name;
  art.add(mesh);
  for (let j = 0; j < tileH; j++) {
    const t = clamp((j + 0.5 - pad) / (tileH - 2 * pad), 0, 1);
    const row = part.point ? null : station(part, t);
    for (let i = 0; i < tileW; i++) {
      const u = clamp((i + 0.5 - pad) / (tileW - 2 * pad), 0, 1),
        a = (u - 0.5) * 2 * Math.PI;
      const dest = ((top + j) * atlasW + left + i) * 3;
      if (part.point) {
        const color=part.color(u,t,part.point(u,t),pixel);
        atlas.set(color,dest);
        continue;
      }
      const [x, y, z] = sample(row, u),
        color = undercoat(part, u, t, Math.sin(a), Math.cos(a));
      const dep =
        frontDepth[
          (Math.round(y) - originY) * depthWidth + Math.round(x) - originX
        ];
      const visible =
        smooth(0.06, 0.57, Math.cos(a)) * (1 - smooth(1.5, 6, dep - z));
      const ink = pixel(x, y);
      for (let c = 0; c < 3; c++)
        atlas[dest + c] = mix(color[c], ink[c], visible);
    }
  }
}

// The glass is a complete shell. Isolate ink and blue scumbling from the
// transparent region so that the frog never gets printed onto the visor.
const glassW = 768,
  glassH = 384,
  glassInk = Buffer.alloc(glassW * glassH * 4);
for (let j = 0; j < glassH; j++) {
  const t = (j + 0.5) / glassH,
    row = station(visor, t);
  for (let i = 0; i < glassW; i++) {
    const u = (i + 0.5) / glassW,
      [x, y] = sample(row, u),
      a = (u - 0.5) * 2 * Math.PI,
      dest = (j * glassW + i) * 4;
    const c = pixel(x, y),
      isBlue = smooth(4, 25, c[2] - c[0]);
    const nearLeft = x < 285 + (660 - y) * 0.32 && y < 775,
      top = y < 515;
    // Only highlights are painted on the dome. Its silhouette follows the camera.
    const mark = nearLeft || top ? isBlue * 0.73 : 0;
    const front = smooth(0.0, 0.27, Math.cos(a));
    const edge = 0.025 + 0.04 * (1 - Math.abs(Math.cos(a))) ** 3;
    for (let k = 0; k < 3; k++)
      glassInk[dest + k] = mix([142, 173, 183][k], c[k], front * mark);
    glassInk[dest + 3] = 255 * mix(edge, 1, mark * front);
  }
}
const glass = new T.MeshStandardMaterial({
  transparent: true,
  depthWrite: false,
  roughness: 0.36,
  metalness: 0,
});
glass.name = "Pressure glass";
const bubble = new T.Mesh(
  geometry(visor, (u, t) => [u, t]),
  glass,
);
bubble.name = visor.name;
art.add(bubble);

// Fittings that wrap beyond the reference view have their own continuous geometry.
const metal = (name, color, roughness = 0.78) =>
  Object.assign(
    new T.MeshStandardMaterial({ color, roughness, metalness: 0.13 }),
    { name },
  );
const graphite = metal("Graphite gaskets", 0x50493f),
  ivory = metal("Linen enamel", 0xc2b6a1),
  bronze = metal("Burnished orange", 0xb2663b);
const nickel = metal("Brushed nickel", 0x8d8b7f);
function place(name, g, m, x, y, z) {
  const obj = new T.Mesh(g, m);
  obj.name = name;
  obj.position.copy(world(x, y, z));
  art.add(obj);
  return obj;
}
function box(name, p, dimensions, radius, material) {
  return place(
    name,
    new RoundedBoxGeometry(
      ...dimensions.map((d) => d * size),
      2,
      radius * size,
    ),
    material,
    ...p,
  );
}
function pipe(name, points, r, m, closed = false) {
  const path = new T.CatmullRomCurve3(
    points.map((p) => world(...p)),
    closed,
  );
  const obj = new T.Mesh(
    new T.TubeGeometry(
      path,
      Math.max(24, points.length * 2),
      r * size,
      8,
      closed,
    ),
    m,
  );
  obj.name = name;
  art.add(obj);
}
function hoop(name, c, rx, rz, r, m, tilt = 0) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    return [
      c[0] + rx * Math.cos(a),
      c[1] + tilt * Math.sin(a),
      c[2] + rz * Math.sin(a),
    ];
  });
  pipe(name, points, r, m, true);
}
hoop("Helmet seal", [432, 806, 0], 142, 123, 7, graphite, 12);
hoop("Neck locking ring", [432, 812, 0], 142, 124, 5, nickel, 12);
hoop("Neck insulation", [430, 822, -2], 130, 108, 6, ivory, 11);
for (const [side, x] of [
  ["port", 269],
  ["starboard", 427],
]) {
  box(side + " shoulder webbing", [x, 861, -128], [22, 141, 20], 7, graphite);
  pipe(
    side + " oxygen feed",
    [
      [x, 830, -163],
      [x - 9, 791, -136],
      [x + 7, 785, -98],
      [x + 14, 805, -81],
    ],
    6,
    graphite,
  );
  pipe(
    side + " hose braid",
    [
      [x + 1, 830, -168],
      [x - 8, 792, -141],
      [x + 8, 784, -101],
    ],
    1.8,
    bronze,
  );
}
const packFittings = new T.Group();
packFittings.name = "Rear service assembly";
packFittings.position.copy(world(337, 865, -170));
art.add(packFittings);
const start = art.children.length;
box("Backpack rear gasket", [337, 867, -171], [183, 174, 35], 15, graphite);
box("Life support service cover", [337, 865, -187], [173, 161, 23], 14, ivory);
box("Oxygen manifold inset", [337, 843, -200], [131, 73, 6], 9, nickel);
for (let j = 0; j < 5; j++)
  box(
    "Cooling louvre " + j,
    [337, 821 + j * 10, -206],
    [101 - j * 2, 4, 6],
    1.8,
    graphite,
  );
box("Pack closure", [336, 908, -202], [76, 10, 6], 2, bronze);
for (const x of [269, 405])
  for (const y of [803, 927]) {
    const bolt = place(
      "Captive rear fastener",
      new T.CylinderGeometry(3.4 * size, 3.4 * size, 3 * size, 6),
      graphite,
      x,
      y,
      -200,
    );
    bolt.rotation.x = Math.PI / 2;
  }
for (const x of [264, 410]) {
  box("Protective side rail", [x, 866, -200], [7, 115, 11], 3, bronze);
}
box("Access tab", [381, 905, -202], [15, 24, 6], 3, nickel);
for (const fitting of art.children.slice(start)) {
  fitting.position.sub(packFittings.position);
  packFittings.add(fitting);
}
packFittings.rotation.y = 0.34;
for (const [side, x, z] of [
  ["near", 274, -92],
  ["far", 471, -105],
]) {
  const bottle = place(
    side + " oxygen bottle",
    new T.CapsuleGeometry(22 * size, 89 * size, 6, 22),
    nickel,
    x,
    874,
    z,
  );
  bottle.rotation.z = 0.04;
  for (const y of [846, 898])
    hoop(side + " tank strap", [x, y, z], 23, 23, 3, bronze);
}
pipe(
  "Seat seam",
  [
    [290, 945, -77],
    [328, 986, -104],
    [405, 1002, -95],
    [493, 982, -86],
    [530, 954, -67],
  ],
  3,
  graphite,
);

// Embed both paintings in the glTF binary. Geometry and texture coordinates
// can then be inspected in the same asset that the homepage actually loads.
art.traverse((part) => {
  if (!part.isMesh) return;
  if (part.material !== painted && part.material !== glass)
    part.geometry.deleteAttribute("uv");
  if (!part.geometry.index) part.geometry = mergeVertices(part.geometry);
});
const exportScene = new T.Scene();
exportScene.add(art);
globalThis.FileReader = class {
  async readAsDataURL(blob) {
    this.result =
      "data:application/octet-stream;base64," +
      Buffer.from(await blob.arrayBuffer()).toString("base64");
    this.onloadend();
  }
};
const doc = await new GLTFExporter().parseAsync(exportScene, { binary: false });
const geometryBytes = Buffer.from(doc.buffers[0].uri.split(",")[1], "base64");
const chunks = [geometryBytes];
let offset = geometryBytes.length;
doc.images = [];
doc.textures = [];
async function embed(material, raw, w, h, channels) {
  const img = sharp(raw, { raw: { width: w, height: h, channels } });
  const encoded =
    channels === 4
      ? await img.png({ palette: true, quality: 95 }).toBuffer()
      : await img.jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
  const padding = (4 - (offset % 4)) % 4;
  chunks.push(Buffer.alloc(padding), encoded);
  offset += padding;
  const bufferView =
    doc.bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: encoded.length,
    }) - 1;
  const source =
    doc.images.push({
      bufferView,
      mimeType: channels === 4 ? "image/png" : "image/jpeg",
    }) - 1;
  const index = doc.textures.push({ source }) - 1;
  doc.materials.find(
    (m) => m.name === material.name,
  ).pbrMetallicRoughness.baseColorTexture = { index };
  offset += encoded.length;
}
await embed(painted, atlas, atlasW, atlasH, 3);
await embed(glass, glassInk, glassW, glassH, 4);
doc.buffers = [{ byteLength: offset }];
const json = Buffer.from(JSON.stringify(doc));
const bin = Buffer.concat(chunks);
const padded = (n) => Math.ceil(n / 4) * 4;
const jsonN = padded(json.length),
  binN = padded(bin.length),
  length = 28 + jsonN + binN;
const bytes = Buffer.alloc(length);
bytes.write("glTF");
bytes.writeUInt32LE(2, 4);
bytes.writeUInt32LE(length, 8);
bytes.writeUInt32LE(jsonN, 12);
bytes.write("JSON", 16);
bytes.fill(32, 20, 20 + jsonN);
json.copy(bytes, 20);
bytes.writeUInt32LE(binN, 20 + jsonN);
bytes.write("BIN\0", 24 + jsonN);
bin.copy(bytes, 28 + jsonN);
await writeFile("public/assets/models/astronaut-frog.glb", bytes);
console.log(
  `Wrote ${doc.meshes.length} meshes, ${doc.images.length} embedded paintings, ${length} bytes`,
);

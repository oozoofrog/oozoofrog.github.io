import * as T from "three";

export const studies = [
  "knot",
  "strata",
  "network",
  "pulse",
  "cards",
  "antenna",
  "lens",
  "type",
  "glyph",
] as const;
export type Study = (typeof studies)[number];

export function makeStudy(kind: Study) {
  const group = new T.Group();
  const palette: Record<Study, number> = {
    knot: 0x88a380,
    strata: 0xca854f,
    network: 0x9a91b6,
    pulse: 0xac7970,
    cards: 0x84af97,
    antenna: 0x8d9eaa,
    lens: 0x9f9a74,
    type: 0xb297b2,
    glyph: 0x8f9abf,
  };
  const color = palette[kind];
  const polished = new T.MeshStandardMaterial({
    color,
    metalness: 0.45,
    roughness: 0.32,
  });
  const ink = new T.LineBasicMaterial({
    color: new T.Color(color).multiplyScalar(0.38),
  });
  function mesh(geometry: T.BufferGeometry, outline = false) {
    const object = new T.Mesh(geometry, polished);
    if (outline)
      object.add(new T.LineSegments(new T.EdgesGeometry(geometry), ink));
    group.add(object);
    return object;
  }
  function curve(
    points: T.Vector3[],
    material: T.Material,
    radius: number,
    closed = false,
  ) {
    const path = new T.CatmullRomCurve3(points, closed);
    group.add(
      new T.Mesh(
        new T.TubeGeometry(path, points.length * 2, radius, 6, closed),
        material,
      ),
    );
  }
  if (kind === "knot") {
    // An open bundle of filaments winding around a trefoil.
    const path = new T.TorusKnotGeometry(0.9, 0.33, 176, 32, 2, 3);
    const vertices = path.attributes.position;
    for (let j = 0; j < 32; j++) {
      const points = [];
      for (let i = 0; i < 176; i++)
        points.push(new T.Vector3().fromBufferAttribute(vertices, i * 33 + j));
      curve(points, polished, 0.015, true);
    }
    path.dispose();
    group.rotation.z = 0.24;
  } else if (kind === "strata" || kind === "cards" || kind === "type") {
    const count = kind === "cards" ? 6 : 15;
    const plate = new T.BoxGeometry(1.85, 0.055, 1.26);
    for (let i = 0; i < count; i++) {
      const part = mesh(plate, true);
      const phase = i / (count - 1);
      part.position.set(0.22 * Math.sin(phase * 5), (phase - 0.5) * 1.65, 0);
      part.rotation.y =
        kind === "type" ? Math.floor(i / 3) * 0.22 : phase * 1.6;
    }
  } else if (kind === "network" || kind === "glyph") {
    const geo = new T.IcosahedronGeometry(1.12, kind === "network" ? 2 : 1);
    const points = geo.attributes.position;
    const nodes: number[] = [],
      seen = new Set<string>();
    const v = new T.Vector3();
    for (let i = 0; i < points.count; i++) {
      v.fromBufferAttribute(points, i);
      const key = v
        .toArray()
        .map((n) => n.toFixed(3))
        .join("/");
      if (!seen.has(key)) {
        seen.add(key);
        nodes.push(v.x, v.y, v.z);
      }
    }
    group.add(
      new T.LineSegments(
        new T.WireframeGeometry(geo),
        new T.LineBasicMaterial({ color }),
      ),
    );
    const spheres = new T.InstancedMesh(
      new T.IcosahedronGeometry(0.035, 1),
      polished,
      nodes.length / 3,
    );
    const matrix = new T.Matrix4();
    for (let i = 0; i < nodes.length; i += 3)
      spheres.setMatrixAt(
        i / 3,
        matrix.makeTranslation(nodes[i], nodes[i + 1], nodes[i + 2]),
      );
    group.add(spheres);
    mesh(new T.IcosahedronGeometry(0.59, 0), true);
  } else {
    const count = kind === "lens" ? 14 : 25;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const radius =
        kind === "antenna"
          ? 0.18 + 1.04 * t
          : kind === "lens"
            ? 0.76 + 0.26 * Math.sin(t * Math.PI)
            : 0.68 +
              0.24 * Math.cos(t * 2 * Math.PI) +
              0.24 * Math.sin(t * 3 * Math.PI);
      const ring = mesh(new T.TorusGeometry(radius, 0.026, 8, 92));
      ring.rotation.x =
        Math.PI / 2 + (kind === "pulse" ? 0.17 * Math.sin(t * 6) : 0.03);
      ring.position.y = (t - 0.5) * 1.55;
    }
    group.rotation.z = 0.26;
  }
  return group;
}

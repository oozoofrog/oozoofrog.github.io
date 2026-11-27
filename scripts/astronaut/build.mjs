// Run from the repository root with node scripts/astronaut/build.mjs.
import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import {bootSurface} from "./boots.mjs";
import { treadHeight } from "../../src/graphics/boot-tread.mjs";
import { pigmentSampler } from "./pigment.mjs";
import { createRig, trouser, trouserGather } from "./rig.mjs";
import { sleeve, cuppedHand, cheekFingers } from "./arms.mjs";
import { parts, visor } from "./sculpt.mjs";
import { facialParts, faceToPainting } from "./face.mjs";
import { paintingScale as size, elevation } from "../../src/graphics/painting-frame.mjs";
import {suitPaint,serviceEnamel} from "./turnaround.mjs";
import { referenceCoverage } from "./reference.mjs";

const originX = 188, originY = 442;
const source = await sharp("public/assets/images/lunar-journal.webp")
  .extract({left:originX,top:originY,width:522,height:710})
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

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
  return [
    y,
    ...[1, 2, 3, 4].map((k) => {
      const entry = ((b[k] - prev[k]) / (b[0] - prev[0])) * dy;
      const exit = ((next[k] - a[k]) / (next[0] - a[0])) * dy;
      return (
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
// The boot upper and the rubber tread share one welt, from toe to heel.
// Axes are measured in the painting. The ankle sits behind this oblique plane.
const legParts = [];
for (const side of ["Near","Far"]) {
  const key=side.toLowerCase();
  legParts.push({
    name:side+" trouser leg",pigment:"linen",leg:true,point:trouser(key),
    project:(x,y,z)=>[x,y,z],
    color(u,t,[x,y,z]){
      const pigment=paints.linen(x+.55*z,y-.30*z);
      const lift=trouserGather(u,t);
      return pigment.map(c=>clamp(c*(.96+.061*lift),0,255));
    },
  });
  for (const sole of [false,true]) {
    const point=bootSurface(key,sole);
    const pigment = sole ? "rubber" : "boot";
    legParts.push({
      foot:true,
      name: side + (sole ? " boot outsole" : " pressure boot"), pigment, point,
      project: (x,y,z) => [x,y,z],
      color(u,t,[x,y,z],read) {
        if (!sole) return undercoat({pigment},u,t,Math.sin(u*2*Math.PI),0,x,y,z);
        // Sample the rubber interior. Its broken, diagonal scuffs stay distinct
        // from the ink line drawn by the welt geometry at the edge.
        const r=.74*Math.cos(t*Math.PI/2),a=u*2*Math.PI;
        const [cx,cy,tx,ty,wx,wy]=side==="Near"?[535,1066,48,-48,27,25]:[635,1079,42,-43,32,25];
        const paint=read(cx+r*(tx*Math.cos(a)+wx*Math.sin(a)),cy+r*(ty*Math.cos(a)+wy*Math.sin(a)));
        const lug = treadHeight(Math.sin(2*Math.PI*u)*Math.cos(t*Math.PI/2),
          (1-Math.cos(2*Math.PI*u)*Math.cos(t*Math.PI/2))/2);
        return paint.map(v=>(17+.80*v)*(.89+.11*lug));
      },
    });
  }
}

const arms=[];
for(const side of ["near","far"]){
  const label=side==="near"?"Near":"Far";
  const project=(x,y,z)=>[x,y,z];
  const palm=cuppedHand(side);
  for(const [name,pigment,point,finger] of [
    [label+" sleeve","linen",sleeve(side)],
    [side==="near"?"Near hand under chin":"Far hand under cheek","skin",palm],
    ...cheekFingers(side,palm).map(({name,point})=>[label+" "+name+" finger","skin",point,true]),
  ]){
    arms.push({name,pigment,point,project,finger,segments:finger?[24,22]:undefined,color:(u,t,[x,y,z])=>{
      const a=(u-.5)*Math.PI*2;
      const sample=paints[pigment](x+.55*z,y-.30*z);
      const light=.94+.09*Math.cos(a)*Math.sin(t*Math.PI)+.07*Math.cos(t*Math.PI);
      return sample.map(v=>clamp(v*light,0,255));
    }});
  }
}
// The seal follows the dipping front edge of the dome. It is visible from
// above in orbit and carries its own paint around the back of the neck.
const neckSeal={
  name:"Rolled pressure seal",pigment:"collar",segments:[112,20],
  project:(x,y,z)=>[x,y,z],
  point(u,t){
    const a=u*Math.PI*2,b=t*Math.PI*2,front=Math.cos(a),side=Math.sin(a);
    const thickness=6.8+1.3*Math.sin(3*a+.4);
    const bead=thickness*Math.cos(b);
    return [433+(141+bead)*side,798+6*side+25*front+thickness*Math.sin(b),1+(123+bead)*front];
  },
  color(u,t,[x,y,z]){
    const cloth=paints.linen(x+.55*z,y-.3*z);
    const channel=.34+.61*smooth(-.7,.55,-Math.sin(t*2*Math.PI));
    return cloth.map(v=>v*channel);
  },
};
const tileW = 512,
  tileH = 448,
  columns = 4,
  atlasW = tileW * columns,
  regularParts = [...parts,neckSeal,...arms,...legParts,...facialParts.slice(1)],
  headTop = tileH * Math.ceil(regularParts.length / columns),
  headHeight = tileH * 2,
  atlasH = headTop + headHeight;
const atlas = Buffer.alloc(atlasW * atlasH * 3);
const paints = {
  linen:pigmentSampler("linen"), boot:pigmentSampler("linen"),
  collar:pigmentSampler("metal"), pack:pigmentSampler("metal"),
  rubber:pigmentSampler("graphite"), skin:pigmentSampler("skin"),
};
function pixel(x, y) {
  const index =
    (clamp(Math.round(y - originY), 0, depthHeight - 1) * depthWidth +
      clamp(Math.round(x - originX), 0, depthWidth - 1)) *
    3;
  return [source.data[index], source.data[index + 1], source.data[index + 2]];
}
function undercoat(part, u, t, nx, nz, x, y, z) {
  const brush = paints[part.pigment](x+.55*z,y-.30*z);
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
  return brush.map(channel=>clamp(channel*light,0,255));
}
// Cloth gathers change the silhouette as well as the painted surface.
function clothPoint(part, row, u, t) {
  const p = sample(row, u);
  const a = (u - .5) * 2 * Math.PI;
  if (part.pigment==="pack" && Math.cos(a)<0) {
    const [,left,right,back,front]=row;
    const side=Math.sin(a),rear=-Math.cos(a);
    p[0]=(left+right)/2+(right-left)/2*Math.sign(side)*Math.abs(side)**.66;
    p[2]=(front+back)/2-(front-back)/2*rear**.66;
    return p;
  }
  if (!["linen", "boot"].includes(part.pigment)) return p;
  let offset = 0;
  for (const band of [.19, .27, .66, .76]) {
    const delta = t - band - .028 * Math.sin(a + .6) - .014 * Math.cos(a * 2);
    offset += 4.8 * Math.exp(-((delta / .022) ** 2))
      - 2.1 * Math.exp(-(((delta + .028) / .014) ** 2));
  }
  p[0] += offset * Math.sin(a);
  p[2] += offset * Math.cos(a);
  if(part.name==="Pressure suit and seated hips"){
    const floor=1036+.024/(size*Math.cos(elevation))+Math.tan(elevation)*p[2];
    p[1]=Math.min(p[1],floor);
  }
  return p;
}
function geometry(part, uvAt) {
  const [ring,levels]=part.segments??(part.point?[96,64]:[64,80]);
  const vertices = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= levels; i++) {
    const t = i / levels,
      row = part.point ? null : station(part, t);
    for (let j = 0; j <= ring; j++) {
      const u = j / ring,
        p = world(...(part.point ? (part.project ?? faceToPainting)(...part.point(u,t)) : clothPoint(part,row,u,t)));
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
const painted = new T.MeshStandardMaterial({roughness:1,metalness:0});
painted.name = "Original pigments";
const faceInk = new T.MeshBasicMaterial({color:0x302b1c});
faceInk.name = "Olive ink";
const suitInk=new T.MeshBasicMaterial({color:0x29201d});
suitInk.name="Suit silhouette ink";
function inkContour(mesh,part){
  // Reverse the winding of a thin hull so only its outer ink contour shows.
  const shell=mesh.geometry.clone();
  shell.deleteAttribute("uv");shell.deleteAttribute("normal");
  const hull=mergeVertices(shell);hull.computeVertexNormals();
  const position = hull.attributes.position, normal = hull.attributes.normal;
  for (let i=0; i<position.count; i++) {
    const x=position.getX(i), y=position.getY(i), z=position.getZ(i);
    const drag=Math.sin(41*x+83*y-23*z)*Math.cos(67*z-28*x);
    const nx=normal.getX(i),ny=normal.getY(i),nz=normal.getZ(i);
    let inkLoad=1;
    if(Math.abs(nz)<.55){
      const px=436+x/size,py=1036-y/size;
      let dark=0;
      for(const distance of [-4,-1,2,5]){
        const [r,g,b]=pixel(px+distance*nx,py-distance*ny);
        dark=Math.max(dark,1-smooth(66,144,.30*r+.56*g+.14*b));
      }
      inkLoad=mix(1,.29+1.25*dark,1-smooth(.17,.55,Math.abs(nz)));
    }
    const nib=part.finger ? .40 : facialParts.includes(part) ? .52 : part.point ? 1 : .76;
    const width=size*inkLoad*nib*(3.55+1.90*drag+1.25*Math.sin(117*x+53*y));
    position.setXYZ(i,x+width*normal.getX(i),y+width*normal.getY(i),z+width*normal.getZ(i));
  }
  const triangles=hull.index.array;
  for(let i=0; i<triangles.length; i+=3) [triangles[i],triangles[i+1]]=[triangles[i+1],triangles[i]];
  hull.computeVertexNormals();
  const contour=new T.Mesh(hull, facialParts.includes(part)||part.pigment==="skin"?faceInk:suitInk);
  contour.userData.inkHull=true;
  contour.name=part.name+" ink contour";
  return contour;
}
const bakePigments=[];
const riggedParts=new Map();
// Give the head a full-width band so single bristles survive texture filtering.
for (const [index, part] of [...regularParts,facialParts[0]].entries()) {
  const head = part === facialParts[0],
    width = head ? atlasW : tileW, height = head ? headHeight : tileH,
    left = head ? 0 : (index % columns) * tileW,
    top = head ? headTop : Math.floor(index / columns) * tileH,
    pad = 3;
  const mesh = new T.Mesh(
    geometry(part, (u, t) => {
      // A flat ink chart avoids the UV pole at the centre of each pupil.
      if(part.inkPatch){
        const {x,y,size,at}=part.inkPatch,[px,py]=at(u,t);
        u=(px-x)/size;t=(py-y)/size;
      }
      return [(left+pad+u*(width-2*pad))/atlasW,(top+pad+t*(height-2*pad))/atlasH];
    }),
    painted,
  );
  if(!part.surfaceDetail){
    const hull=inkContour(mesh,part);art.add(hull);riggedParts.set(hull,part);
  }
  if(part.blink){
    const targets=[],normals=[];
    for(let n=1;n<=5;n++){
      const closed=geometry({...part,point:(u,t)=>part.blink(u,t,n/5)},()=>[0,0]);
      targets.push(closed.getAttribute("position"));normals.push(closed.getAttribute("normal"));closed.dispose();
    }
    mesh.geometry.morphAttributes.position=targets;
    mesh.geometry.morphAttributes.normal=normals;
    mesh.updateMorphTargets();
    mesh.userData.blinkSide=part.side;
  }
  riggedParts.set(mesh,part);
  mesh.name=part.name;
  art.add(mesh);
  bakePigments.push((coverage)=>{
    for (let j = 0; j < height; j++) {
      const t = clamp((j + 0.5 - pad) / (height - 2 * pad), 0, 1);
      const row = part.point ? null : station(part, t);
      for (let i = 0; i < width; i++) {
        const u = clamp((i + 0.5 - pad) / (width - 2 * pad), 0, 1),
          a = (u - 0.5) * 2 * Math.PI;
        const dest = ((top + j) * atlasW + left + i) * 3;
        if(part.inkPatch){
          const {x,y,size}=part.inkPatch;
          atlas.set(pixel(x+u*size,y+t*size),dest);
          continue;
        }
        const p=part.point?part.point(u,t):clothPoint(part,row,u,t);
        let color=part.color?part.color(u,t,p,pixel):undercoat(part,u,t,Math.sin(a),Math.cos(a),...p);
        if(part.pigment==="linen" || part.pigment==="boot")color=suitPaint(u,t,color);
        // Transfer pigment once onto visible interiors in the finished sculpt.
        // Eyelids unfold when blinking and carry their own closed-pose paint.
        if(!part.blink){
          const q=part.point?(part.project??faceToPainting)(...p):p;
          let weight=coverage(mesh,q);
          if(weight&&!visorBand[(Math.round(q[1])-originY)*depthWidth+Math.round(q[0])-originX]){
            const observed=pixel(q[0],q[1]);
            if(head || part.pigment==="skin" || facialParts.includes(part)){
              // Gates follow the sculpted features. A pupil or a lip cannot
              // leave a second dark mark on a cheek when the head turns.
              const [r,g,b]=observed,[cr,cg,cb]=color;
              if(Math.max(...color)<130)weight*=1-smooth(65,132,Math.max(...observed));
              else if(cg-cb>34 && cr-cg<10)weight*=smooth(15,49,g-b)*(1-smooth(5,25,r-g));
              else weight*=smooth(124,193,Math.min(r,g))*(1-smooth(10,40,g-r));
            }
            for(let c=0;c<3;c++)color[c]=mix(color[c],observed[c],weight);
          }
        }
        atlas.set(color,dest);
      }
    }
  });
}

// Only chromatic reflection and pale bristles belong to the glass UV map.
const glassW=768, glassH=384, reflection=Buffer.alloc(glassW*glassH*4);
const glass=new T.MeshBasicMaterial({side:T.DoubleSide,transparent:true,depthWrite:false});
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
for (const cuff of parts.filter(part => part.name.endsWith("wrist lining"))) {
  for (const [t,r,mat] of [[.19,1.8,graphite],[.27,2.8,ivory]]) {
    const profile=station(cuff,t);
    const edge=Array.from({length:48},(_,i)=>{
      const p=sample(profile,i/48);
      p[1]+=2.2*Math.sin(i/48*2*Math.PI+.4);
      return p;
    });
    pipe(cuff.name+" rolled edge "+t,edge,r,mat,true);
  }
}
for (const [side, x] of [
  ["port", 269],
  ["starboard", 427],
]) {
  box(side + " shoulder webbing", [x, 861, -128], [22, 141, 20], 7, graphite);
  const anchor=x<337?284:394;
  const hose=[[anchor,798,-196],[anchor,784,-183],[x+5,780,-140],[x+14,805,-81]];
  pipe(side+" corrugated supply hose",hose,9,ivory);
  const path=new T.CatmullRomCurve3(hose.map(p=>world(...p)));
  for(let rib=1;rib<11;rib++){
    const t=rib/11;
    const ring=new T.Mesh(new T.TorusGeometry(9*size,1.4*size,6,20),graphite);
    ring.name=side+" hose rib "+rib;
    ring.position.copy(path.getPointAt(t));
    ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),path.getTangentAt(t));
    art.add(ring);
  }
}
const packFittings = new T.Group();
packFittings.name = "Rear service assembly";
packFittings.position.copy(world(337, 865, -170));
art.add(packFittings);
const start = art.children.length;
// The sheet shows a broad enamel lid with an orange rolled edge, three
// recessed vents and two side latches. Round its footprint independently
// of its thickness so the corners remain round in profile.
function servicePlate(name,width,height,depth,radius,z,material){
  const shape=new T.Shape(),w=width*size/2,h=height*size/2,r=radius*size;
  shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);
  shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);
  shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
  const g=new T.ExtrudeGeometry(shape,{depth:depth*size,bevelSize:2.4*size,bevelThickness:2.4*size,bevelSegments:3});
  const p=g.attributes.position,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,clamp(.5-p.getX(i)/(2*w),0,1),clamp(.5-p.getY(i)/(2*h),0,1));
  return place(name,g,material,337,864,z);
}
const lidEnamel=metal("Painted service enamel",0xfffaf0,.95);
servicePlate("Backpack rear gasket",194,185,26,33,-190,graphite);
servicePlate("Orange rolled bead",186,178,11,30,-198,bronze);
servicePlate("Life support service cover",176,168,10,28,-203,lidEnamel);
for(let j=0;j<3;j++){
  const y=841+j*18;
  box("Vent pressed lip "+j,[337,y+1,-205],[85,13,5],5,nickel);
  box("Vent throat "+j,[337,y,-208],[78,7,5],3,graphite);
}
for(const x of [253,421]){
  box("Latch socket",[x,863,-201],[19,40,14],5,graphite);
  box("Cover latch",[x,862,-209],[14,32,7],4,nickel);
  box("Thumb catch",[x,858,-214],[6,12,4],2,ivory);
}
for (const fitting of art.children.slice(start)) {
  fitting.position.sub(packFittings.position);
  packFittings.add(fitting);
}
packFittings.rotation.y = 0.10;
for (const [side, x, z] of [
  ["near", 242, -145],
  ["far", 437, -146],
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
  for (const y of [846, 898]) {
    hoop(side + " tank strap", [x, y, z], 23, 23, 3, bronze);
    box(side+" strap keeper "+y,[x,y,z-22],[12,9,6],2,graphite);
  }
  const valve=place(side+" valve",new T.CylinderGeometry(7*size,8*size,12*size,8),bronze,x,804,z);
  valve.rotation.z=.04;
  pipe(side+" return line",[[x,800,z],[x,790,z-6],[x+(side==="near"?18:-18),785,z-13],[337+(x-337)*.55,801,-173]],3.6,graphite);
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

  if (!part.geometry.index) part.geometry = mergeVertices(part.geometry);
});
const exportScene = new T.Scene();
exportScene.add(art);
// Exclude the painted visor perimeter even where it crossed a solid object
// in the original. Include the short flat arcs at the poles of the dome.
const visorBand=new Uint8Array(depthWidth*depthHeight);
function maskRim(cx,cy){
  for(let dy=-13;dy<=13;dy++)for(let dx=-13;dx<=13;dx++){
    if(dx*dx+dy*dy<=169)visorBand[(Math.round(cy)-originY+dy)*depthWidth+Math.round(cx)-originX+dx]=1;
  }
}
for(let j=0;j<=600;j++){
  const [y,left,right]=station(visor,j/600);
  maskRim(left,y);maskRim(right,y);
  if(j===0||j===600)for(let x=left;x<=right;x++)maskRim(x,y);
}
for(let j=0;j<glassH;j++){
  const row=station(visor,(j+.5)/glassH);
  for(let i=0;i<glassW;i++){
    const u=(i+.5)/glassW,[x,y]=sample(row,u);
    if(visorBand[(Math.round(y)-originY)*depthWidth+Math.round(x)-originX] || y<480 || y>784 || x>474-.73*(y-510))continue;
    const color=pixel(x,y),left=pixel(x-4,y+2),right=pixel(x+4,y-2);
    const blue=smooth(6,27,color[2]-color[0])*smooth(32,75,color[2]);
    const chalk=smooth(10,32,Math.max(left[2]-left[0],right[2]-right[0]))*smooth(170,218,Math.min(...color));
    const back=smooth(-.06,.30,-Math.cos((u-.5)*2*Math.PI));
    const upperBack=1-smooth(515,626,y);
    const alpha=Math.max(blue,.67*chalk)*mix(.98,.15+.68*upperBack,back);
    const k=4*(j*glassW+i);
    reflection.set(color,k);reflection[k+3]=Math.round(255*alpha);
  }
}
const coverage=referenceCoverage(art,{width:depthWidth,height:depthHeight,originX,originY,size});
for(const bake of bakePigments)bake(coverage);
const rig=createRig(art,world);
for(const [mesh,part] of riggedParts)rig.bind(mesh,part);
// Helmet fittings and pack hardware follow their rigid assemblies.
for(const child of [...art.children]){
  if(child.isBone||child.isSkinnedMesh)continue;
  const side=child.name.startsWith("Near")?"near":"far";
  const anchor=child===bubble?"head":child.name.includes("wrist lining")?side+"Wrist":"chest";
  rig.bones[anchor].attach(child);
}
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
  return index;
}
const paintMap=await embed(painted, atlas, atlasW, atlasH, 3);
// The painting already contains the lunar lighting. Retain a small diffuse
// response for the volume and use the same pigment for the painted light.
const paintedSurface=doc.materials.find(m=>m.name===painted.name);
paintedSurface.pbrMetallicRoughness.baseColorFactor=[.24,.24,.24,1];
paintedSurface.emissiveTexture={index:paintMap};
paintedSurface.emissiveFactor=[.76,.76,.76];
await embed(glass, reflection, glassW, glassH, 4);
// The fittings share one tile of neutral scuffed enamel under their individual colors.
const enamelSize=128, enamel=Buffer.alloc(enamelSize*enamelSize*3);
for(let j=0;j<enamelSize;j++)for(let i=0;i<enamelSize;i++){
  const [r,g,b]=paints.pack(i,j);
  const value=Math.round(102+.59*(.26*r+.57*g+.17*b));
  enamel.fill(value,(j*enamelSize+i)*3,(j*enamelSize+i+1)*3);
}
const enamelTexture=await embed(ivory,enamel,enamelSize,enamelSize,3);
for (const material of [graphite,nickel,bronze]) {
  doc.materials.find(m=>m.name===material.name).pbrMetallicRoughness.baseColorTexture={index:enamelTexture};
}
await embed(lidEnamel,serviceEnamel(192),192,192,3);
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

import * as T from "three";
import {readReferencePaints} from "./reference-paints";
import { loadAstronaut } from "./frog";
import { inkStars } from "./lunar-marks.mjs";
import { horizonY } from "./lunar-horizon.mjs";

import {elevation,paintingPoint,paintingScale as scale,paintingPose as pose} from "./painting-frame.mjs";
export {elevation,paintingPoint};

const terrainCentreZ = .65;
const lunarRadius=6.8;
const ridgeZ=-2.48, ridgeWidth=.74;
const ridgeWeight=(x:number)=>T.MathUtils.smoothstep(x,-2.30,-1.72)*(1-T.MathUtils.smoothstep(x,3.05,3.63));
const ridgeTop=(x:number,z:number)=>((1036-horizonY(436+x/scale))*scale+z*Math.sin(elevation))/Math.cos(elevation);
const craters = [
  {x:2.85,z:.05,r:.68}, {x:3.62,z:-.38,r:.29}, {x:-2.25,z:.6,r:.48},
  {x:-3.8,z:-1.35,r:.84}, {x:.65,z:2.95,r:.40}, {x:4.15,z:2.8,r:.56},
];
function craterRelief(x:number,z:number) {
  let height=0;
  for(const c of craters){
    const dx=(x-c.x)/c.r,dz=(z-c.z)/c.r;
    const radial=dx*dx+dz*dz;
    if(radial>1.9)continue;
    const r=Math.sqrt(radial);
    height+=c.r*(-.27*Math.max(0,1-radial)**2+.095*Math.exp(-(((r-.97)/.14)**2)));
  }
  return height;
}
function surface(x: number, z: number, ny: number) {
  const rim = .056 * Math.sin(x * 5 + z * 2.4) * Math.cos(z * 6)
    + .022 * Math.sin(x * 12 - z * 16);
  const away = T.MathUtils.smoothstep(Math.hypot(x, z), 1, 2.1);
  const slope = lunarRadius*(ny-1)-.03-.12*x*Math.max(ny,0)**2+rim*away;
  if (ny < 0) return slope;
  // A shallow shelf supports the seated hips and both boot soles.
  const distance = Math.hypot(x / 1.16, (z - .15) / 1.30);
  const soil=T.MathUtils.lerp(-.024, slope, T.MathUtils.smoothstep(distance,.78,1.48))+craterRelief(x,z);
  if(z>-.80 || x< -2.30 || x>3.63)return soil;
  const cap=ridgeTop(x,z)-.085;
  return T.MathUtils.lerp(soil,Math.min(soil,cap),ridgeWeight(x)*(1-T.MathUtils.smoothstep(z,-1.45,-.80)));
}
export function groundHeight(x: number, z: number) {
  const r = 1 - (x / lunarRadius) ** 2 - ((z - terrainCentreZ) / lunarRadius) ** 2;
  if(r<0)return -4;
  const soil=surface(x,z,Math.sqrt(r));
  const falloff=1-T.MathUtils.smoothstep(Math.abs(z-ridgeZ),0,ridgeWidth);
  return falloff>0?T.MathUtils.lerp(soil,ridgeTop(x,z),falloff*ridgeWeight(x)):soil;
}
// Ambient light is occluded most strongly where the pack, seat, and boot
// soles touch the soil. The direct solar shadow is still cast by their meshes.
function contactMap() {
  const paper = document.createElement("canvas");
  paper.width = paper.height = 192;
  const ink = paper.getContext("2d")!;
  ink.fillStyle = "white";
  ink.fillRect(0, 0, 192, 192);
  const contacts = [
    [-.52,-.45,.35,.43,-.1,.55], [-.12,-.17,.58,.53,-.2,.70],
    [.30,.67,.20,.38,-.35,.76], [.71,.69,.20,.34,-.30,.68],
  ];
  for (const [x,z,rx,rz,yaw,density] of contacts) {
    ink.save();
    ink.translate((x+2)*48,(z+2)*48);
    ink.rotate(yaw);
    ink.scale(rx*65,rz*65);
    const shade = ink.createRadialGradient(0,0,0,0,0,1);
    shade.addColorStop(0,`rgba(0,0,0,${density})`);
    shade.addColorStop(.5,`rgba(0,0,0,${density*.7})`);
    shade.addColorStop(1,"transparent");
    ink.fillStyle=shade;ink.fillRect(-1,-1,2,2);ink.restore();
  }
  const map = new T.CanvasTexture(paper);
  map.channel = 1;
  return map;
}
// The portrait projects soil onto the landing site from one direction.
// From the side, use the painting's grain in ground coordinates to keep its
// texels at the same physical size across the shelf and the ridge.
function paintGround(material:T.MeshBasicMaterial|T.MeshLambertMaterial, grain:T.CanvasTexture, globe?:T.Texture) {
  material.onBeforeCompile=shader=>{
    shader.uniforms.groundGrain={value:grain};
    shader.uniforms.paintAxis={value:paintingPoint(436,1036,1)};
    if(globe)shader.uniforms.orbitalMap={value:globe};
    const varyings="varying vec2 soilUV; varying float grainWeight;"+
      (globe?"varying vec2 globeUV; varying float landingCoverage;":"");
    shader.vertexShader=shader.vertexShader.replace("#include <common>",
      "#include <common>\nuniform vec3 paintAxis; "+varyings+
      (globe?"attribute vec2 lunarUV; attribute float localCoverage;":""))
      .replace("#include <uv_vertex>",`#include <uv_vertex>
        soilUV=position.xz/${grain.image.width*scale};
        grainWeight=1.0-smoothstep(.08,.34,abs(dot(normalize(normal),paintAxis)));
        ${globe?"globeUV=lunarUV;landingCoverage=localCoverage;":""}`);
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>",
      "#include <common>\nuniform sampler2D groundGrain; "+varyings+
      (globe?"uniform sampler2D orbitalMap;":""))
      .replace("#include <map_fragment>",`
        vec4 soil=texture2D(map,vMapUv);
        soil=mix(soil,texture2D(groundGrain,soilUV),grainWeight*.93);
        diffuseColor*=${globe?"mix(texture2D(orbitalMap,globeUV),soil,landingCoverage)":"soil"};`);
  };
}
function terrain(map:T.Texture, orbitalMap:T.Texture, grain:T.CanvasTexture) {
  const geo = new T.SphereGeometry(1, 192, 112);
  const p = geo.attributes.position, uv = geo.attributes.uv;
  geo.setAttribute("lunarUV",uv.clone());
  const coverage=new Float32Array(p.count);
  const mineralColors = new Float32Array(p.count * 3);
  const contactUV = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const nx=p.getX(i),ny=p.getY(i),nz=p.getZ(i);
    const x=lunarRadius*nx,z=lunarRadius*nz+terrainCentreZ;
    const y = surface(x,z,p.getY(i));
    p.setXYZ(i,x,y,z);
    const relief=craterRelief(x,z),tone=T.MathUtils.clamp(1+1.9*relief,.66,1.12);
    coverage[i]=T.MathUtils.smoothstep(ny,.58,.84);
    mineralColors.set([tone,tone,tone*(1-.15*relief)],3*i);
    contactUV[2*i]=(x+2)/4;
    contactUV[2*i+1]=1-(z+2)/4;
    const px = 436 + x / scale;
    const py = 1036 - (y * Math.cos(elevation) - z * Math.sin(elevation)) / scale;
    uv.setXY(i,(px+650)/2400,1-(py-400)/1150);
  }
  geo.setAttribute("color",new T.BufferAttribute(mineralColors,3));
  geo.setAttribute("uv1",new T.BufferAttribute(contactUV,2));
  geo.computeVertexNormals();
  geo.setAttribute("localCoverage",new T.BufferAttribute(coverage,1));
  const material=new T.MeshLambertMaterial({map,aoMap:contactMap(),vertexColors:true});
  paintGround(material,grain,orbitalMap);
  const floor = new T.Mesh(geo,material);
  floor.userData.lunarGround=true;
  floor.receiveShadow = true;
  return floor;
}

export async function createLunarScene() {
  const loader = new T.TextureLoader();
  async function texture(name: string) {
    const map = await loader.loadAsync("/assets/models/lunar/"+name+".webp");
    map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }
  const [frog,earthMap,moonMap,soil,paper,starMap,orbitalSoil,sheet] = await Promise.all([
    loadAstronaut(),texture("earth"),texture("moon"),texture("regolith"),texture("paper"),texture("stars"),texture("lunar-surface"),texture("pigments"),
  ]);
  const paints=readReferencePaints(sheet);
  const scene = new T.Scene();
  const panel = new T.Group();
  panel.rotation.copy(pose);
  frog.userData.astronaut=true;scene.add(panel,frog);
  function globe(map: T.Texture,x: number,y: number,z: number,r: number) {
    const solid = new T.Mesh(new T.SphereGeometry(r*scale,96,64),new T.MeshBasicMaterial({map}));
    solid.position.set((x-436)*scale,(1036-y)*scale,z);
    panel.add(solid);
    return solid;
  }
  const earth = globe(earthMap,1147,-6,-7.5,611);
  const moon = globe(moonMap,250,289,-4.6,84);
  paper.wrapS = paper.wrapT = T.MirroredRepeatWrapping;
  const sky=new T.SphereGeometry(48,96,64);
  const skyPoints=sky.attributes.position, skyUV=sky.attributes.uv;
  for(let i=0;i<skyPoints.count;i++){
    const x=436+skyPoints.getX(i)/scale;
    const y=1036-(skyPoints.getY(i)*Math.cos(elevation)-skyPoints.getZ(i)*Math.sin(elevation))/scale;
    skyUV.setXY(i,x/1254,1-y/1254);
  }
  const paperSky=new T.Mesh(sky,new T.MeshBasicMaterial({map:paper,side:T.BackSide}));
  paperSky.userData.paperSky=true;scene.add(paperSky);
  soil.wrapS = soil.wrapT = T.MirroredRepeatWrapping;
  scene.add(terrain(soil,orbitalSoil,paints.soil));
  const lunarCentre=new T.Object3D();
  lunarCentre.position.set(0,-lunarRadius,terrainCentreZ);scene.add(lunarCentre);
  // A narrow ridge carries the irregular silhouette and the paint on both slopes.
  const ridge=new T.PlaneGeometry(1,1,420,16);
  const rp=ridge.attributes.position,ru=ridge.attributes.uv;
  for(let i=0;i<rp.count;i++){
    const x=T.MathUtils.lerp(-2.30,3.63,ru.getX(i)),z=ridgeZ+(1-2*ru.getY(i))*ridgeWidth;
    const y=groundHeight(x,z)-.003;
    rp.setXYZ(i,x,y,z);
    const px=436+x/scale,py=1036-(y*Math.cos(elevation)-z*Math.sin(elevation))/scale;
    ru.setXY(i,(px+650)/2400,1-(py-400)/1150);
  }
  ridge.computeVertexNormals();
  const ridgePaint=new T.MeshBasicMaterial({map:soil});
  paintGround(ridgePaint,paints.soil);
  const ridgeMesh=new T.Mesh(ridge,ridgePaint);
  ridgeMesh.userData.lunarGround=true;
  scene.add(ridgeMesh);

  let state=24951;
  const rand=()=> (state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296;
  const marker = new T.Object3D();
  const basalt = new T.MeshLambertMaterial({
    flatShading:true,vertexColors:true,
    map:paints.soil,
  });
  for(let type=0;type<3;type++){
    const geo=new T.IcosahedronGeometry(1,1);
    const p=geo.attributes.position,colors=[];
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      const fracture=1+.19*Math.sin(5*x+type*3)*Math.cos(4*z+2*y);
      p.setXYZ(i,x*fracture+.17*y,Math.min(y,.56+type*.10)*fracture,z*fracture);
      const vein=.84+.14*Math.sin(9*y+4*x+type)+.14*y;
      colors.push(vein,vein*.98,vein*.96);
    }
    geo.computeVertexNormals();geo.setAttribute("color",new T.Float32BufferAttribute(colors,3));
    const rocks=new T.InstancedMesh(geo,basalt,64);
    for(let i=0;i<rocks.count;i++){
      const angle=rand()*Math.PI*2,distance=Math.sqrt(rand())*.97;
      const x=(lunarRadius-.1)*distance*Math.sin(angle),z=terrainCentreZ+(lunarRadius-.1)*distance*Math.cos(angle);
      const radius=.018+rand()**4*.15;
      // The original soil already carries its foreground stones in paint.
      const r=radius*T.MathUtils.lerp(.1,1,T.MathUtils.smoothstep(Math.abs(x-.40),1.9,3.2));
      marker.position.set(x,groundHeight(x,z)+r*.10,z);
      marker.rotation.set(rand()*.5,rand()*6,rand()*.5);
      marker.scale.set(r*(1+rand()),r*.74,r);
      marker.updateMatrix();rocks.setMatrixAt(i,marker.matrix);
      rocks.setColorAt(i,new T.Color().setScalar(.39+.59*rand()));
    }
    rocks.castShadow=rocks.receiveShadow=true;scene.add(rocks);
  }
  const starShape = new T.Shape();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4, r=i%2?.10:1;
    const x=r*Math.cos(a),y=r*Math.sin(a);
    if(!i) starShape.moveTo(x,y); else starShape.lineTo(x,y);
  }
  starShape.closePath();
  const stars = new T.InstancedMesh(new T.ExtrudeGeometry(starShape,{depth:.05,bevelEnabled:false}),
    new T.MeshBasicMaterial({map:paints.graphite,side:T.DoubleSide}),166);
  const originalInk=new T.MeshBasicMaterial({map:starMap,transparent:true,depthWrite:false});
  for(const [index,[x,y,r]] of inkStars.entries()){
    const geo=new T.SphereGeometry(1,24,16);
    const p=geo.attributes.position,uv=geo.attributes.uv;
    for(let i=0;i<p.count;i++)uv.setXY(i,(index+.5+.499*p.getX(i))/inkStars.length,.5+.499*p.getY(i));
    const stroke=new T.Mesh(geo,originalInk);
    stroke.position.copy(paintingPoint(x,y,-12-index*.3));stroke.rotation.copy(pose);
    stroke.scale.set(r*scale,r*scale,r*scale*.12);scene.add(stroke);
  }
  for(let i=0;i<stars.count;i++){
    const a=rand()*2*Math.PI, b=rand()*1.45-.30, distance=14+rand()*11;
    marker.position.set(Math.sin(a)*Math.cos(b)*distance,Math.sin(b)*distance,Math.cos(a)*Math.cos(b)*distance);
    marker.lookAt(0,0,0); const r=.022+rand()**4*.09;
    marker.rotateZ((rand()-.5)*.42);
    marker.scale.set(r,r*(1.05+rand()*.3),r); marker.updateMatrix(); stars.setMatrixAt(i,marker.matrix);
  }
  scene.add(stars);
  scene.add(new T.AmbientLight(0xfff9ee,2.28));
  const sun=new T.DirectionalLight(0xfff1df,1.45);
  sun.position.set(-4,7,4);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5});
  sun.shadow.normalBias=.009;scene.add(sun);
  scene.updateMatrixWorld(true);
  return {scene,frog,moon,earth,lunarCentre,paints};
}

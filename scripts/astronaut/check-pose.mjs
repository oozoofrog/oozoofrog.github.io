// Run after build.mjs. Read the delivered GLB, including its bone hierarchy
// and sole vertices. Tolerances below describe this seated illustration.
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Vector3,MathUtils} from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

const bytes=await readFile(process.argv[2]??"public/assets/models/astronaut-frog.glb");
const length=bytes.readUInt32LE(12);
const gltf=JSON.parse(bytes.toString("utf8",20,20+length));
// Geometry inspection needs no browser image decoder.
gltf.buffers[0].uri="data:application/octet-stream;base64,"+bytes.subarray(28+length).toString("base64");
gltf.materials=gltf.materials.map(({name})=>({name}));
delete gltf.images;delete gltf.textures;
globalThis.self=globalThis;
globalThis.ProgressEvent??=class {constructor(type,init){this.type=type;Object.assign(this,init);}};
const {scene}=await new GLTFLoader().parseAsync(JSON.stringify(gltf),"");
scene.updateMatrixWorld(true);
const degrees=MathUtils.radToDeg;
const distance=(a,b)=>a.distanceTo(b);
function measure(side) {
  const bone=name=>scene.getObjectByName(side+name).getWorldPosition(new Vector3());
  const [hip,knee,ankle,ball,shoulder,elbow,wrist]=["Hip","Knee","Ankle","Ball","Shoulder","Elbow","Wrist"].map(bone);
  const name=side[0].toUpperCase()+side.slice(1)+"_boot_outsole";
  const sole=scene.getObjectByName(name);
  assert(sole?.isMesh && sole.parent===scene.getObjectByName(side+"Ankle"),name+" must follow its ankle");
  const uv=sole.geometry.attributes.uv;
  let left=Infinity,right=-Infinity,edge=Infinity;
  for(let i=0;i<uv.count;i++){left=Math.min(left,uv.getX(i));right=Math.max(right,uv.getX(i));edge=Math.min(edge,uv.getY(i));}
  // The first ring of the outsole chart follows its welt from toe to heel.
  function rim(fraction) {
    let nearest=Infinity,index=-1;
    for(let i=0;i<uv.count;i++)if(uv.getY(i)===edge){
      const delta=Math.abs(uv.getX(i)-(left+fraction*(right-left)));
      if(delta<nearest){nearest=delta;index=i;}
    }
    return sole.localToWorld(sole.getVertexPosition(index,new Vector3()));
  }
  const heel=rim(.5),toe=rim(0),inner=rim(.25),outer=rim(.75);
  const width=inner.distanceTo(outer),mid=inner.clone().lerp(outer,.5);
  const across=inner.clone().sub(outer).normalize();
  const forward=mid.clone().sub(heel).projectOnPlane(across).normalize();
  const normal=forward.clone().cross(across).normalize();
  const thigh=knee.clone().sub(hip).normalize(),shank=ankle.clone().sub(knee).normalize();
  if(normal.dot(shank)<0)normal.negate();
  const neutral=thigh.clone().projectOnPlane(shank).normalize();
  const kneeAxis=neutral.clone().cross(shank).normalize();
  const fromHeel=ball.clone().sub(heel);
  return {
    kneeFlex:degrees(thigh.angleTo(shank)),
    elbowFlex:degrees(elbow.clone().sub(shoulder).angleTo(wrist.clone().sub(elbow))),
    plantarFlex:degrees(Math.atan2(-normal.dot(neutral),normal.dot(shank))),
    headingInKneeFrame:degrees(Math.atan2(forward.dot(kneeAxis),forward.dot(neutral))),
    lateralTilt:degrees(Math.asin(MathUtils.clamp(normal.dot(kneeAxis),-1,1))),
    ankleOffsetInHalfWidths:ankle.clone().sub(mid).dot(across)/(width/2),
    ballFraction:fromHeel.dot(forward)/toe.clone().sub(heel).dot(forward),
    ballOffsetInHalfWidths:fromHeel.dot(across)/(width/2),
    upperArm:distance(shoulder,elbow),forearm:distance(elbow,wrist),
    thigh:distance(hip,knee),shank:distance(knee,ankle),
  };
}
const near=measure("near"),far=measure("far");
for(const [side,metrics] of Object.entries({near,far})){
  console.log(side,Object.fromEntries(Object.entries(metrics).map(([k,v])=>[k,+v.toFixed(3)])));
}
for(const metrics of [near,far]){
  assert(metrics.plantarFlex>=0 && metrics.plantarFlex<15,"relaxed plantar flexion");
  assert(Math.abs(metrics.headingInKneeFrame)<10,"forefoot points along the bent leg");
  assert(Math.abs(metrics.lateralTilt)<6,"lateral tilt relative to the knee plane");
  assert(Math.abs(metrics.ankleOffsetInHalfWidths)<.2,"ankle centered over heel");
  assert(metrics.ballFraction>.65 && metrics.ballFraction<.85 && Math.abs(metrics.ballOffsetInHalfWidths)<.2,"ball within forefoot");
  assert(metrics.kneeFlex>45 && metrics.kneeFlex<70,"seated knee bend");
  assert(metrics.elbowFlex>65 && metrics.elbowFlex<115,"supported elbow bend");
}
for(const segment of ["upperArm","forearm","thigh","shank"]){
  assert(Math.abs(near[segment]/far[segment]-1)<.01,segment+" lengths must agree within one percent");
}

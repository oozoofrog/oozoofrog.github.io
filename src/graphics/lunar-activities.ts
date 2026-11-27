import * as T from "three";
import { treadHeight } from "./boot-tread.mjs";
import type {ReferencePaints} from "./reference-paints";
import { groundHeight, paintingPoint } from "./lunar-scene";
import { createRover } from "./lunar-rover";

// Keep grains of the underlying soil visible through the compressed parts of the print.
function footprintMask() {
  const c=document.createElement("canvas");
  c.width=96;c.height=160;
  const ctx=c.getContext("2d")!;
  const pixels=ctx.createImageData(c.width,c.height);
  let seed=7384;
  for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++){
    const u=(i+.5)/c.width, v=(j+.5)/c.height;
    const relief=treadHeight(2*u-1,v);
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const grain=seed/4294967296;
    const density=grain>.966?.13:.11+relief*(.55+.33*grain);
    const k=(j*c.width+i)*4;
    pixels.data[k]=pixels.data[k+1]=pixels.data[k+2]=Math.round(density*255);
    pixels.data[k+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  return new T.CanvasTexture(c);
}

function cometFilament(index:number) {
  const points=[],colors=[],uv=[],faces=[];
  const a=index*2.4,length=.86+index*.12;
  const tint=new T.Color(index%2?0xd4ae79:0x799aac);
  for(let row=0;row<=22;row++) {
    const t=row/22,radius=.009+.034*Math.sin(Math.PI*t)**.65;
    const bend=.04+.23*t*t;
    for(let side=0;side<=6;side++){
      const phase=side*Math.PI/3;
      const r=radius*(1+.22*Math.cos(phase*2+3*t));
      points.push(Math.sin(a)*bend+.095*t*t+r*Math.cos(phase),
        Math.cos(a)*bend+.04*Math.sin(5*t+a)*t+r*Math.sin(phase),
        -.10-t*length);
      uv.push(side/6,t);
      colors.push(tint.r,tint.g,tint.b,(1-t)**1.45*(.40+.15*Math.sin(phase+a)));
      if(row<22&&side<6){
        const k=row*7+side;
        faces.push(k,k+1,k+7,k+7,k+1,k+8);
      }
    }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute("position",new T.Float32BufferAttribute(points,3));
  geo.setAttribute("uv",new T.Float32BufferAttribute(uv,2));
  geo.setAttribute("color",new T.Float32BufferAttribute(colors,4));geo.setIndex(faces);
  return geo;
}

export function createActivities(paints:ReferencePaints) {
  const group = new T.Group();
  const ink=new T.MeshStandardMaterial({map:paints.graphite,roughness:.92});
  const copper=new T.MeshStandardMaterial({map:paints.ochre,color:0xc99b7d,roughness:.78});
  const panel=document.createElement("canvas");
  panel.width=panel.height=256;
  panel.getContext("2d")!.drawImage(paints.ocean.image,0,0,256,256);
  const cellMap=new T.CanvasTexture(panel);
  cellMap.colorSpace=T.SRGBColorSpace;
  cellMap.anisotropy=paints.ocean.anisotropy;
  const wafer=(cellMap.image as HTMLCanvasElement).getContext("2d")!;
  wafer.fillStyle="#afbbb0";wafer.globalAlpha=.72;
  for(let x=16;x<256;x+=23)wafer.fillRect(x,0,2,256);
  wafer.fillStyle="#d8c8aa";wafer.fillRect(0,70,256,4);wafer.fillRect(0,190,256,4);
  cellMap.needsUpdate=true;
  const blue=new T.MeshStandardMaterial({map:cellMap,roughness:.9});
  const chalk = new T.MeshStandardMaterial({map:paints.linen,roughness:.95,flatShading:true});
  const rover=createRover(chalk,ink,copper,blue,paints.ochre);
  group.add(rover.chassis);
  const relay = new T.Group();
  relay.position.set(-2.5,4.85,-2.2);relay.rotation.z=.15;
  group.add(relay);
  function part(parent:T.Object3D,geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0){
    const mesh = new T.Mesh(geometry,material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  part(relay,new T.CylinderGeometry(.22,.24,.39,8),copper);
  part(relay,new T.CylinderGeometry(.23,.23,.045,8),ink,0,-.13);
  for(const side of [-1,1]){
    part(relay,new T.BoxGeometry(.76,.032,.032),ink,side*.52);
    part(relay,new T.BoxGeometry(.59,.285,.03),ink,side*.67);
    for(let col=0;col<4;col++)for(let row=0;row<2;row++)
      part(relay,new T.BoxGeometry(.129,.116,.037),blue,side*.67+(col-1.5)*.141,(row-.5)*.13,.01);
  }
  const socket=part(relay,new T.CylinderGeometry(.058,.070,.043,16),ink,0,.022,.215);
  socket.rotation.x=Math.PI/2;
  const lens=part(relay,new T.SphereGeometry(.045,16,10),blue,0,.022,.237);
  lens.scale.z=.34;
  const lampPaint=new T.MeshBasicMaterial({map:paints.ochre,color:0x8c643c});
  const lamp=part(relay,new T.SphereGeometry(.018,12,8),lampPaint,.127,.077,.186);
  lamp.scale.z=.65;
  const antenna=new T.Group();relay.add(antenna);antenna.position.y=.18;
  const dish=new T.LatheGeometry([new T.Vector2(.012,0),new T.Vector2(.065,.01),new T.Vector2(.12,.038),new T.Vector2(.17,.08)],36);
  const dishPaint=chalk.clone();dishPaint.side=T.DoubleSide;
  part(antenna,dish,dishPaint);
  part(antenna,new T.CylinderGeometry(.009,.013,.18,8),ink,0,.09);
  part(antenna,new T.SphereGeometry(.027,12,8),copper,0,.18);
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3, foot=new T.Vector3(.157*Math.cos(a),.074,.157*Math.sin(a));
    const top=new T.Vector3(0,.17,0),dir=top.clone().sub(foot);
    const strut=part(antenna,new T.CylinderGeometry(.004,.006,dir.length(),5),ink);
    strut.position.copy(foot).lerp(top,.5);strut.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());
  }
  const waves=Array.from({length:3},()=>{
    const paint=new T.MeshBasicMaterial({map:paints.ochre,color:0xf2b557,transparent:true,depthWrite:false});
    const wave=part(antenna,new T.TorusGeometry(.18,.009,6,48),paint);
    wave.rotation.x=Math.PI/2;wave.visible=false;return wave;
  });
  // Two raised eyes and a low chin appear as a reply to a radio pulse.
  const reply=new T.Group();
  reply.position.copy(relay.position).add(new T.Vector3(.73,.69,-.92));
  group.add(reply);
  const constellation=[[-.51,-.12],[-.43,.05],[-.38,.24],[-.25,.27],[-.15,.11],
    [.11,.12],[.20,.29],[.35,.26],[.42,.05],[.50,-.13],[.27,-.26],[-.20,-.27],[-.51,-.12]];
  const dots=constellation.map(([x,y])=>new T.Vector3(x,y,0));
  const thread=new T.Line(new T.BufferGeometry().setFromPoints(dots),new T.LineBasicMaterial({color:0x77654c}));
  reply.add(thread);
  const starPaint=new T.MeshBasicMaterial({map:paints.graphite});
  const sparks=dots.slice(0,-1).map((p,i)=>part(reply,new T.OctahedronGeometry(.017+(i%3)*.004),starPaint,p.x,p.y,p.z));
  const eyes=[-.29,.27].map(x=>part(reply,new T.OctahedronGeometry(.024),starPaint,x,.18,.008));
  const smile=new T.Line(new T.BufferGeometry().setFromPoints([
    new T.Vector3(-.18,-.08,0),new T.Vector3(.02,-.12,0),new T.Vector3(.22,-.06,0),
  ]),thread.material);
  reply.add(smile);

  const meteor=new T.Group();
  const meteorPaint=new T.MeshBasicMaterial({map:paints.ochre,color:0xc6a97e,transparent:true,depthWrite:false});
  const core=part(meteor,new T.OctahedronGeometry(.025),meteorPaint);
  const tail=part(meteor,new T.ConeGeometry(.017,.34,5),meteorPaint,-.17,0);
  tail.rotation.z=Math.PI/2;core.scale.x=1.45;
  const from=paintingPoint(338,315,-4),to=paintingPoint(746,426,-4);
  meteor.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),to.clone().sub(from).normalize());
  group.add(meteor);

  let shootingSince=-Infinity;
  const shootingFrom=new T.Vector3(),shootingTo=new T.Vector3();
  function shoot(point:T.Vector3,camera:T.Camera,animate:boolean){
    shootingSince=time-(animate?0:.30);
    shootingFrom.copy(point);
    shootingTo.set(1.3,-.46,0).applyQuaternion(camera.quaternion).add(point);
  }

  const comet=new T.Group();group.add(comet);
  const nucleus = new T.IcosahedronGeometry(.17,2);
  const crust=nucleus.attributes.position;
  for(let i=0;i<crust.count;i++){
    const x=crust.getX(i),y=crust.getY(i),z=crust.getZ(i);
    const relief=1+.12*Math.sin(x*25+y*16)*Math.cos(y*29-z*19);
    crust.setXYZ(i,x*relief,y*relief,z*relief);
  }
  nucleus.computeVertexNormals();
  part(comet,nucleus,new T.MeshStandardMaterial({map:paints.soil,roughness:1,flatShading:true})).scale.set(1,.85,1.25);
  const dustPaint=new T.MeshBasicMaterial({map:paints.cream,vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide});
  for(let i=0;i<7;i++)part(comet,cometFilament(i),dustPaint);
  const grains=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),chalk,38);
  grains.frustumCulled=false;comet.add(grains);
  const grain=new T.Object3D();
  function emitDust(){
    for(let i=0;i<grains.count;i++){
      const t=(i*.61803+time*(.19+.025*(i%4)))%1,a=i*2.4+t;
      const spread=.045+.28*t;
      grain.position.set(Math.sin(a)*spread+.1*t*t,Math.cos(a)*spread,-.12-1.56*t);
      grain.rotation.set(a,t*6+i,0);
      grain.scale.setScalar((.007+.003*(i%3))*(1-t*t));
      grain.updateMatrix();grains.setMatrixAt(i,grain.matrix);
    }
    grains.instanceMatrix.needsUpdate=true;
  }

  // Store a bounded trail of shallow impressions in the local tangent plane.
  const tread = new T.Shape();
  tread.moveTo(-.07,-.09);tread.quadraticCurveTo(-.12,.02,-.08,.09);
  tread.quadraticCurveTo(0,.14,.08,.09);tread.quadraticCurveTo(.12,.02,.07,-.09);
  tread.quadraticCurveTo(0,-.14,-.07,-.09);
  // The rubber lugs cut the channels in this same sole shape.
  const stampGeo=new T.ShapeGeometry(tread);
  const soleUV=stampGeo.attributes.uv,solePos=stampGeo.attributes.position;
  stampGeo.computeBoundingBox();
  const bounds=stampGeo.boundingBox!;
  for(let i=0;i<solePos.count;i++){
    soleUV.setXY(i,(solePos.getX(i)-bounds.min.x)/(bounds.max.x-bounds.min.x),
      (solePos.getY(i)-bounds.min.y)/(bounds.max.y-bounds.min.y));
  }
  stampGeo.rotateX(-Math.PI/2);
  const dustPrint=new T.MeshBasicMaterial({map:paints.soil,color:0x867a6b,
    alphaMap:footprintMask(),transparent:true,opacity:.91,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const trail=new T.InstancedMesh(stampGeo,dustPrint,80);
  trail.count=0;trail.frustumCulled=false;group.add(trail);
  const marker=new T.Object3D(),normal=new T.Vector3(),up=new T.Vector3(0,1,0);
  let stamps=0,time=0,signal=-10;
  function imprint(point:T.Vector3,yaw:number){
    const {x,z}=point;
    normal.set(groundHeight(x-.01,z)-groundHeight(x+.01,z),.02,groundHeight(x,z-.01)-groundHeight(x,z+.01)).normalize();
    marker.position.copy(point).addScaledVector(normal,.028);
    marker.quaternion.setFromUnitVectors(up,normal);
    marker.rotateY(yaw+(stamps%2?.15:-.15));marker.updateMatrix();trail.setMatrixAt(stamps%80,marker.matrix);
    trail.count=Math.min(80,++stamps);trail.instanceMatrix.needsUpdate=true;
    trail.computeBoundingSphere();
  }
  function cometAt(t:number) {
    comet.position.set(2.6+2.1*Math.sin(t*.21),4.95+.42*Math.sin(t*.38),-3.6+2*Math.cos(t*.21));
    comet.rotation.y=Math.atan2(2.1*Math.cos(t*.21),-2*Math.sin(t*.21));
  }
  function update(dt:number){
    time+=dt;cometAt(time);emitDust();
    relay.position.set(-2.5+.66*Math.sin(time*.14),4.85+.16*Math.sin(time*.28),-2.2+.54*Math.cos(time*.14));
    reply.position.copy(relay.position);
    reply.position.x+=.73;reply.position.y+=.69;reply.position.z-=.92;
    relay.rotation.y=.22*Math.sin(time*.24);
    antenna.rotation.y=.75*Math.sin(time*.46);
    rover.update(dt,time);
    const triggered=time-shootingSince<1.35;
    const crossing=triggered?(time-shootingSince)/1.35:((time+10)%17)/1.8;
    meteor.visible=crossing<1;
    if(meteor.visible){
      const start=triggered?shootingFrom:from,end=triggered?shootingTo:to;
      meteor.position.lerpVectors(start,end,crossing);
      meteor.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),new T.Vector3().subVectors(end,start).normalize());
      meteorPaint.opacity=.85*Math.sin(Math.PI*crossing);
    }
    const age=time-signal;
    reply.visible=age>=.55 && age<8;
    if(reply.visible){
      const lit=Math.min(dots.length,Math.floor((age-.55)*7)+1);
      thread.geometry.setDrawRange(0,lit);
      sparks.forEach((spark,i)=>{spark.visible=i<lit;});
      eyes.forEach(eye=>{eye.visible=lit===dots.length;});
      smile.visible=lit===dots.length;
    }
    lampPaint.color.setHex(age<1.8 && Math.cos(age*15)>.05 ? 0xffcb66 : 0x8c643c);
    antenna.rotation.z=-.32-.32*Math.sin(Math.PI*Math.min(age/2,1));
    waves.forEach((wave,i)=>{
      const t=(age-i*.25)/1.3;
      wave.visible=t>=0&&t<1;
      if(wave.visible){
        wave.position.y=.2+t*.75;wave.scale.setScalar(1+t*2.8);
        (wave.material as T.MeshBasicMaterial).opacity=1-t;
      }
    });
  }
  update(0);
  return {group,relay,comet,rover,reply,trail,shoot,imprint,update,
    sendSignal(animate:boolean){signal=time-(animate?0:2.4);}};
}

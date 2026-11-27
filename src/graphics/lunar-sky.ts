import * as T from "three";
import { paintingPoint } from "./painting-frame.mjs";
import {visorOutline} from "./visor-outline";
import type {DrawnStar} from "./loading-stars";
import type {ReferencePaints} from "./reference-paints";

export const skyNotes = {
  sun: ["태양", "태양 가장자리에서 붉은 가스의 고리가 솟아오릅니다."],
  binary: ["쌍성", "푸른 별과 주황색 별이 서로의 둘레를 돕니다."],
  blackHole: ["블랙홀", "검은 중심 주위로 밝은 가스 원반이 회전합니다."],
  constellation: ["별자리", "개구리 모양으로 이어지는 별 여덟 개를 찾아보세요."],
  rocket: ["로켓", "로켓이 달 위를 가로지릅니다."],
  visitor: ["외계인", "비행접시 안에서 손을 흔드는 승객이 있습니다."],
} as const;
export type SkyPlace = keyof typeof skyNotes;

export function createLunarSky(paints:ReferencePaints, arrivalStars:readonly DrawnStar[]=[]) {
  const group = new T.Group();
  const paint=(map:T.Texture,color=0xffffff)=>new T.MeshBasicMaterial({map,color,side:T.DoubleSide});
  const ochre=paint(paints.ochre),rust=paint(paints.ochre,0xc77b58);
  const slate=paint(paints.ocean),linen=paint(paints.linen),skin=paint(paints.skin);
  const ink=paint(paints.graphite,0x887e74);
  const sphere=new T.SphereGeometry(1,36,24);
  function shape(parent:T.Object3D,geo:T.BufferGeometry,material:T.Material,
    x:number,y:number,z:number,sx=1,sy=sx,sz=sx) {
    const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
  }
  function body(x:number,y:number,z:number) {
    const g=new T.Group();g.position.copy(paintingPoint(x,y,z));group.add(g);return g;
  }
  const sun=body(-545,160,-5.6);
  shape(sun,sphere,ochre,0,0,0,.61);
  const flares=Array.from({length:7},(_,i)=>{
    const angle=i*2.40;
    const loop=shape(sun,new T.TorusGeometry(.16,.013,7,40),rust,.52*Math.cos(angle),.52*Math.sin(angle),.03,1,.72,1);
    loop.rotation.z=angle;return loop;
  });
  const binary=body(440,-180,-6);
  const pair=[shape(binary,sphere,slate,0,0,0,.13),shape(binary,sphere,rust,0,0,0,.095)];
  const blackHole=body(2030,422,-7.8);
  shape(blackHole,sphere,ink,0,0,0,.30);
  const disk=new T.Group();blackHole.add(disk);disk.rotation.set(1.22,.20,-.45);
  // A thin edge-on disk crosses the shadow. Behind it, the same band of
  // light bends above and below the shadow in the observer's view.
  for(const [i,material] of [rust,ochre,linen,rust,ochre].entries()){
    const arc=shape(disk,new T.RingGeometry(.37+i*.050,.410+i*.050,112,1,i*.9,Math.PI*1.94),
      material,0,0,0,1,.99,1);
    arc.rotation.z=i*1.9;
  }
  const lens=new T.Group();blackHole.add(lens);lens.rotation.z=.12;
  for(const [i,material] of [rust,ochre,linen].entries()){
    shape(lens,new T.TorusGeometry(.333+i*.012,.012-i*.002,8,80,Math.PI),material,0,-.035,-.022,1.41,1.19,1);
  }
  const constellation=body(-135,376,-5.2);
  const points=[[-.77,-.25],[-.49,.06],[-.31,.29],[-.17,.12],[.17,.16],[.34,.38],[.53,.14],[.66,-.22]];
  const knots=points.map(([x,y],i)=>shape(constellation,sphere,i%3?slate:ochre,x,y,0,.036));
  const line=new T.Line(new T.BufferGeometry().setFromPoints(knots.map(n=>n.position)),
    new T.LineDashedMaterial({color:0x81765c,dashSize:.039,gapSize:.028}));
  line.computeLineDistances();constellation.add(line);
  if(arrivalStars.length){
    // The poster and the opening camera share the same 1254-unit painting frame.
    const positions=arrivalStars.map(({x,y})=>paintingPoint(x*12.54,y*12.54,-11.8));
    const nib=new T.OctahedronGeometry(.042);
    for(const p of positions){
      shape(group,nib,slate,p.x,p.y,p.z,.62,1.2,.55);
      shape(group,nib,ochre,p.x,p.y,p.z,1.05,.32,.55);
    }
    if(positions.length>1){
      const thread=new T.Line(new T.BufferGeometry().setFromPoints(positions),line.material);
      thread.computeLineDistances();group.add(thread);
    }
  }
  const rocket=body(60,85,-3.9);
  shape(rocket,sphere,linen,0,0,0,.096,.27,.096);
  shape(rocket,new T.ConeGeometry(.089,.16,20),rust,0,.24,0);
  shape(rocket,sphere,slate,0,.07,.083,.047,.047,.018);
  for(const side of [-1,1]){
    const fin=shape(rocket,sphere,rust,.082*side,-.134,0,.036,.11,.026);
    fin.rotation.z=-side*.35;
  }
  const exhaust=shape(rocket,new T.ConeGeometry(.048,.20,16),ochre,0,-.295,0);
  exhaust.rotation.z=Math.PI;
  const visitor=body(1790,680,-2.2);
  shape(visitor,sphere,slate,0,0,0,.35,.082,.23);
  shape(visitor,sphere,ochre,0,-.044,.01,.26,.063,.21);
  shape(visitor,sphere,skin,0,.144,.012,.108,.114,.081);
  for(const side of [-1,1])shape(visitor,sphere,ink,side*.045,.165,.082,.016,.020,.009);
  const arm=new T.Group();arm.position.set(.085,.082,.010);visitor.add(arm);
  shape(arm,sphere,skin,.025,.055,.024,.023,.073,.023);
  const glass=new T.MeshBasicMaterial({map:paints.glass,transparent:true,opacity:.20,depthWrite:false});
  const dome=new T.SphereGeometry(1,36,18,0,Math.PI*2,0,Math.PI/2);
  const canopy=shape(visitor,dome,glass,0,.035,0,.205,.27,.170);
  canopy.userData.clearDome=true;canopy.add(visorOutline(dome));
  const destinations={sun,binary,blackHole,constellation,rocket,visitor};
  let responding:SkyPlace|null=null, responseAt=0, restingPose=false;
  function react(place:SkyPlace,time:number,animate:boolean){
    responding=place;responseAt=time;restingPose=!animate;
    update(time);
  }
  function update(time:number){
    const t=Math.min(1,(time-responseAt)/1.8);
    const strength=restingPose?.80:Math.sin(Math.PI*t);
    const accent=(id:SkyPlace)=>responding===id?strength:0;
    const orbit=time*.48+accent("binary")*Math.PI;
    for(const [i,loop] of flares.entries())loop.scale.y=.74+.17*Math.sin(time*.61+i)+accent("sun")*.65;
    disk.rotation.z=-.45+time*.17+accent("blackHole")*1.6;
    disk.rotation.x=1.22-accent("blackHole")*.42;
    pair.forEach((star,i)=>star.position.set(.33*Math.cos(orbit+i*Math.PI),.14*Math.sin(orbit+i*Math.PI),.25*Math.sin(orbit+i*Math.PI)));
    knots.forEach((n,i)=>n.scale.setScalar(.032+.009*Math.sin(time*1.22+i*.8)+accent("constellation")*.043));
    rocket.position.copy(paintingPoint(55+375*Math.sin(time*.091),75+79*Math.sin(time*.182),-3.9+.45*Math.cos(time*.091)));
    rocket.rotation.z=-Math.atan2(375*Math.cos(time*.091),-158*Math.cos(time*.182));
    exhaust.scale.y=.82+.16*Math.sin(time*7)+accent("rocket")*2.2;
    exhaust.position.y=-.195-exhaust.scale.y*.10;
    visitor.position.copy(paintingPoint(1790+75*Math.sin(time*.16),680+24*Math.sin(time*.38),-2.2));
    visitor.rotation.z=.09*Math.sin(time*.57);arm.rotation.z=-.54+.38*Math.sin(time*2.5)-accent("visitor")*(.85+.4*Math.sin(t*22));
  }
  update(0);
  return {group,destinations,react,update};
}

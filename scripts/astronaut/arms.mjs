import {Vector3,MathUtils,CubicBezierCurve3} from "three";
import {joints} from "../../src/graphics/seated-pose.mjs";
import {trouser} from "./rig.mjs";
import {facialParts} from "./face.mjs";
import {supportHeight} from "./support.mjs";

const head=facialParts[0];
const jaw=supportHeight((u,t)=>head.project(...head.point(u,t)),true);
const joint=(side,name)=>new Vector3(...joints[side+name]);

// The padded upper arm and forearm meet inside the elbow. Their smooth union
// keeps a single outer surface even where the folded sleeve touches itself.
export function sleeve(side){
  const shoulder=joint(side,"Shoulder"),elbow=joint(side,"Elbow"),wrist=joint(side,"Wrist");
  const upper=shoulder.clone().sub(elbow),fore=wrist.clone().sub(elbow);
  const upperLength=upper.length(),foreLength=fore.length();
  upper.normalize();fore.normalize();
  const near=side==="near",knee=supportHeight(trouser(side),false);
  const elbowRadius=near?46:43;
  return (u,t)=>{
    const a=(u-.5)*2*Math.PI,b=t*Math.PI;
    const dx=Math.sin(a)*Math.sin(b),dy=-Math.cos(b),dz=Math.cos(a)*Math.sin(b);
    const su=dx*upper.x+dy*upper.y+dz*upper.z,sf=dx*fore.x+dy*fore.y+dz*fore.z;
    let low=0,high=Math.max(upperLength,foreLength)+60;
    for(let i=0;i<13;i++){
      const r=(low+high)/2;
      const h=MathUtils.clamp(r*su,0,upperLength),k=MathUtils.clamp(r*sf,0,foreLength-25);
      const top=Math.sqrt(Math.max(0,r*r+h*h-2*r*h*su))-MathUtils.lerp(elbowRadius,near?48:44,h/upperLength);
      const lowerRadius=MathUtils.lerp(elbowRadius,near?39:34,k/foreLength);
      const gathers=2.6*Math.exp(-(((k/foreLength-.57-.025*dx)/.055)**2))
        -2.1*Math.exp(-(((k/foreLength-.65-.03*dx)/.042)**2));
      const lower=Math.sqrt(Math.max(0,r*r+k*k-2*r*k*sf))-lowerRadius-gathers;
      const overlap=Math.max(0,14-Math.abs(top-lower));
      if(Math.min(top,lower)-overlap*overlap/56<0)low=r;else high=r;
    }
    const x=elbow.x+low*dx,z=elbow.z+low*dz;
    let y=elbow.y+low*dy;
    const support=knee(x,z);
    if(support!==undefined && dy>0)y-=Math.min(38,Math.max(0,y-support-1.5))*MathUtils.smoothstep(dy,0,.25);
    return [x,y,z];
  };
}

// Fit the top of the hand to the underside of this head. The wrist end
// stays inside the cuff, with a rounded knuckle ridge on the exposed side.
export function cuppedHand(side){
  const palm=joint(side,"Palm"),wrist=joint(side,"Wrist"),near=side==="near";
  const crown=jaw(palm.x,palm.z);
  if(crown===undefined)throw Error(side+" palm falls outside the cheek");
  // Fit a single contact plane at the knuckles. Sampling the edge of the
  // jaw independently for each vertex pulls the fingers up its side wall.
  const slopeX=((jaw(palm.x+2,palm.z)??crown)-(jaw(palm.x-2,palm.z)??crown))/4;
  const slopeZ=((jaw(palm.x,palm.z+2)??crown)-(jaw(palm.x,palm.z-2)??crown))/4;
  return (u,t)=>{
    const a=(u-.5)*2*Math.PI,b=t*Math.PI,blend=(1-Math.cos(b))/2;
    const ring=Math.sin(b),bulge=ring*(1.12-.26*blend);
    const thumbAngle=near?.98:-.98;
    const thumb=7*Math.exp(-(((a-thumbAngle)/.49)**2+((t-.53)/.19)**2));
    const knuckles=1+.065*Math.cos(3*a+.24)*ring;
    const x=MathUtils.lerp(palm.x,wrist.x,blend)+((near?29:26)*bulge*knuckles+thumb)*Math.sin(a);
    const z=MathUtils.lerp(palm.z,wrist.z,blend)+((near?25:23)*bulge+thumb)*Math.cos(a);
    const base=MathUtils.lerp(crown-2,wrist.y+10,blend);
    const tilt=slopeX*(x-palm.x)+slopeZ*(z-palm.z);
    const y=base+9*Math.tanh(tilt/9)*(1-MathUtils.smoothstep(t,.16,.59));
    return [x,y,z];
  };
}

// A finger emerges from the fleshy pad, rolls over its outside edge and
// curls toward the cheek. Both ends disappear smoothly into the palm.
export function cheekFingers(side,palmSurface){
  const sign=side==="near" ? -1 : 1;
  const outward=.52+sign*.50;
  return [
    ["index",outward-sign*.62,.19,8.8],["middle",outward,.14,9.3],
    ["outer",outward+sign*.66,.22,8.4],["thumb",outward-sign*1.38,.34,9.6],
  ].map(([name,angle,top,radius])=>{
    function anchor(a,height,offset){
      const v=new Vector3(...palmSurface(.5+a/(2*Math.PI),height));
      return v.addScaledVector(new Vector3(Math.sin(a),0,Math.cos(a)),offset);
    }
    const bend=name==="thumb" ? .64 : .33;
    const path=new CubicBezierCurve3(
      anchor(angle+sign*bend,top+.09,-1),
      anchor(angle+sign*bend,top,5),
      anchor(angle,.47,7),
      anchor(angle-sign*.13,.62,-4)
    );
    const rings=new Map();
    function point(u,t){
      if(!rings.has(t)){
        const tangent=path.getTangent(t);
        const across=new Vector3(Math.cos(angle),0,-Math.sin(angle)).projectOnPlane(tangent).normalize();
        const front=new Vector3().crossVectors(across,tangent).normalize();
        rings.set(t,{center:path.getPoint(t),across,front});
      }
      const {center,across,front}=rings.get(t),a=u*2*Math.PI;
      const r=radius*Math.sin(Math.PI*t)**.53*(1.22-.38*t);
      return center.clone().addScaledVector(across,r*Math.sin(a)).addScaledVector(front,r*.86*Math.cos(a)).toArray();
    }
    return {name,point};
  });
}

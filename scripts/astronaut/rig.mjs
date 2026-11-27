import * as T from "three";
import {joints,chains} from "../../src/graphics/seated-pose.mjs";

const vector = name => new T.Vector3(...joints[name]);

// A raised cloth lip casts a short shadow over the groove beside it.
// The pressed folds converge at the bent knee and loosen around the shin.
const kneeFolds=[
  [.42,.048,.026,4.7],[.57,-.056,.029,5.9],
  [.69,.035,.022,5.4],[.81,.021,.021,4.8],
];
export function trouserGather(u,t){
  const a=u*2*Math.PI,c=Math.cos(a),s=Math.sin(a);
  let lift=0;
  for(const [row,slope,width,depth] of kneeFolds){
    const distance=(t-row-slope*c-.008*Math.sin(2*a))/width;
    const strength=row<.6 ? .34+.66*c*c : .80+.20*s;
    lift+=strength*depth*(Math.exp(-distance*distance)-.72*Math.exp(-((distance+1.12)**2)/.44));
  }
  return lift;
}

// Sweep a single padded trouser leg along hip, knee and ankle. Sections are
// perpendicular to the limb, so its bent profile survives a camera turn.
export function trouser(side) {
  const hip=vector(side+"Hip"), knee=vector(side+"Knee"), ankle=vector(side+"Ankle");
  const thigh=knee.clone().sub(hip), shin=ankle.clone().sub(knee);
  const hinge=new T.Vector3().crossVectors(thigh,shin).normalize();
  const near=side==="near";
  const sections=[
    [0,hip.clone().addScaledVector(thigh,-.13),0,0],
    [.09,hip,near?61:52,near?48:43],
    [.29,hip.clone().lerp(knee,.55),near?69:60,near?54:49],
    [.45,knee.clone().addScaledVector(thigh,-.14),near?72:60,near?61:52],
    [.54,knee,near?72:61,near?62:52],
    [.63,knee.clone().addScaledVector(shin,.25),near?67:58,near?60:49],
    [.84,knee.clone().lerp(ankle,.72),near?49:48,near?44:43],
    [.95,ankle,near?42:41,near?37:36],
    [1,ankle.clone().addScaledVector(shin,.08),0,0],
  ];
  // Interpolate the center and radii together. Cache longitudinal samples
  // because the atlas visits the same cross-section for every texel in a row.
  const centers=new T.CatmullRomCurve3(sections.map(s=>s[1]),false,"centripetal");
  const frames=new Map();
  function frame(t){
    if(frames.has(t))return frames.get(t);
    let i=0;while(i<sections.length-2 && t>sections[i+1][0])i++;
    const a=sections[i],b=sections[i+1],f=(t-a[0])/(b[0]-a[0]);
    const s=(i+f)/(sections.length-1),center=centers.getPoint(s);
    const tangent=centers.getTangent(s),radial=new T.Vector3().crossVectors(tangent,hinge).normalize();
    const blend=f*f*(3-2*f);
    const result={center,radial,w:T.MathUtils.lerp(a[2],b[2],blend),h:T.MathUtils.lerp(a[3],b[3],blend)};
    frames.set(t,result);return result;
  }
  return (u,t)=>{
    const {center,radial,w,h}=frame(t);
    const angle=u*Math.PI*2, c=Math.cos(angle),s=Math.sin(angle);
    const fold=trouserGather(u,t);
    // The painting frame reverses y. This winding faces outward after projection.
    const p=center.clone().addScaledVector(hinge,(w+fold)*c).addScaledVector(radial,(h+fold)*s);
    // Cloth on the compressed underside hangs below the raised knee. It
    // flattens against the same support plane as the seat and the heels.
    const underside=T.MathUtils.smoothstep(p.y-center.y,0,44);
    const drape=Math.sin(t*Math.PI)**1.1*underside*(near?37:23);
    p.y=Math.min(p.y+drape,1042.7+.411*p.z);
    return p.toArray();
  };
}

export function createRig(art,world){
  const bones={},rest={};
  for(const [name,p] of Object.entries(joints)){
    const bone=new T.Bone();bone.name=name;rest[name]=world(...p);
    bone.position.copy(rest[name]);bones[name]=bone;art.add(bone);
  }
  // Attach in reference space before parenting. Each joint keeps its measured
  // rest position; local +Y follows the limb to the distal joint.
  for(const chain of chains){
    const limb=chain[0]==="chest" || chain[1].endsWith("Hip");
    const first=limb?1:0;
    const hinge=limb?new T.Vector3().crossVectors(
      rest[chain[2]].clone().sub(rest[chain[1]]),rest[chain[3]].clone().sub(rest[chain[2]])
    ).normalize():new T.Vector3(1,0,0);
    for(let i=first;i<chain.length-1;i++){
      const start=chain[i],end=chain[i+1];
      const axis=rest[end].clone().sub(rest[start]).normalize();
      const zAxis=new T.Vector3().crossVectors(hinge,axis).normalize();
      const xAxis=new T.Vector3().crossVectors(axis,zAxis);
      bones[start].quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(xAxis,axis,zAxis));
    }
  }
  for(const chain of chains)for(let i=1;i<chain.length;i++)bones[chain[i-1]].attach(bones[chain[i]]);
  art.updateMatrixWorld(true);
  const names=Object.keys(bones), skeleton=new T.Skeleton(Object.values(bones));
  function skin(mesh,weights){
    const g=mesh.geometry,p=g.attributes.position,ids=[],values=[],v=new T.Vector3();
    for(let i=0;i<p.count;i++){
      const [a,b,f]=weights(v.fromBufferAttribute(p,i));
      ids.push(names.indexOf(a),names.indexOf(b),0,0);values.push(1-f,f,0,0);
    }
    g.setAttribute("skinIndex",new T.Uint16BufferAttribute(ids,4));
    g.setAttribute("skinWeight",new T.Float32BufferAttribute(values,4));
    const skinned=new T.SkinnedMesh(g,mesh.material);
    skinned.name=mesh.name;skinned.userData=mesh.userData;art.remove(mesh);art.add(skinned);
    skinned.updateWorldMatrix(true,false);skinned.bind(skeleton,skinned.matrixWorld);
  }
  function limbWeights(side,arm){
    const [a,b,c]=(arm?["Shoulder","Elbow","Wrist"]:["Hip","Knee","Ankle"]).map(j=>side+j);
    const proximal=rest[b].clone().sub(rest[a]).normalize();
    const distal=rest[c].clone().sub(rest[b]).normalize();
    const bend=proximal.clone().add(distal).normalize();
    const delta=new T.Vector3();
    return v=>{
      const jointDistance=delta.subVectors(v,rest[b]).dot(bend);
      if(jointDistance<-.16){
        const fit=T.MathUtils.smoothstep(delta.subVectors(v,rest[a]).dot(proximal),-.10,.20);
        return [arm?"chest":"pelvis",a,fit];
      }
      if(jointDistance>.16){
        const fit=T.MathUtils.smoothstep(delta.subVectors(v,rest[c]).dot(distal),-.11,.08);
        return [b,c,fit];
      }
      return [a,b,T.MathUtils.smoothstep(jointDistance,-.16,.16)];
    };
  }
  return {bind(mesh,part){
    const side=part.name.startsWith("Near")?"near":"far";
    if(part.leg || part.name.endsWith("sleeve"))skin(mesh,limbWeights(side,!part.leg));
    else if(part.name==="Pressure suit and seated hips"){
      skin(mesh,v=>["pelvis","chest",T.MathUtils.smoothstep(v.y,rest.pelvis.y,rest.chest.y)]);
    }else{
      const joint=part.foot?side+"Ankle":part.finger||part.name.includes("hand under")||part.name.includes("wrist lining")?side+"Wrist":
        part.pigment==="pack"||part.pigment==="collar"?"chest":"head";
      bones[joint].attach(mesh);
    }
  },bones};
}

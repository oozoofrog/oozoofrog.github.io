import {MathUtils,Mesh,Object3D} from "three";

export function animateEyelids(frog:Object3D){
  const lids:Mesh[]=[];
  frog.traverse(node=>{
    if(node instanceof Mesh && node.userData.blinkSide!==undefined && node.morphTargetInfluences)lids.push(node);
  });
  // A short close, a held contact pose, then a slower release. Offset the
  // distant lid by one frame, keeping the planted hands and helmet still.
  return (time:number)=>{
    for(const lid of lids){
      const phase=(time+(lid.userData.blinkSide<0?.021:0))%5.7;
      const closure=MathUtils.smoothstep(phase,3.55,3.68)*(1-MathUtils.smoothstep(phase,3.74,4.02));
      const weights=lid.morphTargetInfluences!;
      const pose=closure*weights.length;
      for(let i=0;i<weights.length;i++)weights[i]=Math.max(0,1-Math.abs(pose-i-1));
    }
  };
}

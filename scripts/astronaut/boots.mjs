import {MathUtils} from "three";
import {feet} from "../../src/graphics/seated-pose.mjs";
import {treadHeight} from "../../src/graphics/boot-tread.mjs";

// Sections run from inside the trouser cuff down to the welt. The heel stays
// under the ankle while the forefoot broadens over the metatarsal heads.
// Columns: t, heel, toe, half width, depth along the plantar normal.
const sections=[
  [0,0,0,0,-44],[.10,-33,35,34,-36],[.18,-36,39,36,-29],
  [.25,-33,37,33,-23],[.35,-34,46,35,-13],[.49,-34,69,36,-6],
  [.64,-35,94,40,2],[.78,-36,103,43,10],[.90,-37,107,44,21],
  [1,-37,107,44,31],
];
const smooth=(a,b,x)=>MathUtils.smoothstep(x,a,b);
const squared=(x,p)=>Math.sign(x)*Math.abs(x)**p;

export function bootSurface(side,sole){
  const frame=feet[side];
  return (u,t)=>{
    const a=2*Math.PI*u,along=squared(Math.cos(a),.86),across=squared(Math.sin(a),.82);
    const toeSpring=4*Math.max(0,along)**3;
    if(sole){
      const r=Math.cos(t*Math.PI/2);
      const tread=treadHeight(r*across,(1-r*along)/2);
      const base=31+smooth(0,.12,t)*(3.6+1.2*tread)-toeSpring*r**3;
      return frame.point(35+72*along*r,44*(.87+.13*along)*across*r,base).toArray();
    }
    let row=1;while(sections[row][0]<t && row<sections.length-1)row++;
    const [t0,...lo]=sections[row-1],[t1,...hi]=sections[row];
    const f=(t-t0)/(t1-t0);
    const [heel,toe,width,depth]=lo.map((x,i)=>MathUtils.lerp(x,hi[i],f));
    const shaft=1-smooth(.24,.66,t);
    const l=(heel+toe)/2+(toe-heel)*along/2;
    const w=width*across*MathUtils.lerp(.87+.13*along,1,shaft);
    const p=frame.point(l,w,depth-toeSpring*(1-shaft));
    // The cuff encircles the shin even when the ankle is pitched or rolled.
    return p.addScaledVector(frame.shank,depth*shaft)
      .addScaledVector(frame.down,-depth*shaft).toArray();
  };
}

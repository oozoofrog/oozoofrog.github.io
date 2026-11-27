// Painted guides in character space. Each projection samples only its own
// material; the eye, mouth and silhouette are defined by the sculpt.
import sharp from "sharp";
import {MathUtils} from "three";
const {data,info}=await sharp(new URL("./art/turnaround.webp",import.meta.url).pathname)
  .removeAlpha().raw().toBuffer({resolveWithObject:true});
const smooth=(a,b,x)=>MathUtils.smoothstep(x,a,b);
function pixel(x,y){
  const i=3*(Math.round(y*info.height/887)*info.width+Math.round(x*info.width/1774));
  return [data[i],data[i+1],data[i+2]];
}
export function headPaint(x,y,z,cream,base){
  const views=[
    [228+.78*x,370-.76*y,Math.max(0,z/142)],
    [681-.82*z,366-.76*y,Math.max(0,-x/171)],
    [1104-.79*x,366-.76*y,Math.max(0,-z/138)],
    [1538+.82*z,366-.76*y,Math.max(0,x/171)],
  ];
  const sum=base.map(v=>v*.18);
  let total=.18;
  for(const [u,v,w] of views){
    if(!w)continue;
    const c=pixel(u,v);
    const mask=cream?smooth(155,212,c[0])*smooth(10,36,c[0]-c[2])*smooth(-5,12,c[0]-c[1]):
      smooth(17,55,c[1]-c[2])*(1-smooth(3,21,c[0]-c[1]))*smooth(53,108,c[1]);
    const weight=w*w*mask;
    for(let i=0;i<3;i++)sum[i]+=weight*c[i];
    total+=weight;
  }
  return sum.map(v=>v/total);
}

// Interior cloth panels from the front sleeve, both profiles and the rear seat.
// Overlap the panels in UV space so a seam never follows the viewing camera.
export function suitPaint(u,t,base){
  const a=(u-.5)*Math.PI*2;
  const profiles=[[150,529,0],[658,514,-Math.PI/2],[1110,699,Math.PI],[1502,520,Math.PI/2]];
  const sum=base.map(v=>v*.8);
  let total=.8;
  for(const [cx,cy,heading] of profiles){
    const weight=Math.max(0,Math.cos(a-heading))**3;
    if(!weight)continue;
    const c=pixel(cx+30*Math.sin(a-heading),cy+29*(2*t-1));
    const cloth=smooth(72,146,c[0])*(1-smooth(1,23,c[1]-c[0]));
    for(let i=0;i<3;i++)sum[i]+=weight*cloth*c[i];
    total+=weight*cloth;
  }
  return sum.map(v=>v/total);
}

export function serviceEnamel(size){
  const tile=Buffer.alloc(size*size*3);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/(size-1),v=y/(size-1),sx=1037+140*u,sy=510+134*v;
    // The vent slots are modeled recesses. Sample adjacent intact enamel
    // through the middle of the plate, keeping its cool edge wear.
    const cleaned=sy>536 && sy<608 && sx>1060 && sx<1161?
      618+14*Math.sin(Math.PI*(sy-536)/72):sy;
    tile.set(pixel(sx,cleaned),3*(y*size+x));
  }
  return tile;
}

// Bake the visible part of each object's texture from the original 1254px painting.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import {inkStars} from "../../src/graphics/lunar-marks.mjs";
import {horizonY} from "../../src/graphics/lunar-horizon.mjs";
import {pigmentSampler,pigmentTile,pigmentSize} from "./pigment.mjs";
import {pigmentRows} from "../../src/graphics/pigment-layout.mjs";
const out = "public/assets/models/lunar";
await mkdir(out, { recursive: true });
const { data, info } = await sharp("public/assets/images/lunar-journal.webp").removeAlpha().raw().toBuffer({ resolveWithObject: true });
const clamp = (x,a,b) => Math.max(a, Math.min(b,x));
function pixel(x,y) {
  const i = (clamp(Math.round(y),0,info.height-1)*info.width + clamp(Math.round(x),0,info.width-1))*3;
  return data.subarray(i,i+3);
}
function blend(a,b,t) { return Array.from(a,(v,i)=>v+(b[i]-v)*clamp(t,0,1)); }
async function bake(name,w,h,sample,channels=3) {
  const dst=Buffer.alloc(w*h*channels);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) dst.set(sample((x+.5)/w,(y+.5)/h),channels*(y*w+x));
  await sharp(dst,{raw:{width:w,height:h,channels}}).webp({quality:91}).toFile(out+"/"+name+".webp");
}
const paletteWidth=pigmentRows[0].length*pigmentSize;
const paletteHeight=pigmentRows.length*pigmentSize;
const palette=Buffer.alloc(paletteWidth*paletteHeight*3);
pigmentRows.forEach((row,y)=>row.forEach((name,x)=>{
  const tile=pigmentTile(name),stride=pigmentSize*3;
  for(let j=0;j<pigmentSize;j++)
    tile.copy(palette,3*((y*pigmentSize+j)*paletteWidth+x*pigmentSize),j*stride,(j+1)*stride);
}));
await sharp(palette,{raw:{width:paletteWidth,height:paletteHeight,channels:3}})
  .webp({lossless:true}).toFile(out+"/pigments.webp");

const ochre=pigmentSampler("ochre");
await bake("moon",512,256,(u,v)=>{
  const phi=u*2*Math.PI,theta=v*Math.PI;
  const nx=-Math.cos(phi)*Math.sin(theta),ny=Math.cos(theta),nz=Math.sin(phi)*Math.sin(theta);
  // Stay inside the ink rim and wrap fresh marks around the unpainted hemisphere.
  const weight=clamp((nz-.45)/.19,0,1);
  const rear=ochre(84*(nx+.64*nz),84*(-ny+.27*nz));
  return blend(rear,pixel(250+84*nx,289-84*ny),weight);
});
const starTile=128;
await bake("stars",starTile*inkStars.length,starTile,(u,v)=>{
  const tile=u*inkStars.length, [cx,cy,r]=inkStars[Math.floor(tile)];
  const c=pixel(cx+(2*(tile%1)-1)*r,cy+(2*v-1)*r);
  const paper=pixel(cx+r*.83,cy+r*.83);
  const ink=[40,32,29];
  const alpha=clamp((paper[0]-c[0]-9)/(paper[0]-ink[0]-9),0,1);
  return [...ink.map((v,i)=>alpha>.03?clamp((c[i]-(1-alpha)*paper[i])/alpha,0,255):v),Math.round(255*alpha)];
},4);
// Stop at the boots and folded seat so their painted contact shadows stay in the soil.
const frogOutline=[[206,779],[258,749],[487,753],[590,742],[642,829],[643,903],
  [677,977],[689,1048],[681,1090],[660,1116],[636,1124],[602,1117],[566,1109],
  [535,1120],[507,1119],[471,1104],[431,1073],[389,1053],[337,1031],[299,1011],
  [275,991],[244,968],[215,950],[205,902]];
function inside(x,y) {
  let hit=false;
  for(let i=0,j=frogOutline.length-1;i<frogOutline.length;j=i++){
    const [a,b]=frogOutline[i], [c,d]=frogOutline[j];
    if ((b>y)!==(d>y) && x<(c-a)*(y-b)/(d-b)+a) hit=!hit;
  }
  return hit;
}
// Quilt overlapping samples with an irregular boundary. Preserve the long
// painted marks without repeating or mirroring one patch across the viewport.
function extension(centers,step){
  const tiles=new Map();
  function tile(i,j){
    const key=i+","+j;
    if(!tiles.has(key)){
      const hash=(Math.imul(i+91,73856093)^Math.imul(j+37,19349663))>>>0;
      const seed=Math.imul(hash^(hash>>>13),1274126177)>>>0;
      const [cx,cy]=centers[seed%centers.length];
      tiles.set(key,[cx+(seed%15)-7,cy+((seed>>>12)%11)-5,((seed>>>4)%15-7)*.028]);
    }
    return tiles.get(key);
  }
  return (x,y)=>{
    const u=x/step+.12*Math.sin(y*.019),v=y/step+.12*Math.sin(x*.023);
    const i=Math.floor(u),j=Math.floor(v),fx=u-i,fy=v-j;
    function swatch(col,row){
      const [cx,cy,angle]=tile(col,row);
      const dx=(u-col-.5)*step,dy=(v-row-.5)*step;
      return pixel(cx+dx*Math.cos(angle)-dy*Math.sin(angle),cy+dy*Math.cos(angle)+dx*Math.sin(angle));
    }
    function strip(row){
      const color=swatch(i,row);
      return fx<.18?blend(swatch(i-1,row),color,fx/.18):color;
    }
    const color=strip(j);
    return fy<.18?blend(strip(j-1),color,fy/.18):color;
  };
}
// Orient the full painting by matching the broad colors of the observed hemisphere,
// weighting the region near the paper edge where the two paintings meet.
const atlas=await sharp("scripts/astronaut/art/earth.webp").removeAlpha().raw().toBuffer({resolveWithObject:true});
const roll=-2.182,tilt=-1.025,longitude=.82983;
const cr=Math.cos(roll),sr=Math.sin(roll),ct=Math.cos(tilt),st=Math.sin(tilt);
function paintSample(u,v){
  const {width,height}=atlas.info;
  const x=clamp(u*(width-1),0,width-1),y=clamp(v*(height-1),0,height-1);
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const i=3*(iy*width+ix),j=3*(Math.min(iy+1,height-1)*width+ix);
  const right=ix+1<width?3:0;
  return [0,1,2].map(k=>
    (1-fy)*((1-fx)*atlas.data[i+k]+fx*atlas.data[i+right+k])+
    fy*((1-fx)*atlas.data[j+k]+fx*atlas.data[j+right+k]));
}
await bake("earth",3072,1536,(u,v)=>{
  const phi=u*2*Math.PI,theta=v*Math.PI;
  const nx=-Math.cos(phi)*Math.sin(theta),ny=Math.cos(theta),nz=Math.sin(phi)*Math.sin(theta);
  const x=1147+611*nx,y=-6-611*ny,r=Math.hypot(x-623,y-623);
  // Keep the visible brushwork. Use an irregular join just inside the paper edge.
  const bristle=4*Math.sin(x*.085+y*.13)+2*Math.cos(x*.23-y*.19);
  // At the limb the reference projects a whole strip of the sphere onto a
  // few paper pixels. Retire these stretched marks before turning the corner.
  const warp=.052*Math.sin(nx*14+ny*9)+.038*Math.sin(ny*23-nz*11)+.018*Math.cos(nx*39+ny*27);
  const coverage=Math.min((616-r+bristle)/54,(nz-.20+warp)/.36);
  const weight=clamp(coverage,0,1);
  const observed=weight*weight*(3-2*weight);
  if(observed===1)return pixel(x,y);
  const rx=cr*nx-sr*ny,ry=sr*nx+cr*ny;
  const lat=Math.acos(clamp(ct*ry-st*nz,-1,1))/Math.PI;
  const lon=(longitude+Math.atan2(st*ry+ct*nz,-rx)/(2*Math.PI)+1)%1;
  // Overlap both ends in the Pacific. The last texel meets the first at the same color.
  const overlap=.024,offset=lon*(1-overlap);
  let fill=paintSample(offset,lat);
  if(offset<overlap)fill=blend(paintSample(1-overlap+offset,lat),fill,offset/overlap);
  return observed===0?fill:blend(fill,pixel(x,y),observed);
});

// Pick patches from soil inside the painting. Use pale regolith across the
// broad plains, with darker stones limited to a few irregular rocky bands.
const fines=[],scree=[];
for(let y=908;y<1210;y+=12)for(let x=78;x<1150;x+=14){
  if(Math.hypot(x-623,y-623)>562 || y<horizonY(x)+52)continue;
  if([-42,0,42].some(dx=>[-42,0,42].some(dy=>inside(x+dx,y+dy))))continue;
  let dark=0;
  for(let j=-28;j<=28;j+=4)for(let i=-28;i<=28;i+=4)if(pixel(x+i,y+j)[0]<120)dark++;
  (dark<19?fines:scree).push([x,y]);
}
const soilFines=extension(fines,53),soilRocks=extension(scree,66);
const paperPaint=pigmentSampler("paper"),soilPaint=pigmentSampler("soil");
await bake("regolith",2400,1150,(u,v)=>{
  const x=u*2400-650, y=v*1150+400;
  // Continue the dry-brush marks across the unobserved ground using clean soil samples.
  const band=.52*Math.sin(x*.008-y*.016)+.33*Math.cos(y*.024+x*.003)+.20*Math.sin(x*.019+y*.010);
  const dust=blend(soilFines(x,y),soilPaint(x,y),.46),rocks=soilRocks(x,y);
  const soil=blend(dust,rocks,clamp((band-.28)*1.5,0,.85));
  const mask=clamp((y-horizonY(x)+8)/7,0,1)*clamp((619-Math.hypot(x-623,y-623))/10,0,1);
  return blend(soil,pixel(x,y),inside(x,y)?0:mask);
});
// Keep the paper at the same grain size as the figure. Fill the parts hidden
// by the model and planets from clean paper for viewpoints around their backs.
await bake("paper",1254,1254,(u,v)=>{
  const x=u*1254,y=v*1254;
  const clean=paperPaint(x,y);
  const helmet=(Math.hypot((x-430)/227,(y-644)/192)-1)*190;
  const body=Math.max(190-x,x-705,751-y);
  const clearance=Math.min(613-Math.hypot(x-624,y-623),Math.hypot(x-1147,y+6)-620,
    Math.hypot(x-250,y-289)-93,helmet,body,828+.14*x-y);
  let weight=clamp(clearance/12,0,1);
  for(const [cx,cy,r] of inkStars){
    if(Math.abs(x-cx)<r+4 && Math.abs(y-cy)<r+4)
      weight*=clamp((Math.max(Math.abs(x-cx),Math.abs(y-cy))-r)/4,0,1);
  }
  return blend(clean,pixel(x,y),weight);
});

// The ground under the astronaut is a registered detail. The rest of the
// lunar sphere needs continuous selenographic color, including both poles.
let seed=2847;
function random(){ seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; }
const basins=Array.from({length:110},()=>{
  const longitude=random()*Math.PI*2, y=random()*2-1, r=Math.sqrt(1-y*y);
  return {x:r*Math.cos(longitude),y,z:r*Math.sin(longitude),radius:.021+.155*random()**2};
});
await bake("lunar-surface",1536,768,(u,v)=>{
  const phi=u*Math.PI*2,theta=v*Math.PI;
  const x=-Math.cos(phi)*Math.sin(theta),y=Math.cos(theta),z=Math.sin(phi)*Math.sin(theta);
  const flecks=soilFines(420*(x+.39*z),420*(y-.44*z));
  const grain=(flecks[0]*.32+flecks[1]*.50+flecks[2]*.18-185)*.47;
  const maria=Math.sin(5*x+1.2*Math.sin(4*y))+.68*Math.cos(5*z+1.8*y)+.17*Math.sin(16*x+10*y);
  let value=188-43*clamp((maria-.01)*1.43,0,1)+grain;
  for(const crater of basins){
    const dx=x-crater.x,dy=y-crater.y,dz=z-crater.z;
    const d=(dx*dx+dy*dy+dz*dz)/(crater.radius*crater.radius);
    if(d>1.60)continue;
    const r=Math.sqrt(d);
    const light=(dy-.52*dx+.20*dz)/crater.radius;
    value-=16*Math.max(0,1-d);
    value+=Math.exp(-(((r-.84)/.16)**2))*(10+35*light);
  }
  return [clamp(value+12+(flecks[0]-flecks[2]-24)*.17,0,255),clamp(value+4,0,255),clamp(value-9,0,255)];
});

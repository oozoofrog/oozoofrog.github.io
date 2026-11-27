// Source rectangles use pixel coordinates in the uncropped painting. Keep the
// black silhouettes, stars, seams and neighboring materials out of the swatches.
import sharp from "sharp";

const {data,info}=await sharp("public/assets/images/lunar-journal.webp")
  .removeAlpha().raw().toBuffer({resolveWithObject:true});
const regions={
  skin:[[329,730,48,34],[421,666,45,34],[461,646,31,34]],
  cream:[[498,695,50,40],[546,685,38,41],[346,660,34,44]],
  linen:[[400,920,68,66],[407,851,59,40],[559,838,54,54],[385,948,56,48]],
  metal:[[224,825,26,60],[237,847,23,55],[283,849,23,56]],
  graphite:[[519,1074,23,29],[623,1062,23,36],[526,1060,28,31]],
  ochre:[[220,232,57,47],[255,264,48,60],[209,296,47,41]],
  ocean:[[608,115,70,64],[657,177,58,63],[917,390,65,57]],
  land:[[767,76,53,41],[880,145,50,51],[1106,368,46,48]],
  cloud:[[860,168,46,45],[909,197,44,43],[1029,316,43,45]],
  glass:[[279,565,35,41],[295,550,46,37],[363,516,39,44]],
  paper:[[390,318,112,118],[693,575,135,105],[769,750,118,110]],
  soil:[[699,1006,80,70],[813,1014,89,70],[864,1051,75,51],[697,1126,70,53]],
};

export const pigmentSize=192;
const tiles=new Map();

// Cut across the overlap where adjoining RGB pixels disagree least. Each
// successive cut position may move by one texel, keeping the cut connected.
function seam(length,width,cost){
  const total=new Float64Array(length*width),prev=new Int16Array(total.length);
  for(let y=0;y<length;y++)for(let x=0;x<width;x++){
    const k=y*width+x;
    let near=x;
    if(y)for(let i=Math.max(0,x-1);i<=Math.min(width-1,x+1);i++)
      if(total[k-width+i-x]<total[k-width+near-x])near=i;
    total[k]=cost(x,y)+(y?total[(y-1)*width+near]:0);
    prev[k]=near;
  }
  const cuts=new Int16Array(length),last=(length-1)*width;
  let end=0;
  for(let x=1;x<width;x++)if(total[last+x]<total[last+end])end=x;
  for(let y=length-1;y>=0;y--){cuts[y]=end;end=prev[y*width+end];}
  return cuts;
}

export function pigmentTile(name){
  if(tiles.has(name))return tiles.get(name);
  const rects=regions[name],size=pigmentSize;
  const step=rects.every(r=>Math.min(r[2],r[3])>=40)?32:16;
  const overlap=step===32?8:6,block=step+overlap;
  const out=Buffer.alloc(size*size*3);
  let seed=3157+Object.keys(regions).indexOf(name);
  function random(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed*n/4294967296);}
  for(let y=0;y<size;y+=step)for(let x=0;x<size;x+=step){
    const dest=(i,j)=>3*(((y+j)%size)*size+(x+i)%size);
    const left=x>0,top=y>0,right=x+step===size,bottom=y+step===size;
    let sx=0,sy=0,best=Infinity,bx=0,by=0;
    function error(i,j){
      const a=dest(i,j),b=3*((sy+j)*info.width+sx+i);
      return (out[a]-data[b])**2+(out[a+1]-data[b+1])**2+(out[a+2]-data[b+2])**2;
    }
    for(let n=0;n<28;n++){
      const [rx,ry,w,h]=rects[random(rects.length)];
      sx=rx+random(w-block+1);sy=ry+random(h-block+1);
      let sum=0;
      if(name==="linen" || name==="soil" || name==="metal"){
        // A dark fold or rock edge must not turn into a repeated outline.
        const floor=name==="linen"?135:name==="metal"?69:113;
        for(let j=0;j<block;j+=2)for(let i=0;i<block;i+=2){
          const k=3*((sy+j)*info.width+sx+i);
          sum+=15*Math.max(0,floor-data[k])**2;
          if(name==="metal")sum+=9*Math.max(0,data[k]-data[k+2]-24)**2;
        }
      }
      for(let j=0;j<block;j+=3)for(let i=0;i<block;i+=3)
        if((left&&i<overlap)||(top&&j<overlap)||(right&&i>=step)||(bottom&&j>=step))sum+=error(i,j);
      if(sum<best){best=sum;bx=sx;by=sy;}
    }
    sx=bx;sy=by;
    const west=left&&seam(block,overlap,error);
    const north=top&&seam(block,overlap,(j,i)=>error(i,j));
    const east=right&&seam(block,overlap,(i,j)=>error(step+i,j));
    const south=bottom&&seam(block,overlap,(j,i)=>error(i,step+j));
    for(let j=0;j<block;j++)for(let i=0;i<block;i++){
      if((west&&i<west[j])||(north&&j<north[i])||(east&&i>=step+east[j])||(south&&j>=step+south[i]))continue;
      const b=3*((sy+j)*info.width+sx+i),a=dest(i,j);
      out[a]=data[b];out[a+1]=data[b+1];out[a+2]=data[b+2];
    }
  }
  tiles.set(name,out);
  return out;
}

export function pigmentSampler(name){
  const data=pigmentTile(name),s=pigmentSize;
  return (x,y)=>{
    const i=((Math.round(x)%s+s)%s+s*((Math.round(y)%s+s)%s))*3;
    return [data[i],data[i+1],data[i+2]];
  };
}

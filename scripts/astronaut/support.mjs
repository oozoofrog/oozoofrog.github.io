// Project a surface along the painting's vertical axis. At each (x, depth),
// retain the lower cheek or the upper trouser surface, in painting pixels.
export function supportHeight(point, underside) {
  const rows=new Map();
  function triangle(a,b,c){
    const dx=b[0]-a[0],dz=b[2]-a[2],ex=c[0]-a[0],ez=c[2]-a[2],area=dx*ez-dz*ex;
    if(Math.abs(area)<1e-6)return;
    for(let z=Math.ceil(Math.min(a[2],b[2],c[2]));z<=Math.max(a[2],b[2],c[2]);z++){
      let row=rows.get(z);
      if(!row){row=new Map();rows.set(z,row);}
      for(let x=Math.ceil(Math.min(a[0],b[0],c[0]));x<=Math.max(a[0],b[0],c[0]);x++){
        const u=((x-a[0])*ez-(z-a[2])*ex)/area,v=(dx*(z-a[2])-dz*(x-a[0]))/area;
        if(u<0||v<0||u+v>1)continue;
        const height=a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]);
        const old=row.get(x);
        if(old===undefined || (underside?height>old:height<old))row.set(x,height);
      }
    }
  }
  let last;
  for(let j=0;j<=64;j++){
    const row=Array.from({length:97},(_,i)=>point(i/96,j/64));
    if(last)for(let i=0;i<96;i++){
      triangle(last[i],row[i],last[i+1]);triangle(last[i+1],row[i],row[i+1]);
    }
    last=row;
  }
  return (x,z)=>rows.get(Math.round(z))?.get(Math.round(x));
}

// Source and target coordinates in the 1254 px portrait. The first pair is
// measured on the projected sculpt, the second on the original painting.
// Apply one smooth warp to the entire head, including each eyelid pose.
const marks=[
  [403,652,410,648],[560,587,554,573],       // pupils
  [480,659,494,637],[517,645,521,626],       // nostrils
  [307,619,327,632],[360,595,377,601],[426,591,447,610],
  [447,555,468,579],[480,535,503,546],[520,537,532,540],
  [278,687,306,685],[269,746,291,746],[310,780,329,792],
  [370,767,387,783],[427,746,440,742],
  [588,635,585,633],[604,665,606,663],[604,708,602,708],
  [554,780,553,778],[491,802,491,803],[430,798,430,799],
];
const radius=44;
const kernel=(x,y)=>Math.exp(-(x*x+y*y)/(2*radius*radius));
// Solve once for overlapping Gaussian offsets instead of accumulating the
// corrections at nearby landmarks. The displacement vanishes off the face.
const n=marks.length;
const rows=marks.map(([x,y,tx,ty],i)=>[
  ...marks.map(([cx,cy],j)=>kernel(x-cx,y-cy)+(i===j?.006:0)),tx-x,ty-y
]);
for(let i=0;i<n;i++){
  let pick=i;
  for(let j=i+1;j<n;j++)if(Math.abs(rows[j][i])>Math.abs(rows[pick][i]))pick=j;
  [rows[i],rows[pick]]=[rows[pick],rows[i]];
  const divisor=rows[i][i];
  for(let k=i;k<n+2;k++)rows[i][k]/=divisor;
  for(let j=0;j<n;j++)if(j!==i){
    const factor=rows[j][i];
    for(let k=i;k<n+2;k++)rows[j][k]-=factor*rows[i][k];
  }
}
const step=3,x0=169,y0=430,cols=194,lines=163;
const offsets=new Float32Array(cols*lines*2);
for(let j=0;j<lines;j++)for(let i=0;i<cols;i++){
  const at=2*(j*cols+i),x=x0+i*step,y=y0+j*step;
  for(let k=0;k<n;k++){
    const w=kernel(x-marks[k][0],y-marks[k][1]);
    offsets[at]+=w*rows[k][n];offsets[at+1]+=w*rows[k][n+1];
  }
}
export function fitFace(x,y,z){
  const u=(x-x0)/step,v=(y-y0)/step,i=Math.floor(u),j=Math.floor(v);
  if(i<0||j<0||i>=cols-1||j>=lines-1)return [x,y,z];
  const f=u-i,g=v-j,index=2*(j*cols+i);
  function offset(k){
    const a=index+k,b=a+2*cols;
    return (1-g)*((1-f)*offsets[a]+f*offsets[a+2])+g*((1-f)*offsets[b]+f*offsets[b+2]);
  }
  return [x+offset(0),y+offset(1),z];
}

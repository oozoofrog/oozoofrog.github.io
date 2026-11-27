// Model both cheeks in one anatomical frame. The lateral axis runs through the
// two eye centres in the painting; turning the model cannot detach the jaw.
import { MathUtils, Vector3 } from 'three';
import {fitFace} from "./face-landmarks.mjs";
import {headPaint} from "./turnaround.mjs";
import {pigmentSampler} from './pigment.mjs';

const lateral = new Vector3(143, 79, -119).normalize();
const forward = new Vector3(.51,.38,.77);
// Keep the eye landmarks fixed. The muzzle rises gently while the eyes look
// higher, so the underside of the chin does not hide the nose in profile.
forward.addScaledVector(lateral,-forward.dot(lateral)).normalize()
  .applyAxisAngle(lateral,MathUtils.degToRad(19));
const up = new Vector3().crossVectors(forward,lateral).normalize();
const eyeMid = new Vector3(451,-625,59);
const spacing = Math.hypot(143,79,119)/2;
const centre = eyeMid.clone().addScaledVector(up,-65).addScaledVector(forward,-64);
const smooth = (a,b,x)=>MathUtils.smoothstep(x,a,b);
const mix = MathUtils.lerp;

function screen(x,y,z){
  return [
    centre.x+lateral.x*x+up.x*y+forward.x*z,
    -(centre.y+lateral.y*x+up.y*y+forward.y*z),
    centre.z+lateral.z*x+up.z*y+forward.z*z,
  ];
}
function ellipsoid(x,y,z,rx,ry,rz){
  return (Math.hypot(x/rx,y/ry,z/rz)-1)*Math.min(rx,ry,rz);
}
function join(a,b,r){
  const h=Math.max(r-Math.abs(a-b),0);
  return Math.min(a,b)-h*h/(4*r);
}
function headDistance(x,y,z){
  const skull=ellipsoid(x,y-1,z+13,171,88,138);
  const jaw=ellipsoid(x,y+26,z-28,150,73,134);
  const brow=ellipsoid(Math.abs(x)-spacing+6,y-64,z-39,67,70,61);
  return join(join(skull,jaw,22),brow,23);
}
function direction(u,t){
  const a=(u-.5)*2*Math.PI,b=t*Math.PI;
  return [Math.sin(a)*Math.sin(b),Math.cos(b),Math.cos(a)*Math.sin(b)];
}
function mouthHeight(a){
  return -17 - 6*Math.sin(a)**2 + 10*smooth(.7,1.7,Math.abs(a));
}
function nostril(x,y){
  return Math.hypot((Math.abs(x)-23)/6.1,(y-39)/5.2);
}
function headPoint(u,t){
  const [dx,dy,dz]=direction(u,t);
  let low=0,high=252;
  for(let i=0;i<13;i++){
    const r=(low+high)*.5;
    if(headDistance(r*dx,r*dy,r*dz)<0) low=r;
    else high=r;
  }
  const a=(u-.5)*2*Math.PI;
  const x=dx*low, y=dy*low, z=dz*low;
  const lip=lipDistance(a,x,y,z);
  const corner=1-smooth(1.62,2.13,Math.abs(a));
  const muzzle = corner * Math.max(0, dz);
  const r = low - corner * 4.2 * Math.exp(-(lip*lip)/27)
    + muzzle * 4.2 * Math.exp(-((lip+6)**2)/73);
  const inset=z>80?2.5*Math.exp(-2*nostril(x,y)**2):0;
  return [(r-inset)*dx,(r-inset)*dy,(r-inset)*dz];
}

const skinPaint=pigmentSampler("skin"),creamPaint=pigmentSampler("cream");

function blend(a,b,t){return a.map((v,i)=>mix(v,b[i],t));}
function shade(color,amount){return color.map(v=>MathUtils.clamp(v*amount,0,255));}
// Image-space guide for the mouth that is visible in the original three-quarter view.
const lipGuide = [
  [305,783],[350,792],[385,784],[419,762],[445,737],[462,721],[477,707],
  [485,698],[490,692],[500,684],[510,676],[520,669],[530,664],[540,659],
  [550,657],[560,655],[568,654],[575,656],[589,658],[604,668],[625,680],
];
function paintedLip(x) {
  for(let i=1; i<lipGuide.length; i++){
    const [x1,y1]=lipGuide[i];
    if(x<=x1){
      const [x0,y0]=lipGuide[i-1];
      return mix(y0,y1,MathUtils.clamp((x-x0)/(x1-x0),0,1));
    }
  }
  return lipGuide.at(-1)[1];
}
function mouthFacing(x,y,z) {
  return smooth(-.20,.36,lateral.z*x/171+up.z*y/90+forward.z*z/140);
}
function projectMuzzle(x,y,z) {
  const [px,py,pz]=faceToPainting(x,y,z);
  // The cheek rests above the collar. Its raised left corner and round chin
  // have different silhouettes in the reference three-quarter view.
  const cheekLift=(18+29*smooth(313,397,px))*(1-smooth(404,481,px));
  const chinDrop=12*smooth(458,503,px)*(1-smooth(529,581,px));
  const noseInset=20*smooth(553,630,px)*smooth(593,655,py)*(1-smooth(676,730,py));
  return [px-noseInset,py+(chinDrop-cheekLift)*smooth(738,815,py),pz];
}
function lipDistance(angle,x,y,z) {
  // Both mouth corners occupy the same latitude in the head's own frame.
  // Transfer the painted near cheek to the far cheek across the sagittal plane.
  const near=-Math.abs(x);
  const [sx,sy]=projectMuzzle(near,y,z);
  const weight=mouthFacing(near,y,z)*(1-smooth(1.33,1.95,Math.abs(angle)));
  return mix(y-mouthHeight(angle),paintedLip(sx)-sy,weight);
}
const head={
  name:'Continuous head, cheeks and throat',
  point:headPoint,
  project:projectMuzzle,
  color(u,t,p,pixel){
    const [x,y,z]=p,a=(u-.5)*2*Math.PI,angle=Math.abs(a);
    const [sx,sy]=screen(x,y,z);
    let green=headPaint(x,y,z,false,skinPaint(x+.49*z,-y+.23*z));
    const observed=pixel(sx,sy);
    // Only borrow green brushwork for green skin. Ink contours belong to
    // individual features and should never stretch onto the opposite cheek.
    const greenMask=smooth(20,51,observed[1]-observed[2])*
      (1-smooth(8,25,observed[0]-observed[1]))*
      smooth(53,107,observed[1]);
    const facing=smooth(.18,.8,(lateral.z*x/171+up.z*y/90+forward.z*z/140));
    green=blend(green,observed,.80*greenMask*facing*(1-smooth(741,758,sy)));
    const lip=lipDistance(a,x,y,z);
    const throat=1-smooth(-2.4,2.4,lip+88*smooth(1.24,2.42,angle));
    const cream=throat>0?headPaint(x,y,z,true,creamPaint(x+.49*z,-y+.23*z)):green;
    let color=blend(green,cream,throat);
    const corner=1-smooth(1.38,1.85,angle);
    const crease=(1-smooth(.20,2.1,Math.abs(lip)))*corner;
    color=blend(color,[67,59,38],crease*.83);
    // The two nostrils sit on the upper muzzle either side of its midline.
    if(z>80) color=blend(color,[36,34,23],1-smooth(.75,1.22,nostril(x,y)));
    const light=1+.036*y/100+.028*z/145-.052*throat*(1-smooth(-92,-47,y));
    return shade(color,light);
  },
};

// A spherical oval cut into the green temple defines both the white of the
// eye and the eyelid travel. Its sides meet at two fixed corner points.
const lidSpan=1.45;
function eyeWindow(side,x,y,z){
  const heading=side*.42,lon=Math.atan2(x,z)-heading;
  const arch=Math.sqrt(Math.max(0,1-(lon/lidSpan)**2));
  const lat=Math.asin(MathUtils.clamp(y,-1,1));
  return Math.min(lidSpan-Math.abs(lon),1.10*arch+.06-lat,lat+.96*arch-.06);
}
function eyePoint(side,x,y,z,offset=0){
  const rim=1.4*Math.exp(-((eyeWindow(side,x,y,z)+.02)**2)/.007)+offset;
  return [side*spacing+(57+rim)*x,65+(63+rim)*y,64+(56+rim)*z];
}
function eye(side){
  return {name:side<0?'Near eye':'Far eye',
    point:(u,t)=>eyePoint(side,...direction(u,t)),
    color(u,t,p,pixel){
      const [x,y,z]=direction(u,t);
      const white=pixel(349+14*x+5*z,667+16*y-3*x);
      const opening=eyeWindow(side,x,y,z);
      const skin=skinPaint(p[0]+.49*p[2],-p[1]+.23*p[2]);
      return shade(blend(skin,white,smooth(-.025,.025,opening)),.98+.025*y+.02*z);
    }};
}
function pupil(side){
  // Radial distances from the ink centre, measured clockwise every 11.25°.
  const [cx,cy,radii]=side<0?[410,648,[29,32,34,35,38,38,36,33,30,28,27,25,24,24,24,27,28,32,34,36,38,41,39,36,32,30,28,27,27,27,26,28]]:
    [554,574,[23,25,28,34,38,35,30,27,21,20,19,18,17,18,18,19,21,23,28,33,37,35,36,34,30,24,23,21,20,18,19,20]];
  function paintedPoint(u,t){
    const turn=((1-u)%1)*radii.length,i=Math.floor(turn),a=2*Math.PI*u;
    const r=t*mix(radii[i],radii[(i+1)%radii.length],turn-i);
    return [cx+r*Math.cos(a),cy-r*Math.sin(a)];
  }
  function globe(lon,lat){
    const c=Math.cos(lat);
    return eyePoint(side,c*Math.sin(lon),Math.sin(lat),c*Math.cos(lon),1.15);
  }
  // Lift the traced pupil onto the visible side of the curved eye. Solve at
  // mesh vertices, then interpolate the same patch for the texture bake.
  const around=96,rows=24,grid=[];
  const project=(lon,lat)=>faceToPainting(...globe(lon,lat));
  for(let j=0;j<=rows;j++)for(let i=0;i<=around;i++){
    const [x,y]=paintedPoint(i/around,j/rows);
    let [lon,lat]=j?grid[(j-1)*(around+1)+i]:[0,.22];
    for(let k=0;k<14;k++){
      const [sx,sy]=project(lon,lat),dx=x-sx,dy=y-sy;
      if(dx*dx+dy*dy<.015)break;
      const h=.001,[ux,uy]=project(lon+h,lat),[vx,vy]=project(lon,lat+h);
      const ax=(ux-sx)/h,ay=(uy-sy)/h,bx=(vx-sx)/h,by=(vy-sy)/h;
      const det=ax*by-ay*bx;
      if(det>=-.1)break;
      const du=MathUtils.clamp((by*dx-bx*dy)/det,-.14,.14);
      const dv=MathUtils.clamp((ax*dy-ay*dx)/det,-.14,.14);
      lon+=du;lat+=dv;
    }
    grid.push([lon,lat]);
  }
  return {name:side<0?'Near pupil':'Far pupil',segments:[around,rows],surfaceDetail:true,inkPatch:{x:cx-46,y:cy-46,size:92,at:paintedPoint},
    point(u,t){
      const col=u*around,row=t*rows,i=Math.min(around-1,Math.floor(col)),j=Math.min(rows-1,Math.floor(row));
      const k=j*(around+1)+i,a=grid[k],b=grid[k+1],c=grid[k+around+1],d=grid[k+around+2];
      const coord=n=>mix(mix(a[n],b[n],col-i),mix(c[n],d[n],col-i),row-j);
      return globe(coord(0),coord(1));
    }};
}
function eyelid(side,lower=false){
  // Successive caps travel on the surface of the globe. Multiple poses keep
  // the eyelid outside the raised pupil throughout the closing arc.
  function blink(u,t,closed){
    const lon=(2*u-1)*lidSpan;
    const arch=Math.sqrt(Math.max(0,1-(lon/lidSpan)**2));
    const high=.06+(lower?mix(-.94,-.27,closed):1.22)*arch;
    const low=.06+(lower?-1.09:mix(1.045,-.28,closed))*arch;
    const lat=mix(high,low,t),az=side*.42+lon,c=Math.cos(lat);
    return eyePoint(side,c*Math.sin(az),Math.sin(lat),c*Math.cos(az),lower?3.05:3.25);
  }
  const name=(side<0?"Near ":"Far ")+(lower?"lower":"upper")+" eyelid";
  return {name,segments:[64,lower?10:20],side,surfaceDetail:true,blink,
    point:(u,t)=>blink(u,t,0),
    color(u,t){
      // Paint in the exposed pose so the brush marks retain their shape
      // when the narrow resting rim unfolds across the eye.
      const p=blink(u,t,1);
      const c=skinPaint(p[0]+.37*p[2],-p[1]+.24*p[2]);
      const edge=lower?1-t:t;
      return blend(c,[57,53,34],smooth(.955,.985,edge)*(.76+.12*Math.cos(58*u)));
    }};
}
// Sweep the lip seam along the actual indented muzzle. The short broad
// strokes at each end sit on the cheek even in profile.
const lipRows=new Map();
const lipSeam={
  name:"Closed mouth crease",segments:[96,8],surfaceDetail:true,project:projectMuzzle,
  point(u,t){
    const angle=(2*u-1)*1.57,longitude=.5+angle/(2*Math.PI);
    let latitude=lipRows.get(u);
    if(latitude===undefined){
      let low=.29,high=.82;
      for(let i=0;i<15;i++){
        const mid=(low+high)/2,p=headPoint(longitude,mid);
        if(lipDistance(angle,...p)>0)low=mid;else high=mid;
      }
      latitude=(low+high)/2;lipRows.set(u,latitude);
    }
    const width=(.0048+.0015*Math.sin(u*31)+.003*Math.exp(-(((Math.abs(angle)-1.48)/.07)**2)))*
      smooth(0,.022,Math.min(u,1-u));
    const p=headPoint(longitude,latitude+(2*t-1)*width);
    const lift=1+2.4/Math.hypot(...p);
    return p.map(v=>v*lift);
  },
  color(u,t,p,pixel){
    const ink=39+8*Math.sin(23*u)+7*Math.cos(57*u+2*t);
    const [px]=projectMuzzle(...p);
    const observed=pixel(px,paintedLip(px)+(t-.5)*3);
    const native=mouthFacing(...p)*(1-smooth(1.2,1.6,Math.abs((2*u-1)*1.57)));
    return blend([ink+9,ink+6,ink-7],observed,native*.90);
  },
};
export const facialParts=[head,lipSeam,...[-1,1].flatMap(s=>[eye(s),pupil(s),eyelid(s),eyelid(s,true)])];
// Enlarge the sculpt about the chin. Keep the texture addresses in the original painting.
export function faceToPainting(x,y,z){
  const [px,py,pz]=screen(x,y,z);
  const browDrop=(1-smooth(615,738,py))*(3+7*smooth(405,535,px))
    + 16*smooth(432,501,px)*(1-smooth(562,640,py));
  return fitFace(437+(px-436)*1.10,py+(py-685)*.075+3-8*smooth(690,791,py)+browDrop,pz*.97-4);
}

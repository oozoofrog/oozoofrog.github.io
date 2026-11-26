// Model both cheeks in one anatomical frame. The lateral axis runs through the
// two eye centres in the painting; turning the model cannot detach the jaw.
import { MathUtils, Vector3 } from 'three';

const lateral = new Vector3(143, 79, -119).normalize();
const forward = new Vector3(.51,.38,.77);
forward.addScaledVector(lateral,-forward.dot(lateral)).normalize();
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
  return -12-22*Math.sin(a*.84)**2;
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
  const lip=dy*low-mouthHeight(a);
  const corner=1-smooth(1.62,2.13,Math.abs(a));
  const r=low-corner*2.2*Math.exp(-(lip*lip)/26);
  return [r*dx,r*dy,r*dz];
}

const pigments={
  green: [330,739,30,20],
  cream: [510,716,29,23],
  white: [345,666,25,25],
  ink: [397,629,11,12],
};
// Use a small patch of real paint for each anatomical surface. The brushwork
// continues through the profile with no sky, gloves or second pupil in it.
function dab(pixel, pigment, x,y,z){
  const [px,py,w,h]=pigments[pigment];
  const s=.5+.5*Math.sin(.081*x+.031*y+.053*z+.7*Math.sin(y*.031));
  const t=.5+.5*Math.sin(.047*y-.034*z+.043*x+.5*Math.cos(x*.047));
  return pixel(px+w*s,py+h*t);
}
function blend(a,b,t){return a.map((v,i)=>mix(v,b[i],t));}
function shade(color,amount){return color.map(v=>MathUtils.clamp(v*amount,0,255));}
const head={
  name:'Continuous head, cheeks and throat',
  point:headPoint,
  color(u,t,p,pixel){
    const [x,y,z]=p,a=(u-.5)*2*Math.PI,angle=Math.abs(a);
    const lip=y-mouthHeight(a);
    const throat=1-smooth(-5,4,lip+40*smooth(1.1,2.85,angle));
    const [sx,sy]=screen(x,y,z);
    let green=dab(pixel,'green',x,y,z);
    const observed=pixel(sx,sy);
    // Only borrow green brushwork for green skin. Ink contours belong to
    // individual features and should never stretch onto the opposite cheek.
    const greenMask=smooth(20,51,observed[1]-observed[2])*
      (1-smooth(8,25,observed[0]-observed[1]))*
      smooth(53,107,observed[1]);
    const facing=smooth(.18,.8,(lateral.z*x/171+up.z*y/90+forward.z*z/140));
    green=blend(green,observed,.80*greenMask*facing*(1-smooth(741,758,sy)));
    let color=blend(green,dab(pixel,'cream',x,y,z),throat);
    // The mouth corners fade into the same skin on either cheek.
    const line=(1-smooth(1,3.2,Math.abs(lip+.65*Math.sin(10*a))))*(1-smooth(1.60,2.10,angle));
    color=blend(color,[57,51,34],line*.91);
    // The two nostrils sit on the upper muzzle either side of its midline.
    const nose=Math.hypot((Math.abs(x)-25)/4.8,(y-21)/4.2);
    if(z>80) color=blend(color,[44,43,29],1-smooth(.65,1.2,nose));
    const light=1+.036*y/100+.028*z/145-.052*throat*(1-smooth(-92,-47,y));
    return shade(color,light);
  },
};

function eye(side){
  return {
    name:side<0?'Near eye and lid':'Far eye and lid',
    point(u,t){
      const [x,y,z]=direction(u,t);
      return [side*spacing+57*x,65+63*y,64+56*z];
    },
    color(u,t,p,pixel){
      const [x,y,z]=direction(u,t);
      const eyeWhite=dab(pixel,'white',...p);
      // Wrap the exposed sclera toward the temple; a green lid encloses
      // the back of each globe. The iris direction is shared by both eyes.
      const opening=.53*side*x+.91*z+.09*y;
      let color=blend(dab(pixel,'green',...p),eyeWhite,smooth(-.14,-.065,opening));
      const lash=1-smooth(.012,.046,Math.abs(opening+.09));
      color=blend(color,[87,84,49],lash*.5);
      const pupil=Math.hypot((x-.018*side)/.395,(y-.115)/.565);
      if(z>0){
        color=blend(color,dab(pixel,'ink',...p),1-smooth(.95,1.035,pupil));
        const glint=Math.hypot((x+.135)/.064,(y-.41)/.071);
        color=blend(color,[246,238,207],1-smooth(.65,1.1,glint));
      }
      return shade(color,.97+.025*y+.033*z);
    }
  };
}
export const facialParts=[head,eye(-1),eye(1)];
export {screen as faceToPainting};

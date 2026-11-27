import * as T from "three";
import {animateEyelids} from "./portrait-motion";
import {createSceneInk} from "./scene-ink";
import { createLunarScene, elevation, groundHeight, paintingPoint } from "./lunar-scene";

import {paintingScale} from "./painting-frame.mjs";
import {createActivities} from "./lunar-activities";
import type {DrawnStar} from "./loading-stars";

import {createLunarSky, skyNotes, type SkyPlace} from "./lunar-sky";

export async function mountPortrait(root: HTMLElement, arrivalStars:readonly DrawnStar[]=[]) {
  const canvas = root.querySelector("canvas")!;
  const stage=root.querySelector<HTMLElement>(".stage")!;
  const illustrationSpace=root.closest(".profile")?.querySelector<HTMLElement>("[data-illustration-space]");
  const registration=root.querySelector<HTMLElement>("[data-registration]")!;
  const disc = registration.querySelector<HTMLElement>(".arrival-disc")!;
  const poster = disc.querySelector("img")!;
  const message = root.querySelector<HTMLElement>('[role="status"]')!;
  const {scene,frog,moon,earth,starField,paints} = await createLunarScene();
  const blink=animateEyelids(frog);
  const activities=createActivities(paints);
  const sky=createLunarSky(paints,arrivalStars);
  scene.add(sky.group);
  scene.add(activities.group);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let automatic=!reduced.matches;
  let inSight=true;
  const renderer = new T.WebGLRenderer({canvas,antialias:true});
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  const drawInk=createSceneInk(scene,renderer);
  const camera=new T.OrthographicCamera(-2,2,2,-2,.04,85);
  const target=paintingPoint(450,775,0);
  camera.position.set(0,Math.sin(elevation),Math.cos(elevation)).multiplyScalar(8).add(target);
  camera.lookAt(target);camera.updateMatrixWorld();
  const screenUp=new T.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  const earthY=earth.position.y,moonY=moon.position.y;
  let width=1,height=1,frame=0,last=0,time=0,blinkStart=-10;
  let contextLost=false;
  function draw(){
    if(contextLost)return;
    renderer.render(scene,camera);drawInk(camera);
  }
  function parallax(){
    const range=document.documentElement.scrollHeight-window.innerHeight;
    const progress=automatic&&range>0?T.MathUtils.clamp(window.scrollY/range,0,1):0;
    // At full scroll the far stars shift by 1.5% of the illustration width.
    const shift=-progress*1254*paintingScale*.015;
    starField.position.copy(screenUp).multiplyScalar(shift);
    sky.group.position.copy(screenUp).multiplyScalar(shift*.8);
    earth.position.y=earthY+shift*.6;
    moon.position.y=moonY+shift*.35;
  }
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function resize(){
    const box=stage.getBoundingClientRect();
    width=Math.max(1,box.width);height=Math.max(1,box.height);
    if(illustrationSpace?.offsetHeight){
      const r=illustrationSpace.getBoundingClientRect();
      const centre=Math.round(T.MathUtils.clamp(r.top+window.scrollY+r.height/2,height*.29,height*.8));
      stage.style.setProperty("--mobile-art-centre",centre+"px");
    }
    const rect=registration.getBoundingClientRect();
    const units=1254*paintingScale/Math.max(1,rect.height);
    const px=rect.left-box.left+rect.width/2,py=rect.top-box.top+rect.height/2;
    const x=(627-450)*paintingScale,y=(775-627)*paintingScale;
    camera.left=x-px*units;camera.right=x+(width-px)*units;
    camera.top=y+py*units;camera.bottom=y-(height-py)*units;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(Math.round(width),Math.round(height),false);
    parallax();draw();
  }
  const names={earth:"지구",moonlet:"작은 달",frog:"우주개구리",comet:"혜성",rover:"월면차",satellite:"인공위성",prints:"달의 흙",star:"별똥별"};
  type Discovery = SkyPlace | keyof typeof names;
  function label(id:Discovery){
    return id in skyNotes?skyNotes[id as SkyPlace][0]:names[id as keyof typeof names];
  }
  const objects=new Map<T.Object3D,Discovery>([
    [frog,"frog"],[earth,"earth"],[moon,"moonlet"],[activities.comet,"comet"],[activities.rover.chassis,"rover"],
    [activities.relay,"satellite"],[activities.reply,"satellite"],[activities.trail,"prints"],
  ]);
  for(const [key,node] of Object.entries(sky.destinations))objects.set(node,key as SkyPlace);
  const discoveries:Discovery[]=["frog","earth","moonlet","satellite","rover","comet","prints","star","sun","binary","blackHole","constellation","rocket","visitor"];
  let selected:Discovery="frog";
  function discover(id:Discovery,point?:T.Vector3){
    selected=id;
    switch(id){
      case "frog":
        blinkStart=time;blink(3.7);message.textContent="개구리가 눈을 깜박입니다.";break;
      case "prints":
        activities.imprint(point??new T.Vector3(.9,groundHeight(.9,1),1),0);
        message.textContent="달 표면에 발자국이 남았습니다.";break;
      case "satellite":
        activities.sendSignal(automatic);message.textContent="탐사선이 신호에 응답했습니다.";break;
      case "rover":
        activities.rover.collect(automatic);message.textContent=`월면차가 모은 표본 ${activities.rover.samples}개`;break;
      case "moonlet":
      case "earth":
      case "comet":
      case "star":{
        const origin=point?.clone()??paintingPoint(790,400,0);
        if(!point && id==="comet")activities.comet.getWorldPosition(origin);
        if(!point && id==="moonlet")moon.getWorldPosition(origin);
        if(!point && id==="earth")origin.copy(paintingPoint(930,230,-5));
        origin.addScaledVector(camera.getWorldDirection(new T.Vector3()),id==="moonlet"?-.35:-.1);
        activities.shoot(origin,camera,automatic);message.textContent="별똥별이 지나갑니다.";break;
      }
      default:
        sky.react(id,time,automatic);message.textContent=skyNotes[id][1];
    }
    activities.update(0);draw();
  }
  const ray=new T.Raycaster();
  ray.params.Line.threshold=.035;
  function pick(x:number,y:number){
    const box=canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2(2*(x-box.left)/width-1,1-2*(y-box.top)/height),camera);
    const hits=ray.intersectObjects(scene.children,true);
    for(const hit of hits){
      let node:T.Object3D|null=hit.object,id:Discovery|undefined,visible=true;
      while(node){
        visible &&= node.visible;
        id??=objects.get(node);
        if(node.userData.lunarGround||node.userData.lunarRock)id??="prints";
        node=node.parent;
      }
      if(!visible)continue;
      if(id){discover(id,hit.point);return;}
      break;
    }
    discover("star",ray.ray.at(5,new T.Vector3()));
  }
  function tick(now:number){
    frame=0;
    if(!shouldAnimate())return;
    if(now-last>=32){
      const dt=Math.min((now-last)/1000,.10);
      time+=dt;sky.update(time);activities.update(dt);
      blink(time-blinkStart<.5?3.69+time-blinkStart:time);
      draw();
      last=now;
    }
    frame=requestAnimationFrame(tick);
  }
  function shouldAnimate(){
    return automatic&&!contextLost&&inSight&&!document.hidden;
  }
  function startTick(){
    if(!frame&&shouldAnimate()){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function setMotion(enabled:boolean){
    automatic=enabled;
    if(!enabled){stop();blink(0);}
    parallax();startTick();draw();
  }
  reduced.addEventListener("change",()=>setMotion(!reduced.matches));
  canvas.addEventListener("keydown",e=>{
    if(e.key===" "){e.preventDefault();if(!e.repeat)setMotion(!automatic);return;}
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      e.preventDefault();
      const index=discoveries.indexOf(selected)+(e.key==="ArrowRight"?1:-1);
      selected=discoveries[T.MathUtils.euclideanModulo(index,discoveries.length)];
      message.textContent=label(selected);return;
    }
    if(e.key==="Enter"){e.preventDefault();if(!e.repeat)discover(selected);return;}
  });
  window.addEventListener("blur",stop);window.addEventListener("focus",startTick);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else startTick();});
  let pointer:{id:number;x:number;y:number}|undefined;
  canvas.onpointerdown=e=>{
    if(e.isPrimary&&e.button===0)pointer={id:e.pointerId,x:e.clientX,y:e.clientY};
  };
  canvas.onpointermove=e=>{
    if(pointer?.id===e.pointerId&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>=6)pointer=undefined;
  };
  canvas.onpointerup=e=>{
    const tap=pointer?.id===e.pointerId&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)<6;
    pointer=undefined;
    if(tap)pick(e.clientX,e.clientY);
  };
  canvas.onpointercancel=canvas.onpointerleave=()=>{pointer=undefined;};
  const visibility=new IntersectionObserver(([entry])=>{
    inSight=entry.isIntersecting;if(inSight)startTick();else stop();
  });
  visibility.observe(stage);
  const observer=new ResizeObserver(resize);
  if(illustrationSpace?.parentElement)observer.observe(illustrationSpace.parentElement);
  window.addEventListener("scroll",()=>{
    if(!canvas.hidden&&automatic){parallax();if(!frame)draw();}
  },{passive:true});
  canvas.addEventListener("webglcontextlost",()=>{
    stop();contextLost=true;observer.disconnect();visibility.disconnect();
    canvas.hidden=true;disc.prepend(poster);
  });
  resize();
  if(renderer.getContext().isContextLost())return;
  observer.observe(stage);observer.observe(registration);startTick();
  canvas.hidden=false;
  if(disc.contains(document.activeElement))canvas.focus({preventScroll:true});
  stage.dataset.arriving="";
  if(!reduced.matches && typeof canvas.animate==="function"){
    const circle=disc.getBoundingClientRect();
    const box=canvas.getBoundingClientRect();
    const x=circle.left+circle.width/2-box.left;
    const y=circle.top+circle.height/2-box.top;
    const radius=Math.hypot(Math.max(x,box.width-x),Math.max(y,box.height-y))+1;
    const aperture=(r:number)=>`circle(${r}px at ${x}px ${y}px)`;
    const timing={duration:780,easing:"cubic-bezier(.32,0,.18,1)"};
    const reveal=canvas.animate([
      {clipPath:aperture(circle.width/2)}, {clipPath:aperture(radius)}
    ],timing);
    const dissolve=disc.animate([
      {opacity:1,scale:"1"}, {opacity:0,scale:"1.1"}
    ],{...timing,duration:440,fill:"forwards"});
    const finish=()=>{reveal.finish();dissolve.finish();};
    reduced.addEventListener("change",finish,{once:true});
    canvas.addEventListener("webglcontextlost",finish,{once:true});
    await reveal.finished;
    reduced.removeEventListener("change",finish);
    canvas.removeEventListener("webglcontextlost",finish);
    dissolve.cancel();
  }
  if(!contextLost)poster.remove();
  delete stage.dataset.arriving;
}

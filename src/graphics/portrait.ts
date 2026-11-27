import * as T from "three";
import {animateEyelids} from "./portrait-motion";
import {createSceneInk} from "./scene-ink";
import { createLunarScene, elevation, groundHeight, paintingPoint } from "./lunar-scene";

import {createActivities} from "./lunar-activities";
import type {DrawnStar} from "./loading-stars";

import {createLunarSky, skyNotes, type SkyPlace} from "./lunar-sky";

type View = "scene" | "flight";

export async function mountPortrait(root: HTMLElement, arrivalStars:readonly DrawnStar[]=[]) {
  const canvas = root.querySelector("canvas")!;
  const stage=root.querySelector<HTMLElement>(".stage")!;
  const illustrationSpace=root.closest(".profile")?.querySelector<HTMLElement>("[data-illustration-space]");
  const registration=root.querySelector<HTMLElement>("[data-registration]")!;
  const poster = root.querySelector<HTMLImageElement>("[data-registration] > img")!;
  const message = root.querySelector<HTMLElement>('[role="status"]')!;
  const {scene,frog,moon,earth,lunarCentre,paints} = await createLunarScene();
  const blink=animateEyelids(frog);
  const activities=createActivities(paints);
  const sky=createLunarSky(moon,activities.relay,lunarCentre,paints,arrivalStars);
  scene.add(sky.group);
  scene.add(activities.group);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let automatic=!reduced.matches;
  let inSight=true;
  const renderer = new T.WebGLRenderer({canvas,antialias:true});
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  const drawInk=createSceneInk(scene,renderer);
  const orbit=new T.OrthographicCamera(-2,2,2,-2,.04,85);
  const flight=new T.PerspectiveCamera(48,1,.04,86);
  flight.rotation.order="YXZ";
  const target=paintingPoint(450,775,0);
  const moonCentre=moon.getWorldPosition(new T.Vector3());
  const earthCentre=earth.getWorldPosition(new T.Vector3());
  const actorCentre=paintingPoint(439,713,0);
  const delta=new T.Vector3();
  let view:View="scene", heading=0, pitch=elevation, close=false;
  let width=1,height=1;
  const held=new Set<string>();
  let frame=0, last=0, time=0, earthAngle=0, earthGoal=0, blinkStart=-10;
  let contextLost=false;
  function draw(){
    if(contextLost)return;
    const camera=view==="flight"?flight:orbit;
    camera.updateMatrixWorld();
    renderer.render(scene,camera);
    drawInk(camera);
  }
  function positionOrbit(){
    // Give a completed turn the same camera and shadow coordinates as frame zero.
    const phase=T.MathUtils.euclideanModulo(heading+Math.PI,2*Math.PI)-Math.PI;
    const yaw=Math.abs(phase)<1e-10?0:phase;
    orbit.position.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch))
      .multiplyScalar(8).add(target);
    orbit.lookAt(target);
    const half=(close?423:627)*.0037;
    // Only the reference angle uses the off-centre composition of the painting.
    const framing=close?0:1-T.MathUtils.smoothstep(Math.abs(yaw),.02,1.22);
    const x=framing*(627-450)*.0037, y=framing*(775-627)*.0037;
    const frame=registration.getBoundingClientRect(),box=stage.getBoundingClientRect();
    const units=2*half/Math.max(1,frame.height);
    const px=frame.left-box.left+frame.width/2,py=frame.top-box.top+frame.height/2;
    orbit.left=x-px*units;orbit.right=x+(width-px)*units;
    orbit.top=y+py*units;orbit.bottom=y-(height-py)*units;
    orbit.updateProjectionMatrix();
  }
  function stop(){held.clear();cancelAnimationFrame(frame);frame=0;}
  function positionFlight(){
    // Leave the same margin for the text in orbit and on a guided visit.
    const illustration=registration.getBoundingClientRect();
    flight.setViewOffset(width,height,width/2-illustration.left-illustration.width/2,
      height/2-illustration.top-illustration.height/2,width,height);
  }
  function frameEarth(){
    const diameter=registration.getBoundingClientRect().width;
    const tangent=height/(Math.max(1,diameter)*Math.tan(T.MathUtils.degToRad(flight.fov/2)));
    const distance=earth.geometry.parameters.radius*Math.hypot(1,tangent);
    flight.position.set(0,0,1).applyQuaternion(orbit.quaternion).multiplyScalar(distance).add(earthCentre);
    flight.lookAt(earthCentre);
  }
  function alignIllustration(){
    if(!illustrationSpace?.offsetHeight)return false;
    const r=illustrationSpace.getBoundingClientRect();
    const centre=Math.round(T.MathUtils.clamp(r.top+r.height/2,height*.29,height*.80))+"px";
    if(stage.style.getPropertyValue("--mobile-art-centre")===centre)return false;
    stage.style.setProperty("--mobile-art-centre",centre);return true;
  }
  function resize(){
    const box=stage.getBoundingClientRect();
    width=Math.max(1,box.width);height=Math.max(1,box.height);
    const ratio=Math.min(devicePixelRatio,2);
    if(renderer.getPixelRatio()!==ratio)renderer.setPixelRatio(ratio);
    renderer.setSize(Math.round(width),Math.round(height),false);
    flight.aspect=width/height;
    alignIllustration();
    positionFlight();
    positionOrbit();
    if(visiting==="earth")frameEarth();
    draw();
  }
  type Discovery = SkyPlace | "earth" | "frog" | "comet" | "rover" | "prints" | "star";
  function label(id:Discovery){
    const local={earth:"지구",frog:"우주개구리",comet:"혜성",rover:"월면차",prints:"달의 흙",star:"별똥별"};
    return id in skyNotes?skyNotes[id as SkyPlace][0]:local[id as keyof typeof local];
  }
  const objects=new Map<T.Object3D,Discovery>([
    [frog,"frog"],[earth,"earth"],[activities.targets.comet,"comet"],[activities.targets.rover,"rover"],
    [activities.reply,"satellite"],[activities.trail,"landing"],
  ]);
  for(const [key,node] of Object.entries(sky.destinations))objects.set(node,key as SkyPlace);
  const discoveries:Discovery[]=["frog","earth","moonlet","satellite","rover","comet","prints","star","sun","binary","blackHole","constellation","rocket","visitor","landing"];
  let selected:Discovery="frog", visiting:Discovery|null=null;
  function home(){
    held.clear();sky.release();activities.reset();view="scene";visiting=null;
    blinkStart=-10;blink(0);close=false;heading=0;pitch=elevation;earthAngle=earthGoal=0;earth.rotation.set(0,0,0);
    positionOrbit();message.textContent="달에 앉은 우주개구리";draw();
  }
  function discover(id:Discovery,point?:T.Vector3){
    selected=id;
    message.textContent=label(id);
    if(id==="star"){
      const camera=view==="flight"?flight:orbit;
      const origin=point??camera.getWorldDirection(new T.Vector3()).multiplyScalar(4).add(camera.position);
      activities.shoot(origin,camera,automatic);
      message.textContent="별똥별이 지나갑니다.";
    }else if(id==="frog"){
      if(view==="flight")home();
      close=!close;positionOrbit();blinkStart=time;blink(3.7);
      message.textContent=close?"개구리가 눈을 깜박입니다.":"달에 앉은 우주개구리";
    }else if(id==="prints" && point){
      activities.imprint(point,view==="flight"?flight.rotation.y:heading);
      message.textContent="달 표면에 발자국이 남았습니다.";
    }else{
      const repeat=visiting===id;
      if(!repeat){sky.release();activities.reset();held.clear();}
      view="flight";visiting=id;
      if(id==="earth"){
        if(!repeat)frameEarth();
        earthGoal+=Math.PI*.5;
        if(!automatic){earthAngle=earthGoal;earth.rotation.y=earthAngle;}
        message.textContent="지구가 돌아갑니다.";
      }else if(id==="satellite"||id==="rover"||id==="comet"||id==="prints"){
        const site=id==="satellite"?"relay":id;
        if(!repeat)activities.visit(site,flight);
        activities.act(flight,automatic);
        const reports={
          satellite:"탐사선이 신호에 응답했습니다.",
          rover:`월면차가 모은 표본 ${activities.samples}개`,
          prints:"달 표면에 발자국이 남았습니다.",
          comet:activities.riding?"혜성과 함께 비행합니다.":"혜성에서 내렸습니다.",
        };
        message.textContent=reports[id];
      }else{
        if(repeat && (id==="landing" || id==="moonlet")){home();return;}
        sky.react(id,time,automatic);sky.visit(id,flight);message.textContent=skyNotes[id][1];
      }
    }
    activities.update(0,view==="flight"?flight:undefined);draw();startTick();
  }
  const ray=new T.Raycaster();
  ray.params.Line.threshold=.035;
  function pick(x:number,y:number){
    const box=canvas.getBoundingClientRect();
    const camera=view==="flight"?flight:orbit;
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
  const keys:Record<string,string>={w:"forward",s:"back",a:"left",d:"right",arrowup:"forward",arrowdown:"back",q:"down",e:"up"};
  function move(dt:number){
    const signed=(a:string,b:string)=>Number(held.has(a))-Number(held.has(b));
    delta.set(signed("right","left"),0,signed("back","forward")).applyQuaternion(flight.quaternion);
    delta.y+=signed("up","down");
    if(delta.lengthSq()===0)return;
    flight.position.addScaledVector(delta.normalize(),2.5*dt);
    flight.position.clampScalar(-20,20);
    for(const [centre,radius] of [[earthCentre,2.4],[moonCentre,.39],[actorCentre,1.1]] as const){
      delta.subVectors(flight.position,centre);
      if(delta.length()<radius)flight.position.copy(centre).addScaledVector(delta.normalize(),radius);
    }
    flight.position.y=Math.max(groundHeight(flight.position.x,flight.position.z)+.23,flight.position.y);
    draw();
  }
  function tick(now:number){
    frame=0;
    if(!shouldAnimate())return;
    if(now-last>=32){
      const dt=Math.min((now-last)/1000,.10);
      const flying=view==="flight";
      const elapsed=automatic?dt:0;
      time+=elapsed;sky.update(time);
      blink(time-blinkStart<.5?3.69+time-blinkStart:automatic?time:0);
      activities.update(elapsed,flying?flight:undefined);
      if(flying)sky.follow(flight);
      earthAngle=T.MathUtils.damp(earthAngle,earthGoal,4.2,dt);
      earth.rotation.y=earthAngle+(flying?0:.012*Math.sin(time*.10));
      moon.rotation.y=.065*Math.sin(time*.17);
      if(held.size)move(dt);else draw();
      last=now;
    }
    frame=requestAnimationFrame(tick);
  }
  function shouldAnimate(){
    return !contextLost&&inSight&&!document.hidden &&
      (automatic || (view==="flight" && held.size>0));
  }
  function startTick(){
    if(!frame&&shouldAnimate()){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function setMotion(enabled:boolean){
    automatic=enabled;
    if(!enabled){activities.release();blink(0);earthAngle=earthGoal;earth.rotation.y=earthAngle;}
    startTick();draw();
  }
  reduced.addEventListener("change",()=>setMotion(!reduced.matches));
  canvas.addEventListener("keydown",e=>{
    if(e.key==="Escape"){e.preventDefault();home();return;}
    if(e.key===" "){e.preventDefault();if(!e.repeat)setMotion(!automatic);return;}
    if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
      e.preventDefault();
      const index=discoveries.indexOf(selected)+(e.key==="ArrowRight"?1:-1);
      selected=discoveries[T.MathUtils.euclideanModulo(index,discoveries.length)];
      message.textContent=label(selected);return;
    }
    if(e.key==="Enter"){e.preventDefault();if(!e.repeat)discover(selected);return;}
    const action=keys[e.key.toLowerCase()];
    if(view==="flight" && action){
      e.preventDefault();
      if(held.has(action))return;
      sky.release();activities.release();visiting=null;held.add(action);move(.055);startTick();
    }
  });
  window.addEventListener("keyup",e=>held.delete(keys[e.key.toLowerCase()]));
  canvas.addEventListener("blur",()=>held.clear());
  window.addEventListener("blur",stop);window.addEventListener("focus",startTick);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else startTick();});
  let pointer:{id:number;x:number;y:number;startX:number;startY:number;downAt:number;drag:boolean}|undefined;
  canvas.onpointerdown=e=>{
    if(contextLost||!e.isPrimary||e.button!==0)return;
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,downAt:performance.now(),drag:false};
    canvas.setPointerCapture(e.pointerId);
  };
  canvas.onpointermove=e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    if(!pointer.drag && Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)<6)return;
    pointer.drag=true;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    pointer.x=e.clientX;pointer.y=e.clientY;
    if(visiting==="earth"){
      earthAngle+=dx*.012;earthGoal=earthAngle;earth.rotation.y=earthAngle;
      earth.rotation.x=T.MathUtils.clamp(earth.rotation.x+dy*.008,-1.5,1.5);
    }else if(view==="flight"){
      sky.release();activities.release();visiting=null;
      flight.rotation.y-=dx*.007;flight.rotation.x=T.MathUtils.clamp(flight.rotation.x-dy*.007,-1.4,1.4);
    }else{heading-=dx*.012;pitch=T.MathUtils.clamp(pitch+dy*.006,.07,1.12);positionOrbit();}
    draw();
  };
  canvas.onpointerup=e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const tap=!pointer.drag&&Math.hypot(e.clientX-pointer.startX,e.clientY-pointer.startY)<6;
    const goHome=tap&&view==="flight"&&performance.now()-pointer.downAt>=550;
    pointer=undefined;
    if(goHome){home();return;}
    if(tap)pick(e.clientX,e.clientY);
  };
  canvas.onpointercancel=canvas.onlostpointercapture=()=>{pointer=undefined;};
  canvas.oncontextmenu=e=>{if(view==="flight")e.preventDefault();};
  const visibility=new IntersectionObserver(([entry])=>{
    inSight=entry.isIntersecting;if(inSight)startTick();else stop();
  });
  visibility.observe(stage);
  const observer=new ResizeObserver(resize);
  if(illustrationSpace?.parentElement)observer.observe(illustrationSpace.parentElement);
  window.addEventListener("scroll",()=>{
    if(!canvas.hidden && alignIllustration()){positionFlight();positionOrbit();draw();}
  },{passive:true});
  canvas.addEventListener("webglcontextlost",()=>{stop();contextLost=true;observer.disconnect();visibility.disconnect();canvas.hidden=true;poster.hidden=false;});
  canvas.hidden=false;poster.hidden=true;resize();startTick();observer.observe(stage);observer.observe(registration);
}

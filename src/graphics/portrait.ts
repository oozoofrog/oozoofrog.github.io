import * as T from "three";
import {animateEyelids} from "./portrait-motion";
import {createSceneInk} from "./scene-ink";
import { createLunarScene, elevation, groundHeight, paintingPoint } from "./lunar-scene";

import {createActivities, type LandingSite} from "./lunar-activities";

import {createLunarSky, skyNotes, type SkyPlace} from "./lunar-sky";

type View = "scene" | "flight";

export async function mountPortrait(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!;
  const stage=root.querySelector<HTMLElement>(".stage")!;
  const illustrationSpace=root.closest(".profile")?.querySelector<HTMLElement>("[data-illustration-space]");
  const registration=root.querySelector<HTMLElement>("[data-registration]")!;
  const poster = root.querySelector<HTMLImageElement>("[data-registration] > img")!;
  const controls = root.querySelector("figcaption")!;
  const egg = root.querySelector<HTMLButtonElement>("[data-moon]")!;
  const flightControls = controls.querySelector<HTMLElement>("[data-flight]")!;
  const turns = controls.querySelector<HTMLElement>(".turn")!;
  const message = controls.querySelector("p")!;
  const exit = controls.querySelector<HTMLButtonElement>("[data-land]")!;
  const interact=controls.querySelector<HTMLButtonElement>("[data-interact]")!;
  const motion=controls.querySelector<HTMLButtonElement>("[data-motion]")!;
  const places=flightControls.querySelectorAll<HTMLButtonElement>("[data-site]");
  const {scene,frog,moon,earth,lunarCentre,paints} = await createLunarScene();
  const blink=animateEyelids(frog);
  const activities=createActivities(paints);
  const sky=createLunarSky(moon,activities.relay,lunarCentre,paints);
  scene.add(sky.group);
  const map=controls.querySelector<HTMLDetailsElement>(".sky-index")!;
  const skyButtons=map.querySelectorAll<HTMLButtonElement>("[data-sky]");
  let skyTimeElapsed=0;
  function clearSkySelection(){
    sky.release();
    for(const b of skyButtons)b.setAttribute("aria-pressed","false");
  }
  scene.add(activities.group);
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let automatic=!reduced.matches;
  motion.setAttribute("aria-pressed",String(automatic));
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
  const screen=new T.Vector3(),delta=new T.Vector3();
  let view:View="scene", heading=0, pitch=elevation, close=false;
  let width=1,height=1;
  const held=new Set<string>();
  let frame=0, last=0, skyTime=0;
  let contextLost=false;
  let turn:{from:number;to:number;startedAt:number}|undefined;
  function draw(){
    if(contextLost)return;
    const camera=view==="flight"?flight:orbit;
    camera.updateMatrixWorld();
    renderer.render(scene,camera);
    drawInk(camera);
    screen.copy(moonCentre).project(camera);
    egg.hidden=view!=="scene" || (Math.abs(screen.x)>.98 || Math.abs(screen.y)>.98) || screen.z>1;
    egg.style.left=(50+screen.x*50)+"%";
    egg.style.top=(50-screen.y*50)+"%";
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
    egg.style.setProperty("--moon-size",(.63/units)+"px");
    orbit.updateProjectionMatrix();
  }
  function stop(){held.clear();cancelAnimationFrame(frame);frame=0;}
  function setView(next:View){
    stop();turn=undefined;blink(0); view=next;clearSkySelection();
    const flying=next==="flight";
    map.hidden=!flying;
    if(!flying)map.open=false;
    canvas.hidden=false;poster.hidden=true;
    positionOrbit();
    activities.reset();interact.hidden=true;
    if(!flying){earth.rotation.y=0;moon.rotation.y=0;skyTime=0;}
    for(const b of places)b.setAttribute("aria-pressed","false");
    turns.hidden=flying;flightControls.hidden=!flying;
    message.textContent=flying?"방향키로 이동 · 드래그로 둘러보기 · Esc로 복귀":"";
    if(flying){
      flight.position.copy(orbit.position).sub(target).multiplyScalar(.55).add(target);
      flight.lookAt(actorCentre);
      flight.updateProjectionMatrix(); canvas.focus({preventScroll:true});
    }
    draw();startTick();
  }
  function positionFlight(){
    // Leave the same margin for the text in orbit and on a guided visit.
    const illustration=registration.getBoundingClientRect();
    flight.setViewOffset(width,height,width/2-illustration.left-illustration.width/2,
      height/2-illustration.top-illustration.height/2,width,height);
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
    positionOrbit();draw();
  }
  function returnToScene(){
    heading=0;pitch=elevation;close=false;zoom.setAttribute("aria-pressed","false");
    positionOrbit();setView("scene");egg.focus({preventScroll:true});
  }
  const zoom=controls.querySelector<HTMLButtonElement>("[data-zoom]")!;
  zoom.onclick=()=>{
    turn=undefined;close=!close;
    zoom.setAttribute("aria-pressed",String(close));positionOrbit();draw();
  };
  for(const b of turns.querySelectorAll<HTMLButtonElement>("[data-step]")) b.onclick=()=>{
    const destination=(turn?.to??heading)+Number(b.dataset.step)*Math.PI/6;
    if(automatic){
      turn={from:heading,to:destination,startedAt:performance.now()};startTick();
    }else{heading=destination;positionOrbit();draw();}
  };
  for(const button of skyButtons)button.onclick=()=>{
    const place=button.dataset.sky as SkyPlace;
    setView("flight");sky.visit(place,flight);
    button.setAttribute("aria-pressed","true");
    message.textContent=skyNotes[place][1];
    button.focus({preventScroll:true});draw();
  };
  egg.onclick=()=>setView("flight");
  exit.onclick=returnToScene;

  const actions={relay:"신호 보내기",comet:"함께 비행",prints:"한 걸음 걷기",rover:"표본 채취"};
  for(const b of places)b.onclick=()=>{
    const site=b.dataset.site as LandingSite;
    clearSkySelection();activities.visit(site,flight);
    for(const other of places)other.setAttribute("aria-pressed",String(other===b));
    interact.textContent=actions[site];interact.hidden=false;
    interact.disabled=site==="rover"&&activities.samples===3;
    message.textContent={relay:"안테나에 신호를 보내 보세요.",comet:"혜성과 함께 비행할 수 있습니다.",prints:"이동하면 발자국이 남습니다.",rover:"월면차가 분화구 둘레를 돌고 있습니다."}[site];
    startTick();draw();
  };
  interact.onclick=()=>{
    activities.act(flight,automatic);
    activities.update(0,flight);
    if(activities.site==="rover"){
      interact.disabled=activities.samples===3;
      message.textContent=activities.samples===3
        ?"세 번째 표본입니다. 월면차 뒤에 탐사 깃발이 펼쳐집니다."
        :`암석 표본 ${activities.samples} / 3`;
    }
    if(activities.site==="comet")interact.textContent=activities.riding?"비행 멈추기":actions.comet;
    if(activities.site==="relay")message.textContent="탐사선이 신호에 응답했습니다.";
    startTick();draw();
  };
  const keys:Record<string,string>={w:"forward",s:"back",a:"left",d:"right",arrowup:"forward",arrowdown:"back",arrowleft:"left",arrowright:"right",q:"down",e:"up"};
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
      const elapsed=automatic||activities.riding?dt:0;
      skyTimeElapsed+=elapsed;sky.update(skyTimeElapsed);
      blink(automatic?skyTimeElapsed:0);
      if(turn){
        const elapsedMs=now-turn.startedAt;
        heading=T.MathUtils.lerp(turn.from,turn.to,T.MathUtils.smoothstep(elapsedMs,0,460));
        if(elapsedMs>=460)turn=undefined;
        positionOrbit();
      }
      activities.update(elapsed,flying?flight:undefined);
      if(flying)sky.follow(flight);
      if(flying){
        earth.rotation.y+=elapsed*.018;moon.rotation.y-=elapsed*.033;
      }else{
        skyTime+=elapsed;
        earth.rotation.y=.012*Math.sin(skyTime*.10);
        moon.rotation.y=.065*Math.sin(skyTime*.17);
      }
      if(held.size)move(dt);else draw();
      last=now;
    }
    frame=requestAnimationFrame(tick);
  }
  function shouldAnimate(){
    return !contextLost&&inSight&&!document.hidden &&
      (automatic || (view==="flight" && (held.size>0 || activities.riding)));
  }
  function startTick(){
    if(!frame&&shouldAnimate()){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function setMotion(enabled:boolean){
    automatic=enabled;
    if(!enabled){
      activities.release();blink(0);
      if(turn){heading=turn.to;turn=undefined;positionOrbit();}
    }
    motion.setAttribute("aria-pressed",String(enabled));
    if(activities.site==="comet")interact.textContent=actions.comet;
    startTick();draw();
  }
  motion.onclick=()=>setMotion(!automatic);
  reduced.addEventListener("change",()=>setMotion(!reduced.matches));
  function press(action:string){
    if(held.has(action))return;
    clearSkySelection();activities.release();if(activities.site==="comet")interact.textContent=actions.comet;
    held.add(action);move(.055);startTick();
  }
  root.addEventListener("keydown",e=>{
    if(view!=="flight")return;
    if(e.key==="Escape"){e.preventDefault();returnToScene();return;}
    const action=keys[e.key.toLowerCase()];if(action){e.preventDefault();press(action);}
  });
  window.addEventListener("keyup",e=>held.delete(keys[e.key.toLowerCase()]));
  root.addEventListener("focusout",e=>{if(!root.contains(e.relatedTarget as Node))held.clear();});
  window.addEventListener("blur",stop);window.addEventListener("focus",startTick);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else startTick();});
  for(const b of flightControls.querySelectorAll<HTMLButtonElement>("[data-move]")){
    const action=b.dataset.move!;
    b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);press(action);};
    b.onlostpointercapture=()=>{held.delete(action);};
    b.onclick=e=>{if(e.detail===0){held.add(action);move(.16);held.delete(action);}};
  }
  let pointer:number|undefined, x=0,y=0;
  canvas.onpointerdown=e=>{
    if(!e.isPrimary||e.button!==0)return;
    turn=undefined;pointer=e.pointerId;x=e.clientX;y=e.clientY;canvas.setPointerCapture(pointer);
  };
  canvas.onpointermove=e=>{
    if(pointer!==e.pointerId)return;
    const dx=e.clientX-x,dy=e.clientY-y;x=e.clientX;y=e.clientY;
    if(view==="flight"){
      flight.rotation.y-=dx*.007;flight.rotation.x=T.MathUtils.clamp(flight.rotation.x-dy*.007,-1.4,1.4);
    }else{heading-=dx*.012;pitch=T.MathUtils.clamp(pitch+dy*.006,.07,1.12);positionOrbit();}
    draw();
  };
  canvas.onlostpointercapture=()=>{pointer=undefined;};
  const visibility=new IntersectionObserver(([entry])=>{
    inSight=entry.isIntersecting;if(inSight)startTick();else stop();
  });
  visibility.observe(stage);
  const observer=new ResizeObserver(resize);
  if(illustrationSpace?.parentElement)observer.observe(illustrationSpace.parentElement);
  window.addEventListener("scroll",()=>{
    if(!canvas.hidden && alignIllustration()){positionFlight();positionOrbit();draw();}
  },{passive:true});
  canvas.addEventListener("webglcontextlost",()=>{stop();contextLost=true;observer.disconnect();visibility.disconnect();egg.hidden=canvas.hidden=controls.hidden=true;poster.hidden=false;});
  resize();controls.hidden=false;setView("scene");observer.observe(stage);observer.observe(registration);observer.observe(controls);
}

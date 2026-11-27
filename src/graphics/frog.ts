import {Mesh} from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {visorOutline} from "./visor-outline";

export async function loadAstronaut() {
  const {scene}=await new GLTFLoader().loadAsync("/assets/models/astronaut-frog.glb");
  scene.traverse(part=>{
    if(!(part instanceof Mesh))return;
    const map=part.material.map;
    if(map)map.anisotropy=8;
    const glass=part.material.name==="Pressure glass";
    part.userData.glass=glass;
    part.castShadow=part.receiveShadow=!glass;
    if(glass){
      part.material.depthWrite=false;
      part.add(visorOutline(part.geometry));
      part.renderOrder=3;
    }
  });
  return scene;
}

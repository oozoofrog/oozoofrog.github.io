import { Mesh } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function loadAstronaut() {
  const { scene } = await new GLTFLoader().loadAsync(
    "/assets/models/astronaut-frog.glb",
  );
  scene.traverse((part) => {
    if (!(part instanceof Mesh)) return;
    const glass = part.material.name === "Pressure glass";
    part.userData.glass = glass;
    part.castShadow = !glass;
    part.receiveShadow = !glass;
    if (glass) {
      part.material.depthWrite = false;
      part.material.onBeforeCompile = (shader: {
        vertexShader: string;
        fragmentShader: string;
      }) => {
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `#include <common>
          varying float visorEdge;`,
          )
          .replace(
            "#include <project_vertex>",
            `#include <project_vertex>
          visorEdge = 1.0 - abs(normalize(normalMatrix * normal).z);`,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>
          varying float visorEdge;`,
          )
          .replace(
            "#include <map_fragment>",
            `#include <map_fragment>
          float edge = smoothstep(0.56, 0.96, visorEdge);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12,0.17,0.18), edge);
          diffuseColor.a = max(diffuseColor.a, 0.72 * edge);`,
          );
      };
      part.renderOrder = 3;
    }
  });
  return scene;
}

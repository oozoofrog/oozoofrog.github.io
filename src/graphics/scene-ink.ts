import * as T from "three";

// Render object ownership separately from the painting. A change of pigment
// within a rock or planet can never become a silhouette in this pass.
export function createSceneInk(scene:T.Scene, renderer:T.WebGLRenderer) {
  const target=new T.WebGLRenderTarget(1,1,{minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  const size=new T.Vector2();
  const entries:{mesh:T.Mesh;original:T.Material|T.Material[];mask:T.Material|T.Material[]}[]=[];
  const hidden=new T.MeshBasicMaterial({visible:false});
  let nextId=1;
  function collect(node:T.Object3D,figure:boolean) {
    figure ||= node.userData.astronaut===true;
    if(node instanceof T.Mesh){
      const mesh=node;
      // The ridge and the sphere are two meshes of the same lunar surface.
      const id=figure?65535:mesh.userData.lunarGround?65534:mesh.userData.paperSky?0:nextId;
      nextId+=mesh instanceof T.InstancedMesh?mesh.instanceMatrix.count:1;
      function maskFor(original:T.Material) {
        const surface=original as T.MeshBasicMaterial;
        if(node.userData.glass || node.userData.clearDome || (figure&&original.transparent))return hidden;
        const mask=new T.MeshBasicMaterial({
          side:surface.side, map:surface.transparent?surface.map:null,alphaMap:surface.alphaMap,
          vertexColors:surface.vertexColors,polygonOffset:surface.polygonOffset,
          polygonOffsetFactor:surface.polygonOffsetFactor,polygonOffsetUnits:surface.polygonOffsetUnits,
          toneMapped:false,blending:T.NoBlending,
        });
        const opacity={value:1};
        mask.onBeforeRender=()=>{opacity.value=surface.opacity;};
        mask.onBeforeCompile=s=>{
          s.uniforms.objectId={value:id};s.uniforms.inkOpacity=opacity;
          s.vertexShader=s.vertexShader.replace("#include <common>","#include <common>\nuniform float objectId; flat varying float owner;")
            .replace("#include <begin_vertex>",`#include <begin_vertex>
              owner=objectId;
              #ifdef USE_INSTANCING
                owner+=float(gl_InstanceID);
              #endif`);
          s.fragmentShader=s.fragmentShader.replace("#include <common>","#include <common>\nflat varying float owner; uniform float inkOpacity;")
            .replace("#include <opaque_fragment>",`float coverage=diffuseColor.a*inkOpacity;
              if(coverage<.12)discard;
              gl_FragColor=vec4(mod(owner,256.)/255.,floor(owner/256.)/255.,coverage,1.);`);
        };
        return mask;
      }
      entries.push({mesh,original:mesh.material,mask:Array.isArray(mesh.material)?mesh.material.map(maskFor):maskFor(mesh.material)});
    }
    node.children.forEach(child=>collect(child,figure));
  }
  collect(scene,false);
  // Lines already carry an ink stroke. Exclude them from the ownership map.
  const lines:T.Line[]=[];
  scene.traverse(n=>{if(n instanceof T.Line)lines.push(n);});
  const pass=new T.Scene(),camera=new T.Camera();
  const material=new T.ShaderMaterial({
    transparent:true,depthTest:false,depthWrite:false,
    uniforms:{owners:{value:target.texture},texel:{value:new T.Vector2()},pixelRatio:{value:1}},
    vertexShader:`varying vec2 coord;
      void main(){coord=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`uniform sampler2D owners;uniform vec2 texel;uniform float pixelRatio;
      varying vec2 coord;
      float stroke(vec3 a,vec2 offset){
        vec3 b=texture2D(owners,coord+offset*texel*pixelRatio).rgb;
        if(min(a.r,a.g)>.999 || min(b.r,b.g)>.999)return 0.;
        return step(.002,length(a.rg-b.rg))*min(a.b,b.b);
      }
      void main(){
        vec3 a=texture2D(owners,coord).rgb;
        vec2 p=gl_FragCoord.xy/pixelRatio;
        float pressure=.5+.5*sin(p.x*.055+p.y*.061+.9*sin(p.y*.12));
        float grain=.5+.5*sin(p.y*1.34+p.x*.73+sin(p.x*.53));
        float radius=.84+pressure*1.28;
        float line=0.;float bristle=0.;
        for(int i=0;i<6;i++){
          float ang=float(i)*1.04719755;vec2 d=vec2(cos(ang),sin(ang));
          line+=stroke(a,d*radius);
          bristle+=stroke(a,d*(radius+1.30));
        }
        float dry=smoothstep(.32,.82,grain*.55+pressure*.45);
        float alpha=clamp(line*.27,0.,.88)*(.70+.30*grain)
          +clamp(bristle*.10,0.,.27)*dry;
        if(alpha<.018)discard;
        gl_FragColor=vec4(.039,.027,.018,min(alpha,.94));
        #include <colorspace_fragment>
      }`,
  });
  pass.add(new T.Mesh(new T.PlaneGeometry(2,2),material));
  const clear=new T.Color();
  return (view:T.Camera)=>{
    renderer.getDrawingBufferSize(size);
    if(target.width!==size.x || target.height!==size.y)target.setSize(size.x,size.y);
    material.uniforms.texel.value.set(1/size.x,1/size.y);
    material.uniforms.pixelRatio.value=renderer.getPixelRatio();
    const oldTarget=renderer.getRenderTarget(),auto=renderer.autoClear,shadow=renderer.shadowMap.enabled;
    const alpha=renderer.getClearAlpha();renderer.getClearColor(clear);
    const visibleLines=lines.filter(line=>line.visible);
    try{
      visibleLines.forEach(line=>line.visible=false);
      entries.forEach(e=>e.mesh.material=e.mask);
      renderer.shadowMap.enabled=false;renderer.setRenderTarget(target);
      renderer.setClearColor(0x0000ff,1);renderer.render(scene,view);
    }finally{
      entries.forEach(e=>e.mesh.material=e.original);
      visibleLines.forEach(line=>line.visible=true);
      renderer.setRenderTarget(oldTarget);renderer.shadowMap.enabled=shadow;
      renderer.setClearColor(clear,alpha);
    }
    renderer.autoClear=false;
    try{renderer.render(pass,camera);}finally{renderer.autoClear=auto;}
  };
}

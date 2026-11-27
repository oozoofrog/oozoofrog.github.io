import * as T from "three";
import {paintingScale} from "./painting-frame.mjs";

// A welded edge contributes ink only while one adjacent triangle faces the
// camera and the other faces away. The UV seam is not a silhouette.
export function visorOutline(surface:T.BufferGeometry) {
  const positions=surface.getAttribute("position"), index=surface.getIndex()!;
  const vertices:T.Vector3[]=[], unique=new Map<string,number>(), ids:number[]=[];
  for(let i=0;i<positions.count;i++){
    const p=new T.Vector3().fromBufferAttribute(positions,i);
    const key=[p.x,p.y,p.z].map(x=>Math.round(x*1e6)).join(",");
    let id=unique.get(key);
    if(id===undefined){id=vertices.length;unique.set(key,id);vertices.push(p);}
    ids.push(id);
  }
  const edges=new Map<number,{a:number;b:number;first:T.Vector3;second?:T.Vector3}>();
  const ab=new T.Vector3(),ac=new T.Vector3();
  for(let i=0;i<index.count;i+=3){
    const tri=[ids[index.getX(i)],ids[index.getX(i+1)],ids[index.getX(i+2)]];
    const [a,b,c]=tri.map(id=>vertices[id]);
    const normal=new T.Vector3().crossVectors(ab.subVectors(b,a),ac.subVectors(c,a));
    if(normal.lengthSq()<1e-22)continue;
    normal.normalize();
    for(let j=0;j<3;j++){
      const a=tri[j], b=tri[(j+1)%3], key=Math.min(a,b)*vertices.length+Math.max(a,b);
      const edge=edges.get(key);
      if(edge)edge.second=normal;
      else edges.set(key,{a,b,first:normal});
    }
  }
  const starts:number[]=[], ends:number[]=[], first:number[]=[], second:number[]=[];
  for(const edge of edges.values()){
    if(!edge.second || edge.first.dot(edge.second)>.9999999)continue;
    starts.push(...vertices[edge.a].toArray());ends.push(...vertices[edge.b].toArray());
    first.push(...edge.first.toArray());second.push(...edge.second.toArray());
  }
  const geometry=new T.InstancedBufferGeometry();
  geometry.setAttribute("position",new T.Float32BufferAttribute([0,-4,0,1,-4,0,0,10,0,1,10,0],3));
  geometry.setIndex([0,1,2,2,1,3]);
  for(const [name,values] of Object.entries({edgeStart:starts,edgeEnd:ends,firstNormal:first,secondNormal:second})){
    geometry.setAttribute(name,new T.InstancedBufferAttribute(new Float32Array(values),3));
  }
  geometry.instanceCount=starts.length/3;
  const material=new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,forceSinglePass:true,
    uniforms:{brushUnit:{value:paintingScale},pigment:{value:new T.Color(0x322a24)}},
    vertexShader:`
      attribute vec3 edgeStart,edgeEnd,firstNormal,secondNormal;
      uniform float brushUnit;
      varying vec3 grainPoint;
      varying float strokeOffset;
      void main(){
        vec4 a=modelViewMatrix*vec4(edgeStart,1.),b=modelViewMatrix*vec4(edgeEnd,1.);
        vec3 sight=isOrthographic?vec3(0.,0.,1.):-(a.xyz+b.xyz);
        bool front=dot(normalMatrix*firstNormal,sight)>0.;
        if(front==(dot(normalMatrix*secondNormal,sight)>0.) || max(a.z,b.z)>=0.){
          gl_Position=vec4(2.,2.,0.,1.);return;
        }
        vec4 p=projectionMatrix*a,q=projectionMatrix*b;
        vec2 scale=vec2(projectionMatrix[0][0],projectionMatrix[1][1]);
        vec2 segment=(q.xy/q.w-p.xy/p.w)/scale;
        vec2 along=segment/max(length(segment),1.e-7);
        vec2 inward=vec2(-along.y,along.x)*(front?1.:-1.);
        grainPoint=mix(edgeStart,edgeEnd,position.x);
        strokeOffset=position.y;
        gl_Position=mix(p,q,position.x);
        gl_Position.xy+=scale*brushUnit*(strokeOffset*inward+.9*(2.*position.x-1.)*along);
      }`,
    fragmentShader:`
      uniform vec3 pigment;
      varying vec3 grainPoint;
      varying float strokeOffset;
      void main(){
        vec3 p=grainPoint;
        float drag=sin(dot(p,vec3(23.,31.,-17.)))+.45*sin(dot(p,vec3(71.,-57.,65.)));
        float grain=sin(dot(p,vec3(183.,127.,-117.))+strokeOffset*.8);
        float aa=clamp(fwidth(strokeOffset)*.52,.22,1.4);
        float width=1.57+.59*drag+.32*grain;
        float line=1.-smoothstep(width-aa,width+aa,abs(strokeOffset-.32-.42*drag));
        float bristle=1.-smoothstep(.38,.38+aa,abs(strokeOffset-5.05-1.28*drag));
        float load=smoothstep(-.8,.55,drag+.28*grain);
        float stray=(1.-smoothstep(.36,.36+aa,abs(strokeOffset+2.75+.77*drag)))*smoothstep(.15,1.,drag);
        float ink=max(max(line*(.55+.45*load),bristle*load*.94),stray*.80);
        if(ink<.025)discard;
        gl_FragColor=vec4(pigment,ink);
        #include <colorspace_fragment>
      }`,
  });
  const mesh=new T.Mesh(geometry,material);
  mesh.name="Visor silhouette";mesh.userData.glass=true;
  mesh.renderOrder=4;mesh.frustumCulled=false;
  return mesh;
}

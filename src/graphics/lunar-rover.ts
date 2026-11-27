import * as T from "three";
import {groundHeight} from "./lunar-scene";

export function createRover(enamel:T.Material, rubber:T.Material, metal:T.Material, cells:T.Material, ochre:T.Texture) {
  const chassis=new T.Group();
  function piece(parent:T.Object3D,geo:T.BufferGeometry,material:T.Material,x:number,y:number,z:number){
    const mesh=new T.Mesh(geo,material);
    mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
  }
  piece(chassis,new T.BoxGeometry(.42,.17,.57),enamel,0,.24,0);
  piece(chassis,new T.BoxGeometry(.52,.025,.34),cells,0,.35,-.11);
  const mast=new T.Group();chassis.add(mast);mast.position.set(-.12,.32,.18);
  piece(mast,new T.CylinderGeometry(.018,.025,.22,8),metal,0,.11,0);
  piece(mast,new T.BoxGeometry(.16,.074,.09),enamel,0,.235,0);
  for(const x of [-.045,.045])
    piece(mast,new T.CylinderGeometry(.023,.025,.035,10),rubber,x,.235,.051).rotation.x=Math.PI/2;
  const wheels:T.Group[]=[];
  const wheelGeo=new T.CylinderGeometry(.109,.109,.073,18);
  wheelGeo.rotateZ(Math.PI/2);
  const cleatGeo=new T.BoxGeometry(.078,.01,.026);
  const cleats=new T.InstancedMesh(cleatGeo,metal,6*9);
  const cleat=new T.Object3D();
  chassis.add(cleats);
  for(const x of [-.235,.235])for(const z of [-.225,0,.225]){
    const axle=new T.Group();axle.position.set(x,.11,z);chassis.add(axle);
    piece(axle,wheelGeo,rubber,0,0,0);
    const hub=piece(axle,new T.CylinderGeometry(.042,.042,.079,8),metal,0,0,0);
    hub.rotation.z=Math.PI/2;wheels.push(axle);
  }
  const arm=new T.Group();chassis.add(arm);arm.position.set(.13,.27,.22);
  piece(arm,new T.BoxGeometry(.035,.035,.26),metal,0,0,.13);
  piece(arm,new T.SphereGeometry(.047,10,7),rubber,0,0,.265);
  piece(arm,new T.ConeGeometry(.048,.12,7),enamel,0,-.047,.27).rotation.z=Math.PI;
  const sample=piece(arm,new T.DodecahedronGeometry(.042),metal,0,-.12,.27);
  piece(chassis,new T.BoxGeometry(.25,.025,.115),rubber,.046,.334,.17);
  const specimens=[new T.DodecahedronGeometry(.039),new T.IcosahedronGeometry(.037),new T.OctahedronGeometry(.043)]
    .map((geo,i)=>piece(chassis,geo,i===1?enamel:metal,-.031+i*.078,.361,.17));
  const pennant=new T.Group();chassis.add(pennant);pennant.position.set(.17,.34,-.21);
  piece(pennant,new T.CylinderGeometry(.007,.009,.34,7),metal,0,.17,0);
  const cloth=new T.BufferGeometry();
  cloth.setAttribute("position",new T.Float32BufferAttribute([0,.34,0,.21,.28,.024,0,.20,0],3));
  cloth.setAttribute("uv",new T.Float32BufferAttribute([0,1,1,.5,0,0],2));
  cloth.computeVertexNormals();
  piece(pennant,cloth,new T.MeshBasicMaterial({map:ochre,color:0xbd8059,side:T.DoubleSide}),0,0,0);
  const lamp=piece(mast,new T.SphereGeometry(.018,10,6),new T.MeshBasicMaterial({map:ochre}),.077,.24,.01);
  let route=0,spin=0,scan=Infinity,samples=0;
  const up=new T.Vector3(),forward=new T.Vector3(),right=new T.Vector3(),basis=new T.Matrix4();
  function update(dt:number,time:number){
    scan+=dt;
    if(scan>3.5){route+=dt*.105;spin+=dt*.105/.109;}
    const x=2.8+1.1*Math.sin(route),z=1.5+.72*Math.cos(route);
    chassis.position.set(x,groundHeight(x,z)+.008,z);
    up.set(groundHeight(x-.025,z)-groundHeight(x+.025,z),.05,groundHeight(x,z-.025)-groundHeight(x,z+.025)).normalize();
    forward.set(1.1*Math.cos(route),0,-.72*Math.sin(route));
    right.crossVectors(up,forward).normalize();forward.crossVectors(right,up);
    chassis.quaternion.setFromRotationMatrix(basis.makeBasis(right,up,forward));
    wheels.forEach((wheel,i)=>{
      wheel.rotation.x=spin;
      for(let j=0;j<9;j++){
        const a=spin+j*2*Math.PI/9;
        cleat.position.copy(wheel.position);
        cleat.position.y+=.108*Math.cos(a);cleat.position.z+=.108*Math.sin(a);
        cleat.rotation.x=a;cleat.updateMatrix();cleats.setMatrixAt(i*9+j,cleat.matrix);
      }
    });
    cleats.instanceMatrix.needsUpdate=true;
    mast.rotation.y=.8*Math.sin(time*.72);
    const dipping=scan<3.5?Math.sin(Math.PI*scan/3.5):0;
    arm.rotation.x=-.31+dipping*1.08;
    sample.visible=scan>1.7&&scan<3.5;
    specimens.forEach((rock,i)=>{rock.visible=i<samples&&(i<samples-1||scan>=3.5);});
    const raised=samples===3?T.MathUtils.smoothstep(scan,3.3,4.2):0;
    pennant.visible=raised>0;pennant.scale.y=raised;
    lamp.visible=scan<3.5 || Math.sin(time*3)>.6;
  }
  update(0,0);
  return {chassis,update,get samples(){return samples;},collect(animate:boolean){
    if(!animate && scan<3.5){scan=4.2;return;}
    if(scan<3.5 || samples===3)return;
    samples++;scan=animate?0:4.2;
  }};
}

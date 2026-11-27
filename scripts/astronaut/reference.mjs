import {MathUtils, Matrix4, Vector3} from "three";

export function referenceCoverage(root, {width,height,originX,originY,size}) {
  root.updateWorldMatrix(true,true);
  const inverse=new Matrix4().copy(root.matrixWorld).invert();
  const depth=new Float32Array(width*height).fill(-Infinity);
  const ids=new Map(),incidence=new Float32Array(width*height);
  const owner=new Int16Array(width*height).fill(-1);
  root.traverse(mesh=>{
    if(!mesh.isMesh || mesh.material.transparent || mesh.userData.inkHull) return;
    const id=ids.size;ids.set(mesh,id);
    const geometry=mesh.geometry, positions=geometry.attributes.position;
    const transform=new Matrix4().multiplyMatrices(inverse,mesh.matrixWorld);
    const projected=[], point=new Vector3();
    for(let i=0;i<positions.count;i++){
      point.fromBufferAttribute(positions,i).applyMatrix4(transform);
      const x=436+point.x/size-originX, y=1036-point.y/size-originY;
      projected.push([x,y,point.z/size]);

    }
    const tris=geometry.index.array;
    for(let i=0;i<tris.length;i+=3){
      const [ax,ay,az]=projected[tris[i]], [bx,by,bz]=projected[tris[i+1]], [cx,cy,cz]=projected[tris[i+2]];
      const dx=bx-ax, dy=by-ay, ex=cx-ax, ey=cy-ay, area=dx*ey-ex*dy;
      if(area>=-.00001) continue;
      const dz=bz-az,ez=cz-az;
      const cosine=-area/Math.hypot(area,dy*ez-dz*ey,dz*ex-dx*ez);
      const left=Math.max(0,Math.ceil(Math.min(ax,bx,cx))), right=Math.min(width-1,Math.floor(Math.max(ax,bx,cx)));
      const top=Math.max(0,Math.ceil(Math.min(ay,by,cy))), bottom=Math.min(height-1,Math.floor(Math.max(ay,by,cy)));
      for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
        const u=((x-ax)*ey-(y-ay)*ex)/area, v=(dx*(y-ay)-dy*(x-ax))/area;
        if(u<0 || v<0 || u+v>1) continue;
        const k=y*width+x;
        const z=az+(bz-az)*u+(cz-az)*v;
        if(z>depth[k]){depth[k]=z;owner[k]=id;incidence[k]=cosine;}
      }
    }

  });
  // A textile texel may borrow native brushwork only when the cloth itself
  // was visible at that point. Keep ink near occluding edges off the atlas.
  return (mesh,[x,y,z])=>{
    const ix=Math.round(x)-originX,iy=Math.round(y)-originY;
    if(ix<3||iy<3||ix>=width-3||iy>=height-3)return 0;
    const k=iy*width+ix,id=ids.get(mesh);
    if(owner[k]!==id || owner[k-3]!==id || owner[k+3]!==id ||
       owner[k-3*width]!==id || owner[k+3*width]!==id)return 0;
    return MathUtils.smoothstep(incidence[k],.08,.42)*
      (1-MathUtils.smoothstep(Math.abs(depth[k]-z),2.5,6));
  };
}

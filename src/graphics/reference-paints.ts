import * as T from "three";
import {pigmentRows} from "./pigment-layout.mjs";

type Pigment = "linen"|"metal"|"graphite"|"ochre"|"ocean"|"skin"|"glass"|"soil"|"cream";
export type ReferencePaints = Record<Pigment,T.CanvasTexture>;

// Each material needs its own mip chain. Downsampling the packed atlas on the
// GPU would mix adjacent pigments on small or distant objects.
export function readReferencePaints(sheet:T.Texture<HTMLImageElement>):ReferencePaints {
  const maps={} as ReferencePaints;
  const size=sheet.image.width/pigmentRows[0].length;
  pigmentRows.forEach((row,y)=>row.forEach((name,x)=>{
    const tile=document.createElement("canvas");
    tile.width=tile.height=size;
    tile.getContext("2d")!.drawImage(sheet.image,x*size,y*size,size,size,0,0,size,size);
    const map=new T.CanvasTexture(tile);
    map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.anisotropy=sheet.anisotropy;
    maps[name as Pigment]=map;
  }));
  sheet.dispose();
  return maps;
}

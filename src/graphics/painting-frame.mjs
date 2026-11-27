import {Euler,Vector3} from "three";

export const elevation=.39;
export const paintingScale=.0037;
export const paintingPose=new Euler(-elevation,0,0);
export function paintingPoint(x,y,depth) {
  return new Vector3((x-436)*paintingScale,(1036-y)*paintingScale,depth).applyEuler(paintingPose);
}

import {Vector3, MathUtils} from "three";

// The knee bend defines a sagittal plane in the painting's coordinate system.
// At neutral the plantar normal follows the shank and the toes point forward.
export function bootFrame(hip,knee,ankle,plantarFlexion,roll,toeOut) {
  const origin=new Vector3(...ankle);
  const shank=origin.clone().sub(new Vector3(...knee)).normalize();
  const forward=new Vector3(...knee).sub(new Vector3(...hip)).projectOnPlane(shank).normalize();
  const across=shank.clone().cross(forward).normalize(),down=shank.clone();
  const radians=MathUtils.degToRad;
  forward.applyAxisAngle(across,-radians(plantarFlexion));
  down.applyAxisAngle(across,-radians(plantarFlexion));
  across.applyAxisAngle(forward,radians(roll));
  down.applyAxisAngle(forward,radians(roll));
  forward.applyAxisAngle(down,radians(toeOut));
  across.applyAxisAngle(down,radians(toeOut));
  function point(length,width,depth) {
    return origin.clone().addScaledVector(forward,length)
      .addScaledVector(across,width).addScaledVector(down,depth);
  }
  return {origin,shank,forward,across,down,point,ball:point(73,0,18).toArray()};
}

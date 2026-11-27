import {bootFrame} from "./boot-frame.mjs";

// Rest landmarks in the painting: x right, y down, depth toward the viewer.
// The shoulder and hip widths define the body's three-quarter turn. The hidden
// hip sockets and depth of each knee are reconstructed from the seated pose.
const rest = {
  pelvis: [387, 975, -84],
  spine: [398, 897, -65], chest: [416, 840, -48], neck: [433, 805, -18], head: [447, 674, 10],
  nearShoulder: [336, 847, 1.67], nearElbow: [376, 893, 98], nearWrist: [430, 817, 136], nearPalm: [426, 780, 101],
  farShoulder: [512, 830, -37.98], farElbow: [589, 882, 28.07], farWrist: [553, 814, 93], farPalm: [562, 773, 65],
  nearHip: [334.44, 981.26, -59.38], nearKnee: [445.55, 945.51, 60.05], nearAnkle: [502.60, 1066.21, 182.17],
  farHip: [441, 973.42, -73.42], farKnee: [566.73, 960.95, 35.77], farAnkle: [601.98, 1066.56, 178.24],
};
export const feet = {
  near:bootFrame(rest.nearHip,rest.nearKnee,rest.nearAnkle,1,3,.625),
  far:bootFrame(rest.farHip,rest.farKnee,rest.farAnkle,10.625,-3,-8),
};
export const joints={...rest,nearBall:feet.near.ball,farBall:feet.far.ball};
export const chains = [
  ["pelvis","spine","chest","neck","head"],
  ...["near","far"].flatMap(side=>[
    ["chest",...["Shoulder","Elbow","Wrist","Palm"].map(j=>side+j)],
    ["pelvis",...["Hip","Knee","Ankle","Ball"].map(j=>side+j)],
  ]),
];

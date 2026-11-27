// Capture [data-registration] at 0% with the full scene selected, then run
// node scripts/astronaut/compare.mjs <registration.png> <comparison.webp>.
import sharp from "sharp";
import {fileURLToPath} from "node:url";

const [, , capture, destination]=process.argv;
if(!capture||!destination)throw new Error("Expected a registration screenshot and a destination WebP path.");
const {width,height}=await sharp(capture).metadata();
if(Math.abs(width-height)>2)throw new Error("Capture the square [data-registration] element in the full reference view.");

const source=fileURLToPath(new URL("../../public/assets/images/lunar-journal.webp",import.meta.url));
const size=1254;
async function pixels(path){
  return sharp(path).resize(size,size,{fit:"fill"}).removeAlpha().toColourspace("srgb").raw().toBuffer();
}
const [original,render]=await Promise.all([pixels(source),pixels(capture)]);
const overlay=Buffer.from(render.map((v,i)=>(v+original[i])/2));
const crops=[
  ["figure",188,448,522,697],["helmet",204,450,450,383],
  ["mouth",441,637,158,99],["suit",200,805,501,333],
];
const tiles=[],tile=280;
for(const [row,[label,left,top,width,height]] of crops.entries()){
  let error=0;
  for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++){
    const i=3*(size*y+x);
    for(let c=0;c<3;c++)error+=Math.abs(original[i+c]-render[i+c]);
  }
  console.log(label, "mean absolute RGB difference (0–255)", (error/(width*height*3)).toFixed(2));
  for(const [column,data] of [original,render,overlay].entries()){
    const input=await sharp(data,{raw:{width:size,height:size,channels:3}})
      .extract({left,top,width,height}).resize(tile,tile,{fit:"contain",background:"#f6f1e7"}).png().toBuffer();
    tiles.push({input,left:column*tile,top:row*tile});
  }
}
await sharp({create:{width:3*tile,height:crops.length*tile,channels:3,background:"#f6f1e7"}})
  .composite(tiles).webp({quality:95}).toFile(destination);

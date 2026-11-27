// Rebuild small responsive variants from the retained, full-size notebook drawings.
import sharp from 'sharp';
import fs from 'node:fs/promises';
const names=['silver-spring','boston','exeter','nyu','venice','nyc','ghost'];
for(const name of names){
 const source=`images/notebook/${name}.webp`;
 try{await fs.access(source);}catch{console.log(`Skipped missing drawing: ${name}`);continue;}
 for(const width of [160,320,480]) await sharp(source).resize({width,withoutEnlargement:true}).webp({quality:78}).toFile(`images/notebook/${name}-${width}.webp`);
}

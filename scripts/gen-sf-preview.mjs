import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
const output = process.env.SF_PREVIEW_FRAMES || 'work/sf-preview-frames';
await fs.mkdir(output,{recursive:true});
await fs.mkdir('images/social',{recursive:true});
const fonts=await Promise.all([
 ['Instrument Serif','instrument-serif-400-normal'],['Geist','geist-400-normal'],['Geist Mono','geist-mono-400-normal']
].map(async([name,file])=>({name,data:await fs.readFile(`fonts/${file}.woff`),weight:400,style:'normal'})));
const div=(children,style={})=>({type:'div',props:{style:{display:'flex',...style},children}});
const text=div([
 div('NOTES FROM A NEW CITY',{position:'absolute',left:70,top:54,fontFamily:'Geist Mono',fontSize:17,letterSpacing:3,color:'#687b86'}),
 div('Serendipities',{position:'absolute',left:65,top:122,fontFamily:'Instrument Serif',fontSize:101,lineHeight:1,color:'#242a27'}),
 div('in San Francisco',{position:'absolute',left:68,top:223,fontFamily:'Instrument Serif',fontSize:78,lineHeight:1,color:'#242a27'}),
 div('New ideas. New people. A lot of coffee.',{position:'absolute',left:72,top:340,fontFamily:'Geist',fontSize:23,color:'#64665e'}),
 div('DAVID GABEAU',{position:'absolute',left:72,top:558,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2,color:'#555e58'}),
 div('davidgabeau.com',{position:'absolute',right:70,top:558,fontFamily:'Geist',fontSize:18,color:'#555e58'})
],{position:'relative',width:1200,height:630});
const type=Buffer.from(await new ImageResponse(text,{width:1200,height:630,fonts}).arrayBuffer());
function scene(t){
 const drift=9*Math.sin(2*Math.PI*t);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <defs><pattern id="paper" width="11" height="13" patternUnits="userSpaceOnUse"><path d="M1 2h1M8 10h1" stroke="#a69f87" stroke-opacity=".16"/></pattern></defs>
 <rect width="1200" height="630" fill="#f6f3e9"/><rect width="1200" height="630" fill="url(#paper)"/>
 <path d="M70 97H1130M70 530H1130" stroke="#ccc9ba" stroke-width="1"/>
 <circle cx="1000" cy="176" r="64" fill="#d8b974" opacity=".45"/>
 <g stroke="#8a9b8b" stroke-width="1.4" fill="#e4e8db">
 <path d="M644 478Q712 363 808 418Q907 345 1017 402Q1080 328 1200 390V526H644Z"/>
 <path d="M722 496Q826 407 954 456Q1073 397 1200 439V526H722Z" fill="#d5ddce"/>
 </g>
 <g fill="none" stroke="#b2654f" stroke-linecap="round" stroke-linejoin="round">
 <path d="M744 431L1192 325M744 436L1192 330" stroke-width="3"/>
 <path d="M842 436V220H858V432M1015 395V172H1033V392" stroke-width="5"/>
 <path d="M845 244H856M845 302H856M845 363H856M1018 200H1030M1018 256H1030M1018 313H1030" stroke-width="4"/>
 <path d="M748 389Q792 376 850 231Q937 389 1024 183Q1102 303 1191 291" stroke-width="2.5"/>
 ${Array.from({length:23},(_,i)=>{let x=756+i*19; let y=x<850?389-158*Math.pow((x-748)/102,2):x<1024?231+(183-231)*(x-850)/174+115*Math.sin(Math.PI*(x-850)/174):183+108*Math.sin(Math.PI/2*(x-1024)/167);return `<path d="M${x} ${y}V${431-(x-744)*106/448}" stroke-width="1" opacity=".72"/>`}).join('')}
 <path d="M841 439L839 220M1013 394L1012 173" opacity=".3"/>
 </g>
 <g fill="#f6f3e9" opacity=".7" transform="translate(${drift} 0)"><path d="M689 378Q735 351 794 372Q857 348 910 374Q995 351 1068 378Q1120 360 1200 375V398H689Z"/><path d="M810 448Q879 428 969 447Q1064 420 1184 444V462H810Z" opacity=".65"/></g>
 <g fill="none" stroke="#71889a" stroke-width="2" stroke-linecap="round">
 <path d="M75 450C170 490 269 410 353 453S512 493 600 447S697 480 748 468" stroke-dasharray="2 8" stroke-dashoffset="${-t*30}"/>
 <path d="M78 462Q210 495 307 458" opacity=".18"/>
 </g>
 <g fill="#f6f3e9" stroke="#71889a" stroke-width="2"><circle cx="80" cy="452" r="5"/><circle cx="353" cy="453" r="5"/><circle cx="600" cy="447" r="5"/></g>
 <g transform="translate(654 327) rotate(9)" fill="none" stroke="#71889a" stroke-width="2" stroke-linecap="round"><path d="M0 0h36l-4 40Q18 47 4 40Z" fill="#f6f3e9"/><path d="M36 6c23-6 23 26-2 22M-4 46q23 9 45 0"/><g opacity="${.35+.25*Math.sin(2*Math.PI*t)}" transform="translate(0 ${-4*Math.sin(2*Math.PI*t)})"><path d="M9-10q-6-7 0-14M22-9q-6-10 0-20"/></g></g>
 </svg>`;
}
for(let i=0;i<80;i++){
 const frame=await sharp(Buffer.from(scene(i/80))).composite([{input:type}]).png().toBuffer();
 await fs.writeFile(`${output}/${String(i).padStart(3,'0')}.png`,frame);
 if(i===0) await fs.writeFile('images/social/serendipities-sf-v2.png',frame);
}
console.log('Created 80 frames and static social preview.');

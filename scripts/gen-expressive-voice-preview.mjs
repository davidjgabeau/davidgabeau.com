// Original notebook-style artwork; no product screenshots or benchmark data.
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const fonts=await Promise.all([
 ['Instrument Serif','instrument-serif-400-normal'],['Geist','geist-400-normal'],['Geist Mono','geist-mono-400-normal']
].map(async([name,file])=>({name,data:await fs.readFile(`fonts/${file}.woff`),weight:400,style:'normal'})));
const div=(children,style={})=>({type:'div',props:{style:{display:'flex',...style},children}});
const type=div([
 div('VOICE AI / EVALUATION',{position:'absolute',left:70,top:54,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2.2,color:'#687b86'}),
 ...[['Why Expressive',140,82],['Voice Models',235,84],['Laugh at Nothing',332,80]].map(([line,top,fontSize])=>div(line,{position:'absolute',left:66,top,fontFamily:'Instrument Serif',fontSize,lineHeight:1,color:'#242a27'})),
 div('Sounding human is only half the product.',{position:'absolute',left:72,top:448,fontFamily:'Geist',fontSize:23,color:'#64665e'}),
 div('DAVID GABEAU',{position:'absolute',left:72,top:558,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2,color:'#555e58'}),
 div('davidgabeau.com',{position:'absolute',right:70,top:558,fontFamily:'Geist',fontSize:18,color:'#555e58'})
],{position:'relative',width:1200,height:630});
const letters=Buffer.from(await new ImageResponse(type,{width:1200,height:630,fonts}).arrayBuffer());
const art=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><pattern id="grain" width="11" height="13" patternUnits="userSpaceOnUse"><path d="M1 2h1M8 10h1" stroke="#a69f87" stroke-opacity=".16"/></pattern></defs>
<rect width="1200" height="630" fill="#f6f3e9"/><rect width="1200" height="630" fill="url(#grain)"/>
<path d="M70 97H1130M70 530H1130" stroke="#ccc9ba"/>
<ellipse cx="947" cy="316" rx="167" ry="165" fill="#e5e9dc" opacity=".65"/>
<g fill="none" stroke="#71889a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
 <path d="M823 220q-10-32 26-34l210 2q29 0 25 28l-3 96q-1 28-30 27l-70-1-37 34 2-36-89 1q-31 0-30-28Z" fill="#f6f3e9"/>
 <path d="M819 225q-7-34 28-37l213 2" opacity=".3"/>
 <path d="M851 271h16l5-11 7 22 8-39 8 57 9-43 8 27 7-13h14l6-31 8 64 9-47 7 28 7-14h17l6-17 7 32 8-50 8 64 8-40 6 11h22"/>
 <path d="M822 387q-4-22 20-22h102q22 0 21 22v49q-1 22-23 22h-57l-24 22 2-23h-20q-24 0-23-22Z" fill="#ece2c7"/>
 <path d="M851 401q8-12 16 0m18 0q8-12 16 0m-44 13q18 21 36 0"/>
 <path d="M997 383q31-8 45 15t-12 42m-14-5 15 5 4-16" stroke-dasharray="3 7"/>
 <path d="M1093 214q14-9 7-22-8-11-17-1m8 13-3 9m-2 9h.1" stroke="#b2654f"/>
</g></svg>`;
await sharp(Buffer.from(art)).composite([{input:letters}]).png().toFile('images/social/expressive-voice-models.png');
console.log('Created original 1200 × 630 expressive voice share image.');

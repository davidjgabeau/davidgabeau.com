// Match the site's notebook cards with an original illustration for this essay.
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const fonts=await Promise.all([
 ['Instrument Serif','instrument-serif-400-normal'],
 ['Geist','geist-400-normal'],
 ['Geist Mono','geist-mono-400-normal']
].map(async([name,file])=>({name,data:await fs.readFile(`fonts/${file}.woff`),weight:400,style:'normal'})));
const div=(children,style={})=>({type:'div',props:{style:{display:'flex',...style},children}});
const typography=div([
 div('AI AGENTS / SHARED WORLDS',{position:'absolute',left:70,top:54,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2.2,color:'#687b86'}),
 ...[['What Agents Can',132,78],['Learn From',218,86],['Working Together',312,78]].map(([line,top,size])=>div(line,{position:'absolute',left:66,top,fontFamily:'Instrument Serif',fontSize:size,lineHeight:1,color:'#242a27'})),
 div('Ownership, initiative, and useful work.',{position:'absolute',left:72,top:433,fontFamily:'Geist',fontSize:23,color:'#64665e'}),
 div('DAVID GABEAU',{position:'absolute',left:72,top:558,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2,color:'#555e58'}),
 div('davidgabeau.com',{position:'absolute',right:70,top:558,fontFamily:'Geist',fontSize:18,color:'#555e58'})
],{position:'relative',width:1200,height:630});
const type=Buffer.from(await new ImageResponse(typography,{width:1200,height:630,fonts}).arrayBuffer());
function agent(x,y,angle,color){return `<g transform="translate(${x} ${y}) rotate(${angle})" stroke="#71889a" stroke-width="2.3" fill="none" stroke-linejoin="round" stroke-linecap="round">
 <ellipse cy="55" rx="48" ry="7" fill="#d9dfd2" stroke="none" opacity=".7"/>
 <path d="M-35-25Q-38-34-27-34H30Q39-33 38-23L36 23Q35 32 25 32H-28Q-37 31-36 21Z" fill="${color}"/>
 <path d="M-35-24L-36 19M-26-36L28-35" opacity=".3"/>
 <circle cx="-12" cy="-5" r="2.2" fill="#71889a"/><circle cx="13" cy="-5" r="2.2" fill="#71889a"/>
 <path d="M-12 9Q0 19 13 9M0-35V-47"/><circle cy="-50" r="4" fill="#f6f3e9"/>
 <path d="M-20 34L-27 47H-34M19 34L26 47H34M-38-1L-49 10M39-2L50 9"/>
 </g>`;}
const art=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <defs><pattern id="grain" width="11" height="13" patternUnits="userSpaceOnUse"><path d="M1 2h1M8 10h1" stroke="#a69f87" stroke-opacity=".16"/></pattern></defs>
 <rect width="1200" height="630" fill="#f6f3e9"/><rect width="1200" height="630" fill="url(#grain)"/>
 <path d="M70 97H1130M70 530H1130" stroke="#ccc9ba"/>
 <ellipse cx="940" cy="324" rx="168" ry="171" fill="#e5e9dc" opacity=".75"/>
 <g stroke="#71889a" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" fill="none">
 <path d="M805 191Q877 112 1043 210M1064 224Q1148 320 1044 430M1026 448Q879 504 799 394M778 373Q708 287 798 216"/>
 <path d="M810 217L910 302M1042 245L956 303M1018 408L960 341M804 363L906 337"/>
 </g>
 <g stroke="#8a9b8b" stroke-width="2" stroke-linejoin="round" fill="#f6f3e9">
 <path d="M889 302L937 276L984 303L936 330Z" fill="#ece2c7"/>
 <path d="M889 302V352L936 380V330Z" fill="#dbe3d2"/>
 <path d="M936 330L984 303V352L936 380Z" fill="#e8ecdF"/>
 <path d="M913 289L960 317V343" fill="none" stroke="#b79555"/>
 </g>
 ${agent(799,196,-6,'#edf0e7')}${agent(1060,225,7,'#ece2c7')}${agent(1028,435,-5,'#edf0e7')}${agent(783,376,5,'#eaded5')}
 <g stroke="#b2654f" stroke-width="1.8" fill="#f6f3e9" stroke-linecap="round" stroke-linejoin="round">
 <path d="M879 145h64q9 0 9 9v24q0 9-9 9h-30l-12 11 2-11h-24q-9 0-9-9v-24q0-9 9-9Z"/>
 <path d="M888 160h46M888 171h29"/>
 <path d="M1081 330h44q8 0 8 8v20q0 8-8 8h-14l-11 10 1-10h-20q-8 0-8-8v-20q0-8 8-8Z"/>
 <path d="M1088 347l8 7 16-16"/>
 </g>
 <g fill="#b79555"><circle cx="858" cy="277" r="4"/><circle cx="1006" cy="286" r="4"/><circle cx="982" cy="387" r="4"/><circle cx="859" cy="350" r="4"/></g>
 </svg>`;
await fs.mkdir('images/social',{recursive:true});
await sharp(Buffer.from(art)).composite([{input:type}]).png().toFile('images/social/agent-collaboration.png');
console.log('Created images/social/agent-collaboration.png (1200 × 630).');

// Generate illustrated PNG + silent MP4 previews. Run from the repository root.
// Requires sharp and an ffmpeg binary (FFMPEG_BIN or ffmpeg on PATH).
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const sharp=createRequire(import.meta.url)('sharp');
const frameRoot=process.env.PREVIEW_FRAMES || 'work/notebook-preview-frames';
const ffmpeg=process.env.FFMPEG_BIN || 'ffmpeg';
const cards=[
 {id:'home',file:'index.html',eyebrow:'BUILDING / WRITING / CONNECTING',lines:[['Hi, I’m David.',108]],deck:['I build consumer products','that bring people together.'],note:'San Francisco, CA',theme:'computer',alt:'A notebook sketch of a computer, coffee, and connected people on warm paper.'},
 {id:'building-cosign',file:'writing/building-cosign/index.html',eyebrow:'BUILDING WITH THE A16Z NEW MEDIA TEAM',lines:[['Building Cosign',85]],deck:['Increasing your surface area for luck.'],theme:'network',alt:'A notebook sketch of people connected by a wandering blue network.'},
 {id:'crypto-broadband-moment',file:'writing/crypto-broadband-moment/index.html',eyebrow:'CONSUMER CRYPTO / ESSAY',lines:[['Crypto’s',96],['Broadband Moment',71]],deck:['The next wave of consumer apps.'],theme:'signal',alt:'A notebook sketch of a connected globe and signals moving across a network.'},
 {id:'pearl',file:'writing/pearl/index.html',eyebrow:'OPEN INFRASTRUCTURE / ESSAY',lines:[['Where Does Value',76],['Accrue in Pearl?',82]],deck:['A question about agents and value.'],theme:'layers',alt:'A notebook sketch of layered infrastructure, connected nodes, and a pearl.'},
 {id:'zumi-learnings',file:'writing/zumi-learnings/index.html',eyebrow:'LESSONS FROM BUILDING ZUMI',lines:[['Building social AI',78],['for 160,000 users',77]],deck:['Five lessons from the inside.'],theme:'conversation',alt:'A notebook sketch of two smiling conversation bubbles and a connected community.'},
 {id:'sample',file:'writing/sample/index.html',eyebrow:'FROM THE NOTEBOOK',lines:[['A Note on',94],['Writing Here',94]],deck:['Ideas worth writing down.'],theme:'computer',alt:'A notebook sketch of a computer, coffee, and connected ideas.'}
];
const fonts=await Promise.all([['Instrument Serif','instrument-serif-400-normal'],['Geist','geist-400-normal'],['Geist Mono','geist-mono-400-normal']].map(async([name,file])=>({name,data:await fs.readFile(`fonts/${file}.woff`),weight:400,style:'normal'})));
const div=(children,style={})=>({type:'div',props:{style:{display:'flex',...style},children}});
function typeTree(c){
 const children=[div(c.eyebrow,{position:'absolute',left:70,top:54,fontFamily:'Geist Mono',fontSize:c.eyebrow.length>33?14:17,letterSpacing:2.2,color:'#687b86'})];
 c.lines.forEach(([text,size],i)=>children.push(div(text,{position:'absolute',left:67,top:132+i*94,fontFamily:'Instrument Serif',fontSize:size,lineHeight:1,color:'#242a27'})));
 const deckY=c.lines.length===1?285:342;
 c.deck.forEach((text,i)=>children.push(div(text,{position:'absolute',left:72,top:deckY+i*34,fontFamily:'Geist',fontSize:24,color:'#64665e'})));
 if(c.note)children.push(div(c.note,{position:'absolute',left:72,top:392,fontFamily:'Geist Mono',fontSize:17,color:'#687b86'}));
 children.push(div('DAVID GABEAU',{position:'absolute',left:72,top:558,fontFamily:'Geist Mono',fontSize:17,letterSpacing:2,color:'#555e58'}),div('davidgabeau.com',{position:'absolute',right:70,top:558,fontFamily:'Geist',fontSize:18,color:'#555e58'}));
 return div(children,{position:'relative',width:1200,height:630});
}
function person(x,y,r=23){return `<g stroke="#71889a" stroke-width="2" transform="translate(${x} ${y})"><circle r="${r+11}" fill="#e7e8dc" stroke="none"/><circle cy="-5" r="${r*.32}" fill="none"/><path d="M${-r*.65} ${r*.65}Q0 ${-r*.4} ${r*.65} ${r*.65}" fill="none"/></g>`;}
function art(theme,t){
 const wave=Math.sin(2*Math.PI*t), opacity=.5+.25*wave;
 const pulse=(x,y)=>`<circle cx="${x}" cy="${y}" r="${13+5*wave}" fill="none" stroke="#b79555" opacity="${.45-.12*wave}"/>`;
 const line=(d)=>`<path d="${d}" fill="none" stroke="#71889a" stroke-width="2" stroke-dasharray="2 8" stroke-dashoffset="${-t*30}" stroke-linecap="round"/>`;
 let content='';
 if(theme==='computer'){
 content=`<ellipse cx="939" cy="481" rx="202" ry="19" fill="#e2e5d8"/><g stroke="#71889a" stroke-width="2.2" fill="#f6f3e9" stroke-linejoin="round"><path d="M783 189Q780 182 790 181L1073 176Q1084 176 1083 187L1077 389L788 394Z"/><path d="M800 200L1061 196L1057 365L805 370Z" fill="#e5e9de"/><path d="M788 394L739 451Q736 458 754 459L1111 454Q1127 452 1118 445L1077 389"/><path d="M767 439L1090 434M789 427L1066 422M811 414L1046 410M892 444L983 442" opacity=".5"/></g><g stroke="#b2654f" stroke-width="2.4" fill="none" stroke-linecap="round"><circle cx="906" cy="272" r="3"/><circle cx="960" cy="271" r="3"/><path d="M909 300Q936 324 962 299"/></g>${line('M716 249Q691 127 812 122Q1117 81 1134 257')}${person(807,122,17)}${person(1126,226,19)}${pulse(807,122)}<g transform="translate(707 378) rotate(-6)" stroke="#b2654f" stroke-width="2" fill="none" stroke-linecap="round"><path d="M0 0h35l-3 42Q16 48 4 42Z" fill="#f6f3e9"/><path d="M36 5c24-5 23 29-2 26M-7 49q25 9 48 0"/><g opacity="${opacity}" transform="translate(0 ${-4*wave})"><path d="M10-9q-8-9 0-18M24-10q-8-9 0-21"/></g></g>`;
 }else if(theme==='network'){
 const points=[[930,282],[778,170],[1080,155],[752,371],[1081,385],[919,459]];
 content=`<circle cx="930" cy="282" r="156" fill="#e4e8dc" opacity=".5"/>`+points.slice(1).map(([x,y])=>line(`M930 282Q${(x+930)/2+30} ${(y+282)/2-25} ${x} ${y}`)).join('')+`<g stroke="#71889a" stroke-width="2.2">`+points.map(([x,y],i)=>person(x,y,i?24:35)).join('')+`</g>${pulse(930,282)}${pulse(778,170)}<g fill="none" stroke="#b79555" stroke-width="2"><path d="M1070 270l6-14 7 14 15 6-15 6-7 14-6-14-15-6Z"/><path d="M807 455l3-9 4 9 9 4-9 4-4 9-3-9-9-4Z"/></g>`;
 }else if(theme==='conversation'){
 content=`<circle cx="958" cy="307" r="169" fill="#e6e8dc"/><g fill="#f6f3e9" stroke="#71889a" stroke-width="2.3" stroke-linejoin="round"><path d="M748 171Q745 150 773 150H982Q1008 151 1008 176V285Q1008 305 983 305H820L777 337L784 305H770Q748 303 748 282Z"/><path d="M921 289Q920 272 940 272H1092Q1115 272 1115 294V397Q1115 418 1094 418H1060L1072 450L1028 418H942Q921 418 921 397Z" fill="#e6dfcd"/></g><g stroke="#b2654f" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M837 230q25 22 50 0M985 350q24 22 48 0"/><circle cx="839" cy="208" r="2"/><circle cx="883" cy="208" r="2"/><circle cx="989" cy="329" r="2"/><circle cx="1030" cy="329" r="2"/></g>${line('M751 374Q690 468 834 478Q925 493 940 441')}${pulse(821,461)}<g fill="#b79555" opacity="${opacity}"><circle cx="788" cy="373" r="3"/><circle cx="804" cy="373" r="3"/><circle cx="820" cy="373" r="3"/></g>`;
 }else if(theme==='signal'){
 content=`<circle cx="939" cy="296" r="149" fill="#e4e8dc"/><g fill="none" stroke="#71889a" stroke-width="2"><circle cx="939" cy="296" r="126"/><ellipse cx="939" cy="296" rx="63" ry="126"/><path d="M813 296H1065M829 234Q939 266 1049 234M829 358Q939 326 1049 358M939 170V422" opacity=".6"/></g>${line('M733 388Q922 90 1127 217')}${line('M739 241Q947 502 1130 343')}${pulse(1037,218)}<g fill="#b2654f"><circle cx="839" cy="218" r="5"/><circle cx="1037" cy="218" r="5"/><circle cx="936" cy="402" r="5"/></g><g stroke="#b79555" stroke-width="3" fill="none" opacity="${opacity}"><path d="M1083 153q20 4 24 23M1087 137q32 5 38 36M1092 120q44 8 51 49"/></g>`;
 }else if(theme==='layers'){
 content=`<circle cx="943" cy="280" r="156" fill="#e5e8dc"/><g stroke="#71889a" stroke-width="2" stroke-linejoin="round">${[0,1,2].map((n)=>`<path d="M752 ${315+n*57}L943 ${240+n*57}L1132 ${315+n*57}L943 ${390+n*57}Z" fill="${['#f6f3e9','#e1e4d8','#d8dece'][n]}"/>`).reverse().join('')}</g>${line('M942 120Q1042 163 941 242Q839 316 944 425')}<circle cx="943" cy="181" r="42" fill="#f9f6ed" stroke="#b79555" stroke-width="2"/><circle cx="933" cy="171" r="19" fill="white" opacity=".5"/>${pulse(943,181)}<path d="M766 315L943 385L1121 315" fill="none" stroke="#b2654f" stroke-width="2"/>`;
 }
 return content;
}
function scene(c,t){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="paper" width="11" height="13" patternUnits="userSpaceOnUse"><path d="M1 2h1M8 10h1" stroke="#a69f87" stroke-opacity=".16"/></pattern></defs><rect width="1200" height="630" fill="#f6f3e9"/><rect width="1200" height="630" fill="url(#paper)"/><path d="M70 97H1130M70 530H1130" stroke="#ccc9ba"/>${art(c.theme,t)}<path d="M73 480Q292 444 577 479" fill="none" stroke="#71889a" opacity=".22" stroke-width="1.5"/><path d="M80 476Q290 440 569 475" fill="none" stroke="#71889a" stroke-dasharray="2 8" stroke-dashoffset="${-t*30}" stroke-width="1.6" stroke-linecap="round"/></svg>`;}
await fs.mkdir('images/social',{recursive:true});
for(const c of cards){
 const dir=path.join(frameRoot,c.id); await fs.mkdir(dir,{recursive:true});
 const text=Buffer.from(await new ImageResponse(typeTree(c),{width:1200,height:630,fonts}).arrayBuffer());
 for(let i=0;i<80;i++){
  const b=await sharp(Buffer.from(scene(c,i/80))).composite([{input:text}]).png().toBuffer();
  await fs.writeFile(path.join(dir,`${String(i).padStart(3,'0')}.png`),b);
  if(i===0)await fs.writeFile(`images/social/${c.id}-animated-v3.png`,b);
 }
 execFileSync(ffmpeg,['-y','-framerate','20','-i',path.join(dir,'%03d.png'),'-an','-c:v','libx264','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',`images/social/${c.id}-animated-v3.mp4`],{stdio:'pipe'});
 const base=`https://davidgabeau.com/images/social/${c.id}-animated-v3`;
 let html=await fs.readFile(c.file,'utf8');
 html=html.replace(/<meta (?:property="og:image(?::secure_url)?"|name="twitter:image") content="[^"]+">/g,m=>m.replace(/content="[^"]+"/,`content="${base}.png"`));
 html=html.replace(/\s*<meta property="og:video[^"]*"[^>]*>/g,'');
 const videoTags=`\n  <meta property="og:video" content="${base}.mp4">\n  <meta property="og:video:secure_url" content="${base}.mp4">\n  <meta property="og:video:type" content="video/mp4">\n  <meta property="og:video:width" content="1200">\n  <meta property="og:video:height" content="630">`;
 html=html.replace(/(<meta property="og:image"[^>]+>)/,`$1${videoTags}`);
 if(!html.includes('property="og:image:type"'))html=html.replace('  <meta property="og:image:width"','  <meta property="og:image:type" content="image/png">\n  <meta property="og:image:width"');
 html=html.replace(/(<meta (?:property="og:image:alt"|name="twitter:image:alt") content=")[^"]+(">)/g,`$1${c.alt}$2`);
 html=html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,(_,a,b,z)=>{
  const d=JSON.parse(b);
  function updateImage(node) {
   if (node['@graph']) { node['@graph'].forEach(updateImage); return; }
   if (node['@type'] === 'BlogPosting') {
    node.image = Array.isArray(node.image) ? [`${base}.png`, ...node.image.slice(1)] : `${base}.png`;
   } else if (node['@type'] === 'ProfilePage') {
    node.primaryImageOfPage = { '@type': 'ImageObject', url: `${base}.png`, width: 1200, height: 630 };
   }
  }
  updateImage(d);
  return a+'\n'+JSON.stringify(d,null,2)+'\n'+z;
 });
 if(c.id==='home'){
  html=html.replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]+(">)/g,'$1David Gabeau — Builder &amp; Technologist$2');
  html=html.replace(/(<meta (?:property="og:description"|name="twitter:description") content=")[^"]+(">)/g,'$1David Gabeau builds consumer products that bring people together. Special Projects at a16z, building Cosign in San Francisco. Previously founded Tapestry.$2');
 }
 await fs.writeFile(c.file,html);
 console.log(`Generated and wired ${c.id}`);
}

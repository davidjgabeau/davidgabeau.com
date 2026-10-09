import { ImageResponse } from '@vercel/og';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const fonts = await Promise.all([
 ['Instrument Serif','instrument-serif-400-normal','normal'],
 ['Instrument Serif','instrument-serif-400-italic','italic'],
 ['Geist','geist-400-normal','normal']
].map(async ([name,file,style])=>({name,data:await fs.readFile(`fonts/${file}.woff`),weight:400,style})));
const div=(children,style={})=>({type:'div',props:{style:{display:'flex',...style},children}});
const sketch=async(name,style)=>({type:'img',props:{src:`data:image/png;base64,${(await sharp(`images/notebook/${name}.webp`).resize(420).removeAlpha().linear([248/255,247/255,243/255],[0,0,0]).png().toBuffer()).toString('base64')}`,style:{position:'absolute',objectFit:'contain',...style}}});
await fs.mkdir('images/social',{recursive:true});
const home=div([
 div('davidgabeau.com',{fontFamily:'Geist',fontSize:22,color:'#6f6c64'}),
 div([div("Hi, I'm David"),div('but most call me DJ.',{fontStyle:'italic'})],{flexDirection:'column',fontFamily:'Instrument Serif',fontSize:78,lineHeight:1.04,marginTop:75}),
 div('I build consumer products.',{fontFamily:'Geist',fontSize:26,marginTop:30,color:'#565a59'}),
 await sketch('venice',{right:48,bottom:70,width:340,height:190}),
 await sketch('nyu',{right:83,top:45,width:225,height:240}),
 div('San Francisco',{fontFamily:'Geist',fontSize:20,color:'#6f6c64',marginTop:'auto'})
],{width:'100%',height:'100%',background:'#f8f7f3',color:'#1a1915',padding:'58px 68px',flexDirection:'column'});
await fs.writeFile('images/social/notebook-v1.png',Buffer.from(await new ImageResponse(home,{width:1200,height:630,fonts}).arrayBuffer()));
for(const slug of ['pearl','crypto-broadband-moment','zumi-learnings','sample']){
 const html=await fs.readFile(`writing/${slug}/index.html`,'utf8');
 const title=html.match(/<meta property="og:title" content="([^"]+)"/)[1];
 const tree=div([
 div('WRITING / DAVID GABEAU',{fontFamily:'Geist',fontSize:20,letterSpacing:2,color:'#6f6c64'}),
 div(title,{fontFamily:'Instrument Serif',fontSize:title.length>65?66:82,lineHeight:1.08,marginTop:55,maxWidth:990}),
 div('davidgabeau.com',{fontFamily:'Geist',fontSize:22,color:'#6f6c64',marginTop:'auto',borderTop:'1px solid #d3d2ca',paddingTop:24})
 ],{width:'100%',height:'100%',background:'#f8f7f3',color:'#1a1915',padding:'65px 76px',flexDirection:'column'});
 await fs.writeFile(`images/social/${slug}-v1.png`,Buffer.from(await new ImageResponse(tree,{width:1200,height:630,fonts}).arrayBuffer()));
}

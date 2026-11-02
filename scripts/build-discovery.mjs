// Build crawlable indexes and plain-text companions from canonical HTML.
// No network calls. Run on every deployment so discovery files cannot drift.
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import TurndownService from 'turndown';
const origin='https://davidgabeau.com';
const personId=origin+'/#person';
const siteId=origin+'/#website';
const td=new TurndownService({headingStyle:'atx',bulletListMarker:'-'});
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function modified(file){
 // Real Git timestamps; never advance a date merely because the feed was fetched.
 try{return execFileSync('git',['log','-1','--format=%cI','--',file],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()||null;}catch{return null;}
}
const homepage=await fs.readFile('index.html','utf8');
const posts=[];
for(const slug of await fs.readdir('writing')){
 const file=`writing/${slug}/index.html`;
 let html;try{html=await fs.readFile(file,'utf8');}catch{continue;}
 if(/name="robots"[^>]*content="[^"]*noindex/i.test(html))continue;
 const article=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 if(article['@type']!=='BlogPosting')continue;
 const url=origin+'/writing/'+slug;
 const body=html.match(/<div class="article-body">([\s\S]*?)\n\s*<\/div>/)[1];
 const bodyAbsolute=body.replace(/(href|src)="(\/[^\"]*)"/g,(_,attr,value)=>`${attr}="${origin}${value}"`);
 const markdown=td.turndown(bodyAbsolute);
 const mod=modified(file)||article.dateModified;
 const wordCount=markdown.replace(/\[[^\]]*\]\([^)]*\)/g,m=>m.slice(1,m.indexOf(']'))).split(/\s+/).filter(Boolean).length;
 posts.push({slug,file,url,title:article.headline,description:article.description,published:article.datePublished,modified:mod,wordCount,markdown});
 const text=`# ${article.headline}\n\nBy David Gabeau\n\nPublished: ${article.datePublished}\nCanonical URL: ${url}\nAuthor: ${origin}/\n\n${markdown}\n`;
 await fs.writeFile(`writing/${slug}.md`,text);
}
const homeRank=p=>{const i=homepage.indexOf(`href="/writing/${p.slug}"`);return i<0?Number.MAX_SAFE_INTEGER:i;};
posts.sort((a,b)=>b.published.localeCompare(a.published)||homeRank(a)-homeRank(b)||a.title.localeCompare(b.title));
const latest=posts.map(p=>p.modified).sort().at(-1);
const indexDescription='Essays by David Gabeau on consumer AI, social networks, open infrastructure, crypto, and building products.';
const indexSchema={'@context':'https://schema.org','@graph':[
 {'@type':'CollectionPage','@id':origin+'/writing#webpage',url:origin+'/writing',name:'Writing by David Gabeau',description:indexDescription,isPartOf:{'@id':siteId},author:{'@id':personId},mainEntity:{'@id':origin+'/writing#articles'}},
 {'@type':'ItemList','@id':origin+'/writing#articles',itemListElement:posts.map((p,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'BlogPosting','@id':p.url+'#article',url:p.url,headline:p.title,datePublished:p.published,author:{'@id':personId}}}))}
]};
await fs.writeFile('writing/index.html',`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Writing — David Gabeau | Consumer AI, Social Networks &amp; Technology</title>
<meta name="description" content="${escape(indexDescription)}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${origin}/writing">
<meta property="og:type" content="website"><meta property="og:site_name" content="David Gabeau"><meta property="og:title" content="Writing by David Gabeau"><meta property="og:description" content="${escape(indexDescription)}"><meta property="og:url" content="${origin}/writing"><meta property="og:image" content="${origin}/images/social/home-animated-v3.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/atom+xml" title="David Gabeau — Essays" href="/feed.xml"><link rel="alternate" type="text/plain" title="Site guide" href="/llms.txt"><link rel="stylesheet" href="/style.css?v=20261009-paper"><link rel="stylesheet" href="/typography.css"><link rel="stylesheet" href="/discovery.css">
<script type="application/ld+json">${JSON.stringify(indexSchema,null,2)}</script></head>
<body class="writing-post"><header><div class="container"><a class="header-name-link" href="/">David Gabeau</a></div></header>
<main class="container writing-index"><a class="post-back" href="/">← About David</a><h1>Writing</h1><p class="index-intro">${indexDescription}</p>
<ol class="essay-index">${posts.map(p=>`<li><time datetime="${p.published}">${p.published.slice(0,10)}</time><h2><a href="/writing/${p.slug}">${escape(p.title)}</a></h2><p>${escape(p.description)}</p></li>`).join('\n')}</ol>
<p class="index-links"><a href="/feed.xml">Subscribe via RSS / Atom</a> · <a href="mailto:davidgabeau92@gmail.com">Say hi</a></p></main>
<footer><div class="container"><a href="/">David Gabeau</a> · <a href="https://www.linkedin.com/in/dgabeau/">LinkedIn</a></div></footer></body></html>\n`);
const feedUpdated=latest||posts[0].published;
const atomDate=s=>s.includes('T')?s:s+'T00:00:00Z';
await fs.writeFile('feed.xml',`<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><id>${origin}/</id><title>David Gabeau — Essays</title><subtitle>${escape(indexDescription)}</subtitle><link href="${origin}/feed.xml" rel="self" type="application/atom+xml"/><link href="${origin}/writing"/><updated>${atomDate(feedUpdated)}</updated><author><name>David Gabeau</name><uri>${origin}/</uri></author>
${posts.map(p=>`<entry><id>${p.url}</id><title>${escape(p.title)}</title><link href="${p.url}"/><published>${atomDate(p.published)}</published><updated>${atomDate(p.modified)}</updated><summary>${escape(p.description)}</summary></entry>`).join('\n')}</feed>\n`);
const homeModified=modified('index.html')||feedUpdated;
const urls=[{url:origin+'/',modified:homeModified},{url:origin+'/writing',modified:latest},...posts];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p=>`  <url><loc>${escape(p.url)}</loc>${p.modified?`<lastmod>${escape(p.modified)}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile('sitemap.xml',sitemap);
// Preserve the legacy API route, serving the exact same generated sitemap.
await fs.writeFile('api/sitemap.js',`// Generated by scripts/build-discovery.mjs; dates derive from Git history.\nexport const config = { runtime: 'edge' };\nconst sitemap = ${JSON.stringify(sitemap)};\nexport default function handler() { return new Response(sitemap, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' } }); }\n`);
const intro=`# David Gabeau\n\n> David Gabeau builds consumer products that bring people together. He works on Special Projects at a16z, building Cosign in San Francisco. Previously founder and CEO of Tapestry, analyst at Union Square Ventures, and quality engineer at Snap and Lyft.\n\nThis guide summarizes the public website. Canonical HTML pages are the primary sources; Markdown companions contain the same essays in a simpler reading format.\n\n## Profile and contact\n\n- [About David Gabeau](${origin}/): Current work, career timeline, projects, and contact links.\n- [Email](mailto:davidgabeau92@gmail.com): Contact David directly.\n- [LinkedIn](https://www.linkedin.com/in/dgabeau/)\n- [GitHub](https://github.com/davidjgabeau)\n- [X](https://x.com/dgabeau)\n\n## Current work\n\n- [Cosign](https://cosign.co): Building a network for technology builders and investors with the a16z New Media team.\n- [a16z](https://a16z.com): Special Projects, 2026–present.\n\n## Previous company and products\n\n- [Tapestry](https://usetapestry.dev): David founded and led a team of 12, raised $12.5M, and wound down the company in 2026. Open social graph infrastructure.\n- [Zumi](https://apps.apple.com/us/app/zumi-chat-dress-up/id6751237911): A multiplayer AI companion built by Tapestry that grew to 160,000 users.\n- [Primitives](https://techcrunch.com/2022/05/25/primitives-crypto-wallet-social-network-snapchat-startup/): A Tapestry product for collecting digital art; artists and collectors minted 500,000 NFTs.\n- [SSE](https://sse.gg): Open-source Solana trading platform built by Tapestry, with $50M in trading volume in its first two months.\n\n## Side projects\n\n- [Bramble](https://trybramble.ai): A macOS app that turns AI coding sessions into a structured development log.\n- [AI Atlas NYC](https://aiatlas.nyc): A market map of New York’s early-stage AI ecosystem, rebuilt nightly.\n\n## Writing\n\n- [All essays](${origin}/writing)\n- [RSS / Atom feed](${origin}/feed.xml)\n`;
const writing=posts.map(p=>`- [${p.title}](${p.url}) — ${p.description} [Markdown](${origin}/writing/${p.slug}.md)`).join('\n');
const extras=`\n\n## Selected external writing\n\n- [Tokenized Natural Assets](https://www.usv.com/writing/2021/04/tokenized-natural-assets/) — Union Square Ventures, 2021.\n- [Augmented Reality NFTs](https://www.usv.com/writing/2020/06/augmented-reality-nfts/) — Union Square Ventures, 2020.\n- [Synchronous Entertainment](https://www.usv.com/writing/2020/03/sychronous-entertainment/) — Union Square Ventures, 2020.\n\n## Other formats\n\n- [Full essays in one text file](${origin}/llms-full.txt)\n- [XML sitemap](${origin}/sitemap.xml)\n`;
await fs.writeFile('llms.txt',intro+writing+extras);
await fs.writeFile('llms-full.txt',intro+writing+'\n\n'+posts.map(p=>`---\n\n# ${p.title}\n\nAuthor: David Gabeau\nCanonical URL: ${p.url}\nPublished: ${p.published}\n\n${p.markdown}`).join('\n\n'));
console.log(`Generated writing index, Atom feed, sitemap, llms files, and ${posts.length} Markdown essays.`);

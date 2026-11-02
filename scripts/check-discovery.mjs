// Regression checks for metadata, crawl paths, and generated reading formats.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';
const origin='https://davidgabeau.com';
const td=new TurndownService({headingStyle:'atx',bulletListMarker:'-'});
const read=p=>fs.readFile(p,'utf8');
const jsonld=s=>[...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const meta=(s,key)=>s.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]+)"`))?.[1];
const canonical=s=>s.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const home=await read('index.html');
const nodes=jsonld(home)[0]['@graph'];
const person=nodes.find(n=>n['@id']===origin+'/#person');
assert.equal(person.name,'David Gabeau');assert(!person.founder);
assert.equal(person.worksFor['@id'],origin+'/#a16z');
assert.equal(nodes.find(n=>n['@type']==='ProfilePage').mainEntity['@id'],person['@id']);
assert(person.sameAs.includes('https://github.com/davidjgabeau'));
assert.equal(canonical(home),origin+'/');
const sitemap=await read('sitemap.xml');
const feed=await read('feed.xml');
const guide=await read('llms.txt');
const index=await read('writing/index.html');
let count=0;
for(const slug of await fs.readdir('writing')){
 const file=`writing/${slug}/index.html`;
 let s;try{s=await read(file);}catch{continue;}
 if((meta(s,'robots')||'').includes('noindex')){assert(!sitemap.includes(origin+'/writing/'+slug));continue;}
 const [a,breadcrumb]=jsonld(s);if(a['@type']!=='BlogPosting')continue;
 const url=origin+'/writing/'+slug;
 assert.equal(canonical(s),url);assert.equal(meta(s,'og:url'),url);
 assert.equal(a.author['@id'],person['@id']);assert.equal(a.author.url,origin+'/');
 assert.equal(a['@id'],url+'#article');assert.equal(breadcrumb['@type'],'BreadcrumbList');
 assert.equal((s.match(/<h1\b/g)||[]).length,1);
 assert(s.includes('rel="author"'));assert(s.includes('<time datetime="'+a.datePublished+'">'));
 assert(s.includes('href="/writing"'));assert(s.includes('href="/feed.xml"'));
 assert(Date.parse(a.datePublished)<=Date.parse(a.dateModified));
 assert(sitemap.includes('<loc>'+url+'</loc>'));assert(feed.includes('<id>'+url+'</id>'));
 assert(index.includes(`href="/writing/${slug}"`));assert(guide.includes(url));
 const body=s.match(/<div class="article-body">([\s\S]*?)\n\s*<\/div>/)[1];
 const expected=td.turndown(body.replace(/(href|src)="(\/[^\"]*)"/g,(_,attr,value)=>`${attr}="${origin}${value}"`));
 const md=await read(`writing/${slug}.md`);
 assert(md.includes('Canonical URL: '+url));assert(md.endsWith(expected+'\n'));
 // All local assets and reading links must resolve on disk before deployment.
 for(const [,value] of s.matchAll(/(?:href|src)="(\/[^\"#?]*)(?:[?#][^\"]*)?"/g)){
  if(value.startsWith('/api/'))continue;
  const clean=value.slice(1);let exists=false;
  for(const p of [clean||'index.html',path.join(clean,'index.html')]){try{await fs.access(p);exists=true;break;}catch{}}
  assert(exists,`Broken local reference in ${file}: ${value}`);
 }
 count++;
}
assert(count>=5);assert.equal((sitemap.match(/<url>/g)||[]).length,count+2);
assert(!sitemap.includes('/anthropic')&&!sitemap.includes('/portfolio')&&!sitemap.includes('/sample'));
assert(feed.includes('xmlns="http://www.w3.org/2005/Atom"'));
const api=await read('api/sitemap.js');assert.equal(JSON.parse(api.match(/const sitemap = (.*);/)[1]),sitemap);
const robots=await read('robots.txt');assert(robots.includes('User-agent: OAI-SearchBot\nAllow: /'));
const config=JSON.parse(await read('vercel.json'));assert(!config.rewrites.some(r=>r.source==='/sitemap.xml'));
assert(config.headers.some(r=>r.source==='/writing/:slug.md'&&r.headers.some(h=>h.key==='X-Robots-Tag'&&h.value==='noindex')));
console.log(`Discovery checks passed: homepage, ${count} published essays, canonical links, author graph, sitemap/API parity, feed, Markdown fidelity, and local assets.`);

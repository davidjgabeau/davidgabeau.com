import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import handler from '../api/resume.js';
import { renderResume, resumeMetadata, resumeData as data, normalizeView, pdfUrl, escapeHtml } from '../lib/resume-page.js';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
const manifest = JSON.parse(await fs.readFile('resumes/manifest.json','utf8'));
for (const [file,hash] of [['lib/resume-data.json',manifest.dataSha256],['assets/resume-layout.docx',manifest.templateSha256],['scripts/build-resume-pdfs.py',manifest.builderSha256]]) {
  assert.equal(sha(await fs.readFile(file)),hash,`Resume PDF sources changed: rebuild PDFs (${file})`);
}
const ids = new Set();
for (const job of data.experience) {
  assert(!ids.has(job.id)); ids.add(job.id);
  assert(job.title && /^\d{4}-\d{2}$/.test(job.start));
  if (job.end) assert(job.start <= job.end);
  assert.equal(new Set(job.bullets.map(b=>b.id)).size,job.bullets.length);
}
assert.equal(data.person.location,'San Francisco, CA');
assert.equal(data.experience[0].title,'Product Lead, Cosign (Contract)');
assert.equal(data.experience[1].end,'2026-08');
assert.equal(data.experience[2].start,'2020-03');
assert.equal(data.experience[2].end,'2021-12');
assert(!JSON.stringify(data).includes('annual investments'));
assert(!JSON.stringify(data).includes('participated in board'));
assert(!/[\u2013\u2014]/.test(JSON.stringify(data)));
assert.equal(normalizeView('__proto__'),'combined');
assert.equal(normalizeView('constructor'),'combined');
assert.equal(normalizeView(null),'combined');
assert.equal(normalizeView('PRODUCT'),'product');
assert.equal(renderResume('bad'),renderResume('combined'));
const allAccomplishments = data.experience.flatMap(job=>job.bullets.map(b=>`${job.id}-${b.id}`)).sort();
const home = await fs.readFile('index.html','utf8');
const headlinePositions = [];
for (const [key,view] of Object.entries(data.views)) {
  const html=renderResume(key);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert(html.includes('<h1>David Gabeau</h1>'));
  assert(html.includes(`<p class="resume-position">${escapeHtml(view.headline)}</p>`));
  assert(html.includes(escapeHtml(view.summary)));
  assert(html.includes(`data-resume-view="${key}"`));
  assert(html.includes('<title>'+escapeHtml(view.title)+'</title>'));
  assert(html.includes('rel="canonical" href="https://davidgabeau.com/resume"'));
  assert(html.includes('name="robots" content="index, follow'));
  assert(!/noindex|<iframe\b/.test(html));
  assert.deepEqual([...html.matchAll(/data-accomplishment="([^"]+)"/g)].map(m=>m[1]).sort(),allAccomplishments);
  for (const job of data.experience) {
    assert(html.includes(escapeHtml(job.title)));
    assert(html.includes(`datetime="${job.start}"`));
    if (job.end) assert(html.includes(`datetime="${job.end}"`));
  }
  for (const publication of data.publications) assert(html.includes(escapeHtml(publication.title)));
  for (const talk of data.speaking) assert(html.includes(escapeHtml(talk.title)));
  for (const required of ['17-minute','4.8 App Store','244%','40%','multimodal','image/video','LLM evaluations','400ms','~90%','1,000+','10 TikTok partners','financial modeling','discounted cash flow (DCF)','venture return modeling','cap table analysis','commercial and technical due diligence','investment committee','external legal counsel','financing term sheets','Coinbase and Uniswap served distinct markets','Future of AI','BlueDot Impact','Coursework toward Bachelor of Science']) assert(html.includes(required),`Missing ${required} in ${key}`);
  assert.equal((html.match(new RegExp(`download="${view.pdf.filename}"`,'g'))||[]).length,2);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,2); // view nav and footer
  const firstSkill=html.match(/data-skill="([^"]+)"/)[1];assert.equal(firstSkill,view.skills[0]);
  const firstTapestry=html.match(/data-accomplishment="tapestry-([^"]+)"/)[1];assert.equal(firstTapestry,view.priorities.tapestry[0]);
  headlinePositions.push(firstTapestry);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const person=schema['@graph'].find(n=>n['@type']==='Person'),profile=schema['@graph'].find(n=>n['@type']==='ProfilePage');
  assert.equal(person.jobTitle,data.experience[0].title);
  assert.equal(person.homeLocation.address.addressLocality,'San Francisco');
  assert.equal(profile.mainEntity['@id'],person['@id']);assert.equal(profile.url,resumeMetadata.url);
  assert.equal(profile.associatedMedia.contentUrl,data.person.website+pdfUrl(key));
  for (const method of ['GET','HEAD']) {
    const headers={};let body;
    const response={setHeader:(k,v)=>{headers[k]=v},end:value=>{body=value}};
    handler({method,url:`/resume?view=${key}`},response);
    assert.equal(response.statusCode,200);assert.equal(headers['Content-Type'],'text/html; charset=utf-8');
    assert.equal(body,method==='GET'?html:undefined);
  }
  for (const [,href] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    if (!href.startsWith('/')) continue;
    const [pathname,fragment]=href.split('#');const clean=pathname.split('?')[0];
    if(clean==='/resume')continue;
    if(clean==='/'||clean===''){if(fragment)assert(home.includes(`id="${fragment}"`)||html.includes(`id="${fragment}"`));continue;}
    let exists=false;for(const file of [clean.slice(1),path.join(clean.slice(1),'index.html')]){try{await fs.access(file);exists=true;break;}catch{}}
    assert(exists,`Broken ${key} local link: ${href}`);
  }
  const nav=html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)[1];assert(!nav.includes('href="/resume"'));
  const pdf=await fs.readFile('.'+pdfUrl(key));assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert(pdf.length>50000);
  assert.equal(manifest.pdfs[key].pages,2);assert.equal(sha(pdf),manifest.pdfs[key].sha256);
  const header=config.headers.find(h=>h.source===pdfUrl(key));assert(header.headers.some(h=>h.key==='Content-Disposition'&&h.value.includes(view.pdf.filename)));
}
assert.equal(new Set(headlinePositions).size,2,'Investor prioritization must differ from product/combined');
assert(!home.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)[1].includes('href="/resume"'));
assert.deepEqual(config.rewrites.find(r=>r.source==='/resume'),{source:'/resume',destination:'/api/resume'});
assert(!config.redirects.some(r=>r.source==='/resume'));
assert((await fs.readFile('David_Gabeau_Resume.pdf')).equals(await fs.readFile('.'+pdfUrl('combined'))));
assert((await fs.readFile('resume.pdf')).equals(await fs.readFile('.'+pdfUrl('combined'))));
assert((await fs.readFile('sitemap.xml','utf8')).includes('<loc>https://davidgabeau.com/resume</loc>'));
const invalidResponse={setHeader(){},end(body){this.body=body;}};handler({method:'GET',url:'/resume?view=%3Cscript%3E'},invalidResponse);assert.equal(invalidResponse.body,renderResume());
const postResponse={setHeader(){},end(body){this.body=body;}};handler({method:'POST',url:'/resume'},postResponse);assert.equal(postResponse.statusCode,405);
console.log('Resume checks passed: three complete SSR views, reconciled titles/dates, all accomplishments retained, distinct ordering, stable schemas, safe query handling, local links, two-page PDF manifests, and source/PDF parity.');

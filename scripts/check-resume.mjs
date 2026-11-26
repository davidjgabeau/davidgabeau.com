import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import handler from '../api/resume.js';
import { renderResume, resumeMetadata } from '../lib/resume-page.js';

const html = renderResume();
const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert(html.includes('<h1>David Gabeau</h1>'));
assert(html.includes('San Francisco, CA'));
assert(html.includes('1.84M user messages'));
assert(html.includes('<title>David Gabeau Resume | AI Product Manager in San Francisco</title>'));
assert(html.includes('rel="canonical" href="https://davidgabeau.com/resume"'));
assert(html.includes('name="robots" content="index, follow'));
assert(!/noindex|<iframe\b|display:\s*none|visibility:\s*hidden/.test(html));
assert(!html.includes('1M+ messages'));
assert.equal((html.match(/download="David_Gabeau_Resume.pdf"/g) || []).length, 2);

const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const person = schema['@graph'].find(node => node['@type'] === 'Person');
const profile = schema['@graph'].find(node => node['@type'] === 'ProfilePage');
assert.equal(person.name, 'David Gabeau');
assert.equal(person.homeLocation.address.addressLocality, 'San Francisco');
assert.equal(profile.mainEntity['@id'], person['@id']);
assert.equal(profile.url, resumeMetadata.url);
assert.equal(profile.associatedMedia.contentUrl, 'https://davidgabeau.com/David_Gabeau_Resume.pdf');

assert.deepEqual(config.rewrites.find(rule => rule.source === '/resume'), { source: '/resume', destination: '/api/resume' });
assert(!config.redirects.some(rule => rule.source === '/resume'));
assert(!config.rewrites.some(rule => rule.source === '/resume' && rule.destination.endsWith('.pdf')));

// Validate the response path itself, including no-JavaScript/HEAD clients.
for (const method of ['GET', 'HEAD']) {
  const headers = {};
  let body;
  const response = { setHeader: (key, value) => { headers[key] = value; }, end: value => { body = value; } };
  handler({ method }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(headers['Content-Type'], 'text/html; charset=utf-8');
  assert.equal(body, method === 'GET' ? html : undefined);
}

const home = await fs.readFile('index.html', 'utf8');
// The resume stays publicly indexable without a promotional link in the site header.
for (const page of [home, html]) {
  const navigation = page.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/)[1];
  assert(!navigation.includes('href="/resume"'));
}
for (const [, href] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
  if (!href.startsWith('/')) continue;
  const [pathname, fragment] = href.split('#');
  const clean = pathname.split('?')[0];
  if (clean === '/resume') continue;
  if (clean === '/' || clean === '') {
    if (fragment) assert(home.includes(`id="${fragment}"`) || html.includes(`id="${fragment}"`), `Missing anchor: ${href}`);
    continue;
  }
  let exists = false;
  for (const file of [clean.slice(1), path.join(clean.slice(1), 'index.html')]) {
    try { await fs.access(file); exists = true; break; } catch {}
  }
  assert(exists, `Broken local asset or link: ${href}`);
}
const pdf = await fs.readFile('David_Gabeau_Resume.pdf');
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
assert(pdf.length > 50000);
assert(pdf.equals(await fs.readFile('resume.pdf')), 'Legacy PDF must serve the same updated document');
assert((await fs.readFile('sitemap.xml', 'utf8')).includes('<loc>https://davidgabeau.com/resume</loc>'));
console.log('Resume checks passed: complete server HTML, metadata, Person/ProfilePage graph, homepage navigation, routes, local links, matching PDF files, and sitemap.');

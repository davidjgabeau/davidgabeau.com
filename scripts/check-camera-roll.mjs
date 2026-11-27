import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import camera from '../api/camera-roll.js';
import photo from '../api/camera-photo.js';
import { authenticated, createSession, sessionSeconds } from '../lib/camera-auth.js';
import resume from '../lib/resume-data.json' with { type: 'json' };

process.env.CAMERA_ROLL_SECRET = 'test-fixture-only-not-a-production-secret';
async function call(handler, { method = 'GET', url = '/api/camera-roll', body, cookie, origin = 'https://davidgabeau.com' } = {}) {
  const request = Readable.from(body === undefined ? [] : [JSON.stringify(body)]);
  Object.assign(request, { method, url, headers: { host: 'davidgabeau.com', origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}) } });
  const result = { headers: {} };
  const response = { setHeader: (key, value) => { result.headers[key] = value; }, end: body => { result.body = body; result.status = response.statusCode; } };
  await handler(request, response);
  assert.equal(result.headers['Cache-Control'], 'private, no-store');
  assert.equal(result.headers['X-Robots-Tag'], 'noindex, noimageindex');
  return result;
}
assert.equal(JSON.parse((await call(camera)).body).authenticated, false);
assert.equal((await call(camera, { method: 'POST', body: { phone: '0000000000' } })).status, 401);
assert.equal((await call(camera, { method: 'POST', body: { phone: resume.person.phone }, origin: 'https://elsewhere.example' })).status, 403);
let cookie;
for (const phone of [resume.person.phone, '+1 ' + resume.person.phone]) {
  const good = await call(camera, { method: 'POST', body: { phone } });
  assert.equal(good.status, 200);
  assert(good.headers['Set-Cookie'].includes('HttpOnly; SameSite=Strict; Path=/; Max-Age=604800; Secure'));
  cookie = good.headers['Set-Cookie'].split(';')[0];
  assert(!cookie.includes(resume.person.phone.replace(/\D/g, '')));
  assert.equal(JSON.parse((await call(camera, { cookie })).body).authenticated, true);
}
assert.equal(authenticated({ headers: { cookie: cookie.slice(0, -1) + (cookie.endsWith('a') ? 'b' : 'a') } }), false);
const expired = createSession(Date.now() - (sessionSeconds + 1) * 1000);
assert.equal(authenticated({ headers: { cookie: 'camera_roll=' + expired } }), false);
assert.equal((await call(photo, { url: '/api/camera-photo?image=sf' })).status, 401);
assert.equal((await call(photo, { cookie, url: '/api/camera-photo?image=../../index.html' })).status, 404);
for (const name of await fs.readdir('private/camera-roll')) {
  const result = await call(photo, { cookie, url: '/api/camera-photo?image=' + name.replace('.webp', '') });
  assert.equal(result.status, 200);
  assert.equal(result.headers['Content-Type'], 'image/webp');
  assert.deepEqual(result.body, await fs.readFile('private/camera-roll/' + name));
  await assert.rejects(fs.access('images/notebook/' + name));
  await assert.rejects(fs.access('public-site/images/notebook/' + name));
}
const head = await call(photo, { method: 'HEAD', cookie, url: '/api/camera-photo?image=sf' });
assert.equal(head.status, 200); assert.equal(head.body, undefined);
assert((await call(camera, { method: 'DELETE', cookie })).headers['Set-Cookie'].includes('Max-Age=0'));
await assert.rejects(fs.access('public-site/private'));
await assert.rejects(fs.access('public-site/api'));
const html = await fs.readFile('public-site/index.html', 'utf8');
assert.equal((html.match(/data-src="\/api\/camera-photo\?/g) || []).length, 22);
assert(!html.includes('src="/images/notebook/sf.webp"'));
console.log('Camera checks passed: wrong/valid numbers, country codes, same-origin writes, signed expiry, private photos, traversal, no static originals, logout, and 22 protected images.');

import resume from '../lib/resume-data.json' with { type: 'json' };
import { authenticated, constantEqual, createSession, json, normalizePhone, privateResponse, setCookie } from '../lib/camera-auth.js';

export default async function handler(request, response) {
  privateResponse(response);
  if (request.method === 'GET') return json(response, 200, { authenticated: authenticated(request) });
  if (!['POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, DELETE');
    return json(response, 405, { error: 'Method not allowed' });
  }
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(request.headers.host || '');
  const expectedOrigin = `${local ? 'http' : 'https'}://${request.headers.host}`;
  if (request.headers.origin !== expectedOrigin || request.headers['sec-fetch-site'] === 'cross-site') return json(response, 403, { error: 'Please open the camera roll from this website.' });
  if (request.method === 'DELETE') {
    setCookie(response, '', request, true);
    return json(response, 200, { authenticated: false });
  }
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) return json(response, 415, { error: 'JSON required' });
  if (Number(request.headers['content-length']) > 256) return json(response, 413, { error: 'Request too large' });
  let body = request.body;
  try {
    if (!body) {
      let raw = '';
      for await (const chunk of request) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 256) return json(response, 413, { error: 'Request too large' });
      }
      body = JSON.parse(raw);
    } else if (typeof body === 'string' || Buffer.isBuffer(body)) body = JSON.parse(String(body));
  } catch { return json(response, 400, { error: 'Please enter a phone number.' }); }
  const phone = normalizePhone(body?.phone);
  if (!phone || !constantEqual(phone, normalizePhone(resume.person.phone))) return json(response, 401, { error: "That's not my number. Give it another try." });
  try {
    setCookie(response, createSession(), request);
    return json(response, 200, { authenticated: true });
  } catch { return json(response, 503, { error: "The roll isn't opening right now. Try again shortly." }); }
}

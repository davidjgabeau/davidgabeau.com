import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const cookieName = 'camera_roll';
export const sessionSeconds = 60 * 60 * 24 * 7;
function signature(value) {
  const secret = process.env.CAMERA_ROLL_SECRET;
  if (!secret || secret.length < 32) throw new Error('Camera roll is not configured');
  return createHmac('sha256', secret).update('camera-roll:' + value).digest('hex');
}
export function constantEqual(a, b) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function normalizePhone(value) {
  if (typeof value !== 'string' || value.length > 40 || !/^[+\d\s().-]+$/.test(value)) return '';
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}
export function createSession(now = Date.now()) {
  const value = `v1.${Math.floor(now / 1000) + sessionSeconds}.${randomBytes(16).toString('hex')}`;
  return value + '.' + signature(value);
}
export function authenticated(request, now = Date.now()) {
  const cookie = (request.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  if (!cookie || !/^v1\.\d{10}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(cookie)) return false;
  const parts = cookie.split('.'), expiry = Number(parts[1]), seconds = Math.floor(now / 1000);
  if (expiry <= seconds || expiry > seconds + sessionSeconds) return false;
  try { return constantEqual(parts[3], signature(parts.slice(0, 3).join('.'))); }
  catch { return false; }
}
export function setCookie(response, value, request, clear = false) {
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(request.headers.host || '');
  response.setHeader('Set-Cookie', `${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear ? 0 : sessionSeconds}${local ? '' : '; Secure'}`);
}
export function privateResponse(response) {
  response.setHeader('Cache-Control', 'private, no-store');
  response.setHeader('Vary', 'Cookie');
  response.setHeader('X-Robots-Tag', 'noindex, noimageindex');
  response.setHeader('X-Content-Type-Options', 'nosniff');
}
export function json(response, status, body) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  return response.end(JSON.stringify(body));
}

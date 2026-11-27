import { readFile } from 'node:fs/promises';
import { authenticated, json, privateResponse } from '../lib/camera-auth.js';

const names = new Set(['sf', 'childhood', 'smiles', 'dinner', 'sumo', 'wedding', 'cove', 'court', 'evening', 'desert', 'horse-beach']);
export default async function handler(request, response) {
  privateResponse(response);
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return json(response, 405, { error: 'Method not allowed' });
  }
  if (!authenticated(request)) return json(response, 401, { error: 'Open the camera roll first.' });
  const image = new URL(request.url, 'https://davidgabeau.com').searchParams.get('image') || '';
  if (!names.has(image.replace(/-sketch$/, ''))) return json(response, 404, { error: 'Photo not found' });
  try {
    const bytes = await readFile(new URL(`../private/camera-roll/${image}.webp`, import.meta.url));
    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Content-Length', bytes.length);
    response.statusCode = 200;
    return response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { return json(response, 404, { error: 'Photo not found' }); }
}

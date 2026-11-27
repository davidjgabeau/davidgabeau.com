import { renderResume, normalizeView } from '../lib/resume-page.js';

// The initial response contains the complete selected view, including for no-JS clients.
export default function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    return response.end('Method not allowed');
  }
  const url = new URL(request.url || '/resume', 'https://davidgabeau.com');
  const view = normalizeView(url.searchParams.get('view'));
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Vercel's cache key includes the URL query string, so view responses stay independent.
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  response.statusCode = 200;
  return response.end(request.method === 'HEAD' ? undefined : renderResume(view));
}

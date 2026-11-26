import { renderResume } from '../lib/resume-page.js';

// Return the entire resume in the initial HTTP response, without client-side rendering.
export default function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    return response.end('Method not allowed');
  }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60');
  response.statusCode = 200;
  return response.end(request.method === 'HEAD' ? undefined : renderResume());
}

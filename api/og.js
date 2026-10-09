// Keep older, cached preview URLs serving the current notebook artwork.
export const config = { runtime: 'edge' };
export default async function handler(req) {
  const image = await fetch(new URL('/images/social/notebook-v1.png', req.url));
  if (!image.ok) return new Response('Preview unavailable', { status: 502 });
  return new Response(image.body, { headers: {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  }});
}

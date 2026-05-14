import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

async function loadBundledFont(filename) {
  try {
    const res = await fetch(new URL(`./fonts/${filename}`, import.meta.url));
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function handler(req) {
  const url = new URL(req.url);
  const debug = url.searchParams.has('debug');

  try {
    const [newsreader] = await Promise.all([
      loadBundledFont('Newsreader-700.woff'),
    ]);

    const fonts = [];
    if (newsreader) fonts.push({ name: 'Newsreader', data: newsreader, weight: 700, style: 'normal' });

    const serif = newsreader ? 'Newsreader' : 'Georgia, serif';

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            background: '#ffffff',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '80px 96px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: serif,
                  fontWeight: 700,
                  color: '#000000',
                  lineHeight: 1.0,
                  fontSize: 144,
                  letterSpacing: '-2px',
                  marginBottom: 32,
                },
                children: [
                  { type: 'span', props: { style: { display: 'flex' }, children: 'David' } },
                  { type: 'span', props: { style: { display: 'flex' }, children: 'Gabeau' } },
                ],
              },
            },
            {
              type: 'span',
              props: {
                style: {
                  fontSize: 24,
                  color: '#666666',
                  fontFamily: serif,
                  fontWeight: 400,
                  letterSpacing: '0',
                  display: 'flex',
                },
                children: 'davidgabeau.com',
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts,
      }
    );
  } catch (err) {
    const msg = (err && (err.stack || err.message)) || String(err);
    if (debug) {
      return new Response('OG error: ' + msg, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ error: msg.slice(0, 600) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

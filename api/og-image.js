import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const debug = url.searchParams.has('debug');

  try {
    // Fetch Newsreader from the public static directory
    const fontUrl = `${url.origin}/fonts/Newsreader-700.woff`;
    let fontData = null;
    try {
      const res = await fetch(fontUrl);
      if (res.ok) fontData = await res.arrayBuffer();
    } catch (_) {}

    if (debug && !fontData) {
      return new Response('Font fetch failed from: ' + fontUrl, {
        headers: { 'content-type': 'text/plain' },
      });
    }

    const options = {
      width: 1200,
      height: 630,
    };

    if (fontData) {
      options.fonts = [{ name: 'Newsreader', data: fontData, weight: 700, style: 'normal' }];
    }

    const fontFamily = fontData ? 'Newsreader' : 'serif';

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
                  fontFamily,
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
                  fontFamily,
                  display: 'flex',
                },
                children: 'davidgabeau.com',
              },
            },
          ],
        },
      },
      options
    );
  } catch (err) {
    const msg = (err && (err.stack || err.message)) || String(err);
    return new Response('OG error: ' + msg, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
}

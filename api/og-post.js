import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Dynamic Open Graph card for writing posts.
// Usage: /api/og-post?title=Your%20Post%20Title&eyebrow=Essay
export default async function handler(req) {
  const url = new URL(req.url);
  const title = (url.searchParams.get('title') || 'David Gabeau').slice(0, 160);
  const eyebrow = (url.searchParams.get('eyebrow') || 'Writing').slice(0, 40);

  try {
    const bold = await fetch(`${url.origin}/fonts/Newsreader-700.woff`)
      .then(r => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);

    const fonts = [];
    // The repo ships only the 700 weight; register it for both weights so
    // satori renders the lighter byline without falling back to a system font.
    if (bold) {
      fonts.push({ name: 'Newsreader', data: bold, weight: 700, style: 'normal' });
      fonts.push({ name: 'Newsreader', data: bold, weight: 400, style: 'normal' });
    }

    const serif = fonts.length ? 'Newsreader' : 'Georgia, serif';

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            background: '#f0eee6',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '76px 88px',
            fontFamily: serif,
          },
          children: [
            // Eyebrow
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#b8924a',
                },
                children: eyebrow,
              },
            },
            // Title
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontSize: title.length > 70 ? 64 : 84,
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-2px',
                  color: '#1f1e1d',
                  marginTop: 28,
                  marginBottom: 'auto',
                },
                children: title,
              },
            },
            // Byline row
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 36,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { width: 14, height: 14, borderRadius: 999, background: '#b8924a', marginRight: 16, display: 'flex' },
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', fontSize: 28, fontWeight: 400, color: '#5e5d59' },
                      children: 'David Gabeau · davidgabeau.com',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { width: 1200, height: 630, fonts }
    );
  } catch (err) {
    const msg = (err && (err.stack || err.message)) || String(err);
    return new Response('OG error: ' + msg, { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}

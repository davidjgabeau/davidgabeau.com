import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const debug = url.searchParams.has('debug');

  try {
    // Load Newsreader 700 from Google Fonts
    let newsreader = null;
    try {
      const css = await fetch(
        'https://fonts.googleapis.com/css2?family=Newsreader:wght@700',
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      ).then(r => r.text());
      const u = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
      if (u) newsreader = await fetch(u).then(r => r.arrayBuffer());
    } catch (_) {}

    let caveat = null;
    try {
      const css = await fetch(
        'https://fonts.googleapis.com/css2?family=Caveat:wght@700',
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      ).then(r => r.text());
      const u = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
      if (u) caveat = await fetch(u).then(r => r.arrayBuffer());
    } catch (_) {}

    const serifFamily = newsreader ? 'Newsreader' : 'serif';
    const handFamily = caveat ? 'Caveat' : 'serif';

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            background: '#FAF6EE',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 88px',
            position: 'relative',
          },
          children: [
            // Watermark "05"
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: '24px',
                  right: '64px',
                  fontFamily: serifFamily,
                  fontWeight: 700,
                  fontSize: '280px',
                  color: '#EFE6D6',
                  letterSpacing: '-8px',
                  lineHeight: 0.85,
                },
                children: '05',
              },
            },
            // Eyebrow
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  color: '#E8600A',
                  marginBottom: '40px',
                  display: 'flex',
                  alignItems: 'center',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '32px',
                        marginRight: '14px',
                        lineHeight: 1,
                      },
                      children: '✦',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      children: 'A Playbook by David Gabeau',
                    },
                  },
                ],
              },
            },
            // Headline
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: serifFamily,
                  fontWeight: 700,
                  fontSize: '92px',
                  color: '#161616',
                  lineHeight: 1.02,
                  letterSpacing: '-2.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '32px',
                },
                children: [
                  { type: 'div', props: { children: '5 Steps to Building' } },
                  { type: 'div', props: { children: 'Anthropic’s NYC' } },
                  { type: 'div', props: { children: 'Startup Ecosystem.' } },
                ],
              },
            },
            // Sub
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '28px',
                  color: '#5E5A54',
                  lineHeight: 1.4,
                  maxWidth: '820px',
                },
                children: 'A founder’s playbook for turning Anthropic into the center of New York’s AI startup ecosystem.',
              },
            },
            // Bottom row
            {
              type: 'div',
              props: {
                style: {
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  width: '100%',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              width: '14px',
                              height: '14px',
                              borderRadius: '999px',
                              background: '#E8600A',
                              marginRight: '16px',
                            },
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '24px',
                              fontWeight: 600,
                              color: '#161616',
                            },
                            children: 'davidgabeau.com / anthropic',
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: handFamily,
                        fontSize: '44px',
                        color: '#E8600A',
                        transform: 'rotate(-3deg)',
                      },
                      children: 'Built with Claude.',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          ...(newsreader ? [{ name: 'Newsreader', data: newsreader, weight: 700, style: 'normal' }] : []),
          ...(caveat ? [{ name: 'Caveat', data: caveat, weight: 700, style: 'normal' }] : []),
        ],
      }
    );
  } catch (err) {
    const msg = (err && err.stack) || String(err);
    if (debug) {
      return new Response('OG error: ' + msg, {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ error: msg.slice(0, 500) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

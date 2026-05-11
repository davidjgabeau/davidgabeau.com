import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Bundle font files with the deployment via new URL + import.meta.url.
// External fetches to fonts.googleapis.com / cdn.jsdelivr.net are unreliable
// from Vercel Edge, so we ship the woff files directly in the repo.
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
    const [newsreader, inter600, inter400, caveat] = await Promise.all([
      loadBundledFont('Newsreader-700.woff'),
      loadBundledFont('Inter-600.woff'),
      loadBundledFont('Inter-400.woff'),
      loadBundledFont('Caveat-700.woff'),
    ]);

    const fonts = [];
    if (newsreader) fonts.push({ name: 'Newsreader', data: newsreader, weight: 700, style: 'normal' });
    if (inter600)   fonts.push({ name: 'Inter',      data: inter600,   weight: 600, style: 'normal' });
    if (inter400)   fonts.push({ name: 'Inter',      data: inter400,   weight: 400, style: 'normal' });
    if (caveat)     fonts.push({ name: 'Caveat',     data: caveat,     weight: 700, style: 'normal' });

    if (fonts.length === 0) {
      throw new Error('No bundled fonts could be loaded.');
    }

    const serif = newsreader ? 'Newsreader' : fonts[0].name;
    const sans  = (inter600 || inter400) ? 'Inter' : fonts[0].name;
    const hand  = caveat ? 'Caveat' : fonts[0].name;

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
            fontFamily: sans,
          },
          children: [
            // "05" watermark
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: '24px',
                  right: '64px',
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: '280px',
                  color: '#EFE6D6',
                  letterSpacing: '-8px',
                  lineHeight: 0.85,
                  display: 'flex',
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
                  { type: 'div', props: { style: { fontSize: '30px', marginRight: '14px', lineHeight: 1, display: 'flex' }, children: '✦' } },
                  { type: 'div', props: { style: { display: 'flex' }, children: 'A Playbook by David Gabeau' } },
                ],
              },
            },
            // Headline
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: serif,
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
                  { type: 'div', props: { style: { display: 'flex' }, children: '5 Steps to Building' } },
                  { type: 'div', props: { style: { display: 'flex' }, children: 'Anthropic’s NYC' } },
                  { type: 'div', props: { style: { display: 'flex' }, children: 'Startup Ecosystem.' } },
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
                  display: 'flex',
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
                      style: { display: 'flex', alignItems: 'center' },
                      children: [
                        { type: 'div', props: { style: { width: '14px', height: '14px', borderRadius: '999px', background: '#E8600A', marginRight: '16px', display: 'flex' } } },
                        { type: 'div', props: { style: { fontSize: '24px', fontWeight: 600, color: '#161616', display: 'flex' }, children: 'davidgabeau.com / anthropic' } },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { fontFamily: hand, fontSize: '46px', color: '#E8600A', transform: 'rotate(-3deg)', display: 'flex' },
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

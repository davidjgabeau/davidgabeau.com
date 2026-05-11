import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Build plain Satori-compatible element trees (no React needed).
function el(type, props, ...children) {
  const flat = children.flat().filter(c => c !== null && c !== undefined && c !== false);
  return { type, props: { ...(props || {}), children: flat.length === 1 ? flat[0] : flat } };
}

async function loadFont(family, weight) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    ).then(r => r.text());
    const url = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then(r => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function handler() {
  const [newsreader700, inter600, inter400, caveat700] = await Promise.all([
    loadFont('Newsreader', 700),
    loadFont('Inter', 600),
    loadFont('Inter', 400),
    loadFont('Caveat', 700),
  ]);

  const serif = newsreader700 ? 'Newsreader' : 'serif';
  const sans = inter600 ? 'Inter' : 'sans-serif';
  const hand = caveat700 ? 'Caveat' : 'cursive';

  const tree = el('div', {
    style: {
      background: '#FAF6EE',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      padding: '64px 80px',
      fontFamily: sans,
    },
  },
    // Faint "05" watermark
    el('div', {
      style: {
        position: 'absolute',
        top: '32px',
        right: '64px',
        fontFamily: serif,
        fontWeight: 700,
        fontSize: '260px',
        color: '#EFE6D6',
        lineHeight: 0.85,
        letterSpacing: '-8px',
        display: 'flex',
      },
    }, '05'),

    // Eyebrow row
    el('div', {
      style: {
        fontSize: '22px',
        fontWeight: 600,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: '#E8600A',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px',
      },
    },
      el('div', {
        style: {
          width: '20px',
          height: '20px',
          marginRight: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E8600A',
          fontSize: '32px',
          lineHeight: 1,
        },
      }, '✦'),
      el('div', { style: { display: 'flex' } }, 'A Playbook by David Gabeau')
    ),

    // Headline
    el('div', {
      style: {
        fontFamily: serif,
        fontWeight: 700,
        fontSize: '88px',
        color: '#161616',
        lineHeight: 1.0,
        letterSpacing: '-2px',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '28px',
      },
    },
      el('div', { style: { display: 'flex' } }, '5 Steps to Building'),
      el('div', { style: { display: 'flex' } }, 'Anthropic’s NYC'),
      el('div', { style: { display: 'flex' } }, 'Startup Ecosystem.')
    ),

    // Sub
    el('div', {
      style: {
        fontSize: '26px',
        color: '#5E5A54',
        fontWeight: 400,
        fontFamily: sans,
        maxWidth: '780px',
        lineHeight: 1.4,
        display: 'flex',
      },
    }, 'A founder’s playbook for turning Anthropic into the center of New York’s AI startup ecosystem.'),

    // Bottom row
    el('div', {
      style: {
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
      },
    },
      el('div', {
        style: { display: 'flex', alignItems: 'center' },
      },
        el('div', {
          style: {
            width: '12px',
            height: '12px',
            borderRadius: '999px',
            background: '#E8600A',
            marginRight: '14px',
            display: 'flex',
          },
        }),
        el('div', {
          style: {
            fontSize: '22px',
            fontWeight: 600,
            color: '#161616',
            fontFamily: sans,
            display: 'flex',
          },
        }, 'davidgabeau.com / anthropic')
      ),
      el('div', {
        style: {
          fontFamily: hand,
          fontSize: '40px',
          color: '#E8600A',
          transform: 'rotate(-3deg)',
          display: 'flex',
        },
      }, 'Built with Claude.')
    )
  );

  return new ImageResponse(tree, {
    width: 1200,
    height: 630,
    fonts: [
      ...(newsreader700 ? [{ name: 'Newsreader', data: newsreader700, weight: 700, style: 'normal' }] : []),
      ...(inter600 ? [{ name: 'Inter', data: inter600, weight: 600, style: 'normal' }] : []),
      ...(inter400 ? [{ name: 'Inter', data: inter400, weight: 400, style: 'normal' }] : []),
      ...(caveat700 ? [{ name: 'Caveat', data: caveat700, weight: 700, style: 'normal' }] : []),
    ],
  });
}

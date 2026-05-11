import { ImageResponse } from '@vercel/og';
import React from 'react';

export const config = { runtime: 'edge' };

const e = React.createElement;

export default async function handler() {
  // Load fonts from Google
  let newsreader700;
  let inter600;
  let caveat700;
  try {
    const [nrCss, intCss, cavCss] = await Promise.all([
      fetch('https://fonts.googleapis.com/css2?family=Newsreader:wght@700').then(r => r.text()),
      fetch('https://fonts.googleapis.com/css2?family=Inter:wght@600').then(r => r.text()),
      fetch('https://fonts.googleapis.com/css2?family=Caveat:wght@700').then(r => r.text()),
    ]);
    const nrUrl = nrCss.match(/url\(([^)]+\.woff2)\)/)?.[1];
    const intUrl = intCss.match(/url\(([^)]+\.woff2)\)/)?.[1];
    const cavUrl = cavCss.match(/url\(([^)]+\.woff2)\)/)?.[1];
    if (nrUrl) newsreader700 = await fetch(nrUrl).then(r => r.arrayBuffer());
    if (intUrl) inter600 = await fetch(intUrl).then(r => r.arrayBuffer());
    if (cavUrl) caveat700 = await fetch(cavUrl).then(r => r.arrayBuffer());
  } catch (_) {}

  const serif = newsreader700 ? 'Newsreader' : 'Georgia, serif';
  const sans = inter600 ? 'Inter' : 'system-ui, sans-serif';
  const hand = caveat700 ? 'Caveat' : 'cursive';

  return new ImageResponse(
    e('div', {
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
      // Faint giant "01 02 03 04 05" watermark
      e('div', {
        style: {
          position: 'absolute',
          top: 40,
          right: 60,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 240,
          color: '#EFE6D6',
          lineHeight: 0.85,
          letterSpacing: '-8px',
          display: 'flex',
        },
      }, '05'),

      // Eyebrow
      e('div', {
        style: {
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#E8600A',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 32,
        },
      },
        e('svg', { width: 22, height: 22, viewBox: '0 0 22 22', xmlns: 'http://www.w3.org/2000/svg' },
          e('path', {
            d: 'M11 1 L12.8 9.2 L 21 11 L 12.8 12.8 L 11 21 L 9.2 12.8 L 1 11 L 9.2 9.2 Z',
            fill: '#E8600A',
          })
        ),
        e('span', null, 'A Playbook by David Gabeau'),
      ),

      // Headline
      e('div', {
        style: {
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 84,
          color: '#161616',
          lineHeight: 1.0,
          letterSpacing: '-2px',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 28,
        },
      },
        e('span', null, '5 Steps to Building'),
        e('span', null, 'Anthropic’s NYC'),
        e('span', null, 'Startup Ecosystem.'),
      ),

      // Sub
      e('div', {
        style: {
          fontSize: 26,
          color: '#5E5A54',
          fontWeight: 400,
          fontFamily: sans,
          maxWidth: 760,
          lineHeight: 1.4,
          marginBottom: 48,
          display: 'flex',
        },
      }, 'A founder’s playbook for turning Anthropic into the center of New York’s AI startup ecosystem.'),

      // Bottom row: David Gabeau + handwritten note
      e('div', {
        style: {
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        },
      },
        e('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          },
        },
          // Orange dot
          e('div', {
            style: {
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#E8600A',
              display: 'flex',
            },
          }),
          e('span', {
            style: {
              fontSize: 22,
              fontWeight: 600,
              color: '#161616',
              fontFamily: sans,
              display: 'flex',
            },
          }, 'davidgabeau.com / anthropic'),
        ),
        // Handwritten accent
        e('span', {
          style: {
            fontFamily: hand,
            fontSize: 38,
            color: '#E8600A',
            transform: 'rotate(-3deg)',
            display: 'flex',
          },
        }, 'Built with Claude.')
      )
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(newsreader700 ? [{ name: 'Newsreader', data: newsreader700, weight: 700, style: 'normal' }] : []),
        ...(inter600 ? [{ name: 'Inter', data: inter600, weight: 600, style: 'normal' }] : []),
        ...(caveat700 ? [{ name: 'Caveat', data: caveat700, weight: 700, style: 'normal' }] : []),
      ],
    }
  );
}

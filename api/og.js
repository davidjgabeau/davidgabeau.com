import { ImageResponse } from '@vercel/og';
import React from 'react';

export const config = { runtime: 'edge' };

const e = React.createElement;

export default async function handler() {
  // Load Newsreader 700 from Google Fonts
  let fontData;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Newsreader:wght@700'
    ).then(r => r.text());
    const url = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
    if (url) fontData = await fetch(url).then(r => r.arrayBuffer());
  } catch (_) {}

  return new ImageResponse(
    e('div', {
      style: {
        background: '#ffffff',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '80px 96px',
      },
    },
      e('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          fontFamily: fontData ? 'Newsreader' : 'Georgia, serif',
          fontWeight: 700,
          color: '#000000',
          lineHeight: 1.0,
          fontSize: 144,
          letterSpacing: '-2px',
          marginBottom: 32,
        },
      },
        e('span', null, 'David'),
        e('span', null, 'Gabeau'),
      ),
      e('span', {
        style: {
          fontSize: 24,
          color: '#666666',
          fontFamily: fontData ? 'Newsreader' : 'Georgia, serif',
          fontWeight: 400,
          letterSpacing: '0',
        },
      }, 'davidgabeau.com')
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: 'Newsreader', data: fontData, weight: 700, style: 'normal' }]
        : [],
    }
  );
}

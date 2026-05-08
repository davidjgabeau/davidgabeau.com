import { ImageResponse } from '@vercel/og';
import React from 'react';

export const config = { runtime: 'edge' };

const e = React.createElement;

export default function handler() {
  return new ImageResponse(
    e('div', {
      style: {
        background: '#f0eee6',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 96px',
      },
    },
      e('div', { style: { display: 'flex', flexDirection: 'column' } },
        e('div', {
          style: {
            fontSize: 76,
            fontWeight: 700,
            color: '#1f1e1d',
            lineHeight: 1.05,
            letterSpacing: '-1px',
          },
        }, 'David Gabeau'),
        e('div', {
          style: { fontSize: 34, color: '#5e5d59', marginTop: 22, lineHeight: 1.4 },
        }, 'Founder & CEO, Tapestry'),
        e('div', {
          style: { fontSize: 26, color: '#87867f', marginTop: 12 },
        }, 'Open social graph for AI and social applications')
      ),
      e('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
      },
        e('div', { style: { fontSize: 22, color: '#a09e97' } }, 'davidgabeau.com'),
        e('div', { style: { fontSize: 28, color: '#b8924a' } }, '✶')
      )
    ),
    { width: 1200, height: 630 }
  );
}

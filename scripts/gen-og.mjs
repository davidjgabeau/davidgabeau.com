// Generate /public/og/anthropic.png locally so iMessage/X/etc share previews work.
// Run: node scripts/gen-og.mjs
import { ImageResponse } from '@vercel/og';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function readFont(filename) {
  return await fs.readFile(path.join(root, 'api', 'fonts', filename));
}

const [newsreader, inter600, inter400, caveat] = await Promise.all([
  readFont('Newsreader-700.woff'),
  readFont('Inter-600.woff'),
  readFont('Inter-400.woff'),
  readFont('Caveat-700.woff'),
]);

const fonts = [
  { name: 'Newsreader', data: newsreader, weight: 700, style: 'normal' },
  { name: 'Inter',      data: inter600,   weight: 600, style: 'normal' },
  { name: 'Inter',      data: inter400,   weight: 400, style: 'normal' },
  { name: 'Caveat',     data: caveat,     weight: 700, style: 'normal' },
];

const tree = {
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
      fontFamily: 'Inter',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: '24px',
            right: '64px',
            fontFamily: 'Newsreader',
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
      {
        type: 'div',
        props: {
          style: {
            fontFamily: 'Newsreader',
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
                style: { fontFamily: 'Caveat', fontSize: '46px', color: '#E8600A', transform: 'rotate(-3deg)', display: 'flex' },
                children: 'Built with Claude.',
              },
            },
          ],
        },
      },
    ],
  },
};

const response = new ImageResponse(tree, { width: 1200, height: 630, fonts });
const buf = Buffer.from(await response.arrayBuffer());
const outPath = path.join(root, 'anthropic', 'og.png');
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, buf);
console.log(`Wrote ${buf.length} bytes -> ${outPath}`);

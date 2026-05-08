import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function () {
  return new ImageResponse(
    <div
      style={{
        background: '#f0eee6',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 96px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: '#1f1e1d',
            lineHeight: 1.05,
            letterSpacing: '-1px',
          }}
        >
          David Gabeau
        </div>
        <div
          style={{
            fontSize: 34,
            color: '#5e5d59',
            marginTop: 22,
            lineHeight: 1.4,
          }}
        >
          Founder &amp; CEO, Tapestry
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#87867f',
            marginTop: 12,
          }}
        >
          Open social graph for AI and social applications
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 22, color: '#a09e97' }}>davidgabeau.com</div>
        <div style={{ fontSize: 28, color: '#b8924a' }}>✦</div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}

export const config = { runtime: 'edge' };

// Visitor counter: increments an atomic counter (Abacus, no visitor data sent)
// and reads the visitor's location from Vercel's built-in geo headers.
// The displayed number = BASE + real hits.
const BASE = 1000;
const COUNTER_URL = 'https://abacus.jasoncameron.dev/hit/davidgabeau-com/visitors';

export default async function handler(req) {
  let count = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(COUNTER_URL, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.value === 'number') count = BASE + data.value;
    }
  } catch {}

  const rawCity = req.headers.get('x-vercel-ip-city');
  const city = rawCity ? decodeURIComponent(rawCity) : null;
  const country = req.headers.get('x-vercel-ip-country') || null;

  return new Response(JSON.stringify({ count, city, country }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

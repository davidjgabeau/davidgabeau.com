# davidgabeau.com

Personal website for David Gabeau — founder of Tapestry, previously at Union Square Ventures, Snap, and Lyft.

Live at **[davidgabeau.com](https://davidgabeau.com)**

---

## Stack

- Plain HTML + CSS — no framework, no build step
- Vanilla JS for the Atlas embed and theme toggle
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) for all server-side logic
- [Newsreader](https://fonts.google.com/specimen/Newsreader) variable font, self-hosted
- [Vercel](https://vercel.com) for hosting and CI/CD
- Custom domain via GoDaddy, DNS A record pointed to Vercel

---

## File structure

```
website/
├── index.html                 # All content, structure, and client-side JS
├── style.css                  # All styles, dark mode, and responsive breakpoints
├── fonts/
│   ├── newsreader-normal.woff2
│   └── newsreader-italic.woff2
└── api/
    ├── ask-atlas.js           # Streaming Claude proxy for Ask Atlas modal
    ├── claude-starter-kit.js  # Streaming Claude proxy for /anthropic starter kit page
    ├── og.js                  # Dynamic OG image generation
    ├── og-anthropic.js        # OG image variant for the /anthropic subpage
    └── sitemap.js             # Dynamic XML sitemap with today's lastmod date
```

---

## API routes

### `POST /api/ask-atlas`

A Vercel Edge Function that proxies streaming requests to the Anthropic Messages API, powering the **Ask Atlas** modal — a conversational interface over the NYC AI startup ecosystem.

**How it works:**

1. Receives a `{ query }` JSON body from the client
2. Forwards it to `POST https://api.anthropic.com/v1/messages` using `claude-sonnet-4-5` with `stream: true`
3. Pipes Anthropic's SSE stream (`data: {...}` lines) through a `ReadableStream`, extracting `content_block_delta` text chunks and re-encoding them as raw UTF-8
4. Returns a streaming `text/plain` response the client reads with `response.body.getReader()`

The system prompt gives the model a detailed map of NYC AI categories (Enterprise GTM, Agent Infrastructure, Fintech & Trading AI, Health & Bio, etc.) and instructs it to be specific, opinionated, and under 150 words per response.

**Edge runtime** is used so the function starts globally with no cold start and can hold a long-lived streaming connection without hitting Vercel's serverless timeout.

```js
export const config = { runtime: 'edge' };
```

---

### `POST /api/claude-starter-kit`

Same streaming edge function pattern, but powers a separate tool on `/anthropic` — a Claude API onboarding guide generator. Takes `{ startup, building, stack }` and returns a tailored getting-started guide: which model to use, a first API call in the user's language, and production gotchas.

---

### `GET /api/og`

Generates the Open Graph image for social previews using [`@vercel/og`](https://vercel.com/docs/functions/og-image-generation), which runs [Satori](https://github.com/vercel/satori) at the edge to render JSX to a PNG.

**How it works:**

1. Fetches the Newsreader 700 CSS from Google Fonts, parses the `woff2` URL out of the response with a regex, then fetches the raw font bytes — all at request time
2. Passes the font buffer into `ImageResponse` so the generated image uses the same typeface as the site
3. Returns a 1200×630 PNG with the name rendered at 144px and the domain in muted subtext

Falls back to Georgia if the Google Fonts fetch fails.

---

### `GET /api/sitemap`

Returns a minimal XML sitemap with today's date as `lastmod`, computed dynamically at request time. Cached at the CDN edge for 24 hours (`s-maxage=86400`) with a 1-hour stale-while-revalidate window.

Vercel rewrites `/sitemap.xml` to this function via `vercel.json`:

```json
{ "source": "/sitemap.xml", "destination": "/api/sitemap" }
```

---

## AI Atlas NYC embed

The homepage includes a live embed of [aiatlas.nyc](https://aiatlas.nyc) — a market map of New York's early-stage AI ecosystem that rebuilds nightly via an agent pipeline.

**Client-side integration:**

1. On page load, fetches `https://aiatlas.nyc/api/embed/atlas?limit=12` — a JSON endpoint returning companies, category breakdown, latest funding signals, and observed market patterns
2. Renders the first 3 companies with logos (falling back to generated initials if the logo 404s), a stats line, and an **Ask Atlas →** button
3. The Ask Atlas button opens a modal that streams responses from `/api/ask-atlas`, maintaining a `conversationHistory` array for multi-turn context
4. The stream is consumed token-by-token with `response.body.getReader()` and rendered directly into the DOM as it arrives

The embed is intentionally compact — stats line + 3 companies — so it carries the same visual weight as other projects on the page.

---

## Frontend details

**Dark mode** — system preference is read via `matchMedia` on first load and stored in `localStorage`. Applied via an inline `<script>` in `<head>` before first paint to prevent flash.

**Scroll animations** — sections fade in using an `IntersectionObserver` with `threshold: 0.08`. Disabled entirely if `prefers-reduced-motion` is set.

**Reading progress bar** — a CSS `scaleX` transform on a fixed `div` driven by a passive `scroll` listener.

**Font loading** — Newsreader is self-hosted as a `woff2` file with `<link rel="preload">` to avoid FOUT. The variable font covers all weights from a single file.

**SEO** — Full Open Graph + Twitter Card meta, JSON-LD `Person` schema, canonical URL, `rel="noopener noreferrer"` on all external links.

---

## How it was built

This entire site was built using **[Claude Code](https://claude.ai/code)**, Anthropic's CLI for agentic software development. No code was written by hand.

Claude Code:
- Designed and wrote all HTML, CSS, and JS from scratch, iterating on layout against a reference aesthetic (darioamodei.com — minimal serif, narrow column, warm ivory background)
- Self-hosted the Newsreader font by downloading the woff2 files and writing the `@font-face` declarations
- Built all Vercel Edge Functions including the Anthropic streaming proxy and OG image generator
- Integrated the AI Atlas NYC API embed with a streaming conversational modal
- Configured Vercel deployment via the CLI and linked the custom domain
- Navigated GoDaddy's DNS panel through the Claude in Chrome browser extension to set the A record, resolving a conflict with an existing WebsiteBuilder record by reading the DNS diff with `dig`
- Iterated on design and copy in response to feedback, updating layout (monogram divider, writing list with dates, footer ornament) and bio text

---

Built with [Claude Code](https://claude.ai/code)

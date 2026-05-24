# davidgabeau.com

Personal website for David Gabeau — founder, developer, and investor. Previously at Union Square Ventures, Snap, and Lyft.

Live at **[davidgabeau.com](https://davidgabeau.com)**

Built and maintained by [David Gabeau](https://github.com/davidjgabeau) as sole developer.

---

## What It Is

A personal site that serves as a single place for professional background, current projects, writing, and live GitHub contribution activity. Designed to feel editorial and personal — not a portfolio template.

---

## Features

- **Bio and background** — Work history, investment activity, and professional context
- **Projects** — Current and past projects with descriptions, tech stack tags, and links
- **GitHub contribution heatmap** — Live contribution graph pulled from the GitHub GraphQL API via a Vercel Edge Function, showing real activity from the `davidjgabeau` account
- **AI Atlas embed** — Embedded view of [AI Atlas NYC](https://aiatlas.nyc) with a live Ask Atlas interface powered by Claude
- **Anthropic playbook page** — `/anthropic` — a standalone strategy and demo site exploring what a structured AI startup ecosystem program at Anthropic could look like, with live Claude API demos and an NYC AI ecosystem map
- **Dark/light theme** — System-preference-aware with a manual toggle
- **SEO and structured data** — JSON-LD schema, Open Graph tags, Twitter cards, sitemap, and robots.txt

---

## Stack

- **Plain HTML + CSS** — No framework, no build step for the main site
- **Vanilla JavaScript** — All interactivity: theme toggle, Atlas embed, Ask Atlas modal, GitHub heatmap rendering
- **[Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)** — Server-side API routes:
  - `/api/github-heatmap` — Fetches contribution data from GitHub's GraphQL API using a stored token
  - `/api/og-image` — Generates Open Graph images via `@vercel/og`
  - `/api/sitemap` — Dynamic sitemap generation
- **[Newsreader](https://fonts.google.com/specimen/Newsreader)** variable font, self-hosted for performance
- **[Vercel](https://vercel.com)** — Hosting, CI/CD, and Edge Function runtime
- Custom domain via GoDaddy, DNS A record pointed to Vercel

---

## File Structure

```
index.html              Main page — all content, scripts, and styles inline
style.css               Global stylesheet
favicon.svg             SVG favicon
fonts/                  Self-hosted Newsreader variable font files
images/                 Profile photo and other static assets
public/                 Additional static assets
api/
  github-heatmap.js     Edge Function — GitHub GraphQL contributions query
  og-image.jsx          Edge Function — Open Graph image generation
  sitemap.js            Edge Function — dynamic sitemap
scripts/
  gen-og.mjs            Local script for OG image generation
anthropic/
  index.html            Standalone Anthropic ecosystem playbook page
```

---

## Local Development

No build step required for the main site. Open `index.html` directly in a browser, or use any static file server:

```bash
npx serve .
```

For the Edge Functions (heatmap, OG image, sitemap), use the Vercel CLI:

```bash
npm install
vercel dev
```

This requires the environment variables below to be set in `.env.local`.

---

## Environment Variables

```bash
GITHUB_TOKEN=          # GitHub PAT with read:user scope — used by /api/github-heatmap
ANTHROPIC_API_KEY=     # Used by the Anthropic playbook page demos
```

---

## Deployment

Deployed to Vercel. Every push to `main` triggers an automatic production deployment.

```bash
git add .
git commit -m "your message"
git push
```

Vercel picks up the push, builds the Edge Functions, and deploys to production at `davidgabeau.com`.

---

## License

MIT

---

## Author

**[David Gabeau](https://github.com/davidjgabeau)** — sole developer.

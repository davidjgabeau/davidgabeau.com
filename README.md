# davidgabeau.com

Personal website for David Gabeau — founder of Tapestry, previously at Union Square Ventures, Snap, and Lyft.

Live at **[davidgabeau.com](https://davidgabeau.com)**

---

## How it was built

This entire site was built in a single session using **[Claude Code](https://claude.ai/code)**, Anthropic's CLI for agentic software development. No code was written by hand.

### What Claude Code did

- Designed and wrote all HTML and CSS from scratch, iterating on the layout until it matched a reference aesthetic (darioamodei.com — minimal serif, narrow column, warm ivory background)
- Self-hosted the Newsreader variable font (the same typeface used by Anthropic) by downloading the woff2 files and writing the `@font-face` declarations
- Added full SEO: Open Graph tags, Twitter Card metadata, JSON-LD `Person` schema, canonical URL, and `rel="noopener noreferrer"` on all external links
- Configured Vercel deployment via the CLI (`vercel --prod`) and linked the custom domain
- Navigated GoDaddy's DNS panel through the Claude in Chrome browser extension to set the A record pointing to Vercel's infrastructure — including resolving a conflict with an existing WebsiteBuilder record by reading the DNS diff with `dig`
- Iterated on design and copy in response to feedback, updating both the layout (monogram divider, writing list with dates, footer ornament) and the bio text

### Stack

- Plain HTML + CSS — no framework, no build step, no JavaScript
- [Newsreader](https://fonts.google.com/specimen/Newsreader) variable font, self-hosted
- [Vercel](https://vercel.com) for hosting and CI
- Custom domain via GoDaddy, DNS pointed to Vercel

### File structure

```
website/
├── index.html          # All content and structure
├── style.css           # All styles, including responsive breakpoints
└── fonts/
    ├── newsreader-normal.woff2
    └── newsreader-italic.woff2
```

---

Built with [Claude Code](https://claude.ai/code)

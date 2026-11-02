# Writing

Long-form posts for davidgabeau.com. Plain static HTML — no build step, same
as the rest of the site.

## How a post works

Each post is its own folder with an `index.html`, which gives it a clean URL:

```
writing/<slug>/index.html   →   davidgabeau.com/writing/<slug>
```

All styling lives in the shared `/style.css` under the `WRITING` section, so
posts automatically get the site's fonts, color tokens, dark mode, and reading
column. A post's `index.html` only carries content + the standard head/header/
footer scaffold.

## Adding a new post

1. Copy `writing/sample/index.html` to `writing/<your-slug>/index.html`.
2. Replace the content inside `<article>` and update the `<head>`:
   - `<title>`, `description`, `canonical`, and the OG/Twitter tags
   - Set the OG image to:
     `https://davidgabeau.com/api/og-post?eyebrow=Essay&title=<URL-encoded title>`
   - Remove the `noindex` robots tag once it's ready to be public.
3. Add a row to the **Writing** list in `/index.html` (`<ul id="writing-list">`)
   and bump the `section-count` ("N essays").
4. Add the post's URL to `api/sitemap.js`.

## Prose elements available

All styled and theme-aware — see `writing/sample` for a live specimen:

- `.article-eyebrow`, `.article-title`, `.article-dek`, `.article-meta`
- `.has-dropcap` on the first paragraph (optional)
- `h2` / `h3`, paragraphs, `<strong>` / `<em>`, links
- `<ul>` / `<ol>`, `<blockquote>`, `.pullquote`
- `<figure>` + `<figcaption>`, `<img>`
- `<hr>` (renders as a ✦ ornament break)
- inline `<code>` and `<pre><code>` blocks
- `.article-footnotes` with `<sup>` references
- `.article-footer` byline + share row

## Note

`writing/sample` is a template preview and is `noindex`. Keep it as a reference,
or delete it once you have real posts.

## Illustrated link previews

Pages use a 1200 × 630 PNG fallback plus a silent H.264 MP4 via `og:video`
for clients such as Apple Messages. Text stays still while the illustrations move.

Add future essays to the cards in `scripts/gen-notebook-previews.mjs`, then run:

```bash
FFMPEG_BIN=/path/to/ffmpeg node scripts/gen-notebook-previews.mjs
```

The generator uses the project's `@vercel/og` and `sharp` dependencies, writes
intermediate frames to `work/notebook-preview-frames`, and updates Open Graph,
Twitter image, and structured image metadata while preserving essay content.
The San Francisco bridge card uses `scripts/gen-sf-preview.mjs`.

Keep each still attractive on its own, use silent videos, and keep preview assets
below 10 MB combined. Existing messaging previews may retain cached artwork.

## Search and agent discovery

Run `npm run build:discovery` after changing public pages, then
`npm run check:discovery`. Deployment runs both automatically. The generator reads
published `BlogPosting` pages and skips `noindex` previews; it creates `/writing`,
`/feed.xml`, `/sitemap.xml`, the legacy sitemap API response, `/llms.txt`,
`/llms-full.txt`, and one Markdown copy per essay.

Use the canonical HTML as the source. Keep `datePublished` accurate, and update
`dateModified` and `article:modified_time` when editing an essay significantly.
Sitemap and feed modification times use Git history when available, otherwise the
page's saved modification timestamp. Dates never advance just because a crawler
requests the sitemap. Text companions are `noindex` to avoid duplicate results;
they remain accessible to agents. The primary essays and homepage stay indexable.

The homepage Person ID is `https://davidgabeau.com/#person`. Articles reference
that author, and the ProfilePage connects the name, current role, and public
profiles. Keep structured facts consistent with visible content. The public
contact email is the same address already linked on the homepage.

Search Console and Bing Webmaster Tools need verified domain ownership for
submission, indexing reports, and performance monitoring. Static files and a
valid sitemap cannot guarantee indexing, rankings, or citations in AI answers.

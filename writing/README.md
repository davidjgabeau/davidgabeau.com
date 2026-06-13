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

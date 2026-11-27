# Resume maintenance

`lib/resume-data.json` is the source for the server-rendered resume and all three PDFs. Employment records are shared across views. Views change summaries, metrics, skill ordering, project/publication ordering, and bullet priority; every online view retains the complete experience. PDF profiles select shorter, targeted content from the same records.

## Reconciled facts

- Current location: San Francisco, CA.
- Andreessen Horowitz, New Media Team: Product Lead, Cosign (Contract), Oct 2026-Present. This is a product role, with no investment decision-making claim.
- Tapestry (Zumi): Founder, CEO & Product Lead, Jan 2022-Aug 2026; historical location Brooklyn, NY.
- Union Square Ventures: Analyst, Mar 2020-Dec 2021. The two-of-eight sourcing metric refers specifically to 2020. Board meeting attendance is confirmed; broader participation is not claimed.
- Lyft: Quality Engineer, Rider Experience, Aug 2018-Feb 2020.
- Snapchat: QA Engineer, Stories, Dec 2015-Mar 2018.
- The Huffington Post: Software Engineer, May 2015-Dec 2015.
- New York University: coursework toward a Bachelor of Science, with no completed degree claim.

These facts follow the latest verified product and NVIDIA corporate-development resumes and explicit corrections provided on November 26, 2026. Older source documents do not override them.

## Views and URLs

- `/resume` (default) or `/resume?view=combined`
- `/resume?view=product`
- `/resume?view=investor`

View navigation is ordinary HTML navigation and works without JavaScript. The server returns the complete requested view. All views canonicalize to `/resume` to consolidate search signals; social metadata reflects the shared view. The resume remains absent from the homepage header, as requested.

## Updating and validating

1. Edit `lib/resume-data.json`. Keep factual records independent of view priorities. Add a shortened `pdfText` only when needed for concise PDF selections.
2. Run `scripts/build-resume-pdfs.py --work-dir <absolute-scratch-directory>` with Python providing `lxml` and `pdfplumber` on a Mac with Pages. `assets/resume-layout.docx` contains layout placeholders, not resume content; it preserves the approved Avenir Next and Arial typography. The builder uses the data source for every view, checks page counts, and writes provenance hashes to `resumes/manifest.json`.
3. Render and visually inspect all six PDF pages. Check that USV stays together on page one, every PDF is two pages, links work, text is selectable, and nothing clips.
4. Run `node scripts/build-discovery.mjs`, `node scripts/check-discovery.mjs`, and `node scripts/check-resume.mjs`. The deployment build rejects stale PDFs when data, layout, or builder hashes change.
5. Verify the three views on desktop and mobile, navigation with JavaScript disabled, PDF downloads, keyboard focus, structured data, and print output before deploying with the existing Vercel workflow.

PDFs live under `/resumes/`. The existing `/David_Gabeau_Resume.pdf` and `/resume.pdf` filenames serve the Combined PDF for existing bookmarks. All PDF responses carry download filenames and a canonical link to the HTML resume. Do not add a redirect from the HTML resume route to a PDF.

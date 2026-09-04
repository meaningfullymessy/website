# Meaningfully Messy

Astro site, deployed on Cloudflare Pages.

## Structure

```
src/pages/             one file per route — src/pages/about.astro -> /about
src/layouts/Layout.astro   shared <head>, header, footer — edit here to change them site-wide
src/components/        Header.astro, Footer.astro (used by Layout.astro)
src/templates/          copy-and-edit templates for new pages (see below) — not built as routes
src/styles/global.css   shared stylesheet, imported by Layout.astro — Astro fingerprints it on build
src/assets/images/      page images imported via astro:assets' <Image> — Astro optimizes/resizes these on build
public/                 served as-is, unhashed: fonts, favicon, logo, downloads, robots.txt, and one
                        copy of hero.jpg (kept unoptimized for the default social-share og:image, see below)
functions/              Cloudflare Pages Functions (small server-side endpoints, e.g. /api/subscribe)
scripts/pdf-sources/    editable HTML source for downloadable PDFs (see "Regenerating a PDF" below)
design/                 original Claude Design canvas source, not part of the deployed site
```

## Local development

```bash
npm install
npm run dev       # http://localhost:4321, live-reloads on save
npm run build     # writes the production site to dist/
npm run preview   # serve dist/ locally, to sanity-check a production build
```

## Creating a new page from the landing-page template

`src/templates/landing-page.astro` is a copy-and-edit starting point with a
headline, body copy, an image, and a call-to-action button already wired up
in the site's visual style.

1. Copy it into `src/pages/`, e.g.:
   ```bash
   cp src/templates/landing-page.astro src/pages/spring-workshop.astro
   ```
2. Edit the placeholders marked `EDIT ME` and the `[bracketed text]` inside.
3. Add your image to `src/assets/images/` and import it with `<Image>` (see
   an existing page like `src/pages/index.astro` for the pattern).
4. `npm run dev` to preview, then commit and open a PR.

The new page goes live at `/spring-workshop` (matching whatever you named
the file) once the PR is merged and deployed. It's automatically picked up
by the sitemap (see "SEO" below) — no extra step needed there.

## Regenerating a downloadable PDF

Downloadable PDFs (e.g. `public/downloads/seasonal-menus-printable.pdf`) are
generated from an editable HTML source in `scripts/pdf-sources/`, rendered
with Chromium's print engine — not hand-exported, so the content can be
edited as plain HTML/CSS and regenerated exactly.

Playwright is intentionally *not* a project dependency (it would download a
full Chromium binary on every future `npm install`, including Cloudflare's
build step), so install it temporarily to regenerate a PDF:

```bash
npm install -D playwright
node scripts/render-pdf.mjs scripts/pdf-sources/seasonal-menus.html public/downloads/seasonal-menus-printable.pdf
npm uninstall playwright
```

## Email signup (Kit)

The homepage newsletter form and the `/seasonal-menus` lead-magnet forms all
POST to `functions/api/subscribe.js`, a Cloudflare Pages Function that talks
to the Kit API server-side, so the Kit API key never reaches the browser.
On success each form navigates to a confirmation+shop page —
`/thank-you-newsletter` or `/thank-you-seasonal-menus` — which confirms the
signup and surfaces a curated set of product recommendations (source
content in `src/components/ShopRecommendations.astro`, shared by both
pages). Product photos and ShopMy links there are placeholders; see the
`TODO` at the top of that file.

It requires these Cloudflare Pages environment variables (dashboard → this
project → Settings → Environment variables → set for Production, as
Secrets):

- `KIT_API_KEY` — Kit's API key (Kit dashboard → Settings → Advanced → API)
- `KIT_FORM_ID` — Kit Form ID for the seasonal-menus lead magnet
- `KIT_NEWSLETTER_FORM_ID` — Kit Form ID for the homepage weekly-note signup

Each Form ID is the numeric ID of a Kit Form used as an automation entry
point (the "Joins a form" trigger), visible in the URL when editing that
form in the Kit dashboard. The client tells the function which one it means
via a `source` field (`"seasonal-menus"` or `"newsletter"`) — the function
only ever picks between those two known, whitelisted env vars.

## SEO

- **Sitemap**: the `@astrojs/sitemap` integration (wired in `astro.config.mjs`)
  generates `sitemap-index.xml`/`sitemap-0.xml` at build time from the
  site's actual routes — new pages are included automatically, no manual step.
- **`robots.txt`**: `public/robots.txt`, allows all crawlers and points at the sitemap.
- **Per-page metadata**: `Layout.astro` builds a canonical URL and Open
  Graph/Twitter tags from each page's `title`/`description` props. Pass an
  `ogImage` prop (a path under `public/`, e.g. `/assets/images/hero.jpg`) to
  override the default social-share image for a given page.

## Analytics

Cloudflare Web Analytics is enabled at the dashboard level (Analytics &
Logs → Web Analytics), which works with no code changes because the domain
is proxied through Cloudflare (orange-clouded DNS). Nothing in this repo to
maintain for it.

## Deploying

Connected to Cloudflare Pages, which redeploys automatically on every push
to `main`. Build settings (Cloudflare dashboard → this project → Settings →
Build):

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

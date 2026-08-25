# Meaningfully Messy

Astro site, deployed on Cloudflare Pages.

## Structure

```
src/pages/             one file per route — src/pages/about.astro -> /about
src/layouts/Layout.astro   shared <head>, header, footer — edit here to change them site-wide
src/components/        Header.astro, Footer.astro (used by Layout.astro)
src/templates/          copy-and-edit templates for new pages (see below) — not built as routes
src/styles/global.css   shared stylesheet, imported by Layout.astro — Astro fingerprints it on build
public/                 served as-is, unhashed: assets/images, favicon, downloads, logo
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
3. Add your image to `public/assets/images/` and point the `<img src>` at it.
4. `npm run dev` to preview, then commit and open a PR.

The new page goes live at `/spring-workshop` (matching whatever you named
the file) once the PR is merged and deployed.

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

## Deploying

Connected to Cloudflare Pages, which redeploys automatically on every push
to `main`. Build settings (Cloudflare dashboard → this project → Settings →
Build):

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

# Meaningfully Messy

Astro site, deployed on Cloudflare Pages.

## Structure

```
src/pages/             one file per route — src/pages/about.astro -> /about
src/layouts/Layout.astro   shared <head>, header, footer — edit here to change them site-wide
src/components/        Header.astro, Footer.astro (used by Layout.astro)
src/templates/          copy-and-edit templates for new pages (see below) — not built as routes
public/                 served as-is at the site root: assets/css, assets/images, favicon, logo
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

## Deploying

Connected to Cloudflare Pages, which redeploys automatically on every push
to `main`. Build settings (Cloudflare dashboard → this project → Settings →
Build):

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`

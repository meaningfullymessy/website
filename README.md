# Meaningfully Messy

Static one-page site.

## Structure

```
index.html            the site
assets/css/styles.css  styles
assets/images/         drop real photos here (see TODOs below)
design/                original Claude Design canvas source (not part of the deployed site)
```

## Before going live

Search the codebase for `TODO` — there are three things still using placeholders:

- The hero photo and the about-page portrait (`assets/images/`, referenced as placeholder blocks in `index.html`)
- The real Instagram URL (currently `href="#"` in the header and footer nav)

## Deploying

1. Push this folder to a GitHub repo (see commands below).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings: no build command, no framework preset — this is plain HTML/CSS. Leave the output directory as `/` (repo root).
4. Deploy. Cloudflare will redeploy automatically on every push to the main branch.

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

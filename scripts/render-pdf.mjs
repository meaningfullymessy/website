// Renders a print-ready HTML file (like scripts/pdf-sources/seasonal-menus.html)
// to a PDF using Chromium's print engine, one page per ".page" div sized to
// its own explicit width/height (e.g. 8.5in x 11in for Letter).
//
// Requires Playwright, which is intentionally NOT a project dependency (it
// would otherwise download a full Chromium binary on every future
// `npm install`, including Cloudflare's build step). Install it temporarily
// to run this:
//
//   npm install -D playwright
//   node scripts/render-pdf.mjs scripts/pdf-sources/seasonal-menus.html public/downloads/seasonal-menus-printable.pdf
//   npm uninstall playwright
import { chromium } from 'playwright';
import path from 'node:path';

const [, , sourceArg, outputArg] = process.argv;

if (!sourceArg || !outputArg) {
  console.error('Usage: node scripts/render-pdf.mjs <source.html> <output.pdf>');
  process.exit(1);
}

const sourcePath = path.resolve(sourceArg);
const outputPath = path.resolve(outputArg);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + sourcePath, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

await page.pdf({
  path: outputPath,
  width: '8.5in',
  height: '11in',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});

await browser.close();
console.log('Wrote', outputPath);

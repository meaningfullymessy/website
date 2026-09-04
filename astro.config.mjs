import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://meaningfullymessy.com',
  integrations: [
    sitemap({
      // Post-submit confirmation page — nothing to index, and visitors
      // should land here from a form redirect, not a search result.
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
});

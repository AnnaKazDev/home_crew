// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), tailwind(), sitemap()],
  server: { port: process.env.PORT ? parseInt(process.env.PORT) : 3001 },
  adapter: process.env.VERCEL ? vercel() : node({
    mode: 'standalone',
  }),
});

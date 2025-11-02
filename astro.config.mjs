// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), tailwind(), sitemap()],
  server: { port: 3001 },
  adapter: node({
    mode: "standalone",
  }),
});

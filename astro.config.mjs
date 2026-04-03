// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkMermaid from "remark-mermaidjs";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "http://localhost:43210",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
    mdx(),
    sitemap({}),
  ],
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
  build: {
    inlineStylesheets: "always",
  },
});

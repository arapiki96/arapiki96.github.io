import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

const isBuild = process.env.NODE_ENV === "production";

// Open external links in a new tab (build-time, no runtime JS).
// Internal/relative links are left untouched so they navigate in-place.
function rehypeExternalLinksNewTab() {
  return (tree) => {
    const visit = (node) => {
      if (
        node.type === "element" &&
        node.tagName === "a" &&
        typeof node.properties?.href === "string" &&
        /^https?:\/\//i.test(node.properties.href)
      ) {
        node.properties.target = "_blank";
        node.properties.rel = "noopener noreferrer";
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: 'https://www.thomasmanch.com',
  integrations: [react(), markdoc(), sitemap(), ...(isBuild ? [] : [keystatic()])],
  markdown: {
    rehypePlugins: [rehypeExternalLinksNewTab],
  },
});

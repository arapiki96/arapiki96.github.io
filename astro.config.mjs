import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

const isBuild = process.env.NODE_ENV === "production";

export default defineConfig({
  site: 'https://arapiki96.github.io',
  integrations: [react(), markdoc(), sitemap(), ...(isBuild ? [] : [keystatic()])],
});

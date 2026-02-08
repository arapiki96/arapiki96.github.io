import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

const isBuild = process.env.NODE_ENV === "production";

export default defineConfig({
  site: 'https://arapiki96.github.io',
  integrations: [react(), markdoc(), ...(isBuild ? [] : [keystatic()])],
});

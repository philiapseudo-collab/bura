import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid', // Enable SSR for dynamic routes while keeping static pages
  integrations: [react(), tailwind()],
  adapter: vercel(),
});
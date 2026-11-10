import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Content (data.js, art.js) and assets stay in the repo root so the plain site and the OS share one source.
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react()],
  // dev: serve the repo root so /assets/... resolves; build: copy nothing, the live site already has assets/
  publicDir: command === 'serve' ? '..' : false,
  // Pages serves the repo as-is (no build step): the desktop is the site's home page, so the build
  // writes the repo-root index.html and puts its JS/CSS in /desktop. package.json clears /desktop first.
  build: { outDir: '..', emptyOutDir: false, assetsDir: 'desktop' },
  server: { fs: { allow: ['..'] } },
}));

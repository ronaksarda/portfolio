import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Content (data.js, art.js) and assets stay in the repo root so the plain site and the OS share one source.
export default defineConfig({
  base: './',
  plugins: [react()],
  publicDir: '../assets',
  // Pages serves the repo as-is (no build step), so the built desktop is committed in /desktop
  build: { outDir: '../desktop', emptyOutDir: true },
  server: { fs: { allow: ['..'] } },
});

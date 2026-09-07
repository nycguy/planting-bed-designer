import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works at the site root or under
// https://<user>.github.io/<repo>/ on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
});

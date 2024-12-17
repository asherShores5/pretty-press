// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'prettier': ['prettier/standalone', 'prettier/parser-babel', 'prettier/parser-html', 'prettier/parser-postcss'],
          'js-beautify': ['js-beautify'],
          'marked': ['marked']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
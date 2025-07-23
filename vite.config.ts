import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/games/cricket/guess_the_stats',
  plugins: [react()],
  server: {
    proxy: {
      '/api/sheets/spreadsheets': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sheets/, ''),
        secure: true,
        followRedirects: true
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

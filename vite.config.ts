import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/games/cricket/guess_the_stats',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

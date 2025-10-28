import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5173,
      overlay: false // Disable error overlay to prevent constant updates
    },
    watch: {
      usePolling: false, // Disable polling to prevent constant file watching
      interval: 1000 // Increase interval to reduce file system checks
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

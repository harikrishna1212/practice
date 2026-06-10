import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // When the real backend is wired in, API calls can be proxied to the
    // Spring Boot service to avoid CORS issues during local development.
    proxy: {
      '/api': {
        target: 'http://localhost:8095',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

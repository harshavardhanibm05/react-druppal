import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy all /api/* requests to the local Drupal site to avoid CORS issues
    // during development. The /api prefix is stripped before forwarding.
    proxy: {
      '/api': {
        target: 'http://my-druppal-test.ddev.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

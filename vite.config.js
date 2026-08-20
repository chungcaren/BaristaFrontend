import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = process.env.VITE_BACKEND_ORIGIN ?? 'https://baristabackend.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The browser calls /api/* and Vite forwards it to the backend, so the
      // request is server-to-server and never needs CORS. Netlify does the
      // same thing in production — see netlify.toml.
      // Point at a local backend with:
      //   VITE_BACKEND_ORIGIN=http://127.0.0.1:8000 npm run dev
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

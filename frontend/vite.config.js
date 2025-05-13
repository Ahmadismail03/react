import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js



export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your backend server
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
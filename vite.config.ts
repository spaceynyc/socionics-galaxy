import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 3302, host: true, allowedHosts: true },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          "three-core": ["three", "@react-three/fiber"],
          "three-drei": ["@react-three/drei"],
          "postfx-vendor": ["@react-three/postprocessing", "postprocessing"],
        },
      },
    },
  },
})

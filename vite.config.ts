import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { manifest } from './pwa-manifest.ts'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from the root of its custom domain, https://trip.kitshelf.app/
  base: '/',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      // Ask before switching to a new version so a game is never reloaded mid-round.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest,
    }),
  ],
})

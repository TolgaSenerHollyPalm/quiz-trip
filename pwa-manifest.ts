import type { ManifestOptions } from 'vite-plugin-pwa'

// start_url and scope are filled in by vite-plugin-pwa from Vite's `base`.
export const manifest: Partial<ManifestOptions> = {
  name: 'TripKit',
  short_name: 'TripKit',
  description: 'Gezi sayacı, hazırlık listesi ve yolda oynanan çevrimdışı bilgi yarışması',
  lang: 'tr',
  display: 'standalone',
  // Must match the light <meta name="theme-color"> in index.html.
  theme_color: '#0a7d76',
  background_color: '#f0faf8',
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}

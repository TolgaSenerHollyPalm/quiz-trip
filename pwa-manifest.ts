import type { ManifestOptions } from 'vite-plugin-pwa'

// start_url and scope are filled in by vite-plugin-pwa from Vite's `base`.
export const manifest: Partial<ManifestOptions> = {
  name: 'Trip Quiz',
  short_name: 'Trip Quiz',
  description: 'Gezi grubunuz için çevrimdışı bilgi ve tahmin yarışması',
  lang: 'tr',
  display: 'standalone',
  // Must match <meta name="theme-color"> in index.html.
  theme_color: '#0f766e',
  background_color: '#f4f7f6',
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

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// Hide from search engines unless VITE_ROBOTS is set (e.g. 'index, follow' at public launch)
process.env.VITE_ROBOTS ??= 'noindex, nofollow';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'favicon-48.png', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Khoborpath – News for BCS & Job Prep',
          short_name: 'Khoborpath',
          description: 'Read the news. Ace the exam. Daily newspaper editorials turned into BCS study material.',
          theme_color: '#006A4E',
          background_color: '#FAFAF9',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          lang: 'en',
          orientation: 'portrait',
          categories: ['education', 'news'],
        },
        workbox: {
          // Cache the news JSON so the app opens offline with the last real articles
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.endsWith('/articles.json') || url.pathname.endsWith('/health.json'),
              handler: 'NetworkFirst',
              options: { cacheName: 'news-data', networkTimeoutSeconds: 8, expiration: { maxEntries: 4 } },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: { cacheName: 'news-images', expiration: { maxEntries: 150, maxAgeSeconds: 7 * 24 * 3600 } },
            },
          ],
        },
        devOptions: {
          enabled: false, // keep dev fast and avoid service worker cache interfering in dev container
        },
      }),
    ],
    build: {
      // Broad phone support incl. old iPhones (iPhone 7 / iOS 15): code and CSS are down-compiled
      target: ['chrome87', 'safari14', 'firefox78', 'edge88'],
      cssTarget: ['chrome87', 'safari14', 'firefox78', 'edge88'],
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

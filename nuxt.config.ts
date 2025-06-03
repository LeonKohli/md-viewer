import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/seo',
    '@nuxt/scripts',
    '@vite-pwa/nuxt',
  ],
  future: {
    compatibilityVersion: 4,
  },
  // Basic SEO site configuration
  site: {
    name: 'Markdown Editor',
    description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities',
    defaultLocale: 'en',
  },
  css: [
    '~/assets/css/main.css',
    'katex/dist/katex.min.css',
    // Removed highlight.js theme - using custom CSS variables instead
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  colorMode: {
    classSuffix: ''
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['highlight.js/lib/core'] // Avoids Nitro cold-start cost
    }
  },
  // Umami Analytics configuration for self-hosted instance
  scripts: {
    registry: {
      umamiAnalytics: {
        websiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || 'YOUR_WEBSITE_ID',
        scriptInput: {
          src: process.env.NUXT_PUBLIC_UMAMI_HOST ? `${process.env.NUXT_PUBLIC_UMAMI_HOST}/script.js` : 'https://cloud.umami.is/script.js'
        }
      }
    }
  },
  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate', // Automatically update service worker
    manifest: {
      name: 'Markdown Editor',
      short_name: 'MD Editor',
      description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities',
      theme_color: 'hsl(48 33.3333% 97.0588%)',
      background_color: 'hsl(48 33.3333% 97.0588%)',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      prefer_related_applications: false,
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      screenshots: [
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ],
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui', 'browser']
    },
    workbox: {
      navigateFallback: '/', // Fallback page for offline navigation
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'], // Files to cache
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit to handle large script files
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true, // Show install prompt
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: true, // Enable in development for testing
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  }
})
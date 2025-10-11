import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-09-25',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxtjs/color-mode', '@nuxtjs/seo', '@nuxt/scripts', '@vite-pwa/nuxt', 'nuxt-auth-utils'],
  // Basic SEO site configuration
  site: {
    name: 'Markdown Editor',
    description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities',
    defaultLocale: 'en',
  },
  // OG Image configuration to avoid prerendering errors
  ogImage: {
    enabled: false, // Disable automatic OG image generation during build
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
      navigateFallbackDenylist: [
        /^\/auth/, // Exclude auth routes
        /^\/api/, // Exclude API routes
        /^\/login/, // Exclude login page
        /\?.*$/ // Exclude URLs with query parameters (for auth callbacks)
      ],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'], // Files to cache
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit to handle large script files
      cleanupOutdatedCaches: true, // Remove old caches automatically
      clientsClaim: true, // Take control of pages immediately on activation
      skipWaiting: true, // Skip waiting phase for immediate activation
      runtimeCaching: [
        // NetworkFirst for authentication and session endpoints
        {
          urlPattern: /\/api\/_auth\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'auth-cache',
            networkTimeoutSeconds: 3,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // NetworkFirst for API endpoints
        {
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 5 // 5 minutes
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // CacheFirst for fonts
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
      installPrompt: false, // Use default browser install prompt
      periodicSyncForUpdates: 3600 // Check for updates every hour
    },
    devOptions: {
      enabled: true, // Enable in development for testing
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },
  // Prerender the homepage for offline support
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  // GitHub OAuth configuration
  runtimeConfig: {
    oauth: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }
    }
  },
  // Use RouterOptions to handle auth redirects
  routeRules: {
    '/login': { index: false }
  }
})
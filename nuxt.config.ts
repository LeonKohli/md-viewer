import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-09-25',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxtjs/color-mode', '@nuxtjs/seo', '@nuxt/scripts', 'nuxt-auth-utils'],
  site: {
    name: 'Markdown Editor',
    description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities',
    defaultLocale: 'en',
  },
  css: [
    '~/assets/css/main.css',
    'katex/dist/katex.min.css',
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
  scripts: {
    registry: {
      umamiAnalytics: {
        websiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || 'YOUR_WEBSITE_ID',
        scriptInput: {
          src: process.env.NUXT_PUBLIC_UMAMI_HOST ? `${process.env.NUXT_PUBLIC_UMAMI_HOST}/script.js` : ''
        }
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false,
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

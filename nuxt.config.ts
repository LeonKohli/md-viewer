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
  }
})
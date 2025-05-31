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
  ],
  future: {
    compatibilityVersion: 4,
  },
  // Basic SEO site configuration
  site: {
    url: 'https://example.com',
    name: 'Markdown Editor',
    description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities',
    defaultLocale: 'en',
  },
  // Simple SEO settings
  seo: {
    redirectToCanonicalSiteUrl: true,
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
})
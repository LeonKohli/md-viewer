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
    name: 'Nuxt Shadcn Boilerplate',
    description: 'A modern Nuxt 4 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO',
    defaultLocale: 'en',
  },
  // Simple SEO settings
  seo: {
    redirectToCanonicalSiteUrl: true,
  },
  css: ['~/assets/css/main.css'],
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
  },
})
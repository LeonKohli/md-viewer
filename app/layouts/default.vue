<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
    <Navbar />

    <main class="flex-1" role="main">
      <slot />
    </main>

    <footer role="contentinfo" class="py-6 px-4 text-center text-xs text-muted-foreground border-t">
      <p>&copy; {{ new Date().getFullYear() }} Nuxt Shadcn Boilerplate. Built with modern web technologies.</p>
      <p class="mt-2 text-xs text-muted-foreground">
        A production-ready starter template for your next project.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Basic SEO meta tags for the layout
useSeoMeta({
  title: 'Nuxt Shadcn Boilerplate',
  ogTitle: 'Nuxt Shadcn Boilerplate',
  description: 'A modern Nuxt 3 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO optimization.',
  ogDescription: 'A modern Nuxt 3 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO optimization.',
})

// Define Schema.org structured data
useSchemaOrg([
  defineWebSite({
    name: 'Nuxt Shadcn Boilerplate',
    description: 'A modern Nuxt 3 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO optimization.',
  }),
])
</script>

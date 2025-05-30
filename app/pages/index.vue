<template>
  <!-- 
    The main layout (default.vue) already provides the global header/navbar and footer.
    We only provide the main content here to avoid duplication and ensure a single source of truth.
  -->
  <div class="container mx-auto px-4 py-12">
    <!-- Hero Section -->
    <section class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        Modern Nuxt 3 Boilerplate
      </h1>
      <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        A production-ready starter template with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO optimization.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <!-- Use Button, not UiButton, for consistency with the design system -->
        <Button size="lg">
          <Icon name="lucide:rocket" class="mr-2 h-4 w-4" />
          Get Started
        </Button>
        <Button variant="outline" size="lg" as="a" href="https://github.com/leonkohli/nuxt-boilerplate" target="_blank" rel="noopener" aria-label="GitHub Repository">
          <Icon name="lucide:github" class="mr-2 h-4 w-4" />
          View on GitHub
        </Button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold text-center mb-12">Key Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:palette" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">shadcn-vue</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Beautiful, accessible components built with Reka UI and styled with Tailwind CSS.
          </p>
        </Card>

        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:wind" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">Tailwind CSS</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Utility-first CSS framework for rapid UI development with modern design patterns.
          </p>
        </Card>

        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:zap" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">VueUse</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Collection of essential Vue composition utilities for enhanced development experience.
          </p>
        </Card>

        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:moon" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">Color Mode</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Built-in dark/light mode support with smooth transitions and system preference detection.
          </p>
        </Card>

        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:search" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">SEO Optimized</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Pre-configured SEO settings with meta tags, Open Graph, and structured data support.
          </p>
        </Card>

        <Card class="p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <div class="flex items-center mb-4">
            <Icon name="lucide:shield-check" class="h-8 w-8 text-primary mr-3" />
            <h3 class="text-lg font-semibold">Type Safe</h3>
          </div>
          <p class="text-muted-foreground leading-relaxed">
            Full TypeScript support with auto-generated types and excellent developer experience.
          </p>
        </Card>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="text-center">
      <h2 class="text-3xl font-bold mb-8">Built With</h2>
      <div class="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
        <div class="flex items-center space-x-2 transition-colors hover:text-foreground">
          <Icon name="logos:nuxt-icon" class="h-6 w-6" />
          <span>Nuxt 3</span>
        </div>
        <div class="flex items-center space-x-2 transition-colors hover:text-foreground">
          <Icon name="logos:vue" class="h-6 w-6" />
          <span>Vue 3</span>
        </div>
        <div class="flex items-center space-x-2 transition-colors hover:text-foreground">
          <Icon name="logos:tailwindcss-icon" class="h-6 w-6" />
          <span>Tailwind CSS</span>
        </div>
        <div class="flex items-center space-x-2 transition-colors hover:text-foreground">
          <Icon name="logos:typescript-icon" class="h-6 w-6" />
          <span>TypeScript</span>
        </div>
        <div class="flex items-center space-x-2 transition-colors hover:text-foreground">
          <Icon name="logos:vitejs" class="h-6 w-6" />
          <span>Vite</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Basic SEO for the home page
useSeoMeta({
  title: 'Nuxt Shadcn Boilerplate',
  description: 'A modern Nuxt 4 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO.',
  ogTitle: 'Nuxt Shadcn Boilerplate',
  ogDescription: 'A modern Nuxt 4 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO.',
  ogType: 'website',
})

defineOgImageComponent('NuxtSeo')
</script>
<template>
  <div class="h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
    <!-- Enhanced navbar for the markdown viewer -->
    <MarkdownNavbar 
      v-model:markdown-content="markdownContent"
      v-model:is-fullscreen="isFullscreen"
      @clear-content="handleClearContent"
      @load-sample="handleLoadSample"
      @reset-panels="handleResetPanels"
      class="flex-shrink-0"
    />

    <main class="flex-1 overflow-hidden" role="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Global states for the markdown editor
const markdownContent = useState('markdownContent', () => '')
const isFullscreen = useState('isFullscreen', () => false)
const resetPanelsEvent = useState('resetPanelsEvent', () => 0)

// Event handlers
const handleClearContent = () => {
  // Additional logic can be added here if needed
}

const handleLoadSample = () => {
  // Additional logic can be added here if needed
}

const handleResetPanels = () => {
  resetPanelsEvent.value = Date.now()
}

// SEO meta tags for the layout
useSeoMeta({
  title: 'Markdown Preview - Live Editor',
  ogTitle: 'Markdown Preview - Live Editor',
  description: 'A beautiful, modern markdown editor with live preview, syntax highlighting, and professional formatting tools. Built with Nuxt.js and Vue 3.',
  ogDescription: 'A beautiful, modern markdown editor with live preview, syntax highlighting, and professional formatting tools.',
})

// Define Schema.org structured data
useSchemaOrg([
  defineWebSite({
    name: 'Markdown Preview',
    description: 'A beautiful, modern markdown editor with live preview, syntax highlighting, and professional formatting tools.',
  }),
])
</script>

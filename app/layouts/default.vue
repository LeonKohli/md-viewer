<template>
  <div :class="[
    'h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden',
    isFullscreen ? 'fixed inset-0 z-50' : ''
  ]">
    <!-- Enhanced navbar for the markdown viewer -->
    <MarkdownNavbar 
      v-model:markdown-content="markdownContent"
      v-model:is-fullscreen="isFullscreen"
      :rendered-html="renderedHtml"
      :toc-headings="tocHeadings"
      @clear-content="handleClearContent"
      @load-sample="handleLoadSample"
      @reset-panels="handleResetPanels"
      @toggle-toc="handleToggleToc"
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
const showToc = useState('showToc', () => false)
const renderedHtml = useState<string>('renderedHtml', () => '')
const tocHeadings = useState<any[]>('tocHeadings', () => [])

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

const handleToggleToc = () => {
  showToc.value = !showToc.value
}

// Add keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  // TOC shortcut (Ctrl/Cmd + /)
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    handleToggleToc()
  }
}

useEventListener('keydown', handleKeydown)

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

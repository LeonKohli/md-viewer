<template>
  <div :class="[
    'h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden',
    isFullscreen ? 'fixed inset-0 z-50' : ''
  ]">
    <!-- Toast notifications -->
    <ToastContainer />
    
    <!-- Enhanced navbar for the markdown viewer -->
    <MarkdownNavbar 
      v-model:markdown-content="markdownContent"
      v-model:is-fullscreen="isFullscreen"
      :rendered-html="renderedHtml"
      :toc-headings="tocHeadings"
      :current-filename="currentGistFilename"
      :has-unsaved-changes="hasUnsavedChanges"
      @clear-content="handleClearContent"
      @load-sample="handleLoadSample"
      @reset-panels="handleResetPanels"
      @toggle-toc="handleToggleToc"
      @open-share="handleOpenShare"
      @open-gists="handleOpenGists"
      @save-gist="handleSaveGist"
      @new-gist="handleNewGist"
      @load-gist="handleLoadGist"
      class="flex-shrink-0"
    />

    <main class="flex-1 overflow-hidden" role="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">

// Shared state via composables (Nuxt 4 pattern)
const markdownContent = useMarkdownContent()
const isFullscreen = useIsFullscreen()
const resetPanelsEvent = useResetPanelsEvent()
const showToc = useShowToc()
const renderedHtml = useRenderedHtml()
const tocHeadings = useTocHeadings()
const showShareDialog = useShowShareDialog()
const showGistManager = useShowGistManager()
const showSaveGistDialog = useShowSaveGistDialog()
const currentGistFilename = useCurrentGistFilename()
const hasUnsavedChanges = useHasUnsavedChanges()

const handleResetPanels = () => {
  resetPanelsEvent.value = Date.now()
}

const handleToggleToc = () => {
  showToc.value = !showToc.value
}

const handleOpenShare = () => {
  showShareDialog.value = true
}

const handleOpenGists = () => {
  showGistManager.value = true
}

const handleSaveGist = () => {
  // Check if there's content to save
  const content = markdownContent.value
  if (!content || content.trim() === '') {
    const { warning } = useToast()
    warning('No content to save as gist')
    return
  }
  showSaveGistDialog.value = true
}

const handleNewGist = () => {
  const forceNewGist = useForceNewGist()
  forceNewGist.value = true
  showSaveGistDialog.value = true
}

const gistToLoad = useGistToLoad()

const handleLoadGist = (gist: any) => {
  // Set the gist in global state so the index page can handle it
  gistToLoad.value = gist
}

const handleClearContent = () => {
  // Content already cleared via v-model from navbar emit
  currentGistFilename.value = ''
  hasUnsavedChanges.value = false
}

const handleLoadSample = () => {
  // Content already set via v-model from navbar emit
  currentGistFilename.value = ''
  hasUnsavedChanges.value = false
}

// Add keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  // TOC shortcut (Ctrl/Cmd + /)
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    handleToggleToc()
  }
  
  // Share shortcut (Ctrl/Cmd + Shift + S)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault()
    handleOpenShare()
  }
  
  // Save gist shortcut (Ctrl/Cmd + G)
  if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
    e.preventDefault()
    handleSaveGist()
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

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
    
    <!-- Toast notifications -->
    <ToastContainer />
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
const showShareDialog = useState('showShareDialog', () => false)
const showGistManager = useState('showGistManager', () => false)
const showSaveGistDialog = useState('showSaveGistDialog', () => false)
const currentGistFilename = useState('currentGistFilename', () => '')
const hasUnsavedChanges = useState('hasUnsavedChanges', () => false)

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
  // Create a global state for forcing new gist
  const forceNewGist = useState('forceNewGist', () => false)
  forceNewGist.value = true
  showSaveGistDialog.value = true
}

// Create a global state for gist loading events
const gistToLoad = useState<any>('gistToLoad', () => null)

const handleLoadGist = (gist: any) => {
  // Set the gist in global state so the index page can handle it
  gistToLoad.value = gist
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

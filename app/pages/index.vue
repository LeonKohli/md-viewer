<template>
  <div class="h-full flex flex-col">
    <!-- Recovery Prompt -->
    <RecoveryPrompt
      :show="showRecoveryPrompt"
      :content="recoverableContent"
      @recover="recoverContent"
      @discard="discardRecovery"
    />
    
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Editor Panel -->
      <div 
        class="border-r border-border flex flex-col"
        :style="{ width: `${isFocusMode ? 0 : editorWidth}%` }"
        v-show="!isFocusMode && editorWidth > 5"
      >
        <!-- Editor Header -->
        <div class="px-4 py-1.5 border-b border-border bg-muted/50 text-sm font-medium flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:file-text" class="w-4 h-4" />
            Editor
          </div>
          <div class="flex items-center gap-2">
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <Button 
                v-if="markdownInput.length > 0"
                variant="ghost"
                size="sm"
                @click="clearEditor"
                class="h-7 px-2 text-xs hover:text-destructive transition-colors"
                title="Clear editor (Ctrl+Shift+K)"
                aria-label="Clear editor"
              >
                <Icon name="lucide:x" class="h-3 w-3" />
              </Button>
            </Transition>
            
            <!-- Undo clear notification -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="showClearUndo" class="flex items-center gap-1 text-xs">
                <span class="text-muted-foreground">Cleared</span>
                <Button
                  variant="link"
                  size="sm"
                  @click="undoClear"
                  class="h-auto p-0 text-xs font-normal underline-offset-2"
                >
                  Undo
                </Button>
              </div>
            </Transition>
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button 
                  variant="ghost"
                  size="sm" 
                  @click="toggleSync"
                  :class="{ 'bg-accent text-accent-foreground': syncEnabled }"
                  class="h-7 px-2 text-xs"
                >
                  <Icon :name="scrollSyncIcon" class="h-3 w-3 mr-1" />
                  <span>Sync</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ scrollSyncTooltip }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            <Button 
              variant="ghost"
              size="sm" 
              @click="toggleWordWrap"
              :class="{ 'bg-accent text-accent-foreground': wordWrap }"
              class="h-7 px-2 text-xs"
            >
              Wrap
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              class="lg:hidden p-1"
              @click="togglePreview"
              :aria-label="showPreview ? 'Switch to editor' : 'Switch to preview'"
            >
              <Icon :name="showPreview ? 'lucide:edit-3' : 'lucide:eye'" class="h-3 w-3" />
            </Button>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 relative overflow-hidden" :class="{ 'hidden lg:block': showPreview }">
          <Textarea
            ref="textareaRef"
            v-model="markdownInput"
            placeholder="Start typing your markdown here...

# Heading 1
## Heading 2
**Bold text** and *italic text*
- List item
[Link](https://example.com)
`inline code`"
            :class="[
              'h-full w-full resize-none border-0 bg-transparent dark:bg-transparent p-4 focus-visible:ring-0 font-mono text-sm leading-relaxed editor-scrollbar',
              wordWrap ? '' : 'whitespace-nowrap overflow-x-auto'
            ]"
            spellcheck="false"
            @input="onInputChange"
            @paste="handlePaste"
          />
        </div>

        <!-- Editor Status -->
        <div class="px-4 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground flex justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <span>{{ stats.characters }} characters</span>
            <span>{{ stats.lines }} lines</span>
          </div>
          <SaveStatusIndicator
            :save-status="saveStatus"
            :save-error="saveError"
            :last-save-time-ago="lastSaveTimeAgo?.value || null"
            :has-unsaved-changes="hasUnsavedChanges"
            :has-content="markdownInput.length > 0"
          />
        </div>
      </div>

      <!-- Resize Handle -->
      <div 
        ref="dragHandleRef"
        v-show="!isFocusMode"
        class="relative flex-shrink-0 group"
        :class="[
          isAtEdge ? 'w-2 bg-border/50 hover:bg-accent' : 'w-1 bg-border hover:bg-accent',
          isDragging ? 'bg-accent' : ''
        ]"
        @dblclick="resetToCenter"
        :title="isAtEdge ? 'Double-click to center panels' : 'Drag to resize panels'"
        style="cursor: col-resize;"
      >
        <!-- Visual handle indicator -->
        <div class="absolute inset-y-0 -left-1 -right-1 bg-transparent group-hover:bg-accent/20 dark:group-hover:bg-accent/10 transition-colors">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-muted-foreground/30 dark:bg-muted-foreground/20 rounded-full group-hover:bg-accent-foreground/60 dark:group-hover:bg-accent-foreground/40 transition-colors"></div>
        </div>
        
        <!-- Reset hint when at edges -->
        <div 
          v-if="isAtEdge"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        >
          <div class="bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-md">
            Double-click to center
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div 
        class="flex flex-col"
        :style="{ width: `${isFocusMode ? 100 : previewWidth}%` }"
        :class="{ 'hidden lg:flex': !showPreview && editorWidth > 5 && !isFocusMode }"
      >
        <!-- Preview Header -->
        <div class="px-4 py-1.5 border-b border-border bg-muted/50 text-sm font-medium flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:eye" class="w-4 h-4" />
            Preview
          </div>
          <div class="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="sm" 
              @click="toggleFocusMode"
              :class="{ 'bg-accent text-accent-foreground': isFocusMode }"
              class="h-7 px-2 text-xs hidden lg:flex"
              title="Toggle focus mode"
            >
              <Icon :name="isFocusMode ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="h-3 w-3 mr-1" />
              <span>{{ isFocusMode ? 'Exit' : 'Focus' }}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              class="lg:hidden p-1"
              @click="togglePreview"
              aria-label="Switch to editor"
            >
              <Icon name="lucide:edit-3" class="h-3 w-3" />
            </Button>
          </div>
        </div>

        <!-- Preview Content -->
        <div ref="previewContainerRef" class="flex-1 overflow-auto bg-background preview-scrollbar">
          <div 
            v-if="renderedHtml"
            class="p-6 prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:tracking-tight prose-h1:text-2xl lg:prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-xl lg:prose-h2:text-3xl prose-h2:font-semibold prose-h3:text-lg lg:prose-h3:text-2xl prose-h3:font-semibold prose-h4:text-base lg:prose-h4:text-xl prose-h4:font-semibold prose-p:leading-7 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-code:relative prose-code:rounded prose-code:font-mono prose-code:text-sm prose-table:text-sm dark:prose-headings:text-foreground dark:prose-p:text-muted-foreground dark:prose-strong:text-foreground dark:prose-a:text-primary dark:prose-blockquote:text-muted-foreground dark:prose-blockquote:border-muted dark:prose-th:text-foreground dark:prose-td:text-muted-foreground"
            v-html="renderedHtml"
          />
          <div v-else class="p-6 flex items-center justify-center h-full text-muted-foreground">
            <div class="text-center">
              <Icon name="lucide:file-text" class="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p class="text-lg font-medium mb-2">Start typing to see preview</p>
              <p class="text-sm opacity-70">Your markdown will appear here</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table of Contents Panel -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div v-if="showToc" class="absolute right-0 top-0 h-full shadow-xl">
          <TableOfContents
            :headings="tocHeadings"
            :active-heading-id="activeHeadingId"
            @navigate="navigateToHeading"
            @close="showToc = false"
          />
        </div>
      </Transition>
    </div>

    <!-- Status Bar -->
    <div class="border-t border-border bg-muted/50 px-6 py-2 text-xs text-muted-foreground flex items-center justify-between flex-shrink-0">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <div class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
          Live Preview
        </span>
        <span>•</span>
        <span class="flex items-center gap-1">
          <Icon 
            :name="scrollSyncIcon" 
            class="h-3 w-3"
            :class="{
              'text-green-500 dark:text-green-400': scrollSyncStatus === 'enabled',
              'text-muted-foreground': scrollSyncStatus === 'disabled'
            }"
          />
          <span>
            Scroll {{ scrollSyncStatus === 'disabled' ? 'sync off' : 'sync on' }}
          </span>
        </span>
        <span>•</span>
        <span>{{ stats.words }} words</span>
      </div>
      <div class="flex items-center gap-4">
        <span>Markdown</span>
        <span>•</span>
        <span>UTF-8</span>
        <span>•</span>
        <span>Ln {{ cursorPosition.line }}, Col {{ cursorPosition.column }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TocItem } from '~/composables/useTableOfContents'

// SEO Meta
useSeoMeta({
  title: 'Markdown Editor - Live Preview & Export',
  description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities. Supports GitHub Flavored Markdown, KaTeX math, and Mermaid diagrams.',
  ogTitle: 'Markdown Editor - Live Preview & Export',
  ogDescription: 'Write markdown with live preview, syntax highlighting, and advanced features.',
  twitterTitle: 'Markdown Editor - Live Preview & Export',
  twitterDescription: 'Write markdown with live preview, syntax highlighting, and advanced features.',
})

// Composables
const { 
  markdownInput, 
  renderedHtml, 
  textareaRef, 
  wordWrap, 
  showPreview, 
  cursorPosition, 
  stats, 
  onInputChange, 
  toggleWordWrap, 
  togglePreview,
  // Auto-save
  saveStatus,
  saveError,
  lastSaveTimeAgo,
  hasUnsavedChanges,
  showRecoveryPrompt,
  recoverableContent,
  saveNow,
  recoverContent,
  discardRecovery
} = useMarkdownEditor()

const { editorWidth, previewWidth, isAtEdge, dragHandleRef, isDragging, resetToCenter } = useResizablePanels()

const { 
  syncEnabled, 
  toggleSync,
  scrollSyncIcon,
  scrollSyncTooltip,
  scrollSyncStatus,
  setEditorElement,
  setPreviewElement,
  scrollToElement
} = useScrollSync()

// Preview container ref
const previewContainerRef = ref<HTMLElement>()

// Table of Contents
const { 
  headings: tocHeadings, 
  activeHeadingId, 
  updateActiveHeading,
  setActiveHeading
} = useTableOfContents(markdownInput, renderedHtml)

// Navigate to heading
const navigateToHeading = async (id: string) => {
  await nextTick()
  
  const element = document.getElementById(id)
  if (element) {
    setActiveHeading(id)
    scrollToElement(element)
    // Update URL hash without triggering browser scroll
    history.replaceState(null, '', `#${id}`)
  }
}

// Clear editor with undo support
const clearedContent = ref<string>('')
const showClearUndo = ref(false)
let clearUndoTimeout: NodeJS.Timeout | null = null

const clearEditor = () => {
  // Save current content for undo
  if (markdownInput.value) {
    clearedContent.value = markdownInput.value
    showClearUndo.value = true
    
    // Auto-hide undo after 10 seconds
    if (clearUndoTimeout) clearTimeout(clearUndoTimeout)
    clearUndoTimeout = setTimeout(() => {
      showClearUndo.value = false
      clearedContent.value = ''
    }, 10000)
  }
  
  markdownInput.value = ''
  // Clear saved content after a delay to prevent recovery prompt
  setTimeout(() => {
    if (!markdownInput.value && !showClearUndo.value) {
      const { clearSavedContent } = useAutoSave()
      clearSavedContent()
    }
  }, 15000) // 15 seconds - longer than undo timeout
}

const undoClear = () => {
  if (clearedContent.value) {
    markdownInput.value = clearedContent.value
    showClearUndo.value = false
    clearedContent.value = ''
    if (clearUndoTimeout) clearTimeout(clearUndoTimeout)
  }
}

// Set up active heading detection
const updateActiveHeadingDebounced = useDebounceFn(() => {
  if (previewContainerRef.value) {
    updateActiveHeading(previewContainerRef.value)
  }
}, 100)

// Set up scroll listener when preview element is ready
let scrollListener: (() => void) | null = null

// Use watchEffect for automatic cleanup
const stopWatchingScroll = watch(previewContainerRef, (newContainer, oldContainer) => {
  // Remove old listener
  if (oldContainer && scrollListener) {
    oldContainer.removeEventListener('scroll', scrollListener)
    scrollListener = null
  }
  
  // Add new listener
  if (newContainer) {
    scrollListener = () => updateActiveHeadingDebounced()
    newContainer.addEventListener('scroll', scrollListener, { passive: true })
  }
}, { immediate: true })

// Clean up everything on unmount
onUnmounted(() => {
  // Stop the watcher
  stopWatchingScroll()
  
  // Remove scroll listener if it exists
  if (previewContainerRef.value && scrollListener) {
    previewContainerRef.value.removeEventListener('scroll', scrollListener)
    scrollListener = null
  }
})

// Global state
const isFullscreen = useState('isFullscreen', () => false)
const resetPanelsEvent = useState('resetPanelsEvent', () => 0)
const showToc = useState('showToc', () => false)
const globalRenderedHtml = useState<string>('renderedHtml', () => '')
const globalTocHeadings = useState<TocItem[]>('tocHeadings', () => [])

// Local state
const isFocusMode = ref(false)

// Toggle focus mode
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
  // Exit focus mode when resetting panels
  if (isFocusMode.value) {
    showToc.value = false
  }
}

// Watch for reset panels events from navbar
watch(resetPanelsEvent, (timestamp) => {
  if (timestamp > 0) {
    resetToCenter()
    isFocusMode.value = false
  }
})

// Set up scroll sync elements
watchEffect(() => {
  // Access the actual textarea element from the Textarea component
  if (textareaRef.value && textareaRef.value.textareaElement) {
    setEditorElement(textareaRef.value.textareaElement)
  }
  
  // Set the preview container element
  if (previewContainerRef.value) {
    setPreviewElement(previewContainerRef.value)
  }
})

// Get mermaid render function from plugin
const { $renderMermaid } = useNuxtApp()

// Update active heading when content changes
watch(renderedHtml, () => {
  // Update active heading after content renders
  nextTick(() => {
    updateActiveHeadingDebounced()
    // Render Mermaid diagrams if present
    if ($renderMermaid) {
      $renderMermaid()
    }
  })
  // Update global rendered HTML
  globalRenderedHtml.value = renderedHtml.value
})

// Update global TOC headings when they change
watch(tocHeadings, () => {
  globalTocHeadings.value = tocHeadings.value
}, { deep: true })


// Handle paste event for immediate save
const handlePaste = () => {
  // Let Vue update the model first
  nextTick(() => {
    // The auto-save composable will detect the large change and save immediately
  })
}

// Keyboard shortcuts - define handler outside to ensure proper cleanup
const handleKeydown = (e: KeyboardEvent) => {
  // Clear editor: Ctrl/Cmd + Shift + K
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
    e.preventDefault()
    clearEditor()
  }
  
  // Manual save: Ctrl/Cmd + S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveNow()
  }
  
  // Detect undo/redo for immediate save
  if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
    // Save after undo/redo operation completes
    setTimeout(() => {
      if (hasUnsavedChanges.value) {
        saveNow()
      }
    }, 50)
  }
}

// Set up keyboard listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

// Clean up keyboard listener
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
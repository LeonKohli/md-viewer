<template>
  <div class="h-full flex flex-col">
    <!-- Recovery Prompt -->
    <RecoveryPrompt
      :show="showRecoveryPrompt"
      :content="recoverableContent"
      @recover="recoverContent"
      @discard="discardRecovery"
    />
    
    <!-- Share Dialog -->
    <ShareDialog
      v-model="showShareDialog"
      :content="markdownInput"
      :title="documentTitle"
    />
    
    <!-- Gist Manager -->
    <GistManager
      v-model="showGistManager"
      @select="loadGist"
      @create="handleCreateNewGist"
    />
    
    <!-- Save Gist Dialog -->
    <SaveGistDialog
      v-model="showSaveGistDialog"
      :content="markdownInput"
      :existing-gist="forceNewGist ? null : (currentGist as Gist)"
      :current-filename="currentGistFilename"
      @saved="handleGistSaved"
      @createNew="clearCurrentGist"
    />
    
    <!-- Gist File Selector -->
    <GistFileSelector
      v-model="showFileSelector"
      :gist="gistToLoad!"
      @select="loadGistFile"
    />
    
    <!-- Shared Document Banner -->
    <div 
      v-if="isViewingSharedDocument"
      class="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between"
    >
      <div class="flex items-center gap-2 text-sm">
        <Icon name="lucide:eye" class="w-4 h-4" />
        <span>Viewing shared document{{ sharedDocumentTitle ? ': ' + sharedDocumentTitle : '' }}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        @click="makeEditableCopy"
      >
        <Icon name="lucide:edit" class="w-4 h-4 mr-1.5" />
        Make a Copy
      </Button>
    </div>
    
    <!-- Mobile Tab Navigation -->
    <div class="flex md:hidden border-b border-border bg-background">
      <button
        @click="activeTab = 'editor'"
        :class="[
          'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
          activeTab === 'editor' 
            ? 'text-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <Icon name="lucide:edit-3" class="w-4 h-4" />
          <span>Editor</span>
        </div>
        <div 
          v-if="activeTab === 'editor'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      </button>
      <button
        @click="activeTab = 'preview'"
        :class="[
          'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
          activeTab === 'preview' 
            ? 'text-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <Icon name="lucide:eye" class="w-4 h-4" />
          <span>Preview</span>
        </div>
        <div 
          v-if="activeTab === 'preview'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        />
      </button>
    </div>
    
    <!-- Main Content -->
    <div 
      class="flex-1 overflow-hidden relative"
      :class="[
        'flex',
        splitMode === 'horizontal' ? 'flex-row' : 'flex-col'
      ]"
    >
      <!-- Editor Panel -->
      <div 
        class="flex flex-col overflow-hidden"
        :class="[
          splitMode === 'horizontal' ? 'md:border-r md:border-border' : 'md:border-b md:border-border',
          // On mobile, show based on active tab
          activeTab === 'editor' ? 'flex' : 'hidden',
          // On desktop, use resizable panels
          'md:flex'
        ]"
        :style="isDesktop ? (splitMode === 'horizontal' 
          ? { width: `${isFocusMode ? 0 : editorSize}%` }
          : { height: `${isFocusMode ? 0 : editorSize}%` }
        ) : { width: '100%' }"
        v-show="isDesktop ? (!isFocusMode && editorSize > 5) : (activeTab === 'editor')"
      >
        <!-- Editor Header -->
        <div class="px-3 md:px-4 py-1.5 border-b border-border bg-muted/50 text-sm font-medium flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:file-text" class="w-4 h-4" />
            <span class="hidden md:inline">Editor</span>
            <!-- Show current filename when connected to gist -->
            <span v-if="currentGist && currentGistFilename" class="text-xs text-muted-foreground">
              <span class="mx-1">·</span>
              {{ currentGistFilename }}
            </span>
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
                v-if="markdownInput.length > 0 && !isViewingSharedDocument"
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
                  class="h-7 px-2 text-xs hidden md:flex"
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
            <!-- Mobile preview toggle button removed - using tabs instead -->
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 relative overflow-hidden">
          <Textarea
            ref="textareaRef"
            v-model="markdownInput"
            :placeholder="isMobile ? 'Start typing...' : 'Start typing your markdown here...\n\n# Heading 1\n## Heading 2\n**Bold text** and *italic text*\n- List item\n[Link](https://example.com)\n`inline code`'"
            :class="[
              'h-full w-full resize-none border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 font-mono text-sm leading-relaxed editor-scrollbar',
              'p-3 md:p-4',
              wordWrap ? '' : 'whitespace-nowrap overflow-x-auto'
            ]"
            :readonly="isViewingSharedDocument"
            spellcheck="false"
            @input="onInputChange"
            @paste="handlePaste"
          />
        </div>

        <!-- Editor Status -->
        <div class="px-3 md:px-4 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground flex justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <span>{{ stats.characters }} characters</span>
            <span>{{ stats.lines }} lines</span>
            <!-- Gist status indicator -->
            <ClientOnly>
              <GistStatusBar 
                v-if="currentGist"
                :current-gist="currentGist as Gist"
                :last-saved="lastGistSaveTime"
                :is-syncing="isSavingGist"
                :current-filename="currentGistFilename"
                class="border-l pl-3"
              />
            </ClientOnly>
          </div>
          <ClientOnly>
            <SaveStatusIndicator
              :save-status="saveStatus"
              :save-error="saveError"
              :last-save-time-ago="lastSaveTimeAgo?.value || null"
              :has-unsaved-changes="hasUnsavedChanges"
              :has-content="markdownInput.length > 0"
              :is-connected-to-gist="!!currentGist"
            />
          </ClientOnly>
        </div>
      </div>

      <!-- Resize Handle - Desktop Only -->
      <div 
        ref="dragHandleRef"
        v-show="isDesktop && !isFocusMode"
        class="relative flex-shrink-0 group hidden md:block"
        :class="[
          splitMode === 'horizontal' ? [
            isAtEdge ? 'w-2 bg-border/50 hover:bg-accent' : 'w-1 bg-border hover:bg-accent'
          ] : [
            isAtEdge ? 'h-2 bg-border/50 hover:bg-accent' : 'h-1 bg-border hover:bg-accent'
          ],
          isDragging ? 'bg-accent' : ''
        ]"
        @dblclick="resetToCenter"
        :title="isAtEdge ? 'Double-click to center panels' : 'Drag to resize panels'"
        :style="{ cursor: splitMode === 'horizontal' ? 'col-resize' : 'row-resize' }"
      >
        <!-- Visual handle indicator -->
        <div 
          :class="[
            'absolute bg-transparent group-hover:bg-accent/20 dark:group-hover:bg-accent/10 transition-colors',
            splitMode === 'horizontal' ? 'inset-y-0 -left-1 -right-1' : 'inset-x-0 -top-1 -bottom-1'
          ]"
        >
          <div 
            :class="[
              'absolute transform -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/30 dark:bg-muted-foreground/20 rounded-full group-hover:bg-accent-foreground/60 dark:group-hover:bg-accent-foreground/40 transition-colors',
              splitMode === 'horizontal' ? 'top-1/2 left-1/2 w-1 h-8' : 'top-1/2 left-1/2 w-8 h-1'
            ]"
          ></div>
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
        class="flex flex-col overflow-hidden"
        :class="[
          // On mobile, show based on active tab
          activeTab === 'preview' ? 'flex' : 'hidden',
          // On desktop, always show unless in focus mode
          'md:flex'
        ]"
        :style="isDesktop ? (splitMode === 'horizontal' 
          ? { width: `${isFocusMode ? 100 : previewSize}%` }
          : { height: `${isFocusMode ? 100 : previewSize}%` }
        ) : { width: '100%' }"
        v-show="isDesktop ? true : (activeTab === 'preview')"
      >
        <!-- Preview Header -->
        <div class="px-3 md:px-4 py-1.5 border-b border-border bg-muted/50 text-sm font-medium flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:eye" class="w-4 h-4" />
            <span class="hidden md:inline">Preview</span>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    @click="toggleSplitMode"
                    class="h-7 px-2 text-xs hidden lg:inline-flex items-center gap-1"
                    :disabled="isMobile"
                  >
                    <Icon 
                      :name="splitMode === 'horizontal' ? 'lucide:rows-2' : 'lucide:columns-2'" 
                      class="h-3 w-3" 
                    />
                    <span class="hidden xl:inline text-xs">
                      {{ splitMode === 'horizontal' ? 'Vertical' : 'Horizontal' }}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{{ splitMode === 'horizontal' ? 'Switch to vertical split' : 'Switch to horizontal split' }} ({{ splitMode === 'horizontal' ? 'Ctrl+Alt+V' : 'Ctrl+Alt+H' }})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <!-- Mobile editor toggle button removed - using tabs instead -->
          </div>
        </div>

        <!-- Preview Content -->
        <div ref="previewContainerRef" class="flex-1 overflow-auto bg-background preview-scrollbar">
          <div 
            v-if="renderedHtml"
            class="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:tracking-tight prose-h1:font-extrabold prose-h2:font-semibold prose-h3:font-semibold prose-h4:font-semibold prose-p:leading-7 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-code:relative prose-code:rounded prose-code:font-mono prose-code:text-sm prose-table:text-sm dark:prose-headings:text-foreground dark:prose-p:text-muted-foreground dark:prose-strong:text-foreground dark:prose-a:text-primary dark:prose-blockquote:text-muted-foreground dark:prose-blockquote:border-muted dark:prose-th:text-foreground dark:prose-td:text-muted-foreground"
            :class="[
              'p-4 md:p-6',
              'prose-h1:text-xl md:prose-h1:text-2xl lg:prose-h1:text-4xl',
              'prose-h2:text-lg md:prose-h2:text-xl lg:prose-h2:text-3xl',
              'prose-h3:text-base md:prose-h3:text-lg lg:prose-h3:text-2xl',
              'prose-h4:text-sm md:prose-h4:text-base lg:prose-h4:text-xl'
            ]"
            v-html="renderedHtml"
          />
          <div v-else class="p-4 md:p-6 flex items-center justify-center h-full text-muted-foreground">
            <div class="text-center">
              <Icon name="lucide:file-text" class="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-40" />
              <p class="text-base md:text-lg font-medium mb-1 md:mb-2">Start typing to see preview</p>
              <p class="text-xs md:text-sm opacity-70">Your markdown will appear here</p>
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
    <StatusBar 
      :stats="stats"
      :cursor-position="cursorPosition"
      :sync-enabled="syncEnabled"
      :scroll-sync-icon="scrollSyncIcon"
      :has-content="!!markdownInput"
    />
  </div>
</template>

<script setup lang="ts">
import type { TocItem } from '~/composables/useTableOfContents'
import type { Gist, GistFile } from '~/types/gist'
import ShareDialog from '~/components/ShareDialog.vue'
import GistManager from '~/components/GistManager.vue'
import SaveGistDialog from '~/components/SaveGistDialog.vue'
import GistFileSelector from '~/components/GistFileSelector.vue'

// SEO Meta
useSeoMeta({
  title: 'Markdown Editor - Live Preview',
  description: 'A powerful online markdown editor with live preview, syntax highlighting, table of contents, and export capabilities. Supports GitHub Flavored Markdown, KaTeX math, and Mermaid diagrams.',
  ogTitle: 'Markdown Editor - Live Preview',
  ogDescription: 'Write markdown with live preview, syntax highlighting, and advanced features.',
  twitterTitle: 'Markdown Editor - Live Preview',
  twitterDescription: 'Write markdown with live preview, syntax highlighting, and advanced features.',
})

// Define custom OG image for this page
defineOgImageComponent('MarkdownPreview', {
  title: 'Markdown Editor',
  description: 'Write beautiful Markdown with live preview and advanced features',
  colorMode: 'dark'
})

// Composables
const { 
  markdownInput, 
  renderedHtml, 
  textareaRef, 
  wordWrap, 
  cursorPosition, 
  stats, 
  onInputChange, 
  toggleWordWrap,
  // Auto-save
  saveStatus,
  saveError,
  lastSaveTimeAgo,
  hasUnsavedChanges,
  showRecoveryPrompt,
  recoverableContent,
  saveNow,
  recoverContent,
  discardRecovery,
  clearSavedContent,
  toggleTask
} = useMarkdownEditor()

const { currentGist, getGist, getGistContent, clearCurrentGist, updateGist, setSyncPoint } = useGists()
const toast = useToast()

const { 
  editorSize, 
  previewSize,
  splitMode,
  toggleSplitMode,
  isAtEdge, 
  dragHandleRef, 
  isDragging, 
  resetToCenter,
  isMobile: isMobileFromPanel
} = useResizablePanels()

const { 
  syncEnabled, 
  toggleSync,
  scrollSyncIcon,
  scrollSyncTooltip,
  setEditorElement,
  setPreviewElement,
  scrollToElement
} = useScrollSync()

const {
  isSharedDocument,
  parseSharedDocument,
  makeEditableCopy: makeEditableCopyFromShared
} = useContentSharing()

// Route composable for watching hash changes
const route = useRoute()

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
  
  // Use the preview container ref instead of document
  if (previewContainerRef.value) {
    const element = previewContainerRef.value.querySelector(`#${CSS.escape(id)}`)
    if (element && element instanceof HTMLElement) {
      setActiveHeading(id)
      scrollToElement(element)
      // Update URL hash without triggering browser scroll
      history.replaceState(null, '', `#${id}`)
    }
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
      clearSavedContent()
    }
  }, 15000) // 15 seconds - longer than undo timeout
  
  // Clear gist filename
  currentGistFilename.value = ''
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
let checkboxListener: ((e: Event) => void) | null = null

// Use watchEffect for automatic cleanup
const stopWatchingScroll = watch(previewContainerRef, (newContainer, oldContainer) => {
  // Remove old listener
  if (oldContainer && scrollListener) {
    oldContainer.removeEventListener('scroll', scrollListener)
    scrollListener = null
  }
  if (oldContainer && checkboxListener) {
    oldContainer.removeEventListener('change', checkboxListener)
    checkboxListener = null
  }
  
  // Add new listener
  if (newContainer) {
    scrollListener = () => updateActiveHeadingDebounced()
    newContainer.addEventListener('scroll', scrollListener, { passive: true })
    checkboxListener = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target && target.classList.contains('task-list-item-checkbox')) {
        const idx = parseInt(target.dataset.taskIndex || '')
        if (!Number.isNaN(idx)) {
          toggleTask(idx, target.checked)
        }
      }
    }
    newContainer.addEventListener('change', checkboxListener)
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
  if (previewContainerRef.value && checkboxListener) {
    previewContainerRef.value.removeEventListener('change', checkboxListener)
    checkboxListener = null
  }
})

// Global state
const resetPanelsEvent = useState('resetPanelsEvent', () => 0)
const showToc = useState('showToc', () => false)
const globalRenderedHtml = useState<string>('renderedHtml', () => '')
const globalTocHeadings = useState<TocItem[]>('tocHeadings', () => [])
const showShareDialog = useState('showShareDialog', () => false)
const showGistManager = useState('showGistManager', () => false)
const showSaveGistDialog = useState('showSaveGistDialog', () => false)
const showFileSelector = ref(false)
const gistToLoad = ref<Gist | null>(null)
const currentGistFilename = useState('currentGistFilename', () => '')
const lastGistSaveTime = ref<Date | null>(null)
const isSavingGist = ref(false)
const forceNewGist = useState('forceNewGist', () => false)

// Computed property for multi-file gist detection
const isMultiFileGist = computed(() => {
  if (!currentGist.value) return false
  return Object.keys(currentGist.value.files).length > 1
})

// Watch for gist loading events from the layout
const gistToLoadFromLayout = useState<any>('gistToLoad', () => null)

// Reset forceNewGist when dialog closes
watch(showSaveGistDialog, (isOpen) => {
  if (!isOpen) {
    forceNewGist.value = false
  }
})

// Local state
const isFocusMode = ref(false)
const activeTab = ref<'editor' | 'preview'>('editor')
const documentTitle = ref('')
const isViewingSharedDocument = ref(false)
const sharedDocumentTitle = ref('')

// Responsive helpers - use values from composable
const isMobile = isMobileFromPanel
const isDesktop = computed(() => !isMobile.value)

// Toggle focus mode
const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value
  // Exit focus mode when resetting panels
  if (isFocusMode.value) {
    showToc.value = false
  }
  
  // On mobile, switch to editor tab when resetting
  if (isMobile.value) {
    activeTab.value = 'editor'
  }
}

// Watch for reset panels events from navbar
watch(resetPanelsEvent, (timestamp) => {
  if (timestamp > 0) {
    resetToCenter()
    isFocusMode.value = false
  }
})

// Set up scroll sync elements - only on desktop
watchEffect(() => {
  if (!isDesktop.value) return
  
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

// Track previous mermaid content to avoid unnecessary re-renders
let previousMermaidContent = ''

// Update active heading when content changes
watch(renderedHtml, () => {
  // Update active heading after content renders
  nextTick(() => {
    updateActiveHeadingDebounced()
    
    // Only render Mermaid diagrams if mermaid content has changed
    if ($renderMermaid) {
      // Extract mermaid content from the rendered HTML
      const mermaidMatches = renderedHtml.value.match(/data-mermaid-src="([^"]+)"/g)
      const currentMermaidContent = mermaidMatches ? mermaidMatches.join('') : ''
      
      // Only re-render if mermaid content actually changed
      if (currentMermaidContent !== previousMermaidContent) {
        $renderMermaid()
        previousMermaidContent = currentMermaidContent
      }
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

// Quick save to current gist
const handleQuickSaveGist = async () => {
  if (!currentGist.value || isSavingGist.value) return
  
  isSavingGist.value = true
  try {
    const result = await updateGist(currentGist.value.id, {
      files: {
        [currentGistFilename.value || 'untitled.md']: {
          content: markdownInput.value
        }
      }
    })
    
    if (result.success) {
      lastGistSaveTime.value = new Date()
      // Update sync point to mark this as the last saved state
      setSyncPoint(markdownInput.value, currentGistFilename.value || 'untitled.md')
      // Save the content locally as well to sync states
      saveNow()
      // GistStatusBar already shows save animation
    } else {
      toast.error(result.error || 'Failed to save gist')
    }
  } catch (error) {
    toast.error('Failed to save gist')
    // Log error for debugging but don't show to user (already showing toast)
  } finally {
    isSavingGist.value = false
  }
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
    // If connected to a gist, save to gist instead
    if (currentGist.value) {
      handleQuickSaveGist()
    } else {
      saveNow()
    }
  }
  
  // Toggle split mode: Ctrl/Cmd + Alt + V (vertical) or H (horizontal)
  if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'v' || e.key === 'V')) {
    e.preventDefault()
    if (splitMode.value === 'horizontal' && !isMobile.value) {
      toggleSplitMode()
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'h' || e.key === 'H')) {
    e.preventDefault()
    if (splitMode.value === 'vertical' && !isMobile.value) {
      toggleSplitMode()
    }
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

// Handle shared documents
const handleSharedDocument = async () => {
  if (isSharedDocument.value) {
    const sharedDoc = await parseSharedDocument()
    if (sharedDoc) {
      // Clear any saved content to prevent recovery prompt confusion
      clearSavedContent()
      
      markdownInput.value = sharedDoc.content
      sharedDocumentTitle.value = sharedDoc.title || ''
      isViewingSharedDocument.value = true
      // Switch to preview tab on mobile
      if (isMobile.value) {
        activeTab.value = 'preview'
      }
    }
  }
}

// Make editable copy of shared document
const makeEditableCopy = async () => {
  const sharedDoc = await parseSharedDocument()
  if (sharedDoc) {
    const content = makeEditableCopyFromShared(sharedDoc)
    markdownInput.value = content
    isViewingSharedDocument.value = false
    sharedDocumentTitle.value = ''
    currentGistFilename.value = ''
    // Switch to editor tab
    activeTab.value = 'editor'
  }
}

// Watch for route changes to handle shared documents
// This ensures shared content loads even when page is cached
watch(() => route.hash, async (newHash, oldHash) => {
  // Check if we're navigating to a shared document
  if (newHash.startsWith('#share/') && newHash !== oldHash) {
    await handleSharedDocument()
  }
  // Check if we're navigating away from a shared document
  else if (oldHash?.startsWith('#share/') && !newHash.startsWith('#share/')) {
    // Reset shared document state when navigating away
    isViewingSharedDocument.value = false
    sharedDocumentTitle.value = ''
  }
}, { immediate: true })


// Set up keyboard listeners using VueUse for automatic cleanup
onMounted(() => {
  useEventListener(window, 'keydown', handleKeydown)
})

// Clean up on unmount is handled automatically by useEventListener

// Watch for gist load events from the layout
watch(gistToLoadFromLayout, (gist) => {
  if (gist) {
    loadGist(gist)
    // Clear the state after handling
    gistToLoadFromLayout.value = null
  }
})

// Gist handlers
const loadGist = async (gist: Gist & { tempContent?: string; tempFilename?: string }) => {
  try {
    // Check if this is a pull/restore/switch operation with temporary content
    if (gist.tempContent !== undefined && gist.tempFilename) {
      // Direct load without fetching from API
      markdownInput.value = gist.tempContent
      currentGistFilename.value = gist.tempFilename
      
      // Update sync point for the new file to avoid false "unsaved changes" warnings
      setSyncPoint(gist.tempContent, gist.tempFilename)
      
      // Clear any shared document state
      isViewingSharedDocument.value = false
      sharedDocumentTitle.value = ''
      
      // Switch to editor tab
      activeTab.value = 'editor'
      
      return
    }
    
    // Normal gist loading flow
    const fullGist = await getGist(gist.id)
    if (!fullGist) return
    
    // Check if gist has multiple files
    const fileCount = Object.keys(fullGist.files).length
    
    // Set the gist to load
    gistToLoad.value = fullGist as Gist
    
    if (fileCount > 1) {
      // Show file selector for multi-file gists
      showFileSelector.value = true
    } else {
      // Single file - load directly
      const filename = Object.keys(fullGist.files)[0]
      await loadGistFile(filename || '')
    }
  } catch (error) {
    toast.error('Failed to load gist')
    // Log error for debugging
  }
}

const loadGistFile = async (filename: string) => {
  if (!gistToLoad.value) return
  
  try {
    // Get the file content
    const file = gistToLoad.value.files[filename] as GistFile
    if (!file) return
    
    // Load the content into the editor
    const content = file?.content || ''
    markdownInput.value = content
    currentGistFilename.value = filename
    
    // Set the sync point to track changes from this baseline
    setSyncPoint(content, filename)
    
    // Update document title
    if (gistToLoad.value.description) {
      documentTitle.value = gistToLoad.value.description
    }
    
    // Clear any shared document state
    isViewingSharedDocument.value = false
    sharedDocumentTitle.value = ''
    
    // Switch to editor tab
    activeTab.value = 'editor'
    
    // Reset the gist to load
    showFileSelector.value = false
  } catch (error) {
    toast.error('Failed to load gist file')
    // Log error for debugging
  }
}

const handleCreateNewGist = () => {
  // Force the dialog to create a new gist instead of updating
  forceNewGist.value = true
  showSaveGistDialog.value = true
}

const handleGistSaved = (gist: Gist) => {
  // Reset the force new flag
  forceNewGist.value = false
  
  // Update the document title with gist description
  if (gist.description) {
    documentTitle.value = gist.description
  }
  
  // Find the file that contains the current editor content
  // Look for the markdown file that was just saved
  const files = Object.keys(gist.files)
  const mdFile = files.find(f => f.endsWith('.md'))
  if (mdFile) {
    currentGistFilename.value = mdFile
  } else if (files.length > 0) {
    // Fallback to first file if no .md file found
    currentGistFilename.value = files[0] || ''
  }
  
  // Update sync point to reflect the saved state
  setSyncPoint(markdownInput.value, currentGistFilename.value || 'untitled.md')
  
  // The SaveGistDialog already shows success feedback
}

</script>
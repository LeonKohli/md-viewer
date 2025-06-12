<template>
  <header class="border-b bg-background px-3 md:px-4 py-2">
    <div class="flex items-center justify-between">
      <!-- Logo and title -->
      <div class="flex items-center gap-2">
        <Icon name="lucide:file-text" class="w-4 h-4 md:w-5 md:h-5 text-primary" />
        <h1 class="text-base md:text-lg font-semibold">Markdown</h1>
      </div>
      
      <!-- Toolbar Actions -->
      <nav class="flex items-center gap-1 md:gap-2" role="toolbar" aria-label="Editor toolbar">
        <!-- Navigation: TOC -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="toggleToc"
          :title="`Toggle Table of Contents (${isMac ? 'Cmd' : 'Ctrl'}+/)`"
          :aria-label="`Toggle Table of Contents. Keyboard shortcut: ${isMac ? 'Command' : 'Control'} plus slash`"
          :aria-pressed="showToc ? 'true' : 'false'"
          :aria-keyshortcuts="isMac ? 'Meta+/' : 'Control+/'"
          :class="{ 'bg-accent text-accent-foreground': showToc }"
          class="px-2 h-9 md:h-10 touch-target"
        >
          <Icon name="lucide:list" class="w-4 h-4" />
          <span class="hidden sm:inline ml-1.5">TOC</span>
        </Button>
        
        <!-- Separator -->
        <div class="hidden sm:block w-px h-5 bg-border/60 mx-0.5" aria-hidden="true" />
        
        <!-- Content Actions: Copy, Share, Export -->
        <!-- Copy button with feedback -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="copyMarkdown"
          :title="copied ? 'Copied!' : 'Copy markdown to clipboard'"
          aria-label="Copy markdown content to clipboard"
          class="h-9 md:h-10 touch-target"
        >
          <Icon 
            :name="copied ? 'lucide:check' : 'lucide:copy'" 
            class="w-4 h-4 sm:mr-1.5 transition-all duration-200"
            :class="copied ? 'text-green-600 dark:text-green-400' : ''"
          />
          <span class="hidden sm:inline">{{ copied ? 'Copied!' : 'Copy' }}</span>
        </Button>
        
        <!-- Share button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="openShareDialog"
          :title="`Share document (${isMac ? 'Cmd' : 'Ctrl'}+Shift+S)`"
          :aria-label="`Share document. Keyboard shortcut: ${isMac ? 'Command' : 'Control'} plus Shift plus S`"
          :aria-keyshortcuts="isMac ? 'Meta+Shift+S' : 'Control+Shift+S'"
          class="hidden sm:flex h-9 md:h-10 touch-target"
        >
          <Icon name="lucide:share-2" class="w-4 h-4 mr-1.5" />
          Share
        </Button>
        
        <!-- Export dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="hidden sm:flex">
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="Export options menu"
              aria-haspopup="true"
              class="h-9 md:h-10 touch-target"
            >
              <Icon name="lucide:download" class="w-4 h-4 mr-1.5" />
              <span class="hidden lg:inline">Export</span>
              <Icon name="lucide:chevron-down" class="w-3 h-3 ml-1" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="downloadMarkdown">
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              Download as Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem @click="downloadAsText">
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              Download as Text (.txt)
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:code" class="w-4 h-4 mr-2" />
                Download as HTML
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @click="downloadAsHtml('simple')">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                  Simple (with TOC)
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsHtml('simple-no-toc')">
                  <Icon name="lucide:file" class="w-4 h-4 mr-2" />
                  Simple (no TOC)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="downloadAsHtml('advanced')">
                  <Icon name="lucide:layout-panel-left" class="w-4 h-4 mr-2" />
                  Advanced (Sidebar TOC)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <!-- Separator -->
        <div class="hidden sm:block w-px h-5 bg-border/60 mx-0.5" aria-hidden="true" />
        
        <!-- View Controls: Color Mode & Fullscreen -->
        <!-- Color mode toggle -->
        <ColorModeToggle class="h-9 md:h-10 touch-target" />
        
        <!-- Fullscreen button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit fullscreen (ESC)' : 'Enter fullscreen'"
          :aria-label="isFullscreen ? 'Exit fullscreen mode. Press Escape key to exit.' : 'Enter fullscreen mode'"
          :aria-pressed="isFullscreen ? 'true' : 'false'"
          class="h-9 md:h-10 touch-target"
        >
          <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-4 h-4" />
        </Button>
        
        <!-- Desktop overflow menu for less frequent actions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="hidden md:flex">
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="More options"
              aria-haspopup="true"
              class="h-9 md:h-10 touch-target px-2"
            >
              <Icon name="lucide:more-horizontal" class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="resetPanels">
              <Icon name="lucide:layout-panel-left" class="w-4 h-4 mr-2" />
              Reset Panels
              <span class="ml-auto text-xs text-muted-foreground">50/50</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel class="text-xs">Load Examples</DropdownMenuLabel>
            <DropdownMenuItem 
              v-for="(content, title) in MARKDOWN_EXAMPLES" 
              :key="title"
              @click="loadExample(title, content)"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              {{ title }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Mobile dropdown for smaller screens -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="sm:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              aria-label="More options menu" 
              aria-haspopup="true"
              class="px-2 h-9 touch-target"
            >
              <Icon name="lucide:more-vertical" class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <!-- Primary actions first -->
            <DropdownMenuItem @click="openShareDialog">
              <Icon name="lucide:share-2" class="w-4 h-4 mr-2" />
              Share
              <span class="ml-auto text-xs text-muted-foreground">⌘⇧S</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <!-- Export options -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                Export
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @click="downloadMarkdown">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                  Markdown
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsText">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsHtml('simple')">
                  <Icon name="lucide:code" class="w-4 h-4 mr-2" />
                  HTML
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <!-- View options -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:layout" class="w-4 h-4 mr-2" />
                View
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @click="resetPanels">
                  <Icon name="lucide:layout-panel-left" class="w-4 h-4 mr-2" />
                  Reset Panels
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel class="text-xs">Examples</DropdownMenuLabel>
                <DropdownMenuItem 
                  v-for="(content, title) in MARKDOWN_EXAMPLES" 
                  :key="title"
                  @click="loadExample(title, content)"
                >
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                  {{ title }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { MarkdownNavbarProps, MarkdownNavbarEmits } from '~/types'
import { EXPORT_CONFIG, MARKDOWN_EXAMPLES } from '~/constants'
import { SAMPLE_MARKDOWN } from '~/constants/showcase-content'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

// Props and emits
const props = withDefaults(defineProps<MarkdownNavbarProps>(), {
  markdownContent: '',
  isFullscreen: false,
  renderedHtml: '',
  tocHeadings: () => []
})

// Get TOC state
const showToc = useState('showToc', () => false)

// Copy button feedback state
const copied = ref(false)

/**
 * Detect if the user is on a Mac for keyboard shortcut display.
 * Uses the user agent string to check for 'Mac' in the platform.
 * This avoids the need for a composable and works cross-browser.
 */
const isMac = computed(() => {
  if (typeof window !== 'undefined' && window.navigator) {
    return /Mac/.test(window.navigator.platform)
  }
  return false
})

const emit = defineEmits<MarkdownNavbarEmits>()

// Toggle fullscreen mode and handle browser fullscreen API
const toggleFullscreen = () => {
  emit('update:isFullscreen', !props.isFullscreen)
  if (!props.isFullscreen) {
    // Enter fullscreen if supported
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  } else {
    // Exit fullscreen if supported
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

/**
 * Copy the markdown content to the clipboard.
 * Uses the Clipboard API if available, otherwise falls back to a textarea method.
 */
const copyMarkdown = async () => {
  try {
    await navigator.clipboard.writeText(props.markdownContent || '')
    // Show success feedback
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // Clipboard API failed, fallback to textarea method
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.markdownContent || ''
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      // Show success feedback
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (fallbackErr) {
      // Silent failure - no console.error in production
    }
  }
}

/**
 * Download the markdown content as a .md file.
 * Uses Blob and a temporary anchor to trigger the download.
 */
const downloadMarkdown = () => {
  const content = props.markdownContent || '# Empty Document'
  const blob = new Blob([content], { type: EXPORT_CONFIG.MARKDOWN_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `markdown-export-${new Date().toISOString().split('T')[0]}${EXPORT_CONFIG.MARKDOWN_EXTENSION}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download the markdown content as a .txt file.
 */
const downloadAsText = () => {
  const content = props.markdownContent || 'Empty Document'
  const blob = new Blob([content], { type: EXPORT_CONFIG.TEXT_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `text-export-${new Date().toISOString().split('T')[0]}${EXPORT_CONFIG.TEXT_EXTENSION}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download the rendered HTML as a .html file.
 * Uses a composable for HTML export logic.
 */
const downloadAsHtml = (type: 'simple' | 'simple-no-toc' | 'advanced') => {
  const { exportAsHtml } = useHtmlExport()
  const colorMode = useColorMode()
  exportAsHtml(
    props.renderedHtml || '<p>Empty document</p>',
    props.tocHeadings || [],
    { type, colorMode: colorMode.value as 'light' | 'dark' }
  )
}


/**
 * Clear the markdown content and emit events for parent handling.
 */
const clearContent = () => {
  emit('update:markdownContent', '')
  emit('clearContent')
}

/**
 * Load the sample markdown content and emit events for parent handling.
 */
const loadSample = () => {
  emit('update:markdownContent', SAMPLE_MARKDOWN)
  emit('loadSample')
}

/**
 * Load an example markdown content.
 */
const loadExample = (title: string, content: string) => {
  emit('update:markdownContent', content)
}

/**
 * Reset the editor panels to their default split.
 */
const resetPanels = () => {
  emit('resetPanels')
}

/**
 * Toggle the Table of Contents panel.
 */
const toggleToc = () => {
  emit('toggleToc')
}

/**
 * Open the share dialog.
 */
const openShareDialog = () => {
  emit('openShare')
}

// Remove auto-loading of sample content
</script>

<style scoped>
/* Ensure minimum touch target size for mobile */
.touch-target {
  min-height: 44px;
}

/* Enhanced focus indicators for better accessibility */
:deep(.touch-target:focus-visible) {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}


@media (min-width: 768px) {
  .touch-target {
    min-height: 40px;
  }
}
</style>
<template>
  <header class="border-b bg-background px-4 py-2">
    <div class="flex items-center justify-between">
      <!-- Logo and title -->
      <div class="flex items-center gap-2">
        <Icon name="lucide:file-text" class="w-5 h-5 text-primary" />
        <h1 class="text-lg font-semibold">Markdown Preview</h1>
      </div>
      
      <!-- Toolbar Actions -->
      <div class="flex items-center gap-2">
        <!-- Table of Contents button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="toggleToc"
          :title="`Toggle Table of Contents (${isMac ? 'Cmd' : 'Ctrl'}+/)`"
          :class="{ 'bg-accent text-accent-foreground': showToc }"
        >
          <Icon name="lucide:list" class="w-4 h-4 mr-1.5" />
          TOC
        </Button>
        
        <!-- Reset panels button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="resetPanels"
          title="Reset to 50/50 split"
        >
          <Icon name="lucide:layout-panel-left" class="w-4 h-4 mr-1.5" />
          Reset
        </Button>
        
        <!-- Copy button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="copyMarkdown"
          title="Copy markdown"
        >
          <Icon name="lucide:copy" class="w-4 h-4 mr-1.5" />
          Copy
        </Button>
        
        <!-- Examples dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm">
              <Icon name="lucide:sparkles" class="w-4 h-4 mr-1" />
              <span>Examples</span>
              <Icon name="lucide:chevron-down" class="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
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
        
        <!-- Download dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm">
              <Icon name="lucide:download" class="w-4 h-4 mr-1.5" />
              Export
              <Icon name="lucide:chevron-down" class="w-3 h-3 ml-1" />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="copyToClipboard">
              <Icon name="lucide:clipboard" class="w-4 h-4 mr-2" />
              Copy to Clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <!-- Color mode toggle -->
        <ColorModeToggle />
        
        <!-- Fullscreen button -->
        <Button 
          variant="ghost" 
          size="sm"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit fullscreen (ESC)' : 'Enter fullscreen'"
        >
          <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-4 h-4" />
        </Button>

        <!-- Mobile dropdown for smaller screens -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="md:hidden">
            <Button variant="ghost" size="sm">
              <Icon name="lucide:more-horizontal" class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="clearContent">
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Clear
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:sparkles" class="w-4 h-4 mr-2" />
                Examples
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  v-for="(content, title) in MARKDOWN_EXAMPLES" 
                  :key="title"
                  @click="loadExample(title, content)"
                >
                  {{ title }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="copyMarkdown">
              <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
              Copy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
    // Optionally, show a toast or feedback here for success
  } catch (err) {
    // Clipboard API failed, fallback to textarea method
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.markdownContent || ''
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      // Optionally, show a toast or feedback here for success
    } catch (fallbackErr) {
      // Both methods failed, log error for debugging
      console.error('Failed to copy markdown with fallback:', fallbackErr)
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
 * Copy the markdown content to the clipboard.
 * This is a wrapper for copyMarkdown for menu compatibility.
 */
const copyToClipboard = () => {
  copyMarkdown()
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

// Remove auto-loading of sample content
</script>
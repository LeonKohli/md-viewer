<template>
  <header class="border-b bg-background px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo and title -->
      <div class="flex items-center gap-3">
        <Icon name="lucide:file-text" class="w-6 h-6 text-primary" />
        <h1 class="text-xl font-semibold">Markdown Preview</h1>
      </div>
      
      <!-- Toolbar Actions -->
      <div class="flex items-center gap-3">
        <!-- Reset panels button -->
        <Button 
          variant="ghost" 
          size="default"
          @click="resetPanels"
          title="Reset to 50/50 split"
        >
          <Icon name="lucide:layout-panel-left" class="w-5 h-5 mr-2" />
          Reset
        </Button>
        
        <!-- Copy button -->
        <Button 
          variant="ghost" 
          size="default"
          @click="copyMarkdown"
          title="Copy markdown"
        >
          <Icon name="lucide:copy" class="w-5 h-5 mr-2" />
          Copy
        </Button>
        
        <!-- Download dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="default">
              <Icon name="lucide:download" class="w-5 h-5 mr-2" />
              Export
              <Icon name="lucide:chevron-down" class="w-4 h-4 ml-2" />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="copyToClipboard">
              <Icon name="lucide:clipboard" class="w-4 h-4 mr-2" />
              Copy to Clipboard
            </DropdownMenuItem>
            <DropdownMenuItem @click="printMarkdown">
              <Icon name="lucide:printer" class="w-4 h-4 mr-2" />
              Print Preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <!-- Color mode toggle -->
        <ColorModeToggle />
        
        <!-- Fullscreen button -->
        <Button 
          variant="ghost" 
          size="default"
          @click="toggleFullscreen"
          title="Toggle fullscreen"
        >
          <Icon name="lucide:maximize-2" class="w-5 h-5" />
        </Button>

        <!-- Mobile dropdown for smaller screens -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child class="md:hidden">
            <Button variant="ghost" size="default">
              <Icon name="lucide:more-horizontal" class="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="clearContent">
              <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
              Clear
            </DropdownMenuItem>
            <DropdownMenuItem @click="loadSample">
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              Sample
            </DropdownMenuItem>
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
import { SAMPLE_MARKDOWN, EXPORT_CONFIG } from '~/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Props and emits
const props = withDefaults(defineProps<MarkdownNavbarProps>(), {
  markdownContent: '',
  isFullscreen: false
})

const emit = defineEmits<MarkdownNavbarEmits>()

// Toggle functions
const toggleFullscreen = () => {
  emit('update:isFullscreen', !props.isFullscreen)
  
  // Handle browser fullscreen API
  if (!props.isFullscreen) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const copyMarkdown = async () => {
  try {
    await navigator.clipboard.writeText(props.markdownContent || '')
    // Show success feedback - could implement toast notification here
    console.log('Markdown copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy markdown:', err)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.markdownContent || ''
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('Markdown copied to clipboard (fallback)!')
    } catch (fallbackErr) {
      console.error('Failed to copy markdown with fallback:', fallbackErr)
    }
  }
}

// Download functions
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

const copyToClipboard = () => {
  copyMarkdown()
}

const printMarkdown = () => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Markdown Preview - Print</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
            pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
            code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
            blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <pre>${props.markdownContent || 'Empty Document'}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const clearContent = () => {
  emit('update:markdownContent', '')
  emit('clearContent')
}

const loadSample = () => {
  emit('update:markdownContent', SAMPLE_MARKDOWN)
  emit('loadSample')
}

const resetPanels = () => {
  emit('resetPanels')
}

// Auto-load sample content on mount if no content exists
onMounted(() => {
  if (!props.markdownContent) {
    nextTick(() => {
      loadSample()
    })
  }
})
</script>
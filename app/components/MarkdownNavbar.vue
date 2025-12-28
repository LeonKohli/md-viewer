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
        <!-- Copy dropdown with format selection -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button 
              variant="ghost" 
              size="sm"
              title="Copy content"
              aria-label="Copy content menu"
              aria-haspopup="true"
              class="h-9 md:h-10 touch-target"
            >
              <Icon name="lucide:copy" class="w-4 h-4 sm:mr-1.5" />
              <span class="hidden sm:inline">Copy</span>
              <Icon name="lucide:chevron-down" class="w-3 h-3 ml-1 hidden sm:inline" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuItem @click="copyAsMarkdown">
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
              Copy as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem @click="copyAsPlainText">
              <Icon name="lucide:type" class="w-4 h-4 mr-2" />
              Copy as Plain Text
            </DropdownMenuItem>
            <DropdownMenuItem @click="copyAsHtml">
              <Icon name="lucide:code" class="w-4 h-4 mr-2" />
              Copy as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
        
        <!-- Gist Menu -->
        <GistMenu
          :has-unsaved-changes="hasUnsavedChanges"
          :markdown-content="markdownContent"
          :current-filename="currentFilename"
          @save-gist="$emit('saveGist')"
          @new-gist="$emit('newGist')"
          @browse-gists="$emit('openGists')"
          @load-gist="(gist: any) => $emit('loadGist', gist)"
        />
        
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
        
        <!-- Separator -->
        <div class="hidden sm:block w-px h-5 bg-border/60 mx-0.5" aria-hidden="true" />
        
        <!-- Auth State -->
        <AuthState>
          <template #default="{ loggedIn, clear, session }">
            <div v-if="loggedIn" class="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger class="flex items-center gap-2 outline-none">
                  <Avatar class="w-8 h-8 transition-transform hover:scale-105">
                    <AvatarImage
                      v-if="session?.user?.avatarUrl"
                      :src="session.user.avatarUrl"
                      :alt="session.user.name || 'User avatar'"
                    />
                    <AvatarFallback v-else>
                      {{ (session?.user?.name || session?.user?.login || 'U')[0]?.toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="hidden md:block text-sm font-medium">{{ session?.user?.login }}</span>
                  <Icon name="lucide:chevron-down" class="w-3 h-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuLabel>
                    <div class="flex flex-col">
                      <span>{{ session?.user?.name || session?.user?.login }}</span>
                      <span class="text-xs font-normal text-muted-foreground">{{ session?.user?.email }}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="handleLogout">
                    <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <!-- Login button removed - now in GistMenu -->
          </template>
          <template #placeholder>
            <!-- Minimal placeholder to prevent layout shift -->
            <div class="w-20 h-9 md:h-10" />
          </template>
        </AuthState>
        
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
// Explicit import required for defineProps/defineEmits (Vue SFC compiler limitation)
import type { MarkdownNavbarProps, MarkdownNavbarEmits } from '#shared/types/ui'
import { EXPORT_CONFIG, MARKDOWN_EXAMPLES, SAMPLE_MARKDOWN } from '~/constants'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Props and emits
const props = withDefaults(defineProps<MarkdownNavbarProps>(), {
  markdownContent: '',
  isFullscreen: false,
  renderedHtml: '',
  tocHeadings: () => []
})

// Get TOC state via composable
const showToc = useShowToc()

// Copy functionality
const { copyContent, copied } = useCopyContent()

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
 * Copy content in different formats
 */
const copyAsMarkdown = async () => {
  await copyContent(props.markdownContent || '', { format: 'markdown' })
}

const copyAsPlainText = async () => {
  await copyContent(props.markdownContent || '', { format: 'plain' })
}

const copyAsHtml = async () => {
  await copyContent(props.markdownContent || '', { format: 'html' })
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
  emit('loadSample') // Reuse event to trigger side effects (clear gist filename, etc.)
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

/**
 * Handle user logout.
 */
const handleLogout = async () => {
  const { clear } = useUserSession()
  await clear()
  // Just reload the page after logout
  await navigateTo('/')
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
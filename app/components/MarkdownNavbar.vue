<template>
  <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
    <div class="flex items-center justify-between">
      <!-- Left: Logo only -->
      <div class="flex items-center gap-2">
        <Icon name="lucide:file-text" class="w-5 h-5 text-primary" />
        <h1 class="text-lg font-semibold tracking-tight">Markdown</h1>
      </div>

      <!-- Right: Minimal icon actions -->
      <nav class="flex items-center gap-1" role="toolbar" aria-label="Editor toolbar">

        <!-- Cloud sync (GistMenu) - Primary action -->
        <GistMenu
          :has-unsaved-changes="hasUnsavedChanges"
          :markdown-content="markdownContent"
          :current-filename="currentFilename"
          @save-gist="$emit('saveGist')"
          @new-gist="$emit('newGist')"
          @browse-gists="$emit('openGists')"
          @load-gist="(gist: any) => $emit('loadGist', gist)"
        />

        <!-- Theme toggle - Always visible -->
        <ColorModeToggle class="h-9 w-9" />

        <!-- Fullscreen - Icon only -->
        <Button
          variant="ghost"
          size="icon"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit fullscreen (ESC)' : 'Enter fullscreen'"
          class="h-9 w-9 hidden sm:flex"
        >
          <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-4 h-4" />
        </Button>

        <!-- More menu - All other actions -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More options"
              class="h-9 w-9"
            >
              <Icon name="lucide:more-vertical" class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-52">
            <!-- View -->
            <DropdownMenuItem @click="toggleToc">
              <Icon name="lucide:list" class="w-4 h-4 mr-2" />
              Table of Contents
              <Icon v-if="showToc" name="lucide:check" class="w-4 h-4 ml-auto" />
              <DropdownMenuShortcut v-else>{{ isMac ? '⌘/' : 'Ctrl+/' }}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem @click="resetPanels">
              <Icon name="lucide:columns-2" class="w-4 h-4 mr-2" />
              Reset Panel Layout
            </DropdownMenuItem>
            <DropdownMenuItem @click="toggleFullscreen" class="sm:hidden">
              <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-4 h-4 mr-2" />
              {{ isFullscreen ? 'Exit' : 'Enter' }} Fullscreen
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <!-- Copy -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @click="copyAsMarkdown">
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
                  Markdown
                </DropdownMenuItem>
                <DropdownMenuItem @click="copyAsPlainText">
                  <Icon name="lucide:type" class="w-4 h-4 mr-2" />
                  Plain Text
                </DropdownMenuItem>
                <DropdownMenuItem @click="copyAsHtml">
                  <Icon name="lucide:code" class="w-4 h-4 mr-2" />
                  HTML
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <!-- Share -->
            <DropdownMenuItem @click="openShareDialog">
              <Icon name="lucide:share" class="w-4 h-4 mr-2" />
              Share
              <DropdownMenuShortcut>{{ isMac ? '⌘⇧S' : 'Ctrl+Shift+S' }}</DropdownMenuShortcut>
            </DropdownMenuItem>

            <!-- Export -->
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                Export
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem @click="downloadMarkdown">
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsText">
                  Plain Text (.txt)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="downloadAsHtml('simple')">
                  HTML (with TOC)
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsHtml('simple-no-toc')">
                  HTML (no TOC)
                </DropdownMenuItem>
                <DropdownMenuItem @click="downloadAsHtml('advanced')">
                  HTML (sidebar TOC)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <!-- Import -->
            <DropdownMenuItem @click="openImport">
              <Icon name="lucide:upload" class="w-4 h-4 mr-2" />
              Import File
              <DropdownMenuShortcut>{{ isMac ? '⌘O' : 'Ctrl+O' }}</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <!-- Examples -->
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
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- User avatar - Only when logged in -->
        <AuthState>
          <template #default="{ loggedIn, session }">
            <DropdownMenu v-if="loggedIn">
              <DropdownMenuTrigger class="outline-none ml-1">
                <Avatar class="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    v-if="session?.user?.avatarUrl"
                    :src="session.user.avatarUrl"
                    :alt="session.user.name || 'User'"
                  />
                  <AvatarFallback class="text-xs">
                    {{ (session?.user?.login || 'U')[0]?.toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48">
                <DropdownMenuLabel class="font-normal">
                  <div class="flex flex-col gap-1">
                    <p class="text-sm font-medium">{{ session?.user?.name || session?.user?.login }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ session?.user?.email }}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout">
                  <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>
        </AuthState>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { MarkdownNavbarProps, MarkdownNavbarEmits } from '#shared/types/ui'
import { EXPORT_CONFIG, MARKDOWN_EXAMPLES } from '~/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const props = withDefaults(defineProps<MarkdownNavbarProps>(), {
  markdownContent: '',
  isFullscreen: false,
  renderedHtml: '',
  tocHeadings: () => []
})

const showToc = useShowToc()
const { copyContent } = useCopyContent()

const isMac = computed(() => {
  if (import.meta.client) {
    return /Mac/.test(navigator.platform)
  }
  return false
})

const emit = defineEmits<MarkdownNavbarEmits>()

const toggleFullscreen = () => {
  emit('update:isFullscreen', !props.isFullscreen)
  if (!props.isFullscreen) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const copyAsMarkdown = async () => {
  await copyContent(props.markdownContent || '', { format: 'markdown' })
}

const copyAsPlainText = async () => {
  await copyContent(props.markdownContent || '', { format: 'plain' })
}

const copyAsHtml = async () => {
  await copyContent(props.markdownContent || '', { format: 'html' })
}

const downloadMarkdown = () => {
  const content = props.markdownContent || '# Empty Document'
  const blob = new Blob([content], { type: EXPORT_CONFIG.MARKDOWN_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `markdown-${new Date().toISOString().split('T')[0]}${EXPORT_CONFIG.MARKDOWN_EXTENSION}`
  a.click()
  URL.revokeObjectURL(url)
}

const downloadAsText = () => {
  const content = props.markdownContent || 'Empty Document'
  const blob = new Blob([content], { type: EXPORT_CONFIG.TEXT_MIME_TYPE })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `text-${new Date().toISOString().split('T')[0]}${EXPORT_CONFIG.TEXT_EXTENSION}`
  a.click()
  URL.revokeObjectURL(url)
}

const downloadAsHtml = (type: 'simple' | 'simple-no-toc' | 'advanced') => {
  const { exportAsHtml } = useHtmlExport()
  const colorMode = useColorMode()
  exportAsHtml(
    props.renderedHtml || '<p>Empty document</p>',
    props.tocHeadings || [],
    { type, colorMode: colorMode.value as 'light' | 'dark' }
  )
}

const loadExample = (title: string, content: string) => {
  emit('update:markdownContent', content)
  emit('loadSample')
}

const resetPanels = () => emit('resetPanels')
const toggleToc = () => emit('toggleToc')
const openShareDialog = () => emit('openShare')
const openImport = () => emit('openImport')

const handleLogout = async () => {
  const { clear } = useUserSession()
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div class="relative">
    <!-- Desktop Dropdown -->
    <DropdownMenu v-if="!isMobile">
      <DropdownMenuTrigger as-child>
        <Button 
          variant="ghost" 
          size="sm"
          class="h-9 md:h-10 touch-target relative"
          :title="menuTitle"
          aria-label="Gist menu"
        >
          <div class="relative">
            <Icon 
              :name="menuIcon" 
              class="w-4 h-4"
              :class="iconClass"
            />
            <!-- Status indicator dot -->
            <div 
              v-if="hasChangesToSave && currentGist"
              class="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
              title="Unsaved changes to GitHub"
            />
          </div>
          <span class="hidden lg:inline ml-1.5">{{ menuLabel }}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" class="w-72">
        <!-- Not logged in state -->
        <template v-if="!loggedIn">
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2 font-medium">
              <Icon name="lucide:lock" class="w-4 h-4" />
              <span>Connect to GitHub</span>
            </div>
            <p class="text-sm text-muted-foreground">
              Save your work in the cloud
            </p>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-3 h-3 mt-0.5 text-green-600" />
                <span>Auto-sync across devices</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-3 h-3 mt-0.5 text-green-600" />
                <span>Version history</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon name="lucide:check" class="w-3 h-3 mt-0.5 text-green-600" />
                <span>Share with others</span>
              </li>
            </ul>
            <Button 
              @click="handleLogin" 
              class="w-full gap-2"
              size="sm"
            >
              <Icon name="lucide:github" class="w-4 h-4" />
              Login with GitHub
            </Button>
          </div>
        </template>
        
        <!-- Logged in, editing gist -->
        <template v-else-if="currentGist">
          <div class="px-3 py-2 border-b">
            <div class="flex items-center gap-2 text-sm">
              <Icon name="lucide:check-circle" class="w-4 h-4 text-green-600" />
              <span class="font-medium truncate">{{ currentGistName }}</span>
            </div>
          </div>
          
          <DropdownMenuItem @click="handleSave" :disabled="!hasChangesToSave">
            <Icon name="lucide:save" class="w-4 h-4 mr-2" />
            Save to GitHub
            <span class="ml-auto text-xs text-muted-foreground">{{ saveShortcut }}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem @click="handleSyncFromGitHub">
            <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Sync from GitHub
            <span v-if="hasChangesToSave" class="ml-auto text-xs text-orange-500">Unsaved changes</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem @click="handleViewOnGitHub">
            <Icon name="lucide:external-link" class="w-4 h-4 mr-2" />
            View on GitHub
          </DropdownMenuItem>
          
          <DropdownMenuItem @click="handleCopyLink">
            <Icon name="lucide:link" class="w-4 h-4 mr-2" />
            Copy Link
            <Icon 
              v-if="linkCopied" 
              name="lucide:check" 
              class="w-3 h-3 ml-auto text-green-600"
            />
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem @click="handleAddFileToGist">
            <Icon name="lucide:file-plus" class="w-4 h-4 mr-2" />
            Add File to Gist
          </DropdownMenuItem>
          
          <DropdownMenuItem @click="handleNewGist">
            <Icon name="lucide:plus-circle" class="w-4 h-4 mr-2" />
            Create New Gist
          </DropdownMenuItem>
          
          <!-- Switch to another gist -->
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon name="lucide:folder-open" class="w-4 h-4 mr-2" />
              Switch Gist
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-64">
              <!-- Recent gists -->
              <template v-if="recentGists.length > 0">
                <DropdownMenuLabel class="text-xs">Recent Gists</DropdownMenuLabel>
                <DropdownMenuItem 
                  v-for="gist in recentGists" 
                  :key="gist.id"
                  @click="handleLoadGist(gist as Readonly<Gist>)"
                  class="text-sm"
                >
                  <Icon name="lucide:file-text" class="w-4 h-4 mr-2 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="truncate">{{ getGistTitle(gist) }}</div>
                    <div class="text-xs text-muted-foreground">
                      {{ formatTimeAgo(gist.updated_at) }}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </template>
              <DropdownMenuItem @click="handleBrowseAllGists">
                <Icon name="lucide:search" class="w-4 h-4 mr-2" />
                Browse All Gists...
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <!-- Switch file within current gist (for multi-file gists) -->
          <DropdownMenuSub v-if="isMultiFile">
            <DropdownMenuSubTrigger>
              <Icon name="lucide:files" class="w-4 h-4 mr-2" />
              Switch File
              <span class="ml-auto text-xs text-muted-foreground">
                {{ Object.keys(currentGist.files).length }} files
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-64">
              <DropdownMenuItem 
                v-for="(file, filename) in currentGist.files" 
                :key="filename"
                @click="handleSwitchFile(String(filename))"
                class="text-sm"
                :class="{ 'bg-accent': filename === props.currentFilename }"
              >
                <Icon :name="getFileIcon(String(filename))" class="w-4 h-4 mr-2" />
                <span class="truncate">{{ filename }}</span>
                <Icon 
                  v-if="String(filename) === props.currentFilename" 
                  name="lucide:check" 
                  class="w-3 h-3 ml-auto text-primary"
                />
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icon name="lucide:zap" class="w-4 h-4 mr-2" />
              Quick Actions
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem @click="handleRename">
                <Icon name="lucide:edit-3" class="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleAddFile" v-if="isMultiFile">
                <Icon name="lucide:file-plus" class="w-4 h-4 mr-2" />
                Add File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleDelete" class="text-destructive">
                <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
                Delete Gist
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem @click="handleDisconnect">
            <Icon name="lucide:unplug" class="w-4 h-4 mr-2" />
            Disconnect from Gist
          </DropdownMenuItem>
        </template>
        
        <!-- Logged in, no active gist -->
        <template v-else>
          <DropdownMenuItem @click="handleNewGist">
            <Icon name="lucide:file-plus" class="w-4 h-4 mr-2" />
            New Gist
          </DropdownMenuItem>
          
          <DropdownMenuItem @click="handleBrowseGists">
            <Icon name="lucide:folder-open" class="w-4 h-4 mr-2" />
            Browse My Gists
          </DropdownMenuItem>
          
          <template v-if="recentGists.length > 0">
            <DropdownMenuSeparator />
            <DropdownMenuLabel class="text-xs">Recent Gists</DropdownMenuLabel>
            <DropdownMenuItem 
              v-for="gist in recentGists" 
              :key="gist.id"
              @click="handleLoadGist(gist as Readonly<Gist>)"
              class="text-sm"
            >
              <Icon name="lucide:file-text" class="w-4 h-4 mr-2 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="truncate">{{ getGistTitle(gist) }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ formatTimeAgo(gist.updated_at) }}
                </div>
              </div>
            </DropdownMenuItem>
          </template>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
    
    <!-- Mobile Bottom Sheet -->
    <Sheet v-else v-model:open="mobileMenuOpen">
      <SheetTrigger as-child>
        <Button 
          variant="ghost" 
          size="sm"
          class="h-9 touch-target relative"
          :title="menuTitle"
          aria-label="Gist menu"
        >
          <div class="relative">
            <Icon 
              :name="menuIcon" 
              class="w-4 h-4"
              :class="iconClass"
            />
            <div 
              v-if="hasUnsavedChanges && currentGist"
              class="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
              title="Unsaved changes"
            />
          </div>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" class="h-auto max-h-[80vh]">
        <!-- Mobile menu content - similar structure but optimized for touch -->
        <SheetHeader>
          <SheetTitle>{{ currentGist ? 'Gist Options' : 'GitHub Gists' }}</SheetTitle>
        </SheetHeader>
        
        <div class="py-4 space-y-2">
          <!-- Mobile menu items with larger touch targets -->
          <!-- Similar content to desktop but with Sheet components -->
        </div>
      </SheetContent>
    </Sheet>
    
    <!-- Toast notifications are now handled globally by ToastContainer -->
  </div>
</template>

<script setup lang="ts">
// Gist, GistFile are auto-imported from shared/types/

// Extended Gist type for loading with temporary content
type GistWithTempData = Readonly<Gist> & {
  tempContent?: string
  tempFilename?: string
}

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// Props
interface Props {
  hasUnsavedChanges?: boolean
  markdownContent: string
  currentFilename?: string
}

const props = withDefaults(defineProps<Props>(), {
  hasUnsavedChanges: false,
  currentFilename: ''
})

// Emits
const emit = defineEmits<{
  'save-gist': []
  'new-gist': []
  'browse-gists': []
  'load-gist': [gist: GistWithTempData]
}>()

// Auth state
const { loggedIn, user } = useUserSession()

// Gist state
const { 
  currentGist, 
  gists, 
  fetchGists,
  clearCurrentGist,
  updateGist,
  hasGistChanges,
  setSyncPoint,
  pullFromGist,
  lastSyncedContent,
  lastSyncedFilename
} = useGists()

// UI state
const mobileMenuOpen = ref(false)
const linkCopied = ref(false)

// Use the toast composable
const toast = useToast()

// Computed
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

const isMac = computed(() => {
  if (typeof window !== 'undefined' && window.navigator) {
    return /Mac/.test(window.navigator.platform)
  }
  return false
})

const saveShortcut = computed(() => isMac.value ? '⌘S' : 'Ctrl+S')

const menuIcon = computed(() => {
  if (!loggedIn.value) return 'lucide:cloud-off'
  if (currentGist.value) return 'lucide:cloud-check'
  return 'lucide:cloud'
})

const iconClass = computed(() => {
  if (!loggedIn.value) return 'text-muted-foreground'
  if (currentGist.value) return 'text-primary'
  return ''
})

const menuTitle = computed(() => {
  if (!loggedIn.value) return 'Connect to GitHub'
  if (currentGist.value) return `Connected to: ${currentGistName.value}`
  return 'GitHub Gists'
})

const menuLabel = computed(() => {
  if (!loggedIn.value) return 'Connect'
  if (currentGist.value) return 'Connected'
  return 'Gists'
})

const currentGistName = computed(() => {
  if (!currentGist.value) return ''
  return getGistTitle(currentGist.value)
})

const isMultiFile = computed(() => {
  if (!currentGist.value) return false
  return Object.keys(currentGist.value.files).length > 1
})

const recentGists = computed(() => {
  // Get 3 most recent gists excluding current
  return gists.value
    .filter(g => g.id !== currentGist.value?.id)
    .slice(0, 3)
})

// Check if there are changes relative to the gist (not local storage)
const hasChangesToSave = computed(() => {
  if (!currentGist.value) return false
  return hasGistChanges(props.markdownContent, props.currentFilename || 'untitled.md')
})

// Methods
const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  // Use the new toast composable methods
  if (type === 'success') {
    toast.success(message)
  } else if (type === 'error') {
    toast.error(message)
  } else {
    toast.info(message)
  }
}

const handleLogin = () => {
  navigateTo('/auth/github', { external: true })
}

const handleSave = async () => {
  if (!currentGist.value || !hasChangesToSave.value) return
  
  try {
    const filename = props.currentFilename || 'untitled.md'
    const result = await updateGist(currentGist.value.id, {
      files: {
        [filename]: {
          content: props.markdownContent
        }
      }
    })
    
    if (result.success) {
      // Update sync point to mark this as the last saved state
      setSyncPoint(props.markdownContent, filename)
      // GistStatusBar will show save animation - no need for toast
    } else {
      showToast(result.error || 'Failed to save to GitHub', 'error')
    }
  } catch (error) {
    showToast('Failed to save gist', 'error')
  }
}

const handleSyncFromGitHub = async () => {
  if (!currentGist.value) {
    return
  }
  
  // Check if there are unsaved changes
  if (hasChangesToSave.value) {
    if (!confirm('You have unsaved changes. Syncing from GitHub will replace your local content. Continue?')) {
      return
    }
  }
  
  try {
    const { content, filename } = await pullFromGist(currentGist.value.id, props.currentFilename)
    
    // Emit event to update the content in the parent component
    emit('load-gist', Object.assign({}, currentGist.value, { tempContent: content, tempFilename: filename }) as GistWithTempData)
    
    // Content will update in editor - that's enough feedback
  } catch (error) {
    console.error('Sync error:', error)
    showToast('Failed to sync from GitHub', 'error')
  }
}

const handleBrowseAllGists = () => {
  emit('browse-gists')
}

const handleAddFileToGist = async () => {
  if (!currentGist.value) return
  
  // Check for unsaved changes in current file
  if (hasChangesToSave.value) {
    if (!confirm('You have unsaved changes. Save them first?')) {
      return
    }
    await handleSave()
  }
  
  // Open the save dialog in "add file" mode
  // We'll pass a special flag to indicate this is for adding a new file
  emit('save-gist')
}

const handleNewGist = () => {
  // Emit new-gist event to create a fresh gist
  emit('new-gist')
}

const handleSwitchFile = (filename: string) => {
  if (!currentGist.value) return
  
  // Don't do anything if switching to the same file
  if (filename === props.currentFilename) {
    return
  }
  
  // Only check for unsaved changes if we have actual changes
  // This prevents false positives when switching between files
  if (hasChangesToSave.value && props.markdownContent !== lastSyncedContent.value) {
    if (!confirm(`You have unsaved changes in ${props.currentFilename}. Switch file without saving?`)) {
      return
    }
  }
  
  // Get the file content
  const file = currentGist.value.files[filename] as GistFile
  if (!file) return
  
  // Emit event to load this file
  emit('load-gist', Object.assign({}, currentGist.value, { 
    tempContent: file?.content || '', 
    tempFilename: filename 
  }) as GistWithTempData)
  
  // File will load in editor - no need for toast
}

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'md':
    case 'markdown':
      return 'lucide:file-text'
    case 'json':
      return 'lucide:file-json'
    case 'js':
    case 'ts':
      return 'lucide:file-code'
    case 'css':
    case 'scss':
      return 'lucide:palette'
    case 'html':
      return 'lucide:globe'
    case 'txt':
      return 'lucide:file'
    default:
      return 'lucide:file'
  }
}

const handleViewOnGitHub = () => {
  if (!currentGist.value) return
  window.open(currentGist.value.html_url, '_blank')
}

const handleCopyLink = async () => {
  if (!currentGist.value) return
  
  try {
    await navigator.clipboard.writeText(currentGist.value.html_url)
    linkCopied.value = true
    // The UI checkmark is enough feedback
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    // No checkmark = didn't work, that's enough feedback
    console.error('Failed to copy link:', error)
  }
}

const handleRename = () => {
  // TODO: Implement rename dialog
  showToast('Rename feature coming soon', 'info')
}

const handleAddFile = () => {
  // TODO: Implement add file dialog
  showToast('Add file feature coming soon', 'info')
}

const handleDelete = () => {
  if (!currentGist.value) return
  
  if (confirm(`Delete gist "${currentGistName.value}"? This cannot be undone.`)) {
    // TODO: Implement delete
    showToast('Delete feature coming soon', 'info')
  }
}

const handleDisconnect = () => {
  clearCurrentGist()
  // UI will update to show disconnected state
}

const handleBrowseGists = () => {
  emit('browse-gists')
}

const handleLoadGist = (gist: Readonly<Gist>) => {
  emit('load-gist', gist as GistWithTempData)
  mobileMenuOpen.value = false
}

// Helper functions
const getGistTitle = (gist: Pick<Gist, 'files'>): string => {
  // GitHub always shows gists by their first file alphabetically
  const files = Object.keys(gist.files).sort()
  const firstFile = files[0] || 'Untitled'
  // Optionally remove .md extension for display
  return firstFile.endsWith('.md') ? firstFile.slice(0, -3) : firstFile
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

// Fetch gists when logged in
watch(loggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    await fetchGists()
  }
})

// Initial fetch if already logged in
onMounted(async () => {
  if (loggedIn.value) {
    await fetchGists()
  }
})
</script>

<style scoped>
.touch-target {
  min-height: 44px;
}

@media (min-width: 768px) {
  .touch-target {
    min-height: 40px;
  }
}
</style>
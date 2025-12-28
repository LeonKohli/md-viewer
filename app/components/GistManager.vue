<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>My Gists</DialogTitle>
        <DialogDescription>
          Manage your GitHub Gists. Create, edit, or delete your markdown documents.
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Search bar -->
        <div class="mb-4 relative">
          <Icon 
            name="lucide:search" 
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search gists by name or description..."
            class="pl-9"
          />
        </div>
        
        <!-- Gists list -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="error" class="text-center py-8">
            <Alert variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
          </div>
          
          <div v-else-if="filteredGists.length === 0" class="text-center py-8">
            <Icon name="lucide:file-text" class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p class="text-muted-foreground">
              {{ searchQuery ? 'No gists found matching your search' : 'You haven\'t created any gists yet' }}
            </p>
            <Button @click="handleCreateNew" class="mt-4">
              <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
              Create Your First Gist
            </Button>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="gist in filteredGists"
              :key="gist.id"
              class="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
              @click="handleSelectGist(gist as Gist)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-medium truncate">
                      {{ getGistTitle(gist as Gist) }}
                    </h3>
                    <Badge v-if="!gist.public" variant="secondary" class="text-xs">
                      Private
                    </Badge>
                  </div>
                  <p v-if="gist.description" class="text-sm text-muted-foreground line-clamp-2">
                    {{ gist.description }}
                  </p>
                  <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:clock" class="w-3 h-3" />
                      {{ formatDate(gist.updated_at) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="lucide:file" class="w-3 h-3" />
                      {{ Object.keys(gist.files).length }} file{{ Object.keys(gist.files).length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click.stop="handleCopyLink(gist as Gist)"
                    title="Copy gist link"
                  >
                    <Icon name="lucide:link" class="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    @click.stop="handleDeleteGist(gist as Gist)"
                    title="Delete gist"
                    class="text-destructive hover:text-destructive"
                  >
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Load more button -->
          <div v-if="hasMore && !isLoading" class="mt-4 text-center">
            <Button @click="loadMore" variant="outline">
              Load More
            </Button>
          </div>
          
          <div v-if="isLoading && gists.length > 0" class="mt-4 text-center">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          Close
        </Button>
        <Button @click="handleCreateNew">
          <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
          Create New Gist
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
// Gist is auto-imported from shared/types/
import { useGists } from '~/composables/useGists'
import { AlertCircle } from 'lucide-vue-next'
import { useTimeAgo, useClipboard } from '@vueuse/core'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [gist: Gist]
  'create': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { gists, isLoading, error, hasMore, fetchGists, deleteGist, loadMore } = useGists()
const { copy: copyToClipboard } = useClipboard()
const toast = useToast()
const searchQuery = ref('')

// Filtered gists based on search
const filteredGists = computed(() => {
  if (!searchQuery.value) return gists.value
  
  const query = searchQuery.value.toLowerCase()
  return gists.value.filter((gist) => {
    const titleMatch = getGistTitle(gist as Gist).toLowerCase().includes(query)
    const descriptionMatch = gist.description?.toLowerCase().includes(query) || false
    const fileMatch = Object.keys(gist.files).some(filename => 
      filename.toLowerCase().includes(query)
    )
    return titleMatch || descriptionMatch || fileMatch
  })
})

// Load gists when dialog opens
watch(isOpen, async (open) => {
  if (open && gists.value.length === 0) {
    await fetchGists()
  }
})

// Get a display title for the gist (matching GitHub's behavior)
const getGistTitle = (gist: Gist): string => {
  // GitHub always shows gists by their first file alphabetically
  const files = Object.keys(gist.files).sort()
  const firstFile = files[0] || 'Untitled'
  // Optionally remove .md extension for display
  return firstFile.endsWith('.md') ? firstFile.slice(0, -3) : firstFile
}

// Format date for display
const formatDate = (dateString: string): string => {
  return useTimeAgo(new Date(dateString)).value
}

// Handle gist selection
const handleSelectGist = (gist: Gist) => {
  emit('select', gist)
  isOpen.value = false
}

// Handle creating new gist
const handleCreateNew = () => {
  emit('create')
  isOpen.value = false
}

// Handle copying gist link
const handleCopyLink = async (gist: Gist) => {
  try {
    await copyToClipboard(gist.html_url)
  } catch (err) {
    toast.error('Failed to copy link')
    console.error('Failed to copy link:', err)
  }
}

// Handle deleting gist
const handleDeleteGist = async (gist: Gist) => {
  if (!confirm(`Are you sure you want to delete "${getGistTitle(gist)}"?`)) {
    return
  }
  
  const result = await deleteGist(gist.id)
  if (result.success) {
    toast.success('Gist deleted successfully')
  } else {
    toast.error(result.error || 'Failed to delete gist')
    console.error('Failed to delete gist:', result.error)
  }
}

</script>
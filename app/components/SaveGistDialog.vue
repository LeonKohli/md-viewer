<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[500px]">
      <form @submit.prevent="handleSubmit">
        <DialogHeader>
          <DialogTitle>{{ isUpdate ? 'Update' : 'Save as' }} Gist</DialogTitle>
          <DialogDescription>
            {{ isUpdate ? 'Update your existing gist with the current content.' : 'Save your markdown as a GitHub Gist to access it from anywhere.' }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="!hasContent" class="py-8">
          <Alert>
            <Icon name="lucide:info" class="w-4 h-4" />
            <AlertTitle>No content to save</AlertTitle>
            <AlertDescription>
              Please write some content in the editor before saving a gist.
            </AlertDescription>
          </Alert>
        </div>
        
        <div v-else class="space-y-4 py-4">
          <!-- Filename -->
          <div class="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div class="relative">
              <Input
                id="filename"
                v-model="filename"
                placeholder="document"
                required
              />
              <span 
                v-if="filename && !filename.endsWith('.md')" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"
              >
                .md
              </span>
            </div>
            <p class="text-xs text-muted-foreground">
              The filename for your gist (will add .md if not present)
            </p>
          </div>
          
          <!-- Description -->
          <div class="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              v-model="description"
              placeholder="A brief description of your gist..."
              rows="3"
            />
          </div>
          
          <!-- Public/Private toggle -->
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label htmlFor="public">Visibility</Label>
              <p class="text-xs text-muted-foreground">
                {{ isPublic ? 'Anyone can see this gist' : 'Only you can see this gist' }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Icon :name="isPublic ? 'lucide:globe' : 'lucide:lock'" class="w-4 h-4 text-muted-foreground" />
              <Switch 
                id="public" 
                v-model:checked="isPublic"
                :disabled="isUpdate"
              />
            </div>
          </div>
          
          <!-- Update options (when updating) -->
          <div v-if="isUpdate && existingGist" class="rounded-lg bg-muted/50 p-3 space-y-2">
            <p class="text-sm font-medium">Updating existing gist</p>
            <p class="text-xs text-muted-foreground">
              ID: {{ existingGist.id }}
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              class="h-auto p-0 text-xs"
              @click="handleCreateNew"
            >
              Create as new gist instead
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="isOpen = false" :disabled="isSaving">
            {{ hasContent ? 'Cancel' : 'Close' }}
          </Button>
          <Button v-if="hasContent" type="submit" :disabled="!isValid || isSaving">
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else :name="isUpdate ? 'lucide:save' : 'lucide:plus'" class="w-4 h-4 mr-2" />
            {{ isUpdate ? 'Update' : 'Create' }} Gist
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Gist } from '~/types/gist'
import { useGists } from '~/composables/useGists'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const props = defineProps<{
  modelValue: boolean
  content: string
  existingGist?: Gist | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [gist: Gist]
  'createNew': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { createGist, updateGist } = useGists()

// Form state
const filename = ref('untitled.md')
const description = ref('')
const isPublic = ref(true)
const isSaving = ref(false)

// Whether we're updating an existing gist
const isUpdate = computed(() => !!props.existingGist)

// Initialize form when gist changes
watch(() => props.existingGist, (gist) => {
  if (gist) {
    // Get the first markdown file or first file
    const files = Object.entries(gist.files)
    const mdFile = files.find(([name]) => name.endsWith('.md'))
    const targetFile = mdFile || files[0]
    
    if (targetFile) {
      let name = targetFile[0]
      // Remove .md extension for display
      if (name.endsWith('.md')) {
        name = name.slice(0, -3)
      }
      filename.value = name
    }
    
    description.value = gist.description || ''
    isPublic.value = gist.public
  } else {
    // Reset to defaults (without .md)
    filename.value = 'untitled'
    description.value = ''
    isPublic.value = true
  }
}, { immediate: true })

// Get the final filename with .md extension
const getFinalFilename = () => {
  const trimmed = filename.value.trim()
  if (!trimmed) return 'untitled.md'
  
  // If it already ends with .md, use as is
  if (trimmed.endsWith('.md')) {
    return trimmed
  }
  
  // Otherwise, add .md extension
  return trimmed + '.md'
}

// Check if we have content
const hasContent = computed(() => {
  return props.content && props.content.trim().length > 0
})

// Form validation
const isValid = computed(() => {
  return filename.value.trim().length > 0 && hasContent.value
})

// Handle form submission
const handleSubmit = async () => {
  if (!isValid.value || isSaving.value) return
  
  // This should never happen now due to form validation
  if (!hasContent.value) {
    return
  }
  
  isSaving.value = true
  
  try {
    let result
    const finalFilename = getFinalFilename()
    
    if (isUpdate.value && props.existingGist) {
      // Update existing gist
      result = await updateGist(props.existingGist.id, {
        description: description.value || undefined,
        files: {
          [finalFilename]: { content: props.content }
        }
      })
    } else {
      // Create new gist
      const gistData = {
        description: description.value || undefined,
        public: isPublic.value,
        files: {
          [finalFilename]: { content: props.content }
        }
      }
      result = await createGist(gistData)
    }
    
    if (result.success && result.gist) {
      emit('saved', result.gist)
      isOpen.value = false
    } else {
      // TODO: Show error toast
      console.error('Failed to save gist:', result.error)
    }
  } catch (error) {
    console.error('Error saving gist:', error)
  } finally {
    isSaving.value = false
  }
}

// Handle creating new instead of updating
const handleCreateNew = () => {
  // Emit event to clear current gist
  emit('createNew')
  // Reset form state for new gist (without .md)
  filename.value = 'untitled'
  description.value = ''
  isPublic.value = true
}
</script>
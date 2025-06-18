<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[700px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh]">
      <form @submit.prevent="handleSubmit" class="contents">
        <DialogHeader class="p-6 pb-0">
          <DialogTitle>{{ isUpdate ? 'Update' : 'Save as' }} Gist</DialogTitle>
          <DialogDescription>
            {{ isUpdate ? 'Update your existing gist with the current content.' : 'Save your markdown as a GitHub Gist to access it from anywhere.' }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="!hasContent" class="px-6 py-8">
          <Alert>
            <Info class="h-4 w-4" />
            <AlertTitle>No content to save</AlertTitle>
            <AlertDescription>
              Please write some content in the editor before saving a gist.
            </AlertDescription>
          </Alert>
        </div>
        
        <div v-else class="overflow-y-auto px-6 py-4 space-y-4">
            <!-- Gist Description -->
            <div class="space-y-2">
              <Label htmlFor="description">
                Description (optional)
                <span class="text-xs text-muted-foreground ml-2">(searchable but not shown as title)</span>
              </Label>
              <Textarea
                id="description"
                v-model="description"
                placeholder="A brief description of your gist..."
                rows="2"
              />
            </div>
            
            <!-- Public/Private toggle -->
            <div class="space-y-3">
              <Label>Visibility</Label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="isPublic = true"
                  :class="[
                    'flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all',
                    isPublic 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-border/80'
                  ]"
                  :disabled="isUpdate"
                >
                  <Icon name="lucide:globe" class="w-4 h-4" />
                  <div class="text-left">
                    <div class="text-sm font-medium">Public</div>
                    <div class="text-xs text-muted-foreground">Anyone can see</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  @click="isPublic = false"
                  :class="[
                    'flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all',
                    !isPublic 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-border/80'
                  ]"
                  :disabled="isUpdate"
                >
                  <Icon name="lucide:lock" class="w-4 h-4" />
                  <div class="text-left">
                    <div class="text-sm font-medium">Private</div>
                    <div class="text-xs text-muted-foreground">Only you can see</div>
                  </div>
                </button>
              </div>
              <p v-if="isUpdate" class="text-xs text-muted-foreground">
                <Icon name="lucide:info" class="w-3 h-3 inline mr-1" />
                Visibility cannot be changed after creation
              </p>
            </div>
            
            <!-- Alert about GitHub naming behavior -->
            <Alert v-if="!isUpdate">
              <Info class="h-4 w-4" />
              <AlertTitle>Tip: Filename becomes your gist title</AlertTitle>
              <AlertDescription>
                GitHub displays your gist using the filename, not the description. 
                Choose a descriptive name like "project-readme" or "api-documentation".
              </AlertDescription>
            </Alert>
            
            <!-- Files Section -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label>
                  Files
                  <span v-if="files.length > 1" class="text-xs text-muted-foreground ml-2">
                    (GitHub will name your gist after the first file alphabetically)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="addFile"
                  :disabled="files.length >= 10"
                >
                  <Icon name="lucide:plus" class="w-4 h-4 mr-1" />
                  Add File
                </Button>
              </div>
              
              <!-- Help message for adding files -->
              <p v-if="isUpdate && files.length === Object.keys(existingGist?.files || {}).length" class="text-xs text-muted-foreground">
                <Icon name="lucide:info" class="w-3 h-3 inline mr-1" />
                Click "Add File" to add a new file to this gist
              </p>
              
              <!-- File List -->
              <div class="space-y-3">
                <div
                  v-for="(file, index) in files"
                  :key="file.id"
                  :class="[
                    'p-3 border rounded-lg space-y-3',
                    files.length === 1 ? 'border-primary/20 bg-primary/5' : ''
                  ]"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex-1 space-y-1">
                      <div class="relative">
                        <Input
                          v-model="file.name"
                          :placeholder="index === 0 ? 'my-awesome-notes' : 'filename'"
                          required
                          class="pr-16"
                        />
                        <span 
                          v-if="file.name && !file.name.includes('.')" 
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"
                        >
                          .md
                        </span>
                      </div>
                      <p v-if="index === 0 && files.length === 1" class="text-xs text-muted-foreground">
                        This filename will be your gist's display name on GitHub
                      </p>
                    </div>
                    <Button
                      v-if="files.length > 1"
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeFile(index)"
                      class="text-destructive hover:text-destructive"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <!-- File content indicator -->
                  <div class="text-xs text-muted-foreground">
                    <span v-if="file.isCurrentEditor" class="flex items-center gap-1">
                      <Icon name="lucide:edit" class="w-3 h-3" />
                      Current editor content ({{ file.content.length }} characters)
                    </span>
                    <span v-else-if="file.existingFile && file.content" class="flex items-center gap-1">
                      <Icon name="lucide:file-text" class="w-3 h-3" />
                      Existing file ({{ file.content.length }} characters)
                    </span>
                    <span v-else class="flex items-center gap-1">
                      <Icon name="lucide:file-plus" class="w-3 h-3" />
                      New file
                    </span>
                  </div>
                </div>
              </div>
              
              <p class="text-xs text-muted-foreground">
                You can have up to 10 files in a single gist
              </p>
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
        
        <DialogFooter class="p-6 pt-0">
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
import type { Gist, GistFile } from '~/types/gist'
import { useGists } from '~/composables/useGists'
import { Info } from 'lucide-vue-next'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FileItem {
  id: string
  name: string
  content: string
  isCurrentEditor?: boolean
  existingFile?: boolean
}

const props = defineProps<{
  modelValue: boolean
  content: string
  existingGist?: Gist | null
  currentFilename?: string
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
const toast = useToast()

// Form state
const description = ref('')
const isPublic = ref(false)  // Default to private for better security
const isSaving = ref(false)
const files = ref<FileItem[]>([])

// Whether we're updating an existing gist
const isUpdate = computed(() => !!props.existingGist)

// Check if we have content
const hasContent = computed(() => {
  return props.content && props.content.trim().length > 0
})

// Initialize form when dialog opens or gist changes
watch([() => props.modelValue, () => props.existingGist], ([isOpen, gist]) => {
  if (!isOpen) return
  
  if (gist) {
    // Updating existing gist
    description.value = gist.description || ''
    isPublic.value = gist.public
    
    // Initialize files from existing gist
    files.value = []
    
    // Add the current editor content as the first file
    const currentFile = props.currentFilename || 'my-document.md'
    // Ensure we have the full filename with extension
    const currentFileWithExt = currentFile.includes('.') ? currentFile : currentFile + '.md'
    // For display in the form, remove the .md extension
    const currentFileBase = currentFileWithExt.endsWith('.md') ? currentFileWithExt.slice(0, -3) : currentFileWithExt
    
    files.value.push({
      id: Date.now().toString(),
      name: currentFileBase,
      content: props.content,
      isCurrentEditor: true
    })
    
    // Add other files from the gist (excluding the current one)
    Object.entries(gist.files).forEach(([filename, file]) => {
      // Skip the file that matches our current editor content
      if (filename !== currentFileWithExt) {
        const gistFile = file as GistFile
        files.value.push({
          id: Date.now().toString() + Math.random(),
          name: filename.endsWith('.md') ? filename.slice(0, -3) : filename,
          content: gistFile?.content || '',
          existingFile: true
        })
      }
    })
    
  } else {
    // Creating new gist
    description.value = ''
    isPublic.value = false  // Default to private for better security
    files.value = [{
      id: Date.now().toString(),
      name: 'my-document',
      content: props.content,
      isCurrentEditor: true
    }]
  }
}, { immediate: true })

// Add a new file
const addFile = () => {
  if (files.value.length >= 10) return
  
  files.value.push({
    id: Date.now().toString() + Math.random(),
    name: '',
    content: '',
    existingFile: false
  })
}

// Remove a file
const removeFile = (index: number) => {
  if (files.value.length <= 1) return
  files.value.splice(index, 1)
}

// Get final filename with extension
const getFinalFilename = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'my-document.md'
  
  // If it already has an extension, use as is
  if (trimmed.includes('.')) {
    return trimmed
  }
  
  // Otherwise, add .md extension
  return trimmed + '.md'
}


// Form validation
const isValid = computed(() => {
  if (!hasContent.value) return false
  
  // Check that all files have names
  return files.value.every(file => file.name.trim().length > 0)
})

// Handle form submission
const handleSubmit = async () => {
  if (!isValid.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    // Prepare files object
    const gistFiles: Record<string, { content: string }> = {}
    
    files.value.forEach(file => {
      const filename = getFinalFilename(file.name)
      // For the current editor file, use the actual content
      const content = file.isCurrentEditor ? props.content : (file.content || '.')
      gistFiles[filename] = { content }
    })
    
    let result
    
    if (isUpdate.value && props.existingGist) {
      // When updating, we need to handle deleted files
      const existingFilenames = Object.keys(props.existingGist.files)
      const newFilenames = Object.keys(gistFiles)
      
      // Find files that need to be deleted
      const filesToDelete = existingFilenames.filter(f => !newFilenames.includes(f))
      
      // Add delete instructions for removed files
      filesToDelete.forEach(filename => {
        gistFiles[filename] = { content: null as any }
      })
      
      result = await updateGist(props.existingGist.id, {
        description: description.value || undefined,
        files: gistFiles
      })
    } else {
      // Create new gist
      result = await createGist({
        description: description.value || undefined,
        public: isPublic.value,
        files: gistFiles
      })
    }
    
    if (result.success && result.gist) {
      emit('saved', result.gist)
      isOpen.value = false
      // Dialog closing and status bar update is enough feedback
    } else {
      toast.error(result.error || 'Failed to save gist')
      console.error('Failed to save gist:', result.error)
    }
  } catch (error) {
    toast.error('An unexpected error occurred while saving the gist')
    console.error('Error saving gist:', error)
  } finally {
    isSaving.value = false
  }
}

// Handle creating new instead of updating
const handleCreateNew = () => {
  emit('createNew')
  // Reset form state for new gist
  files.value = [{
    id: Date.now().toString(),
    name: 'my-document',
    content: props.content,
    isCurrentEditor: true
  }]
  description.value = ''
  isPublic.value = false  // Default to private for better security
}
</script>
<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Select a file to edit</DialogTitle>
        <DialogDescription>
          This gist contains {{ files.length }} file{{ files.length !== 1 ? 's' : '' }}. Choose which one you want to edit.
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-2 max-h-[400px] overflow-y-auto py-4">
        <div
          v-for="[filename, file] in files"
          :key="filename"
          @click="selectFile(filename)"
          class="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-medium flex items-center gap-2">
                <Icon :name="getFileIcon(filename)" class="w-4 h-4 text-muted-foreground" />
                {{ filename }}
              </h4>
              <p class="text-sm text-muted-foreground mt-1">
                {{ formatFileSize(file.size) }} · {{ file.language || 'Plain text' }}
              </p>
              <p v-if="file.truncated" class="text-xs text-orange-600 dark:text-orange-400 mt-1">
                <Icon name="lucide:alert-triangle" class="w-3 h-3 inline mr-1" />
                File truncated (too large)
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="lucide:arrow-right" class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Gist } from '~/types/gist'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
  modelValue: boolean
  gist: Gist
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [filename: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Get sorted file entries
const files = computed(() => {
  if (!props.gist) return []
  return Object.entries(props.gist.files).sort(([a], [b]) => a.localeCompare(b))
})

// Select a file and close dialog
const selectFile = (filename: string) => {
  emit('select', filename)
  isOpen.value = false
}

// Get appropriate icon for file type
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
    case 'jsx':
    case 'tsx':
      return 'lucide:file-code'
    case 'css':
    case 'scss':
    case 'less':
      return 'lucide:palette'
    case 'html':
    case 'xml':
      return 'lucide:code'
    case 'txt':
      return 'lucide:file-text'
    default:
      return 'lucide:file'
  }
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
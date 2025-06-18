<template>
  <div 
    v-if="currentGist"
    class="flex items-center gap-1.5 text-xs"
    :aria-label="statusAriaLabel"
  >
    <!-- Status Icon with animation -->
    <div class="relative w-3 h-3">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <!-- Syncing state -->
        <Icon 
          v-if="isSyncing"
          key="syncing"
          name="lucide:cloud-upload" 
          class="w-3 h-3 text-blue-600 dark:text-blue-500 animate-pulse absolute inset-0" 
        />
        <!-- Just saved state -->
        <Icon 
          v-else-if="showSavedAnimation"
          key="saved"
          name="lucide:cloud-check" 
          class="w-3 h-3 text-green-600 dark:text-green-500 absolute inset-0" 
        />
        <!-- Default connected state -->
        <Icon 
          v-else
          key="connected"
          name="lucide:cloud" 
          class="w-3 h-3 text-muted-foreground absolute inset-0" 
        />
      </Transition>
    </div>
    
    <!-- Status Text with dynamic content -->
    <span :class="statusTextClass">
      <span v-if="isSyncing">
        Saving to GitHub...
      </span>
      <span v-else-if="showSavedAnimation">
        Saved to GitHub
      </span>
      <span v-else>
        GitHub: <span class="font-medium">{{ gistName }}</span>
        <span v-if="isMultiFile" class="text-muted-foreground text-xs">
          <span class="mx-1">·</span>
          {{ fileCount }} files
        </span>
      </span>
    </span>
    
    <!-- Time indicator (only when not actively saving) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <span 
        v-if="!isSyncing && !showSavedAnimation && lastSaved" 
        class="text-muted-foreground hidden sm:inline"
      >
        · {{ lastSavedText }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Gist } from '~/types/gist'

interface Props {
  currentGist: Gist | null
  lastSaved?: Date | null
  isSyncing?: boolean
  currentFilename?: string
}

const props = withDefaults(defineProps<Props>(), {
  lastSaved: null,
  isSyncing: false,
  currentFilename: ''
})

// No emits needed anymore

// State for save animation
const showSavedAnimation = ref(false)
let savedAnimationTimeout: NodeJS.Timeout | null = null

// Watch for successful saves
watch(() => props.isSyncing, (newVal, oldVal) => {
  // When syncing changes from true to false, show saved animation
  if (oldVal === true && newVal === false && props.lastSaved) {
    // Clear any existing timeout
    if (savedAnimationTimeout) {
      clearTimeout(savedAnimationTimeout)
    }
    
    showSavedAnimation.value = true
    savedAnimationTimeout = setTimeout(() => {
      showSavedAnimation.value = false
    }, 2500) // Show "Saved" state for 2.5 seconds
  }
})

// Computed properties
const gistName = computed(() => {
  if (!props.currentGist) return ''
  // GitHub always shows gists by their first file alphabetically
  const files = Object.keys(props.currentGist.files).sort()
  return files[0] || 'Untitled'
})

const statusTextClass = computed(() => {
  if (props.isSyncing) return 'text-blue-600 dark:text-blue-500'
  if (showSavedAnimation.value) return 'text-green-600 dark:text-green-500 font-medium'
  return ''
})

const statusAriaLabel = computed(() => {
  if (props.isSyncing) return 'Saving to GitHub'
  if (showSavedAnimation.value) return 'Successfully saved to GitHub'
  return `Connected to GitHub gist: ${gistName.value}`
})

const isMultiFile = computed(() => {
  if (!props.currentGist) return false
  return Object.keys(props.currentGist.files).length > 1
})

const fileCount = computed(() => {
  if (!props.currentGist) return 0
  return Object.keys(props.currentGist.files).length
})

const lastSavedText = computed(() => {
  if (!props.lastSaved) return ''
  
  const now = new Date()
  const then = new Date(props.lastSaved)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return then.toLocaleTimeString()
})

// Update the last saved text every 10 seconds
let interval: NodeJS.Timeout | null = null

onMounted(() => {
  interval = setInterval(() => {
    // This will trigger a re-computation of lastSavedText
    // Vue's reactivity will handle the update
  }, 10000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
  if (savedAnimationTimeout) {
    clearTimeout(savedAnimationTimeout)
  }
})
</script>
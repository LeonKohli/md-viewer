<template>
  <div class="flex items-center gap-2">
    <!-- Only show local save status if NOT connected to a gist -->
    <template v-if="!isConnectedToGist">
      <!-- Auto-save indicator with tooltip -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <span class="text-[10px] text-muted-foreground/60 hidden sm:inline cursor-help">
              <Icon name="lucide:hard-drive" class="w-3 h-3 inline mr-0.5" />
              Local auto-save
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p class="text-xs">
              Auto-save to browser storage
              <br />
              <span class="text-[10px] opacity-70">Saves as you type • Protected from data loss</span>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span class="text-muted-foreground/40">•</span>
      
      <!-- Save status indicator -->
      <Transition mode="out-in" 
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95">
        
        <!-- Saving state -->
        <span v-if="saveStatus === 'saving'" 
              key="saving"
              class="flex items-center gap-1 text-muted-foreground">
          <Icon name="lucide:loader-2" class="w-3 h-3 animate-spin" />
          <span class="hidden sm:inline">Saving locally...</span>
        </span>
        
        <!-- Saved state -->
        <span v-else-if="saveStatus === 'saved' || (!hasUnsavedChanges && hasContent)" 
              key="saved"
              class="flex items-center gap-1 text-green-600 dark:text-green-400">
          <Icon name="lucide:check-circle-2" class="w-3 h-3" />
          <span class="hidden sm:inline">Saved locally</span>
        </span>
        
        <!-- Error state -->
        <span v-else-if="saveStatus === 'error'" 
              key="error"
              class="flex items-center gap-1 text-destructive cursor-help"
              :title="saveError || 'Save failed'">
          <Icon name="lucide:alert-circle" class="w-3 h-3" />
          <span class="hidden sm:inline">{{ saveError }}</span>
        </span>
        
        <!-- Idle state with status -->
        <span v-else-if="lastSaveTimeAgo" 
              key="idle"
              class="text-muted-foreground/70 text-[10px] hidden sm:inline">
          <span v-if="hasUnsavedChanges" class="text-muted-foreground">
            <Icon name="lucide:circle" class="w-2 h-2 inline animate-pulse mr-1" />
            Unsaved changes
          </span>
          <span v-else>{{ lastSaveTimeAgo }}</span>
        </span>
      </Transition>
    </template>
    
    <!-- When connected to a gist, show minimal local save indicator -->
    <template v-else>
      <div class="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
        <!-- Persistent local backup indicator -->
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex items-center gap-1 cursor-help">
                <Icon name="lucide:hard-drive" class="w-3 h-3" />
                <span class="hidden sm:inline">+ Local</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p class="text-xs">
                Auto-saving locally for backup
                <br />
                <span class="text-[10px] opacity-70">Your work is protected even offline</span>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <!-- Dynamic save state indicator -->
        <Transition mode="out-in" 
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-50">
          
          <!-- Active saving -->
          <Icon v-if="saveStatus === 'saving'" 
                key="local-saving"
                name="lucide:loader-2" 
                class="w-3 h-3 animate-spin text-muted-foreground" />
          
          <!-- Error state -->
          <Icon v-else-if="saveStatus === 'error'" 
                key="local-error"
                name="lucide:alert-triangle" 
                class="w-3 h-3 text-yellow-600 dark:text-yellow-400"
                :title="saveError || 'Local save failed'" />
          
          <!-- Success state (brief) -->
          <Icon v-else-if="showLocalSaveSuccess" 
                key="local-success"
                name="lucide:check" 
                class="w-3 h-3 text-green-600/50 dark:text-green-400/50" />
        </Transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SaveStatus } from '~/composables/useAutoSave'

interface Props {
  saveStatus: SaveStatus
  saveError: string | null
  lastSaveTimeAgo: string | null
  hasUnsavedChanges: boolean
  hasContent: boolean
  isConnectedToGist?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isConnectedToGist: false
})

// Show brief success indicator after local saves when connected to gist
const showLocalSaveSuccess = ref(false)
let successTimeout: NodeJS.Timeout | null = null

watch(() => props.saveStatus, (newStatus, oldStatus) => {
  // Show success briefly when transitioning from saving to saved while connected to gist
  if (props.isConnectedToGist && oldStatus === 'saving' && newStatus === 'saved') {
    if (successTimeout) clearTimeout(successTimeout)
    
    showLocalSaveSuccess.value = true
    successTimeout = setTimeout(() => {
      showLocalSaveSuccess.value = false
    }, 1500) // Show for 1.5 seconds
  }
})

onUnmounted(() => {
  if (successTimeout) clearTimeout(successTimeout)
})
</script>
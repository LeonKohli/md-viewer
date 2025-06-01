<template>
  <div class="flex items-center gap-2">
    <!-- Auto-save indicator with tooltip -->
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <span class="text-[10px] text-muted-foreground/60 hidden sm:inline cursor-help">
            <Icon name="lucide:shield-check" class="w-3 h-3 inline mr-0.5" />
            Auto-save
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p class="text-xs">
            Smart auto-save enabled
            <br />
            <span class="text-[10px] opacity-70">Saves as you type • Saves on tab switch • Saves every 30s</span>
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
        <span class="hidden sm:inline">Saving...</span>
      </span>
      
      <!-- Saved state -->
      <span v-else-if="saveStatus === 'saved' || (!hasUnsavedChanges && hasContent)" 
            key="saved"
            class="flex items-center gap-1 text-green-600 dark:text-green-400">
        <Icon name="lucide:check-circle-2" class="w-3 h-3" />
        <span class="hidden sm:inline">All changes saved</span>
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
}

defineProps<Props>()
</script>
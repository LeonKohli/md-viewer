<template>
  <div class="border-t border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between flex-shrink-0">
    <!-- Left section -->
    <div class="flex items-center gap-4">
      <span class="flex items-center gap-1">
        <div class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
        Live Preview
      </span>
      <span>•</span>
      <span class="flex items-center gap-1">
        <Icon 
          :name="scrollSyncIcon" 
          class="h-3 w-3"
          :class="{
            'text-green-500 dark:text-green-400': syncEnabled,
            'text-muted-foreground': !syncEnabled
          }"
        />
        <span>Scroll {{ syncEnabled ? 'sync on' : 'sync off' }}</span>
      </span>
      <span v-if="stats.words > 0">•</span>
      <span v-if="stats.words > 0">
        {{ stats.words }} {{ stats.words === 1 ? 'word' : 'words' }}
        <span v-if="stats.readingTime > 0" class="text-muted-foreground/70">
          (~{{ stats.readingTime }} min read)
        </span>
      </span>
      
      <!-- Selected text stats -->
      <span v-if="stats.selectedText && stats.selectedText.words > 0">•</span>
      <span v-if="stats.selectedText && stats.selectedText.words > 0" class="text-primary">
        {{ stats.selectedText.words }} selected ({{ stats.selectedText.percentage }}%)
      </span>
    </div>
    
    <!-- Right section -->
    <div class="flex items-center gap-4">
      <span v-if="hasContent">{{ formatNumber(stats.characters) }} chars</span>
      
      <span v-if="hasContent">•</span>
      <span v-if="hasContent" class="flex items-center gap-1">
        <Icon name="lucide:file-text" class="h-3 w-3" />
        <span>{{ formatFileSize(stats.characters) }}</span>
      </span>
      <span v-if="stats.lines > 0">•</span>
      <span v-if="stats.lines > 0">{{ stats.lines }} {{ stats.lines === 1 ? 'line' : 'lines' }}</span>
      <span>•</span>
      <span>Ln {{ cursorPosition.line }}, Col {{ cursorPosition.column }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarkdownStats, CursorPosition } from '~/types'

interface Props {
  stats: MarkdownStats
  cursorPosition: CursorPosition
  syncEnabled: boolean
  scrollSyncIcon: string
  hasContent: boolean
}

defineProps<Props>()


// Format large numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>
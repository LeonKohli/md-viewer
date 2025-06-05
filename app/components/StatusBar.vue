<template>
  <div class="border-t border-border bg-muted/50 px-3 md:px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between flex-shrink-0 overflow-hidden">
    <!-- Left section -->
    <div class="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink">
      <span class="flex items-center gap-1 hidden sm:flex">
        <div class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
        <span class="hidden lg:inline">Live Preview</span>
        <span class="lg:hidden">Live</span>
      </span>
      <span class="hidden sm:inline">•</span>
      <span class="hidden md:flex items-center gap-1">
        <Icon 
          :name="scrollSyncIcon" 
          class="h-3 w-3"
          :class="{
            'text-green-500 dark:text-green-400': syncEnabled,
            'text-muted-foreground': !syncEnabled
          }"
        />
        <span class="hidden xl:inline">Scroll {{ syncEnabled ? 'sync on' : 'sync off' }}</span>
        <span class="xl:hidden">{{ syncEnabled ? 'Sync' : 'No sync' }}</span>
      </span>
      <span v-if="stats.words > 0" class="hidden sm:inline">•</span>
      <span v-if="stats.words > 0" class="flex items-center gap-1">
        <span class="hidden sm:inline">{{ stats.words }}</span>
        <span class="sm:hidden">{{ formatCompactNumber(stats.words) }}</span>
        <span class="hidden sm:inline">{{ stats.words === 1 ? 'word' : 'words' }}</span>
        <span class="sm:hidden">w</span>
        <span v-if="stats.readingTime > 0" class="text-muted-foreground/70 hidden lg:inline">
          (~{{ stats.readingTime }} min read)
        </span>
      </span>
      
      <!-- Selected text stats -->
      <span v-if="stats.selectedText && stats.selectedText.words > 0" class="hidden md:inline">•</span>
      <span v-if="stats.selectedText && stats.selectedText.words > 0" class="text-primary hidden md:inline">
        {{ stats.selectedText.words }} selected ({{ stats.selectedText.percentage }}%)
      </span>
    </div>
    
    <!-- Right section -->
    <div class="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink-0">
      <span v-if="hasContent" class="hidden lg:inline">{{ formatNumber(stats.characters) }} chars</span>
      
      <span v-if="hasContent" class="hidden lg:inline">•</span>
      <span v-if="hasContent" class="hidden md:flex items-center gap-1">
        <Icon name="lucide:file-text" class="h-3 w-3" />
        <span>{{ formatFileSize(stats.characters) }}</span>
      </span>
      <span v-if="stats.lines > 0" class="hidden sm:inline">•</span>
      <span v-if="stats.lines > 0" class="hidden sm:inline">{{ stats.lines }} {{ stats.lines === 1 ? 'line' : 'lines' }}</span>
      <span class="hidden xs:inline">•</span>
      <span class="text-[11px] sm:text-xs">
        <span class="hidden xs:inline">Ln </span>{{ cursorPosition.line }}<span class="hidden xs:inline">,</span>
        <span class="xs:hidden">:</span>
        <span class="hidden xs:inline">Col </span>{{ cursorPosition.column }}
        <span v-if="vimMode" class="ml-2 capitalize">{{ vimMode }}</span>
      </span>
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
  vimMode?: 'insert' | 'normal' | 'visual'
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

// Format numbers in compact form for mobile
const formatCompactNumber = (num: number): string => {
  if (num < 1000) return num.toString()
  if (num < 10000) return `${(num / 1000).toFixed(1)}k`
  return `${Math.floor(num / 1000)}k`
}
</script>
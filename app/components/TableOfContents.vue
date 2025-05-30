<template>
  <div class="toc-container h-full flex flex-col bg-background border-l border-border">
    <!-- TOC Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 class="text-sm font-semibold">Table of Contents</h3>
      <Button
        variant="ghost"
        size="sm"
        @click="$emit('close')"
        class="h-7 w-7 p-0"
      >
        <Icon name="lucide:x" class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- TOC Content -->
    <div class="flex-1 overflow-y-auto py-2">
      <div v-if="headings.length === 0" class="text-sm text-muted-foreground px-4 py-2">
        No headings found
      </div>
      
      <nav v-else>
        <TocItem
          v-for="heading in headings"
          :key="heading.id"
          :item="heading"
          :active-id="activeHeadingId"
          @navigate="$emit('navigate', $event)"
        />
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import TocItem from '~/components/TocItem.vue'
import type { TocItem as TocItemType } from '~/composables/useTableOfContents'

interface Props {
  headings: TocItemType[]
  activeHeadingId: string
}

defineProps<Props>()
defineEmits<{
  close: []
  navigate: [id: string]
}>()
</script>

<style scoped>
.toc-container {
  width: 280px;
  max-width: 85vw; /* Responsive on mobile */
}

@media (max-width: 768px) {
  .toc-container {
    width: 85vw;
  }
}

/* Custom scrollbar */
.toc-container > div:last-child {
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}

.toc-container > div:last-child::-webkit-scrollbar {
  width: 6px;
}

.toc-container > div:last-child::-webkit-scrollbar-track {
  background: transparent;
}

.toc-container > div:last-child::-webkit-scrollbar-thumb {
  background-color: var(--muted);
  border-radius: 3px;
}

.toc-container > div:last-child::-webkit-scrollbar-thumb:hover {
  background-color: var(--muted-foreground);
}
</style>
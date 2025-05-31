<template>
  <div class="toc-item">
    <button
      @click="$emit('navigate', item.id)"
      class="toc-button w-full text-left flex items-center py-1.5 px-3 rounded-md transition-all duration-150 hover:bg-muted/50"
      :class="{
        'bg-primary/10 text-primary font-medium': isActive,
        'text-muted-foreground hover:text-foreground': !isActive
      }"
      :style="{ paddingLeft: `${0.75 + (item.level - 1)}rem` }"
    >
      <span class="text-sm truncate">{{ item.text }}</span>
    </button>
    
    <div v-if="item.children.length > 0" class="toc-children">
      <TocItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :active-id="activeId"
        @navigate="$emit('navigate', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TocItem as TocItemType } from '~/composables/useTableOfContents'

interface Props {
  item: TocItemType
  activeId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  navigate: [id: string]
}>()

const isActive = computed(() => props.item.id === props.activeId)
</script>


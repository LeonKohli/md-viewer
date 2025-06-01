<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-4 scale-95"
  >
    <div v-if="show && content" 
         class="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <div class="bg-card border rounded-lg shadow-lg p-4">
        <div class="flex items-start gap-3">
          <Icon name="lucide:history" class="w-5 h-5 text-primary mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-sm mb-1">Recover previous session?</h3>
            <p class="text-xs text-muted-foreground mb-3">
              Found unsaved content ({{ formatCharacterCount(content.metadata.characterCount) }}) 
              from {{ timeAgo }}.
            </p>
            <div class="flex gap-2 justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                @click="$emit('discard')"
                class="text-xs h-7">
                Start Fresh
              </Button>
              <Button 
                size="sm" 
                @click="$emit('recover')"
                class="text-xs h-7">
                Recover Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'

interface Props {
  show: boolean
  content: {
    content: string
    metadata: {
      timestamp: number
      characterCount: number
      hash?: string
    }
  } | null
}

const props = defineProps<Props>()

defineEmits<{
  recover: []
  discard: []
}>()

// Compute time ago
const timeAgo = computed(() => {
  if (!props.content?.metadata?.timestamp) return 'recently'
  return useTimeAgo(new Date(props.content.metadata.timestamp)).value
})

// Format character count
const formatCharacterCount = (count: number) => {
  if (count < 1000) return `${count} characters`
  if (count < 10000) return `${(count / 1000).toFixed(1)}k characters`
  return `${Math.round(count / 1000)}k characters`
}
</script>
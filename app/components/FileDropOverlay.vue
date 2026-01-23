<template>
  <Transition
    enter-active-class="transition-all duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="absolute inset-0 z-50 pointer-events-none"
    >
      <!-- Subtle tinted background -->
      <div
        class="absolute inset-0 transition-colors"
        :class="[
          isError
            ? 'bg-destructive/5'
            : 'bg-primary/5'
        ]"
      />

      <!-- Border highlight -->
      <div
        class="absolute inset-1 rounded-md border-2 border-dashed transition-colors"
        :class="[
          isError
            ? 'border-destructive/40'
            : 'border-primary/40'
        ]"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
type FileDropOverlayProps = {
  isVisible: boolean
  isError?: boolean
}

withDefaults(defineProps<FileDropOverlayProps>(), {
  isError: false
})
</script>

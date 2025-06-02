<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global app configuration
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Markdown Preview` : 'Markdown Preview';
  }
})

defineOgImageComponent("WithEmoji")
</script>

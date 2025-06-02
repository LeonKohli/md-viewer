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

// Define custom OG image for the Markdown Preview site
defineOgImageComponent('MarkdownPreview', {
  title: 'Markdown Preview',
  description: 'Live preview and edit your Markdown files with syntax highlighting',
  icon: 'carbon:document-view',
  colorMode: 'dark'
})
</script>

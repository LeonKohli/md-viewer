<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global app configuration
const colorMode = useColorMode()

// Compute theme color based on color mode
const themeColor = computed(() => {
  return colorMode.value === 'dark' ? '#0a0a0a' : '#ffffff'
})

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Markdown Preview` : 'Markdown Preview';
  },
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'msapplication-TileColor', content: themeColor }
  ]
})

// Define custom OG image for the Markdown Preview site
defineOgImageComponent('MarkdownPreview', {
  title: 'Markdown Preview',
  description: 'Live preview and edit your Markdown files with syntax highlighting',
  icon: 'carbon:document-view',
  colorMode: 'dark'
})
</script>

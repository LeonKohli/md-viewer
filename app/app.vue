<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global app configuration
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Nuxt Shadcn Boilerplate` : 'Nuxt Shadcn Boilerplate';
  }
})
</script>

<style>

</style>

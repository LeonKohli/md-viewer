<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="label"
    @click="toggle"
    class="transition-all duration-150 hover:scale-105"
  >
    <Icon :name="icon" class="w-5 h-5 transition-all duration-300 ease-in-out" />
  </Button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const icon = computed(() => (colorMode.value === 'dark' ? 'lucide:moon' : 'lucide:sun'))
const label = computed(() => (colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'))

function toggle() {
  // Toggle between light and dark, explicitly setting the preference.
  // If the current preference is 'system', it will default to toggling based on the detected value.
  const currentPreference = colorMode.preference
  const currentValue = colorMode.value // fallback if preference is 'system'

  if (currentPreference === 'system') {
    // If system, toggle based on the *detected* value
    colorMode.preference = currentValue === 'dark' ? 'light' : 'dark'
  } else {
    // Otherwise, toggle the explicit preference
    colorMode.preference = currentPreference === 'dark' ? 'light' : 'dark'
  }
}
</script>

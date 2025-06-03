export default defineNuxtPlugin(() => {
  // Update theme-color meta tag based on color mode
  const colorMode = useColorMode()
  
  // Define theme colors for each mode
  const themeColors = {
    light: '#ffffff',
    dark: '#0a0a0a'
  }

  // Function to update theme color
  const updateThemeColor = (mode: string) => {
    const color = themeColors[mode as keyof typeof themeColors] || themeColors.light
    
    // Update theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.setAttribute('content', color)
    
    // Also update msapplication-TileColor for Windows
    let metaTileColor = document.querySelector('meta[name="msapplication-TileColor"]')
    if (!metaTileColor) {
      metaTileColor = document.createElement('meta')
      metaTileColor.setAttribute('name', 'msapplication-TileColor')
      document.head.appendChild(metaTileColor)
    }
    metaTileColor.setAttribute('content', color)
  }

  // Watch for color mode changes
  watch(() => colorMode.preference, (newMode) => {
    updateThemeColor(newMode)
  }, { immediate: true })

  // Also watch for system preference changes
  watch(() => colorMode.value, (newMode) => {
    updateThemeColor(newMode)
  }, { immediate: true })
})
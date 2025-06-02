import { useScriptNpm } from '#imports'

// Declare mermaid on window to fix TypeScript errors
declare global {
  interface Window {
    mermaid: any
  }
}

/**
 * Optimized Mermaid plugin using Nuxt Scripts
 * Replaces the old mermaid.client.ts with better performance
 */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  
  // Track if mermaid has been initialized
  let isInitialized = false
  let mermaidInstance: any = null
  
  // Use Nuxt Scripts to load Mermaid with optimal settings
  const { onLoaded, load } = useScriptNpm({
    packageName: 'mermaid',
    version: '11.6.0',
    file: 'dist/mermaid.min.js',
    scriptOptions: {
      // Load immediately since this is a core feature
      trigger: 'onNuxtReady',
      // Bundle for better performance
      bundle: true,
      // Set up the window.mermaid object
      use: () => {
        if (typeof window !== 'undefined' && window.mermaid) {
          return { mermaid: window.mermaid }
        }
        return {}
      }
    }
  })
  
  // Initialize mermaid when loaded
  onLoaded(({ mermaid }) => {
    if (!mermaid || isInitialized) return
    
    mermaidInstance = mermaid
    
    // Initialize with current theme
    mermaid.initialize({
      startOnLoad: false,
      theme: colorMode.value === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })
    
    isInitialized = true
  })
  
  // Render function that matches the existing API
  const renderMermaidDiagrams = async () => {
    // Wait for next tick to ensure DOM is updated
    await nextTick()
    
    // If mermaid isn't loaded yet, trigger loading
    if (!isInitialized) {
      await load()
      // Wait for initialization
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (isInitialized && mermaidInstance) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 50)
      })
    }
    
    // Use mermaid.run() to render all diagrams
    if (mermaidInstance && mermaidInstance.run) {
      try {
        await mermaidInstance.run()
      } catch (error) {
        console.error('Mermaid rendering error:', error)
      }
    }
  }
  
  // Watch for color mode changes and re-render
  watch(() => colorMode.value, async (newMode) => {
    if (!isInitialized || !mermaidInstance) return
    
    // Get all mermaid containers
    const containers = document.querySelectorAll('.mermaid-container[data-mermaid-src]')
    
    if (containers.length === 0) return
    
    // Re-initialize with new theme
    mermaidInstance.initialize({
      startOnLoad: false,
      theme: newMode === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    })
    
    // Process each container
    for (const container of containers) {
      const mermaidSrc = container.getAttribute('data-mermaid-src')
      if (!mermaidSrc) continue
      
      // Clear the container
      container.innerHTML = ''
      
      // Create new pre element with original mermaid code
      const newPre = document.createElement('pre')
      newPre.className = 'mermaid'
      newPre.textContent = mermaidSrc
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      
      // Add the pre element back to container
      container.appendChild(newPre)
    }
    
    // Re-render all diagrams
    await renderMermaidDiagrams()
  })
  
  // Provide the same API as the old plugin
  return {
    provide: {
      renderMermaid: renderMermaidDiagrams
    }
  }
})
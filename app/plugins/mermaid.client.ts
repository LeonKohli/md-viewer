import mermaid from 'mermaid'

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  
  // Initialize mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: colorMode.value === 'dark' ? 'dark' : 'default'
  })
  
  // Render function
  const renderMermaidDiagrams = async () => {
    await nextTick()
    await mermaid.run()
  }

  // Re-render when color mode changes
  watch(() => colorMode.value, async (newMode) => {
    // Get all mermaid containers
    const containers = document.querySelectorAll('.mermaid-container[data-mermaid-src]')
    
    if (containers.length === 0) return
    
    // Reset mermaid with new theme
    mermaid.initialize({
      startOnLoad: false,
      theme: newMode === 'dark' ? 'dark' : 'default'
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
    
    // Re-render all mermaid diagrams
    await nextTick()
    await mermaid.run()
  })

  return {
    provide: {
      renderMermaid: renderMermaidDiagrams
    }
  }
})
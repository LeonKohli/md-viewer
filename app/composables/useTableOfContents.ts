import type { Ref } from 'vue'

// TocItem is auto-imported from shared/types/editor.ts

export function useTableOfContents(content: Ref<string>, renderedHtml?: Ref<string>) {
  const activeHeadingId = ref<string>('')
  // Write directly to global state
  const globalHeadings = useTocHeadings()

  // Allow external setting of active heading
  const setActiveHeading = (id: string) => {
    activeHeadingId.value = id
  }

  // Extract headings from rendered HTML for accurate IDs
  const headings = computed(() => {
    const items: TocItem[] = []
    
    // If we have rendered HTML, extract from that for accurate IDs
    if (renderedHtml?.value) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(renderedHtml.value, 'text/html')
      const headingElements = doc.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
      
      headingElements.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        const text = heading.textContent || ''
        const id = heading.id
        
        if (id && text) {
          items.push({ id, text, level, children: [] })
        }
      })
    } else {
      // Fallback to extracting from markdown
      const headingRegex = /^(#{1,6})\s+(.+)$/gm
      let match
      
      while ((match = headingRegex.exec(content.value)) !== null) {
        const level = match[1]?.length ?? 1
        const text = match[2]?.trim() ?? ''
        // This is a simplified ID generation - may not match gfmHeadingId exactly
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-')     // Replace spaces with hyphens
          .replace(/-+/g, '-')      // Replace multiple hyphens with single
          .replace(/^-|-$/g, '')    // Remove leading/trailing hyphens
        
        items.push({ id, text, level, children: [] })
      }
    }
    
    return buildHierarchy(items)
  })

  // Sync to global state for layout/navbar access
  watch(headings, (newHeadings) => {
    globalHeadings.value = newHeadings
  }, { deep: true, immediate: true })

  // Build hierarchical structure
  function buildHierarchy(items: TocItem[]): TocItem[] {
    const root: TocItem[] = []
    const stack: TocItem[] = []
    
    items.forEach(item => {
      while (stack.length > 0 && stack[stack.length - 1]!.level >= item.level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        root.push(item)
      } else {
        stack[stack.length - 1]!.children.push(item)
      }
      
      stack.push(item)
    })
    
    return root
  }
  
  // Function to update active heading (will be called from parent)
  const updateActiveHeading = (container: HTMLElement) => {
    const headings = container.querySelectorAll<HTMLHeadingElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    const containerRect = container.getBoundingClientRect()
    
    // Find the heading that's most visible in the viewport
    let mostVisibleId = ''
    let maxVisibility = 0
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect()
      const relativeTop = rect.top - containerRect.top
      const relativeBottom = rect.bottom - containerRect.top
      
      // Check if heading is in viewport
      if (relativeBottom > 0 && relativeTop < containerRect.height) {
        // Calculate how much of the heading is visible
        const visibleTop = Math.max(0, relativeTop)
        const visibleBottom = Math.min(containerRect.height, relativeBottom)
        const visibleHeight = visibleBottom - visibleTop
        
        // Prefer headings near the top of the viewport
        const distanceFromTop = Math.max(0, relativeTop)
        const visibility = visibleHeight / (1 + distanceFromTop * 0.01)
        
        if (visibility > maxVisibility && heading.id) {
          maxVisibility = visibility
          mostVisibleId = heading.id
        }
      }
    })
    
    if (mostVisibleId) {
      activeHeadingId.value = mostVisibleId
    }
  }
  
  return {
    headings,
    activeHeadingId,
    updateActiveHeading,
    setActiveHeading
  }
}
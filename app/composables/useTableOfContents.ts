import { computed, ref, type Ref } from 'vue'

export interface TocItem {
  id: string
  text: string
  level: number
  children: TocItem[]
}

export function useTableOfContents(content: Ref<string>) {
  const activeHeadingId = ref<string>('')
  
  // Allow external setting of active heading
  const setActiveHeading = (id: string) => {
    activeHeadingId.value = id
  }
  
  // Extract headings from markdown content
  const headings = computed(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const items: TocItem[] = []
    let match
    
    while ((match = headingRegex.exec(content.value)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      items.push({ id, text, level, children: [] })
    }
    
    return buildHierarchy(items)
  })
  
  // Build hierarchical structure
  function buildHierarchy(items: TocItem[]): TocItem[] {
    const root: TocItem[] = []
    const stack: TocItem[] = []
    
    items.forEach(item => {
      while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        root.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }
      
      stack.push(item)
    })
    
    return root
  }
  
  // Function to update active heading (will be called from parent)
  const updateActiveHeading = (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    const containerRect = container.getBoundingClientRect()
    
    // Find the heading that's most visible in the viewport
    let mostVisibleHeading: Element | null = null
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
        
        if (visibility > maxVisibility) {
          maxVisibility = visibility
          mostVisibleHeading = heading
        }
      }
    })
    
    if (mostVisibleHeading && mostVisibleHeading.id) {
      activeHeadingId.value = mostVisibleHeading.id
    }
  }
  
  return {
    headings,
    activeHeadingId,
    updateActiveHeading,
    setActiveHeading
  }
}
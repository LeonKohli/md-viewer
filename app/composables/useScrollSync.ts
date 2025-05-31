import { useEventListener, useThrottleFn } from '@vueuse/core'

export function useScrollSync() {
  // Scroll sync state
  const isEnabled = ref(true)
  
  // Element refs
  const editorElement = ref<HTMLTextAreaElement | null>(null)
  const previewElement = ref<HTMLElement | null>(null)
  
  // Track which panel is actively being scrolled
  let activePanel: 'editor' | 'preview' | null = null
  let scrollEndTimer: NodeJS.Timeout | null = null
  let isMouseDown = false
  
  // Calculate scroll percentage
  const getScrollPercentage = (element: HTMLElement): number => {
    const { scrollTop, scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return 0
    return scrollTop / maxScroll
  }
  
  // Set scroll position by percentage
  const setScrollPercentage = (element: HTMLElement, percentage: number) => {
    const { scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return
    
    const targetScrollTop = percentage * maxScroll
    
    // Only update if there's a meaningful difference
    const currentScrollTop = element.scrollTop
    if (Math.abs(targetScrollTop - currentScrollTop) > 1) {
      element.scrollTop = targetScrollTop
    }
  }
  
  // Handle scroll end detection
  const handleScrollEnd = () => {
    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }
    // Longer timeout for scrollbar dragging
    const timeout = isMouseDown ? 300 : 150
    scrollEndTimer = setTimeout(() => {
      activePanel = null
    }, timeout)
  }
  
  // Handle editor scroll
  const handleEditorScroll = useThrottleFn(() => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    
    // If preview is actively scrolling, ignore editor events
    if (activePanel === 'preview') return
    
    // Mark editor as active
    activePanel = 'editor'
    handleScrollEnd()
    
    // Sync to preview
    const percentage = getScrollPercentage(editorElement.value)
    setScrollPercentage(previewElement.value, percentage)
  }, 32) // Slightly slower for scrollbar stability
  
  // Handle preview scroll
  const handlePreviewScroll = useThrottleFn(() => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    
    // If editor is actively scrolling, ignore preview events
    if (activePanel === 'editor') return
    
    // Mark preview as active
    activePanel = 'preview'
    handleScrollEnd()
    
    // Sync to editor
    const percentage = getScrollPercentage(previewElement.value)
    setScrollPercentage(editorElement.value, percentage)
  }, 32) // Slightly slower for scrollbar stability
  
  // Mouse event handlers
  const handleMouseDown = () => {
    isMouseDown = true
  }
  
  const handleMouseUp = () => {
    isMouseDown = false
    // Clear active panel after mouse up with delay
    setTimeout(() => {
      if (!isMouseDown) {
        activePanel = null
      }
    }, 100)
  }
  
  // Set up listeners
  const setupListeners = () => {
    // Scroll listeners
    if (editorElement.value) {
      useEventListener(editorElement.value, 'scroll', handleEditorScroll, { passive: true })
      useEventListener(editorElement.value, 'mousedown', handleMouseDown)
    }
    
    if (previewElement.value) {
      useEventListener(previewElement.value, 'scroll', handlePreviewScroll, { passive: true })
      useEventListener(previewElement.value, 'mousedown', handleMouseDown)
    }
    
    // Global mouse up listener
    useEventListener(document, 'mouseup', handleMouseUp)
  }
  
  // Watch for element changes
  watch([editorElement, previewElement], () => {
    nextTick(() => {
      setupListeners()
    })
  }, { immediate: true })
  
  // Set elements
  const setEditorElement = (element: HTMLTextAreaElement | null) => {
    editorElement.value = element
  }
  
  const setPreviewElement = (element: HTMLElement | null) => {
    previewElement.value = element
  }
  
  // Toggle sync
  const toggleSync = () => {
    isEnabled.value = !isEnabled.value
    activePanel = null
  }
  
  // Manual sync operations
  const syncToTop = () => {
    activePanel = null
    if (editorElement.value) editorElement.value.scrollTop = 0
    if (previewElement.value) previewElement.value.scrollTop = 0
  }
  
  const syncToBottom = () => {
    activePanel = null
    if (editorElement.value) {
      editorElement.value.scrollTop = editorElement.value.scrollHeight
    }
    if (previewElement.value) {
      previewElement.value.scrollTop = previewElement.value.scrollHeight
    }
  }
  
  // Programmatic scroll (for TOC)
  const scrollToElement = (element: HTMLElement) => {
    if (!previewElement.value) return
    
    // Mark as programmatic
    activePanel = 'preview'
    
    const container = previewElement.value
    const rect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const relativeTop = rect.top - containerRect.top + container.scrollTop
    
    // Scroll preview
    container.scrollTo({
      top: relativeTop - 20,
      behavior: 'smooth'
    })
    
    // Sync editor if enabled
    if (isEnabled.value && editorElement.value) {
      const percentage = (relativeTop - 20) / (container.scrollHeight - container.clientHeight)
      const editorTarget = percentage * (editorElement.value.scrollHeight - editorElement.value.clientHeight)
      
      editorElement.value.scrollTo({
        top: editorTarget,
        behavior: 'smooth'
      })
    }
    
    // Clear after animation
    setTimeout(() => {
      activePanel = null
    }, 800)
  }
  
  // Computed properties
  const scrollSyncStatus = computed(() => {
    return isEnabled.value ? 'enabled' : 'disabled'
  })
  
  const scrollSyncIcon = computed(() => {
    return isEnabled.value ? 'lucide:link' : 'lucide:unlink'
  })
  
  const scrollSyncTooltip = computed(() => {
    return isEnabled.value 
      ? 'Scroll sync enabled - Click to disable' 
      : 'Scroll sync disabled - Click to enable'
  })
  
  return {
    syncEnabled: isEnabled,
    scrollSyncStatus,
    scrollSyncIcon,
    scrollSyncTooltip,
    setEditorElement,
    setPreviewElement,
    toggleSync,
    syncToTop,
    syncToBottom,
    scrollToElement,
  }
}
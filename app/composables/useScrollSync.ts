import { useEventListener, useTimeoutFn } from '@vueuse/core'

export function useScrollSync() {
  // Scroll sync state
  const isEnabled = ref(true)
  const toggleSync = () => {
    isEnabled.value = !isEnabled.value
  }
  
  // Element refs
  const editorElement = ref<HTMLTextAreaElement | null>(null)
  const previewElement = ref<HTMLElement | null>(null)
  
  // Track which panel is actively being scrolled
  let activePanel: 'editor' | 'preview' | null = null
  let isMouseDown = false
  
  // Track pending sync operations to prevent duplicate rAF calls
  let pendingEditorSync = false
  let pendingPreviewSync = false
  
  // Performance monitoring in development
  const performanceMetrics = ref({
    lastSyncDuration: 0,
    syncCount: 0,
    averageSyncDuration: 0
  })
  
  // Calculate scroll percentage with caching for better performance
  const getScrollPercentage = (element: HTMLElement): number => {
    const { scrollTop, scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return 0
    return scrollTop / maxScroll
  }
  
  // Set scroll position by percentage with performance tracking
  const setScrollPercentage = (element: HTMLElement, percentage: number) => {
    const startTime = performance.now()
    
    const { scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return
    
    const targetScrollTop = percentage * maxScroll
    
    // Only update if there's a meaningful difference (prevents micro-jitter)
    const currentScrollTop = element.scrollTop
    const diff = Math.abs(targetScrollTop - currentScrollTop)
    
    if (diff > 1) {
      element.scrollTop = targetScrollTop
      
      // Track performance in development
      if (import.meta.dev) {
        const duration = performance.now() - startTime
        performanceMetrics.value.lastSyncDuration = duration
        performanceMetrics.value.syncCount++
        performanceMetrics.value.averageSyncDuration = 
          (performanceMetrics.value.averageSyncDuration * (performanceMetrics.value.syncCount - 1) + duration) / 
          performanceMetrics.value.syncCount
      }
    }
  }
  
  // Handle scroll end detection
  const { start: startScrollEndTimer, stop: stopScrollEndTimer } = useTimeoutFn(
    () => {
      activePanel = null
      pendingEditorSync = false
      pendingPreviewSync = false
    },
    () => isMouseDown ? 300 : 150, // Dynamic timeout based on mouse state
    { immediate: false }
  )
  
  const handleScrollEnd = () => {
    stopScrollEndTimer()
    startScrollEndTimer()
  }
  
  // Sync editor scroll to preview using single rAF execution
  const syncEditorToPreview = () => {
    if (pendingEditorSync || !isEnabled.value) return
    
    pendingEditorSync = true
    requestAnimationFrame(() => {
      if (!editorElement.value || !previewElement.value) {
        pendingEditorSync = false
        return
      }
      
      const percentage = getScrollPercentage(editorElement.value)
      setScrollPercentage(previewElement.value, percentage)
      pendingEditorSync = false
    })
  }
  
  // Sync preview scroll to editor using single rAF execution
  const syncPreviewToEditor = () => {
    if (pendingPreviewSync || !isEnabled.value) return
    
    pendingPreviewSync = true
    requestAnimationFrame(() => {
      if (!editorElement.value || !previewElement.value) {
        pendingPreviewSync = false
        return
      }
      
      const percentage = getScrollPercentage(previewElement.value)
      setScrollPercentage(editorElement.value, percentage)
      pendingPreviewSync = false
    })
  }
  
  // Handle editor scroll
  const handleEditorScroll = () => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    
    // If preview is actively scrolling, ignore editor events
    if (activePanel === 'preview') return
    
    // Mark editor as active
    activePanel = 'editor'
    handleScrollEnd()
    
    // Trigger sync
    syncEditorToPreview()
  }
  
  // Handle preview scroll
  const handlePreviewScroll = () => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    
    // If editor is actively scrolling, ignore preview events
    if (activePanel === 'editor') return
    
    // Mark preview as active
    activePanel = 'preview'
    handleScrollEnd()
    
    // Trigger sync
    syncPreviewToEditor()
  }
  
  // Mouse event handlers
  const handleMouseDown = () => {
    isMouseDown = true
  }
  
  // Mouse up handler with timeout
  const { start: startMouseUpTimer } = useTimeoutFn(
    () => {
      if (!isMouseDown) {
        activePanel = null
      }
    },
    100,
    { immediate: false }
  )
  
  const handleMouseUp = () => {
    isMouseDown = false
    startMouseUpTimer()
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
  
  // Clear active panel when toggling
  watch(isEnabled, () => {
    activePanel = null
    pendingEditorSync = false
    pendingPreviewSync = false
  })
  
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
    const { start: clearActivePanelAfterScroll } = useTimeoutFn(
      () => { activePanel = null },
      800,
      { immediate: true }
    )
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
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopScrollEndTimer()
    pendingEditorSync = false
    pendingPreviewSync = false
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
    ...(import.meta.dev ? { performanceMetrics: readonly(performanceMetrics) } : {})
  }
}
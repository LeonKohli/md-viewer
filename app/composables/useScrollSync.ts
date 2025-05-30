import { ref, computed, watch, nextTick } from 'vue'
import { useThrottleFn, useEventListener, useDebounceFn } from '@vueuse/core'

export function useScrollSync() {
  // Scroll sync state
  const isEnabled = ref(true)
  const isSyncing = ref(false)
  
  // Element refs - these will hold the actual DOM elements
  const editorElement = ref<HTMLTextAreaElement | null>(null)
  const previewElement = ref<HTMLElement | null>(null)
  
  // Scroll position memory
  const lastScrollPercentage = ref(0)
  const lastScrollSource = ref<'editor' | 'preview' | null>(null)
  
  // Flag to prevent feedback loops
  let syncingFrom: 'editor' | 'preview' | null = null
  
  // Calculate scroll percentage
  const getScrollPercentage = (element: HTMLElement): number => {
    const { scrollTop, scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return 0
    return (scrollTop / maxScroll) * 100
  }
  
  // Set scroll position by percentage with optional smooth scrolling
  const setScrollPercentage = (element: HTMLElement, percentage: number, smooth: boolean = false) => {
    const { scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    
    if (maxScroll <= 0) return
    
    const targetScrollTop = (percentage / 100) * maxScroll
    
    if (smooth && 'scrollTo' in element) {
      element.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    } else {
      element.scrollTop = targetScrollTop
    }
  }
  
  // Sync scroll from editor to preview
  const syncFromEditor = useThrottleFn(() => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    if (syncingFrom === 'preview') return
    
    syncingFrom = 'editor'
    isSyncing.value = true
    lastScrollSource.value = 'editor'
    
    const percentage = getScrollPercentage(editorElement.value)
    lastScrollPercentage.value = percentage
    
    setScrollPercentage(previewElement.value, percentage)
    
    // Reset sync flag
    requestAnimationFrame(() => {
      syncingFrom = null
      isSyncing.value = false
    })
  }, 16) // ~60fps
  
  // Sync scroll from preview to editor
  const syncFromPreview = useThrottleFn(() => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    if (syncingFrom === 'editor') return
    
    syncingFrom = 'preview'
    isSyncing.value = true
    lastScrollSource.value = 'preview'
    
    const percentage = getScrollPercentage(previewElement.value)
    lastScrollPercentage.value = percentage
    
    setScrollPercentage(editorElement.value, percentage)
    
    // Reset sync flag
    requestAnimationFrame(() => {
      syncingFrom = null
      isSyncing.value = false
    })
  }, 16) // ~60fps
  
  // Restore scroll position after content changes
  const restoreScrollPosition = useDebounceFn(() => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    
    // Wait for content to render
    nextTick(() => {
      // Restore based on last scroll source
      if (lastScrollSource.value === 'editor' && editorElement.value) {
        // If editor was last scrolled, maintain its position
        const currentPercentage = getScrollPercentage(editorElement.value)
        if (Math.abs(currentPercentage - lastScrollPercentage.value) > 5) {
          // Position changed significantly, restore it
          setScrollPercentage(editorElement.value, lastScrollPercentage.value)
          setScrollPercentage(previewElement.value!, lastScrollPercentage.value)
        }
      } else if (lastScrollSource.value === 'preview' && previewElement.value) {
        // If preview was last scrolled, sync from preview
        const currentPercentage = getScrollPercentage(previewElement.value)
        if (Math.abs(currentPercentage - lastScrollPercentage.value) > 5) {
          // Position changed significantly, restore it
          setScrollPercentage(previewElement.value, lastScrollPercentage.value)
          setScrollPercentage(editorElement.value!, lastScrollPercentage.value)
        }
      }
    })
  }, 100)
  
  // Set up scroll listeners
  const setupListeners = () => {
    if (editorElement.value) {
      useEventListener(editorElement.value, 'scroll', syncFromEditor, { passive: true })
    }
    
    if (previewElement.value) {
      useEventListener(previewElement.value, 'scroll', syncFromPreview, { passive: true })
    }
  }
  
  // Watch for element changes and set up listeners
  watch([editorElement, previewElement], () => {
    nextTick(() => {
      setupListeners()
      
      // If we already have a scroll position, restore it
      if (lastScrollPercentage.value > 0 && isEnabled.value) {
        restoreScrollPosition()
      }
    })
  }, { immediate: true })
  
  // Set the actual DOM elements
  const setEditorElement = (element: HTMLTextAreaElement | null) => {
    editorElement.value = element
  }
  
  const setPreviewElement = (element: HTMLElement | null) => {
    previewElement.value = element
  }
  
  // Toggle sync on/off
  const toggleSync = () => {
    isEnabled.value = !isEnabled.value
    
    // If re-enabling, sync current position
    if (isEnabled.value && lastScrollSource.value) {
      nextTick(() => {
        if (lastScrollSource.value === 'editor' && editorElement.value && previewElement.value) {
          const percentage = getScrollPercentage(editorElement.value)
          setScrollPercentage(previewElement.value, percentage, true)
        } else if (lastScrollSource.value === 'preview' && previewElement.value && editorElement.value) {
          const percentage = getScrollPercentage(previewElement.value)
          setScrollPercentage(editorElement.value, percentage, true)
        }
      })
    }
  }
  
  // Manual sync to top
  const syncToTop = () => {
    if (editorElement.value) editorElement.value.scrollTop = 0
    if (previewElement.value) previewElement.value.scrollTop = 0
    lastScrollPercentage.value = 0
  }
  
  // Manual sync to bottom
  const syncToBottom = () => {
    if (editorElement.value) {
      editorElement.value.scrollTop = editorElement.value.scrollHeight
    }
    if (previewElement.value) {
      previewElement.value.scrollTop = previewElement.value.scrollHeight
    }
    lastScrollPercentage.value = 100
  }
  
  // Computed properties for UI
  const scrollSyncStatus = computed(() => {
    if (!isEnabled.value) return 'disabled'
    if (isSyncing.value) return 'syncing'
    return 'enabled'
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
    // State
    syncEnabled: isEnabled,
    isSyncing,
    scrollSyncStatus,
    scrollSyncIcon,
    scrollSyncTooltip,
    lastScrollPercentage,
    
    // Methods
    setEditorElement,
    setPreviewElement,
    toggleSync,
    syncToTop,
    syncToBottom,
    restoreScrollPosition,
  }
}
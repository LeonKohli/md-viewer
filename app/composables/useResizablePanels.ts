import { useDraggable, useWindowSize } from '@vueuse/core'

// SplitMode is auto-imported from shared/types/editor.ts

export function useResizablePanels() {
  // Split mode
  const splitMode = ref<SplitMode>('horizontal')
  
  // Window size for better responsive handling
  const { width: windowWidth } = useWindowSize()
  
  // Panel sizes for each mode
  const horizontalSize = ref(50)
  const verticalSize = ref(50)
  
  // Current size based on mode
  const editorSize = computed({
    get: () => splitMode.value === 'horizontal' ? horizontalSize.value : verticalSize.value,
    set: (value) => {
      if (splitMode.value === 'horizontal') {
        horizontalSize.value = value
      } else {
        verticalSize.value = value
      }
    }
  })
  const previewSize = computed(() => 100 - editorSize.value)
  
  // Create a draggable handle ref
  const dragHandleRef = ref<HTMLElement>()
  
  // Check if we're on mobile using VueUse
  const isMobile = computed(() => windowWidth.value < 768) // md breakpoint
  
  // Edge detection
  const isAtEdge = computed(() => editorSize.value <= 5 || editorSize.value >= 95)
  
  // Use VueUse's draggable composable - disable on mobile
  const { x, y, isDragging } = useDraggable(dragHandleRef, {
    preventDefault: true,
    disabled: isMobile,
    onMove: (position) => {
      if (!dragHandleRef.value || isMobile.value) return
      
      const container = dragHandleRef.value.parentElement
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      
      let newSize: number
      
      if (splitMode.value === 'horizontal') {
        // Calculate width percentage for horizontal split
        newSize = ((position.x - containerRect.left) / containerRect.width) * 100
      } else {
        // Calculate height percentage for vertical split
        newSize = ((position.y - containerRect.top) / containerRect.height) * 100
      }
      
      // Apply constraints and snapping
      const targetSize = newSize < 5 ? 0 
        : newSize > 95 ? 100
        : (newSize > 48 && newSize < 52) ? 50 // Snap to center
        : Math.min(95, Math.max(5, newSize))
      
      // Update the appropriate size based on mode
      if (splitMode.value === 'horizontal') {
        horizontalSize.value = targetSize
      } else {
        verticalSize.value = targetSize
      }
    }
  })
  
  // Watch for dragging state to update cursor - only on desktop
  watch([isDragging, isMobile, splitMode], ([dragging, mobile, mode]) => {
    if (!import.meta.client || mobile) return

    if (dragging) {
      document.body.style.cursor = mode === 'horizontal' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  })
  
  // Reset to center
  const resetToCenter = () => {
    if (splitMode.value === 'horizontal') {
      horizontalSize.value = 50
    } else {
      verticalSize.value = 50
    }
  }
  
  // Toggle split mode
  const toggleSplitMode = () => {
    if (isMobile.value) return // Disable on mobile
    
    splitMode.value = splitMode.value === 'horizontal' ? 'vertical' : 'horizontal'
    // Reset to center when changing modes
    resetToCenter()
  }
  
  // Reset to horizontal on mobile
  watch(isMobile, (mobile) => {
    if (mobile && splitMode.value === 'vertical') {
      splitMode.value = 'horizontal'
    }
  })
  
  // Clean up on unmount
  onUnmounted(() => {
    if (!import.meta.client) return
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })
  
  return {
    // Split mode
    splitMode: readonly(splitMode),
    toggleSplitMode,
    
    // Sizes - expose computed for current mode
    editorSize,
    previewSize,
    
    // Drag state
    isAtEdge: readonly(isAtEdge),
    dragHandleRef,
    isDragging: readonly(isDragging),
    resetToCenter,
    
    // Responsive
    isMobile: readonly(isMobile)
  }
}
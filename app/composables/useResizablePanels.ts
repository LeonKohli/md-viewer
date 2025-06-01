import { useDraggable } from '@vueuse/core'

export function useResizablePanels() {
  // Panel widths
  const editorWidth = ref(50)
  const previewWidth = computed(() => 100 - editorWidth.value)
  
  // Create a draggable handle ref
  const dragHandleRef = ref<HTMLElement>()
  
  // Edge detection
  const isAtEdge = computed(() => editorWidth.value <= 5 || editorWidth.value >= 95)
  
  // Use VueUse's draggable composable
  const { x, isDragging } = useDraggable(dragHandleRef, {
    preventDefault: true,
    onMove: (position) => {
      if (!dragHandleRef.value) return
      
      const container = dragHandleRef.value.parentElement
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const newWidth = ((position.x - containerRect.left) / containerRect.width) * 100
      
      // Apply constraints and snapping
      if (newWidth < 5) {
        editorWidth.value = 0
      } else if (newWidth > 95) {
        editorWidth.value = 100
      } else if (newWidth > 48 && newWidth < 52) {
        editorWidth.value = 50 // Snap to center
      } else {
        editorWidth.value = Math.min(95, Math.max(5, newWidth))
      }
    }
  })
  
  // Watch for dragging state to update cursor
  watch(isDragging, (dragging) => {
    if (dragging) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  })
  
  // Reset to center
  const resetToCenter = () => {
    editorWidth.value = 50
  }
  
  // Clean up on unmount
  onUnmounted(() => {
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  })
  
  return {
    editorWidth: readonly(editorWidth),
    previewWidth: readonly(previewWidth),
    isAtEdge: readonly(isAtEdge),
    dragHandleRef,
    isDragging: readonly(isDragging),
    resetToCenter
  }
}
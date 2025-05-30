import type { ResizablePanelsOptions } from '~/types'
import { DEFAULT_CONFIG } from '~/constants'

export function useResizablePanels(options: ResizablePanelsOptions = {}) {
  const {
    initialWidth = DEFAULT_CONFIG.INITIAL_PANEL_WIDTH,
    snapPoints = DEFAULT_CONFIG.SNAP_POINTS,
    snapThreshold = DEFAULT_CONFIG.SNAP_THRESHOLD,
    minEdgeWidth = DEFAULT_CONFIG.MIN_EDGE_WIDTH,
    maxEdgeWidth = DEFAULT_CONFIG.MAX_EDGE_WIDTH
  } = options

  const editorWidth = ref(initialWidth)
  const isResizing = ref(false)

  const resetToCenter = () => {
    editorWidth.value = DEFAULT_CONFIG.INITIAL_PANEL_WIDTH
  }

  const applySnapping = (width: number): number => {
    // Check snap points
    for (const point of snapPoints) {
      if (Math.abs(width - point) < snapThreshold) {
        return point
      }
    }

    // Snap to edges
    if (width < minEdgeWidth) return 0
    if (width > maxEdgeWidth) return 100

    return Math.max(0, Math.min(100, width))
  }

  const startResize = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    isResizing.value = true

    const target = e.currentTarget as HTMLElement
    const container = target?.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isResizing.value) return

      const clientX = 'touches' in moveEvent 
        ? moveEvent.touches[0]?.clientX 
        : moveEvent.clientX
      
      if (clientX === undefined) return

      const rawWidth = ((clientX - containerRect.left) / containerRect.width) * 100
      editorWidth.value = applySnapping(rawWidth)
    }

    const handleEnd = () => {
      isResizing.value = false
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)

      // Reset cursor and selection styles
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    // Add event listeners
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove)
    document.addEventListener('touchend', handleEnd)
  }

  const isAtEdge = computed(() => editorWidth.value <= 5 || editorWidth.value >= 95)
  const previewWidth = computed(() => 100 - editorWidth.value)

  return {
    editorWidth: readonly(editorWidth),
    previewWidth,
    isResizing: readonly(isResizing),
    isAtEdge,
    startResize,
    resetToCenter
  }
} 
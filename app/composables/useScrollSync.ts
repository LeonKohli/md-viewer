import { useEventListener, useTimeoutFn } from '@vueuse/core'

// Using type instead of interface per Nuxt 4 best practices
type ScrollMapEntry = {
  sourceLine: number      // Line number in source (1-indexed)
  editorOffset: number    // Pixel offset in editor
  previewOffset: number   // Pixel offset in preview
}

type ActivePanel = 'editor' | 'preview' | null

export function useScrollSync() {
  // Scroll sync state - typed refs per Nuxt 4 best practices
  const isEnabled = ref<boolean>(true)
  const toggleSync = (): void => {
    isEnabled.value = !isEnabled.value
  }

  // Element refs with explicit null union types
  const editorElement = ref<HTMLTextAreaElement | null>(null)
  const previewElement = ref<HTMLElement | null>(null)

  // Track which panel is actively being scrolled
  let activePanel: ActivePanel = null
  let isMouseDown = false

  // Track pending sync operations
  let pendingEditorSync = false
  let pendingPreviewSync = false

  // Scroll map for line-based synchronization
  let scrollMap: ScrollMapEntry[] = []
  let scrollMapValid = false

  // Performance monitoring in development - explicit type for ref
  const performanceMetrics = ref<{
    lastSyncDuration: number
    syncCount: number
    averageSyncDuration: number
    scrollMapSize: number
  }>({
    lastSyncDuration: 0,
    syncCount: 0,
    averageSyncDuration: 0,
    scrollMapSize: 0
  })

  // Build scroll map by scanning elements with data-source-line attributes
  // Maps source line numbers to pixel offsets in both editor and preview
  const buildScrollMap = (): void => {
    if (!editorElement.value || !previewElement.value) return

    const startTime = performance.now()
    const newMap: ScrollMapEntry[] = []

    // Get editor metrics for calculating line positions
    const editor = editorElement.value
    const editorStyle = window.getComputedStyle(editor as unknown as Element)
    const lineHeight = parseFloat(editorStyle.lineHeight) || 20
    const paddingTop = parseFloat(editorStyle.paddingTop) || 0

    // Find all elements with data-source-line in preview
    const previewContainer = previewElement.value
    const lineElements = previewContainer.querySelectorAll('[data-source-line]')

    // Add start point (line 0 = top of both panels)
    newMap.push({
      sourceLine: 0,
      editorOffset: 0,
      previewOffset: 0
    })

    lineElements.forEach((el) => {
      const lineAttr = el.getAttribute('data-source-line')
      if (!lineAttr) return

      const sourceLine = parseInt(lineAttr, 10)
      if (isNaN(sourceLine)) return

      // Calculate editor offset for this line
      // Line numbers are 1-indexed, so subtract 1 for 0-indexed calculation
      const editorOffset = paddingTop + (sourceLine - 1) * lineHeight

      // Get preview offset - use getBoundingClientRect for accuracy
      const rect = el.getBoundingClientRect()
      const containerRect = previewContainer.getBoundingClientRect()
      const previewOffset = rect.top - containerRect.top + previewContainer.scrollTop

      newMap.push({
        sourceLine,
        editorOffset,
        previewOffset
      })
    })

    // Add end point (maps to bottom of both panels)
    const editorMaxScroll = editor.scrollHeight - editor.clientHeight
    const previewMaxScroll = previewContainer.scrollHeight - previewContainer.clientHeight

    // Use a very large line number to represent "end of document"
    const lastLine = newMap.length > 0 ? newMap[newMap.length - 1]!.sourceLine + 1000 : 1000
    newMap.push({
      sourceLine: lastLine,
      editorOffset: editor.scrollHeight,
      previewOffset: previewContainer.scrollHeight
    })

    // Sort by editor offset to ensure proper interpolation
    newMap.sort((a, b) => a.editorOffset - b.editorOffset)

    scrollMap = newMap
    scrollMapValid = true

    if (import.meta.dev) {
      performanceMetrics.value.scrollMapSize = scrollMap.length
      const duration = performance.now() - startTime
      console.debug(`[ScrollSync] Built scroll map with ${scrollMap.length} entries in ${duration.toFixed(2)}ms`)
    }
  }

  // Invalidate scroll map when content changes
  const invalidateScrollMap = (): void => {
    scrollMapValid = false
  }

  // Interpolate between two known points
  const interpolate = (
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
  ): number => {
    if (fromHigh === fromLow) return toLow
    const ratio = (value - fromLow) / (fromHigh - fromLow)
    return toLow + ratio * (toHigh - toLow)
  }

  // Convert editor scroll position to preview scroll position
  const editorToPreviewOffset = (editorScrollTop: number): number => {
    if (scrollMap.length < 2) return editorScrollTop

    // Find surrounding entries for interpolation
    let lower = scrollMap[0]!
    let upper = scrollMap[scrollMap.length - 1]!

    for (let i = 0; i < scrollMap.length - 1; i++) {
      const current = scrollMap[i]!
      const next = scrollMap[i + 1]!

      if (editorScrollTop >= current.editorOffset && editorScrollTop <= next.editorOffset) {
        lower = current
        upper = next
        break
      }
    }

    return interpolate(
      editorScrollTop,
      lower.editorOffset,
      upper.editorOffset,
      lower.previewOffset,
      upper.previewOffset
    )
  }

  // Convert preview scroll position to editor scroll position
  const previewToEditorOffset = (previewScrollTop: number): number => {
    if (scrollMap.length < 2) return previewScrollTop

    // Find surrounding entries for interpolation
    let lower = scrollMap[0]!
    let upper = scrollMap[scrollMap.length - 1]!

    for (let i = 0; i < scrollMap.length - 1; i++) {
      const current = scrollMap[i]!
      const next = scrollMap[i + 1]!

      if (previewScrollTop >= current.previewOffset && previewScrollTop <= next.previewOffset) {
        lower = current
        upper = next
        break
      }
    }

    return interpolate(
      previewScrollTop,
      lower.previewOffset,
      upper.previewOffset,
      lower.editorOffset,
      upper.editorOffset
    )
  }

  // Handle scroll end detection
  const { start: startScrollEndTimer, stop: stopScrollEndTimer } = useTimeoutFn(
    () => {
      activePanel = null
      pendingEditorSync = false
      pendingPreviewSync = false
    },
    () => isMouseDown ? 300 : 150,
    { immediate: false }
  )

  const handleScrollEnd = () => {
    stopScrollEndTimer()
    startScrollEndTimer()
  }

  // Sync editor scroll to preview
  const syncEditorToPreview = () => {
    if (pendingEditorSync || !isEnabled.value) return

    pendingEditorSync = true
    requestAnimationFrame(() => {
      if (!editorElement.value || !previewElement.value) {
        pendingEditorSync = false
        return
      }

      const startTime = performance.now()

      // Rebuild scroll map if needed
      if (!scrollMapValid) {
        buildScrollMap()
      }

      const editorScrollTop = editorElement.value.scrollTop
      const targetPreviewTop = editorToPreviewOffset(editorScrollTop)

      // Only update if meaningful difference
      const currentPreviewTop = previewElement.value.scrollTop
      if (Math.abs(targetPreviewTop - currentPreviewTop) > 1) {
        previewElement.value.scrollTop = targetPreviewTop
      }

      if (import.meta.dev) {
        const duration = performance.now() - startTime
        performanceMetrics.value.lastSyncDuration = duration
        performanceMetrics.value.syncCount++
        performanceMetrics.value.averageSyncDuration =
          (performanceMetrics.value.averageSyncDuration * (performanceMetrics.value.syncCount - 1) + duration) /
          performanceMetrics.value.syncCount
      }

      pendingEditorSync = false
    })
  }

  // Sync preview scroll to editor
  const syncPreviewToEditor = () => {
    if (pendingPreviewSync || !isEnabled.value) return

    pendingPreviewSync = true
    requestAnimationFrame(() => {
      if (!editorElement.value || !previewElement.value) {
        pendingPreviewSync = false
        return
      }

      // Rebuild scroll map if needed
      if (!scrollMapValid) {
        buildScrollMap()
      }

      const previewScrollTop = previewElement.value.scrollTop
      const targetEditorTop = previewToEditorOffset(previewScrollTop)

      // Only update if meaningful difference
      const currentEditorTop = editorElement.value.scrollTop
      if (Math.abs(targetEditorTop - currentEditorTop) > 1) {
        editorElement.value.scrollTop = targetEditorTop
      }

      pendingPreviewSync = false
    })
  }

  // Handle editor scroll
  const handleEditorScroll = () => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    if (activePanel === 'preview') return

    activePanel = 'editor'
    handleScrollEnd()
    syncEditorToPreview()
  }

  // Handle preview scroll
  const handlePreviewScroll = () => {
    if (!isEnabled.value || !editorElement.value || !previewElement.value) return
    if (activePanel === 'editor') return

    activePanel = 'preview'
    handleScrollEnd()
    syncPreviewToEditor()
  }

  // Mouse event handlers
  const handleMouseDown = () => {
    isMouseDown = true
  }

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
    if (editorElement.value) {
      useEventListener(editorElement.value, 'scroll', handleEditorScroll, { passive: true })
      useEventListener(editorElement.value, 'mousedown', handleMouseDown)
    }

    if (previewElement.value) {
      useEventListener(previewElement.value, 'scroll', handlePreviewScroll, { passive: true })
      useEventListener(previewElement.value, 'mousedown', handleMouseDown)
    }

    if (import.meta.client) {
      useEventListener(document, 'mouseup', handleMouseUp)
    }
  }

  // Watch for element changes
  watch([editorElement, previewElement], () => {
    nextTick(() => {
      setupListeners()
      invalidateScrollMap()
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
      // Rebuild scroll map if needed
      if (!scrollMapValid) {
        buildScrollMap()
      }

      const targetPreviewTop = relativeTop - 20
      const targetEditorTop = previewToEditorOffset(targetPreviewTop)

      editorElement.value.scrollTo({
        top: targetEditorTop,
        behavior: 'smooth'
      })
    }

    const { start: clearActivePanelAfterScroll } = useTimeoutFn(
      () => { activePanel = null },
      800,
      { immediate: true }
    )
  }

  // Expose method to trigger scroll map rebuild (called when content changes)
  const refreshScrollMap = () => {
    invalidateScrollMap()
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
    scrollMap = []
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
    refreshScrollMap,
    ...(import.meta.dev ? { performanceMetrics: readonly(performanceMetrics) } : {})
  }
}

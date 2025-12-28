/**
 * Smart auto-save composable inspired by Google Docs
 * 
 * Features:
 * - Saves based on multiple triggers, not just time
 * - Adapts save frequency based on user behavior
 * - Saves on important events (blur, paste, undo/redo)
 * - Batches rapid changes intelligently
 * - Network-aware with retry logic
 */
import { 
  useTimeAgo, 
  useEventListener,
  useThrottleFn,
  useDocumentVisibility,
  useWindowFocus,
  useNetwork,
  usePageLeave,
  useIntervalFn,
  useTimeoutFn
} from '@vueuse/core'

const STORAGE_KEY = 'markdown-editor-content'
const STORAGE_META_KEY = 'markdown-editor-meta'

// Smart save delays
const SAVE_DELAYS = {
  IMMEDIATE: 0,
  TYPING_FAST: 500,
  TYPING_SLOW: 1500,
  IDLE: 3000,
  AFTER_BLUR: 100,
  SAVED_STATUS_DISPLAY: 2000,
  ERROR_STATUS_DISPLAY: 5000,
  RETRY_DELAY: 1000,
  THROTTLE_SAVE: 1000,
  PERIODIC_SAVE: 30000,
} as const

// Thresholds for smart saving
const THRESHOLDS = {
  SIGNIFICANT_CHANGE: 20,
  LARGE_PASTE: 100,
  TYPING_SPEED: 2000,
  RECOVERY_WINDOW_DAYS: 7,
} as const

// SaveMetadata, SaveStatus are auto-imported from shared/types/editor.ts

export const useAutoSave = () => {
  // Get the global markdown content state via composable
  const markdownContent = useMarkdownContent()
  
  // Save status and metadata
  const saveStatus = ref<SaveStatus>('idle')
  const saveError = ref<string | null>(null)
  const lastSaveTime = ref<Date | null>(null)
  const savedMetadata = ref<SaveMetadata | null>(null)
  
  // VueUse utilities
  const documentVisibility = useDocumentVisibility()
  const windowFocused = useWindowFocus()
  const network = useNetwork()
  const isPageLeaving = usePageLeave()
  
  // Smart save tracking
  const lastKeystrokeTime = ref<number>(Date.now())
  const unsavedChangeSize = ref<number>(0)
  const saveTimer = ref<NodeJS.Timeout | null>(null)
  const isTypingFast = ref(false)
  
  // Track save statistics
  const saveStats = ref({
    totalSaves: 0,
    failedSaves: 0,
    lastSaveSize: 0,
  })
  
  // Computed properties
  const hasUnsavedChanges = computed(() => {
    // If there's content but no saved metadata, we have unsaved changes
    if (markdownContent.value && !savedMetadata.value) return true
    // If there's no content, no unsaved changes
    if (!markdownContent.value) return false
    // Compare hashes if we have saved metadata
    if (savedMetadata.value) {
      const currentHash = generateHash(markdownContent.value)
      return currentHash !== savedMetadata.value.hash
    }
    return false
  })
  
  const lastSaveTimeAgo = computed(() => {
    if (!lastSaveTime.value) return null
    return useTimeAgo(lastSaveTime.value)
  })
  
  // Generate simple hash for content comparison
  const generateHash = (content: string): string => {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
  
  // Calculate word count
  const getWordCount = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }
  
  // Load saved content and metadata
  const loadSavedContent = (): { content: string | null; metadata: SaveMetadata | null } => {
    if (!import.meta.client) return { content: null, metadata: null }
    
    try {
      const content = localStorage.getItem(STORAGE_KEY)
      const metaString = localStorage.getItem(STORAGE_META_KEY)
      const metadata = metaString ? JSON.parse(metaString) : null
      
      if (metadata) {
        savedMetadata.value = metadata
        lastSaveTime.value = new Date(metadata.timestamp)
        if (metadata.saveCount) {
          saveStats.value.totalSaves = metadata.saveCount
        }
      }
      
      return { content, metadata }
    } catch (e) {
      console.warn('Failed to load saved content:', e)
      return { content: null, metadata: null }
    }
  }
  
  // Core save function with retry logic
  const performSave = async (content: string, isRetry = false): Promise<boolean> => {
    if (!import.meta.client) return false
    
    // Check network status before saving
    if (!network.isOnline.value) {
      saveStatus.value = 'error'
      saveError.value = 'Offline'
      return false
    }
    
    saveStatus.value = 'saving'
    saveError.value = null
    
    try {
      if (content) {
        const metadata: SaveMetadata = {
          timestamp: Date.now(),
          characterCount: content.length,
          hash: generateHash(content),
          wordCount: getWordCount(content),
          saveCount: saveStats.value.totalSaves + 1,
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, content)
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(metadata))
        
        savedMetadata.value = metadata
        lastSaveTime.value = new Date(metadata.timestamp)
        saveStats.value.totalSaves++
        saveStats.value.lastSaveSize = content.length
        unsavedChangeSize.value = 0
      } else {
        // Clear storage if content is empty
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_META_KEY)
        savedMetadata.value = null
        lastSaveTime.value = null
      }
      
      saveStatus.value = 'saved'
      
      const { start: clearSavedStatus } = useTimeoutFn(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, SAVE_DELAYS.SAVED_STATUS_DISPLAY, { immediate: true })
      
      return true
    } catch (e) {
      saveStatus.value = 'error'
      saveStats.value.failedSaves++
      
      if (e instanceof Error) {
        if (e.name === 'QuotaExceededError') {
          saveError.value = 'Storage full'
        } else {
          saveError.value = 'Save failed'
        }
      } else {
        saveError.value = 'Save failed'
      }
      
      // Retry once after a delay
      if (!isRetry) {
        const { start: retryLater } = useTimeoutFn(
          () => performSave(content, true),
          SAVE_DELAYS.RETRY_DELAY,
          { immediate: true }
        )
      }
      
      const { start: clearErrorStatus } = useTimeoutFn(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle'
        }
      }, SAVE_DELAYS.ERROR_STATUS_DISPLAY, { immediate: true })
      
      return false
    }
  }
  
  // Smart save scheduling
  const scheduleSave = (delay: number = SAVE_DELAYS.IDLE) => {
    // Clear existing timer
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
    }
    
    // Don't schedule if already saving
    if (saveStatus.value === 'saving') return
    
    // Schedule new save
    saveTimer.value = setTimeout(() => {
      if (hasUnsavedChanges.value) {
        performSave(markdownContent.value)
      }
    }, delay)
  }
  
  // Immediate save for critical actions - throttled to prevent spam
  const saveNow = useThrottleFn(async () => {
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
    }
    
    if (markdownContent.value && hasUnsavedChanges.value) {
      await performSave(markdownContent.value)
    }
  }, SAVE_DELAYS.THROTTLE_SAVE)
  
  // Handle content changes with smart detection
  const handleContentChange = (newContent: string, oldContent: string) => {
    const changeSize = Math.abs(newContent.length - oldContent.length)
    unsavedChangeSize.value += changeSize
    
    // Detect paste operation (large change)
    if (changeSize > THRESHOLDS.LARGE_PASTE) {
      scheduleSave(SAVE_DELAYS.IMMEDIATE)
      return
    }
    
    // Detect typing speed
    const now = Date.now()
    const timeSinceLastKeystroke = now - lastKeystrokeTime.value
    lastKeystrokeTime.value = now
    
    isTypingFast.value = timeSinceLastKeystroke < THRESHOLDS.TYPING_SPEED
    
    // Determine save delay based on behavior
    let delay: number = SAVE_DELAYS.IDLE
    
    if (isTypingFast.value) {
      // User is typing fast - use shorter delay
      delay = SAVE_DELAYS.TYPING_FAST
    } else if (unsavedChangeSize.value > THRESHOLDS.SIGNIFICANT_CHANGE) {
      // Significant changes accumulated - save sooner
      delay = SAVE_DELAYS.TYPING_SLOW
    }
    
    scheduleSave(delay)
  }
  
  // Clear saved content and metadata
  const clearSavedContent = () => {
    if (!import.meta.client) return
    
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_META_KEY)
      savedMetadata.value = null
      lastSaveTime.value = null
      saveStatus.value = 'idle'
      unsavedChangeSize.value = 0
    } catch (e) {
      // Silent failure on clear
    }
  }
  
  // Check if there's recoverable content
  const getRecoverableContent = (): { content: string; metadata: SaveMetadata } | null => {
    if (!import.meta.client) return null
    
    try {
      const saved = loadSavedContent()
      
      // Only suggest recovery if:
      // 1. There's saved content
      // 2. Current editor is empty (most common case)
      // 3. Saved content is from within last 7 days (more generous)
      if (saved.content && saved.metadata) {
        const recoveryWindowMs = THRESHOLDS.RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000
        const isRecent = Date.now() - saved.metadata.timestamp < recoveryWindowMs
        const currentIsEmpty = !markdownContent.value || markdownContent.value.trim().length === 0
        
        // Show prompt if we have recent saved content and current editor is empty
        if (isRecent && currentIsEmpty && saved.content.trim().length > 0) {
          return { content: saved.content, metadata: saved.metadata }
        }
      }
    } catch (e) {
      // Silent failure
    }
    
    return null
  }
  
  // Set up smart auto-save with multiple triggers
  const setupAutoSave = () => {
    if (!import.meta.client) return
    
    // Initialize saved metadata on setup
    const saved = loadSavedContent()
    if (saved.metadata) {
      savedMetadata.value = saved.metadata
      lastSaveTime.value = new Date(saved.metadata.timestamp)
    }
    
    // Watch content changes
    watch(markdownContent, (newContent, oldContent) => {
      // Only handle changes, not initial undefined -> value
      if (oldContent !== undefined && newContent !== oldContent) {
        handleContentChange(newContent, oldContent)
      }
    })
    
    // Watch window focus changes
    watch(windowFocused, (focused) => {
      if (!focused && hasUnsavedChanges.value) {
        // Window lost focus - save quickly
        scheduleSave(SAVE_DELAYS.AFTER_BLUR)
      }
    })
    
    // Watch document visibility
    watch(documentVisibility, (visibility) => {
      if (visibility === 'hidden' && hasUnsavedChanges.value) {
        // Tab became hidden - save immediately
        saveNow()
      }
    })
    
    // Save when page is about to be left
    watch(isPageLeaving, (leaving) => {
      if (leaving && hasUnsavedChanges.value) {
        // Try to save immediately
        performSave(markdownContent.value)
      }
    })
    
    // Save before page unload as fallback
    useEventListener(window, 'beforeunload', (e) => {
      if (hasUnsavedChanges.value) {
        // Try to save immediately
        performSave(markdownContent.value)
        
        // Show browser warning if changes might be lost
        e.preventDefault()
        e.returnValue = ''
      }
    })
    
    // Watch network status
    watch(() => network.isOnline.value, (online) => {
      if (online && hasUnsavedChanges.value && saveStatus.value === 'error') {
        // Back online - retry save
        saveNow()
      }
    })
    
    // Periodic save as fallback using VueUse
    const { pause: pausePeriodicSave, resume: resumePeriodicSave } = useIntervalFn(() => {
      if (hasUnsavedChanges.value && saveStatus.value === 'idle') {
        performSave(markdownContent.value)
      }
    }, SAVE_DELAYS.PERIODIC_SAVE)
    
    // Pause periodic saves when offline
    watch(() => network.isOnline.value, (online) => {
      if (online) {
        resumePeriodicSave()
      } else {
        pausePeriodicSave()
      }
    })
  }
  
  return {
    // State
    saveStatus: readonly(saveStatus),
    saveError: readonly(saveError),
    lastSaveTime: readonly(lastSaveTime),
    lastSaveTimeAgo,
    hasUnsavedChanges,
    saveStats: readonly(saveStats),
    
    // Methods
    loadSavedContent,
    clearSavedContent,
    getRecoverableContent,
    setupAutoSave,
    saveNow
  }
}
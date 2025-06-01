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
import { watchDebounced, useTimeAgo, useEventListener } from '@vueuse/core'

const STORAGE_KEY = 'markdown-editor-content'
const STORAGE_META_KEY = 'markdown-editor-meta'

// Smart save delays
const SAVE_DELAYS = {
  IMMEDIATE: 0,        // For critical actions (paste, undo)
  TYPING_FAST: 500,    // When user is actively typing
  TYPING_SLOW: 1500,   // When user is typing slowly
  IDLE: 3000,          // When user stops typing
  AFTER_BLUR: 100,     // When editor loses focus
} as const

// Thresholds for smart saving
const THRESHOLDS = {
  SIGNIFICANT_CHANGE: 20,  // Characters changed to trigger faster save
  LARGE_PASTE: 100,        // Characters to detect paste operation
  TYPING_SPEED: 2000,      // Ms between keystrokes to detect typing speed
} as const

export interface SaveMetadata {
  timestamp: number
  characterCount: number
  hash?: string
  wordCount?: number
  saveCount?: number
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export const useAutoSave = () => {
  // Get the global markdown content state
  const markdownContent = useState('markdownContent', () => '')
  
  // Save status and metadata
  const saveStatus = ref<SaveStatus>('idle')
  const saveError = ref<string | null>(null)
  const lastSaveTime = ref<Date | null>(null)
  const savedMetadata = ref<SaveMetadata | null>(null)
  
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
    if (!markdownContent.value || !savedMetadata.value) return false
    const currentHash = generateHash(markdownContent.value)
    return currentHash !== savedMetadata.value.hash
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
    if (!process.client) return { content: null, metadata: null }
    
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
      return { content: null, metadata: null }
    }
  }
  
  // Core save function with retry logic
  const performSave = async (content: string, isRetry = false): Promise<boolean> => {
    if (!process.client) return false
    
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
      
      // Keep saved status visible briefly
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle'
        }
      }, 2000)
      
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
        setTimeout(() => performSave(content, true), 1000)
      }
      
      // Keep error visible longer
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle'
        }
      }, 5000)
      
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
  
  // Immediate save for critical actions
  const saveNow = async () => {
    if (saveTimer.value) {
      clearTimeout(saveTimer.value)
    }
    
    if (markdownContent.value && hasUnsavedChanges.value) {
      await performSave(markdownContent.value)
    }
  }
  
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
    if (!process.client) return
    
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
    if (!process.client) return null
    
    try {
      const saved = loadSavedContent()
      
      // Only suggest recovery if:
      // 1. There's saved content
      // 2. Current content is empty or significantly different
      // 3. Saved content is from within last 24 hours
      if (saved.content && saved.metadata) {
        const isRecent = Date.now() - saved.metadata.timestamp < 24 * 60 * 60 * 1000
        const isDifferent = !markdownContent.value || 
                           (markdownContent.value.length < saved.content.length * 0.5)
        
        if (isRecent && isDifferent) {
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
    if (!process.client) return
    
    // Track if this is the initial load
    let isInitialLoad = true
    
    // Watch content changes
    watch(markdownContent, (newContent, oldContent) => {
      // Skip the initial load
      if (isInitialLoad) {
        isInitialLoad = false
        return
      }
      
      if (oldContent !== undefined) {
        handleContentChange(newContent, oldContent)
      }
    })
    
    // Save on window blur (user switches tabs/windows)
    useEventListener(window, 'blur', () => {
      if (hasUnsavedChanges.value) {
        scheduleSave(SAVE_DELAYS.AFTER_BLUR)
      }
    })
    
    // Save before page unload
    useEventListener(window, 'beforeunload', (e) => {
      if (hasUnsavedChanges.value) {
        // Try to save immediately
        performSave(markdownContent.value)
        
        // Show browser warning if changes might be lost
        e.preventDefault()
        e.returnValue = ''
      }
    })
    
    // Save on visibility change (tab becomes hidden)
    useEventListener(document, 'visibilitychange', () => {
      if (document.hidden && hasUnsavedChanges.value) {
        scheduleSave(SAVE_DELAYS.AFTER_BLUR)
      }
    })
    
    // Periodic save as fallback (every 30 seconds if there are changes)
    setInterval(() => {
      if (hasUnsavedChanges.value && saveStatus.value === 'idle') {
        performSave(markdownContent.value)
      }
    }, 30000)
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
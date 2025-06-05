import type { MarkdownStats, CursorPosition } from '~/types'
import { DEFAULT_CONFIG } from '~/constants'
import { watchDebounced } from '@vueuse/core'
import { useVimMode } from '~/composables/useVimMode'

interface TaskItem {
  line: number
  checked: boolean
}

export function useMarkdownEditor() {
  const { $md } = useNuxtApp()
  
  // Global state
  const globalMarkdownContent = useState('markdownContent', () => '')
  
  // Local reactive state
  const markdownInput = ref('')
  const renderedHtml = ref('')
  const textareaRef = ref<{ textareaElement?: HTMLTextAreaElement }>()
  const taskItems = ref<TaskItem[]>([])
  
  // Computed ref to the actual textarea element
  const textareaElement = computed(() => textareaRef.value?.textareaElement)
  
  // Set up auto-save
  const { 
    setupAutoSave, 
    getRecoverableContent,
    saveStatus,
    saveError,
    lastSaveTimeAgo,
    hasUnsavedChanges,
    saveNow,
    saveStats
  } = useAutoSave()
  
  // Recovery state
  const showRecoveryPrompt = ref(false)
  const recoverableContent = ref<{ content: string; metadata: any } | null>(null)
  
  // Check for recoverable content on mount
  onMounted(() => {
    // Only check for recoverable content, don't auto-load
    if (!globalMarkdownContent.value) {
      const recoverable = getRecoverableContent()
      if (recoverable) {
        recoverableContent.value = recoverable
        showRecoveryPrompt.value = true
      }
    }
    
    setupAutoSave()
  })
  
  // Recovery actions
  const recoverContent = () => {
    if (recoverableContent.value) {
      markdownInput.value = recoverableContent.value.content
      showRecoveryPrompt.value = false
      recoverableContent.value = null
    }
  }
  
  const discardRecovery = () => {
    showRecoveryPrompt.value = false
    recoverableContent.value = null
    const { clearSavedContent } = useAutoSave()
    clearSavedContent()
  }
  
  // Editor preferences
  const wordWrap = ref(true)
  const showPreview = ref(false)
  
  // Cursor tracking
  const cursorPosition = ref<CursorPosition>({ line: 1, column: 1 })
  
  // Selection tracking
  const selectedText = ref({ start: 0, end: 0 })
  
  
  // Computed stats
  const stats = computed<MarkdownStats>(() => {
    const text = markdownInput.value.trim()
    const words = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0
    const characters = markdownInput.value.length
    const charactersNoSpaces = markdownInput.value.replace(/\s/g, '').length
    const lines = markdownInput.value.split('\n').length
    const readingTime = Math.ceil(words / DEFAULT_CONFIG.AVERAGE_READING_SPEED)
    
    // Get selected text stats
    let selectedTextStats
    if (selectedText.value.start !== selectedText.value.end && textareaElement.value) {
      const selection = markdownInput.value.substring(selectedText.value.start, selectedText.value.end)
      const selectedWords = selection.trim() ? selection.trim().split(/\s+/).filter(word => word.length > 0).length : 0
      selectedTextStats = {
        words: selectedWords,
        characters: selection.length,
        percentage: Math.round((selectedWords / words) * 100) || 0
      }
    }
    
    return { 
      words, 
      characters, 
      charactersNoSpaces,
      lines, 
      readingTime,
      selectedText: selectedTextStats
    }
  })
  
  // Update cursor position and selection
  const updateCursorPosition = () => {
    const textarea = textareaRef.value?.textareaElement
    if (!textarea) return
    
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = markdownInput.value.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const lastLine = lines[lines.length - 1] ?? ''
    
    cursorPosition.value = {
      line: lines.length,
      column: lastLine.length + 1
    }
    
    // Update selection tracking
    selectedText.value = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    }
  }

  const parseTaskItems = (content: string): TaskItem[] => {
    const lines = content.split('\n')
    const tasks: TaskItem[] = []
    const regex = /^\s*(?:[-*+]|\d+[.)])\s+\[([ xX])\]\s+/
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || ''
      const match = line.match(regex)
      if (match && match[1]) {
        tasks.push({ line: i, checked: match[1].toLowerCase() === 'x' })
      }
    }
    return tasks
  }

  const addCheckboxIndexes = (html: string): string => {
    let idx = 0
    return html.replace(/class="task-list-item-checkbox"/g, () => {
      return `class="task-list-item-checkbox" data-task-index="${idx++}"`
    })
  }
  
  // Parse markdown using the Nuxt plugin
  const parseMarkdown = (content: string) => {
    if (content.trim()) {
      taskItems.value = parseTaskItems(content)
      let html = $md(content)
      html = addCheckboxIndexes(html)
      renderedHtml.value = html
    } else {
      renderedHtml.value = ''
      taskItems.value = []
    }
  }
  
  // Use watchDebounced for automatic parsing
  watchDebounced(
    markdownInput,
    (newValue) => parseMarkdown(newValue),
    { debounce: DEFAULT_CONFIG.DEBOUNCE_DELAY }
  )
  
  // Handle input changes
  const onInputChange = () => {
    updateCursorPosition()
  }
  
  // Toggle functions
  const toggleWordWrap = () => {
    wordWrap.value = !wordWrap.value
  }
  
  const togglePreview = () => {
    showPreview.value = !showPreview.value
  }

  const toggleTask = (index: number, checked: boolean) => {
    const lines = markdownInput.value.split('\n')
    const task = taskItems.value[index]
    if (!task) return

    const lineIndex = task.line
    const line = lines[lineIndex] || ''
    lines[lineIndex] = line.replace(/\[[ xX]\]/, `[${checked ? 'x' : ' '}]`)
    markdownInput.value = lines.join('\n')
  }
  
  // Event handlers for cursor tracking
  const handleTextareaInteraction = () => {
    updateCursorPosition()
  }
  
  // Sync with global state
  watchSyncEffect(() => {
    globalMarkdownContent.value = markdownInput.value
  })
  
  // Watch for external changes
  watch(globalMarkdownContent, (newValue) => {
    if (newValue !== markdownInput.value) {
      markdownInput.value = newValue
    }
  })
  
  // Setup textarea event listeners
  useEventListener(textareaElement, 'click', handleTextareaInteraction)
  useEventListener(textareaElement, 'keyup', handleTextareaInteraction)
  useEventListener(textareaElement, 'select', handleTextareaInteraction)
  useEventListener(textareaElement, 'mouseup', handleTextareaInteraction)

  // Enable Vim-style motions
  const { mode: vimMode } = useVimMode(textareaElement)
  
  // Initialize content
  if (globalMarkdownContent.value) {
    markdownInput.value = globalMarkdownContent.value
  }
  
  return {
    // State
    markdownInput,
    renderedHtml: readonly(renderedHtml),
    textareaRef,
    wordWrap: readonly(wordWrap),
    showPreview: readonly(showPreview),
    cursorPosition: readonly(cursorPosition),
    stats,
    
    // Auto-save state
    saveStatus,
    saveError,
    lastSaveTimeAgo,
    hasUnsavedChanges,
    showRecoveryPrompt,
    recoverableContent,
    
    // Actions
    onInputChange,
    toggleWordWrap,
    togglePreview,
    updateCursorPosition,

    vimMode,
    
    // Auto-save actions
    saveNow,
    recoverContent,
    discardRecovery,
    toggleTask,
    taskItems
  }
}

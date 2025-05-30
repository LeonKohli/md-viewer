import type { MarkdownStats, CursorPosition } from '~/types'
import { DEFAULT_CONFIG } from '~/constants'

export function useMarkdownEditor() {
  const { $md } = useNuxtApp()
  
  // Global state
  const globalMarkdownContent = useState('markdownContent', () => '')
  
  // Local reactive state
  const markdownInput = ref('')
  const renderedHtml = ref('')
  const textareaRef = ref<HTMLTextAreaElement>()
  
  // Editor preferences
  const wordWrap = ref(true)
  const showPreview = ref(false)
  
  // Cursor tracking
  const cursorPosition = ref<CursorPosition>({ line: 1, column: 1 })
  
  // Computed stats
  const stats = computed<MarkdownStats>(() => {
    const text = markdownInput.value.trim()
    const words = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0
    const characters = markdownInput.value.length
    const lines = markdownInput.value.split('\n').length
    
    return { words, characters, lines }
  })
  
  // Update cursor position
  const updateCursorPosition = () => {
    const textarea = textareaRef.value
    if (!textarea) return
    
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = markdownInput.value.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const lastLine = lines[lines.length - 1] ?? ''
    
    cursorPosition.value = {
      line: lines.length,
      column: lastLine.length + 1
    }
  }
  
  // Parse markdown using the Nuxt plugin
  const parseMarkdown = () => {
    if (markdownInput.value.trim()) {
      renderedHtml.value = $md(markdownInput.value)
    } else {
      renderedHtml.value = ''
    }
  }
  
  // Debounced parsing for performance
  const debouncedParse = useDebounceFn(parseMarkdown, DEFAULT_CONFIG.DEBOUNCE_DELAY)
  
  // Handle input changes
  const onInputChange = () => {
    debouncedParse()
    updateCursorPosition()
  }
  
  // Toggle functions
  const toggleWordWrap = () => {
    wordWrap.value = !wordWrap.value
  }
  
  const togglePreview = () => {
    showPreview.value = !showPreview.value
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
      parseMarkdown()
    }
  })
  
  // Setup textarea event listeners
  useEventListener(textareaRef, 'click', handleTextareaInteraction)
  useEventListener(textareaRef, 'keyup', handleTextareaInteraction)
  
  // Initialize content
  onMounted(() => {
    if (globalMarkdownContent.value) {
      markdownInput.value = globalMarkdownContent.value
      parseMarkdown()
    }
  })
  
  return {
    // State
    markdownInput,
    renderedHtml: readonly(renderedHtml),
    textareaRef,
    wordWrap: readonly(wordWrap),
    showPreview: readonly(showPreview),
    cursorPosition: readonly(cursorPosition),
    stats,
    
    // Actions
    onInputChange,
    toggleWordWrap,
    togglePreview,
    updateCursorPosition
  }
} 
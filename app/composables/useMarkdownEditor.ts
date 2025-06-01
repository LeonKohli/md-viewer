import type { MarkdownStats, CursorPosition } from '~/types'
import { DEFAULT_CONFIG } from '~/constants'
import { watchDebounced } from '@vueuse/core'

export function useMarkdownEditor() {
  const { $md } = useNuxtApp()
  
  // Global state
  const globalMarkdownContent = useState('markdownContent', () => '')
  
  // Local reactive state
  const markdownInput = ref('')
  const renderedHtml = ref('')
  const textareaRef = ref<{ textareaElement?: HTMLTextAreaElement }>()
  
  // Computed ref to the actual textarea element
  const textareaElement = computed(() => textareaRef.value?.textareaElement)
  
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
  }
  
  // Parse markdown using the Nuxt plugin
  const parseMarkdown = (content: string) => {
    if (content.trim()) {
      renderedHtml.value = $md(content)
    } else {
      renderedHtml.value = ''
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
    
    // Actions
    onInputChange,
    toggleWordWrap,
    togglePreview,
    updateCursorPosition
  }
} 
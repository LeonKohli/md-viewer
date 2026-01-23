import { useDropZone, useFileDialog } from '@vueuse/core'
import { FILE_IMPORT_CONFIG } from '~/constants'

export type FileDropMode = 'replace' | 'append' | 'insert'

export type FileDropOptions = {
  mode?: FileDropMode
  onSuccess?: (content: string, filename: string) => void
  onError?: (error: string) => void
}

export type FileDropResult = {
  content: string
  filename: string
  size: number
}

/**
 * Composable for handling file drag & drop and file dialog selection.
 * Uses VueUse's useDropZone for drag events and useFileDialog for click-to-select.
 *
 * Supports .md, .txt, and plain text files up to the configured max size.
 */
export function useFileDrop(
  dropZoneRef: Ref<HTMLElement | undefined>,
  options: FileDropOptions = {}
) {
  const { mode = 'replace', onSuccess, onError } = options

  // State
  const isProcessing = ref(false)
  const lastError = ref<string | null>(null)
  const lastFile = ref<FileDropResult | null>(null)

  /**
   * Validate a file before processing.
   * Checks file type and size against configuration limits.
   */
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > FILE_IMPORT_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = FILE_IMPORT_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
      return `File too large. Maximum size is ${maxSizeMB}MB`
    }

    // Check file type - allow markdown, text, and files without extension
    const extension = file.name.split('.').pop()?.toLowerCase() || ''
    const extensionWithDot = `.${extension}`
    const isValidExtension = FILE_IMPORT_CONFIG.ACCEPTED_EXTENSIONS.some(ext => ext === extensionWithDot)
    const isValidMime = FILE_IMPORT_CONFIG.ACCEPTED_MIME_TYPES.some(mime => {
      if (mime.endsWith('/*')) {
        return file.type.startsWith(mime.slice(0, -1))
      }
      return file.type === mime
    })

    // Allow files with valid extension OR valid MIME type OR no extension (often plain text)
    if (!isValidExtension && !isValidMime && extension !== '') {
      return `Invalid file type. Accepted: ${FILE_IMPORT_CONFIG.ACCEPTED_EXTENSIONS.join(', ')}`
    }

    return null
  }

  /**
   * Read file content using FileReader API.
   * Returns a promise that resolves with the file content as text.
   */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          resolve(content)
        } else {
          reject(new Error('Failed to read file as text'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  /**
   * Process a single file - validate and read its content.
   */
  const processFile = async (file: File): Promise<FileDropResult | null> => {
    lastError.value = null
    isProcessing.value = true

    try {
      // Validate
      const validationError = validateFile(file)
      if (validationError) {
        lastError.value = validationError
        onError?.(validationError)
        return null
      }

      // Read content
      const content = await readFileContent(file)

      const result: FileDropResult = {
        content,
        filename: file.name,
        size: file.size
      }

      lastFile.value = result
      onSuccess?.(content, file.name)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
      lastError.value = errorMessage
      onError?.(errorMessage)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Handle files dropped or selected.
   * Only processes the first file (single file import).
   */
  const handleFiles = async (files: File[] | FileList | null) => {
    if (!files || files.length === 0) return null

    // Take only the first file
    const file = files[0]
    if (!file) return null

    return processFile(file)
  }

  // Set up drop zone using VueUse
  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: (files) => {
      handleFiles(files)
    },
    // Accept text-based files
    dataTypes: (types) => {
      // Allow drop if any of the types could be a text file
      return types.some(type =>
        type.startsWith('text/') ||
        type === 'application/octet-stream' ||
        type === '' // Some browsers don't report type for certain files
      )
    }
  })

  // Set up file dialog for click-to-select
  const { open: openFileDialog, reset: resetFileDialog, onChange } = useFileDialog({
    accept: FILE_IMPORT_CONFIG.ACCEPTED_EXTENSIONS.join(','),
    multiple: false
  })

  // Handle file selection from dialog
  onChange((files) => {
    if (files) {
      handleFiles(files)
    }
  })

  /**
   * Open the file picker dialog.
   * Call this when user clicks an "Import" button.
   */
  const openFilePicker = () => {
    resetFileDialog()
    openFileDialog()
  }

  /**
   * Clear any error state.
   */
  const clearError = () => {
    lastError.value = null
  }

  return {
    // State
    isOverDropZone,
    isProcessing: readonly(isProcessing),
    lastError: readonly(lastError),
    lastFile: readonly(lastFile),

    // Actions
    openFilePicker,
    clearError,
    processFile,
    handleFiles
  }
}

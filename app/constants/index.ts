// Default configuration
export const DEFAULT_CONFIG = {
  DEBOUNCE_DELAY: 300,
  AVERAGE_READING_SPEED: 225 // words per minute
} as const

// File export settings
export const EXPORT_CONFIG = {
  MARKDOWN_EXTENSION: '.md',
  TEXT_EXTENSION: '.txt',
  MARKDOWN_MIME_TYPE: 'text/markdown',
  TEXT_MIME_TYPE: 'text/plain'
} as const

// Editor timing constants
export const EDITOR_TIMING = {
  UNDO_DISPLAY_MS: 10000,     // How long "Undo" button shows after clear
  CLEAR_STORAGE_DELAY_MS: 15000, // Delay before clearing storage after editor clear (longer than undo)
  UNDO_REDO_SAVE_DELAY_MS: 50, // Delay after undo/redo before saving
  DEBOUNCE_HEADING_MS: 100,   // Debounce for heading detection
} as const

export * from './examples'
export * from './showcase-content'
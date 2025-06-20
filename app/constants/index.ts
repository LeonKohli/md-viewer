// Default configuration
export const DEFAULT_CONFIG = {
  DEBOUNCE_DELAY: 300,
  INITIAL_PANEL_WIDTH: 50,
  SNAP_THRESHOLD: 3,
  MIN_EDGE_WIDTH: 8,
  MAX_EDGE_WIDTH: 92,
  SNAP_POINTS: [25, 33.33, 50, 66.67, 75],
  AVERAGE_READING_SPEED: 225 // words per minute
} as const

// File export settings
export const EXPORT_CONFIG = {
  MARKDOWN_EXTENSION: '.md',
  TEXT_EXTENSION: '.txt',
  MARKDOWN_MIME_TYPE: 'text/markdown',
  TEXT_MIME_TYPE: 'text/plain'
} as const

// Sharing configuration
export const SHARING_CONFIG = {
  MAX_URL_LENGTH: 2000,
  COMPRESSION_WARNING_SIZE: 50000, // 50KB uncompressed
  QR_CODE_SIZE: 300,
  SHARE_URL_PREFIX: '#share/',
  MAX_RECENT_SHARES: 10
} as const

export * from './examples'
import type { TocItem } from '~/composables/useTableOfContents'

// Markdown editor types
export interface MarkdownStats {
  words: number
  characters: number
  charactersNoSpaces: number
  lines: number
  readingTime: number // in minutes
  selectedText?: {
    words: number
    characters: number
    percentage: number
  }
}

export interface CursorPosition {
  line: number
  column: number
}

// Resizable panels types
export interface ResizablePanelsOptions {
  initialWidth?: number
  snapPoints?: number[]
  snapThreshold?: number
  minEdgeWidth?: number
  maxEdgeWidth?: number
}

// Component props and emits
export interface MarkdownNavbarProps {
  markdownContent?: string
  isFullscreen?: boolean
  renderedHtml?: string
  tocHeadings?: TocItem[]
  currentFilename?: string
  hasUnsavedChanges?: boolean
}

export interface MarkdownNavbarEmits {
  (e: 'update:markdownContent', value: string): void
  (e: 'update:isFullscreen', value: boolean): void
  (e: 'clearContent'): void
  (e: 'loadSample'): void
  (e: 'resetPanels'): void
  (e: 'toggleToc'): void
  (e: 'openShare'): void
  (e: 'openGists'): void
  (e: 'saveGist'): void
  (e: 'newGist'): void
  (e: 'loadGist', gist: any): void
}

// Export options
export interface ExportOptions {
  type: 'simple' | 'simple-no-toc' | 'advanced'
  colorMode?: 'light' | 'dark'
}
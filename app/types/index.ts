import type { TocItem } from '~/composables/useTableOfContents'

// Markdown editor types
export interface MarkdownStats {
  words: number
  characters: number
  lines: number
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
}

export interface MarkdownNavbarEmits {
  (e: 'update:markdownContent', value: string): void
  (e: 'update:isFullscreen', value: boolean): void
  (e: 'clearContent'): void
  (e: 'loadSample'): void
  (e: 'resetPanels'): void
  (e: 'toggleToc'): void
}

// Export options
export interface ExportOptions {
  type: 'simple' | 'simple-no-toc' | 'advanced'
  colorMode?: 'light' | 'dark'
}
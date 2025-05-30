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
}

export interface MarkdownNavbarEmits {
  (e: 'update:markdownContent', value: string): void
  (e: 'update:isFullscreen', value: boolean): void
  (e: 'clearContent'): void
  (e: 'loadSample'): void
  (e: 'resetPanels'): void
}

// App state types
export interface AppState {
  markdownContent: string
  isFullscreen: boolean
  resetPanelsEvent: number
} 
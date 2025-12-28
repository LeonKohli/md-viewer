// Editor-related types - auto-imported via shared/types/

export type MarkdownStats = {
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

export type CursorPosition = {
  line: number
  column: number
}

export type ResizablePanelsOptions = {
  initialWidth?: number
  snapPoints?: number[]
  snapThreshold?: number
  minEdgeWidth?: number
  maxEdgeWidth?: number
}

export type SplitMode = 'horizontal' | 'vertical'

export type ExportOptions = {
  type: 'simple' | 'simple-no-toc' | 'advanced'
  colorMode?: 'light' | 'dark'
}

export type CopyFormat = 'markdown' | 'plain' | 'html'

export type TocItem = {
  id: string
  text: string
  level: number
  children: TocItem[]
}

// Auto-save types
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type SaveMetadata = {
  timestamp: number
  characterCount: number
  hash?: string
  wordCount?: number
  saveCount?: number
}

// Content sharing types
export type ShareOptions = {
  title?: string
  readOnly?: boolean
  expiresAt?: Date
}

export type SharedDocument = {
  content: string
  title?: string
  createdAt: string
  readOnly: boolean
  version: number
}

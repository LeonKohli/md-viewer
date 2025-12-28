// UI-related types - auto-imported via shared/types/

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

export type ToastOptions = {
  type?: ToastType
  duration?: number
  action?: Toast['action']
}

// Component props types
export type MarkdownNavbarProps = {
  markdownContent?: string
  isFullscreen?: boolean
  renderedHtml?: string
  tocHeadings?: TocItem[]
  currentFilename?: string
  hasUnsavedChanges?: boolean
}

export type MarkdownNavbarEmits = {
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

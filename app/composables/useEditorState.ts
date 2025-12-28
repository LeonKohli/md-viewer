/**
 * Centralized editor state composables following Nuxt 4 best practices.
 * Each piece of shared state is wrapped in a composable function.
 *
 * @see https://nuxt.com/docs/4.x/getting-started/state-management
 */

// Core editor content
export const useMarkdownContent = () => useState<string>('markdownContent', () => '')

// UI visibility states
export const useShowToc = () => useState<boolean>('showToc', () => false)
export const useShowShareDialog = () => useState<boolean>('showShareDialog', () => false)
export const useShowGistManager = () => useState<boolean>('showGistManager', () => false)
export const useShowSaveGistDialog = () => useState<boolean>('showSaveGistDialog', () => false)
export const useIsFullscreen = () => useState<boolean>('isFullscreen', () => false)

// Gist-related state (UI)
export const useCurrentGistFilename = () => useState<string>('currentGistFilename', () => '')
export const useForceNewGist = () => useState<boolean>('forceNewGist', () => false)
export const useGistToLoad = () => useState<Gist | null>('gistToLoad', () => null)

// Gist API state (used by useGists composable)
export const useGistsList = () => useState<Gist[]>('gists', () => [])
export const useCurrentGist = () => useState<Gist | null>('currentGist', () => null)
export const useGistsLoading = () => useState<boolean>('gistsLoading', () => false)
export const useGistsError = () => useState<string | null>('gistsError', () => null)
export const useLastSyncedGistContent = () => useState<string>('lastSyncedGistContent', () => '')
export const useLastSyncedGistFilename = () => useState<string>('lastSyncedGistFilename', () => '')
export const useGistsPage = () => useState<number>('gistsPage', () => 1)
export const useGistsHasMore = () => useState<boolean>('gistsHasMore', () => true)

// Panel and layout state
export const useResetPanelsEvent = () => useState<number>('resetPanelsEvent', () => 0)

// Rendered content (synced from useMarkdownEditor)
export const useRenderedHtml = () => useState<string>('renderedHtml', () => '')
export const useTocHeadings = () => useState<TocItem[]>('tocHeadings', () => [])

// Save state (synced from useAutoSave computed)
export const useHasUnsavedChanges = () => useState<boolean>('hasUnsavedChanges', () => false)

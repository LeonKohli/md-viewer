// Gist types are auto-imported from shared/types/gist.ts

// Internal type guard for fetch errors
type FetchError = {
  data?: {
    statusMessage?: string
  }
}

const isFetchError = (error: unknown): error is FetchError => {
  return typeof error === 'object' && error !== null && 'data' in error
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isFetchError(err)) {
    return err.data?.statusMessage || fallback
  }
  if (err instanceof Error) {
    return err.message
  }
  return fallback
}

export const useGists = () => {
  // State via composables (Nuxt 4 pattern)
  const gists = useGistsList()
  const currentGist = useCurrentGist()
  const isLoading = useGistsLoading()
  const error = useGistsError()

  // Track last synced content to detect changes relative to gist
  const lastSyncedContent = useLastSyncedGistContent()
  const lastSyncedFilename = useLastSyncedGistFilename()

  // Pagination state
  const currentPage = useGistsPage()
  const hasMore = useGistsHasMore()
  const perPage = 30

  /**
   * Fetch user's gists with pagination
   */
  const fetchGists = async (options: GistListOptions = {}) => {
    const { page = 1, search = '' } = options
    
    try {
      isLoading.value = true
      error.value = null
      
      const response = await $fetch<Gist[]>('/api/gists', {
        query: {
          page,
          per_page: perPage
        }
      })
      
      if (page === 1) {
        gists.value = response
      } else {
        gists.value = [...gists.value, ...response]
      }
      
      currentPage.value = page
      hasMore.value = response.length === perPage
      
      // Client-side search filtering
      if (search) {
        const searchLower = search.toLowerCase()
        return gists.value.filter(gist => {
          const descriptionMatch = gist.description?.toLowerCase().includes(searchLower)
          const filenameMatch = Object.keys(gist.files).some(filename => 
            filename.toLowerCase().includes(searchLower)
          )
          return descriptionMatch || filenameMatch
        })
      }
      
      return gists.value
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to fetch gists')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get a specific gist by ID
   */
  const getGist = async (gistId: string): Promise<Gist | null> => {
    try {
      isLoading.value = true
      error.value = null
      
      const gist = await $fetch<Gist>(`/api/gists/${gistId}`)
      currentGist.value = gist
      
      // Update in local cache if exists
      const index = gists.value.findIndex(g => g.id === gistId)
      if (index !== -1) {
        gists.value[index] = gist
      }
      
      return gist
    } catch (err) {
      error.value = getErrorMessage(err, 'Failed to fetch gist')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new gist
   */
  const createGist = async (request: CreateGistRequest): Promise<GistOperationResult> => {
    try {
      isLoading.value = true
      error.value = null
      
      const gist = await $fetch<Gist>('/api/gists', {
        method: 'POST',
        body: request
      })
      
      // Add to beginning of list
      gists.value = [gist, ...gists.value]
      currentGist.value = gist
      
      return { success: true, gist }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to create gist')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing gist
   */
  const updateGist = async (gistId: string, request: UpdateGistRequest): Promise<GistOperationResult> => {
    try {
      isLoading.value = true
      error.value = null
      
      const gist = await $fetch<Gist>(`/api/gists/${gistId}`, {
        method: 'PATCH',
        body: request
      })
      
      // Update in local cache
      const index = gists.value.findIndex(g => g.id === gistId)
      if (index !== -1) {
        gists.value[index] = gist
      }
      
      if (currentGist.value?.id === gistId) {
        currentGist.value = gist
      }
      
      return { success: true, gist }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to update gist')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a gist
   */
  const deleteGist = async (gistId: string): Promise<GistOperationResult> => {
    try {
      isLoading.value = true
      error.value = null
      
      await $fetch(`/api/gists/${gistId}`, {
        method: 'DELETE'
      })
      
      // Remove from local cache
      gists.value = gists.value.filter(g => g.id !== gistId)
      
      if (currentGist.value?.id === gistId) {
        currentGist.value = null
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to delete gist')
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create or update a gist based on whether currentGist exists
   */
  const saveGist = async (
    filename: string,
    content: string,
    description?: string,
    isPublic: boolean = true
  ): Promise<GistOperationResult> => {
    if (currentGist.value) {
      // Update existing gist
      return updateGist(currentGist.value.id, {
        description,
        files: {
          [filename]: { content }
        }
      })
    } else {
      // Create new gist
      return createGist({
        description,
        public: isPublic,
        files: {
          [filename]: { content }
        }
      })
    }
  }

  /**
   * Load more gists (pagination)
   */
  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return
    
    await fetchGists({ page: currentPage.value + 1 })
  }

  /**
   * Reset gists state
   */
  const reset = () => {
    gists.value = []
    currentGist.value = null
    currentPage.value = 1
    hasMore.value = true
    error.value = null
  }

  /**
   * Get gist content from a specific file
   */
  const getGistContent = (gist: Gist, filename?: string): string => {
    const files = Object.entries(gist.files) as Array<[string, GistFile]>
    if (files.length === 0) return ''
    
    // If filename specified, try to get that file
    if (filename && gist.files[filename]) {
      const file = gist.files[filename] as GistFile
      return file?.content || ''
    }
    
    // Otherwise get the first markdown file or first file
    const mdFile = files.find(([name]) => name.endsWith('.md'))
    if (mdFile) {
      return mdFile[1].content || ''
    }
    
    return files[0]?.[1]?.content || ''
  }

  /**
   * Clear the current gist
   */
  const clearCurrentGist = () => {
    currentGist.value = null
    lastSyncedContent.value = ''
    lastSyncedFilename.value = ''
  }

  /**
   * Set the sync point when content is loaded or saved
   */
  const setSyncPoint = (content: string, filename: string) => {
    lastSyncedContent.value = content
    lastSyncedFilename.value = filename
  }

  /**
   * Check if there are changes relative to the gist
   */
  const hasGistChanges = (currentContent: string, currentFilename: string): boolean => {
    if (!currentGist.value) return false
    
    // Check if we're editing the same file
    if (currentFilename !== lastSyncedFilename.value) return true
    
    // Check if content has changed
    return currentContent !== lastSyncedContent.value
  }

  /**
   * Pull the latest content from GitHub
   */
  const pullFromGist = async (gistId: string, filename?: string): Promise<{ content: string; filename: string }> => {
    try {
      const gist = await getGist(gistId)
      if (!gist) throw new Error('Gist not found')
      
      const content = getGistContent(gist, filename)
      const actualFilename = filename || Object.keys(gist.files)[0] || 'untitled.md'
      
      // Update sync point
      setSyncPoint(content, actualFilename)
      
      return { content, filename: actualFilename }
    } catch (err) {
      console.error('Failed to pull from gist:', err)
      throw err
    }
  }

  return {
    // State
    gists: readonly(gists),
    currentGist: readonly(currentGist),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasMore: readonly(hasMore),
    
    // Methods
    fetchGists,
    getGist,
    createGist,
    updateGist,
    deleteGist,
    saveGist,
    loadMore,
    reset,
    getGistContent,
    clearCurrentGist,
    setSyncPoint,
    hasGistChanges,
    pullFromGist,
    lastSyncedContent: readonly(lastSyncedContent),
    lastSyncedFilename: readonly(lastSyncedFilename)
  }
}
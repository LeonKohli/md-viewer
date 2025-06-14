// Import Octokit types directly
import type { RestEndpointMethodTypes } from '@octokit/types'

// Use Octokit's built-in types for better type safety
export type Gist = RestEndpointMethodTypes['gists']['list']['response']['data'][0]
export type GistFile = Gist['files'][string]

// Request types - these are custom for our app
export interface CreateGistRequest {
  description?: string
  public?: boolean
  files: Record<string, { content: string }>
}

export interface UpdateGistRequest {
  description?: string
  files?: Record<string, { content?: string | null; filename?: string }>
}

// UI-specific types
export interface GistOperationResult {
  success: boolean
  gist?: Gist
  error?: string
}

// Sort options for gist list
export type GistSortOption = 'updated' | 'created' | 'name'
export type GistSortDirection = 'asc' | 'desc'

export interface GistListOptions {
  page?: number
  perPage?: number
  sort?: GistSortOption
  direction?: GistSortDirection
  search?: string
}
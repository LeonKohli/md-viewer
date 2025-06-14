// Import from Octokit directly for proper types
import type { Octokit } from 'octokit'

// Extract proper types from Octokit responses
type OctokitGistResponse = Awaited<ReturnType<Octokit['rest']['gists']['list']>>
export type Gist = OctokitGistResponse['data'][0]

// Extend GistFile to ensure content is always present
export interface GistFile {
  filename?: string
  type?: string
  language?: string
  raw_url?: string
  size?: number
  truncated?: boolean
  content?: string
  encoding?: string
}

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
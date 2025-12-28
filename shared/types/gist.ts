// Gist-related types - auto-imported via shared/types/
import type { Octokit } from 'octokit'

// Extract proper types from Octokit responses
type OctokitGistResponse = Awaited<ReturnType<Octokit['rest']['gists']['list']>>
export type Gist = OctokitGistResponse['data'][0]

export type GistFile = {
  filename?: string
  type?: string
  language?: string
  raw_url?: string
  size?: number
  truncated?: boolean
  content?: string
  encoding?: string
}

export type CreateGistRequest = {
  description?: string
  public?: boolean
  files: Record<string, { content: string }>
}

export type UpdateGistRequest = {
  description?: string
  files?: Record<string, { content?: string | null; filename?: string }>
}

export type GistOperationResult = {
  success: boolean
  gist?: Gist
  error?: string
}

export type GistSortOption = 'updated' | 'created' | 'name'
export type GistSortDirection = 'asc' | 'desc'

export type GistListOptions = {
  page?: number
  perPage?: number
  sort?: GistSortOption
  direction?: GistSortDirection
  search?: string
}

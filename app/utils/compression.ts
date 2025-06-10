import LZString from 'lz-string'

/**
 * Compresses a string using LZ-string compression algorithm
 * for URL-safe sharing
 */
export function compressContent(content: string): string {
  return LZString.compressToEncodedURIComponent(content)
}

/**
 * Decompresses a string compressed with compressContent
 */
export function decompressContent(compressed: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(compressed)
  } catch (error) {
    return null
  }
}

/**
 * Estimates the compressed size of content
 */
export function estimateCompressedSize(content: string): number {
  const compressed = compressContent(content)
  return compressed.length
}

/**
 * Maximum URL length for safe sharing across browsers
 */
export const MAX_URL_LENGTH = 2000

/**
 * Checks if content can be safely shared via URL
 */
export function canShareViaURL(content: string): boolean {
  const baseURL = window.location.origin + '/#share/'
  const compressed = compressContent(content)
  return (baseURL.length + compressed.length) < MAX_URL_LENGTH
}
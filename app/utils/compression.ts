import LZString from 'lz-string'

/**
 * Compresses a string using LZ-string compression algorithm
 * for URL-safe sharing
 */
export function compressContentLZ(content: string): string {
  return LZString.compressToEncodedURIComponent(content)
}

/**
 * Decompresses a string compressed with compressContentLZ
 */
export function decompressContentLZ(compressed: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(compressed)
  } catch (error) {
    return null
  }
}

/**
 * Estimates the compressed size of content using LZ-string
 */
export function estimateCompressedSizeLZ(content: string): number {
  const compressed = compressContentLZ(content)
  return compressed.length
}

/**
 * Maximum URL length for safe sharing across browsers (legacy)
 */
export const MAX_URL_LENGTH_LEGACY = 2000

/**
 * Checks if content can be safely shared via URL (legacy)
 */
export function canShareViaURLLegacy(content: string): boolean {
  const baseURL = window.location.origin + '/#share/'
  const compressed = compressContentLZ(content)
  return (baseURL.length + compressed.length) < MAX_URL_LENGTH_LEGACY
}
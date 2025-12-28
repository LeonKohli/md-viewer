import pako from 'pako'

// Check for native Compression Streams API support
export const hasNativeCompression: boolean = (() => {
  if (typeof window === 'undefined') return false
  try {
    new CompressionStream('gzip')
    new DecompressionStream('gzip')
    return true
  } catch {
    return false
  }
})()

// Performance thresholds - using const object pattern per Nuxt 4 best practices
export const COMPRESSION_THRESHOLDS = {
  MAX_URL_LENGTH: 32000, // Safe for modern browsers
} as const

type CompressionThresholds = typeof COMPRESSION_THRESHOLDS

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// Base64 URL-safe encoding
export function toBase64URL(uint8Array: Uint8Array): string {
  // Convert to regular base64
  let binary = ''
  uint8Array.forEach(byte => binary += String.fromCharCode(byte))
  let base64 = btoa(binary)
  
  // Make URL-safe
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '') // Remove padding
}

// Base64 URL-safe decoding
export function fromBase64URL(str: string): Uint8Array {
  // Add padding if needed
  while (str.length % 4) str += '='
  
  // Convert from URL-safe to regular base64
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  
  // Decode
  const binary = atob(str)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Native compression using Compression Streams API
async function compressNative(text: string): Promise<Uint8Array> {
  const cs = new CompressionStream('gzip')
  const byteData = stringToUint8Array(text)
  // Cast to ArrayBuffer - TextEncoder always produces ArrayBuffer, not SharedArrayBuffer
  const buffer = byteData.buffer.slice(
    byteData.byteOffset,
    byteData.byteOffset + byteData.byteLength
  ) as ArrayBuffer
  const stream = new Response(buffer).body!
  const compressedStream = stream.pipeThrough(cs)
  const compressedBlob = await new Response(compressedStream).blob()
  return new Uint8Array(await compressedBlob.arrayBuffer())
}

// Native decompression using Decompression Streams API
async function decompressNative(data: Uint8Array): Promise<string> {
  const ds = new DecompressionStream('gzip')
  // Cast to ArrayBuffer - our Uint8Array is always backed by ArrayBuffer
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer
  const stream = new Response(buffer).body!
  const decompressedStream = stream.pipeThrough(ds)
  const decompressedBlob = await new Response(decompressedStream).blob()
  return await decompressedBlob.text()
}

// Pako compression fallback
function compressPako(text: string): Uint8Array {
  return pako.gzip(text, { level: 6 })
}

// Pako decompression fallback
function decompressPako(data: Uint8Array): string {
  return pako.ungzip(data, { to: 'string' })
}

// Main compression function with automatic method selection
export async function compressContent(content: string): Promise<string> {
  const startTime = performance.now()
  
  try {
    let compressed: Uint8Array
    
    if (hasNativeCompression) {
      // Use native compression
      compressed = await compressNative(content)
    } else {
      // Fallback to Pako
      compressed = compressPako(content)
    }
    
    const encoded = toBase64URL(compressed)
    
    // Log performance metrics
    const duration = performance.now() - startTime
    console.debug('Compression stats:', {
      originalSize: content.length,
      compressedSize: compressed.length,
      encodedSize: encoded.length,
      ratio: Math.round((1 - compressed.length / content.length) * 100) + '%',
      duration: Math.round(duration) + 'ms',
      method: hasNativeCompression ? 'native' : 'pako'
    })
    
    return encoded
  } catch (error) {
    console.error('Compression failed:', error)
    throw new Error('Failed to compress content')
  }
}

// Main decompression function
export async function decompressContent(compressed: string): Promise<string | null> {
  try {
    // Decode from base64 URL
    const data = fromBase64URL(compressed)
    
    // Check for gzip magic bytes (1f 8b)
    if (data[0] === 0x1f && data[1] === 0x8b) {
      // It's gzip compressed
      if (hasNativeCompression) {
        return await decompressNative(data)
      } else {
        return decompressPako(data)
      }
    }
    
    // If not gzip, return null
    return null
  } catch (error) {
    console.error('Decompression failed:', error)
    return null
  }
}

// Estimate compressed size without actually compressing
export function estimateCompressedSize(content: string): number {
  // Rough estimation based on typical markdown compression ratios
  // Gzip typically achieves 70-80% compression on markdown
  const estimatedCompressed = content.length * 0.25
  // Base64 encoding adds ~33% overhead
  const estimatedEncoded = estimatedCompressed * 1.33
  return Math.round(estimatedEncoded)
}

// Check if content can be shared via URL
// Uses fixed base URL length estimate (typical origin ~40 chars + "/#share/" = ~50 chars)
// This avoids window access and works in SSR
export function canShareViaURL(content: string): boolean {
  const BASE_URL_LENGTH_ESTIMATE = 50
  const estimatedSize = estimateCompressedSize(content)
  return (BASE_URL_LENGTH_ESTIMATE + estimatedSize) < COMPRESSION_THRESHOLDS.MAX_URL_LENGTH
}
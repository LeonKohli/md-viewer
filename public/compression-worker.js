// Web Worker for compression tasks
// This runs in a separate thread to avoid blocking the UI

// Import pako for compression
self.importScripts('https://unpkg.com/pako@2.1.0/dist/pako.min.js')

// Helper functions (duplicated from main thread as workers can't share code)
function stringToUint8Array(str) {
  return new TextEncoder().encode(str)
}

function toBase64URL(uint8Array) {
  let binary = ''
  uint8Array.forEach(byte => binary += String.fromCharCode(byte))
  let base64 = btoa(binary)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Check for native compression support in worker
const hasNativeCompression = (() => {
  try {
    new CompressionStream('gzip')
    return true
  } catch {
    return false
  }
})()

// Compression function
async function compressData(text) {
  let compressed
  
  if (hasNativeCompression) {
    // Use native compression
    const cs = new CompressionStream('gzip')
    const byteData = stringToUint8Array(text)
    const stream = new Response(byteData).body
    const compressedStream = stream.pipeThrough(cs)
    const compressedBlob = await new Response(compressedStream).blob()
    compressed = new Uint8Array(await compressedBlob.arrayBuffer())
  } else {
    // Use pako
    compressed = self.pako.gzip(text, { level: 6 })
  }
  
  return compressed
}

// Message handler
self.addEventListener('message', async (event) => {
  const { id, action, data } = event.data
  
  if (action === 'compress') {
    try {
      // Send progress update
      self.postMessage({
        id,
        type: 'progress',
        status: 'compressing',
        progress: 10
      })
      
      const compressed = await compressData(data.content)
      
      // Send progress update
      self.postMessage({
        id,
        type: 'progress',
        status: 'encoding',
        progress: 80
      })
      
      const encoded = toBase64URL(compressed)
      
      // Send result
      self.postMessage({
        id,
        type: 'result',
        data: {
          encoded,
          stats: {
            originalSize: data.content.length,
            compressedSize: compressed.length,
            encodedSize: encoded.length,
            ratio: Math.round((1 - compressed.length / data.content.length) * 100),
            method: hasNativeCompression ? 'native' : 'pako'
          }
        }
      })
    } catch (error) {
      self.postMessage({
        id,
        type: 'error',
        error: error.message
      })
    }
  }
})
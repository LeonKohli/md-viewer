import QRCode from 'qrcode'
import { 
  compressContent as compressAdvanced, 
  decompressContent as decompressAdvanced, 
  canShareViaURL as canShareAdvanced,
  compressInWorker,
  COMPRESSION_THRESHOLDS,
  type CompressionProgress
} from '~/utils/compression-advanced'
// Keep old compression for backward compatibility
import { compressContentLZ as compressLZ, decompressContentLZ as decompressLZ } from '~/utils/compression'

export interface ShareOptions {
  title?: string
  readOnly?: boolean
  expiresAt?: Date
  onProgress?: (progress: CompressionProgress) => void
}

export interface SharedDocument {
  content: string
  title?: string
  createdAt: string
  readOnly: boolean
  version: number
  compressionMethod?: 'gzip' | 'lz' // Track compression method
}

export function useContentSharing() {
  const route = useRoute()
  const router = useRouter()
  
  // Check if current page is a shared document
  const isSharedDocument = computed(() => {
    return route.hash.startsWith('#share/')
  })
  
  // Generate a shareable URL from content
  const generateShareURL = async (
    content: string, 
    options: ShareOptions = {}
  ): Promise<string> => {
    const document: SharedDocument = {
      content,
      title: options.title,
      createdAt: new Date().toISOString(),
      readOnly: options.readOnly ?? true,
      version: 2, // Version 2 uses new compression
      compressionMethod: 'gzip'
    }
    
    let compressed: string
    
    // Choose compression method based on content size
    if (content.length > COMPRESSION_THRESHOLDS.SYNC_MAX_SIZE) {
      // Use Web Worker for large documents
      compressed = await compressInWorker(
        JSON.stringify(document),
        options.onProgress
      )
    } else {
      // Use synchronous compression for small documents
      compressed = await compressAdvanced(JSON.stringify(document), { async: false })
    }
    
    const baseURL = window.location.origin + window.location.pathname
    return `${baseURL}#share/${compressed}`
  }
  
  // Generate a shareable URL synchronously (for backward compatibility)
  const generateShareURLSync = (content: string, options: ShareOptions = {}): string => {
    const document: SharedDocument = {
      content,
      title: options.title,
      createdAt: new Date().toISOString(),
      readOnly: options.readOnly ?? true,
      version: 1,
      compressionMethod: 'lz'
    }
    
    const compressed = compressLZ(JSON.stringify(document))
    const baseURL = window.location.origin + window.location.pathname
    return `${baseURL}#share/${compressed}`
  }
  
  // Generate QR code from URL
  const generateQRCode = async (url: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      throw error
    }
  }
  
  // Parse shared document from URL
  const parseSharedDocument = async (): Promise<SharedDocument | null> => {
    if (!isSharedDocument.value) return null
    
    try {
      const compressed = route.hash.slice('#share/'.length)
      
      // Try new decompression first
      let decompressed = await decompressAdvanced(compressed)
      
      // If new decompression worked, we're done
      if (decompressed) {
        try {
          const doc = JSON.parse(decompressed)
          // Check if it's a valid document structure
          if (doc.content !== undefined) {
            return doc
          }
        } catch (e) {
          // Not valid JSON, might be old format
        }
      }
      
      // Fallback to old decompression for backward compatibility
      decompressed = decompressLZ(compressed)
      if (!decompressed) return null
      
      // Old format might store content directly or as JSON
      try {
        const doc = JSON.parse(decompressed)
        if (doc.content !== undefined) {
          return doc
        }
        // Very old format: content stored directly
        return {
          content: decompressed,
          createdAt: new Date().toISOString(),
          readOnly: true,
          version: 1
        }
      } catch {
        // Old format with direct content
        return {
          content: decompressed,
          createdAt: new Date().toISOString(),
          readOnly: true,
          version: 1
        }
      }
    } catch (error) {
      console.error('Failed to parse shared document:', error)
      return null
    }
  }
  
  // Copy URL to clipboard with fallback
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (error) {
        document.body.removeChild(textArea)
        return false
      }
    }
  }
  
  // Share via Web Share API if available
  const shareViaWebAPI = async (url: string, title?: string): Promise<boolean> => {
    if (!navigator.share) return false
    
    try {
      await navigator.share({
        title: title || 'Shared Markdown Document',
        text: 'Check out this markdown document',
        url
      })
      return true
    } catch (error) {
      // User cancelled or error occurred
      return false
    }
  }
  
  // Track share events in localStorage
  const trackShare = (url: string) => {
    const shares = JSON.parse(localStorage.getItem('recentShares') || '[]')
    shares.unshift({
      url,
      timestamp: new Date().toISOString()
    })
    // Keep only last 10 shares
    localStorage.setItem('recentShares', JSON.stringify(shares.slice(0, 10)))
  }
  
  // Get recent shares
  const getRecentShares = () => {
    return JSON.parse(localStorage.getItem('recentShares') || '[]')
  }
  
  // Navigate to edit mode from shared document
  const makeEditableCopy = (document: SharedDocument) => {
    // Remove the share hash and load content into editor
    router.push({ hash: '' })
    // Content will be loaded by the main editor
    return document.content
  }
  
  // Get compression statistics
  const getCompressionStats = async (content: string) => {
    const startTime = performance.now()
    const compressed = await compressAdvanced(content, { async: false })
    const duration = performance.now() - startTime
    
    return {
      originalSize: new Blob([content]).size,
      compressedSize: new Blob([compressed]).size,
      ratio: Math.round((1 - new Blob([compressed]).size / new Blob([content]).size) * 100),
      duration: Math.round(duration),
      canShare: canShareAdvanced(content)
    }
  }
  
  return {
    isSharedDocument,
    generateShareURL,
    generateShareURLSync,
    generateQRCode,
    parseSharedDocument,
    copyToClipboard,
    shareViaWebAPI,
    trackShare,
    getRecentShares,
    makeEditableCopy,
    canShareViaURL: canShareAdvanced,
    getCompressionStats,
    COMPRESSION_THRESHOLDS
  }
}
import QRCode from 'qrcode'
import { useClipboard } from '@vueuse/core'
import {
  compressContent,
  decompressContent,
  canShareViaURL,
  COMPRESSION_THRESHOLDS
} from '~/utils/compression'

// ShareOptions, SharedDocument are auto-imported from shared/types/editor.ts

export function useContentSharing() {
  const route = useRoute()
  const router = useRouter()
  const requestURL = useRequestURL()
  const { copy, isSupported: clipboardSupported } = useClipboard()
  
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
      version: 2 // Version 2 uses gzip compression
    }
    
    const compressed = await compressContent(JSON.stringify(document))
    const baseURL = `${requestURL.origin}${requestURL.pathname}`
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
      const decompressed = await decompressContent(compressed)
      
      if (!decompressed) return null
      
      return JSON.parse(decompressed)
    } catch (error) {
      console.error('Failed to parse shared document:', error)
      return null
    }
  }
  
  // Copy URL to clipboard using VueUse
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await copy(text)
      return true
    } catch (err) {
      return false
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
    if (!import.meta.client) return
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
    if (!import.meta.client) return []
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
    const compressed = await compressContent(content)
    const duration = performance.now() - startTime
    
    return {
      originalSize: new Blob([content]).size,
      compressedSize: new Blob([compressed]).size,
      ratio: Math.round((1 - new Blob([compressed]).size / new Blob([content]).size) * 100),
      duration: Math.round(duration),
      canShare: canShareViaURL(content)
    }
  }
  
  return {
    isSharedDocument,
    generateShareURL,
    generateQRCode,
    parseSharedDocument,
    copyToClipboard,
    shareViaWebAPI,
    trackShare,
    getRecentShares,
    makeEditableCopy,
    canShareViaURL,
    getCompressionStats,
    COMPRESSION_THRESHOLDS
  }
}
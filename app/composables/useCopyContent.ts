import { useClipboard } from '@vueuse/core'

export type CopyFormat = 'markdown' | 'plain' | 'html'

interface CopyOptions {
  format: CopyFormat
  showToast?: boolean
}

/**
 * Composable for copying content in multiple formats
 */
export const useCopyContent = () => {
  const { $md, $mdPlainText } = useNuxtApp()
  const { copy: copyToClipboard, copied, isSupported } = useClipboard({ copiedDuring: 2000 })
  const toast = useToast()
  
  /**
   * Copy content in the specified format
   */
  const copyContent = async (markdown: string, options: CopyOptions) => {
    const { format, showToast = true } = options
    
    try {
      let content = ''
      
      switch (format) {
        case 'markdown':
          content = markdown
          break
          
        case 'plain':
          // Extract plain text from markdown
          content = $mdPlainText(markdown)
          break
          
        case 'html':
          // Get rendered HTML without copy buttons
          let renderedHtml = $md(markdown)
          // Remove copy button wrappers and buttons for cleaner HTML
          content = renderedHtml
            .replace(/<div class="code-block-wrapper">/g, '')
            .replace(/<button[^>]*class="code-copy-btn"[^>]*>.*?<\/button>/g, '')
          break
          
        default:
          throw new Error(`Unknown format: ${format}`)
      }
      
      // Use clipboard API with fallback
      if (isSupported.value) {
        await copyToClipboard(content)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      if (showToast) {
        const formatLabels = {
          markdown: 'Markdown',
          plain: 'Plain text',
          html: 'HTML'
        }
        toast.success(`Copied as ${formatLabels[format]}`)
      }
      
      return true
    } catch (error) {
      if (showToast) {
        toast.error('Failed to copy content')
      }
      console.error('Copy failed:', error)
      return false
    }
  }
  
  /**
   * Get content in specified format without copying
   */
  const getFormattedContent = (markdown: string, format: CopyFormat): string => {
    switch (format) {
      case 'markdown':
        return markdown
        
      case 'plain':
        return $mdPlainText(markdown)
        
      case 'html':
        const renderedHtml = $md(markdown)
        // Remove copy button wrappers and buttons
        return renderedHtml
          .replace(/<div class="code-block-wrapper">/g, '')
          .replace(/<button[^>]*class="code-copy-btn"[^>]*>.*?<\/button>/g, '')
        
      default:
        throw new Error(`Unknown format: ${format}`)
    }
  }
  
  return {
    copyContent,
    getFormattedContent,
    copied: readonly(copied),
    isSupported: readonly(isSupported)
  }
}
import type { MarkedExtension } from 'marked'

/**
 * Simple marked extension for Mermaid - just wrap in pre with class
 */
export const markedMermaid: MarkedExtension = {
  extensions: [{
    name: 'mermaid',
    level: 'block',
    start(src: string) {
      return src.match(/^```mermaid/)?.index
    },
    tokenizer(src: string) {
      const match = src.match(/^```mermaid\n([\s\S]*?)```/)
      if (match && match[1]) {
        return {
          type: 'mermaid',
          raw: match[0],
          text: match[1].trim()
        }
      }
      return undefined
    },
    renderer(token: any) {
      // Wrap in a container that preserves the original code for theme switching
      const escapedText = token.text.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<div class="mermaid-container" data-mermaid-src="${escapedText}"><pre class="mermaid">${token.text}</pre></div>`
    }
  }]
}
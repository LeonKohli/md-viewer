import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import markedKatex from 'marked-katex-extension'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import markedFootnote from 'marked-footnote'
import markedAlert from 'marked-alert'
import { markedSmartypants } from 'marked-smartypants'
import markedExtendedTables from 'marked-extended-tables'
import { markedMermaid } from '~/utils/markedMermaid'
import hljs from 'highlight.js/lib/core'

// Register specific languages for better performance
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import vue from 'highlight.js/lib/languages/xml' // Vue uses XML highlighting

// Register languages
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', html)
hljs.registerLanguage('vue', vue)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)

const marked = new Marked()

// Configure marked with extensions
marked.use(gfmHeadingId()) // Adds IDs to headings
marked.use(markedAlert()) // GitHub-style alerts
marked.use(markedSmartypants()) // Smart typography
marked.use(markedExtendedTables()) // Extended table support
marked.use(markedMermaid) // Mermaid diagram support
marked.use(markedFootnote({
  prefixId: 'footnote-',
  description: 'Footnotes',
  refMarkers: false
})) // Adds footnote support
marked.use(markedKatex({
  throwOnError: false,
  output: 'html'
})) // Adds math support
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    // Skip mermaid blocks - they're handled by markedMermaid
    if (lang === 'mermaid') {
      return code
    }
    
    // Check if language is registered
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('Syntax highlighting failed for language:', lang, err)
      }
    }
    
    // Fallback to auto-detection
    try {
      return hljs.highlightAuto(code).value
    } catch (err) {
      console.warn('Auto syntax highlighting failed:', err)
      return code // Return plain text as fallback
    }
  }
})) // Adds code highlighting

// Configure marked options
marked.setOptions({
  breaks: true, // Enable GFM line breaks (newlines as <br>)
  gfm: true,    // GitHub Flavored Markdown (enabled by default, but being explicit)
})

// Function to add copy buttons to code blocks
function addCopyButtons(html: string): string {
  return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attrs, code) => {
    const id = `code-${Math.random().toString(36).substr(2, 9)}`
    return `<div class="code-block-wrapper">
      <pre><code${attrs} id="${id}">${code}</code></pre>
      <button class="code-copy-btn" data-target="${id}">Copy</button>
    </div>`
  })
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      md: (raw: string) => {
        let html = marked.parse(raw) as string
        html = addCopyButtons(html)
        return html
      }
    }
  }
})
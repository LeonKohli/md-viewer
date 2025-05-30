import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
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

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
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
  })
)

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default defineNuxtPlugin(() => {
  return {
    provide: {
      md: (raw: string) => marked.parse(raw) as string
    }
  }
})
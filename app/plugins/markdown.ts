import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import markedKatex from 'marked-katex-extension'
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

// Add extensions
marked.use(markedHighlight({
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
}))

marked.use(markedKatex({
  throwOnError: false,
  output: 'html'
}))

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
})

// Function to add copy buttons to code blocks
function addCopyButtons(html: string): string {
  // Replace pre>code blocks with wrapped versions
  return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attrs, code) => {
    const id = `code-${Math.random().toString(36).substr(2, 9)}`
    
    // Extract the plain text for copying (remove HTML tags)
    const plainCode = code.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    
    return `<div class="code-block-wrapper relative group">
      <pre><code${attrs} id="${id}">${code}</code></pre>
      <button 
        class="code-copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded bg-muted/80 hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1"
        onclick="
          const codeEl = document.getElementById('${id}');
          const code = codeEl.textContent || codeEl.innerText;
          const button = this;
          const originalContent = button.innerHTML;
          navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '<svg class=\\'w-3 h-3\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M5 13l4 4L19 7\\'></path></svg> Copied!';
            setTimeout(() => { button.innerHTML = originalContent; }, 2000);
          }).catch(err => {
            console.error('Failed to copy:', err);
            button.innerHTML = '<svg class=\\'w-3 h-3\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M6 18L18 6M6 6l12 12\\'></path></svg> Failed';
            setTimeout(() => { button.innerHTML = originalContent; }, 2000);
          });
        "
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-width="2"></path>
        </svg>
        Copy
      </button>
    </div>`
  })
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      md: (raw: string) => {
        const html = marked.parse(raw) as string
        return addCopyButtons(html)
      }
    }
  }
})
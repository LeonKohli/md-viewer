import MarkdownIt from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'

// Core formatting plugins
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import markdownItIns from 'markdown-it-ins'
import markdownItMark from 'markdown-it-mark'
import markdownItAbbr from 'markdown-it-abbr'
import markdownItDeflist from 'markdown-it-deflist'

// Enhanced features
import markdownItAttrs from 'markdown-it-attrs'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItTableOfContents from 'markdown-it-table-of-contents'

// Content and structure
import markdownItAnchor from 'markdown-it-anchor'
import markdownItMultimdTable from 'markdown-it-multimd-table'
import markdownItHighlightjs from 'markdown-it-highlightjs'

// Advanced plugins
import { footnote } from '@mdit/plugin-footnote'
import { katex } from '@mdit/plugin-katex'
import markdownItPlantUML from 'markdown-it-plantuml'

// Import highlight.js with specific languages
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

// Register languages
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('dockerfile', dockerfile)

// Register aliases
hljs.registerAliases(['js'], { languageName: 'javascript' })
hljs.registerAliases(['ts'], { languageName: 'typescript' })
hljs.registerAliases(['py'], { languageName: 'python' })
hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' })
hljs.registerAliases(['yml'], { languageName: 'yaml' })
hljs.registerAliases(['html', 'xhtml'], { languageName: 'xml' })
hljs.registerAliases(['md'], { languageName: 'markdown' })
hljs.registerAliases(['docker'], { languageName: 'dockerfile' })

// Initialize markdown-it with options
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  langPrefix: 'hljs language-',
} as MarkdownItOptions)

// Custom slugify function to create cleaner IDs
const slugify = (s: string) => {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars and emojis
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Apply plugins in logical order
// 1. Structure and anchors
md.use(markdownItAnchor, {
  permalink: false, // No visible permalinks, just add IDs
  level: [1, 2, 3, 4, 5, 6],
  slugify: slugify
})

// 2. Text formatting
md.use(markdownItSub)
md.use(markdownItSup)
md.use(markdownItIns)
md.use(markdownItMark)
md.use(markdownItAbbr)
md.use(markdownItDeflist)

// 3. Task lists
md.use(markdownItTaskLists, {
  enabled: true,
  labelAfter: true
})

// 4. Attributes
md.use(markdownItAttrs)

// 5. Table of contents
md.use(markdownItTableOfContents, {
  includeLevel: [1, 2, 3, 4],
  containerClass: 'table-of-contents',
  markerPattern: /^\[\[toc\]\]/im,
  listType: 'ul',
  containerHeaderHtml: '<div class="toc-header">Table of Contents</div>',
  slugify: slugify // Use the same slugify function as anchor plugin
})

// 6. Footnotes
md.use(footnote, {
  prefixId: 'footnote-'
})

// 7. Math with KaTeX
md.use(katex, {
  throwOnError: false,
  strict: false
})

// 8. Syntax highlighting
md.use(markdownItHighlightjs, {
  hljs,
  auto: true,
  code: true
})

// 9. Advanced tables
md.use(markdownItMultimdTable, {
  multiline: true,
  rowspan: true,
  headerless: true
})

// 10. PlantUML support
md.use(markdownItPlantUML, {
  imageFormat: 'svg',
  server: 'https://www.plantuml.com/plantuml'
})

// 11. Mermaid support - custom renderer for fence blocks
const originalFence = md.renderer.rules.fence!
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  if (token?.info === 'mermaid') {
    const content = token.content.trim()
    const escapedText = content.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<div class="mermaid-container" data-mermaid-src="${escapedText}"><pre class="mermaid">${content}</pre></div>`
  }
  return originalFence(tokens, idx, options, env, self)
}

// Post-processing: Add copy buttons to code blocks
function addCopyButtons(html: string): string {
  return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attrs, code) => {
    const id = `code-${Math.random().toString(36).substr(2, 9)}`
    return `<div class="code-block-wrapper">
      <pre><code${attrs} id="${id}">${code}</code></pre>
      <button class="code-copy-btn" data-target="${id}">Copy</button>
    </div>`
  })
}

// Export render function for use in other parts of the app
export function renderMarkdown(raw: string): string {
  let html = md.render(raw)
  html = addCopyButtons(html)
  return html
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      md: renderMarkdown
    }
  }
})
// TocItem, ExportOptions are auto-imported from shared/types/

export function useHtmlExport() {
  
  // Simple TOC generation
  const generateSimpleToc = (items: TocItem[]): string => {
    if (items.length === 0) return ''
    
    const renderItems = (items: TocItem[], level = 0): string => {
      return items.map(item => {
        const indent = '  '.repeat(level)
        const children = item.children.length > 0 ? '\n' + renderItems(item.children, level + 1) : ''
        return `${indent}<li><a href="#${item.id}">${item.text}</a>${children ? `\n${indent}  <ul>${children}\n${indent}  </ul>` : ''}</li>`
      }).join('\n')
    }
    
    return `
<nav class="toc">
  <h2>Table of Contents</h2>
  <ul>
${renderItems(items)}
  </ul>
</nav>`
  }
  
  // Create simple HTML export
  const createSimpleHtml = (
    renderedHtml: string, 
    tocItems: TocItem[],
    options: { includeToc: boolean } = { includeToc: true }
  ) => {
    const tocHtml = options.includeToc ? generateSimpleToc(tocItems) : ''
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  
  <!-- Syntax highlighting handled via CSS variables in styles below -->
  
  <!-- KaTeX for math -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  
  <!-- Mermaid for diagrams -->
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
  </script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    
    /* Basic typography */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    
    p { margin-bottom: 1em; }
    
    /* Links */
    a { color: #0066cc; }
    a:hover { text-decoration: underline; }
    
    /* Code blocks */
    pre {
      background: #f6f8fa;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid #e1e4e8;
    }
    
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
    
    pre code {
      background: none;
      padding: 0;
      font-size: 0.875em;
    }
    
    /* Syntax highlighting colors - GitHub theme */
    .hljs { color: #24292e; }
    .hljs-comment, .hljs-quote, .hljs-meta { color: #6a737d; }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-title, .hljs-section, .hljs-doctag, .hljs-type, .hljs-name, .hljs-strong { color: #d73a49; }
    .hljs-string { color: #032f62; }
    .hljs-number, .hljs-literal { color: #005cc5; }
    .hljs-built_in, .hljs-title.class_, .hljs-title.function_ { color: #6f42c1; }
    .hljs-symbol, .hljs-template-variable, .hljs-variable, .hljs-attr, .hljs-attribute, .hljs-property { color: #e36209; }
    .hljs-selector-id, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-regexp, .hljs-link { color: #005cc5; }
    .hljs-addition { color: #22863a; }
    .hljs-deletion { color: #b31d28; }
    
    /* Code block wrapper for copy button */
    .code-block-wrapper {
      position: relative;
      margin: 1em 0;
    }
    
    .code-block-wrapper pre {
      margin: 0;
    }
    
    .code-copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: white;
      border: 1px solid #e1e4e8;
      border-radius: 4px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .code-block-wrapper:hover .code-copy-btn {
      opacity: 1;
    }
    
    .code-copy-btn:hover {
      background: #f6f8fa;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background: #f6f8fa;
      font-weight: bold;
    }
    
    /* Blockquotes */
    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid #ddd;
      color: #666;
      font-style: italic;
    }
    
    /* Lists */
    ul, ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }
    
    /* Images */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* TOC */
    .toc {
      background: #f9f9f9;
      border: 1px solid #ddd;
      padding: 1em;
      margin-bottom: 2em;
      border-radius: 5px;
    }
    
    .toc h2 {
      margin-top: 0;
      margin-bottom: 0.5em;
      font-size: 1.2em;
    }
    
    .toc ul {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    
    .toc ul ul {
      padding-left: 1.5em;
      margin-top: 0.25em;
    }
    
    .toc li {
      margin-bottom: 0.25em;
    }
    
    .toc a {
      text-decoration: none;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    /* Math display */
    .katex-display {
      margin: 1em 0;
      text-align: left !important;
    }
    
    .katex-display > .katex {
      text-align: left !important;
      margin-left: 2em;
    }
    
    /* GitHub-style Alerts */
    .markdown-alert {
      padding: 1em;
      margin: 1em 0;
      border-radius: 6px;
      border: 1px solid;
    }
    
    .markdown-alert-title {
      font-weight: 600;
      margin-bottom: 0.5em;
    }
    
    .markdown-alert-note {
      background-color: #f0f9ff;
      border-color: #0284c7;
      color: #0c4a6e;
    }
    
    .markdown-alert-tip {
      background-color: #f0fdf4;
      border-color: #16a34a;
      color: #14532d;
    }
    
    .markdown-alert-important {
      background-color: #faf5ff;
      border-color: #9333ea;
      color: #581c87;
    }
    
    .markdown-alert-warning {
      background-color: #fffbeb;
      border-color: #f59e0b;
      color: #78350f;
    }
    
    .markdown-alert-caution {
      background-color: #fef2f2;
      border-color: #dc2626;
      color: #7f1d1d;
    }
    
    /* Footnotes */
    .footnotes {
      margin-top: 3em;
      padding-top: 2em;
      border-top: 1px solid #ddd;
      font-size: 0.875em;
    }
    
    .footnotes ol {
      padding-left: 1.5em;
    }
    
    .footnotes li {
      margin-bottom: 0.5em;
    }
    
    /* Extended tables */
    table {
      margin: 1em 0;
    }
    
    /* Simple mermaid styles */
    .mermaid {
      margin: 1.5em 0;
      text-align: center;
    }
    
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
    
    /* Print styles */
    @media print {
      body {
        max-width: none;
        margin: 0;
        padding: 1em;
      }
      
      .toc {
        page-break-after: always;
      }
      
      .code-copy-btn {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  ${tocHtml}
  ${renderedHtml}
  
  <script>
    // Simple copy functionality
    document.addEventListener('click', function(e) {
      if (e.target.closest('.code-copy-btn')) {
        const button = e.target.closest('.code-copy-btn');
        const codeBlock = button.parentElement.querySelector('code');
        const text = codeBlock.textContent || codeBlock.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        }).catch(err => {
          // Silent failure in exported HTML
        });
      }
    });
  </script>
</body>
</html>`
  }
  
  // Advanced TOC generation for sidebar layout
  const generateAdvancedToc = (items: TocItem[]): string => {
    if (items.length === 0) return ''
    
    const renderItems = (items: TocItem[]): string => {
      return items.map(item => {
        const hasChildren = item.children.length > 0
        return `
          <li class="toc-item toc-level-${item.level}">
            <a href="#${item.id}" class="toc-link">${item.text}</a>
            ${hasChildren ? `<ul class="toc-children">${renderItems(item.children)}</ul>` : ''}
          </li>`
      }).join('')
    }
    
    return `
      <nav class="table-of-contents">
        <h2 class="toc-title">Table of Contents</h2>
        <ul class="toc-list">
          ${renderItems(items)}
        </ul>
      </nav>`
  }
  
  // Create advanced HTML export with sidebar TOC
  const createAdvancedHtml = (
    renderedHtml: string,
    tocItems: TocItem[],
    colorMode: 'light' | 'dark' = 'light'
  ) => {
    const tocHtml = generateAdvancedToc(tocItems)
    
    return `<!DOCTYPE html>
<html lang="en" class="${colorMode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  
  <!-- Syntax highlighting handled via CSS variables in styles below -->
  
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  
  <!-- Mermaid for diagrams -->
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    const isDark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ 
      startOnLoad: true,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose'
    });
  </script>
  
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    :root {
      --bg: #ffffff;
      --fg: #1a1a1a;
      --bg-secondary: #f9fafb;
      --border: #e5e7eb;
      --link: #2563eb;
      --code-bg: #f6f8fa;
      --toc-bg: #ffffff;
      --toc-hover: #f3f4f6;
      
      /* Syntax highlighting - Light mode */
      --hl-base: #24292e;
      --hl-comment: #6a737d;
      --hl-keyword: #d73a49;
      --hl-string: #032f62;
      --hl-number: #005cc5;
      --hl-function: #6f42c1;
      --hl-variable: #e36209;
      --hl-type: #005cc5;
      --hl-attribute: #d73a49;
      --hl-addition: #22863a;
      --hl-deletion: #b31d28;
    }
    
    :root.dark {
      --bg: #0f0f0f;
      --fg: #e5e5e5;
      --bg-secondary: #1a1a1a;
      --border: #262626;
      --link: #60a5fa;
      --code-bg: #1a1a1a;
      --toc-bg: #0f0f0f;
      --toc-hover: #262626;
      
      /* Syntax highlighting - Dark mode */
      --hl-base: #c9d1d9;
      --hl-comment: #8b949e;
      --hl-keyword: #ff7b72;
      --hl-string: #a5d6ff;
      --hl-number: #79c0ff;
      --hl-function: #d2a8ff;
      --hl-variable: #ffa657;
      --hl-type: #79c0ff;
      --hl-attribute: #ff7b72;
      --hl-addition: #aff5b4;
      --hl-deletion: #ffdcd7;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: var(--fg);
      background-color: var(--bg);
    }
    
    .container {
      display: flex;
      min-height: 100vh;
    }
    
    /* Sidebar TOC */
    .table-of-contents {
      width: 300px;
      padding: 2rem;
      background: var(--toc-bg);
      border-right: 1px solid var(--border);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
    }
    
    .toc-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .toc-list, .toc-children {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .toc-children {
      margin-left: 1.25rem;
      margin-top: 0.25rem;
    }
    
    .toc-item {
      margin-bottom: 0.25rem;
    }
    
    .toc-link {
      display: block;
      padding: 0.375rem 0.75rem;
      color: var(--fg);
      text-decoration: none;
      border-radius: 0.375rem;
      transition: all 0.15s;
      font-size: 0.875rem;
    }
    
    .toc-link:hover {
      background-color: var(--toc-hover);
    }
    
    .toc-level-1 > .toc-link {
      font-weight: 600;
    }
    
    /* Main content */
    .content {
      flex: 1;
      padding: 3rem;
      max-width: 900px;
      margin: 0 auto;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.25;
      scroll-margin-top: 2rem;
    }
    
    h1 { font-size: 2.25rem; }
    h2 { font-size: 1.875rem; }
    h3 { font-size: 1.5rem; }
    h4 { font-size: 1.25rem; }
    
    h1:first-child { margin-top: 0; }
    
    p { margin-bottom: 1rem; }
    
    a {
      color: var(--link);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* Code blocks */
    pre {
      background: var(--code-bg);
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      margin: 1rem 0;
      border: 1px solid var(--border);
    }
    
    code {
      background: var(--code-bg);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    /* Syntax highlighting with CSS variables */
    .hljs { 
      background: transparent !important;
      color: var(--hl-base);
    }
    .hljs-comment, .hljs-quote, .hljs-meta { color: var(--hl-comment); }
    .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-title, .hljs-section, .hljs-doctag, .hljs-type, .hljs-name, .hljs-strong { color: var(--hl-keyword); }
    .hljs-string { color: var(--hl-string); }
    .hljs-number, .hljs-literal { color: var(--hl-number); }
    .hljs-built_in, .hljs-title.class_, .hljs-title.function_ { color: var(--hl-function); }
    .hljs-symbol, .hljs-template-variable, .hljs-variable, .hljs-attr, .hljs-attribute, .hljs-property { color: var(--hl-variable); }
    .hljs-selector-id, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-regexp, .hljs-link { color: var(--hl-type); }
    .hljs-addition { color: var(--hl-addition); }
    .hljs-deletion { color: var(--hl-deletion); }
    
    /* Code block wrapper */
    .code-block-wrapper {
      position: relative;
      margin: 1rem 0;
    }
    
    .code-block-wrapper pre {
      margin: 0;
    }
    
    .code-copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background: var(--bg);
      color: var(--fg);
      border: 1px solid var(--border);
      border-radius: 0.25rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .code-block-wrapper:hover .code-copy-btn {
      opacity: 1;
    }
    
    .code-copy-btn:hover {
      background: var(--bg-secondary);
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid var(--border);
      padding: 0.75rem;
      text-align: left;
    }
    
    th {
      background: var(--bg-secondary);
      font-weight: 600;
    }
    
    /* Lists */
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 2rem;
    }
    
    /* Blockquotes */
    blockquote {
      margin: 1rem 0;
      padding-left: 1rem;
      border-left: 4px solid var(--border);
      color: var(--fg);
      opacity: 0.8;
      font-style: italic;
    }
    
    /* Images */
    img {
      max-width: 100%;
      height: auto;
    }
    
    /* Math */
    .katex-display {
      margin: 1rem 0;
      overflow-x: auto;
    }
    
    /* Mermaid diagrams */
    .mermaid {
      margin: 1.5rem 0;
      text-align: center;
    }
    
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
    
    /* Mobile */
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      
      .table-of-contents {
        width: 100%;
        height: auto;
        position: static;
        border-right: none;
        border-bottom: 1px solid var(--border);
      }
      
      .content {
        padding: 2rem 1rem;
      }
    }
    
    /* Print */
    @media print {
      .table-of-contents {
        display: none;
      }
      
      .content {
        max-width: none;
        padding: 0;
      }
      
      .code-copy-btn {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${tocItems.length > 0 ? tocHtml : ''}
    <main class="content">
      ${renderedHtml}
    </main>
  </div>
  
  <script>
    // Copy functionality
    document.addEventListener('DOMContentLoaded', function() {
      document.addEventListener('click', function(e) {
        if (e.target.closest('.code-copy-btn')) {
          const button = e.target.closest('.code-copy-btn');
          const codeBlock = button.parentElement.querySelector('code');
          const text = codeBlock.textContent || codeBlock.innerText;
          
          navigator.clipboard.writeText(text).then(() => {
            const originalContent = button.innerHTML;
            button.innerHTML = 'Copied!';
            setTimeout(() => {
              button.innerHTML = originalContent;
            }, 2000);
          }).catch(err => {
            // Silent failure in exported HTML
          });
        }
      });
      
      // Smooth scroll for TOC
      document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    });
  </script>
</body>
</html>`
  }
  
  // Export function with different options
  const exportAsHtml = (
    renderedHtml: string,
    tocItems: TocItem[],
    options: ExportOptions
  ) => {
    let html = ''
    const filename = `markdown-${new Date().toISOString().split('T')[0]}.html`
    
    switch (options.type) {
      case 'simple':
        html = createSimpleHtml(renderedHtml, tocItems, { includeToc: true })
        break
      case 'simple-no-toc':
        html = createSimpleHtml(renderedHtml, tocItems, { includeToc: false })
        break
      case 'advanced':
        html = createAdvancedHtml(renderedHtml, tocItems, options.colorMode || 'light')
        break
    }
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return {
    exportAsHtml
  }
}
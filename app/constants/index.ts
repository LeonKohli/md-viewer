// Sample markdown content
export const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview

This is a **live preview** of your markdown content.

## Features

- Real-time preview
- Clean, minimal interface  
- Export options
- Syntax highlighting

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote with some **bold** and *italic* text.

### Table

| Feature | Status |
|---------|--------|
| Preview | ✅ |
| Export  | ✅ |
| Themes  | ✅ |`

// Default configuration
export const DEFAULT_CONFIG = {
  DEBOUNCE_DELAY: 300,
  INITIAL_PANEL_WIDTH: 50,
  SNAP_THRESHOLD: 3,
  MIN_EDGE_WIDTH: 8,
  MAX_EDGE_WIDTH: 92,
  SNAP_POINTS: [25, 33.33, 50, 66.67, 75]
} as const

// File export settings
export const EXPORT_CONFIG = {
  MARKDOWN_EXTENSION: '.md',
  TEXT_EXTENSION: '.txt',
  MARKDOWN_MIME_TYPE: 'text/markdown',
  TEXT_MIME_TYPE: 'text/plain'
} as const

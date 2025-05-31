export const SAMPLE_MARKDOWN = `# 🚀 Markdown Viewer - Complete Feature Showcase

Welcome to **Markdown Viewer**, a modern, feature-rich markdown editor with live preview capabilities!

---

## 📑 Table of Contents

This document demonstrates all supported markdown features. Use the TOC button in the navbar or press **Ctrl/Cmd + /** to navigate.

---

## 📝 Basic Text Formatting

### Inline Styles

- **Bold text** using \`**double asterisks**\` or __double underscores__
- *Italic text* using \`*single asterisks*\` or _single underscores_  
- ***Bold and italic*** using \`***triple asterisks***\`
- ~~Strikethrough~~ using \`~~double tildes~~\`
- \`Inline code\` using \`backticks\`
- ==Highlighted text== using \`==double equals==\` (if supported)

### Combinations

You can combine styles: ***This is ~~bold, italic, and strikethrough~~*** text!

---

## 🎯 Headings

# Heading 1 - The Largest
## Heading 2 - Major Section
### Heading 3 - Subsection
#### Heading 4 - Sub-subsection
##### Heading 5 - Minor Heading
###### Heading 6 - The Smallest

Alternative syntax:

Heading 1 Alternative
=====================

Heading 2 Alternative
---------------------

---

## 🎯 Special Features

### Footnotes

Here's a sentence with a footnote[^1].

You can also use inline footnotes^[This is an inline footnote].

[^1]: This is the footnote content that appears at the bottom of the document.

### Abbreviations

The HTML specification is maintained by the W3C. When you hover over HTML or W3C, you'll see the full definition.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

### Definition Lists

Term 1
: This is the definition of Term 1.

Term 2  
: This is the definition of Term 2.
: Terms can have multiple definitions

API
: Application Programming Interface
: A way for programs to communicate with each other

---

## 📊 Diagrams

### Mermaid Diagrams

#### Flow Chart

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issues]
    E --> B
    C --> F[Deploy]
\`\`\`

#### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Preview
    participant Renderer

    User->>Editor: Type markdown
    Editor->>Renderer: Send content
    Renderer->>Renderer: Parse markdown
    Renderer->>Preview: Return HTML
    Preview->>User: Display result
\`\`\`

#### State Diagram

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Typing : User types
    Typing --> Processing : Debounce timeout
    Processing --> Rendering : Parse markdown
    Rendering --> Displaying : Generate HTML
    Displaying --> Idle : Complete
    Displaying --> Typing : User types again
\`\`\`

### PlantUML Diagrams

#### Class Diagram

\`\`\`plantuml
@startuml
class MarkdownEditor {
  -content: string
  -wordWrap: boolean
  +toggleWordWrap()
  +updateContent(text: string)
}

class Preview {
  -html: string
  +render(markdown: string)
  +scrollTo(position: number)
}

class ScrollSync {
  -enabled: boolean
  +toggle()
  +syncScroll(source: string)
}

MarkdownEditor --> ScrollSync
Preview --> ScrollSync
@enduml
\`\`\`

#### Activity Diagram

\`\`\`plantuml
@startuml
start
:User types markdown;
:Parse markdown to AST;
if (Has code blocks?) then (yes)
  :Apply syntax highlighting;
else (no)
endif
if (Has math formulas?) then (yes)
  :Render with KaTeX;
else (no)
endif
:Convert to HTML;
:Display in preview;
stop
@enduml
\`\`\`

---

## 📋 Lists

### Unordered Lists

- First level item
- Another first level item
  - Second level item
  - Another second level item
    - Third level item
    - Another third level item
- Back to first level

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
      1. Deep nested 2.2.1
      2. Deep nested 2.2.2
3. Third item

### Mixed Lists

1. Ordered item one
   - Unordered sub-item
   - Another unordered sub-item
2. Ordered item two
   1. Ordered sub-item
   2. Another ordered sub-item
      - Mixed nesting
      - Works great!

### Task Lists

- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Another pending task
  - [x] Completed subtask
  - [ ] Pending subtask

---

## 💻 Code Blocks

### JavaScript
\`\`\`javascript
// Fibonacci function with memoization
const fibonacci = (function() {
  const cache = {};
  
  return function fib(n) {
    if (n in cache) return cache[n];
    if (n <= 1) return n;
    
    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  };
})();

console.log(fibonacci(10)); // 55
\`\`\`

### Python
\`\`\`python
# Quick sort implementation
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(numbers))  # [1, 1, 2, 3, 6, 8, 10]
\`\`\`

### TypeScript
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: Map<number, User> = new Map();

  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  getUser(id: number): User | undefined {
    return this.users.get(id);
  }
}
\`\`\`

### Shell
\`\`\`bash
#!/bin/bash
# System update script

echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Cleaning up..."
sudo apt autoremove -y
sudo apt autoclean

echo "System update complete!"
\`\`\`

---

## 🧮 Mathematical Expressions

### Inline Math

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, where $a \\neq 0$.

Einstein's famous equation: $E = mc^2$

### Block Math

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\begin{aligned}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &= \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} &= 4 \\pi \\rho \\\\
\\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &= \\vec{\\mathbf{0}} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} &= 0
\\end{aligned}
$$

### Matrix

$$
\\begin{bmatrix}
a_{11} & a_{12} & a_{13} \\\\
a_{21} & a_{22} & a_{23} \\\\
a_{31} & a_{32} & a_{33}
\\end{bmatrix}
\\times
\\begin{bmatrix}
b_{11} & b_{12} \\\\
b_{21} & b_{22} \\\\
b_{31} & b_{32}
\\end{bmatrix}
=
\\begin{bmatrix}
c_{11} & c_{12} \\\\
c_{21} & c_{22} \\\\
c_{31} & c_{32}
\\end{bmatrix}
$$

---

## 💬 Blockquotes

> This is a simple blockquote. It can contain **formatted text**, *italics*, and even \`code\`.

> ## Blockquote with Heading
> 
> You can have multiple paragraphs in a blockquote.
> 
> Just keep adding > symbols at the beginning of each line.

Nested blockquotes:

> This is the first level of quoting.
>
> > This is nested blockquote.
> >
> > > And this is even more nested!
>
> Back to the first level.

---

## 📊 Tables

### Feature Comparison Table

| Feature | Markdown Viewer | VS Code | Obsidian | Typora |
|---------|:--------------:|:-------:|:--------:|:------:|
| Live Preview | ✅ | ✅ | ✅ | ✅ |
| Syntax Highlighting | ✅ | ✅ | ✅ | ✅ |
| KaTeX Math | ✅ | ❌ | ✅ | ✅ |
| Mermaid Diagrams | ✅ | ❌ | ✅ | ✅ |
| PlantUML | ✅ | ❌ | ❌ | ❌ |
| Table of Contents | ✅ | ❌ | ✅ | ✅ |
| Scroll Sync | ✅ | ✅ | ❌ | ❌ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| Export Options | ✅ | ⚠️ | ✅ | ✅ |
| Free & Open Source | ✅ | ✅ | ❌ | ❌ |

### Performance Metrics

| Operation | Time (ms) | Memory (MB) | CPU Usage |
|-----------|----------:|------------:|----------:|
| Initial Load | 250 | 45 | 12% |
| Render 1000 lines | 85 | 62 | 8% |
| Syntax Highlight | 15 | 8 | 3% |
| Export to PDF | 320 | 95 | 18% |

---

## 🔗 Links and References

### Inline Links
- Check out the [GitHub repository](https://github.com/example/md-viewer)
- Read the [documentation](https://docs.example.com)
- [Link with title](https://example.com "This is a link title")

### Reference Links
- [Reference link][1]
- [Another reference][docs]
- [Link reference itself]

[1]: https://github.com
[docs]: https://docs.github.com
[Link reference itself]: https://example.com

### Automatic Links
- https://github.com - URLs automatically become links
- <fake@example.com> - Email addresses too

---

## 🖼️ Images

### Inline Images
![Markdown Logo](https://markdown-here.com/img/icon256.png)

### Images with Alt Text and Title
![A beautiful landscape](https://via.placeholder.com/600x300/3b82f6/ffffff?text=Beautiful+Landscape "Hover for title")

### Reference Style Images
![Alt text][image-reference]

[image-reference]: https://via.placeholder.com/400x200/10b981/ffffff?text=Reference+Style+Image "Reference Image Title"

---

## 🔄 Horizontal Rules

Three or more hyphens:

---

Three or more asterisks:

***

Three or more underscores:

___

---

## 🎨 HTML Elements

You can use <mark>HTML tags</mark> directly in markdown.

<details>
<summary>Click to expand!</summary>

This is a collapsible section using HTML details tag.

You can put any markdown content here:
- Lists
- **Bold text**
- \`Code blocks\`
- Etc.

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> to copy

<p align="center">
  <strong>Centered content using HTML</strong>
</p>

---

## 🎯 Special Features

### Footnotes

Here's a sentence with a footnote[^1].

You can also use inline footnotes^[This is an inline footnote].

[^1]: This is the footnote content.

### Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

### Definition Lists

Term 1
:   This is the definition of Term 1.

Term 2
:   This is the definition of Term 2.
:   Terms can have multiple definitions.

---

## 🎉 Emoji Support

You can use emojis directly: 😀 🎉 🚀 ❤️ 👍

Or use emoji shortcodes (if supported):
- :smile:
- :rocket:
- :heart:
- :thumbsup:

---

## 📚 Advanced Examples

### Complex Nested Structure

1. **First main point**
   - Supporting detail with \`inline code\`
   - Another detail with a [link](https://example.com)
     1. Sub-point one
     2. Sub-point two with math: $x^2 + y^2 = z^2$
   
2. **Second main point**
   > A relevant quote about this point
   
   \`\`\`python
   # Code example for this point
   def example():
       return "Hello, World!"
   \`\`\`

### Mixed Content Example

| Column 1 | Column 2 |
|----------|----------|
| **Bold** | *Italic* |
| \`code\` | [link](#) |
| $x^2$ | ~~strike~~ |

> **Note:** This table demonstrates how different formatting works within table cells.

---

## 🔧 Editor Features

This markdown viewer includes:

- **Live Preview**: See changes as you type
- **Syntax Highlighting**: Beautiful code blocks with language detection
- **Scroll Sync**: Editor and preview scroll together
- **Dark Mode**: Easy on the eyes
- **Export Options**: Save as .md or .txt
- **Responsive Design**: Works on all devices
- **Table of Contents**: Navigate long documents easily
- **Focus Mode**: Expand preview for better reading

---

## 📝 Conclusion

This showcase demonstrates the full capabilities of our markdown viewer. Feel free to edit this content to test any features!

> **Pro Tip**: Use the keyboard shortcuts for faster navigation:
> - \`Ctrl/Cmd + /\` - Toggle Table of Contents
> - \`ESC\` - Exit fullscreen mode

Happy writing! 🚀`;
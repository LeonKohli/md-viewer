export const SAMPLE_MARKDOWN = `# 🚀 Markdown Editor - Complete Feature Showcase

Welcome to **Markdown Editor**, powered by markdown-it with extensive plugin support!

[[toc]]

---

## 📝 Text Formatting

### Basic Formatting
- **Bold text** using \`**asterisks**\` or __underscores__
- *Italic text* using \`*asterisks*\` or _underscores_  
- ***Bold and italic*** using \`***triple asterisks***\`
- ~~Strikethrough~~ using \`~~tildes~~\`
- \`Inline code\` using \`backticks\`

### Extended Formatting
- ==Highlighted text== using \`==double equals==\`
- ++Inserted text++ using \`++double plus++\`
- H~2~O subscript using \`~tildes~\`
- X^2^ superscript using \`^carets^\`

### Combinations
You can combine: ***==Bold, italic, and highlighted==*** with ~~strikethrough~~ and ++insertion++!

---

## 🎯 Headings with Auto-generated IDs

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

All headings automatically get IDs for linking and navigation.

---

## 📋 Lists

### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested
    - Deep nested
- Back to first level

### Ordered Lists
1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

### Task Lists
- [x] Completed task
- [x] Another done
- [ ] Pending task
- [ ] Todo item
  - [x] Completed subtask
  - [ ] Pending subtask

---

## 💻 Code Blocks with Syntax Highlighting

### JavaScript
\`\`\`javascript
// Modern JavaScript with all features
const greeting = (name = 'World') => {
  return \`Hello, \${name}!\`;
};

class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(num) {
    this.result += num;
    return this;
  }
  
  multiply(num) {
    this.result *= num;
    return this;
  }
}

console.log(greeting('Markdown'));
\`\`\`

### TypeScript
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

function processUser<T extends User>(user: T): T {
  console.log(\`Processing user: \${user.name}\`);
  return user;
}

const user: User = {
  id: 1,
  name: 'John Doe'
};
\`\`\`

### Python
\`\`\`python
# Python example with type hints
from typing import List, Optional

def fibonacci(n: int) -> List[int]:
    """Generate Fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    
    return sequence

print(fibonacci(10))
\`\`\`

### Other Languages
\`\`\`bash
#!/bin/bash
echo "Shell scripting example"
for i in {1..5}; do
  echo "Count: $i"
done
\`\`\`

\`\`\`json
{
  "name": "markdown-editor",
  "version": "1.0.0",
  "features": ["syntax-highlighting", "live-preview"]
}
\`\`\`

\`\`\`yaml
services:
  app:
    image: node:18
    ports:
      - "3000:3000"
\`\`\`

---

## 🧮 Mathematical Expressions (KaTeX)

### Inline Math
The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Einstein's equation: $E = mc^2$

### Block Math
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\begin{aligned}
\\nabla \\cdot \\vec{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\vec{B} &= 0 \\\\
\\nabla \\times \\vec{E} &= -\\frac{\\partial \\vec{B}}{\\partial t} \\\\
\\nabla \\times \\vec{B} &= \\mu_0 \\vec{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}
\\end{aligned}
$$

---

## 📊 Tables

### Basic Table
| Feature | Support | Notes |
|---------|:-------:|-------|
| Basic Markdown | ✅ | Full support |
| Extended Syntax | ✅ | Via plugins |
| Math Rendering | ✅ | KaTeX |
| Diagrams | ✅ | Mermaid |

### Multi-line Table Support

|> Feature | Description <|
|---------|-------------|
| Multi-line cells | This cell contains multiple lines.<br>It can span several lines<br>and maintain proper formatting.<br>Even with line breaks! |
| Code in tables | \`inline code\` works perfectly |
| **Formatting** | *All* ~~text~~ ==formatting== works |

### Advanced Multi-line Table

| Feature | Description |
| :------ | :---------- |
| Multi-line cells | This is a cell with a long text that should wrap naturally when the table is rendered. The multimd-table plugin handles this automatically. |
| Line breaks | Use \`<br>\` tags<br>for explicit<br>line breaks |
| Complex content | - Lists work too<br>- Multiple items<br>- Even nested content |

---

## 📚 Definition Lists

Markdown
:   A lightweight markup language
:   Easy to read and write
:   Converts to HTML

API
:   Application Programming Interface
:   Allows software components to communicate

CSS
:   Cascading Style Sheets
:   Defines the presentation of web documents

---

## 💬 Blockquotes

> This is a simple blockquote.
> It can span multiple lines.

> ### Blockquote with heading
> 
> You can include any markdown inside:
> - Lists work
> - **Bold** and *italic* too
> - Even \`code\`

Nested quotes:
> Level 1
> > Level 2
> > > Level 3

---

## 🔗 Links and References

### Inline Links
- [GitHub Repository](https://github.com)
- [Link with title](https://example.com "Hover to see title")

### Reference Links
- [Reference link][1]
- [Another reference][docs]

[1]: https://github.com
[docs]: https://docs.github.com

### Auto Links
- https://github.com - URLs become clickable
- <user@example.com> - Email addresses too

---

## 📌 Footnotes

Here's text with a footnote[^1].

You can have multiple footnotes[^2] in your document.

[^1]: This is the first footnote content.
[^2]: This is the second footnote with **formatting**.

---

## 🏷️ Abbreviations

The HTML specification is maintained by the W3C. CSS is used for styling.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium
*[CSS]: Cascading Style Sheets

---

## 🎨 Custom Attributes {.custom-class #custom-id}

This paragraph has custom class and ID attributes.

[This link has attributes](https://example.com){target="_blank" rel="noopener"}

You can add attributes to many elements{style="color: blue;"}

---

## 📊 Mermaid Diagrams

### Flowchart
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Parser
    participant Preview
    
    User->>Editor: Type markdown
    Editor->>Parser: Send content
    Parser->>Parser: Parse with markdown-it
    Parser->>Preview: Return HTML
    Preview->>User: Display result
\`\`\`

### State Diagram
\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Typing : User input
    Typing --> Parsing : Debounce
    Parsing --> Rendering : Process
    Rendering --> Idle : Complete
\`\`\`

---

## 🌿 PlantUML Diagrams

### Sequence Diagram
@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml

### Use Case Diagram
@startuml
left to right direction
User --> (Write Markdown)
User --> (Preview)
User --> (Export)

(Write Markdown) .> (Syntax Highlighting) : includes
(Preview) .> (Live Update) : includes
@enduml

### Class Diagram
@startuml
class MarkdownEditor {
  -content: string
  -renderer: MarkdownIt
  +parse(text: string): string
  +export(): void
}

class Preview {
  -html: string
  +update(html: string): void
  +scrollSync(): void
}

MarkdownEditor --> Preview : updates
@enduml

### Activity Diagram
@startuml
start
:User types markdown;
:Editor captures input;
:Debounce timer;
:Parse with markdown-it;
:Render HTML;
:Update preview;
stop
@enduml

---

## 🎯 Special Characters & Typography

### Smart Quotes (Typography)
- "Double quotes" become curly
- 'Single quotes' too
- It's smart about apostrophes

### Special Characters
- En dash: -- (becomes –)
- Em dash: --- (becomes —)
- Ellipsis: ... (becomes …)
- Copyright: (c) (becomes ©)
- Trademark: (tm) (becomes ™)
- Registered: (r) (becomes ®)

---

## 🔄 Horizontal Rules

Three hyphens:

---

Three asterisks:

***

Three underscores:

___

---

## 🎨 HTML Support

<mark>Highlighted with HTML mark tag</mark>

<details>
<summary>Click to expand this section</summary>

This uses HTML details/summary tags.

You can include any markdown:
- Lists
- **Formatting**
- \`Code\`

</details>

<kbd>Ctrl</kbd> + <kbd>S</kbd> to save

---

## 🚀 Editor Features

This editor includes:
- **Live Preview** with instant updates
- **Syntax Highlighting** for 10+ languages
- **Scroll Sync** between editor and preview
- **Dark Mode** support
- **Table of Contents** generation with [[toc]]
- **Copy Code** buttons on all code blocks
- **Responsive Design** for all devices
- **Export** as .md or .txt files

---

## 📝 Summary

This showcase demonstrates all markdown-it features:
- ✅ Core markdown syntax
- ✅ Extended formatting (sub, sup, ins, mark)
- ✅ Definition lists and abbreviations
- ✅ Task lists with checkboxes
- ✅ Advanced tables with multi-line support
- ✅ KaTeX math rendering
- ✅ Footnotes with back-references
- ✅ Custom attributes on elements
- ✅ Table of contents generation
- ✅ Mermaid diagram support
- ✅ PlantUML diagram support
- ✅ Smart typography
- ✅ Code highlighting with copy buttons

Happy writing! 🚀`;
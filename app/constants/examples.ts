export const MARKDOWN_EXAMPLES = {
  'Basic Formatting': `# Basic Markdown Formatting

## Text Styles
This is **bold text** and this is *italic text*.
You can also use __underscores__ for _emphasis_.

## Lists
### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item

### Ordered List
1. First step
2. Second step
3. Third step

## Links and Images
[Visit GitHub](https://github.com)
![Alt text for image](https://via.placeholder.com/150)

## Blockquotes
> This is a blockquote.
> It can span multiple lines.

## Code
Inline \`code\` looks like this.

\`\`\`javascript
// Code block with syntax highlighting
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\``,

  'Tables': `# Tables Example

## Basic Table
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Aligned Table
| Left | Center | Right |
|:-----|:------:|------:|
| L1   | C1     | R1    |
| L2   | C2     | R2    |

## Multi-line Table (Advanced)
| Feature | Description |
|---------|-------------|
| Multi-line | This cell contains<br>multiple lines<br>of text |
| Formatting | **Bold**, *italic*, \`code\` |`,

  'Math (KaTeX)': `# Mathematical Expressions

## Inline Math
The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Einstein's famous equation: $E = mc^2$

## Block Math
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Matrix
$$
\\begin{bmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{bmatrix}
$$`,

  'Task Lists': `# Task Lists

## Project Tasks
- [x] Design the interface
- [x] Implement core features
- [ ] Write documentation
- [ ] Add tests
  - [x] Unit tests
  - [ ] Integration tests
- [ ] Deploy to production

## Shopping List
- [ ] Milk
- [x] Bread
- [x] Eggs
- [ ] Cheese`,

  'Mermaid Diagrams': `# Mermaid Diagrams

## Flowchart
\`\`\`mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
\`\`\`

## Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hi Alice!
    Alice->>Bob: How are you?
    Bob-->>Alice: I'm good, thanks!
\`\`\``,

  'PlantUML Diagrams': `# PlantUML Diagrams

## Class Diagram
@startuml
class User {
  -id: Long
  -name: String
  -email: String
  +login()
  +logout()
}

class Order {
  -orderId: Long
  -date: Date
  +calculateTotal()
}

User "1" --> "*" Order : places
@enduml

## Use Case
@startuml
left to right direction
actor User
rectangle System {
  User --> (Login)
  User --> (Browse Products)
  User --> (Make Purchase)
}
@enduml`,

  'Advanced Features': `# Advanced Markdown Features

## Table of Contents
Add \`[[toc]]\` to auto-generate a table of contents.

[[toc]]

## Footnotes
Here's a statement with a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists
Term 1
:   Definition for term 1

Term 2
:   Definition for term 2
:   Can have multiple definitions

## Abbreviations
The HTML spec is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

## Extended Formatting
- ==Highlighted text==
- ++Inserted text++
- H~2~O (subscript)
- X^2^ (superscript)

## Custom Attributes
This paragraph has a custom class{.custom-class}

[Link with attributes](https://example.com){target="_blank"}`
}
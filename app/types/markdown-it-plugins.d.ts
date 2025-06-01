// Type declarations for markdown-it plugins without official types

declare module 'markdown-it-sub' {
  import type MarkdownIt from 'markdown-it'
  const markdownItSub: MarkdownIt.PluginSimple
  export default markdownItSub
}

declare module 'markdown-it-sup' {
  import type MarkdownIt from 'markdown-it'
  const markdownItSup: MarkdownIt.PluginSimple
  export default markdownItSup
}

declare module 'markdown-it-ins' {
  import type MarkdownIt from 'markdown-it'
  const markdownItIns: MarkdownIt.PluginSimple
  export default markdownItIns
}

declare module 'markdown-it-mark' {
  import type MarkdownIt from 'markdown-it'
  const markdownItMark: MarkdownIt.PluginSimple
  export default markdownItMark
}

declare module 'markdown-it-abbr' {
  import type MarkdownIt from 'markdown-it'
  const markdownItAbbr: MarkdownIt.PluginSimple
  export default markdownItAbbr
}

declare module 'markdown-it-deflist' {
  import type MarkdownIt from 'markdown-it'
  const markdownItDeflist: MarkdownIt.PluginSimple
  export default markdownItDeflist
}

declare module 'markdown-it-attrs' {
  import type MarkdownIt from 'markdown-it'
  interface AttrsOptions {
    leftDelimiter?: string
    rightDelimiter?: string
    allowedAttributes?: string[]
  }
  const markdownItAttrs: MarkdownIt.PluginWithOptions<AttrsOptions>
  export default markdownItAttrs
}

declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it'
  interface TaskListOptions {
    enabled?: boolean
    label?: boolean
    labelAfter?: boolean
  }
  const markdownItTaskLists: MarkdownIt.PluginWithOptions<TaskListOptions>
  export default markdownItTaskLists
}

declare module 'markdown-it-table-of-contents' {
  import type MarkdownIt from 'markdown-it'
  interface TocOptions {
    includeLevel?: number[]
    containerClass?: string
    markerPattern?: RegExp
    listType?: 'ul' | 'ol'
    format?: (content: string, md: MarkdownIt) => string
    containerHeaderHtml?: string
    containerFooterHtml?: string
    transformLink?: (link: string) => string
  }
  const markdownItTableOfContents: MarkdownIt.PluginWithOptions<TocOptions>
  export default markdownItTableOfContents
}

declare module 'markdown-it-highlightjs' {
  import type MarkdownIt from 'markdown-it'
  import type { HLJSApi } from 'highlight.js'
  interface HighlightOptions {
    hljs: HLJSApi
    inline?: boolean
    auto?: boolean
    code?: boolean
    register?: null | Record<string, any>
  }
  const markdownItHighlightjs: MarkdownIt.PluginWithOptions<HighlightOptions>
  export default markdownItHighlightjs
}

declare module 'markdown-it-multimd-table' {
  import type MarkdownIt from 'markdown-it'
  interface MultimdTableOptions {
    multiline?: boolean
    rowspan?: boolean
    headerless?: boolean
    multibody?: boolean
    aotolabel?: boolean
  }
  const markdownItMultimdTable: MarkdownIt.PluginWithOptions<MultimdTableOptions>
  export default markdownItMultimdTable
}
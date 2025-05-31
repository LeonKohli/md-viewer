declare module 'marked-extended-tables' {
  import type { MarkedExtension } from 'marked'
  
  /**
   * marked-extended-tables - Extended Markdown tables for Marked.js
   * Adds support for advanced table features like column spanning
   */
  function markedExtendedTables(): MarkedExtension
  
  export default markedExtendedTables
}
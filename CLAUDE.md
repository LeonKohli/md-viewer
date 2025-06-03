# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Package manager: bun (required)
bun install          # Install dependencies
bun run dev          # Start development server (http://localhost:3000)
bun run build        # Build for production
bun run generate     # Generate static site
bun run preview      # Preview production build
```

## PWA Configuration

This app is configured as a Progressive Web App using `@vite-pwa/nuxt`:

- **Service Worker**: Auto-updates enabled for seamless updates
- **Offline Support**: Basic offline functionality with fallback to homepage
- **Icons**: 192x192 and 512x512 PWA icons in `/public`
- **Caching**: Google Fonts cached for 1 year, all assets precached
- **Installation**: Installable on desktop and mobile devices

### Testing PWA Features

1. Run `bun run dev` to test in development (PWA enabled in dev mode)
2. Open Chrome DevTools → Application tab → Service Workers
3. Check "Update on reload" for testing updates
4. Test offline functionality by going offline in Network tab

## Architecture Overview

This is a Nuxt 3-based Markdown editor with live preview, built using Vue 3 Composition API and TypeScript.

### Core Composables and Their Interactions

1. **`useMarkdownEditor`** - Central state management for the editor
   - Manages content, cursor position, selection, and statistics
   - Integrates with auto-save and recovery systems
   - Emits events for content changes

2. **`useAutoSave`** - Smart auto-save system inspired by Google Docs
   - Behavior-based saving (not just time-based)
   - Triggers: typing patterns, blur, paste, undo/redo
   - Network-aware with retry logic
   - Recovery prompt for unsaved content

3. **`useResizablePanels`** - Drag-to-resize editor/preview panels
   - Snap points at 25%, 33%, 50%, 67%, 75%
   - Double-click to reset to center
   - Focus modes for distraction-free editing

4. **`useScrollSync`** - Bidirectional scroll synchronization
   - Smart position calculation between editor and preview
   - Debounced for performance

### Key Architectural Patterns

- **State Management**: Global state via `useState`, local state with `ref`/`computed`
- **Markdown Processing**: markdown-it with extensive plugins (KaTeX, Mermaid, syntax highlighting)
- **UI Components**: shadcn-vue (Reka UI) components in `app/components/ui/`
- **Plugins**: Client-side plugins for Mermaid rendering and code copy buttons
- **Performance**: Debounced parsing (300ms), throttled saves (1s), lazy loading

### Important Files

- `app/plugins/markdown.ts` - Markdown-it configuration and plugins
- `app/constants/index.ts` - Application constants and defaults
- `nuxt.config.ts` - Core Nuxt configuration
- `app/composables/*` - All reusable logic lives here

### Development Guidelines

1. Always use TypeScript with `<script setup lang="ts">`
2. Leverage Nuxt auto-imports - no need to import Vue/Nuxt functions
3. Follow existing composable patterns for new features
4. Use VueUse utilities when available
5. Maintain responsive design with Tailwind CSS
6. Test with both light and dark modes
7. Ensure keyboard shortcuts don't conflict with existing ones (Ctrl/Cmd+S, Ctrl/Cmd+Shift+K)
8. When writing code, write comments that clarify why and how code works, not what it explicitly says or does
9. For design choices, refer to `design.md`
10. For Nuxt.js best practices, refer to `nuxtjs.md`
11. Use Puppeteer for iterating on website design and testing
12. When unsure about libraries or need more knowledge, use Context7 MCP server
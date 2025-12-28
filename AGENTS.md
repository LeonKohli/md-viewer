# PROJECT KNOWLEDGE BASE

**Generated:** 2025-12-28
**Commit:** 05dd4b0
**Branch:** main

## OVERVIEW

Nuxt 4 Markdown editor with live preview, GitHub Gist integration, scroll sync, and PWA support. Uses markdown-it with KaTeX/Mermaid, shadcn-vue components, and behavior-based auto-save.

## STRUCTURE

```
md-viewer/
├── app/                    # Nuxt 4 frontend (NOT root-level)
│   ├── composables/        # Core logic - see composables/AGENTS.md
│   ├── components/         # Vue components + ui/ (shadcn-vue)
│   ├── plugins/            # markdown.ts is THE markdown engine
│   ├── pages/              # index.vue = main editor, login.vue
│   └── constants/          # Defaults, examples, showcase content
├── server/                 # Nitro API - see server/AGENTS.md
├── shared/types/           # Types shared between app/ and server/
├── docs/                   # Design guidelines (design.md, nuxtjs.md)
└── public/                 # PWA icons, static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Editor behavior | `app/composables/useMarkdownEditor.ts` | Central orchestrator |
| Auto-save logic | `app/composables/useAutoSave.ts` | Behavior-based, not interval |
| Markdown rendering | `app/plugins/markdown.ts` | All plugins configured here |
| Scroll sync | `app/composables/useScrollSync.ts` | Source-line mapping |
| Gist CRUD | `server/api/gists/` | GitHub API integration |
| UI components | `app/components/ui/` | shadcn-vue (generated) |
| Add feature component | `app/components/` | Feature-specific Vue files |
| Shared types | `shared/types/` | Auto-imported app + server |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `useMarkdownEditor` | Composable | `app/composables/` | Central state, parsing, cursor |
| `useAutoSave` | Composable | `app/composables/` | Behavior-aware persistence |
| `useGists` | Composable | `app/composables/` | GitHub Gist integration |
| `useScrollSync` | Composable | `app/composables/` | Editor↔Preview sync |
| `renderMarkdown` | Function | `app/plugins/markdown.ts` | markdown-it pipeline |
| `$md` | Plugin | Nuxt app | Provided by markdown.ts |

### Module Dependencies

```
pages/index.vue (orchestrator)
    │
    ├── useMarkdownEditor ──uses──> useAutoSave
    │       │
    │       └── $md (markdown plugin)
    │
    ├── useGists ──────────────────> server/api/gists/
    │
    ├── useScrollSync
    │
    └── useResizablePanels
```

## CONVENTIONS

- **Nuxt 4 structure**: All frontend in `app/`, NOT root
- **Package manager**: bun only (never npm/yarn)
- **State**: `useState` for cross-component, `shallowRef` for complex objects
- **Types over interfaces**: Prefer `type X = {}` unless extending
- **No classes**: Functional/declarative patterns only
- **No enums**: Use `const X = {} as const` with union types
- **Tailwind**: Inline classes only, never `@apply`
- **Comments**: Explain WHY, not WHAT
- **No TODOs in production**: Clean up before merge

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Why Bad | Alternative |
|---------|---------|-------------|
| `npm install` | Project uses bun | `bun install` |
| Options API | Composition API only | `<script setup lang="ts">` |
| `interface X {}` | Types preferred here | `type X = {}` |
| `enum Status {}` | Forbidden | `const Status = {} as const` |
| `@apply` in CSS | Inline preferred | Direct Tailwind classes |
| Manual Vue imports | Auto-imported | Remove `import { ref }` |
| `as any`, `@ts-ignore` | No type suppression | Fix the types |

## UNIQUE STYLES

- **Behavior-based auto-save**: Triggers on typing patterns, paste, blur - not fixed intervals
- **Source-line scroll sync**: `data-source-line` attributes for precise mapping
- **URL-based sharing**: Gzip-compressed content in URL hash (no database)
- **useState event bus**: Numeric flags like `resetPanelsEvent` for cross-component triggers
- **Sync points**: `setSyncPoint()` tracks gist baseline for "unsaved changes" detection

## COMMANDS

```bash
bun install          # Install deps
bun run dev          # Dev server (localhost:3000)
bun run build        # Production build
bun run typecheck    # ALWAYS run before PR
bun run preview      # Preview prod build
```

## NOTES

- **shadcn-vue location**: Components in `app/components/ui/`, NOT `components/ui/`
- **Duplicate utils**: Both `app/lib/utils.ts` and `app/utils/utils.ts` have `cn()` - shadcn imports from lib/
- **PWA enabled in dev**: Test service worker with Chrome DevTools > Application
- **Workbox excludes**: Auth routes, API routes excluded from SW caching
- **Known TODOs**: `GistMenu.vue` has unimplemented rename/add/delete dialogs (lines 584-597)
- **Type conflict**: CLAUDE.md says "types > interfaces" but nuxtjs.mdc says opposite - follow CLAUDE.md

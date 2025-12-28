# COMPOSABLES KNOWLEDGE

Central state management and feature logic. No external store libraries - uses Nuxt `useState`.

## ARCHITECTURE

```
useMarkdownEditor (orchestrator)
    ├── useState('markdownContent') ←──shared with──→ useAutoSave
    │       ↓
    │   $md plugin (markdown-it)
    │
    ├── useGists
    │       └── useState('currentGist', 'lastSyncedContent')
    │
    ├── useScrollSync
    │       └── Source-line DOM mapping
    │
    └── useResizablePanels
            └── useState('resetPanelsEvent')
```

## COMPOSABLE ROLES

| Composable | Responsibility | Key Pattern |
|------------|----------------|-------------|
| `useMarkdownEditor` | Central state, parsing, cursor, stats | Orchestrates other composables |
| `useAutoSave` | Behavior-based persistence | Typing speed detection, multi-trigger |
| `useGists` | GitHub CRUD, sync points | Baseline tracking via `setSyncPoint()` |
| `useScrollSync` | Editor↔Preview scroll | `data-source-line` DOM mapping |
| `useResizablePanels` | Drag-to-resize panels | Snap points, focus mode |
| `useTableOfContents` | Heading extraction, active tracking | Watches `renderedHtml` |
| `useContentSharing` | URL-based sharing | Gzip in URL hash |
| `useCopyContent` | Copy as MD/HTML/text | Uses `$md` plugin |
| `useHtmlExport` | Standalone HTML export | Embedded styles, theme support |
| `useToast` | Notification queue | Global toast state |

## IMPLICIT COUPLING

Composables share state via identical `useState` keys:

```typescript
// In useMarkdownEditor:
const markdownContent = useState('markdownContent', () => '')

// In useAutoSave - SAME KEY means shared state:
const markdownContent = useState('markdownContent', () => '')
```

**Watch for**: Adding new `useState` with existing key = automatic coupling

## UNIQUE PATTERNS

### Behavior-Based Auto-Save (useAutoSave)

Not interval-based. Triggers adapt to user behavior:

```typescript
const SAVE_DELAYS = {
  IMMEDIATE: 0,      // Paste, undo
  TYPING_FAST: 500,  // Rapid keystrokes
  TYPING_SLOW: 1500, // Slow typing
  IDLE: 3000,        // User stopped
  AFTER_BLUR: 100,   // Lost focus
}
```

Detection: `changeSize > 100` chars = paste operation

### Sync Point Tracking (useGists)

Tracks "last known good" state from GitHub to show accurate "unsaved" indicators:

```typescript
setSyncPoint(content, filename)   // After load/save
hasGistChanges(content, filename) // Check against baseline
```

### Source-Line Scroll Sync (useScrollSync)

Uses `data-source-line` attributes injected by markdown plugin:

```typescript
// Build map: line number → DOM element offset
const scrollMap = new Map<number, number>()
// Scroll: find closest source line, interpolate position
```

### Event Bus via useState

Simple cross-component communication:

```typescript
// Emit: increment counter
resetPanelsEvent.value++

// Listen: watch for changes
watch(resetPanelsEvent, (timestamp) => { ... })
```

## ANTI-PATTERNS (THIS DIRECTORY)

| Pattern | Why Bad | Do Instead |
|---------|---------|------------|
| Direct localStorage | Bypasses auto-save | Use `useAutoSave.saveNow()` |
| `setInterval` for saves | Wastes resources | Behavior-based triggers |
| Pinia/Vuex stores | Unnecessary here | `useState` + composables |
| Tight coupling via imports | Hard to test | Couple via `useState` keys |

## ADDING NEW COMPOSABLE

1. Create `useFeatureName.ts`
2. Use `useState('featureKey', () => default)` for shared state
3. Return `readonly()` refs for external consumption
4. Wire in `pages/index.vue` (the orchestrator)

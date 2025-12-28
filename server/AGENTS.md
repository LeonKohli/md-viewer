# SERVER KNOWLEDGE

Nitro server for GitHub Gist API integration. Uses `nuxt-auth-utils` for OAuth.

## STRUCTURE

```
server/
├── api/gists/              # Gist CRUD endpoints
│   ├── index.get.ts        # GET /api/gists (list)
│   ├── index.post.ts       # POST /api/gists (create)
│   ├── [id].get.ts         # GET /api/gists/:id
│   ├── [id].patch.ts       # PATCH /api/gists/:id
│   └── [id].delete.ts      # DELETE /api/gists/:id
├── routes/auth/
│   └── github.get.ts       # OAuth callback handler
├── plugins/
│   └── session.ts          # Session configuration
└── utils/
    └── octokit.ts          # Authenticated Octokit factory
```

## AUTH FLOW

1. User clicks "Login with GitHub" → `/auth/github`
2. GitHub OAuth redirects back with code
3. `github.get.ts` exchanges code for token, creates session
4. Token stored in `session.secure.accessToken` (server-only)
5. All `/api/gists/*` routes use `getUserOctokit()` for auth

## KEY UTILITIES

### getUserOctokit (octokit.ts)

Creates authenticated Octokit with rate limiting:

```typescript
const octokit = await getUserOctokit(event)
const { data } = await octokit.rest.gists.list({ page: 1 })
```

Includes:
- Automatic retry (except 401/403/404/422)
- Rate limit handling with retry
- Secondary rate limit logging

### Session Access

```typescript
// Require auth (throws 401 if not logged in)
const session = await requireUserSession(event)
session.user.login        // GitHub username
session.secure.accessToken // OAuth token (server-only)
```

## API PATTERNS

All endpoints follow same structure:

```typescript
export default defineEventHandler(async (event) => {
  try {
    const octokit = await getUserOctokit(event)
    // ... use octokit.rest.gists.*
    return data
  } catch (error) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || 'Operation failed'
    })
  }
})
```

## OAUTH SCOPES

Configured in `github.get.ts`:
- `gist` - Full gist access (create, edit, delete)
- `user:email` - Email for identification

## ANTI-PATTERNS (THIS DIRECTORY)

| Pattern | Why Bad | Do Instead |
|---------|---------|------------|
| Raw `fetch` to GitHub | No auth/retry | Use `getUserOctokit()` |
| Store token in `session.user` | Exposed to client | Use `session.secure` |
| Skip `requireUserSession` | Unauthenticated access | Always require session |
| Catch without re-throw | Silent failures | Use `createError()` |

## PWA EXCLUSIONS

These routes are excluded from service worker caching (see `nuxt.config.ts`):
- `/auth/*` - OAuth flow
- `/api/*` - All API routes
- `/login` - Login page

export default defineNitroPlugin(() => {
  // Session validation hook - only validates on protected routes
  sessionHooks.hook('fetch', async (session, event) => {
    // Skip validation for auth routes and public routes
    const url = event.node.req.url || ''
    if (url.startsWith('/api/auth/') || url === '/login' || url === '/') {
      return
    }
    
    // Only validate session when accessing gist-related endpoints (future use)
    if (url.startsWith('/api/gists/') && !session.user?.accessToken) {
      await clearUserSession(event)
      throw createError({ 
        statusCode: 401, 
        statusMessage: 'GitHub authentication required to access gists' 
      })
    }
  })
})
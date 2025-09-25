export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['gist', 'user:email'] // 'gist' scope for full gist access (create, edit, delete)
  },
  async onSuccess(event, { user, tokens }) {
    if (!user?.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    const id = user.id.toString()
    await setUserSession(event, {
      user: {
        id,
        userId: id,
        email: user.email,
        name: user.name || user.login,
        login: user.login, // GitHub username for gist operations
        avatarUrl: user.avatar_url
      },
      secure: {
        accessToken: tokens.access_token // Store token securely - only accessible on server
      },
      loggedInAt: new Date()
    })

    console.log('GitHub OAuth success - gist access granted for:', user.login)

    // Redirect to home page after successful login
    return sendRedirect(event, '/')
  },
  async onError(event, error) {
    console.error('GitHub OAuth error:', error)
    // Clear any existing session on error
    await clearUserSession(event)
    // Redirect to login page with error
    return sendRedirect(event, '/login?error=oauth_failed')
  },
})
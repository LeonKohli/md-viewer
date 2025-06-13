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
        avatarUrl: user.avatar_url,
        accessToken: tokens.access_token // Store token for gist API calls
      },
      loggedInAt: new Date()
    })

    const session = await getUserSession(event)
    console.log('GitHub OAuth success - gist access granted for:', user.login)
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/?error=github_oauth_failed')
  }
})
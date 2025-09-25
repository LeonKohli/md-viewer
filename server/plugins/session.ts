export default defineNitroPlugin(() => {
  // Session hooks for logging and debugging
  sessionHooks.hook('fetch', async (session, event) => {
    // Log session fetch for debugging
    if (session.user) {
      console.log(`Session fetched for user: ${session.user.login}`)
    }
  })

  sessionHooks.hook('clear', async (session, event) => {
    // Log when user logs out
    if (session.user) {
      console.log(`User logged out: ${session.user.login}`)
    }
  })
})
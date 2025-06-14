// Type augmentation for nuxt-auth-utils
declare module '#auth-utils' {
  interface User {
    id: string
    userId: string
    email: string
    name?: string
    login: string
    avatarUrl: string
    accessToken: string
  }

  interface UserSession {
    loggedInAt: Date
  }

  interface SecureSessionData {
    // Add any secure fields if needed
  }
}

export {}
// Type augmentation for nuxt-auth-utils
declare module '#auth-utils' {
  interface User {
    id: string
    userId: string
    email: string
    name?: string
    login: string
    avatarUrl: string
  }

  interface UserSession {
    loggedInAt: Date
  }

  interface SecureSessionData {
    accessToken: string
  }
}

export {}
import type { User } from '@/types'

// Token Manager cho JWT Authentication
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_PROFILE_KEY = 'user_profile'

export const tokenManager = {
  setTokens: (accessToken: string, refreshToken?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, accessToken)
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))
    }
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(USER_PROFILE_KEY)
      if (!raw) {
        return null
      }

      try {
        return JSON.parse(raw) as User
      } catch {
        localStorage.removeItem(USER_PROFILE_KEY)
        return null
      }
    }

    return null
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_PROFILE_KEY)
    }
  },

  hasToken: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem(TOKEN_KEY)
    }
    return false
  },
}

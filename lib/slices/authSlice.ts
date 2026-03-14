import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { tokenManager } from '@/lib/token-manager'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: tokenManager.getUser(),
  isAuthenticated: tokenManager.hasToken(),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
      tokenManager.setUser(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      tokenManager.clearTokens()
    },
    setAuthTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      tokenManager.setTokens(action.payload.accessToken, action.payload.refreshToken)
      state.isAuthenticated = true
    },
  },
})

export const { setUser, setLoading, setError, logout, setAuthTokens } = authSlice.actions
export default authSlice.reducer

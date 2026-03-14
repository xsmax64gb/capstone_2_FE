// Auth Types
export interface User {
  id: string
  email: string
  name: string
  role?: string
  createdAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Notification Types
export type NotificationType = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  title: string
  message?: string
  type: NotificationType
  duration?: number
}

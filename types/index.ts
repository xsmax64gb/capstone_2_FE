// Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  role?: string;
  currentLevel?: string;
  exp?: number;
  onboardingDone?: boolean;
  placementScore?: number;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  otp: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string;
  otp: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Notification Types
export type NotificationType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  duration?: number;
}

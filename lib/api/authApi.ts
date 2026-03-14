import { baseApi } from './baseApi'
import { API_ENDPOINTS } from '@/config/api'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: data,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.ME,
        method: 'GET',
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
    }),

    refreshToken: builder.mutation<AuthResponse, string>({
      query: (refreshToken) => ({
        url: API_ENDPOINTS.AUTH.REFRESH,
        method: 'POST',
        body: { refreshToken },
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi

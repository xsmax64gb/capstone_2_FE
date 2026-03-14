import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/config/api'
import { tokenManager } from '@/lib/token-manager'

let isHandlingAuthError = false

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const baseQueryWithAuthGuard: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  const status = result.error?.status
  const isAuthError = status === 401 || status === 403

  if (isAuthError && typeof window !== 'undefined' && !isHandlingAuthError) {
    isHandlingAuthError = true
    tokenManager.clearTokens()

    window.dispatchEvent(
      new CustomEvent('elapp:notify', {
        detail: {
          title: 'Phiên đăng nhập đã hết hạn',
          message: 'Vui lòng đăng nhập lại để tiếp tục.',
          type: 'warning',
          duration: 2500,
        },
      })
    )

    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
      isHandlingAuthError = false
    }, 250)
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthGuard,
  endpoints: () => ({}),
})

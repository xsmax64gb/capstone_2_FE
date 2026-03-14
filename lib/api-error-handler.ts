// Utility để xử lý API errors một cách nhất quán

export interface ApiError {
  status: number
  message: string
  data?: any
}

export function handleApiError(error: any): ApiError {
  // RTK Query error format
  if (error?.status) {
    return {
      status: error.status,
      message: error.data?.message || getDefaultErrorMessage(error.status),
      data: error.data,
    }
  }

  // Network error
  if (error?.message === 'Network Error') {
    return {
      status: 0,
      message: 'Lỗi kết nối. Vui lòng kiểm tra đường truyền internet.',
    }
  }

  // Unknown error
  return {
    status: -1,
    message: 'Có lỗi xảy ra. Vui lòng thử lại.',
    data: error,
  }
}

export function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Yêu cầu không hợp lệ',
    401: 'Vui lòng đăng nhập lại',
    403: 'Bạn không có quyền truy cập',
    404: 'Không tìm thấy tài nguyên',
    409: 'Xung đột dữ liệu',
    422: 'Dữ liệu không hợp lệ',
    429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    500: 'Lỗi server. Vui lòng thử lại sau.',
    502: 'Lỗi gateway. Vui lòng thử lại sau.',
    503: 'Dịch vụ không khả dụng. Vui lòng thử lại sau.',
  }

  return messages[status] || 'Có lỗi xảy ra'
}

// Hook để xử lý async operations với error handling
export async function executeAsync<T>(
  promise: Promise<T>,
  onError?: (error: ApiError) => void
): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    const apiError = handleApiError(error)
    onError?.(apiError)
    return null
  }
}

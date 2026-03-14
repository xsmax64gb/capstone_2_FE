// Hook helper cho các async operations
import { useState, useCallback } from 'react'

interface UseFetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useFetch<T>(
  fetchFn: () => Promise<T>
): UseFetchState<T> & {
  execute: () => Promise<void>
  reset: () => void
} {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null })
    try {
      const result = await fetchFn()
      setState({ data: result, isLoading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      })
    }
  }, [fetchFn])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

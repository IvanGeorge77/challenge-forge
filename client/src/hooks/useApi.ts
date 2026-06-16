import { useState, useCallback } from 'react'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T, Args extends any[] = any[]>(
  apiFunc: (...args: Args) => Promise<T>,
  options?: UseApiOptions<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunc(...args)
        setData(result)
        if (options?.onSuccess) {
          options.onSuccess(result)
        }
        return result
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        if (options?.onError) {
          options.onError(e)
        }
        throw e
      } finally {
        setLoading(false)
      }
    },
    [apiFunc, options]
  )

  return { data, loading, error, execute, setData }
}

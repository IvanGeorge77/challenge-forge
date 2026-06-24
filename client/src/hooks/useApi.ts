import { useState, useCallback, useRef } from 'react'

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

  // Use refs to avoid stale closures & infinite re-renders when
  // options is an inline object literal
  const optionsRef = useRef(options)
  optionsRef.current = options

  const apiFuncRef = useRef(apiFunc)
  apiFuncRef.current = apiFunc

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFuncRef.current(...args)
        setData(result)
        if (optionsRef.current?.onSuccess) {
          optionsRef.current.onSuccess(result)
        }
        return result
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        if (optionsRef.current?.onError) {
          optionsRef.current.onError(e)
        }
        throw e
      } finally {
        setLoading(false)
      }
    },
    [] // stable — no deps needed since we use refs
  )

  return { data, loading, error, execute, setData }
}

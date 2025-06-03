"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "./use-auth"

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean
    onError?: (error: Error) => void
  } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(options.immediate !== false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    if (options.immediate !== false) {
      execute()
    }
  }, dependencies)

  const refetch = useCallback(() => execute(), [execute])

  return { data, loading, error, refetch, execute }
}

export function useStrategies() {
  const { user } = useAuth()

  return useAsyncData(() => (user ? apiClient.getStrategies(user.id) : Promise.resolve([])), [user?.id], {
    immediate: !!user,
  })
}

export function useBacktests() {
  const { user } = useAuth()

  return useAsyncData(() => (user ? apiClient.getBacktests(user.id) : Promise.resolve([])), [user?.id], {
    immediate: !!user,
  })
}

export function useMarketData(symbol: string, startDate: string, endDate: string) {
  return useAsyncData(() => apiClient.getMarketData(symbol, startDate, endDate), [symbol, startDate, endDate], {
    immediate: !!symbol,
  })
}

export function useTrades(options: any = {}) {
  const { user } = useAuth()

  return useAsyncData(
    () => (user ? apiClient.getTrades(user.id, options) : Promise.resolve([])),
    [user?.id, JSON.stringify(options)],
    { immediate: !!user },
  )
}

export function useAlerts(options: any = {}) {
  const { user } = useAuth()

  return useAsyncData(
    () => (user ? apiClient.getAlerts(user.id, options) : Promise.resolve([])),
    [user?.id, JSON.stringify(options)],
    { immediate: !!user },
  )
}

export function useMarketNews(symbol?: string) {
  return useAsyncData(() => apiClient.getMarketNews(symbol), [symbol])
}

export function useSocialSentiment(symbol?: string) {
  return useAsyncData(() => apiClient.getSocialSentiment(symbol), [symbol])
}

// Polling hook for real-time updates
export function usePolling<T>(fetcher: () => Promise<T>, interval: number, dependencies: any[] = []) {
  const { data, loading, error, execute } = useAsyncData(fetcher, dependencies)

  useEffect(() => {
    if (interval > 0) {
      const timer = setInterval(execute, interval)
      return () => clearInterval(timer)
    }
  }, [execute, interval])

  return { data, loading, error, refetch: execute }
}

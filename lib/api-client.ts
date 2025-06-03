"use client"

import { toast } from "@/components/ui/use-toast"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseUrl = "/api"
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  private async request<T>(endpoint: string, options: RequestInit = {}, cacheTtl?: number): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = `${options.method || "GET"}:${url}:${JSON.stringify(options.body)}`

    // Check cache for GET requests
    if ((!options.method || options.method === "GET") && cacheTtl) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
    }

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData)
      }

      const data = await response.json()

      // Cache successful GET requests
      if ((!options.method || options.method === "GET") && cacheTtl) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTtl,
        })
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError("Network error", 0, error)
    }
  }

  // Cache management
  invalidateCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request("/auth/me", {}, 5 * 60 * 1000) // 5 min cache
  }

  async signOut() {
    const result = await this.request("/auth/signout", { method: "POST" })
    this.invalidateCache()
    return result
  }

  // Strategies
  async getStrategies(userId: number) {
    return this.request(`/strategies?userId=${userId}`, {}, 2 * 60 * 1000)
  }

  async createStrategy(strategy: any) {
    const result = await this.request("/strategies", {
      method: "POST",
      body: JSON.stringify(strategy),
    })
    this.invalidateCache("strategies")
    return result
  }

  async updateStrategy(id: number, updates: any) {
    const result = await this.request(`/strategies/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    this.invalidateCache("strategies")
    return result
  }

  async deleteStrategy(id: number) {
    const result = await this.request(`/strategies/${id}`, { method: "DELETE" })
    this.invalidateCache("strategies")
    return result
  }

  // Backtests
  async getBacktests(userId: number) {
    return this.request(`/backtests?userId=${userId}`, {}, 1 * 60 * 1000)
  }

  async createBacktest(backtest: any) {
    const result = await this.request("/backtests", {
      method: "POST",
      body: JSON.stringify(backtest),
    })
    this.invalidateCache("backtests")
    return result
  }

  async getBacktestResults(id: number) {
    return this.request(`/backtests/${id}/results`, {}, 5 * 60 * 1000)
  }

  async deleteBacktest(id: number) {
    const result = await this.request(`/backtests/${id}`, { method: "DELETE" })
    this.invalidateCache("backtests")
    return result
  }

  // Market Data
  async getMarketData(symbol: string, startDate: string, endDate: string) {
    return this.request(
      `/market-data?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`,
      {},
      10 * 60 * 1000, // 10 min cache
    )
  }

  async getAssetList() {
    return this.request("/assets", {}, 60 * 60 * 1000) // 1 hour cache
  }

  // Trades
  async getTrades(userId: number, options: any = {}) {
    const params = new URLSearchParams({ userId: userId.toString(), ...options })
    return this.request(`/trades?${params}`, {}, 30 * 1000) // 30 sec cache
  }

  // Alerts
  async getAlerts(userId: number, options: any = {}) {
    const params = new URLSearchParams({ userId: userId.toString(), ...options })
    return this.request(`/alerts?${params}`, {}, 30 * 1000)
  }

  async markAlertAsRead(id: number) {
    const result = await this.request(`/alerts/${id}/read`, { method: "POST" })
    this.invalidateCache("alerts")
    return result
  }

  // Market Context Panel (MCP)
  async getMarketNews(symbol?: string, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (symbol) params.append("symbol", symbol)
    return this.request(`/market-context/news?${params}`, {}, 5 * 60 * 1000)
  }

  async getSocialSentiment(symbol?: string, limit = 20) {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (symbol) params.append("symbol", symbol)
    return this.request(`/market-context/sentiment?${params}`, {}, 2 * 60 * 1000)
  }

  async refreshMarketContext(symbol: string) {
    const result = await this.request("/market-context/refresh", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    })
    this.invalidateCache("market-context")
    return result
  }

  // User Settings
  async getUserSettings(userId: number) {
    return this.request(`/users/${userId}/settings`, {}, 10 * 60 * 1000)
  }

  async updateUserSettings(userId: number, settings: any) {
    const result = await this.request(`/users/${userId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    })
    this.invalidateCache("users")
    return result
  }
}

export const apiClient = new ApiClient()

// Error handler hook
export function useApiErrorHandler() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      toast({
        title: "API Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
    console.error("API Error:", error)
  }
}

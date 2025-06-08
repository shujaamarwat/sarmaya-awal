"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MarketContextPanel } from "@/components/market-context-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/hooks/use-auth"
import { useMarketData, usePolling } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [strategy, setStrategy] = useState("momentum")
  const [asset, setAsset] = useState("AAPL")
  const [rsiThreshold, setRsiThreshold] = useState([30, 70])
  const [maWindow, setMaWindow] = useState([20])
  const [enableStopLoss, setEnableStopLoss] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 11, 31),
  })
  const [isRunningBacktest, setIsRunningBacktest] = useState(false)
  const [metrics, setMetrics] = useState({
    sharpeRatio: 2.34,
    maxDrawdown: -8.5,
    winRate: 68.2,
    cagr: 15.7,
  })

  // Real-time data fetching with error handling
  const {
    data: marketData,
    loading: marketLoading,
    refetch: refetchMarket,
  } = useMarketData(asset, format(dateRange.from, "yyyy-MM-dd"), format(dateRange.to, "yyyy-MM-dd"))

  const {
    data: tradeHistory,
    loading: tradesLoading,
    refetch: refetchTrades,
  } = usePolling(
    () => {
      if (!user) return Promise.resolve([])
      return apiClient.getTrades(user.id, { limit: 10, symbol: asset !== "all" ? asset : undefined }).catch((error) => {
        console.error("Error fetching trades:", error)
        return []
      })
    },
    30000,
    [user?.id, asset],
  )

  // Enhanced chart data with proper signal generation
  const chartData =
    marketData?.map((item: any, index: number) => {
      const price = Number(item.close_price) || 0
      const prevPrice = index > 0 ? Number(marketData[index - 1].close_price) || price : price

      // Mock technical indicators
      const rsi = 50 + Math.sin(index * 0.3) * 20
      const ma = price * (0.98 + Math.sin(index * 0.1) * 0.04)
      const volume = Math.random() * 1000000 + 500000

      // Generate signals based on strategy
      let signal = null
      let signalStrength = 0

      if (strategy === "momentum") {
        if (rsi < rsiThreshold[0] && price > ma) {
          signal = "buy"
          signalStrength = Math.abs(rsi - rsiThreshold[0]) / 10
        } else if (rsi > rsiThreshold[1] && price < ma) {
          signal = "sell"
          signalStrength = Math.abs(rsi - rsiThreshold[1]) / 10
        }
      }

      return {
        date: format(new Date(item.date), "MMM dd"),
        price: price,
        ma: ma,
        rsi: rsi,
        volume: volume,
        signal: signal,
        signalStrength: signalStrength,
        priceChange: ((price - prevPrice) / prevPrice) * 100,
      }
    }) || []

  const handleRunBacktest = async () => {
    if (!user) return

    setIsRunningBacktest(true)

    try {
      const backtest = await apiClient.createBacktest({
        user_id: user.id,
        strategy_id: 1,
        name: `${strategy.toUpperCase()} - ${asset}`,
        asset,
        start_date: dateRange.from,
        end_date: dateRange.to,
        status: "pending",
        parameters: {
          strategy,
          rsiThreshold,
          maWindow: maWindow[0],
          enableStopLoss,
        },
      })

      // Simulate realistic backtest processing
      setTimeout(async () => {
        try {
          const results = {
            total_return: (Math.random() - 0.3) * 40, // -12% to 28%
            sharpe_ratio: Math.random() * 2.5 + 0.5, // 0.5 to 3.0
            max_drawdown: -(Math.random() * 12 + 3), // -3% to -15%
            win_rate: Math.random() * 30 + 55, // 55% to 85%
            total_trades: Math.floor(Math.random() * 80 + 30), // 30 to 110
          }

          setMetrics({
            sharpeRatio: Number(results.sharpe_ratio.toFixed(2)),
            maxDrawdown: Number(results.max_drawdown.toFixed(1)),
            winRate: Number(results.win_rate.toFixed(1)),
            cagr: Number(results.total_return.toFixed(1)),
          })

          toast({
            title: "🚀 Backtest Completed",
            description: `${strategy.toUpperCase()} strategy analysis finished. Return: ${results.total_return > 0 ? "+" : ""}${results.total_return.toFixed(1)}%`,
          })

          refetchTrades()
        } catch (error) {
          toast({
            title: "⚠️ Backtest Failed",
            description: "Quantum processing error occurred. Please retry.",
            variant: "destructive",
          })
        } finally {
          setIsRunningBacktest(false)
        }
      }, 4000)

      toast({
        title: "⚡ Backtest Initiated",
        description: "Quantum algorithms are processing your strategy...",
      })
    } catch (error) {
      toast({
        title: "❌ Initialization Error",
        description: "Failed to start backtest. Check system status.",
        variant: "destructive",
      })
      setIsRunningBacktest(false)
    }
  }

  const handleRefreshData = async () => {
    try {
      await Promise.all([refetchMarket(), refetchTrades()])
      toast({
        title: "🔄 Data Synchronized",
        description: "All quantum data streams updated successfully.",
      })
    } catch (error) {
      toast({
        title: "⚠️ Sync Failed",
        description: "Unable to refresh data streams. Check connection.",
        variant: "destructive",
      })
    }
  }

  const handleExport = (type: string) => {
    try {
      let data = ""
      let filename = ""

      if (type === "trades") {
        const headers = "Date,Action,Symbol,Price,Quantity,P&L\n"
        const rows =
          tradeHistory
            ?.map(
              (trade: any) =>
                `${format(new Date(trade.timestamp), "yyyy-MM-dd")},${trade.action},${trade.symbol},${trade.price},${trade.quantity},${trade.pnl || 0}`,
            )
            .join("\n") || ""
        data = headers + rows
        filename = `quantum-trades-${format(new Date(), "yyyy-MM-dd")}.csv`
      } else if (type === "performance") {
        const headers = "Date,Price,Signal,RSI,MA\n"
        const rows = chartData
          .map((row) => `${row.date},${row.price},${row.signal || ""},${row.rsi.toFixed(2)},${row.ma.toFixed(2)}`)
          .join("\n")
        data = headers + rows
        filename = `quantum-performance-${asset}-${format(new Date(), "yyyy-MM-dd")}.csv`
      }

      const blob = new Blob([data], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "📊 Export Complete",
        description: `${type} data exported to quantum storage.`,
      })
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Unable to export data. Try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* Main Dashboard Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold cyber-title">Quantum Trading Hub</h1>
              <p className="text-muted-foreground font-mono mt-2">
                Real-time algorithmic trading intelligence • {format(new Date(), "MMM dd, yyyy HH:mm")}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshData} className="cyber-button">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("performance")}
                className="hover:neon-glow-blue"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("trades")}
                className="hover:neon-glow-purple"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Strategy Configuration */}
              <Card className="metric-card">
                <CardHeader>
                  <CardTitle className="text-lg font-mono text-green-400 flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Strategy Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="strategy" className="font-mono text-xs text-muted-foreground">
                      ALGORITHM
                    </Label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger className="glass border-green-400/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-green-400/30">
                        <SelectItem value="momentum">Momentum Surge</SelectItem>
                        <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                        <SelectItem value="breakout">Breakout Hunter</SelectItem>
                        <SelectItem value="pairs-trading">Pairs Arbitrage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="asset" className="font-mono text-xs text-muted-foreground">
                      TARGET ASSET
                    </Label>
                    <Select value={asset} onValueChange={setAsset}>
                      <SelectTrigger className="glass border-blue-400/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-blue-400/30">
                        <SelectItem value="AAPL">AAPL • Apple Inc</SelectItem>
                        <SelectItem value="TSLA">TSLA • Tesla Inc</SelectItem>
                        <SelectItem value="MSFT">MSFT • Microsoft</SelectItem>
                        <SelectItem value="GOOGL">GOOGL • Alphabet</SelectItem>
                        <SelectItem value="BTC/USD">BTC/USD • Bitcoin</SelectItem>
                        <SelectItem value="ETH/USD">ETH/USD • Ethereum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-mono text-xs text-muted-foreground">TIME RANGE</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal glass border-purple-400/30"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                            : "Select range"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass border-purple-400/30" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card className="metric-card">
                <CardHeader>
                  <CardTitle className="text-lg font-mono text-blue-400 flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="font-mono text-xs text-muted-foreground">
                      RSI THRESHOLDS: {rsiThreshold[0]} - {rsiThreshold[1]}
                    </Label>
                    <Slider
                      value={rsiThreshold}
                      onValueChange={setRsiThreshold}
                      max={100}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="font-mono text-xs text-muted-foreground">MA WINDOW: {maWindow[0]} periods</Label>
                    <Slider value={maWindow} onValueChange={setMaWindow} max={200} min={5} step={1} className="mt-2" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stop-loss"
                      checked={enableStopLoss}
                      onCheckedChange={setEnableStopLoss}
                      className="data-[state=checked]:bg-green-400"
                    />
                    <Label htmlFor="stop-loss" className="font-mono text-xs">
                      STOP LOSS ENABLED
                    </Label>
                  </div>

                  <Button className="w-full cyber-button" onClick={handleRunBacktest} disabled={isRunningBacktest}>
                    {isRunningBacktest ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        EXECUTE BACKTEST
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="metric-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-mono text-muted-foreground">SHARPE RATIO</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400 data-label">{metrics.sharpeRatio}</div>
                    <p className="text-xs text-muted-foreground font-mono">+12% from last cycle</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-mono text-muted-foreground">MAX DRAWDOWN</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-400 data-label">{metrics.maxDrawdown}%</div>
                    <p className="text-xs text-muted-foreground font-mono">Improved by 2.1%</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-mono text-muted-foreground">WIN RATE</CardTitle>
                    <Activity className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400 data-label">{metrics.winRate}%</div>
                    <p className="text-xs text-muted-foreground font-mono">+5.3% from last cycle</p>
                  </CardContent>
                </Card>

                <Card className="metric-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-mono text-muted-foreground">CAGR</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400 data-label">
                      {metrics.cagr > 0 ? "+" : ""}
                      {metrics.cagr}%
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">+2.1% from last cycle</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Chart */}
              <Card className="chart-container">
                <CardHeader>
                  <CardTitle className="font-mono text-green-400 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Quantum Price Analysis • {asset}
                  </CardTitle>
                  <CardDescription className="font-mono">
                    Real-time price action with AI-generated trading signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-green-400" />
                        <p className="font-mono text-muted-foreground">Loading quantum data...</p>
                      </div>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        price: {
                          label: "Price",
                          color: "hsl(var(--chart-1))",
                        },
                        ma: {
                          label: "Moving Average",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[400px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 76, 36, 0.2)" />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255, 255, 255, 0.5)"
                            fontSize={12}
                            fontFamily="monospace"
                          />
                          <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} fontFamily="monospace" />
                          <ChartTooltip content={<ChartTooltipContent />} />

                          {/* Moving Average */}
                          <Line
                            type="monotone"
                            dataKey="ma"
                            stroke="var(--color-ma)"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            opacity={0.7}
                          />

                          {/* Price Line */}
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--color-price)"
                            strokeWidth={2}
                            dot={(props) => {
                              const { payload } = props
                              if (payload?.signal === "buy") {
                                return (
                                  <circle
                                    {...props}
                                    r={6}
                                    fill="#00ff88"
                                    stroke="#00ff88"
                                    strokeWidth={2}
                                    className="animate-pulse"
                                  />
                                )
                              } else if (payload?.signal === "sell") {
                                return (
                                  <circle
                                    {...props}
                                    r={6}
                                    fill="#ff4444"
                                    stroke="#ff4444"
                                    strokeWidth={2}
                                    className="animate-pulse"
                                  />
                                )
                              }
                              return <circle {...props} r={1} fill="var(--color-price)" />
                            }}
                          />

                          {/* RSI Reference Lines */}
                          <ReferenceLine y={rsiThreshold[0]} stroke="#ff4444" strokeDasharray="2 2" opacity={0.5} />
                          <ReferenceLine y={rsiThreshold[1]} stroke="#00ff88" strokeDasharray="2 2" opacity={0.5} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Trade Log */}
              <Card className="metric-card">
                <CardHeader>
                  <CardTitle className="font-mono text-blue-400 flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Quantum Trade Log
                  </CardTitle>
                  <CardDescription className="font-mono">
                    Real-time execution history and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tradesLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-white/5 animate-pulse rounded loading-pulse" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-400/20">
                          <TableHead className="font-mono text-muted-foreground">TIMESTAMP</TableHead>
                          <TableHead className="font-mono text-muted-foreground">ACTION</TableHead>
                          <TableHead className="font-mono text-muted-foreground">SYMBOL</TableHead>
                          <TableHead className="font-mono text-muted-foreground">PRICE</TableHead>
                          <TableHead className="font-mono text-muted-foreground">QTY</TableHead>
                          <TableHead className="text-right font-mono text-muted-foreground">P&L</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tradeHistory && tradeHistory.length > 0 ? (
                          tradeHistory.map((trade: any) => (
                            <TableRow key={trade.id} className="border-green-400/10 hover:bg-white/5">
                              <TableCell className="font-mono text-xs">
                                {format(new Date(trade.timestamp), "MM/dd HH:mm")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`font-mono ${
                                    trade.action === "BUY"
                                      ? "status-active"
                                      : "bg-gradient-to-r from-red-500 to-red-600"
                                  }`}
                                >
                                  {trade.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono font-medium">{trade.symbol}</TableCell>
                              <TableCell className="font-mono">${Number.parseFloat(trade.price).toFixed(2)}</TableCell>
                              <TableCell className="font-mono">{trade.quantity}</TableCell>
                              <TableCell
                                className={`text-right font-mono font-medium ${
                                  Number.parseFloat(trade.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                ${Number.parseFloat(trade.pnl || 0) >= 0 ? "+" : ""}
                                {Number.parseFloat(trade.pnl || 0).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono">
                              No quantum trades detected in current timeframe
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Market Context Panel */}
        <MarketContextPanel selectedAsset={asset} onAssetChange={setAsset} />
      </div>
    </DashboardLayout>
  )
}

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
  Sparkles,
  Zap,
} from "lucide-react"
import { format } from "date-fns"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
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

  // Real-time data fetching
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
    () =>
      user
        ? apiClient.getTrades(user.id, { limit: 10, symbol: asset !== "all" ? asset : undefined })
        : Promise.resolve([]),
    30000, // 30 seconds
    [user?.id, asset],
  )

  // Transform market data for chart with trading signals
  const chartData =
    marketData?.map((item: any, index: number) => {
      const price = item.close_price
      const prevPrice = index > 0 ? marketData[index - 1].close_price : price
      const rsi = 50 + Math.sin(index * 0.3) * 20 // Mock RSI calculation
      const ma = price * (0.98 + Math.sin(index * 0.1) * 0.04) // Mock moving average

      // Generate buy/sell signals based on strategy
      let signal = null
      if (strategy === "momentum" && rsi < rsiThreshold[0] && price > ma) {
        signal = "buy"
      } else if (strategy === "momentum" && rsi > rsiThreshold[1] && price < ma) {
        signal = "sell"
      }

      return {
        date: format(new Date(item.date), "MMM"),
        price: price,
        signal: signal,
        rsi: rsi,
        ma: ma,
      }
    }) || []

  const handleRunBacktest = async () => {
    if (!user) return

    setIsRunningBacktest(true)

    try {
      const backtest = await apiClient.createBacktest({
        user_id: user.id,
        strategy_id: 1, // In a real app, you'd get the actual strategy ID
        name: `${strategy} - ${asset}`,
        asset,
        start_date: dateRange.from,
        end_date: dateRange.to,
        status: "pending",
        parameters: {
          rsiThreshold,
          maWindow: maWindow[0],
          enableStopLoss,
        },
      })

      // Simulate backtest processing
      setTimeout(async () => {
        try {
          // In production, this would be handled by a background job
          const results = {
            total_return: Math.random() * 30 - 5, // -5% to 25%
            sharpe_ratio: Math.random() * 3 + 0.5, // 0.5 to 3.5
            max_drawdown: -(Math.random() * 15 + 2), // -2% to -17%
            win_rate: Math.random() * 40 + 50, // 50% to 90%
            total_trades: Math.floor(Math.random() * 100 + 20), // 20 to 120
          }

          // Update metrics
          setMetrics({
            sharpeRatio: results.sharpe_ratio,
            maxDrawdown: results.max_drawdown,
            winRate: results.win_rate,
            cagr: results.total_return,
          })

          toast({
            title: "Backtest Completed",
            description: `Your ${strategy} strategy backtest has finished successfully.`,
          })

          // Refresh trades to show new backtest results
          refetchTrades()
        } catch (error) {
          toast({
            title: "Backtest Failed",
            description: "There was an error processing your backtest.",
            variant: "destructive",
          })
        } finally {
          setIsRunningBacktest(false)
        }
      }, 3000) // 3 second simulation

      toast({
        title: "Backtest Started",
        description: "Your backtest is now running. Results will appear shortly.",
      })
    } catch (error) {
      toast({
        title: "Backtest Error",
        description: "Failed to start backtest. Please try again.",
        variant: "destructive",
      })
      setIsRunningBacktest(false)
    }
  }

  const handleRefreshData = async () => {
    try {
      await Promise.all([refetchMarket(), refetchTrades()])
      toast({
        title: "Data Refreshed",
        description: "All dashboard data has been updated.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = (type: string) => {
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
      filename = `sarmaya-awal-trades-${format(new Date(), "yyyy-MM-dd")}.csv`
    } else if (type === "performance") {
      const headers = "Date,Price,Signal\n"
      const rows = chartData.map((row) => `${row.date},${row.price},${row.signal || ""}`).join("\n")
      data = headers + rows
      filename = `sarmaya-awal-performance-${asset}-${format(new Date(), "yyyy-MM-dd")}.csv`
    }

    // Create and download file
    const blob = new Blob([data], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `${type} data has been exported successfully.`,
    })
  }

  return (
    <DashboardLayout>
      <div className="flex">
        {/* Main Dashboard Content */}
        <div className="flex-1 space-y-6 pr-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight gradient-text flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                Sarmaya Awal Dashboard
              </h1>
              <p className="text-muted-foreground">Monitor your quantitative trading strategies and performance</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefreshData} className="btn-hover-effect">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("performance")}
                className="btn-hover-effect"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("trades")} className="btn-hover-effect">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Strategy Selection */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-primary" />
                    Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="strategy">Strategy Type</Label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger className="bg-secondary border-secondary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momentum">Momentum</SelectItem>
                        <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="pairs-trading">Pairs Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="asset">Asset</Label>
                    <Select value={asset} onValueChange={setAsset}>
                      <SelectTrigger className="bg-secondary border-secondary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AAPL">AAPL</SelectItem>
                        <SelectItem value="TSLA">TSLA</SelectItem>
                        <SelectItem value="MSFT">MSFT</SelectItem>
                        <SelectItem value="GOOGL">GOOGL</SelectItem>
                        <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                        <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-secondary border-secondary"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from && dateRange.to
                            ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                            : "Pick a date range"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                          numberOfMonths={2}
                          className="bg-card"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>
                      RSI Thresholds: {rsiThreshold[0]} - {rsiThreshold[1]}
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
                    <Label>Moving Average Window: {maWindow[0]} days</Label>
                    <Slider value={maWindow} onValueChange={setMaWindow} max={200} min={5} step={1} className="mt-2" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="stop-loss" checked={enableStopLoss} onCheckedChange={setEnableStopLoss} />
                    <Label htmlFor="stop-loss">Enable Stop Loss</Label>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 btn-hover-effect"
                    onClick={handleRunBacktest}
                    disabled={isRunningBacktest}
                  >
                    {isRunningBacktest ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      "Run Backtest"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{metrics.sharpeRatio.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{metrics.maxDrawdown.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Improved by 2.1%</p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Activity className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">{metrics.winRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">+5.3% from last month</p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CAGR</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {metrics.cagr > 0 ? "+" : ""}
                      {metrics.cagr.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Price Chart with Signals
                  </CardTitle>
                  <CardDescription>{asset} price movement with entry/exit signals</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
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
                          <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(23, 23, 35, 0.9)",
                              borderColor: "hsl(var(--primary))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                            }}
                            itemStyle={{ color: "#fff" }}
                            labelStyle={{ color: "hsl(var(--primary))" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={(props) => {
                              const { payload } = props
                              if (payload?.signal === "buy") {
                                return <circle {...props} r={6} fill="#00ff88" stroke="#00ff88" className="pulse" />
                              } else if (payload?.signal === "sell") {
                                return <circle {...props} r={6} fill="#ff4444" stroke="#ff4444" className="pulse" />
                              }
                              return <circle {...props} r={2} fill="hsl(var(--chart-1))" />
                            }}
                            activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
                            fillOpacity={1}
                            fill="url(#priceGradient)"
                          />
                          <Line
                            type="monotone"
                            dataKey="ma"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Trade Log */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-primary" />
                    Recent Trades
                  </CardTitle>
                  <CardDescription>Latest trading activity and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {tradesLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden border border-border">
                      <Table>
                        <TableHeader className="bg-secondary">
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">P&L</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tradeHistory && tradeHistory.length > 0 ? (
                            tradeHistory.map((trade: any) => (
                              <TableRow key={trade.id} className="hover:bg-secondary/50">
                                <TableCell>{format(new Date(trade.timestamp), "yyyy-MM-dd")}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={trade.action === "BUY" ? "default" : "secondary"}
                                    className={trade.action === "BUY" ? "bg-primary" : "bg-accent"}
                                  >
                                    {trade.action}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{trade.symbol}</TableCell>
                                <TableCell>${Number.parseFloat(trade.price).toFixed(2)}</TableCell>
                                <TableCell>{trade.quantity}</TableCell>
                                <TableCell
                                  className={`text-right font-medium ${
                                    Number.parseFloat(trade.pnl || 0) >= 0 ? "text-primary" : "text-destructive"
                                  }`}
                                >
                                  ${Number.parseFloat(trade.pnl || 0) >= 0 ? "+" : ""}
                                  {Number.parseFloat(trade.pnl || 0).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                No trade history available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
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

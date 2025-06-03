"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, TrendingUp, TrendingDown, Activity, BarChart3, Download } from "lucide-react"
import { format } from "date-fns"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const performanceData = [
  { month: "Jan", portfolio: 100000, benchmark: 100000 },
  { month: "Feb", portfolio: 105000, benchmark: 102000 },
  { month: "Mar", portfolio: 108000, benchmark: 101500 },
  { month: "Apr", portfolio: 112000, benchmark: 104000 },
  { month: "May", portfolio: 115000, benchmark: 106000 },
  { month: "Jun", portfolio: 118000, benchmark: 105500 },
  { month: "Jul", portfolio: 122000, benchmark: 108000 },
  { month: "Aug", portfolio: 119000, benchmark: 107000 },
  { month: "Sep", portfolio: 125000, benchmark: 109000 },
  { month: "Oct", portfolio: 128000, benchmark: 111000 },
  { month: "Nov", portfolio: 132000, benchmark: 112000 },
  { month: "Dec", portfolio: 135000, benchmark: 114000 },
]

const strategyPerformance = [
  { strategy: "Momentum", return: 18.5, sharpe: 2.1, trades: 45 },
  { strategy: "Mean Reversion", return: 12.3, sharpe: 1.8, trades: 67 },
  { strategy: "Breakout", return: 15.7, sharpe: 1.9, trades: 32 },
  { strategy: "Pairs Trading", return: 8.9, sharpe: 1.4, trades: 23 },
]

const assetAllocation = [
  { name: "Equities", value: 65, color: "#00ff88" },
  { name: "Crypto", value: 20, color: "#00aaff" },
  { name: "Forex", value: 10, color: "#ffaa00" },
  { name: "Cash", value: 5, color: "#ff4444" },
]

const riskMetrics = [
  { metric: "Portfolio Beta", value: 1.15, benchmark: 1.0 },
  { metric: "Value at Risk (95%)", value: -2.3, benchmark: -1.8 },
  { metric: "Maximum Drawdown", value: -8.5, benchmark: -12.1 },
  { metric: "Volatility", value: 14.2, benchmark: 16.8 },
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("1Y")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 11, 31),
  })

  const handleExport = (type: string) => {
    // Create CSV data
    const csvData = performanceData.map((row) => `${row.month},${row.portfolio},${row.benchmark}`).join("\n")

    const headers = "Month,Portfolio,Benchmark\n"
    const csv = headers + csvData

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive performance analysis and risk metrics</p>
          </div>
          <div className="flex space-x-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Custom Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => handleExport("performance")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+35.2%</div>
              <p className="text-xs text-muted-foreground">+21.2% vs benchmark</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.89</div>
              <p className="text-xs text-muted-foreground">Above 1.5 target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">-8.5%</div>
              <p className="text-xs text-muted-foreground">Better than -12% limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">68.2%</div>
              <p className="text-xs text-muted-foreground">167 winning trades</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance vs Benchmark</CardTitle>
                <CardDescription>Cumulative returns comparison over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    portfolio: {
                      label: "Portfolio",
                      color: "hsl(var(--chart-1))",
                    },
                    benchmark: {
                      label: "Benchmark",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="portfolio"
                        stroke="var(--color-portfolio)"
                        strokeWidth={3}
                        name="Portfolio"
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="var(--color-benchmark)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Benchmark"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance Comparison</CardTitle>
                <CardDescription>Returns and risk metrics by strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    return: {
                      label: "Return %",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strategyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="strategy" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="return" fill="var(--color-return)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {strategyPerformance.map((strategy) => (
                <Card key={strategy.strategy}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{strategy.strategy}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Return</span>
                      <span className="font-medium text-primary">+{strategy.return}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe</span>
                      <span className="font-medium">{strategy.sharpe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Trades</span>
                      <span className="font-medium">{strategy.trades}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {riskMetrics.map((risk) => (
                <Card key={risk.metric}>
                  <CardHeader>
                    <CardTitle className="text-lg">{risk.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {risk.value > 0 ? "+" : ""}
                          {risk.value}
                          {risk.metric.includes("Beta") ? "" : "%"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Benchmark: {risk.benchmark > 0 ? "+" : ""}
                          {risk.benchmark}
                          {risk.metric.includes("Beta") ? "" : "%"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          risk.metric.includes("Drawdown") || risk.metric.includes("Risk")
                            ? Math.abs(risk.value) < Math.abs(risk.benchmark)
                              ? "default"
                              : "destructive"
                            : risk.value > risk.benchmark
                              ? "default"
                              : "destructive"
                        }
                        className={
                          risk.metric.includes("Drawdown") || risk.metric.includes("Risk")
                            ? Math.abs(risk.value) < Math.abs(risk.benchmark)
                              ? "bg-primary"
                              : ""
                            : risk.value > risk.benchmark
                              ? "bg-primary"
                              : ""
                        }
                      >
                        {risk.metric.includes("Drawdown") || risk.metric.includes("Risk")
                          ? Math.abs(risk.value) < Math.abs(risk.benchmark)
                            ? "Better"
                            : "Worse"
                          : risk.value > risk.benchmark
                            ? "Better"
                            : "Worse"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Current portfolio distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      allocation: {
                        label: "Allocation",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={assetAllocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>Breakdown by asset class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assetAllocation.map((asset) => (
                    <div key={asset.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: asset.color }} />
                        <span className="font-medium">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{asset.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          ${((asset.value / 100) * 135000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

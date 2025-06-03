"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Copy, Edit, Trash2, Play, Download } from "lucide-react"
import { format } from "date-fns"

const backtestHistory = [
  {
    id: 1,
    name: "Momentum Breakout - AAPL",
    strategy: "Momentum Breakout",
    asset: "AAPL",
    dateRange: "2024-01-01 to 2024-12-01",
    status: "completed",
    return: 15.7,
    sharpe: 2.34,
    maxDrawdown: -8.5,
    trades: 45,
    runDate: "2024-12-01 14:30",
  },
  {
    id: 2,
    name: "RSI Mean Reversion - TSLA",
    strategy: "Mean Reversion RSI",
    asset: "TSLA",
    dateRange: "2024-01-01 to 2024-11-30",
    status: "completed",
    return: 12.3,
    sharpe: 1.89,
    maxDrawdown: -12.1,
    trades: 67,
    runDate: "2024-11-30 09:15",
  },
  {
    id: 3,
    name: "Pairs Trading - AAPL/MSFT",
    strategy: "Pairs Trading",
    asset: "AAPL/MSFT",
    dateRange: "2024-06-01 to 2024-12-01",
    status: "running",
    return: 8.9,
    sharpe: 1.45,
    maxDrawdown: -6.2,
    trades: 23,
    runDate: "2024-12-01 16:45",
  },
  {
    id: 4,
    name: "Bollinger Bands - BTC/USD",
    strategy: "Bollinger Bands",
    asset: "BTC/USD",
    dateRange: "2024-03-01 to 2024-11-30",
    status: "failed",
    return: 0,
    sharpe: 0,
    maxDrawdown: 0,
    trades: 0,
    runDate: "2024-11-29 11:20",
  },
  {
    id: 5,
    name: "Momentum Breakout - GOOGL",
    strategy: "Momentum Breakout",
    asset: "GOOGL",
    dateRange: "2024-01-01 to 2024-10-31",
    status: "completed",
    return: 18.2,
    sharpe: 2.67,
    maxDrawdown: -7.8,
    trades: 38,
    runDate: "2024-10-31 13:45",
  },
]

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [strategyFilter, setStrategyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const filteredHistory = backtestHistory.filter((backtest) => {
    const matchesSearch =
      backtest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backtest.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backtest.asset.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStrategy = strategyFilter === "all" || backtest.strategy === strategyFilter
    const matchesStatus = statusFilter === "all" || backtest.status === statusFilter

    return matchesSearch && matchesStrategy && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backtest History</h1>
            <p className="text-muted-foreground">View and manage your previous backtest runs</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search backtests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Strategies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Strategies</SelectItem>
                  <SelectItem value="Momentum Breakout">Momentum Breakout</SelectItem>
                  <SelectItem value="Mean Reversion RSI">Mean Reversion RSI</SelectItem>
                  <SelectItem value="Pairs Trading">Pairs Trading</SelectItem>
                  <SelectItem value="Bollinger Bands">Bollinger Bands</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                      : "Date Range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Backtest Table */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
            <CardDescription>
              {filteredHistory.length} of {backtestHistory.length} backtests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Sharpe</TableHead>
                  <TableHead>Max DD</TableHead>
                  <TableHead>Trades</TableHead>
                  <TableHead>Run Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((backtest) => (
                  <TableRow key={backtest.id}>
                    <TableCell className="font-medium">{backtest.name}</TableCell>
                    <TableCell>{backtest.strategy}</TableCell>
                    <TableCell>{backtest.asset}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          backtest.status === "completed"
                            ? "default"
                            : backtest.status === "running"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          backtest.status === "completed"
                            ? "bg-primary"
                            : backtest.status === "running"
                              ? "bg-accent"
                              : ""
                        }
                      >
                        {backtest.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        backtest.return > 0 ? "text-primary" : backtest.return < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {backtest.return > 0 ? "+" : ""}
                      {backtest.return}%
                    </TableCell>
                    <TableCell>{backtest.sharpe}</TableCell>
                    <TableCell className="text-destructive">{backtest.maxDrawdown}%</TableCell>
                    <TableCell>{backtest.trades}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{backtest.runDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button size="sm" variant="ghost">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Backtests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backtestHistory.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+13.8%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Best Sharpe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.67</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">80%</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

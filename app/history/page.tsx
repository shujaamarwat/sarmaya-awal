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
import { useBacktests } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"

export default function HistoryPage() {
  const { user } = useAuth()
  const { data: backtests, loading, refetch } = useBacktests()
  const [searchTerm, setSearchTerm] = useState("")
  const [strategyFilter, setStrategyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const filteredHistory =
    backtests?.filter((backtest: any) => {
      const matchesSearch =
        backtest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        backtest.asset.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || backtest.status === statusFilter

      return matchesSearch && matchesStatus
    }) || []

  const handleExport = () => {
    const headers = "Name,Asset,Status,Return,Sharpe,Max DD,Trades,Date\n"
    const rows = filteredHistory
      .map(
        (backtest: any) =>
          `"${backtest.name}","${backtest.asset}","${backtest.status}","${backtest.total_return || 0}%","${backtest.sharpe_ratio || 0}","${backtest.max_drawdown || 0}%","${backtest.total_trades || 0}","${format(new Date(backtest.created_at), "yyyy-MM-dd")}"`,
      )
      .join("\n")

    const csv = headers + rows
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `backtest-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Backtest history has been exported successfully.",
    })
  }

  const handleDeleteBacktest = async (id: number, name: string) => {
    try {
      await apiClient.deleteBacktest(id)
      toast({
        title: "Backtest Deleted",
        description: `${name} has been deleted successfully.`,
      })
      refetch()
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Unable to delete backtest. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCloneBacktest = async (backtest: any) => {
    if (!user) return

    try {
      await apiClient.createBacktest({
        user_id: user.id,
        strategy_id: backtest.strategy_id,
        name: `${backtest.name} (Copy)`,
        asset: backtest.asset,
        start_date: backtest.start_date,
        end_date: backtest.end_date,
        status: "pending",
        parameters: backtest.parameters,
      })

      toast({
        title: "Backtest Cloned",
        description: `${backtest.name} has been cloned successfully.`,
      })
      refetch()
    } catch (error) {
      toast({
        title: "Clone Failed",
        description: "Unable to clone backtest. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3"></div>
          <div className="h-64 bg-muted animate-pulse rounded"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backtest History</h1>
            <p className="text-muted-foreground">View and manage your previous backtest runs</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleExport}>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
              {filteredHistory.length} of {backtests?.length || 0} backtests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
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
                {filteredHistory.map((backtest: any) => (
                  <TableRow key={backtest.id}>
                    <TableCell className="font-medium">{backtest.name}</TableCell>
                    <TableCell>{backtest.asset}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          backtest.status === "completed"
                            ? "default"
                            : backtest.status === "running"
                              ? "secondary"
                              : backtest.status === "failed"
                                ? "destructive"
                                : "outline"
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
                        (backtest.total_return || 0) > 0
                          ? "text-primary"
                          : (backtest.total_return || 0) < 0
                            ? "text-destructive"
                            : ""
                      }`}
                    >
                      {(backtest.total_return || 0) > 0 ? "+" : ""}
                      {(backtest.total_return || 0).toFixed(1)}%
                    </TableCell>
                    <TableCell>{(backtest.sharpe_ratio || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-destructive">{(backtest.max_drawdown || 0).toFixed(1)}%</TableCell>
                    <TableCell>{backtest.total_trades || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(backtest.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleCloneBacktest(backtest)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBacktest(backtest.id, backtest.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                      No backtest history available
                    </TableCell>
                  </TableRow>
                )}
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
              <div className="text-2xl font-bold">{backtests?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                +
                {(
                  (backtests?.reduce((sum: number, b: any) => sum + (b.total_return || 0), 0) || 0) /
                  (backtests?.length || 1)
                ).toFixed(1)}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Best Sharpe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...(backtests?.map((b: any) => b.sharpe_ratio || 0) || [0])).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {(
                  ((backtests?.filter((b: any) => b.status === "completed").length || 0) / (backtests?.length || 1)) *
                  100
                ).toFixed(0)}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

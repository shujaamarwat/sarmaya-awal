"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Play, Pause, Copy } from "lucide-react"
import { useStrategies } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/components/ui/use-toast"

interface Strategy {
  id: number
  name: string
  type: string
  description: string
  parameters: Record<string, any>
  status: "draft" | "active" | "paused"
  performance?: {
    return: number
    sharpe: number
    maxDrawdown: number
  }
  lastRun?: string
}

export function StrategyManager() {
  const { user } = useAuth()
  const { data: strategies, loading, refetch } = useStrategies()
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    parameters: {
      rsiThreshold: [30, 70],
      maWindow: 20,
      stopLoss: 0.05,
      takeProfit: 0.15,
      enableStopLoss: true,
      enableTakeProfit: true,
    },
  })

  const handleCreateStrategy = async () => {
    if (!user) return

    try {
      await apiClient.createStrategy({
        user_id: user.id,
        ...formData,
        status: "draft",
      })

      toast({
        title: "Strategy Created",
        description: `${formData.name} has been created successfully.`,
      })

      setIsCreateDialogOpen(false)
      setFormData({
        name: "",
        type: "",
        description: "",
        parameters: {
          rsiThreshold: [30, 70],
          maWindow: 20,
          stopLoss: 0.05,
          takeProfit: 0.15,
          enableStopLoss: true,
          enableTakeProfit: true,
        },
      })
      refetch()
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Unable to create strategy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStrategy = async () => {
    if (!editingStrategy) return

    try {
      await apiClient.updateStrategy(editingStrategy.id, formData)

      toast({
        title: "Strategy Updated",
        description: `${formData.name} has been updated successfully.`,
      })

      setIsEditDialogOpen(false)
      setEditingStrategy(null)
      refetch()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update strategy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStrategy = async (id: number, name: string) => {
    try {
      await apiClient.deleteStrategy(id)

      toast({
        title: "Strategy Deleted",
        description: `${name} has been deleted successfully.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Unable to delete strategy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (strategy: Strategy) => {
    const newStatus = strategy.status === "active" ? "paused" : "active"

    try {
      await apiClient.updateStrategy(strategy.id, { status: newStatus })

      toast({
        title: "Status Updated",
        description: `${strategy.name} is now ${newStatus}.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update strategy status.",
        variant: "destructive",
      })
    }
  }

  const handleCloneStrategy = async (strategy: Strategy) => {
    if (!user) return

    try {
      await apiClient.createStrategy({
        user_id: user.id,
        name: `${strategy.name} (Copy)`,
        type: strategy.type,
        description: strategy.description,
        parameters: strategy.parameters,
        status: "draft",
      })

      toast({
        title: "Strategy Cloned",
        description: `${strategy.name} has been cloned successfully.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "Clone Failed",
        description: "Unable to clone strategy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (strategy: Strategy) => {
    setEditingStrategy(strategy)
    setFormData({
      name: strategy.name,
      type: strategy.type,
      description: strategy.description,
      parameters: strategy.parameters,
    })
    setIsEditDialogOpen(true)
  }

  const StrategyForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Strategy Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., RSI Momentum"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">Strategy Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select strategy type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="momentum">Momentum</SelectItem>
            <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
            <SelectItem value="breakout">Breakout</SelectItem>
            <SelectItem value="arbitrage">Statistical Arbitrage</SelectItem>
            <SelectItem value="pairs-trading">Pairs Trading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your strategy logic..."
        />
      </div>

      {/* Parameters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Parameters</Label>

        <div className="space-y-2">
          <Label className="text-xs">
            RSI Thresholds: {formData.parameters.rsiThreshold[0]} - {formData.parameters.rsiThreshold[1]}
          </Label>
          <Slider
            value={formData.parameters.rsiThreshold}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                parameters: { ...prev.parameters, rsiThreshold: value },
              }))
            }
            max={100}
            min={0}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Moving Average Window: {formData.parameters.maWindow}</Label>
          <Slider
            value={[formData.parameters.maWindow]}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                parameters: { ...prev.parameters, maWindow: value[0] },
              }))
            }
            max={200}
            min={5}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Stop Loss: {(formData.parameters.stopLoss * 100).toFixed(1)}%</Label>
          <Slider
            value={[formData.parameters.stopLoss * 100]}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                parameters: { ...prev.parameters, stopLoss: value[0] / 100 },
              }))
            }
            max={20}
            min={1}
            step={0.1}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enable-stop-loss"
            checked={formData.parameters.enableStopLoss}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                parameters: { ...prev.parameters, enableStopLoss: checked },
              }))
            }
          />
          <Label htmlFor="enable-stop-loss" className="text-xs">
            Enable Stop Loss
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enable-take-profit"
            checked={formData.parameters.enableTakeProfit}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                parameters: { ...prev.parameters, enableTakeProfit: checked },
              }))
            }
          />
          <Label htmlFor="enable-take-profit" className="text-xs">
            Enable Take Profit
          </Label>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Strategy Management</h2>
          <p className="text-muted-foreground">Create, manage, and monitor your quantitative trading strategies</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Strategy</DialogTitle>
              <DialogDescription>Define your new quantitative trading strategy</DialogDescription>
            </DialogHeader>
            <StrategyForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStrategy}>Create Strategy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies?.map((strategy: Strategy) => (
          <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{strategy.name}</CardTitle>
                <Badge
                  variant={
                    strategy.status === "active" ? "default" : strategy.status === "paused" ? "secondary" : "outline"
                  }
                  className={
                    strategy.status === "active" ? "bg-primary" : strategy.status === "paused" ? "bg-accent" : ""
                  }
                >
                  {strategy.status}
                </Badge>
              </div>
              <CardDescription>{strategy.type}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>

              {/* Performance Metrics */}
              {strategy.performance && (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-primary">
                      {strategy.performance.return > 0 ? "+" : ""}
                      {strategy.performance.return}%
                    </div>
                    <div className="text-xs text-muted-foreground">Return</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{strategy.performance.sharpe}</div>
                    <div className="text-xs text-muted-foreground">Sharpe</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-destructive">{strategy.performance.maxDrawdown}%</div>
                    <div className="text-xs text-muted-foreground">Max DD</div>
                  </div>
                </div>
              )}

              {strategy.lastRun && <div className="text-xs text-muted-foreground">Last run: {strategy.lastRun}</div>}

              {/* Action Buttons */}
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleToggleStatus(strategy)}>
                  {strategy.status === "active" ? (
                    <Pause className="mr-1 h-3 w-3" />
                  ) : (
                    <Play className="mr-1 h-3 w-3" />
                  )}
                  {strategy.status === "active" ? "Pause" : "Run"}
                </Button>

                <Button size="sm" variant="outline" onClick={() => openEditDialog(strategy)}>
                  <Edit className="h-3 w-3" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => handleCloneStrategy(strategy)}>
                  <Copy className="h-3 w-3" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Strategy</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{strategy.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteStrategy(strategy.id, strategy.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Strategy</DialogTitle>
            <DialogDescription>Modify your trading strategy parameters</DialogDescription>
          </DialogHeader>
          <StrategyForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStrategy}>Update Strategy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

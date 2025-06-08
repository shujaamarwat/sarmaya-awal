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
import { Plus, Edit, Trash2, Play, Pause, Copy, Zap, Brain, Target } from "lucide-react"
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

  const resetForm = () => {
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
  }

  const handleCreateStrategy = async () => {
    if (!user) return

    try {
      await apiClient.createStrategy({
        user_id: user.id,
        ...formData,
        status: "draft",
      })

      toast({
        title: "🚀 Strategy Created",
        description: `${formData.name} quantum algorithm initialized successfully.`,
      })

      setIsCreateDialogOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      toast({
        title: "❌ Creation Failed",
        description: "Unable to initialize strategy. Check quantum parameters.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStrategy = async () => {
    if (!editingStrategy) return

    try {
      await apiClient.updateStrategy(editingStrategy.id, formData)

      toast({
        title: "⚡ Strategy Updated",
        description: `${formData.name} quantum parameters recalibrated.`,
      })

      setIsEditDialogOpen(false)
      setEditingStrategy(null)
      refetch()
    } catch (error) {
      toast({
        title: "⚠️ Update Failed",
        description: "Unable to recalibrate strategy. Try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStrategy = async (id: number, name: string) => {
    try {
      await apiClient.deleteStrategy(id)

      toast({
        title: "🗑️ Strategy Deleted",
        description: `${name} quantum algorithm removed from system.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "❌ Deletion Failed",
        description: "Unable to remove strategy. Check system permissions.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (strategy: Strategy) => {
    const newStatus = strategy.status === "active" ? "paused" : "active"

    try {
      await apiClient.updateStrategy(strategy.id, { status: newStatus })

      toast({
        title: newStatus === "active" ? "🟢 Strategy Activated" : "⏸️ Strategy Paused",
        description: `${strategy.name} is now ${newStatus}.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "⚠️ Status Update Failed",
        description: "Unable to change strategy status. Try again.",
        variant: "destructive",
      })
    }
  }

  const handleCloneStrategy = async (strategy: Strategy) => {
    if (!user) return

    try {
      await apiClient.createStrategy({
        user_id: user.id,
        name: `${strategy.name} (Quantum Clone)`,
        type: strategy.type,
        description: strategy.description,
        parameters: strategy.parameters,
        status: "draft",
      })

      toast({
        title: "🔄 Strategy Cloned",
        description: `${strategy.name} quantum duplicate created.`,
      })

      refetch()
    } catch (error) {
      toast({
        title: "❌ Clone Failed",
        description: "Unable to duplicate strategy. Try again.",
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
    <div className="grid gap-6 py-4">
      <div className="grid gap-2">
        <Label htmlFor="strategy-name" className="font-mono text-xs text-green-400">
          STRATEGY NAME
        </Label>
        <Input
          id="strategy-name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Quantum RSI Momentum"
          className="glass border-green-400/30 font-mono"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="strategy-type" className="font-mono text-xs text-blue-400">
          ALGORITHM TYPE
        </Label>
        <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
          <SelectTrigger className="glass border-blue-400/30">
            <SelectValue placeholder="Select quantum algorithm" />
          </SelectTrigger>
          <SelectContent className="glass border-blue-400/30">
            <SelectItem value="momentum">Momentum Surge</SelectItem>
            <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
            <SelectItem value="breakout">Breakout Hunter</SelectItem>
            <SelectItem value="arbitrage">Statistical Arbitrage</SelectItem>
            <SelectItem value="pairs-trading">Pairs Trading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="strategy-description" className="font-mono text-xs text-purple-400">
          DESCRIPTION
        </Label>
        <Textarea
          id="strategy-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your quantum trading logic..."
          className="glass border-purple-400/30 font-mono"
          rows={3}
        />
      </div>

      {/* Quantum Parameters */}
      <div className="space-y-6 p-4 glass rounded-lg border border-orange-400/30">
        <Label className="text-sm font-mono text-orange-400 flex items-center">
          <Target className="mr-2 h-4 w-4" />
          QUANTUM PARAMETERS
        </Label>

        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">
            RSI THRESHOLDS: {formData.parameters.rsiThreshold[0]} - {formData.parameters.rsiThreshold[1]}
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
            className="[&_[role=slider]]:bg-green-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">
            MA WINDOW: {formData.parameters.maWindow} periods
          </Label>
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
            className="[&_[role=slider]]:bg-blue-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono text-muted-foreground">
            STOP LOSS: {(formData.parameters.stopLoss * 100).toFixed(1)}%
          </Label>
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
            className="[&_[role=slider]]:bg-purple-400"
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
            className="data-[state=checked]:bg-green-400"
          />
          <Label htmlFor="enable-stop-loss" className="text-xs font-mono text-muted-foreground">
            ENABLE STOP LOSS
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
            className="data-[state=checked]:bg-blue-400"
          />
          <Label htmlFor="enable-take-profit" className="text-xs font-mono text-muted-foreground">
            ENABLE TAKE PROFIT
          </Label>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="metric-card loading-pulse">
            <CardHeader>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded"></div>
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
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
          <h2 className="text-3xl font-bold cyber-title">Quantum Strategy Hub</h2>
          <p className="text-muted-foreground font-mono mt-2">
            Create, manage, and deploy AI-powered trading algorithms
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cyber-button">
              <Plus className="mr-2 h-4 w-4" />
              CREATE STRATEGY
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass border-green-400/30">
            <DialogHeader>
              <DialogTitle className="font-mono text-green-400 flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Initialize Quantum Strategy
              </DialogTitle>
              <DialogDescription className="font-mono text-muted-foreground">
                Configure your new AI trading algorithm parameters
              </DialogDescription>
            </DialogHeader>
            <StrategyForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="font-mono">
                CANCEL
              </Button>
              <Button onClick={handleCreateStrategy} className="cyber-button">
                <Zap className="mr-2 h-4 w-4" />
                INITIALIZE
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies?.map((strategy: Strategy) => (
          <Card key={strategy.id} className="metric-card hover:neon-glow-blue transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono text-green-400">{strategy.name}</CardTitle>
                <Badge
                  className={`font-mono ${
                    strategy.status === "active"
                      ? "status-active"
                      : strategy.status === "paused"
                        ? "status-paused"
                        : "status-draft"
                  }`}
                >
                  {strategy.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="font-mono text-blue-400">{strategy.type}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2 font-mono">{strategy.description}</p>

              {/* Performance Metrics */}
              {strategy.performance && (
                <div className="grid grid-cols-3 gap-2 text-sm p-3 glass rounded-lg border border-green-400/20">
                  <div className="text-center">
                    <div className="font-mono font-medium text-green-400">
                      {strategy.performance.return > 0 ? "+" : ""}
                      {strategy.performance.return}%
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">RETURN</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-medium text-blue-400">{strategy.performance.sharpe}</div>
                    <div className="text-xs text-muted-foreground font-mono">SHARPE</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono font-medium text-red-400">{strategy.performance.maxDrawdown}%</div>
                    <div className="text-xs text-muted-foreground font-mono">MAX DD</div>
                  </div>
                </div>
              )}

              {strategy.lastRun && (
                <div className="text-xs text-muted-foreground font-mono">LAST RUN: {strategy.lastRun}</div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 font-mono hover:neon-glow-blue"
                  onClick={() => handleToggleStatus(strategy)}
                >
                  {strategy.status === "active" ? (
                    <>
                      <Pause className="mr-1 h-3 w-3" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3 w-3" />
                      RUN
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(strategy)}
                  className="hover:neon-glow-purple"
                >
                  <Edit className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCloneStrategy(strategy)}
                  className="hover:neon-glow-blue"
                >
                  <Copy className="h-3 w-3" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="hover:bg-red-500/20 hover:border-red-500/50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border-red-400/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-mono text-red-400">Delete Quantum Strategy</AlertDialogTitle>
                      <AlertDialogDescription className="font-mono">
                        Are you sure you want to delete "{strategy.name}"? This quantum algorithm will be permanently
                        removed from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-mono">CANCEL</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteStrategy(strategy.id, strategy.name)}
                        className="bg-red-500 text-white hover:bg-red-600 font-mono"
                      >
                        DELETE
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
        <DialogContent className="sm:max-w-[600px] glass border-blue-400/30">
          <DialogHeader>
            <DialogTitle className="font-mono text-blue-400 flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Recalibrate Strategy
            </DialogTitle>
            <DialogDescription className="font-mono text-muted-foreground">
              Modify quantum algorithm parameters and configuration
            </DialogDescription>
          </DialogHeader>
          <StrategyForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-mono">
              CANCEL
            </Button>
            <Button onClick={handleUpdateStrategy} className="cyber-button">
              <Zap className="mr-2 h-4 w-4" />
              UPDATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

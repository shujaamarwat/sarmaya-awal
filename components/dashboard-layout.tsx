"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Bell,
  History,
  Menu,
  Settings,
  TrendingUp,
  User,
  LogOut,
  Brain,
  Home,
  Loader2,
  Zap,
  Activity,
  Database,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, color: "text-green-400" },
  { name: "Strategies", href: "/strategies", icon: Brain, color: "text-blue-400" },
  { name: "Backtest History", href: "/history", icon: History, color: "text-purple-400" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, color: "text-orange-400" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-gray-400" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const pathname = usePathname()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/alerts?userId=${user.id}&unreadOnly=true&limit=5`)
        if (response.ok) {
          const userAlerts = await response.json()
          setAlerts(Array.isArray(userAlerts) ? userAlerts : [])
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
        setAlerts([])
      }
    }

    fetchAlerts()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background cyber-grid">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-green-400" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-green-400/20"></div>
          </div>
          <p className="text-muted-foreground cyber-title">Initializing Quantum Systems...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background cyber-grid">
        <div className="flex flex-col items-center space-y-4">
          <Zap className="h-8 w-8 text-green-400 animate-pulse" />
          <p className="text-muted-foreground">Redirecting to authentication...</p>
        </div>
      </div>
    )
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} glass border-r border-green-400/20`}>
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-green-400/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div className="absolute inset-0 h-8 w-8 animate-pulse rounded-full bg-green-400/20"></div>
          </div>
          <div>
            <span className="text-xl font-bold holographic">QuantTrade</span>
            <div className="text-xs text-green-400 font-mono">PRO v3.0</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-green-400/20 to-blue-400/20 text-green-400 neon-glow-blue"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? item.color : "group-hover:" + item.color}`} />
              <span className="font-mono">{item.name}</span>
              {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-green-400/20">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">SYSTEM STATUS</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-green-400 font-mono">ONLINE</span>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CPU</span>
              <span className="text-blue-400 font-mono">23%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Memory</span>
              <span className="text-purple-400 font-mono">67%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background cyber-grid">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-background/95 backdrop-blur-xl">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 glass border-b border-green-400/20">
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Real-time indicators */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="text-xs font-mono text-green-400">LIVE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-mono text-muted-foreground">SYNC</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                  <Bell className="h-5 w-5" />
                  {alerts.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-green-400 to-blue-400 animate-pulse">
                      {alerts.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 glass border-green-400/20">
                <DropdownMenuLabel className="font-mono text-green-400">SYSTEM ALERTS</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-400/20" />
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <DropdownMenuItem key={alert.id} className="hover:bg-white/5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{alert.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <p className="text-sm text-muted-foreground font-mono">No active alerts</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <div className="relative">
                    <User className="h-5 w-5" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-background"></div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-green-400/20">
                <DropdownMenuLabel className="font-mono text-green-400">USER PROFILE</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-green-400/20" />
                <DropdownMenuItem disabled className="font-mono">
                  <User className="mr-2 h-4 w-4" />
                  {user.name}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="font-mono hover:bg-white/5">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-green-400/20" />
                <DropdownMenuItem onClick={signOut} className="font-mono hover:bg-red-500/10 text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-background via-background to-green-400/5">
          {children}
        </main>
      </div>
    </div>
  )
}

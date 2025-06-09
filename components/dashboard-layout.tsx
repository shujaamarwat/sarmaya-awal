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
  User,
  LogOut,
  Brain,
  Home,
  Loader2,
  Wallet,
  LineChart,
  Globe,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Strategies", href: "/strategies", icon: Brain },
  { name: "Backtest History", href: "/history", icon: History },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Market Context", href: "/market-context", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
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
          setAlerts(userAlerts)
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
      }
    }

    fetchAlerts()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#48f43f]" />
          <p className="text-muted-foreground font-light">Loading Sarmaya Awal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground font-light">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-card border-r border-border/30">
        <div className="flex items-center h-16 px-6 border-b border-border/30">
          <span className="text-xl font-medium gradient-text">Sarmaya Awal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-light rounded-md transition-colors ${
                  isActive
                    ? "text-[#48f43f] bg-secondary border-l-2 border-[#48f43f] pl-[11px] h-12"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#48f43f]" : ""}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/30">
          <div className="p-3 rounded-md bg-secondary/50">
            <div className="flex items-center mb-2">
              <Wallet className="h-4 w-4 text-[#48f43f] mr-2" />
              <span className="text-xs font-light">Portfolio Value</span>
            </div>
            <div className="text-lg font-medium">$1,245,678</div>
            <div className="flex items-center mt-1">
              <LineChart className="h-3 w-3 text-[#48f43f] mr-1" />
              <span className="text-xs text-[#48f43f]">+12.4% (30d)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border/30">
          <div className="flex items-center">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border/30">
                <div className="flex flex-col h-full">
                  <div className="flex items-center h-16 px-6 border-b border-border/30">
                    <span className="text-xl font-medium gradient-text">Sarmaya Awal</span>
                  </div>

                  <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-3 py-3 text-sm font-light rounded-md transition-colors ${
                            isActive
                              ? "text-[#48f43f] bg-secondary border-l-2 border-[#48f43f] pl-[11px] h-12"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#48f43f]" : ""}`} />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div className="ml-4 lg:hidden">
              <span className="text-lg font-medium">Sarmaya Awal</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover-effect">
                  <Bell className="h-5 w-5" />
                  {alerts.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#48f43f] text-black">
                      {alerts.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <DropdownMenuItem key={alert.id}>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover-effect">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {user.name}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

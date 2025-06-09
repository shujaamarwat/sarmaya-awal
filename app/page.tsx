import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Shield, BarChart3, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">Sarmaya Awal</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold gradient-text">Sarmaya Awal</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional quantitative trading platform designed for modern traders and analysts
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Trading
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Why Choose Sarmaya Awal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI-Powered Strategies</CardTitle>
                <CardDescription>Advanced quantitative algorithms and machine learning models</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leverage cutting-edge AI technology to create and optimize your trading strategies with Sarmaya Awal's
                  intelligent platform.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>Comprehensive market analysis and performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor your portfolio performance with real-time data visualization and advanced analytics tools
                  built into Sarmaya Awal.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>Enterprise-grade security and 99.9% uptime guarantee</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Trade with confidence knowing your data and investments are protected by Sarmaya Awal's robust
                  security infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-bold gradient-text">Sarmaya Awal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Sarmaya Awal. All rights reserved. Professional trading platform.
          </p>
        </div>
      </footer>
    </div>
  )
}

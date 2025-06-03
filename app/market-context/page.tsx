"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MarketContextPanel } from "@/components/market-context-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Filter, Zap, Shield, BarChart3 } from "lucide-react"

export default function MarketContextPage() {
  return (
    <DashboardLayout>
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 space-y-6 pr-4">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Market Context Panel</h1>
            <p className="text-muted-foreground">
              AI-powered market intelligence with real-time news and sentiment analysis
            </p>
          </div>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced sentiment analysis using machine learning models to process news articles, social media
                  posts, and market commentary with confidence scoring.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">Real-Time Intelligence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Live feeds from multiple sources including financial news, X/Twitter sentiment, and Reddit discussions
                  with automatic relevance scoring and filtering.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Advanced Filtering</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sophisticated content filters by source, sentiment, timeframe, and relevance with keyword highlighting
                  and smart categorization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Smart Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intelligent notification system for sentiment flips, breaking news, and significant market events with
                  customizable thresholds.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Content Moderation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in content filtering to flag misleading information, spam, and low-quality sources with source
                  credibility weighting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Sentiment Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive charts showing sentiment shifts over time correlated with price movements and trading
                  volume for better market timing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Technical Features */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>Advanced features powering the Market Context Panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      API
                    </Badge>
                    Multi-Source Data Integration
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Connects to NewsAPI, X/Twitter API, Reddit API, and financial data providers for comprehensive
                    market coverage.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      AI
                    </Badge>
                    Natural Language Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced NLP models for sentiment analysis, entity recognition, and relevance scoring with
                    confidence metrics.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      CACHE
                    </Badge>
                    Intelligent Caching
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Smart caching system with TTL management to balance real-time updates with performance optimization.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Badge variant="outline" className="mr-2">
                      REAL-TIME
                    </Badge>
                    Live Updates
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    WebSocket connections and polling mechanisms for real-time data updates with configurable refresh
                    intervals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
              <CardDescription>Get started with the Market Context Panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">1</Badge>
                  <div>
                    <h4 className="font-medium">Open the Panel</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the filter icon on the right side of any dashboard page to open the Market Context Panel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">2</Badge>
                  <div>
                    <h4 className="font-medium">Select Your Asset</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter a stock symbol (e.g., AAPL, TSLA) to filter news and sentiment data for that specific asset.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">3</Badge>
                  <div>
                    <h4 className="font-medium">Configure Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the filter controls to toggle news sources, sentiment types, and timeframes to focus on
                      relevant information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">4</Badge>
                  <div>
                    <h4 className="font-medium">Monitor Real-Time Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      The panel automatically refreshes with new data. Use the refresh button for manual updates or to
                      fetch the latest information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Context Panel */}
        <MarketContextPanel selectedAsset="AAPL" />
      </div>
    </DashboardLayout>
  )
}

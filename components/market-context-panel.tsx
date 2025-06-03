"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Filter,
  TwitterIcon,
  MessageCircle,
} from "lucide-react"
import { usePolling } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface MarketContextPanelProps {
  selectedAsset?: string
  onAssetChange?: (asset: string) => void
}

export function MarketContextPanel({ selectedAsset = "AAPL", onAssetChange }: MarketContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    sources: {
      news: true,
      twitter: true,
      reddit: true,
    },
    sentiment: "all", // all, bullish, bearish, neutral
    timeframe: "24h",
  })
  const [refreshing, setRefreshing] = useState(false)

  // Fetch data with polling for real-time updates
  const {
    data: newsData,
    loading: newsLoading,
    refetch: refetchNews,
  } = usePolling(
    () => apiClient.getMarketNews(selectedAsset),
    30000, // 30 seconds
  )

  const {
    data: sentimentData,
    loading: sentimentLoading,
    refetch: refetchSentiment,
  } = usePolling(
    () => apiClient.getSocialSentiment(selectedAsset),
    15000, // 15 seconds
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await apiClient.refreshMarketContext(selectedAsset)
      await Promise.all([refetchNews(), refetchSentiment()])
      toast({
        title: "Market Context Updated",
        description: "Latest data has been fetched successfully.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch latest market data.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getSentimentIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (score < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-yellow-500" />
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return "text-green-500"
    if (score < -0.1) return "text-red-500"
    return "text-yellow-500"
  }

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "twitter":
      case "x":
        return <TwitterIcon className="h-4 w-4" />
      case "reddit":
        return <MessageCircle className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const filteredNews =
    newsData?.filter((item: any) => {
      if (!filters.sources.news && item.source === "news") return false
      return true
    }) || []

  const filteredSentiment =
    sentimentData?.filter((item: any) => {
      if (!filters.sources.twitter && item.source === "twitter") return false
      if (!filters.sources.reddit && item.source === "reddit") return false

      if (filters.sentiment !== "all") {
        const score = item.sentiment_score || 0
        if (filters.sentiment === "bullish" && score <= 0.1) return false
        if (filters.sentiment === "bearish" && score >= -0.1) return false
        if (filters.sentiment === "neutral" && Math.abs(score) > 0.1) return false
      }

      return true
    }) || []

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-card border-l border-border transition-all duration-300 z-50 ${
        isOpen ? "w-96" : "w-12"
      }`}
    >
      {/* Toggle Button */}
      <Button variant="ghost" size="icon" className="absolute left-2 top-4 z-10" onClick={() => setIsOpen(!isOpen)}>
        <Filter className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="flex flex-col h-full p-4 pt-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Market Context</h2>
              <p className="text-sm text-muted-foreground">{selectedAsset}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Asset Selector */}
          <div className="mb-4">
            <Label htmlFor="asset-select">Asset</Label>
            <Input
              id="asset-select"
              value={selectedAsset}
              onChange={(e) => onAssetChange?.(e.target.value)}
              placeholder="Enter symbol (e.g., AAPL)"
              className="mt-1"
            />
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Sources</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="news-filter"
                    checked={filters.sources.news}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        sources: { ...prev.sources, news: checked },
                      }))
                    }
                  />
                  <Label htmlFor="news-filter" className="text-xs">
                    News
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twitter-filter"
                    checked={filters.sources.twitter}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        sources: { ...prev.sources, twitter: checked },
                      }))
                    }
                  />
                  <Label htmlFor="twitter-filter" className="text-xs">
                    X/Twitter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reddit-filter"
                    checked={filters.sources.reddit}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        sources: { ...prev.sources, reddit: checked },
                      }))
                    }
                  />
                  <Label htmlFor="reddit-filter" className="text-xs">
                    Reddit
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="news" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {newsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNews.map((item: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSourceIcon(item.source)}
                            <Badge variant="outline" className="text-xs">
                              {item.source}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(item.sentiment_score || 0)}
                            <span className={`text-xs ${getSentimentColor(item.sentiment_score || 0)}`}>
                              {((item.sentiment_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-medium mb-1 line-clamp-2">{item.title || item.content}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {item.description || item.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.author || item.source}</span>
                          <span>{format(new Date(item.timestamp), "HH:mm")}</span>
                        </div>
                        {item.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 text-xs"
                            onClick={() => window.open(item.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read More
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sentiment" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {sentimentLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSentiment.map((item: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSourceIcon(item.source)}
                            <Badge variant="outline" className="text-xs">
                              {item.source}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(item.sentiment_score)}
                            <span className={`text-xs font-medium ${getSentimentColor(item.sentiment_score)}`}>
                              {(item.sentiment_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm mb-2 line-clamp-3">{item.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>@{item.author}</span>
                          <span>{format(new Date(item.timestamp), "HH:mm")}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 text-xs">
                            <span>Confidence: {((item.confidence_score || 0) * 100).toFixed(0)}%</span>
                            <span>Relevance: {((item.relevance_score || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

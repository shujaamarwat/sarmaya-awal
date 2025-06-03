import { type NextRequest, NextResponse } from "next/server"

// Mock news data - in production, this would fetch from NewsAPI, Bloomberg, etc.
const mockNewsData = [
  {
    id: 1,
    title: "Apple Reports Record Q4 Earnings",
    description: "Apple Inc. reported record quarterly revenue driven by strong iPhone sales",
    content: "Apple Inc. (AAPL) reported record quarterly revenue of $123.9 billion, beating analyst expectations...",
    source: "news",
    author: "Reuters",
    url: "https://example.com/news/1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    sentiment_score: 0.7,
    confidence_score: 0.9,
    relevance_score: 0.95,
  },
  {
    id: 2,
    title: "Tesla Stock Surges on Autonomous Driving Update",
    description: "Tesla shares jump 8% after announcing major FSD improvements",
    content: "Tesla Inc. (TSLA) shares surged in after-hours trading following the company's announcement...",
    source: "news",
    author: "CNBC",
    url: "https://example.com/news/2",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    sentiment_score: 0.8,
    confidence_score: 0.85,
    relevance_score: 0.9,
  },
  {
    id: 3,
    title: "Market Volatility Expected Amid Fed Decision",
    description: "Analysts predict increased volatility as Federal Reserve meeting approaches",
    content: "Financial markets are bracing for potential volatility as the Federal Reserve prepares...",
    source: "news",
    author: "Bloomberg",
    url: "https://example.com/news/3",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    sentiment_score: -0.2,
    confidence_score: 0.75,
    relevance_score: 0.8,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Filter news by symbol if provided
    let filteredNews = mockNewsData
    if (symbol && symbol !== "ALL") {
      filteredNews = mockNewsData.filter(
        (item) =>
          item.title.toUpperCase().includes(symbol.toUpperCase()) ||
          item.content.toUpperCase().includes(symbol.toUpperCase()),
      )
    }

    // Limit results
    const limitedNews = filteredNews.slice(0, limit)

    return NextResponse.json(limitedNews)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

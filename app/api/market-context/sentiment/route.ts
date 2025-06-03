import { type NextRequest, NextResponse } from "next/server"

// Mock sentiment data - in production, this would fetch from X API, Reddit API, etc.
const mockSentimentData = [
  {
    id: 1,
    content: "AAPL looking strong after earnings! 🚀 #bullish",
    source: "twitter",
    author: "traderpro123",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    sentiment_score: 0.8,
    confidence_score: 0.9,
    relevance_score: 0.85,
  },
  {
    id: 2,
    content: "Tesla FSD update is game changing. This could be the catalyst we've been waiting for.",
    source: "reddit",
    author: "TechInvestor",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    sentiment_score: 0.9,
    confidence_score: 0.85,
    relevance_score: 0.9,
  },
  {
    id: 3,
    content: "Market feels toppy here. Might be time to take some profits. #bearish",
    source: "twitter",
    author: "marketwatch_pro",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    sentiment_score: -0.6,
    confidence_score: 0.7,
    relevance_score: 0.6,
  },
  {
    id: 4,
    content: "GOOGL AI announcements are impressive but stock seems fairly valued at current levels",
    source: "reddit",
    author: "ValueInvestor2024",
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    sentiment_score: 0.1,
    confidence_score: 0.8,
    relevance_score: 0.75,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Filter sentiment by symbol if provided
    let filteredSentiment = mockSentimentData
    if (symbol && symbol !== "ALL") {
      filteredSentiment = mockSentimentData.filter((item) => item.content.toUpperCase().includes(symbol.toUpperCase()))
    }

    // Limit results
    const limitedSentiment = filteredSentiment.slice(0, limit)

    return NextResponse.json(limitedSentiment)
  } catch (error) {
    console.error("Error fetching sentiment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

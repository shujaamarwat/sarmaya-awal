"use server"

import { sql } from "./db"
import { createHash } from "crypto"

// Simple password hashing (in production, use a proper library like bcrypt)
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function seedDatabase() {
  try {
    // Check if we already have users
    const existingUsers = await sql`SELECT COUNT(*) FROM users`
    if (Number.parseInt(existingUsers[0].count) > 0) {
      console.log("Database already seeded")
      return { success: true, message: "Database already seeded" }
    }

    // Create demo user
    const demoUser = await sql`
      INSERT INTO users (
        email, password_hash, name, timezone, theme, language, currency, date_format, is_active
      ) VALUES (
        'demo@example.com', ${hashPassword("password123")}, 'Demo User', 'UTC-5', 'dark', 'en', 'USD', 'MM/DD/YYYY', true
      )
      RETURNING id
    `
    const userId = demoUser[0].id

    // Create user preferences
    await sql`
      INSERT INTO user_preferences (
        user_id, default_assets, notification_backtest_complete, notification_market_alerts, 
        notification_system_updates, notification_weekly_reports
      ) VALUES (
        ${userId}, ARRAY['AAPL', 'TSLA', 'MSFT', 'GOOGL'], true, true, false, true
      )
    `

    // Create strategies
    const strategies = [
      {
        name: "Momentum Breakout",
        type: "Momentum",
        description: "Identifies strong momentum breakouts with volume confirmation",
        parameters: {
          rsiThreshold: [30, 70],
          maWindow: 20,
          volumeMultiplier: 1.5,
          stopLoss: 0.05,
        },
        status: "active",
      },
      {
        name: "Mean Reversion RSI",
        type: "Mean Reversion",
        description: "RSI-based mean reversion strategy with dynamic thresholds",
        parameters: {
          rsiLow: 30,
          rsiHigh: 70,
          lookbackPeriod: 14,
          stopLoss: 0.03,
        },
        status: "active",
      },
      {
        name: "Bollinger Bands",
        type: "Mean Reversion",
        description: "Bollinger Bands squeeze and expansion strategy",
        parameters: {
          period: 20,
          stdDev: 2,
          entryThreshold: 0.05,
          exitThreshold: 0.02,
        },
        status: "draft",
      },
    ]

    for (const strategy of strategies) {
      await sql`
        INSERT INTO strategies (
          user_id, name, type, description, parameters, status
        ) VALUES (
          ${userId}, ${strategy.name}, ${strategy.type}, ${strategy.description}, 
          ${JSON.stringify(strategy.parameters)}, ${strategy.status}
        )
      `
    }

    // Get strategy IDs
    const strategyIds = await sql`
      SELECT id, name FROM strategies WHERE user_id = ${userId}
    `
    const strategyMap = strategyIds.reduce((map, s) => {
      map[s.name] = s.id
      return map
    }, {})

    // Create backtests
    const backtests = [
      {
        name: "Momentum Breakout - AAPL",
        strategy_id: strategyMap["Momentum Breakout"],
        asset: "AAPL",
        start_date: "2024-01-01",
        end_date: "2024-06-30",
        status: "completed",
        total_return: 15.7,
        sharpe_ratio: 2.34,
        max_drawdown: -8.5,
        win_rate: 68.2,
        total_trades: 45,
      },
      {
        name: "Mean Reversion RSI - TSLA",
        strategy_id: strategyMap["Mean Reversion RSI"],
        asset: "TSLA",
        start_date: "2024-01-01",
        end_date: "2024-05-31",
        status: "completed",
        total_return: 12.3,
        sharpe_ratio: 1.89,
        max_drawdown: -12.1,
        win_rate: 62.5,
        total_trades: 67,
      },
      {
        name: "Momentum Breakout - GOOGL",
        strategy_id: strategyMap["Momentum Breakout"],
        asset: "GOOGL",
        start_date: "2024-01-01",
        end_date: "2024-04-30",
        status: "completed",
        total_return: 18.2,
        sharpe_ratio: 2.67,
        max_drawdown: -7.8,
        win_rate: 72.0,
        total_trades: 38,
      },
      {
        name: "Bollinger Bands - BTC/USD",
        strategy_id: strategyMap["Bollinger Bands"],
        asset: "BTC/USD",
        start_date: "2024-03-01",
        end_date: "2024-03-31",
        status: "failed",
        error_message: "Insufficient data for the selected period",
      },
    ]

    for (const backtest of backtests) {
      await sql`
        INSERT INTO backtests (
          user_id, strategy_id, name, asset, start_date, end_date, status,
          total_return, sharpe_ratio, max_drawdown, win_rate, total_trades,
          error_message, completed_at
        ) VALUES (
          ${userId}, ${backtest.strategy_id}, ${backtest.name}, ${backtest.asset},
          ${backtest.start_date}, ${backtest.end_date}, ${backtest.status},
          ${backtest.total_return}, ${backtest.sharpe_ratio}, ${backtest.max_drawdown},
          ${backtest.win_rate}, ${backtest.total_trades}, ${backtest.error_message},
          ${backtest.status === "completed" || backtest.status === "failed" ? "NOW()" : null}
        )
      `
    }

    // Get backtest IDs
    const backtestIds = await sql`
      SELECT id, name FROM backtests WHERE user_id = ${userId}
    `
    const backtestMap = backtestIds.reduce((map, b) => {
      map[b.name] = b.id
      return map
    }, {})

    // Create trades
    const trades = [
      {
        backtest_id: backtestMap["Momentum Breakout - AAPL"],
        strategy_id: strategyMap["Momentum Breakout"],
        symbol: "AAPL",
        action: "BUY",
        quantity: 100,
        price: 175.5,
        timestamp: "2024-06-01 10:30:00",
        pnl: 1250.0,
        is_live: false,
      },
      {
        backtest_id: backtestMap["Momentum Breakout - AAPL"],
        strategy_id: strategyMap["Momentum Breakout"],
        symbol: "AAPL",
        action: "SELL",
        quantity: 100,
        price: 172.25,
        timestamp: "2024-05-28 14:15:00",
        pnl: -325.0,
        is_live: false,
      },
      {
        backtest_id: backtestMap["Mean Reversion RSI - TSLA"],
        strategy_id: strategyMap["Mean Reversion RSI"],
        symbol: "TSLA",
        action: "BUY",
        quantity: 50,
        price: 245.8,
        timestamp: "2024-05-25 09:45:00",
        pnl: 890.5,
        is_live: false,
      },
      {
        backtest_id: backtestMap["Momentum Breakout - GOOGL"],
        strategy_id: strategyMap["Momentum Breakout"],
        symbol: "MSFT",
        action: "SELL",
        quantity: 75,
        price: 378.9,
        timestamp: "2024-04-22 11:20:00",
        pnl: 2150.75,
        is_live: false,
      },
      {
        backtest_id: backtestMap["Mean Reversion RSI - TSLA"],
        strategy_id: strategyMap["Mean Reversion RSI"],
        symbol: "GOOGL",
        action: "BUY",
        quantity: 25,
        price: 142.65,
        timestamp: "2024-05-20 15:10:00",
        pnl: -450.25,
        is_live: false,
      },
    ]

    for (const trade of trades) {
      await sql`
        INSERT INTO trades (
          user_id, backtest_id, strategy_id, symbol, action, quantity,
          price, timestamp, pnl, is_live
        ) VALUES (
          ${userId}, ${trade.backtest_id}, ${trade.strategy_id}, ${trade.symbol},
          ${trade.action}, ${trade.quantity}, ${trade.price}, ${trade.timestamp},
          ${trade.pnl}, ${trade.is_live}
        )
      `
    }

    // Create market data
    const marketData = [
      { symbol: "AAPL", date: "2024-01-01", close_price: 150.0 },
      { symbol: "AAPL", date: "2024-02-01", close_price: 155.0 },
      { symbol: "AAPL", date: "2024-03-01", close_price: 148.0 },
      { symbol: "AAPL", date: "2024-04-01", close_price: 162.0 },
      { symbol: "AAPL", date: "2024-05-01", close_price: 158.0 },
      { symbol: "AAPL", date: "2024-06-01", close_price: 165.0 },
      { symbol: "AAPL", date: "2024-07-01", close_price: 172.0 },
      { symbol: "AAPL", date: "2024-08-01", close_price: 168.0 },
      { symbol: "AAPL", date: "2024-09-01", close_price: 175.0 },
      { symbol: "AAPL", date: "2024-10-01", close_price: 182.0 },
      { symbol: "AAPL", date: "2024-11-01", close_price: 178.0 },
      { symbol: "AAPL", date: "2024-12-01", close_price: 185.0 },
      { symbol: "TSLA", date: "2024-01-01", close_price: 220.0 },
      { symbol: "TSLA", date: "2024-02-01", close_price: 235.0 },
      { symbol: "TSLA", date: "2024-03-01", close_price: 228.0 },
      { symbol: "TSLA", date: "2024-04-01", close_price: 242.0 },
      { symbol: "TSLA", date: "2024-05-01", close_price: 238.0 },
      { symbol: "TSLA", date: "2024-06-01", close_price: 245.0 },
      { symbol: "GOOGL", date: "2024-01-01", close_price: 135.0 },
      { symbol: "GOOGL", date: "2024-02-01", close_price: 140.0 },
      { symbol: "GOOGL", date: "2024-03-01", close_price: 138.0 },
      { symbol: "GOOGL", date: "2024-04-01", close_price: 145.0 },
      { symbol: "GOOGL", date: "2024-05-01", close_price: 142.0 },
      { symbol: "GOOGL", date: "2024-06-01", close_price: 148.0 },
    ]

    for (const data of marketData) {
      await sql`
        INSERT INTO market_data (
          symbol, date, close_price
        ) VALUES (
          ${data.symbol}, ${data.date}, ${data.close_price}
        )
        ON CONFLICT (symbol, date) DO NOTHING
      `
    }

    // Create sentiment data
    const sentimentData = [
      {
        symbol: "AAPL",
        source: "twitter",
        content: "Apple's new product announcement is going to be huge! #bullish",
        sentiment_score: 0.8,
        confidence_score: 0.9,
        relevance_score: 0.85,
        author: "@techanalyst",
        timestamp: "2024-06-01 09:30:00",
      },
      {
        symbol: "AAPL",
        source: "news",
        content: "Apple reports record quarterly revenue despite supply chain challenges",
        sentiment_score: 0.6,
        confidence_score: 0.95,
        relevance_score: 0.9,
        url: "https://example.com/news/apple-earnings",
        author: "Financial Times",
        timestamp: "2024-05-28 16:00:00",
      },
      {
        symbol: "TSLA",
        source: "reddit",
        content: "Tesla's new factory is behind schedule and over budget. Not good for Q3 earnings.",
        sentiment_score: -0.7,
        confidence_score: 0.8,
        relevance_score: 0.75,
        author: "u/investorpro",
        timestamp: "2024-05-25 11:15:00",
      },
      {
        symbol: "GOOGL",
        source: "news",
        content: "Google announces new AI features for search, analysts predict increased market share",
        sentiment_score: 0.9,
        confidence_score: 0.85,
        relevance_score: 0.95,
        url: "https://example.com/news/google-ai-search",
        author: "Tech Insider",
        timestamp: "2024-06-02 10:45:00",
      },
    ]

    for (const data of sentimentData) {
      await sql`
        INSERT INTO sentiment_data (
          symbol, source, content, sentiment_score, confidence_score,
          relevance_score, url, author, timestamp
        ) VALUES (
          ${data.symbol}, ${data.source}, ${data.content}, ${data.sentiment_score},
          ${data.confidence_score}, ${data.relevance_score}, ${data.url},
          ${data.author}, ${data.timestamp}
        )
      `
    }

    // Create alerts
    const alerts = [
      {
        type: "backtest_complete",
        title: "Backtest Completed",
        message: "Your momentum strategy backtest has finished",
        data: { backtest_id: backtestMap["Momentum Breakout - AAPL"] },
        is_read: false,
      },
      {
        type: "market_alert",
        title: "Market Alert",
        message: "AAPL has crossed your RSI threshold",
        data: { symbol: "AAPL", indicator: "RSI", value: 72.5 },
        is_read: false,
      },
      {
        type: "sentiment_flip",
        title: "Sentiment Change",
        message: "TSLA sentiment has turned bearish on social media",
        data: { symbol: "TSLA", old_sentiment: "neutral", new_sentiment: "bearish" },
        is_read: false,
      },
    ]

    for (const alert of alerts) {
      await sql`
        INSERT INTO alerts (
          user_id, type, title, message, data, is_read
        ) VALUES (
          ${userId}, ${alert.type}, ${alert.title}, ${alert.message},
          ${JSON.stringify(alert.data)}, ${alert.is_read}
        )
      `
    }

    // Create alert subscriptions
    const alertSubscriptions = [
      {
        symbol: "AAPL",
        alert_type: "price_threshold",
        conditions: { above: 180, below: 160 },
        is_active: true,
      },
      {
        symbol: "TSLA",
        alert_type: "sentiment_flip",
        conditions: { threshold: 0.3 },
        is_active: true,
      },
      {
        symbol: "GOOGL",
        alert_type: "volume_spike",
        conditions: { multiplier: 2.5 },
        is_active: false,
      },
    ]

    for (const subscription of alertSubscriptions) {
      await sql`
        INSERT INTO alert_subscriptions (
          user_id, symbol, alert_type, conditions, is_active
        ) VALUES (
          ${userId}, ${subscription.symbol}, ${subscription.alert_type},
          ${JSON.stringify(subscription.conditions)}, ${subscription.is_active}
        )
      `
    }

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Error seeding database" }
  }
}

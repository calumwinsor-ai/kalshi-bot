/**
 * Trade Analyzer Agent
 * Reviews bot trades and market performance to identify improvements
 */

const axios = require('axios');

class TradeAnalyzer {
  constructor(apiKeyId, privateKey) {
    this.apiKeyId = apiKeyId;
    this.privateKey = privateKey;
    this.auth = { username: apiKeyId, password: privateKey };
    this.headers = { 'User-Agent': 'Kalshi-Trading-Bot/1.0' };
    this.KALSHI_API_BASE = 'https://kalshi.com/api/v2';
  }

  /**
   * Analyze all bot trades and compare to market performance
   */
  async analyzeBotPerformance(botTrades = []) {
    try {
      console.log('\n📊 === TRADE ANALYZER: Daily Performance Review ===\n');

      // Get all open markets
      const marketsResponse = await axios.get(
        `${this.KALSHI_API_BASE}/markets?status=open&limit=100`,
        { auth: this.auth, headers: this.headers, timeout: 15000 }
      );

      const allMarkets = marketsResponse.data || [];
      console.log(`📈 Analyzing ${allMarkets.length} open markets...\n`);

      // Analyze bot trades
      const tradeAnalysis = this.analyzeTradeQuality(botTrades, allMarkets);

      // Identify missed opportunities
      const missedOpportunities = this.findMissedOpportunities(botTrades, allMarkets);

      // Calculate win rate and ROI
      const performance = this.calculatePerformance(botTrades);

      // Generate strategy recommendations
      const recommendations = this.generateRecommendations(
        tradeAnalysis,
        missedOpportunities,
        performance,
        allMarkets
      );

      return {
        timestamp: new Date().toISOString(),
        tradeAnalysis,
        missedOpportunities,
        performance,
        recommendations,
        summary: this.generateSummary(tradeAnalysis, performance, recommendations)
      };
    } catch (error) {
      console.error('❌ Trade analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze quality of each bot trade
   */
  analyzeTradeQuality(trades, allMarkets) {
    const analysis = {
      totalTrades: trades.length,
      trades: []
    };

    trades.forEach(trade => {
      const market = allMarkets.find(m => m.id === trade.ticker);

      if (market) {
        const tradeAnalysis = {
          ticker: trade.ticker,
          side: trade.side,
          entryPrice: trade.price,
          currentPrice: market.price,
          priceMovement: market.price - trade.price,
          percentageChange: ((market.price - trade.price) / trade.price * 100).toFixed(2),
          status: this.determineTradeStatus(trade, market),
          quality: this.assessTradeQuality(trade, market),
          recommendations: this.getTradeRecommendations(trade, market)
        };

        analysis.trades.push(tradeAnalysis);
      }
    });

    return analysis;
  }

  /**
   * Determine if trade is winning, losing, or neutral
   */
  determineTradeStatus(trade, market) {
    const threshold = 0.01; // 1% threshold

    if (trade.side === 'buy') {
      if (market.price > trade.price + threshold) return 'WINNING';
      if (market.price < trade.price - threshold) return 'LOSING';
      return 'NEUTRAL';
    } else {
      if (market.price < trade.price - threshold) return 'WINNING';
      if (market.price > trade.price + threshold) return 'LOSING';
      return 'NEUTRAL';
    }
  }

  /**
   * Assess trade quality based on multiple factors
   */
  assessTradeQuality(trade, market) {
    const factors = {
      priceMovement: 0,
      volume: 0,
      volatility: 0,
      sentiment: 0
    };

    // Price movement (higher is better for winning trades)
    const priceChange = trade.side === 'buy'
      ? market.price - trade.price
      : trade.price - market.price;
    factors.priceMovement = Math.max(0, priceChange * 10); // Scale 0-10

    // Volume (higher volume = better liquidity)
    factors.volume = Math.min(10, (market.volume_24h || 0) / 10000);

    // Overall quality score
    const qualityScore = (
      factors.priceMovement * 0.5 +
      factors.volume * 0.3
    );

    return {
      score: Math.round(qualityScore * 10) / 10,
      factors
    };
  }

  /**
   * Get recommendations for individual trade
   */
  getTradeRecommendations(trade, market) {
    const recommendations = [];

    // Check if position should be exited
    if (trade.side === 'buy' && market.price > trade.price * 1.05) {
      recommendations.push('✅ TAKE PROFIT: Price up 5%+, consider exiting');
    }
    if (trade.side === 'buy' && market.price < trade.price * 0.95) {
      recommendations.push('⚠️ STOP LOSS: Price down 5%+, consider cutting loss');
    }

    // Check market sentiment
    if (market.price < 0.3) {
      recommendations.push('📉 Low probability: Price <30%, risk/reward unfavorable');
    }
    if (market.price > 0.7) {
      recommendations.push('📈 High probability: Price >70%, continue holding if winning');
    }

    return recommendations;
  }

  /**
   * Find missed opportunities in the market
   */
  findMissedOpportunities(botTrades, allMarkets) {
    const botTickets = new Set(botTrades.map(t => t.ticker));
    const opportunities = [];

    allMarkets.forEach(market => {
      // Skip markets the bot already traded
      if (botTickets.has(market.id)) return;

      // Look for strong opportunities the bot missed
      if (market.price < 0.25) {
        opportunities.push({
          ticker: market.id,
          title: market.title,
          price: market.price,
          volume: market.volume_24h,
          signal: 'UNDERVALUED - Strong buy signal',
          expectedROI: (0.5 - market.price) / market.price * 100
        });
      }

      if (market.price > 0.75) {
        opportunities.push({
          ticker: market.id,
          title: market.title,
          price: market.price,
          volume: market.volume_24h,
          signal: 'OVERVALUED - Strong sell signal',
          expectedROI: (market.price - 0.5) / market.price * 100
        });
      }
    });

    return opportunities
      .sort((a, b) => Math.abs(b.expectedROI) - Math.abs(a.expectedROI))
      .slice(0, 10); // Top 10 opportunities
  }

  /**
   * Calculate overall trading performance
   */
  calculatePerformance(trades) {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgProfit: 0,
        totalProfit: 0
      };
    }

    const winningTrades = trades.filter(t => t.profit > 0);
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit || 0), 0);

    return {
      totalTrades: trades.length,
      winRate: ((winningTrades.length / trades.length) * 100).toFixed(2),
      winCount: winningTrades.length,
      lossCount: trades.length - winningTrades.length,
      avgProfit: (totalProfit / trades.length).toFixed(4),
      totalProfit: totalProfit.toFixed(4),
      profitFactor: this.calculateProfitFactor(trades),
      sharpeRatio: this.calculateSharpeRatio(trades)
    };
  }

  /**
   * Calculate profit factor (gross profit / gross loss)
   */
  calculateProfitFactor(trades) {
    const profits = trades
      .filter(t => t.profit > 0)
      .reduce((sum, t) => sum + t.profit, 0);
    const losses = Math.abs(
      trades
        .filter(t => t.profit < 0)
        .reduce((sum, t) => sum + t.profit, 0)
    );

    return losses === 0 ? profits > 0 ? 999 : 0 : (profits / losses).toFixed(2);
  }

  /**
   * Calculate Sharpe Ratio for risk-adjusted returns
   */
  calculateSharpeRatio(trades) {
    if (trades.length < 2) return 0;

    const returns = trades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev === 0 ? 0 : (avgReturn / stdDev).toFixed(2);
  }

  /**
   * Generate strategic recommendations to improve trading
   */
  generateRecommendations(tradeAnalysis, missedOpps, performance, allMarkets) {
    const recommendations = {
      immediate: [],
      strategic: [],
      riskManagement: []
    };

    // Immediate trading recommendations
    if (performance.winRate < 50) {
      recommendations.immediate.push({
        priority: 'HIGH',
        action: 'Improve entry criteria - win rate is below 50%',
        details: `Current win rate: ${performance.winRate}%. Focus on higher-confidence trades.`
      });
    }

    if (missedOpps.length > 5) {
      recommendations.immediate.push({
        priority: 'HIGH',
        action: 'Expand market coverage',
        details: `${missedOpps.length} strong opportunities missed. Consider adding more markets to analyze.`
      });
    }

    // Strategic improvements
    recommendations.strategic.push({
      priority: 'MEDIUM',
      action: 'Optimize capital allocation',
      details: 'Allocate more capital to high-probability setups (price < 0.3 or > 0.7)'
    });

    recommendations.strategic.push({
      priority: 'MEDIUM',
      action: 'Implement profit-taking rules',
      details: 'Set automatic take-profit at 5-10% gain for quick wins'
    });

    recommendations.strategic.push({
      priority: 'MEDIUM',
      action: 'Implement stop-loss discipline',
      details: 'Set automatic stop-loss at 5% loss to protect capital'
    });

    // Risk management
    recommendations.riskManagement.push({
      priority: 'HIGH',
      action: 'Position sizing',
      details: 'Risk only 2-3% of capital per trade for optimal risk management'
    });

    recommendations.riskManagement.push({
      priority: 'MEDIUM',
      action: 'Market selection',
      details: 'Favor markets with volume > 50k and price extremes (< 0.3 or > 0.7)'
    });

    return recommendations;
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(tradeAnalysis, performance, recommendations) {
    return `
🤖 TRADE ANALYZER REPORT
========================

📊 Performance Summary:
   • Total Trades: ${performance.totalTrades}
   • Win Rate: ${performance.winRate}%
   • Total Profit: $${performance.totalProfit}
   • Profit Factor: ${performance.profitFactor}x
   • Sharpe Ratio: ${performance.sharpeRatio}

🎯 Top Recommendations:
${recommendations.immediate.slice(0, 2).map(r => `   • [${r.priority}] ${r.action}`).join('\n')}

📈 Next Steps:
   1. Review immediate recommendations above
   2. Analyze missed opportunities in market
   3. Adjust trading criteria based on findings
   4. Test new strategies before deployment
    `;
  }
}

module.exports = TradeAnalyzer;

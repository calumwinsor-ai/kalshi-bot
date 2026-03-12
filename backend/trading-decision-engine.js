/**
 * Trading Decision Engine
 * Intelligent position sizing, entry/exit decisions, and portfolio management
 *
 * Features:
 * - Market scoring based on probability, yield, timing, and liquidity
 * - Expected value calculations
 * - Kelly Criterion position sizing (safety-scaled)
 * - Intelligent entry/exit decision logic
 * - Daily portfolio rebalancing
 * - Comprehensive risk management
 */

class TradingDecisionEngine {
  constructor() {
    // Configuration
    this.config = {
      minProbability: 0.70,           // Only trade >= 70% probability
      minExpectedValue: 0.020,        // Only trade if EV >= 2%
      minMarketScore: 60,             // Only trade if score >= 60/100
      minLiquidity: 30000,            // Only trade volume >= 30k
      maxPositionSize: 0.40,          // Never > 40% of portfolio
      maxTotalAllocation: 0.80,       // Keep 20% cash reserve
      minPositionSize: 0.05,          // Minimum 5% per position
      maxDailyLoss: 0.05,             // Pause if lose 5% in day
      maxDrawdown: 0.10,              // Circuit breaker at 10% loss
      minWinRate: 0.60,               // Minimum sustainable win rate
      kellyMultiplier: 0.5,           // Use half-Kelly (conservative)
      profitTarget: 0.05,             // Take profit at 5% gain
      stopLoss: 0.02,                 // Stop loss at 2% loss
      maxHoldHours: 72,               // Maximum hold time
      exitBeforeEvent: 24,            // Exit 24h before event
    };

    // Portfolio state
    this.openPositions = [];
    this.closedPositions = [];
    this.dailyMetrics = {
      tradesEntered: 0,
      tradesExited: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      dailyP_L: 0,
      portfolioValue: 0
    };

    // Market data cache
    this.marketCache = [];
    this.scoredMarkets = [];
  }

  /**
   * Main daily decision flow
   */
  async runDailyDecisionCycle(portfolio, markets, analysisResults) {
    console.log('\n🤖 === TRADING DECISION ENGINE: Daily Cycle ===\n');

    try {
      // Step 1: Evaluate current positions
      console.log('Step 1: Evaluating current positions...');
      await this.evaluateOpenPositions(portfolio, markets);

      // Step 2: Score and rank all available markets
      console.log('Step 2: Scoring and ranking markets...');
      this.scoreAllMarkets(markets, analysisResults);

      // Step 3: Generate entry recommendations
      console.log('Step 3: Generating entry decisions...');
      const entryRecommendations = this.generateEntryRecommendations(portfolio);

      // Step 4: Generate exit recommendations
      console.log('Step 4: Evaluating exit opportunities...');
      const exitRecommendations = this.generateExitRecommendations(portfolio);

      // Step 5: Rebalance portfolio
      console.log('Step 5: Rebalancing portfolio...');
      const rebalancingPlan = this.generateRebalancingPlan(
        portfolio,
        entryRecommendations,
        exitRecommendations
      );

      // Step 6: Check risk management rules
      console.log('Step 6: Validating risk management...');
      const riskValidation = this.validateRiskManagement(portfolio, rebalancingPlan);

      console.log('✅ Daily decision cycle complete\n');

      return {
        timestamp: new Date().toISOString(),
        portfolio,
        marketAnalysis: {
          totalMarketsAnalyzed: markets.length,
          topOpportunities: this.scoredMarkets.slice(0, 5)
        },
        recommendations: {
          entries: entryRecommendations,
          exits: exitRecommendations,
          rebalancing: rebalancingPlan
        },
        validation: riskValidation,
        metrics: this.calculatePortfolioMetrics(portfolio)
      };

    } catch (error) {
      console.error('❌ Decision cycle error:', error.message);
      throw error;
    }
  }

  /**
   * Score all available markets
   */
  scoreAllMarkets(markets, analysisResults) {
    this.scoredMarkets = markets.map(market => {
      const probabilityScore = this.estimateProbability(market, analysisResults);
      const yieldScore = this.calculateYieldScore(market);
      const timingScore = this.calculateTimingScore(market);
      const liquidityScore = this.calculateLiquidityScore(market);

      // Weighted scoring: Prob 40%, Yield 30%, Timing 20%, Liquidity 10%
      const totalScore = (
        (probabilityScore * 0.40) +
        (yieldScore * 0.30) +
        (timingScore * 0.20) +
        (liquidityScore * 0.10)
      );

      // Calculate expected value
      const expectedValue = this.calculateExpectedValue(
        probabilityScore / 100,
        market.estimatedYield || 0.05,
        0.02  // assume 2% max loss
      );

      return {
        ...market,
        scoring: {
          probability: probabilityScore,
          yield: yieldScore,
          timing: timingScore,
          liquidity: liquidityScore,
          totalScore: Math.round(totalScore * 10) / 10
        },
        expectedValue: expectedValue,
        decision: this.makeMarketDecision(probabilityScore, expectedValue, totalScore)
      };
    }).sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);

    console.log(`📊 Analyzed ${markets.length} markets`);
    console.log(`✅ Top 3 opportunities:`);
    this.scoredMarkets.slice(0, 3).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title}: Score ${m.scoring.totalScore}, EV ${(m.expectedValue * 100).toFixed(2)}%`);
    });
  }

  /**
   * Estimate probability for a market
   */
  estimateProbability(market, analysisResults) {
    // Weights for probability estimation
    const marketPrice = Math.min(Math.max(market.price, 0.01), 0.99);
    const baseProb = marketPrice * 100;

    // Get historical performance from analysis
    const historicalAdjustment = this.getHistoricalAdjustment(market, analysisResults);

    // Get sentiment adjustment
    const sentimentAdjustment = this.getSentimentAdjustment(market);

    // Combined probability
    const probability = baseProb + historicalAdjustment + sentimentAdjustment;

    return Math.min(Math.max(probability, 1), 99);
  }

  /**
   * Get historical adjustment from past performance
   */
  getHistoricalAdjustment(market, analysisResults) {
    if (!analysisResults || !analysisResults.tradeAnalyzer) {
      return 0;
    }

    // Look at similar trades in history
    const similar = analysisResults.tradeAnalyzer.trades?.filter(t =>
      Math.abs(t.entryPrice - market.price) < 0.05
    );

    if (!similar || similar.length === 0) {
      return 0;
    }

    // Average win rate of similar trades
    const winRate = similar.filter(t => t.profit > 0).length / similar.length;

    // Adjust current estimate based on historical performance
    return (winRate - 0.5) * 10; // -5 to +5 adjustment
  }

  /**
   * Get sentiment adjustment
   */
  getSentimentAdjustment(market) {
    // Check if price moving up (positive sentiment) or down (negative sentiment)
    if (!market.priceMovement) {
      return 0;
    }

    // 1% price move = 1 point adjustment
    return market.priceMovement * 100;
  }

  /**
   * Calculate yield score (0-100)
   */
  calculateYieldScore(market) {
    const estimatedYield = market.estimatedYield || 0.05;

    // Scale yield to score: 0% yield = 0, 20% yield = 100
    return Math.min((estimatedYield / 0.20) * 100, 100);
  }

  /**
   * Calculate timing score based on entry signals
   */
  calculateTimingScore(market) {
    // Assume we have momentum data
    if (!market.momentum) {
      return 50; // Neutral
    }

    if (market.momentum === 'strong_up') {
      return 100; // Perfect timing
    } else if (market.momentum === 'up') {
      return 75;
    } else if (market.momentum === 'neutral') {
      return 50;
    } else if (market.momentum === 'down') {
      return 25;
    } else {
      return 10; // Strong downward
    }
  }

  /**
   * Calculate liquidity score (0-100)
   */
  calculateLiquidityScore(market) {
    const volume = market.volume_24h || 0;

    // 100k+ = 100, 50k+ = 75, 30k+ = 50, <30k = 25
    if (volume > 100000) return 100;
    if (volume > 50000) return 75;
    if (volume > 30000) return 50;
    return 25;
  }

  /**
   * Calculate expected value: (Prob × Win) - ((1-Prob) × Loss)
   */
  calculateExpectedValue(probability, expectedReturn, maxLoss) {
    return (probability * expectedReturn) - ((1 - probability) * maxLoss);
  }

  /**
   * Make entry decision for a market
   */
  makeMarketDecision(probability, expectedValue, score) {
    // Check all criteria
    if (probability < this.config.minProbability * 100) {
      return { decision: 'SKIP', reason: 'Probability too low' };
    }
    if (score < this.config.minMarketScore) {
      return { decision: 'SKIP', reason: 'Market score too low' };
    }
    if (expectedValue < this.config.minExpectedValue) {
      return { decision: 'WAIT', reason: 'Expected value too low' };
    }

    // All criteria met
    return { decision: 'ENTER', reason: 'Meets all criteria' };
  }

  /**
   * Evaluate all open positions for exits
   */
  async evaluateOpenPositions(portfolio, markets) {
    if (!portfolio.open_positions || portfolio.open_positions.length === 0) {
      console.log('   No open positions to evaluate');
      return;
    }

    const positionsToClose = [];

    portfolio.open_positions.forEach(position => {
      const currentPrice = this.getMarketPrice(position.ticker, markets);
      const holdDuration = this.calculateHoldDuration(position.entryTime);
      const probability = this.estimatePositionProbability(position, markets);

      const exitReason = this.evaluateExitTriggers(
        position,
        currentPrice,
        holdDuration,
        probability
      );

      if (exitReason) {
        positionsToClose.push({
          ...position,
          currentPrice,
          exitReason,
          P_L: this.calculateP_L(position, currentPrice)
        });
      }
    });

    if (positionsToClose.length > 0) {
      console.log(`   Found ${positionsToClose.length} positions with exit triggers`);
      positionsToClose.forEach(p => {
        console.log(`   • ${p.ticker}: Exit - ${p.exitReason}`);
      });
    }

    return positionsToClose;
  }

  /**
   * Evaluate all exit triggers for a position
   */
  evaluateExitTriggers(position, currentPrice, holdDuration, probability) {
    const returnPct = (currentPrice - position.entryPrice) / position.entryPrice;

    // Take profit at 5% gain
    if (returnPct >= this.config.profitTarget) {
      return 'PROFIT_TARGET_HIT';
    }

    // Stop loss at -2% loss
    if (returnPct <= -this.config.stopLoss) {
      return 'STOP_LOSS_HIT';
    }

    // Exit if probability drops below 60%
    if (probability < 60) {
      return 'PROBABILITY_DETERIORATED';
    }

    // Exit if held > 72 hours
    if (holdDuration > this.config.maxHoldHours) {
      return 'MAX_HOLD_TIME_EXCEEDED';
    }

    // Exit if close to event resolution (within 12 hours)
    if (position.hoursToResolution && position.hoursToResolution < 12) {
      return 'APPROACHING_RESOLUTION';
    }

    return null; // No exit trigger
  }

  /**
   * Generate entry recommendations
   */
  generateEntryRecommendations(portfolio) {
    const recommendations = [];
    const availableCapital = this.calculateAvailableCapital(portfolio);

    // Score all markets and filter for entries
    const entryOpportunities = this.scoredMarkets.filter(m =>
      m.decision.decision === 'ENTER' &&
      m.scoring.liquidity >= this.config.minLiquidity
    );

    console.log(`   Considering ${entryOpportunities.length} entry opportunities`);

    for (const opportunity of entryOpportunities) {
      if (recommendations.length >= 3) break; // Limit to 3 new entries per day

      const positionSize = this.calculatePositionSize(
        opportunity.scoring.probability / 100,
        opportunity.estimatedYield || 0.05,
        availableCapital - (recommendations.reduce((s, r) => s + r.size, 0))
      );

      if (positionSize > 0) {
        recommendations.push({
          market: opportunity.id,
          title: opportunity.title,
          decision: 'ENTER',
          size: positionSize,
          reason: `Probability: ${opportunity.scoring.probability.toFixed(0)}%, EV: ${(opportunity.expectedValue * 100).toFixed(2)}%`,
          targets: {
            entryPrice: opportunity.price,
            profitTarget: opportunity.price * (1 + this.config.profitTarget),
            stopLoss: opportunity.price * (1 - this.config.stopLoss)
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate exit recommendations
   */
  generateExitRecommendations(portfolio) {
    // This would be populated from evaluateOpenPositions
    return [];
  }

  /**
   * Calculate position size using Kelly Criterion
   */
  calculatePositionSize(probability, expectedReturn, availableCapital) {
    if (!availableCapital || availableCapital <= 0) {
      return 0;
    }

    // Assume 2% average loss
    const avgLoss = 0.02;

    // Kelly % = (Win% × AvgWin - Loss% × AvgLoss) / AvgWin
    const kellyPercent = (
      (probability * expectedReturn - (1 - probability) * avgLoss) / expectedReturn
    );

    // Safety: Use half Kelly
    const safeKelly = kellyPercent * this.config.kellyMultiplier;

    // Constrain to safe limits
    const finalAllocation = Math.max(
      Math.min(safeKelly, this.config.maxPositionSize),
      0
    );

    // Ensure minimum size
    const minimumSize = availableCapital * this.config.minPositionSize;
    const positionSize = finalAllocation * availableCapital;

    return positionSize >= minimumSize ? positionSize : 0;
  }

  /**
   * Generate rebalancing plan
   */
  generateRebalancingPlan(portfolio, entries, exits) {
    return {
      closePositions: exits,
      openPositions: entries,
      allocationStrategy: 'daily',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate risk management rules
   */
  validateRiskManagement(portfolio, plan) {
    const validation = {
      passed: true,
      violations: [],
      warnings: []
    };

    // Check max position size
    plan.openPositions.forEach(pos => {
      if (pos.size / portfolio.cash > this.config.maxPositionSize) {
        validation.violations.push(`Position size ${pos.size} exceeds max ${this.config.maxPositionSize * 100}%`);
      }
    });

    // Check total allocation
    const totalAllocation = plan.openPositions.reduce((sum, p) => sum + p.size, 0);
    if (totalAllocation / portfolio.cash > this.config.maxTotalAllocation) {
      validation.violations.push(`Total allocation ${totalAllocation} exceeds max ${this.config.maxTotalAllocation * 100}%`);
    }

    // Check concentration risk
    if (plan.openPositions.length === 1) {
      validation.warnings.push('Single position concentration - diversify if possible');
    }

    validation.passed = validation.violations.length === 0;

    return validation;
  }

  /**
   * Calculate available capital (cash available for trading)
   */
  calculateAvailableCapital(portfolio) {
    // Available capital = current cash * max allocation
    const maxTrading = portfolio.cash * this.config.maxTotalAllocation;
    return maxTrading;
  }

  /**
   * Calculate portfolio metrics
   */
  calculatePortfolioMetrics(portfolio) {
    return {
      totalValue: portfolio.total_value || 0,
      availableCapital: this.calculateAvailableCapital(portfolio),
      allocation: portfolio.total_value ? portfolio.cash / portfolio.total_value : 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper: Get market price from markets data
   */
  getMarketPrice(ticker, markets) {
    const market = markets.find(m => m.id === ticker);
    return market ? market.price : 0;
  }

  /**
   * Helper: Calculate hold duration in hours
   */
  calculateHoldDuration(entryTime) {
    const now = new Date();
    const entry = new Date(entryTime);
    return (now - entry) / (1000 * 60 * 60);
  }

  /**
   * Helper: Estimate position probability
   */
  estimatePositionProbability(position, markets) {
    const currentMarket = this.getMarketPrice(position.ticker, markets);
    // Probability roughly = current price
    return currentMarket * 100;
  }

  /**
   * Helper: Calculate P&L
   */
  calculateP_L(position, currentPrice) {
    return (currentPrice - position.entryPrice) * position.quantity;
  }
}

module.exports = TradingDecisionEngine;

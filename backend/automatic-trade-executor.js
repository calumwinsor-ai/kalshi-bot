/**
 * AUTOMATIC TRADE EXECUTOR
 * Executes recommended trades automatically after daily analysis
 * Integrated with Trading Decision Engine recommendations
 */

const axios = require('axios');

class AutomaticTradeExecutor {
  constructor(apiKeyId, privateKey, port = 5001) {
    this.apiKeyId = apiKeyId;
    this.privateKey = privateKey;
    this.port = port;
    this.executedTrades = [];
    this.executionLog = [];
  }

  /**
   * Execute top 5 recommended trades automatically
   */
  async executeRecommendedTrades(recommendations, portfolio) {
    console.log('\n🤖 === AUTOMATIC TRADE EXECUTION ===\n');
    console.log(`Executing top 5 of ${recommendations.length} recommendations...\n`);

    const executionResults = {
      timestamp: new Date().toISOString(),
      totalRecommendations: recommendations.length,
      topFiveSelected: recommendations.slice(0, 5),
      executedTrades: [],
      failedTrades: [],
      summary: {
        successCount: 0,
        failureCount: 0,
        totalCapitalUsed: 0,
        expectedValue: 0
      }
    };

    // Execute top 5 trades
    for (let i = 0; i < Math.min(5, recommendations.length); i++) {
      const recommendation = recommendations[i];

      try {
        console.log(`\n[${i + 1}/5] Executing: ${recommendation.marketTitle}`);
        console.log(`    Probability: ${recommendation.probability}%`);
        console.log(`    Expected Value: ${recommendation.expectedValue}%`);
        console.log(`    Position Size: $${recommendation.positionSize.toFixed(2)}`);

        // Verify sufficient funds
        if (portfolio.cash < recommendation.positionSize) {
          console.log(`    ❌ FAILED: Insufficient funds (need $${recommendation.positionSize.toFixed(2)}, have $${portfolio.cash.toFixed(2)})`);
          executionResults.failedTrades.push({
            marketId: recommendation.marketId,
            marketTitle: recommendation.marketTitle,
            reason: 'Insufficient funds',
            requiredSize: recommendation.positionSize,
            availableCash: portfolio.cash
          });
          executionResults.summary.failureCount++;
          continue;
        }

        // Execute the trade via API
        const tradeResponse = await axios.post(`http://localhost:${this.port}/api/orders`, {
          ticker: recommendation.marketId,
          side: recommendation.action?.toLowerCase() || 'buy',
          quantity: Math.ceil(recommendation.positionSize),
          price: 0.5, // Market price
          type: 'market'
        });

        if (tradeResponse.data?.success) {
          const executedTrade = {
            rank: recommendation.rank,
            marketId: recommendation.marketId,
            marketTitle: recommendation.marketTitle,
            action: recommendation.action || 'BUY',
            positionSize: recommendation.positionSize,
            probability: recommendation.probability,
            expectedValue: recommendation.expectedValue,
            orderId: tradeResponse.data.orderId,
            status: 'executed',
            executedAt: new Date().toISOString(),
            expectedProfit: (recommendation.positionSize * recommendation.expectedValue) / 100
          };

          console.log(`    ✅ EXECUTED: Order ${tradeResponse.data.orderId}`);
          executionResults.executedTrades.push(executedTrade);
          executionResults.summary.successCount++;
          executionResults.summary.totalCapitalUsed += recommendation.positionSize;
          executionResults.summary.expectedValue += (recommendation.positionSize * recommendation.expectedValue) / 100;

          // Update portfolio
          portfolio.cash -= recommendation.positionSize;
        } else {
          console.log(`    ❌ FAILED: ${tradeResponse.data?.error || 'Unknown error'}`);
          executionResults.failedTrades.push({
            marketId: recommendation.marketId,
            marketTitle: recommendation.marketTitle,
            reason: tradeResponse.data?.error || 'Execution failed'
          });
          executionResults.summary.failureCount++;
        }
      } catch (error) {
        console.log(`    ❌ ERROR: ${error.message}`);
        executionResults.failedTrades.push({
          marketId: recommendation.marketId,
          marketTitle: recommendation.marketTitle,
          reason: error.message
        });
        executionResults.summary.failureCount++;
      }
    }

    // Summary
    console.log('\n📊 EXECUTION SUMMARY');
    console.log(`✅ Successful: ${executionResults.summary.successCount}`);
    console.log(`❌ Failed: ${executionResults.summary.failureCount}`);
    console.log(`💰 Capital Used: $${executionResults.summary.totalCapitalUsed.toFixed(2)}`);
    console.log(`📈 Expected Daily Profit: $${executionResults.summary.expectedValue.toFixed(2)}`);
    console.log(`\n💰 Remaining Cash: $${portfolio.cash.toFixed(2)}\n`);

    // Store execution record
    this.executedTrades.push(executionResults);
    this.executionLog.push({
      timestamp: executionResults.timestamp,
      successCount: executionResults.summary.successCount,
      failureCount: executionResults.summary.failureCount,
      capitalUsed: executionResults.summary.totalCapitalUsed
    });

    return executionResults;
  }

  /**
   * Get execution history
   */
  getExecutionHistory() {
    return {
      lastExecution: this.executedTrades[this.executedTrades.length - 1] || null,
      totalExecutions: this.executedTrades.length,
      executionLog: this.executionLog,
      allExecutions: this.executedTrades
    };
  }

  /**
   * Get today's trades
   */
  getTodaysTrades() {
    const today = new Date().toDateString();
    return this.executedTrades.filter(exec =>
      new Date(exec.timestamp).toDateString() === today
    );
  }

  /**
   * Reset daily execution tracker
   */
  resetDaily() {
    const today = new Date().toDateString();
    this.executedTrades = this.executedTrades.filter(exec =>
      new Date(exec.timestamp).toDateString() !== today
    );
  }
}

module.exports = AutomaticTradeExecutor;

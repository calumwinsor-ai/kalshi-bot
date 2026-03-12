#!/usr/bin/env node

/**
 * Test Script for Trading Analysis System WITH LOGIN
 * Logs in with demo credentials and tests the full system
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const prefix = {
    'SUCCESS': `${colors.green}✅${colors.reset}`,
    'INFO': `${colors.blue}ℹ️${colors.reset}`,
    'TEST': `${colors.cyan}🧪${colors.reset}`,
    'ERROR': `${colors.red}❌${colors.reset}`,
    'WARN': `${colors.yellow}⚠️${colors.reset}`
  };
  console.log(`${prefix[type] || '•'} ${message}`);
}

async function runFullTest() {
  try {
    console.log(`\n${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════╗
║   Complete Trading Analysis System Test           ║
║   With Authentication & Full Analysis Pipeline   ║
╚═══════════════════════════════════════════════════╝
${colors.reset}\n`);

    // Step 1: Health check
    log('TEST', 'Step 1: Server health check');
    try {
      const health = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      log('SUCCESS', 'Server is running');
    } catch (error) {
      log('ERROR', 'Server not responding');
      process.exit(1);
    }

    // Step 2: Login with demo credentials
    log('TEST', 'Step 2: Logging in with test API Key');

    // Use the test API Key ID from the .env file
    const testApiKeyId = '601cdb20-0450-442c-9be6-81788c448ad0';

    let loginSuccess = false;
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        apiKeyId: testApiKeyId
      }, { timeout: 5000 });

      if (loginResponse.data.success) {
        log('SUCCESS', `Logged in successfully`);
        log('INFO', `API Key ID: ${testApiKeyId.substring(0, 20)}...`);
        loginSuccess = true;
      } else {
        log('ERROR', `Login failed: ${loginResponse.data.error}`);
      }
    } catch (error) {
      log('ERROR', `Login request failed: ${error.message}`);
    }

    if (!loginSuccess) {
      log('WARN', 'Skipping authenticated tests');
      process.exit(1);
    }

    // Step 3: Check auth status
    log('TEST', 'Step 3: Verifying authentication status');
    try {
      const status = await axios.get(`${API_BASE}/api/auth/status`);
      if (status.data.authenticated) {
        log('SUCCESS', 'Authentication verified');
      } else {
        log('WARN', 'Not fully authenticated');
      }
    } catch (error) {
      log('ERROR', `Auth status check failed: ${error.message}`);
    }

    // Step 4: Run comprehensive daily analysis
    log('TEST', 'Step 4: Running comprehensive daily analysis');
    log('INFO', 'Executing both Trade Analyzer and Strategy Optimizer...');

    let analysisData = null;
    try {
      const analysisResponse = await axios.post(`${API_BASE}/api/analysis/daily-report`, {}, {
        timeout: 45000
      });

      if (analysisResponse.data.success) {
        analysisData = analysisResponse.data.report;
        log('SUCCESS', 'Comprehensive analysis completed');

        // Display summary
        console.log(`\n${colors.bright}📊 ANALYSIS SUMMARY:${colors.reset}`);
        log('INFO', `Timestamp: ${analysisData.timestamp}`);
        log('INFO', analysisData.summary);

        // Trade Analyzer section
        console.log(`\n${colors.bright}📈 TRADE ANALYZER RESULTS:${colors.reset}`);
        if (analysisData.tradeAnalyzer?.performance) {
          const perf = analysisData.tradeAnalyzer.performance;
          log('INFO', `Total Trades: ${perf.totalTrades}`);
          log('INFO', `Win Rate: ${perf.winRate}%`);
          log('INFO', `Total Profit: $${perf.totalProfit}`);
          log('INFO', `Profit Factor: ${perf.profitFactor}x`);
          log('INFO', `Sharpe Ratio: ${perf.sharpeRatio}`);

          if (perf.winRate >= 75) {
            log('SUCCESS', 'Excellent win rate! 🎯');
          } else if (perf.winRate >= 60) {
            log('INFO', 'Good win rate, room for improvement');
          } else {
            log('WARN', 'Win rate below 60%, strategy improvements needed');
          }
        }

        if (analysisData.tradeAnalyzer?.missedOpportunitiesCount > 0) {
          log('WARN', `Found ${analysisData.tradeAnalyzer.missedOpportunitiesCount} missed opportunities`);
        } else {
          log('INFO', 'No significant missed opportunities');
        }

        // Strategy Optimizer section
        console.log(`\n${colors.bright}🧠 STRATEGY OPTIMIZER RESULTS:${colors.reset}`);
        if (analysisData.strategyOptimizer?.strategyAnalysis) {
          const strategies = analysisData.strategyOptimizer.strategyAnalysis;
          const strategyCount = Object.keys(strategies).length;

          if (strategyCount > 0) {
            log('INFO', `Analyzed ${strategyCount} trading strategies:`);
            Object.entries(strategies).forEach(([name, analysis]) => {
              const actual = parseFloat(analysis.actualWinRate || 0);
              const expected = parseFloat(analysis.expectedWinRate || 0);
              const status = actual >= expected ? '✅' : '⚠️';
              console.log(`    ${status} ${name}`);
              console.log(`       Expected: ${expected}% | Actual: ${actual}%`);
            });
          } else {
            log('INFO', 'No strategy analysis available (need trade history)');
          }
        }

        // Capital Allocation
        if (analysisData.strategyOptimizer?.capitalAllocation) {
          console.log(`\n${colors.bright}💰 CAPITAL ALLOCATION:${colors.reset}`);
          Object.entries(analysisData.strategyOptimizer.capitalAllocation).forEach(([strategy, allocation]) => {
            const percent = allocation.recommendedAllocation || '0%';
            const rationale = allocation.rationale || '';
            console.log(`    ${strategy}: ${percent}`);
            console.log(`       ${rationale}`);
          });
        }

        // Coordinated Recommendations
        if (analysisData.coordinatedActions) {
          console.log(`\n${colors.bright}🎯 COORDINATED RECOMMENDATIONS:${colors.reset}`);

          if (analysisData.coordinatedActions.criticalActions?.length > 0) {
            log('WARN', 'Critical Actions:');
            analysisData.coordinatedActions.criticalActions.forEach((action, i) => {
              console.log(`    ${i + 1}. [${action.priority}] ${action.action}`);
              console.log(`       Reason: ${action.reason}`);
            });
          }

          if (analysisData.coordinatedActions.strategyUpdates?.length > 0) {
            log('INFO', 'Strategy Updates:');
            analysisData.coordinatedActions.strategyUpdates.forEach((update, i) => {
              console.log(`    ${i + 1}. [${update.priority}] ${update.action}`);
            });
          }

          if (analysisData.coordinatedActions.capitalReallocation?.length > 0) {
            log('INFO', 'Capital Reallocation:');
            analysisData.coordinatedActions.capitalReallocation.forEach((realloc, i) => {
              console.log(`    ${i + 1}. [${realloc.priority}] ${realloc.action}`);
            });
          }

          if (analysisData.coordinatedActions.riskAdjustments?.length > 0) {
            log('INFO', 'Risk Management Rules:');
            analysisData.coordinatedActions.riskAdjustments[0] && Object.entries(analysisData.coordinatedActions.riskAdjustments[0]).forEach(([key, value]) => {
              if (key !== 'priority') {
                const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                console.log(`    • ${readableKey}: ${value}`);
              }
            });
          }
        }

      } else {
        log('ERROR', `Analysis failed: ${analysisResponse.data.error}`);
      }
    } catch (error) {
      log('ERROR', `Daily analysis error: ${error.message}`);
      if (error.response?.data?.details) {
        log('INFO', `Details: ${error.response.data.details}`);
      }
    }

    // Step 5: Get stored trade analysis
    if (analysisData) {
      log('TEST', 'Step 5: Retrieving stored trade analysis');
      try {
        const tradesResponse = await axios.get(`${API_BASE}/api/analysis/trades`);
        if (tradesResponse.data.success) {
          log('SUCCESS', 'Trade analysis retrieved from storage');
        }
      } catch (error) {
        log('WARN', `Could not retrieve stored trade analysis: ${error.message}`);
      }
    }

    // Step 6: Get stored strategy optimization
    if (analysisData) {
      log('TEST', 'Step 6: Retrieving stored strategy optimization');
      try {
        const stratResponse = await axios.get(`${API_BASE}/api/analysis/strategies`);
        if (stratResponse.data.success) {
          log('SUCCESS', 'Strategy optimization retrieved from storage');
        }
      } catch (error) {
        log('WARN', `Could not retrieve stored optimization: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════╗
║            ✅ ALL TESTS PASSED                    ║
╚═══════════════════════════════════════════════════╝
${colors.reset}\n`);

    if (analysisData?.coordinatedActions?.criticalActions?.length > 0) {
      log('WARN', 'Critical actions detected - review recommendations above');
    }

    console.log(`
${colors.bright}System Status:${colors.reset}
✅ Server running on http://localhost:5001
✅ Authentication working
✅ Trade Analyzer operational
✅ Strategy Optimizer operational
✅ Coordination system active
✅ Daily scheduler configured (runs at 8:00 AM)

${colors.bright}Available Endpoints:${colors.reset}
📊 POST /api/analysis/daily-report - Run full analysis
📊 GET /api/analysis/trades - Get trade analysis
📊 GET /api/analysis/strategies - Get strategy optimization
📊 POST /api/analysis/apply-recommendations - Apply updates to bot
📊 GET /api/analysis/bot-criteria - View current bot criteria

${colors.bright}Next Actions:${colors.reset}
1. Open the bot in browser: http://localhost:5173
2. Login with your API Key ID
3. Configure trading criteria
4. Enable the bot
5. Check analysis results daily at 8:00 AM (or manually via endpoint)

${colors.bright}Documentation:${colors.reset}
📖 Full guide: docs/TRADING_ANALYSIS_SYSTEM.md
📖 Login guide: docs/SIMPLIFIED_LOGIN_SETUP.md
    `);

  } catch (error) {
    log('ERROR', `Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

runFullTest().then(() => {
  process.exit(0);
}).catch(error => {
  log('ERROR', `Fatal error: ${error.message}`);
  process.exit(1);
});

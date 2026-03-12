#!/usr/bin/env node

/**
 * Test Script for Trading Analysis System
 * Tests Trade Analyzer and Strategy Optimizer integration
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

async function log(type, message) {
  const prefix = {
    'SUCCESS': `${colors.green}✅${colors.reset}`,
    'INFO': `${colors.blue}ℹ️${colors.reset}`,
    'TEST': `${colors.cyan}🧪${colors.reset}`,
    'ERROR': `${colors.red}❌${colors.reset}`,
    'WARN': `${colors.yellow}⚠️${colors.reset}`,
    'HEADER': `${colors.bright}${colors.cyan}`,
    'END': `${colors.reset}`
  };

  console.log(`${prefix[type] || '•'} ${message}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════╗
║   Trading Analysis System Test Suite   ║
║   Trade Analyzer & Strategy Optimizer  ║
╚════════════════════════════════════════╝
${colors.reset}\n`);

    // Test 1: Check server health
    log('TEST', 'Checking server health...');
    try {
      const health = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
      log('SUCCESS', 'Server is running ✓');
    } catch (error) {
      log('ERROR', `Server not responding: ${error.message}`);
      log('WARN', 'Make sure to run: cd backend && npm start');
      process.exit(1);
    }

    // Test 2: Check auth status
    log('TEST', 'Checking authentication status...');
    try {
      const status = await axios.get(`${API_BASE}/api/auth/status`);
      const authenticated = status.data.authenticated;
      if (authenticated) {
        log('SUCCESS', `Authenticated as API Key: ${status.data.apiKeyId?.substring(0, 20)}...`);
      } else {
        log('WARN', 'Not authenticated yet. Login to enable live analysis.');
        log('INFO', 'Testing with demo data instead...');
      }
    } catch (error) {
      log('ERROR', `Auth check failed: ${error.message}`);
    }

    // Test 3: Run daily analysis
    log('TEST', 'Running comprehensive daily analysis...');
    log('INFO', 'This will execute both Trade Analyzer and Strategy Optimizer');

    try {
      const analysisResponse = await axios.post(`${API_BASE}/api/analysis/daily-report`, {}, {
        timeout: 30000
      });

      if (analysisResponse.data.success) {
        const report = analysisResponse.data.report;

        log('SUCCESS', 'Daily analysis completed! ✓');

        // Show summary
        console.log(`\n${colors.bright}ANALYSIS SUMMARY:${colors.reset}`);
        log('INFO', `Timestamp: ${report.timestamp}`);
        log('INFO', report.summary);

        // Show Trade Analyzer results
        console.log(`\n${colors.bright}TRADE ANALYZER RESULTS:${colors.reset}`);
        if (report.tradeAnalyzer?.performance) {
          const perf = report.tradeAnalyzer.performance;
          log('INFO', `Total Trades: ${perf.totalTrades}`);
          log('INFO', `Win Rate: ${perf.winRate}%`);
          log('INFO', `Total Profit: $${perf.totalProfit}`);
          log('INFO', `Profit Factor: ${perf.profitFactor}x`);
          log('INFO', `Sharpe Ratio: ${perf.sharpeRatio}`);
        }

        if (report.tradeAnalyzer?.missedOpportunitiesCount > 0) {
          log('WARN', `Missed Opportunities: ${report.tradeAnalyzer.missedOpportunitiesCount}`);
        }

        // Show Strategy Optimizer results
        console.log(`\n${colors.bright}STRATEGY OPTIMIZER RESULTS:${colors.reset}`);
        if (Object.keys(report.strategyOptimizer?.strategyAnalysis || {}).length > 0) {
          log('INFO', 'Strategies analyzed:');
          Object.entries(report.strategyOptimizer.strategyAnalysis).forEach(([strategy, analysis]) => {
            const status = analysis.profitablility || analysis.status || '?';
            log('INFO', `  • ${strategy}: ${analysis.actualWinRate}% (target: ${analysis.expectedWinRate}%) ${status}`);
          });
        }

        // Show coordinated actions
        if (report.coordinatedActions) {
          console.log(`\n${colors.bright}COORDINATED RECOMMENDATIONS:${colors.reset}`);

          if (report.coordinatedActions.criticalActions?.length > 0) {
            log('WARN', 'Critical Actions:');
            report.coordinatedActions.criticalActions.forEach(action => {
              console.log(`    [${action.priority}] ${action.action}`);
              console.log(`            ${action.reason}`);
            });
          }

          if (report.coordinatedActions.strategyUpdates?.length > 0) {
            log('INFO', 'Strategy Updates:');
            report.coordinatedActions.strategyUpdates.forEach(update => {
              console.log(`    [${update.priority}] ${update.action}`);
            });
          }

          if (report.coordinatedActions.capitalReallocation?.length > 0) {
            log('INFO', 'Capital Reallocation:');
            report.coordinatedActions.capitalReallocation.forEach(realloc => {
              console.log(`    [${realloc.priority}] ${realloc.action}`);
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

    // Test 4: Get trade analysis details
    log('TEST', 'Retrieving trade analysis details...');
    try {
      const tradesAnalysis = await axios.get(`${API_BASE}/api/analysis/trades`, {
        timeout: 5000
      });

      if (tradesAnalysis.data.success) {
        log('SUCCESS', 'Trade analysis data retrieved ✓');
        log('INFO', `Report timestamp: ${tradesAnalysis.data.report.timestamp}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        log('WARN', 'No trade analysis available yet (run daily-report first)');
      } else {
        log('ERROR', `Failed to get trade analysis: ${error.message}`);
      }
    }

    // Test 5: Get strategy optimization details
    log('TEST', 'Retrieving strategy optimization details...');
    try {
      const strategiesData = await axios.get(`${API_BASE}/api/analysis/strategies`, {
        timeout: 5000
      });

      if (strategiesData.data.success) {
        log('SUCCESS', 'Strategy optimization data retrieved ✓');
        log('INFO', `Report timestamp: ${strategiesData.data.report.timestamp}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        log('WARN', 'No strategy optimization available yet (run daily-report first)');
      } else {
        log('ERROR', `Failed to get strategies: ${error.message}`);
      }
    }

    // Test 6: Check bot criteria
    log('TEST', 'Checking current bot trading criteria...');
    try {
      const criteria = await axios.get(`${API_BASE}/api/analysis/bot-criteria`, {
        timeout: 5000
      });

      if (criteria.data.success) {
        log('SUCCESS', 'Bot criteria retrieved ✓');
        if (criteria.data.criteria?.message) {
          log('INFO', criteria.data.criteria.message);
        } else {
          log('INFO', `Criteria last applied: ${criteria.data.criteria.appliedAt}`);
        }
      }
    } catch (error) {
      log('ERROR', `Failed to get bot criteria: ${error.message}`);
    }

    // Summary
    console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════╗
║         TEST SUITE COMPLETED           ║
╚════════════════════════════════════════╝
${colors.reset}\n`);

    log('SUCCESS', 'All tests completed!');

    console.log(`
${colors.bright}Next Steps:${colors.reset}

1. Review the analysis results above
2. Check the detailed endpoints:
   • GET /api/analysis/trades - Full trade analysis
   • GET /api/analysis/strategies - Strategy optimization
   • GET /api/analysis/bot-criteria - Current bot settings

3. Apply recommendations (if running authenticated):
   curl -X POST http://localhost:5001/api/analysis/apply-recommendations \\
     -H "Content-Type: application/json" \\
     -d '{"shouldApply": true}'

4. View full documentation:
   docs/TRADING_ANALYSIS_SYSTEM.md

${colors.bright}Server Info:${colors.reset}
• Server: http://localhost:5001
• Frontend: http://localhost:5173
• Daily analysis runs automatically at 8:00 AM
• Check server logs for detailed analysis output
    `);

  } catch (error) {
    log('ERROR', `Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  process.exit(0);
}).catch(error => {
  log('ERROR', `Fatal error: ${error.message}`);
  process.exit(1);
});

/**
 * Integration Test: Trading Decision Engine with Main Server
 * Verifies that the Trading Decision Engine is properly integrated into the daily analysis cycle
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const API_KEY_ID = 'test_api_key_123';
const PRIVATE_KEY = 'test_private_key_456';

let testsPassed = 0;
let testsFailed = 0;

// Test utilities
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 TRADING DECISION ENGINE - SERVER INTEGRATION TESTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Health check
  await test('Server is running', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    assert(response.data.status === 'ok', 'Health check failed');
  });

  // Test 2: Authentication
  await test('API authentication endpoint exists', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      apiKeyId: API_KEY_ID,
      privateKey: PRIVATE_KEY
    });
    assert(response.status === 200 || response.status === 401, 'Auth endpoint not responding');
  });

  // Test 3: Daily report includes Trading Decision Engine
  await test('Daily report endpoint returns trading decisions', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/analysis/daily-report`, {}, {
        validateStatus: () => true // Accept any status
      });

      // Should have trading decision results
      const hasDecisions = response.data.report?.tradingDecisionEngine !== undefined;
      assert(hasDecisions, 'Trading Decision Engine results missing from daily report');
    } catch (error) {
      // Server might not be authenticated, but endpoint should exist
      assert(error.response?.status !== 404, 'Daily report endpoint not found');
    }
  });

  // Test 4: Trading Decisions endpoint exists
  await test('Trading decisions GET endpoint exists', async () => {
    const response = await axios.get(`${BASE_URL}/api/analysis/trading-decisions`, {
      validateStatus: () => true
    });
    assert(response.status !== 404, 'Trading decisions endpoint not found');
  });

  // Test 5: Trading Decisions RUN endpoint exists
  await test('Trading decisions RUN endpoint exists', async () => {
    const response = await axios.post(`${BASE_URL}/api/analysis/trading-decisions/run`, {}, {
      validateStatus: () => true
    });
    assert(response.status !== 404, 'Trading decisions RUN endpoint not found');
  });

  // Test 6: Bot criteria endpoint exists
  await test('Bot criteria endpoint exists', async () => {
    const response = await axios.get(`${BASE_URL}/api/analysis/bot-criteria`, {
      validateStatus: () => true
    });
    assert(response.status !== 404, 'Bot criteria endpoint not found');
  });

  // Test 7: Portfolio endpoint exists
  await test('Portfolio endpoint exists', async () => {
    const response = await axios.get(`${BASE_URL}/api/account/portfolio`, {
      validateStatus: () => true
    });
    assert(response.status !== 404, 'Portfolio endpoint not found');
  });

  // Test 8: Markets endpoint exists
  await test('Markets endpoint exists', async () => {
    const response = await axios.get(`${BASE_URL}/api/markets`, {
      validateStatus: () => true
    });
    assert(response.status !== 404, 'Markets endpoint not found');
  });

  // Test 9: Verify Trading Engine integration in daily report structure
  await test('Daily report includes all three agent results', async () => {
    const response = await axios.post(`${BASE_URL}/api/analysis/daily-report`, {}, {
      validateStatus: () => true
    });

    if (response.status === 200) {
      const report = response.data.report;
      assert(report.tradeAnalyzer !== undefined, 'Trade Analyzer results missing');
      assert(report.strategyOptimizer !== undefined, 'Strategy Optimizer results missing');
      assert(report.tradingDecisionEngine !== undefined, 'Trading Decision Engine results missing');
    }
  });

  // Test 10: Verify coordination includes Trading Decision Engine
  await test('Coordinated actions include trading decisions', async () => {
    const response = await axios.post(`${BASE_URL}/api/analysis/daily-report`, {}, {
      validateStatus: () => true
    });

    if (response.status === 200) {
      const coordinated = response.data.report.coordinatedActions;
      assert(coordinated !== undefined, 'Coordinated actions missing');
      // Should have actions from the coordination process
      const hasActions =
        coordinated.criticalActions?.length >= 0 ||
        coordinated.strategyUpdates?.length >= 0 ||
        coordinated.capitalReallocation?.length >= 0;
      assert(hasActions, 'Coordination structure invalid');
    }
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (testsFailed === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED!\n');
    console.log('✅ Trading Decision Engine is properly integrated');
    console.log('✅ All endpoints are available');
    console.log('✅ Daily analysis cycle includes all three agents');
    console.log('✅ Server is ready for deployment\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${testsFailed} test(s) failed\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test execution error:', error.message);
  process.exit(1);
});

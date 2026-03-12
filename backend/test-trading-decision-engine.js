#!/usr/bin/env node

/**
 * Trading Decision Engine - Comprehensive Test Suite
 * Tests all components: Market scoring, Kelly Criterion, entry/exit decisions, risk management
 */

const TradingDecisionEngine = require('./trading-decision-engine');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function log(type, message) {
  const prefix = {
    'PASS': `${colors.green}✅${colors.reset}`,
    'FAIL': `${colors.red}❌${colors.reset}`,
    'TEST': `${colors.cyan}🧪${colors.reset}`,
    'INFO': `${colors.blue}ℹ️${colors.reset}`,
    'WARN': `${colors.yellow}⚠️${colors.reset}`,
    'HEADER': `${colors.bright}${colors.cyan}`
  };
  console.log(`${prefix[type] || '•'} ${message}`);
}

function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    log('PASS', message);
    return true;
  } else {
    testsFailed++;
    log('FAIL', message);
    return false;
  }
}

function section(title) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log('─'.repeat(60));
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║        Trading Decision Engine - Test Suite                ║
║        Comprehensive validation of all components          ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

  const engine = new TradingDecisionEngine();

  // Test Suite 1: Configuration
  testConfiguration(engine);

  // Test Suite 2: Market Scoring
  testMarketScoring(engine);

  // Test Suite 3: Expected Value Calculation
  testExpectedValue(engine);

  // Test Suite 4: Kelly Criterion Position Sizing
  testKellyCriterion(engine);

  // Test Suite 5: Entry Decision Logic
  testEntryDecisions(engine);

  // Test Suite 6: Exit Decision Logic
  testExitDecisions(engine);

  // Test Suite 7: Risk Management
  testRiskManagement(engine);

  // Test Suite 8: Integration Tests
  await testIntegration(engine);

  // Summary
  printSummary();
}

function testConfiguration(engine) {
  section('Test Suite 1: Configuration Validation');

  assert(engine.config.minProbability === 0.70, 'Min probability set to 70%');
  assert(engine.config.minExpectedValue === 0.020, 'Min EV set to 2%');
  assert(engine.config.maxPositionSize === 0.40, 'Max position size set to 40%');
  assert(engine.config.maxTotalAllocation === 0.80, 'Total allocation set to 80%');
  assert(engine.config.stopLoss === 0.02, 'Stop loss set to 2%');
  assert(engine.config.profitTarget === 0.05, 'Profit target set to 5%');
  assert(engine.config.kellyMultiplier === 0.5, 'Using half-Kelly for safety');
}

function testMarketScoring(engine) {
  section('Test Suite 2: Market Scoring Algorithm');

  // Test market 1: High probability, good yield, high liquidity
  const market1 = {
    id: 'market_1',
    title: 'Test Market 1',
    price: 0.75,
    volume_24h: 150000,
    estimatedYield: 0.06,
    momentum: 'strong_up'
  };

  const prob1 = engine.estimateProbability(market1, null);
  assert(prob1 >= 70, `Market 1 probability estimated >= 70% (got ${prob1.toFixed(1)}%)`);

  const yield1 = engine.calculateYieldScore(market1);
  assert(yield1 > 20, `Market 1 yield score > 20 (got ${yield1.toFixed(0)})`);

  const timing1 = engine.calculateTimingScore(market1);
  assert(timing1 === 100, 'Strong up momentum scores 100');

  const liquidity1 = engine.calculateLiquidityScore(market1);
  assert(liquidity1 === 100, 'High liquidity (150k) scores 100');

  // Test market 2: Low probability, low yield
  const market2 = {
    id: 'market_2',
    title: 'Test Market 2',
    price: 0.20,
    volume_24h: 25000,
    estimatedYield: 0.02,
    momentum: 'down'
  };

  const prob2 = engine.estimateProbability(market2, null);
  assert(prob2 < 40, `Market 2 probability estimated < 40% (got ${prob2.toFixed(1)}%)`);

  const liquidity2 = engine.calculateLiquidityScore(market2);
  assert(liquidity2 === 25, 'Low liquidity (25k) scores 25');

  // Test market 3: Neutral conditions
  const market3 = {
    id: 'market_3',
    title: 'Test Market 3',
    price: 0.50,
    volume_24h: 50000,
    estimatedYield: 0.04,
    momentum: 'neutral'
  };

  const timing3 = engine.calculateTimingScore(market3);
  assert(timing3 === 50, 'Neutral momentum scores 50');
}

function testExpectedValue(engine) {
  section('Test Suite 3: Expected Value Calculation');

  // Test 1: High probability, high yield = High EV
  const ev1 = engine.calculateExpectedValue(0.75, 0.06, 0.02);
  const expected1 = (0.75 * 0.06) - (0.25 * 0.02);
  assert(Math.abs(ev1 - expected1) < 0.001, `EV calculation correct (expected ${expected1.toFixed(4)}, got ${ev1.toFixed(4)})`);
  assert(ev1 >= 0.0399, 'High probability + high yield produces high EV (> 0.03999)');

  // Test 2: Low probability, low yield = Low EV
  const ev2 = engine.calculateExpectedValue(0.55, 0.03, 0.02);
  const expected2 = (0.55 * 0.03) - (0.45 * 0.02);
  assert(ev2 < 0.02, 'Low probability + low yield produces low EV');

  // Test 3: Edge case: 50% probability
  const ev3 = engine.calculateExpectedValue(0.50, 0.04, 0.02);
  const expected3 = (0.50 * 0.04) - (0.50 * 0.02); // Should be 0.01
  assert(Math.abs(ev3 - expected3) < 0.001, `50% probability EV = (50% × 4%) - (50% × 2%) = ${expected3.toFixed(4)}`);

  // Test 4: Breakeven analysis
  const ev4 = engine.calculateExpectedValue(0.60, 0.05, 0.02);
  assert(ev4 > 0, '60% win rate with 5% return beats 2% loss');
}

function testKellyCriterion(engine) {
  section('Test Suite 4: Kelly Criterion Position Sizing');

  // Test 1: Conservative scenario
  const prob1 = 0.72;
  const yield1 = 0.06;
  const capital1 = 100;

  const size1 = engine.calculatePositionSize(prob1, yield1, capital1);
  assert(size1 > 0, `Conservative scenario produces positive position size (${size1.toFixed(2)})`);
  assert(size1 <= capital1 * engine.config.maxPositionSize, 'Position size respects max limit');

  // Test 2: Aggressive scenario (high confidence)
  const prob2 = 0.80;
  const yield2 = 0.08;
  const capital2 = 100;

  const size2 = engine.calculatePositionSize(prob2, yield2, capital2);
  assert(size2 > size1, 'Higher probability produces larger position');

  // Test 3: Risky scenario (low confidence)
  const prob3 = 0.60;
  const yield3 = 0.04;
  const capital3 = 100;

  const size3 = engine.calculatePositionSize(prob3, yield3, capital3);
  assert(size3 > 0, 'Low confidence still produces position');
  assert(size3 < size1, 'Low confidence produces smaller position');

  // Test 4: Insufficient capital
  const size4 = engine.calculatePositionSize(0.75, 0.06, 0);
  assert(size4 === 0, 'Zero capital produces zero position size');

  // Test 5: Half-Kelly application
  log('INFO', `Kelly Criterion using 0.5x multiplier for safety (doubling factor of 2)`);
}

function testEntryDecisions(engine) {
  section('Test Suite 5: Entry Decision Logic');

  // Test 1: High probability, high EV, good score = ENTER
  const market1 = {
    id: 'market_1',
    price: 0.75,  // 75% probability
    volume_24h: 100000,
    estimatedYield: 0.08,
    momentum: 'strong_up'
  };
  const prob1 = engine.estimateProbability(market1, null);
  const ev1 = engine.calculateExpectedValue(prob1 / 100, 0.08, 0.02);
  const score1 = 75; // Good market score
  const decision1 = engine.makeMarketDecision(prob1, ev1, score1);
  assert(decision1.decision === 'ENTER', `High prob ${prob1.toFixed(0)}% + EV ${(ev1*100).toFixed(2)}% = ENTER`);

  // Test 2: Low probability = SKIP
  const prob2 = 55;
  const ev2 = 0.02;
  const decision2 = engine.makeMarketDecision(prob2, ev2, 75);
  assert(decision2.decision === 'SKIP', 'Low probability < 70% = SKIP');

  // Test 3: Low EV = WAIT
  const prob3 = 75;
  const ev3 = 0.01;
  const decision3 = engine.makeMarketDecision(prob3, ev3, 75);
  assert(decision3.decision === 'WAIT', 'Low EV < 2% = WAIT');

  // Test 4: Low market score = SKIP
  const prob4 = 75;
  const ev4 = 0.03;
  const decision4 = engine.makeMarketDecision(prob4, ev4, 55);
  assert(decision4.decision === 'SKIP', 'Low score < 60 = SKIP');
}

function testExitDecisions(engine) {
  section('Test Suite 6: Exit Decision Logic');

  const position = {
    ticker: 'MARKET_TEST',
    entryPrice: 0.50,
    entryTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    quantity: 10
  };

  // Test 1: Profit target hit (5% gain)
  const exit1 = engine.evaluateExitTriggers(position, 0.525, 24, 75);
  assert(exit1 === 'PROFIT_TARGET_HIT', 'Exit triggered at 5% profit');

  // Test 2: Stop loss hit (-2% loss)
  const exit2 = engine.evaluateExitTriggers(position, 0.49, 24, 75);
  assert(exit2 === 'STOP_LOSS_HIT', 'Exit triggered at 2% loss');

  // Test 3: Probability deteriorated
  const exit3 = engine.evaluateExitTriggers(position, 0.505, 24, 55);
  assert(exit3 === 'PROBABILITY_DETERIORATED', 'Exit triggered when probability < 60%');

  // Test 4: Max hold time exceeded
  const exit4 = engine.evaluateExitTriggers(position, 0.505, 73, 75);
  assert(exit4 === 'MAX_HOLD_TIME_EXCEEDED', 'Exit triggered after 72+ hours');

  // Test 5: No exit trigger
  const exit5 = engine.evaluateExitTriggers(position, 0.505, 24, 75);
  assert(exit5 === null, 'No exit trigger when conditions favorable');
}

function testRiskManagement(engine) {
  section('Test Suite 7: Risk Management Validation');

  const portfolio = {
    cash: 100,
    total_value: 150,
    open_positions: []
  };

  // Test 1: Available capital calculation
  const available = engine.calculateAvailableCapital(portfolio);
  assert(available === 80, `Available capital = 80% of cash (got ${available})`);

  // Test 2: Position size respects max limit
  const size = engine.calculatePositionSize(0.75, 0.06, 100);
  assert(size / 100 <= engine.config.maxPositionSize, 'Position respects 40% max');

  // Test 3: Risk validation
  const plan = {
    openPositions: [
      { size: 30 },
      { size: 25 },
      { size: 20 }
    ]
  };
  const validation = engine.validateRiskManagement(portfolio, plan);
  assert(validation.passed, 'Risk validation passes for reasonable allocation');
  assert(validation.violations.length === 0, 'No violations detected');

  // Test 4: Risk violation detection
  const badPlan = {
    openPositions: [
      { size: 50 },
      { size: 50 }
    ]
  };
  const badValidation = engine.validateRiskManagement(portfolio, badPlan);
  assert(!badValidation.passed, 'Risk validation catches violations');
  assert(badValidation.violations.length > 0, 'Violations identified');
}

async function testIntegration(engine) {
  section('Test Suite 8: Integration Tests');

  // Prepare test data
  const portfolio = {
    cash: 100,
    total_value: 150,
    open_positions: []
  };

  const markets = [
    {
      id: 'market_1',
      title: 'Market 1: Strong Buy Signal',
      price: 0.22,
      volume_24h: 120000,
      estimatedYield: 0.08,
      momentum: 'strong_up'
    },
    {
      id: 'market_2',
      title: 'Market 2: Moderate Buy',
      price: 0.35,
      volume_24h: 80000,
      estimatedYield: 0.05,
      momentum: 'up'
    },
    {
      id: 'market_3',
      title: 'Market 3: Skip This',
      price: 0.65,
      volume_24h: 25000,
      estimatedYield: 0.03,
      momentum: 'down'
    }
  ];

  const analysisResults = {
    tradeAnalyzer: {
      trades: []
    }
  };

  // Test: Full decision cycle
  try {
    const result = await engine.runDailyDecisionCycle(portfolio, markets, analysisResults);

    assert(result !== null, 'Decision cycle completes successfully');
    assert(result.recommendations !== null, 'Recommendations generated');
    assert(result.validation !== null, 'Risk validation performed');

    log('INFO', `Full cycle analyzed ${markets.length} markets`);
    log('INFO', `Generated ${result.recommendations.entries?.length || 0} entry recommendations`);
    log('INFO', `Risk validation: ${result.validation.passed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    log('FAIL', `Integration test failed: ${error.message}`);
  }
}

function printSummary() {
  section('Test Results Summary');

  const passRate = (testsPassed / testsRun * 100).toFixed(1);
  const color = testsFailed === 0 ? colors.green : colors.yellow;

  console.log(`
${color}
Tests Run:    ${testsRun}
Tests Passed: ${testsPassed} ${colors.green}✅${colors.reset}
Tests Failed: ${testsFailed} ${testsFailed > 0 ? colors.red + '❌' : colors.green + '✅'}${colors.reset}
Pass Rate:    ${passRate}%
${colors.reset}
`);

  if (testsFailed === 0) {
    console.log(`${colors.green}${colors.bright}✅ ALL TESTS PASSED - READY FOR DEPLOYMENT${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}${colors.bright}⚠️  SOME TESTS FAILED - FIX BEFORE DEPLOYMENT${colors.reset}\n`);
    return 1;
  }
}

// Run all tests
runAllTests().then(code => {
  process.exit(code);
}).catch(error => {
  log('FAIL', `Test suite error: ${error.message}`);
  process.exit(1);
});

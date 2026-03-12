const axios = require('axios');

const KALSHI_API_BASE = 'https://kalshi.com/api/v2';
const API_KEY_ID = process.env.API_KEY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CRITERIA = JSON.parse(process.env.CRITERIA || '[]');
const POLL_INTERVAL = 5000; // 5 seconds

const auth = {
  username: API_KEY_ID,
  password: PRIVATE_KEY
};

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Kalshi-Trading-Bot/1.0',
};

// Track trades to avoid duplicates
const executedTrades = new Set();

// Get markets and check against criteria
async function checkMarketsAndTrade() {
  try {
    console.log(`[${new Date().toISOString()}] Checking markets...`);

    // Fetch open markets
    const marketsResponse = await axios.get(`${KALSHI_API_BASE}/markets?status=open`, {
      auth,
      headers,
      timeout: 10000
    });

    const markets = marketsResponse.data.markets || [];
    console.log(`Found ${markets.length} open markets`);

    // Check each market against criteria
    for (const market of markets) {
      for (const criterium of CRITERIA) {
        const match = evaluateCriteria(market, criterium);

        if (match) {
          console.log(`\n✅ MATCH FOUND:`);
          console.log(`   Market: ${market.title}`);
          console.log(`   Ticker: ${market.ticker}`);
          console.log(`   Criteria: ${criterium.name}`);
          console.log(`   Price: ${market.last_price}`);

          // Execute trade
          await executeTrade(market, criterium);
        }
      }
    }
  } catch (error) {
    console.error(`[Error] ${error.message}`);
  }
}

// Evaluate if market matches criteria
function evaluateCriteria(market, criterium) {
  const tradeId = `${market.ticker}-${criterium.name}`;

  // Skip if already executed
  if (executedTrades.has(tradeId)) {
    return false;
  }

  // Check criteria type
  switch (criterium.strategy) {
    case 'favorite_bias':
      // If favorite (yes contract) is below threshold price, buy
      if (market.last_price <= criterium.maxPrice) {
        return true;
      }
      break;

    case 'favorite_fade':
      // If favorite is above threshold, sell
      if (market.last_price >= criterium.minPrice) {
        return true;
      }
      break;

    case 'correlation_arbitrage':
      // Check if implied probability > market price threshold
      if (market.last_price >= criterium.minPrice && market.last_price <= criterium.maxPrice) {
        return true;
      }
      break;

    default:
      return false;
  }

  return false;
}

// Execute trade on Kalshi
async function executeTrade(market, criterium) {
  try {
    const tradeId = `${market.ticker}-${criterium.name}`;

    const orderData = {
      ticker: market.ticker,
      side: criterium.side || 'buy',
      price: Math.ceil(market.last_price * 100) / 100, // Round up to nearest cent
      quantity: 1 // $5 trade
    };

    console.log(`   📤 Placing order: ${JSON.stringify(orderData)}`);

    const response = await axios.post(`${KALSHI_API_BASE}/orders`, orderData, {
      auth,
      headers,
      timeout: 10000
    });

    if (response.data.order_id) {
      executedTrades.add(tradeId);
      console.log(`   ✅ Trade executed! Order ID: ${response.data.order_id}`);
    }
  } catch (error) {
    console.error(`   ❌ Trade failed: ${error.message}`);

    if (error.response?.data) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// Main bot loop
async function startBot() {
  console.log('\n🤖 Trading Bot Started');
  console.log(`📋 Criteria: ${CRITERIA.map(c => c.name).join(', ')}`);
  console.log(`⏱️  Polling every ${POLL_INTERVAL / 1000} seconds\n`);

  // Check immediately, then set interval
  await checkMarketsAndTrade();

  setInterval(checkMarketsAndTrade, POLL_INTERVAL);
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\n🛑 Bot shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Bot shutting down...');
  process.exit(0);
});

// Start the bot
startBot().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

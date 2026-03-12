# 🚀 QUICK START - LAUNCH IN 5 MINUTES

## Pre-Launch Checklist (Do This First)

### 1. Verify System Files
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot/backend

# Check all files exist
ls -la | grep -E "(trading-decision-engine|kalshi-server-oauth|trade-analyzer|strategy-optimizer)"
```

**Expected Output:**
- trading-decision-engine.js ✅
- kalshi-server-oauth.js ✅
- trade-analyzer.js ✅
- strategy-optimizer.js ✅

### 2. Check Node Dependencies
```bash
npm list express axios cors dotenv

# Should show versions for all packages
```

---

## Launch Procedure

### STEP 1: Start the Server (Terminal 1)
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot/backend
npm start
```

**Expected Output:**
```
✅ Server running on http://localhost:5001
✅ CORS enabled for http://localhost:5173
🤖 Three-Agent System Integrated:
   1️⃣  Trade Analyzer
   2️⃣  Strategy Optimizer
   3️⃣  Trading Decision Engine
📊 Daily analysis will run at 8:00 AM daily
⏰ Daily analysis scheduled for [TIME]
```

**Wait until you see:** `Daily analysis scheduled` message

### STEP 2: Run Integration Tests (Terminal 2)
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot/backend
node test-integration-trading-engine.js
```

**Expected Output:**
```
✅ Server is running
✅ API authentication endpoint exists
✅ Daily report endpoint returns trading decisions
✅ Trading decisions GET endpoint exists
✅ Trading decisions RUN endpoint exists
... (all tests pass)

🎉 ALL INTEGRATION TESTS PASSED!
✅ Trading Decision Engine is properly integrated
✅ All endpoints are available
✅ Daily analysis cycle includes all three agents
✅ Server is ready for deployment
```

### STEP 3: Verify Endpoints (Terminal 3)
```bash
# Test the health endpoint
curl http://localhost:5001/health

# Expected: {"status":"ok","timestamp":"..."}

# Test trading decisions endpoint
curl http://localhost:5001/api/analysis/trading-decisions

# Expected: Either data or "Not authenticated" (both OK at this stage)
```

### STEP 4: Open the Bot Interface
```bash
# In a browser, navigate to:
http://localhost:5173

# Or from the project directory:
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot
# Open the frontend
```

---

## 📊 Daily Analysis Operation

### Automatic (Default)
```
✅ Runs automatically every day at 8:00 AM
✅ Logs show: "🤖 ⏰ Scheduled daily analysis starting..."
✅ All results stored and available via API
✅ No manual intervention needed
```

### Manual (If Needed)
```bash
# Trigger analysis manually (for testing or urgent need)
curl -X POST http://localhost:5001/api/analysis/daily-report \
  -H "Content-Type: application/json" \
  -d '{}'

# Response includes all trading decisions
```

---

## 🎯 First Trade Setup

### 1. Authenticate
- Open bot interface: http://localhost:5173
- Click "Login with API Key"
- Enter your Kalshi API Key ID and Private Key
- Click "Authenticate"

### 2. Start Bot
- Click "Enable Trading"
- Bot will start accepting trades from analysis

### 3. Monitor First Analysis
- System will run at 8:00 AM or whenever next cycle triggers
- Check bot interface for "Daily Analysis Complete"
- Review recommendations

### 4. Apply Recommendations
- Review trading decisions
- Click "Apply Recommendations" to execute trades
- OR manually review and execute

---

## 📈 What to Expect

### Every 8:00 AM
1. ✅ Trade Analyzer runs → Evaluates past trades
2. ✅ Strategy Optimizer runs → Optimizes criteria
3. ✅ Trading Decision Engine runs → Scores markets & sizes positions
4. ✅ Results coordinated → Single action plan generated
5. ✅ Stored for review → Available via API/interface

### Daily Metrics You'll See
- **Win Rate:** % of profitable trades
- **Profit Factor:** Gross profit / Gross loss
- **Average Trade:** Avg return per trade
- **Total P&L:** Daily profit/loss

### Recommendations You'll Get
- **Entry Signals:** New markets to trade
- **Exit Signals:** Positions to close
- **Position Sizing:** How much to allocate
- **Risk Alerts:** Any limit violations

---

## 🚨 If Something Goes Wrong

### Server Won't Start
```bash
# Check port 5001 is free
lsof -i :5001

# If occupied, kill process
kill -9 [PID]

# Then try npm start again
```

### Tests Fail
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Trading Decisions Not Generated
```bash
# Check authentication
# Verify API keys are valid
# Check market data is loading
# Review console for error messages
```

### Need to Stop Everything
```bash
# Press Ctrl+C in each terminal
# Or kill the processes
pkill -f "npm start"
pkill -f "node"
```

---

## 📱 Accessing Results

### Via API
```bash
# Get latest trading decisions
curl http://localhost:5001/api/analysis/trading-decisions

# Get trade analysis
curl http://localhost:5001/api/analysis/trades

# Get strategy optimization
curl http://localhost:5001/api/analysis/strategies

# Get bot criteria
curl http://localhost:5001/api/analysis/bot-criteria
```

### Via Web Interface
```
http://localhost:5173

Navigate to:
- Dashboard → Daily metrics
- Analysis → See recommendations
- Trading → Execute trades
- Logs → Review decisions
```

---

## 🎮 Manual Controls

### Run Trading Decision Engine Only
```bash
curl -X POST http://localhost:5001/api/analysis/trading-decisions/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Run Full Analysis
```bash
curl -X POST http://localhost:5001/api/analysis/daily-report \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Apply Recommendations to Bot
```bash
curl -X POST http://localhost:5001/api/analysis/apply-recommendations \
  -H "Content-Type: application/json" \
  -d '{"shouldApply": true}'
```

---

## ✅ Launch Verification Checklist

- [ ] Server starts without errors
- [ ] Integration tests all pass
- [ ] Health endpoint responds
- [ ] Trading decisions endpoint accessible
- [ ] Web interface loads at http://localhost:5173
- [ ] Can authenticate with API keys
- [ ] Daily scheduler shows next run time
- [ ] No errors in console logs

---

## 🎬 You're Ready!

```
✅ System integrated
✅ All tests passing
✅ Server running
✅ APIs working
✅ Safety systems active
✅ Daily automation scheduled

🚀 Ready to begin automated trading!
```

### Start with These Steps:
1. Run npm start (server in Terminal 1)
2. Run integration tests (Terminal 2)
3. Open bot interface (Browser)
4. Authenticate with API keys
5. Enable trading
6. Monitor 8:00 AM analysis
7. Apply recommendations
8. Watch your portfolio grow!

---

## 📞 Troubleshooting Quick Links

- **Server Issues:** Check npm start output
- **API Issues:** Verify http://localhost:5001/health
- **Auth Issues:** Confirm API keys in environment
- **Trading Issues:** Check bot is enabled in interface
- **Data Issues:** Verify market data is loading
- **Log Issues:** Check console.log output for errors

---

## 🎯 Success Metrics (First 30 Days)

Monitor these:
- Win Rate: Target 70%+
- Profit Factor: Target 2.0+
- Monthly Return: Target 10-15%
- Max Drawdown: Keep < 10%

---

## 📚 Full Documentation

If you need more details:
- Read: `INTEGRATION_SUMMARY.md` - What was integrated
- Read: `DEPLOYMENT_READINESS.md` - Complete checklist
- Read: `LAUNCH_READINESS.md` - Phase-by-phase guide
- Read: `TRADING_ENGINE_SPECIFICATION.md` - Technical details

---

**Status:** 🟢 READY TO LAUNCH

**Next Step:** Run the commands in STEP 1 and 2 above!

Let's get trading! 🚀

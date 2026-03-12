# 🚀 Quick Start macOS (5 minutes)

Get your Kalshi trading bot running in under 5 minutes.

## Prerequisites

- macOS 10.15+
- Node.js 16+ (`node --version` to check)
- Kalshi account with login credentials

## ⏱️ 5-Minute Setup

### Step 1: Install (2 minutes)

```bash
# From project root
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure (1 minute)

```bash
# From project root
cp .env.example .env
```

Edit `.env`:
```
KALSHI_EMAIL=your-email@example.com
KALSHI_PASSWORD=your-password
```

### Step 3: Run Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Should show: `Kalshi Trading Bot Server running on http://localhost:5000`

**Terminal 2 - Frontend (new terminal):**
```bash
cd frontend
npm run dev
```
✅ Should show: `Local: http://localhost:5173`

### Step 4: Start Trading (1 minute)

1. Open http://localhost:5173 in browser
2. Sign in with your Kalshi email & password
3. Add a trading criterion ("Favorite Below 75¢")
4. Click "▶️ Start Trading Bot"
5. Watch Activity Log for trades

## 🎯 That's It!

Your bot is now:
- ✅ Monitoring Kalshi markets every 5 seconds
- ✅ Executing trades when your criteria match
- ✅ Logging all activity in the dashboard

## 📋 Next: Add More Criteria

In the "⚙️ Trading Criteria" tab:

**Suggested Additions:**
- Favorite Below 70¢ (more aggressive)
- Favorite Above 85¢ (sell overpriced)
- Correlation Arbitrage (advanced)

## 🛑 If Something Goes Wrong

| Issue | Fix |
|-------|-----|
| `Cannot find module 'express'` | Run `npm install` in backend |
| `Port 5000 already in use` | Change PORT in .env or kill process |
| `Invalid credentials` | Double-check email/password in .env |
| `CORS error` | Make sure backend is running on 5000 |
| `Markets not loading` | Check network tab (F12), may be API issue |

## 🔄 Quick Restart

```bash
# Stop all (Ctrl+C in both terminals)

# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

## 💾 Persistent Settings

Your trading criteria and preferences are stored in browser localStorage. They'll persist even after closing.

To reset: Clear browser cache/localStorage or open in incognito mode.

## 🚀 Next Steps

1. **Monitor first 10 trades** - See how bot performs
2. **Adjust criteria** - Add/remove based on results
3. **Track ROI** - Calculate actual returns vs expected
4. **Scale up** - Once confident, add more aggressive strategies

## 📖 Full Documentation

For detailed setup, troubleshooting, or advanced config:
- **Setup details**: See MACOS_SETUP.md
- **Understanding everything**: See README.md
- **Strategy details**: See docs/kalshi-criteria-config.json

---

**Happy trading!** 📈

Questions? Check README.md troubleshooting section.

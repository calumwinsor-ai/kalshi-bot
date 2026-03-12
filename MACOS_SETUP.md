# 📖 Detailed macOS Setup Guide

Complete step-by-step walkthrough with explanations and troubleshooting.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running)
5. [First Trade](#first-trade)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Check Node.js
```bash
node --version  # Should be 16.0.0 or higher
npm --version   # Should be 7.0.0 or higher
```

If not installed, get from: https://nodejs.org/

### Have Your Kalshi Credentials Ready
- Email: The one you signed up with
- Password: Your account password
- (You don't need API keys - OAuth handles it!)

### Open Two Terminals
You'll need:
1. Terminal for backend server
2. Terminal for frontend server

**Tip**: Use iTerm2 or built-in Terminal. Both work fine.

## Installation

### Step 1: Navigate to Project Directory
```bash
cd /Users/your-username/Desktop/Claude/kalshi-bot
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

What it does:
- Installs Express.js (web server)
- Installs Axios (API requests)
- Installs CORS (cross-origin requests)
- Installs dotenv (environment variables)

Expected output:
```
added 57 packages in 8s
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

What it does:
- Installs React
- Installs Vite (build tool)
- Sets up dev environment

Expected output:
```
added 312 packages in 12s
```

**Total install time:** ~30 seconds total

## Configuration

### Step 4: Create .env File
```bash
# From project root (kalshi-bot/)
cp .env.example .env
```

### Step 5: Edit .env with Your Credentials
```bash
nano .env
# or
open -a TextEdit .env
```

**What to change:**
```
KALSHI_EMAIL=your-email@example.com          ← Your Kalshi email
KALSHI_PASSWORD=your-password-here           ← Your Kalshi password
```

Keep everything else the same.

**Save and close** (Ctrl+X then Y in nano)

### Step 6: Verify .env is Private
```bash
cat .env    # View current .env
```

⚠️ **Security reminder:**
- `.env` is in `.gitignore` (never committed)
- Only you should see this file
- Never share or upload

## Running

### Step 7: Start Backend Server

**Terminal 1:**
```bash
# Make sure you're in the backend directory
cd /Users/your-username/Desktop/Claude/kalshi-bot/backend

# Start the server
npm start
```

**Expected output:**
```
🚀 Kalshi Trading Bot Server running on http://localhost:5000
✅ Environment: development
📍 CORS enabled for frontend on http://localhost:5173
```

✅ Backend is ready!

### Step 8: Start Frontend Server

**Terminal 2 (NEW terminal):**
```bash
cd /Users/your-username/Desktop/Claude/kalshi-bot/frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.2  ready in 232 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Frontend is ready!

### Step 9: Open in Browser

1. Click or copy: http://localhost:5173
2. Should see login page with purple gradient
3. Enter your Kalshi credentials

**What happens:**
1. You enter email/password
2. Backend securely authenticates with Kalshi
3. You get a session token
4. Dashboard loads with your portfolio info

## First Trade

### Step 10: Add Your First Criteria

1. Click "⚙️ Trading Criteria" tab
2. Fill in the form:
   - **Name:** "Favorite Below 75¢"
   - **Strategy:** "Favorite Bias (Buy)"
   - **Side:** "Buy"
   - **Max Price:** "0.75"
3. Click "➕ Add Criteria"
4. Criteria appears in the list below

### Step 11: Start the Bot

1. Go back to "📊 Dashboard" tab
2. Click "▶️ Start Trading Bot"
3. Should see: "🤖 Trading Bot started with 1 criteria"
4. Status bar changes to "🟢 Trading Active"

### Step 12: Monitor Trades

1. Click "📈 Activity" tab
2. Watch for executed trades
3. Each trade shows:
   - Market (ticker)
   - Side (Buy/Sell)
   - Price
   - Timestamp

**Your first trade should happen within a few minutes!** ⏱️

## Managing the Application

### Stopping the Bot
- Click "⏹️ Stop Bot" in Dashboard
- Status changes to "🔴 Stopped"

### Stopping Servers
```bash
# Terminal 1 (Backend)
Press Ctrl+C

# Terminal 2 (Frontend)
Press Ctrl+C
```

### Restarting Everything
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

### Logging Out
- Click "Logout" button in top-right
- Returns to login page
- Session token is cleared
- Bot stops (if running)

## Troubleshooting

### "npm: command not found"

**Problem:** Node.js isn't installed or not in PATH

**Fix:**
```bash
# Check if installed
node --version

# If not, install from nodejs.org
# After install, restart terminal and try again
```

### "Port 5000 already in use"

**Problem:** Another app is using port 5000

**Fix Option 1:** Kill the process
```bash
# Find what's using 5000
lsof -i :5000

# Kill it (note the PID)
kill -9 PID
```

**Fix Option 2:** Use different port
```bash
# Edit .env
PORT=5001

# Restart backend
npm start
```

### "Cannot find module 'express'"

**Problem:** npm install didn't work

**Fix:**
```bash
# Make sure you're in backend directory
cd backend

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### "Invalid credentials"

**Problem:** Email or password is wrong

**Fix:**
```bash
# Check your .env file
cat .env

# Verify:
# 1. Email matches your Kalshi account
# 2. Password is correct (no typos)
# 3. Account is active

# Update and try again
nano .env
```

### "CORS error in browser console"

**Problem:** Frontend can't reach backend

**Fix:**
```bash
# Verify backend is running
# Terminal 1 should show: "Server running on http://localhost:5000"

# If not, start it:
cd backend && npm start
```

### "Markets not loading"

**Problem:** API request failed

**Checks:**
1. Backend running? → Terminal 1 check
2. Authenticated? → Click login again
3. Kalshi API down? → Check their status page
4. Network issue? → Check F12 → Network tab

### "Bot won't start"

**Problem:** Usually need at least 1 criteria

**Fix:**
1. Go to "⚙️ Trading Criteria"
2. Add at least one criteria
3. Go back to "📊 Dashboard"
4. Try starting bot again

### "Criteria not working / no trades"

**Problem:** Criteria might be too strict

**Fix:**
1. Check market prices in Activity tab
2. Adjust price thresholds:
   - Too low? Increase max price
   - Too high? Decrease min price
3. Add second/third criteria for more coverage

### "Lost my trading criteria"

**Problem:** Browser cache was cleared

**Solution:**
- Criteria saved in browser localStorage
- Clearing cache = loss of settings
- Re-add criteria (takes 1 minute)
- Avoid clearing cache while using app

## Performance Tips

### For Faster Performance

1. **Use Chrome/Safari** instead of Firefox
2. **Close other tabs** during trading
3. **Solid internet connection** for API calls
4. **Restart servers weekly** to refresh memory

### Monitor Resource Usage

```bash
# In Terminal 3, check CPU/memory
top

# Press Q to exit
```

## Next Steps

1. ✅ Servers running
2. ✅ First trade executed
3. ⏭️ Add 2-3 more criteria
4. ⏭️ Monitor for 3-5 trades
5. ⏭️ Evaluate ROI and adjust
6. ⏭️ Run 24/7 for better results

## Daily Operations

### Morning Checklist
```bash
# 1. Start backend (Terminal 1)
cd backend && npm start

# 2. Start frontend (Terminal 2)
cd frontend && npm run dev

# 3. Open http://localhost:5173
# 4. Check if bot needs to be started
# 5. Review Activity Log from yesterday
```

### Evening
- Review trades from the day
- Check portfolio growth
- Adjust criteria if needed
- Can leave running overnight

### Weekly
- Review all criteria performance
- Remove underperforming criteria
- Add new ones if desired
- Restart servers fresh

## Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ Never commit `.env` with real credentials
- ✅ Only you have read access to `.env`
- ✅ Password only in backend .env (never frontend)
- ✅ Session tokens expire after 24 hours
- ✅ Re-login monthly for fresh tokens

## System Requirements

| Component | Requirement | Your System |
|-----------|-------------|-------------|
| macOS | 10.15+ | ✅ |
| Node.js | 16+ | Run `node --version` |
| RAM | 2GB minimum | Typical Mac: ✅ |
| Disk | 500MB | ✅ |
| Network | Stable | ✅ |

## Getting Help

| Problem | Where to Check |
|---------|-----------------|
| Setup issues | This file (MACOS_SETUP.md) |
| Quick answers | QUICK_START_MACOS.md |
| Understanding code | README.md |
| Strategy details | docs/kalshi-criteria-config.json |
| Terminal errors | Copy entire error message and google it |
| Browser console | F12 → Console tab → Check for errors |

---

**Stuck?** Most issues have solutions above. Read the error message carefully - it usually tells you what's wrong!

Ready to trade? Follow the sections in order, and you'll be up and running in ~15 minutes total.

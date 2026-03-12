# Deployment Guide - Railway.app

This guide walks you through deploying the Kalshi Trading Bot to Railway.app for live trading.

## Prerequisites
- GitHub account with this repo
- Railway.app account (free signup)
- Your Kalshi API Private Key (from Kalshi.com → Settings → API Keys)

## Deployment Steps

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repos

### Step 2: Deploy to Railway
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub"
3. Search for your "kalshi-bot" repository
4. Click to select it
5. Railway will auto-detect it's a Node.js project
6. Click "Deploy"

### Step 3: Configure Environment Variables
1. In Railway dashboard, go to your project
2. Click on the "Variables" tab
3. Add these environment variables:

```
PORT=5001
NODE_ENV=production
KALSHI_PRIVATE_KEY=<paste_your_entire_private_key_here>
VITE_API_BASE=<your_railway_url>/api
```

To get your Railway URL:
- After deployment, go to "Settings" tab
- Copy the "Railway Provided Domain" (e.g., https://kalshi-bot.up.railway.app)
- Set VITE_API_BASE to: `https://kalshi-bot.up.railway.app`

### Step 4: Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your "kalshi-bot" repository
4. Set environment variable:
   ```
   VITE_API_BASE=https://kalshi-bot.up.railway.app
   ```
5. Deploy

### Step 5: Test Live Trading
1. Visit your Vercel frontend URL (e.g., https://kalshi-bot-frontend.vercel.app)
2. Login with your Kalshi API Key ID
3. Go to Settings (⚙️)
4. Paste your Kalshi Private Key
5. Click "Save & Enable Live Trading"
6. Go to "Live Trading" tab
7. Click on any recommendation to execute a REAL trade

## Troubleshooting

**"API Key not working"**
- Check that you're using your real API Key ID from Kalshi
- Ensure your Private Key is complete (has BEGIN and END markers)

**"Recommendations not showing"**
- Check that the backend is running (Railway should show green status)
- Try refreshing the page

**"Trades not executing"**
- Check that you've added your private key in Settings
- Verify you have funds in your Kalshi account
- Check the browser console (F12) for errors

## Costs
- **Railway**: Free tier covers this app, or ~$5/month for production
- **Vercel**: Free tier works perfectly
- **Total**: $0-5/month

## Next Steps
After deployment, you can:
- Set up automated trading with the bot criteria
- Monitor trades in real-time
- View analytics on various dashboards
- Adjust trading parameters anytime

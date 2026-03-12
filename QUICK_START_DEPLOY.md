# 🚀 Quick Start Deployment - 10 Minutes to Live Trading

Your Kalshi Trading Bot is **100% ready to deploy**. Everything is built and committed to git.

## What's Done ✅
- ✅ Frontend built and production-ready
- ✅ Backend configured for production
- ✅ All code committed to git
- ✅ Environment files configured
- ✅ Deployment scripts prepared

## Deployment (Copy & Paste Into Terminal)

### Option 1: Automated Deployment Script (RECOMMENDED)
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot
./DEPLOY_NOW.sh
```

This script will:
1. Ask for your GitHub username
2. Push to GitHub automatically
3. Guide you through Railway setup
4. Guide you through Vercel deployment
5. Your bot will be live!

### Option 2: Manual Deployment

**Step 1: Create GitHub Repo**
- Go to https://github.com/new
- Name it `kalshi-bot`
- DO NOT initialize with README
- Create repo

**Step 2: Push to GitHub (in terminal)**
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot
git remote add origin https://github.com/YOUR_USERNAME/kalshi-bot.git
git branch -M main
git push -u origin main
```
(Replace YOUR_USERNAME with your actual GitHub username)

**Step 3: Deploy to Railway**
- Go to https://railway.app
- Click "Start New Project"
- Sign in with GitHub
- Select "Deploy from GitHub"
- Find `kalshi-bot` repo
- Click Deploy
- Wait 2-3 minutes

**Step 4: Configure Railway Environment Variables**
- In Railway dashboard, go to your project
- Click "Variables"
- Add these:
```
PORT = 5001
NODE_ENV = production
VITE_API_BASE = https://kalshi-bot.up.railway.app
KALSHI_PRIVATE_KEY = <your entire private key from https://kalshi.com/settings/api-keys>
```
- Click Deploy

**Step 5: Deploy Frontend to Vercel**
- Go to https://vercel.com
- Click "Add New..." → "Project"
- Select "Import Git Repository"
- Find `kalshi-bot`
- Add environment variable: `VITE_API_BASE = https://kalshi-bot.up.railway.app`
- Deploy

**Step 6: Test Live Trading**
- Visit your Vercel URL (they'll email you)
- Login with your Kalshi API Key ID
- Go to Settings (⚙️)
- Your private key is already configured!
- Go to Live Trading
- Click any recommendation to execute a REAL trade

## If GitHub Push Fails

If you get credential errors:

**Option A: Use Personal Access Token**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select these scopes: `repo`, `public_repo`
4. Copy the token
5. When pushing to GitHub, use:
   - Username: your GitHub username
   - Password: paste the token (not your password)

**Option B: Use SSH**
1. In terminal: `ssh-keygen -t ed25519 -C "your-email@example.com"`
2. Press Enter 3 times (no passphrase)
3. Copy key: `cat ~/.ssh/id_ed25519.pub`
4. Go to https://github.com/settings/ssh/new
5. Paste key
6. In terminal:
```bash
cd /Users/calumwinsor/Desktop/Claude/kalshi-bot
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/kalshi-bot.git
git push -u origin main
```

## Timeline
- GitHub push: 1-2 minutes
- Railway deployment: 2-3 minutes
- Vercel deployment: 2-3 minutes
- **Total: ~10 minutes to live trading** ✅

## What Happens Next

Once deployed, your trading bot will:
- ✅ Analyze market data in real-time
- ✅ Generate trading recommendations
- ✅ Execute trades when you click them
- ✅ Run 24/7 on production servers
- ✅ Cost you $0-5/month (Railway + Vercel)

## Costs
- Railway: Free tier or ~$5/month
- Vercel: Free
- **Total: $0-5/month**

---

**Everything is ready. Just run the deploy script and your bot goes live! 🎉**

Questions? Check DEPLOYMENT.md or FINAL_DEPLOYMENT_CHECKLIST.md for more details.

# ☁️ CLOUD DEPLOYMENT GUIDE - DigitalOcean

## Complete Step-by-Step Guide to Deploy Your Trading System

**Estimated Time:** 1 hour total
**Cost:** $5-6/month (includes $200 free credit for new users)
**Uptime:** 24/7 automated trading

---

## 📋 PHASE 1: CREATE DIGITALOCEAN ACCOUNT & DROPLET

### Step 1.1: Create DigitalOcean Account

1. Visit https://www.digitalocean.com
2. Click "Sign up"
3. Create account with:
   - Email address
   - Password
   - Full name
4. Click "Create account"
5. **Verify email** (check your inbox)
6. Add payment method (credit/debit card)
   - You'll get $200 free credit as a new user!

### Step 1.2: Create Your First Droplet

1. Log in to DigitalOcean dashboard
2. Click "Create" button (top left)
3. Select "Droplets"
4. Choose image:
   - **Ubuntu 22.04 (LTS)** - recommended
5. Choose size:
   - **Basic** ($5/month) - plenty for our bot
6. Choose datacenter region:
   - Pick one closest to you (doesn't matter much for trading)
7. Additional options:
   - Leave defaults
8. SSH keys (optional but recommended):
   - Skip for now, we'll use password
9. Hostname: `kalshi-trading-bot`
10. Click "Create Droplet"
11. **Wait 1-2 minutes** for the droplet to start

### Step 1.3: Access Your Droplet

Once created:
1. Click on your new Droplet
2. Find the IP address (e.g., 192.168.1.100)
3. Note this down - you'll need it
4. DigitalOcean sends root password to your email

---

## 🔧 PHASE 2: SET UP SERVER

### Step 2.1: Connect via SSH

On your computer, open Terminal and run:

```bash
ssh root@YOUR_DROPLET_IP
```

Replace `YOUR_DROPLET_IP` with the actual IP address

When asked "Are you sure you want to continue?", type `yes`

Enter the root password from the email

**You're now connected to your cloud server!**

### Step 2.2: Update System

```bash
apt update
apt upgrade -y
```

This updates all packages. Wait for it to complete.

### Step 2.3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

Both should show version numbers.

### Step 2.4: Install Git

```bash
apt install -y git
```

### Step 2.5: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

This keeps your bot running even if the server restarts.

---

## 📦 PHASE 3: DEPLOY YOUR CODE

### Step 3.1: Clone Your Project

```bash
cd /home
git clone https://github.com/YOUR_USERNAME/kalshi-bot.git
cd kalshi-bot/backend
```

**OR** if you don't have GitHub, use SCP to copy files:

```bash
# From your local computer, run this:
scp -r /Users/calumwinsor/Desktop/Claude/kalshi-bot root@YOUR_DROPLET_IP:/home/kalshi-bot
```

Then on the server:
```bash
cd /home/kalshi-bot/backend
```

### Step 3.2: Install Dependencies

```bash
npm install
```

Wait for all packages to install. This takes a few minutes.

### Step 3.3: Set Up Environment Variables

Create a `.env` file:

```bash
nano .env
```

Add these lines (keep them for now):

```
NODE_ENV=production
PORT=5001
DEMO_MODE=true
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 🚀 PHASE 4: START THE BOT WITH PM2

### Step 4.1: Start Your Server with PM2

```bash
pm2 start kalshi-server-oauth.js --name "kalshi-bot"
```

### Step 4.2: Verify It's Running

```bash
pm2 status
```

You should see:
```
id  name         namespace   version  mode  pid    status
0   kalshi-bot   default     N/A      fork  12345  online
```

### Step 4.3: Enable Auto-Start

```bash
pm2 startup
```

This makes PM2 start automatically when the server reboots.

```bash
pm2 save
```

This saves the current process list.

### Step 4.4: Test the Server

From your local computer:

```bash
curl http://YOUR_DROPLET_IP:5001/health
```

You should see:
```
{"status":"ok","timestamp":"..."}
```

✅ **Your server is running in the cloud!**

---

## 🔐 PHASE 5: CONFIGURE FOR REAL TRADING

### Step 5.1: Update Environment File with Real Credentials

On the server:

```bash
nano .env
```

Update to:
```
NODE_ENV=production
PORT=5001
DEMO_MODE=false
KALSHI_API_KEY_ID=your_api_key_id
KALSHI_PRIVATE_KEY=your_private_key
```

Save with `Ctrl+X`, `Y`, `Enter`

### Step 5.2: Restart the Server

```bash
pm2 restart kalshi-bot
```

### Step 5.3: Verify Authentication

```bash
pm2 logs kalshi-bot
```

Watch for your bot to load with real API credentials.

---

## ✅ PHASE 6: TESTING & MONITORING

### Step 6.1: Check Server Logs

```bash
# View last 50 lines of logs
pm2 logs kalshi-bot

# View with timestamps
pm2 logs kalshi-bot --lines 100
```

### Step 6.2: Test Trading Decisions Endpoint

From your computer:

```bash
curl http://YOUR_DROPLET_IP:5001/api/analysis/trading-decisions
```

### Step 6.3: Monitor System Resources

```bash
pm2 monit
```

Shows CPU, memory, and process status in real-time.

Press `Ctrl+C` to exit.

### Step 6.4: Check Daily Scheduler

In logs, you should see:
```
⏰ Daily analysis scheduled for [DATE], 8:00:00 AM
```

This confirms the automated daily cycle is scheduled.

---

## 📊 DAILY OPERATIONS

### Check Bot Status Anytime

```bash
ssh root@YOUR_DROPLET_IP
pm2 status
```

### View Recent Logs

```bash
ssh root@YOUR_DROPLET_IP
pm2 logs kalshi-bot --lines 50
```

### Restart if Needed

```bash
ssh root@YOUR_DROPLET_IP
pm2 restart kalshi-bot
```

### Stop the Bot

```bash
pm2 stop kalshi-bot
```

### Start Again

```bash
pm2 start kalshi-bot
```

---

## 🔗 ACCESSING YOUR BOT REMOTELY

### Via Web Interface

If you set up the frontend on the cloud server:

```
http://YOUR_DROPLET_IP:5173
```

### Via API

All endpoints are now accessible:

```bash
# Get trading decisions
curl http://YOUR_DROPLET_IP:5001/api/analysis/trading-decisions

# Trigger analysis
curl -X POST http://YOUR_DROPLET_IP:5001/api/analysis/daily-report

# Get bot status
curl http://YOUR_DROPLET_IP:5001/api/bot/status
```

---

## ⚠️ TROUBLESHOOTING

### Server Won't Start

```bash
pm2 logs kalshi-bot
```

Check error messages. Common issues:
- Port 5001 already in use
- Missing dependencies
- Invalid environment variables

### Can't Connect to Droplet

```bash
# Test connection
ping YOUR_DROPLET_IP

# Try SSH again
ssh root@YOUR_DROPLET_IP
```

### Droplet is Running But Bot Not Responding

```bash
# Check if process is running
pm2 status

# Restart it
pm2 restart kalshi-bot

# View logs
pm2 logs kalshi-bot
```

### High CPU or Memory Usage

```bash
pm2 monit
```

Check which process is using resources. If it's kalshi-bot, might need to optimize code or restart.

---

## 🎯 MONITORING CHECKLIST

### Daily (First Week)

- [ ] Check PM2 status
- [ ] Verify 8:00 AM analysis ran
- [ ] Check bot logs for errors
- [ ] Monitor API endpoints responding

### Weekly

- [ ] Check resource usage (CPU, memory)
- [ ] Review trading performance
- [ ] Check for any error patterns
- [ ] Verify daily scheduler ran

### Monthly

- [ ] Full system audit
- [ ] Performance review
- [ ] Scaling needs assessment
- [ ] Code updates/improvements

---

## 💰 COST SUMMARY

| Item | Cost |
|------|------|
| DigitalOcean Droplet ($5/mo) | $60/year |
| Domain name (optional) | $10/year |
| **Total** | **~$70/year** |

Plus you get:
- **$200 free credit** for first 2 months
- 24/7 uptime
- Automated trading
- Professional hosting

---

## 🎊 NEXT STEPS

1. ✅ Create DigitalOcean account
2. ✅ Create and configure Droplet
3. ✅ Install Node.js and dependencies
4. ✅ Deploy code
5. ✅ Start with PM2
6. ✅ Add API credentials
7. ✅ Test everything
8. ✅ Monitor daily

**You're now running a professional, 24/7 trading bot!** 🚀

---

## 📞 NEED HELP?

If you encounter any issues:

1. Check the logs: `pm2 logs kalshi-bot`
2. Review troubleshooting section above
3. Verify connectivity: `curl http://YOUR_DROPLET_IP:5001/health`
4. Check DigitalOcean dashboard for server status

---

**Status:** Ready to Deploy
**Next Action:** Start with Phase 1, Step 1.1

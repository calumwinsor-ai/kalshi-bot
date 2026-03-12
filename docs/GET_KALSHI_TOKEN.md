# 🔐 How to Get Your Kalshi API Token

This guide explains how to authorize the trading bot without sharing your password.

## Why This Approach?

✅ **Your password stays safe** - You log in directly at Kalshi.com
✅ **Never stored** - We never see or store your password
✅ **You control it** - You authorize at Kalshi's own website
✅ **Easy to revoke** - Delete the token anytime from Kalshi settings

## Step-by-Step: Get Your API Token

### Step 1: Open Kalshi Login

In the Kalshi Trading Bot:
1. Click **"🔓 Open Kalshi Login"** button
2. A new browser window opens to Kalshi.com

### Step 2: Log In to Kalshi

1. Enter your Kalshi email
2. Enter your Kalshi password
3. Click "Sign In"
4. Complete any 2FA if enabled

You're now logged in to Kalshi directly. Your bot never sees this password!

### Step 3: Get Your API Token

In Kalshi's website:
1. Click your **Profile** (top right)
2. Go to **Settings**
3. Click **API** or **API Settings**
4. Click **"Generate Token"** or **"Create New Token"**
5. Name it: `kalshi-trading-bot` (or anything you want)
6. Click **"Generate"** or **"Create"**
7. **Copy the token** (it looks like a long string of random characters)

⚠️ **Important:** Kalshi only shows the token once. Copy it now!

### Step 4: Paste Token into Bot

Back in the Kalshi Trading Bot:
1. Paste the token in the **"Paste Your API Token"** field
2. Click **"✅ Authenticate"**
3. Bot verifies the token works
4. You're logged in! ✅

## What the Token Looks Like

API tokens typically look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or:
```
kalshi_live_abc123def456ghi789jkl012
```

## Security: What Can the Token Do?

The token can:
✅ View your portfolio
✅ View open markets
✅ Place trades
✅ View order history

The token **cannot**:
❌ Change your password
❌ Change security settings
❌ Access other accounts
❌ Change 2FA settings

## What to Do If Token Leaks

If you accidentally share the token:

1. **Delete it immediately** in Kalshi Settings → API
2. Generate a new token
3. Paste the new token in the bot
4. Old token won't work anymore

It takes 10 seconds to fix!

## Token Expiration

Kalshi API tokens typically:
- ✅ Don't expire (stay valid until you delete them)
- ✅ Work from any computer
- ✅ Can be used for multiple apps

Some APIs expire tokens after 24 hours. If you see "Token Expired":
1. Log back into Kalshi
2. Generate a new token
3. Paste in bot
4. Continue trading

## Troubleshooting

### "Can't find API Settings"

**Different Kalshi versions may have different names:**
- Look for: Settings, Profile, Developer, API Keys, API Tokens
- Usually under your profile name (top right) → Settings

### "Token doesn't work"

Possible causes:
1. **Typo in token** - Copy again carefully
2. **Token deleted** - Generate a new one
3. **Wrong Kalshi account** - Make sure you're logged into right account
4. **API not enabled** - Some accounts need to enable API access first

### "No API option in my account"

Some reasons:
1. Account too new - Wait 24 hours, try again
2. Account restrictions - Contact Kalshi support
3. Free vs Paid account - Check if your account level supports API

## Pro Tips

### Multiple Bots

You can:
- ✅ Generate multiple tokens (one per bot)
- ✅ Run multiple bots with different tokens
- ✅ Manage all tokens in Kalshi settings

### Token Rotation (Advanced)

For security-conscious users:
1. Generate new token monthly
2. Update bot with new token
3. Delete old token
4. Keeps account fresh and secure

### Monitoring

In Kalshi Settings → API:
- See all active tokens
- See last used date/time
- Revoke any token instantly

## What Happens After?

Once token is pasted:
1. Bot stores it locally (not in cloud)
2. Bot uses it to access Kalshi API
3. You can now add trading criteria
4. Bot monitors and trades automatically

## Security Checklist

Before using the bot:

- ✅ Token is from YOUR Kalshi account
- ✅ You didn't share the token with anyone
- ✅ Token is in your .env or bot's form only
- ✅ You know you can delete token anytime
- ✅ Kalshi is the official site (check URL)

## Questions?

**Q: Does the bot ever send my token anywhere?**
A: No. Token stays on your local machine and is only sent to Kalshi's official API.

**Q: Can I change the token later?**
A: Yes! Generate a new token anytime, paste it in the bot. Old token still works until you delete it.

**Q: What if I lose the token?**
A: Generate a new one - old token won't work. No way to recover old tokens, but you can make new ones instantly.

**Q: Is API trading safe?**
A: Yes. Kalshi's API is official and widely used. Your token is limited to trading only.

---

**Ready to go?** Get your token and paste it in the bot! 🚀

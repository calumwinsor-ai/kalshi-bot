# 🔐 Simplified Login Setup - API Key Only

This guide explains how to use the simplified login process where you only paste your **API Key ID** into the bot, while your **Private Key** is stored securely in the backend.

## Why This Approach?

✅ **Simpler UI** - Only one field to paste instead of two
✅ **Safer** - Private key never enters the frontend
✅ **More Secure** - Private key stored in backend environment, not transmitted
✅ **OAuth-Like** - Similar to how OAuth tokens work in professional apps

## Step-by-Step Setup

### Step 1: Get Your API Credentials from Kalshi

1. Go to **Kalshi.com**
2. Log in with your account
3. Go to **Settings → API Keys**
4. You'll see:
   - **API key id** (a UUID like `601cdb20-0450-442c-9be6-81788c448ad0`)
   - **Private key** (an RSA key starting with `-----BEGIN RSA PRIVATE KEY-----`)

### Step 2: Store Private Key in Backend

1. Open `backend/.env` in a text editor
2. Find the line: `KALSHI_PRIVATE_KEY=`
3. Paste your entire private key from Kalshi (including the `-----BEGIN` and `-----END` lines)
4. **IMPORTANT:**
   - This file is local-only (not committed to GitHub)
   - Keep this secret
   - If using version control, ensure `.env` is in `.gitignore`

**Example .env file:**
```
PORT=5001
NODE_ENV=development
KALSHI_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
...many lines...
-----END RSA PRIVATE KEY-----
VITE_API_BASE=http://localhost:5001
```

### Step 3: Restart the Backend

```bash
# Kill the old process (if running)
lsof -i :5001
# Then: kill -9 <PID>

# Or just close and reopen the terminal

# Start the backend again
cd backend
npm start
```

Watch for this in the logs:
```
🚀 Server running on http://localhost:5001
```

### Step 4: Log In Through the Bot

1. Open the bot in your browser: `http://localhost:5173`
2. Click **"🔓 Open Kalshi Login"**
3. A new window opens - log in to Kalshi there (or you're already logged in)
4. Back in the bot, you'll see the token input field
5. **Paste ONLY your API Key ID** (the UUID)
6. Click **"✅ Authenticate"**
7. Bot verifies with Kalshi using your credentials
8. Dashboard appears - you're authenticated! ✅

## Example Login Flow

**What you paste:**
```
601cdb20-0450-442c-9be6-81788c448ad0
```

**What happens behind the scenes:**
```
Bot receives: 601cdb20-0450-442c-9be6-81788c448ad0
Backend reads: KALSHI_PRIVATE_KEY from .env
Backend validates with Kalshi using BOTH:
  - Username: 601cdb20-0450-442c-9be6-81788c448ad0
  - Password: (your private key from .env)
✅ If both match, bot stores them and you're logged in
```

## Security Notes

### ✅ This is Secure Because:
- Your private key **never appears in the frontend**
- Your private key **never crosses the network** (stored locally)
- Your private key **never gets logged** in client-side console
- Bot uses industry-standard BASIC auth (username + password)
- You can easily revoke by deleting the token in Kalshi

### ⚠️ Important:
- **Never commit `.env` to GitHub** if it contains your private key
- **Never share your `.env` file** with anyone
- **If you share your computer**, delete the private key from `.env`
- **If your bot is hacked**, revoke the API key in Kalshi (takes 5 seconds)

## What If Something Goes Wrong?

### "Private key not configured"
**Solution:** Add `KALSHI_PRIVATE_KEY` to your `.env` file and restart

### "API credentials invalid"
**Solution:**
1. Verify API Key ID is correct (copy again from Kalshi)
2. Verify private key is complete (includes `-----BEGIN` and `-----END` lines)
3. Ensure no extra spaces or line breaks when copying
4. Check that private key matches the API Key ID (sometimes they're paired)

### "Connection error"
**Solution:**
1. Make sure backend is running: `npm start` in `backend` folder
2. Check that port 5001 is available
3. Look for error messages in backend logs

### "Not authenticated" after restart
**Solution:**
1. Backend stores credentials in memory (lost on restart)
2. This is expected - just log in again
3. If you want persistence, we can add database storage

## FAQ

**Q: Do I need both the API Key ID and Private Key?**
A: Yes. The API Key ID identifies which key, and the Private Key authenticates it.

**Q: Why is the private key in `.env` and not in the form?**
A: Security. Storing it in the backend environment means:
- Users see only the API Key ID field (simpler)
- Private key never transmitted over the network
- Private key not exposed in browser console
- Like how real OAuth systems work

**Q: What if I want to change my private key?**
A: Just generate a new one in Kalshi settings and update `.env`. Restart the bot.

**Q: Is this more or less secure than pasting both into the form?**
A: More secure! The private key stays on your local machine and never appears in the frontend.

**Q: Can I use this on a server/VPS?**
A: Yes, but be more careful with `.env` security. Consider using encrypted environment variable management.

## Next Steps

Once you're logged in:
1. Add trading criteria (Buy Favorites Below 75¢, etc.)
2. Set your $5 trade amount
3. Enable the bot
4. Watch it trade automatically
5. Check your Kalshi account for live updates

See `../README.md` for more information on trading strategies.

---

**Need help?** Check the logs in your terminal - they show exactly what the bot is doing.

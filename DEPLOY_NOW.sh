#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Kalshi Trading Bot - Deployment Script${NC}\n"

# Step 1: GitHub Setup
echo -e "${YELLOW}STEP 1: Create GitHub Repository${NC}"
echo "Please follow these steps:"
echo "1. Open your browser and go to: https://github.com/new"
echo "2. Create a new repository named: kalshi-bot"
echo "3. DO NOT initialize with README (we already have one)"
echo "4. Click 'Create Repository'"
echo ""
read -p "Have you created the repo? (yes/no): " github_created

if [ "$github_created" != "yes" ]; then
    echo -e "${YELLOW}Please create the repo first at https://github.com/new${NC}"
    exit 1
fi

read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${YELLOW}GitHub username cannot be empty${NC}"
    exit 1
fi

# Step 2: Push to GitHub
echo ""
echo -e "${YELLOW}STEP 2: Pushing code to GitHub...${NC}"

# Set git remote
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/kalshi-bot.git"

# Ensure main branch
git branch -M main

# Attempt push with credential prompts
echo "Pushing to GitHub... (You may be prompted to enter your GitHub credentials)"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}   Repository: https://github.com/$GITHUB_USERNAME/kalshi-bot${NC}"

    # Step 3: Railway Setup
    echo ""
    echo -e "${YELLOW}STEP 3: Deploy to Railway${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Go to: https://railway.app"
    echo "2. Click 'Start New Project'"
    echo "3. Sign in with GitHub"
    echo "4. Click 'Deploy from GitHub'"
    echo "5. Find and select: kalshi-bot"
    echo "6. Wait 2-3 minutes for deployment"
    echo "7. Copy your Railway URL (will look like: https://kalshi-bot.up.railway.app)"
    echo ""
    read -p "Have you deployed to Railway and got your URL? (yes/no): " railway_done

    if [ "$railway_done" = "yes" ]; then
        read -p "Enter your Railway URL (e.g., https://kalshi-bot.up.railway.app): " RAILWAY_URL

        if [ -z "$RAILWAY_URL" ]; then
            echo -e "${YELLOW}Railway URL cannot be empty${NC}"
            exit 1
        fi

        # Step 4: Environment Variables
        echo ""
        echo -e "${YELLOW}STEP 4: Configure Environment Variables${NC}"
        echo ""
        echo "In your Railway dashboard:"
        echo "1. Click on your project"
        echo "2. Go to 'Variables' tab"
        echo "3. Add these variables:"
        echo ""
        echo "   PORT = 5001"
        echo "   NODE_ENV = production"
        echo "   VITE_API_BASE = $RAILWAY_URL"
        echo "   KALSHI_PRIVATE_KEY = <your complete private key>"
        echo ""
        echo "4. To get your private key:"
        echo "   - Go to: https://kalshi.com/settings/api-keys"
        echo "   - Copy your Private Key (the block with -----BEGIN and -----END)"
        echo "   - Paste into Railway KALSHI_PRIVATE_KEY field"
        echo ""
        echo "5. Click Deploy"
        echo ""
        read -p "Have you set all environment variables? (yes/no): " env_done

        if [ "$env_done" = "yes" ]; then
            # Step 5: Frontend Deploy
            echo ""
            echo -e "${YELLOW}STEP 5: Deploy Frontend to Vercel${NC}"
            echo ""
            echo "1. Go to: https://vercel.com"
            echo "2. Click 'Add New...' → 'Project'"
            echo "3. Select 'Import Git Repository'"
            echo "4. Find and select: $GITHUB_USERNAME/kalshi-bot"
            echo "5. In 'Environment Variables', add:"
            echo "   VITE_API_BASE = $RAILWAY_URL"
            echo "6. Click 'Deploy'"
            echo ""
            echo -e "${GREEN}🎉 Your trading bot is deploying!${NC}"
            echo ""
            echo "When Vercel finishes (2-3 minutes):"
            echo "1. Visit your Vercel URL"
            echo "2. Login with your Kalshi API Key ID"
            echo "3. Go to Settings (⚙️)"
            echo "4. Your private key is already configured!"
            echo "5. Go to Live Trading"
            echo "6. Click any recommendation to execute a REAL trade"
            echo ""
            echo -e "${GREEN}📊 Live trading is now active!${NC}"
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}❌ Failed to push to GitHub${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure you created the repo at github.com/new"
    echo "2. Check that the repo name is exactly 'kalshi-bot'"
    echo "3. Make sure you entered the correct GitHub username"
    echo ""
    echo "You might be prompted to enter your GitHub password or use a personal access token."
    echo "If you don't have credentials saved, you'll need to:"
    echo "  - Enter your GitHub username when prompted"
    echo "  - Enter a personal access token (not your password)"
    echo "  - To create a token: https://github.com/settings/tokens"
    echo ""
    exit 1
fi

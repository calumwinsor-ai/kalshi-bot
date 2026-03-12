#!/bin/bash

# Script to push kalshi-bot to GitHub
# Before running this, make sure:
# 1. You've created a repo at https://github.com/new
# 2. Named it "kalshi-bot"
# 3. You're logged into GitHub

echo "🚀 Pushing kalshi-bot to GitHub..."
echo ""
echo "Before running this script:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repo named 'kalshi-bot'"
echo "3. DO NOT initialize with README"
echo "4. Come back and run this script"
echo ""
read -p "Have you created the repo? (yes/no): " answer

if [ "$answer" != "yes" ]; then
    echo "Please create the repo first at https://github.com/new"
    exit 1
fi

read -p "Enter your GitHub username: " GITHUB_USERNAME

# Add remote and push
git remote add origin https://github.com/$GITHUB_USERNAME/kalshi-bot.git
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://railway.app"
    echo "2. Create new project from this GitHub repo"
    echo "3. Add environment variables"
    echo "4. Deploy to Vercel"
    echo ""
    echo "See FINAL_DEPLOYMENT_CHECKLIST.md for detailed instructions"
else
    echo "❌ Failed to push. Make sure:"
    echo "1. You created the repo at https://github.com/new"
    echo "2. The repo name is exactly 'kalshi-bot'"
    echo "3. You're logged into GitHub with git credential manager"
fi

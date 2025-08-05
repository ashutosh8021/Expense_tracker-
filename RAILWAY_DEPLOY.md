# Railway Deployment Guide

## Quick Deploy to Railway (No Docker Required)

### Step 1: Prepare Your Repository
Your code is already on GitHub at: https://github.com/ashutosh8021/Expense_tracker-

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository: `ashutosh8021/Expense_tracker-`
5. Railway will automatically detect it's a Node.js application

### Step 3: Add MySQL Database
1. In your Railway project dashboard, click "New Service"
2. Choose "Database" → "Add MySQL"
3. Railway will create a MySQL instance for you

### Step 4: Configure Environment Variables
In your app service, go to Variables tab and add:

```
NODE_ENV=production
DB_HOST=[MySQL hostname from Railway]
DB_USER=[MySQL username from Railway]
DB_PASSWORD=[MySQL password from Railway]
DB_NAME=[MySQL database name from Railway]
DB_PORT=3306
PORT=3000
```

Railway will provide these values in your MySQL service dashboard.

### Step 5: Initialize Database
After deployment, you'll need to run the database initialization script. You can:
1. Use Railway's built-in terminal
2. Or modify your app to auto-initialize on first run

### Step 6: Access Your App
Railway will provide a public URL for your deployed application.

## Alternative: One-Click Deploy

You can also add a Railway button to your README for one-click deployment.

## Benefits of Railway:
- ✅ No Docker installation required
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy database management
- ✅ GitHub integration
- ✅ Automatic deployments on push

## Cost:
- Free tier: $5 credit monthly (sufficient for small apps)
- Pay-as-you-go pricing after that

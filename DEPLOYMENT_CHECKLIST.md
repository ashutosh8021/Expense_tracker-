# Quick Deployment Checklist

## ✅ Railway Deployment Steps

### 1. Setup Railway Account
- [ ] Go to https://railway.app/
- [ ] Sign in with GitHub account
- [ ] Verify email if prompted

### 2. Create New Project
- [ ] Click "Start a New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `ashutosh8021/Expense_tracker-`
- [ ] Wait for initial deployment (may fail - that's expected)

### 3. Add MySQL Database
- [ ] Click "New Service" in your project
- [ ] Select "Database" → "MySQL"
- [ ] Wait for database to be provisioned

### 4. Configure App Environment Variables
Go to your app service → Variables tab and add:
- [ ] `NODE_ENV=production`
- [ ] `DB_HOST=` (copy from MySQL service)
- [ ] `DB_USER=` (copy from MySQL service)
- [ ] `DB_PASSWORD=` (copy from MySQL service)
- [ ] `DB_NAME=` (copy from MySQL service)
- [ ] `DB_PORT=3306`
- [ ] `PORT=3000`

### 5. Initialize Database
- [ ] Go to app service → Terminal tab
- [ ] Run: `npm run init-db`
- [ ] Verify tables are created

### 6. Test Your App
- [ ] Click on the app URL Railway provides
- [ ] Test adding an expense
- [ ] Verify Indian Rupee formatting (₹)
- [ ] Check analytics dashboard

## 🎯 Expected Timeline: 10-15 minutes

## 🔗 Helpful Links
- Railway Dashboard: https://railway.app/dashboard
- Your GitHub Repo: https://github.com/ashutosh8021/Expense_tracker-
- Railway Docs: https://docs.railway.app/

## ⚠️ Troubleshooting
If deployment fails:
1. Check the build logs in Railway
2. Ensure all environment variables are set
3. Make sure database is running before app starts
4. Check the Variables tab for typos

## 💰 Cost
- Railway free tier: $5 credit/month
- Should be sufficient for development/portfolio use
- No credit card required for signup

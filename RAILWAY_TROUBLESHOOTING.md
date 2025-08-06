# Railway Troubleshooting Guide

## 🚨 Common Railway Crash Causes & Solutions

### Current Fixes Applied:
✅ **Database Connection Retry Logic**
✅ **Graceful Server Startup**
✅ **Environment-Specific Handling**
✅ **Connection Timeout Adjustments**

### Check These Railway Settings:

#### 1. Environment Variables
Make sure these are set in Railway:
```
NODE_ENV=production
DB_HOST=[from Railway MySQL service]
DB_USER=[from Railway MySQL service]
DB_PASSWORD=[from Railway MySQL service]
DB_NAME=[from Railway MySQL service]
DB_PORT=3306
PORT=3000
```

#### 2. Railway MySQL Connection Format
Railway MySQL connection should look like:
```
DB_HOST=containers-us-west-xx.railway.app
DB_USER=root
DB_PASSWORD=xxxxxxxxxxxxxxxx
DB_NAME=railway
DB_PORT=3306
```

#### 3. Service Dependencies
- Make sure MySQL service is **running first**
- In your app service, check **Dependencies** tab
- Your app should depend on the MySQL service

#### 4. Railway Deployment Logs
Check the deployment logs for these common errors:

**"ECONNREFUSED"** → Database not ready
- Wait 2-3 minutes for MySQL to fully start
- Check database service logs

**"Access denied"** → Wrong credentials
- Copy exact values from MySQL service variables
- Check for extra spaces in environment variables

**"Unknown database"** → Database doesn't exist
- Run database initialization
- Check DB_NAME matches MySQL service

**"Port already in use"** → Port conflict
- Use PORT=3000 (Railway assigns port automatically)
- Don't hardcode port numbers

### 🔧 Manual Fixes to Try:

#### Fix 1: Restart Services in Order
1. Stop your app service
2. Restart MySQL service
3. Wait 2 minutes
4. Start your app service

#### Fix 2: Check Environment Variables
```bash
# In Railway app terminal, run:
printenv | grep DB
```
Should show all database variables.

#### Fix 3: Test Database Connection
```bash
# In Railway app terminal:
node -e "
const mysql = require('mysql2/promise');
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};
mysql.createConnection(config).then(() => console.log('DB OK')).catch(console.error);
"
```

#### Fix 4: Initialize Database
```bash
# In Railway app terminal:
npm run init-db
```

### 🔍 Debug Steps:

1. **Check Build Logs**: Look for npm install errors
2. **Check Deploy Logs**: Look for startup errors
3. **Check Service Logs**: Look for runtime errors
4. **Check Database Logs**: Look for connection issues

### ⚡ Quick Railway Redeploy:

If nothing works, try a clean redeploy:
1. Delete the current service
2. Create new web service from GitHub
3. Add MySQL service
4. Set environment variables
5. Deploy fresh

### 📞 Alternative: Switch to Render

If Railway keeps crashing, I can help you deploy to Render instead:
- More stable for Node.js apps
- Better error reporting
- Free PostgreSQL tier

Would you like me to create a Render setup instead?

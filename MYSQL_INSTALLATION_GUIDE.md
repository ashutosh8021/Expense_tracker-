# MySQL 8.0.42 Installation Guide for Expense Tracker

## After Your Download Completes

### Step 1: Run the MySQL Installer
1. **Find your downloaded file** (should be around 353MB)
2. **Right-click** → "Run as administrator"
3. **If Windows asks** → Click "Yes" to allow

### Step 2: Choose Installation Type
When the installer opens:
1. **Select "Developer Default"** (recommended)
   - This installs MySQL Server + tools
   - Perfect for development
2. **Click "Next"**

### Step 3: Check Requirements
- Installer will check for requirements
- **If missing components** → Click "Execute" to install them
- **When ready** → Click "Next"

### Step 4: Installation
1. **Click "Execute"** to start installation
2. **Wait for completion** (may take a few minutes)
3. **Click "Next"** when done

### Step 5: Configuration (IMPORTANT!)
1. **Config Type**: Leave as "Development Computer"
2. **Port**: Keep default 3306
3. **Authentication**: Choose "Use Strong Password Encryption"
4. **Root Password**: 
   - Set a password (e.g., "password123")
   - **REMEMBER THIS PASSWORD!** You'll need it
   - Confirm the password
5. **Click "Next"**

### Step 6: Windows Service
1. **Configure as Windows Service**: Keep checked
2. **Service Name**: Keep as "MySQL80"
3. **Start at System Startup**: Keep checked
4. **Click "Next"**

### Step 7: Apply Configuration
1. **Click "Execute"** to apply settings
2. **Wait for completion**
3. **Click "Finish"**

### Step 8: Complete Installation
1. **Click "Next"** through remaining screens
2. **Click "Finish"** to exit installer

## Step 9: Test MySQL Installation

Open **Command Prompt** or **PowerShell** and test:

```bash
# Test if MySQL is accessible
mysql --version

# If that doesn't work, try:
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" --version
```

## Step 10: Configure Your Expense Tracker

### Edit the .env file in your project:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker
DB_PORT=3306
PORT=3000
```

**Replace `your_password_here` with the password you set during installation!**

### Initialize the database:
```bash
npm run init-db
```

### Start the application:
```bash
npm start
```

## Step 11: Access Your App
Open your browser: **http://localhost:3000**

## Troubleshooting

### "mysql command not found"
Add MySQL to your PATH:
1. **Open System Properties** → Environment Variables
2. **Edit PATH** → Add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
3. **Restart Command Prompt**

### "Access denied for user 'root'"
- Check your password in the `.env` file
- Make sure it matches what you set during installation

### "Can't connect to MySQL server"
1. **Open Services** (Windows + R → type "services.msc")
2. **Find "MySQL80"** service
3. **Right-click** → Start (if not running)

### Port 3306 already in use
- Something else is using MySQL port
- Change port in `.env`: `DB_PORT=3307`
- Or stop other MySQL services

## What Happens After Installation

1. **MySQL Server** will run as a Windows service
2. **Starts automatically** when you boot your computer
3. **Listens on port 3306** for database connections
4. **Our Expense Tracker** will connect to it

## Installation Summary

```
✅ MySQL Server 8.0.42
✅ Running on localhost:3306
✅ Root user with your password
✅ Windows service (auto-start)
✅ Ready for Expense Tracker
```

Once installation is complete, come back and we'll:
1. Configure the `.env` file
2. Initialize the database
3. Start your Expense Tracker
4. Add your first expense!

The MySQL 8.0.42 version you're downloading is perfectly compatible with our Node.js application. No issues expected! 🚀

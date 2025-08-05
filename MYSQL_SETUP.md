# MySQL Installation Guide for Expense Tracker

## Why Do We Need MySQL?

MySQL is our **database** that will store:
- Your expense records
- Categories for expenses  
- Spending analytics data

Think of it as a filing cabinet for all your financial data.

## Installation Options (Choose One)

### Option 1: XAMPP (Easiest for Beginners)

**What is XAMPP?** A package that includes MySQL, Apache, and other tools in one installer.

**Steps:**
1. Go to [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Download XAMPP for Windows
3. Run the installer
4. **Important**: You only need to check "MySQL" during installation
5. Complete installation
6. Open XAMPP Control Panel
7. Click "Start" next to MySQL
8. MySQL is now running on port 3306!

**Default Settings:**
- Host: `localhost`
- Port: `3306` 
- Username: `root`
- Password: (empty - no password by default)

### Option 2: MySQL Community Server (More Control)

**Steps:**
1. Go to [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server
3. Run the installer
4. Choose "Developer Default" setup type
5. **Important**: Set a root password and remember it!
6. Complete the installation
7. MySQL will start automatically

**Your Settings:**
- Host: `localhost`
- Port: `3306`
- Username: `root` 
- Password: (whatever you set during installation)

### Option 3: Docker MySQL (If you prefer containers)

**Steps:**
```bash
# Run MySQL in a Docker container
docker run --name mysql-expense -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0

# This creates:
# - Container name: mysql-expense
# - Root password: password
# - Accessible on: localhost:3306
```

## After MySQL Installation

### Step 1: Test Your Installation

**For XAMPP users:**
```bash
# Open Command Prompt or PowerShell
cd "C:\xampp\mysql\bin"
mysql -u root -p
# (Press Enter if no password, or type your password)
```

**For MySQL Community Server users:**
```bash
# Open Command Prompt or PowerShell  
mysql -u root -p
# (Enter the password you set during installation)
```

If you see `mysql>` prompt, MySQL is working!

### Step 2: Configure the Application

1. **Edit the `.env` file** in your project folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker
DB_PORT=3306
```

2. **Update the password field:**
   - **XAMPP users**: Leave `DB_PASSWORD=` empty
   - **MySQL Community users**: Put your installation password
   - **Docker users**: Use `password` (or whatever you set)

### Step 3: Initialize the Database

```bash
# In your project folder
npm run init-db
```

This will:
- Create the `expense_tracker` database
- Create tables for expenses and categories
- Add default expense categories

## Troubleshooting

### "mysql command not found"
- **XAMPP**: MySQL is in `C:\xampp\mysql\bin\` - navigate there first
- **MySQL Community**: Add MySQL to your PATH environment variable

### "Access denied for user"
- Check your password in the `.env` file
- Try connecting manually: `mysql -u root -p`

### "Can't connect to MySQL server"
- **XAMPP**: Make sure MySQL is started in XAMPP Control Panel
- **MySQL Community**: Make sure MySQL service is running in Windows Services
- **Docker**: Make sure the container is running: `docker ps`

### Port 3306 already in use
- Something else is using MySQL port
- Either stop the other service or change port in `.env`: `DB_PORT=3307`

## Database Structure

Once initialized, your database will have:

### `expenses` table:
- `id`: Unique expense ID
- `amount`: Money spent
- `category`: Type of expense
- `description`: What you bought
- `date`: When you spent it
- `created_at`: When record was added

### `categories` table:
- `id`: Category ID
- `name`: Category name (Food, Transport, etc.)
- `color`: Color for charts and display

## Security Notes

**For Development:**
- Using `root` user is fine
- Empty passwords are okay locally

**For Production:**
- Create a dedicated database user
- Use strong passwords
- Restrict database access

## What's Next?

After MySQL is set up:
1. Run `npm run init-db` to create tables
2. Start the app with `npm start`
3. Open `http://localhost:3000`
4. Start tracking your expenses!

The application will automatically connect to your MySQL database and be ready to store your financial data.

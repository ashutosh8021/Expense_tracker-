# Complete Setup Guide for Expense Tracker

## Understanding the Environment Setup

### Why Not Python Virtual Environment?
- **Node.js doesn't use virtual environments** like Python
- Node.js uses `package.json` and `node_modules` for dependency management
- Each project folder is already isolated by default
- However, we still need to isolate the **database** and **services**

### Why Docker is Recommended?
1. **Complete Isolation**: Database + Application + Dependencies
2. **No Manual MySQL Setup**: Everything in containers
3. **Consistent Environment**: Same setup everywhere
4. **Easy Cleanup**: Remove containers when done

## Option 1: Docker Setup (Recommended)

### Prerequisites
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Ensure Docker is running

### Steps
```bash
# 1. Run the setup script
./setup.bat

# 2. Choose option 1 (Docker)
# The script will automatically:
# - Create database container
# - Create application container
# - Set up networking between them
# - Initialize the database

# 3. Access the application
# Open: http://localhost:3000
```

### Docker Commands Reference
```bash
# View application logs
npm run docker:logs

# Stop everything
npm run docker:down

# Restart containers
npm run docker:up

# Development mode (with file watching)
npm run docker:dev
```

## Option 2: Local Setup (Manual MySQL)

### Prerequisites
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MySQL Server** - Choose one:
   - [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
   - [XAMPP](https://www.apachefriends.org/) (includes MySQL)
   - [WAMP](https://www.wampserver.com/) (Windows)

### Step-by-Step Local Setup

#### Step 1: Install MySQL
Choose one of these methods:

**Method A: MySQL Community Server**
1. Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Run installer, choose "Developer Default"
3. Set root password (remember this!)
4. Complete installation

**Method B: XAMPP (Easier)**
1. Download [XAMPP](https://www.apachefriends.org/)
2. Install XAMPP
3. Start XAMPP Control Panel
4. Start "Apache" and "MySQL" services

#### Step 2: Verify MySQL Installation
```bash
# Test MySQL connection
mysql --version

# Connect to MySQL (will prompt for password)
mysql -u root -p
```

#### Step 3: Set Up the Project
```bash
# 1. Install Node.js dependencies
npm install

# 2. Configure environment
# Edit .env file with your MySQL credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
DB_PORT=3306
PORT=3000

# 3. Initialize database
npm run init-db

# 4. Start the application
npm start
```

#### Step 4: Verify Setup
1. Open http://localhost:3000
2. You should see the Expense Tracker interface
3. Try adding an expense to test database connection

## Troubleshooting

### MySQL Connection Issues
```bash
# Check if MySQL is running
# Windows:
services.msc
# Look for "MySQL" service

# Test connection manually
mysql -u root -p
```

### Port Conflicts
```bash
# If port 3000 is busy, change in .env:
PORT=3001

# If MySQL port 3306 is busy:
DB_PORT=3307
```

### Database Permissions
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database and user
CREATE DATABASE expense_tracker;
CREATE USER 'expense_user'@'localhost' IDENTIFIED BY 'expense_password';
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user'@'localhost';
FLUSH PRIVILEGES;
```

## What Each File Does

- **`server.js`**: Main application server (Express.js)
- **`package.json`**: Dependencies and scripts
- **`database/connection.js`**: MySQL connection logic
- **`routes/expenses.js`**: API endpoints for expenses
- **`public/`**: Frontend files (HTML, CSS, JavaScript)
- **`docker-compose.yml`**: Container orchestration
- **`.env`**: Environment configuration

## Development Workflow

### Local Development
```bash
# Start in development mode (auto-restart on changes)
npm run dev

# View logs
npm start

# Reset database
npm run init-db
```

### Docker Development
```bash
# Development mode with file watching
npm run docker:dev

# View logs
npm run docker:logs

# Reset everything
npm run docker:down
npm run docker:up
```

## Next Steps After Setup

1. **Add Sample Data**: Try adding different expense categories
2. **Test Filtering**: Use date filters to analyze spending
3. **Explore Analytics**: Check category summaries
4. **Customize**: Modify categories in the database
5. **Backup**: Export your expense data

## Benefits of This Setup

### For Students:
- **Budget Management**: Track daily spending
- **Pattern Recognition**: See where money goes
- **Financial Awareness**: Better spending decisions
- **Data Analysis**: Monthly/category summaries

### For Developers:
- **Full-Stack Experience**: Frontend + Backend + Database
- **Modern Tools**: Express.js, MySQL, REST APIs
- **Best Practices**: Environment configuration, error handling
- **Deployment Ready**: Docker containers for easy deployment

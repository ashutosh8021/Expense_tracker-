# Quick Start Guide - Manual Setup

## Step-by-Step MySQL + Node.js Setup

### Why This Approach?
- **No Docker needed** - Direct installation on your machine
- **Full control** - You manage MySQL directly
- **Learning experience** - Understand each component
- **Traditional development** - How many developers work

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended)
3. Run installer with default settings
4. Restart your computer

**Verify:**
```bash
node --version
npm --version
```

#### 1.2 Install MySQL (Choose One Option)

**Option A: XAMPP (Recommended for Beginners)**
1. Go to [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Download XAMPP
3. Install (only select MySQL component)
4. Start XAMPP Control Panel
5. Start "MySQL" service

**Option B: MySQL Community Server**
1. Go to [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server
3. Run installer, choose "Developer Default"
4. Set root password (remember it!)
5. Complete installation

### Step 2: Set Up the Project

#### 2.1 Install Project Dependencies
```bash
# In your project folder (d:\Expense Tracker)
npm install
```

#### 2.2 Configure Database Connection
Edit `.env` file:

**For XAMPP users:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_tracker
DB_PORT=3306
PORT=3000
```

**For MySQL Community Server users:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_installation_password
DB_NAME=expense_tracker
DB_PORT=3306
PORT=3000
```

#### 2.3 Initialize Database
```bash
npm run init-db
```

This creates:
- Database named `expense_tracker`
- Tables for expenses and categories
- Default expense categories

#### 2.4 Start the Application
```bash
# Production mode
npm start

# OR Development mode (auto-restart on file changes)
npm run dev
```

#### 2.5 Access Your Application
Open: [http://localhost:3000](http://localhost:3000)

### Step 3: Test Everything

1. **Add an expense** - Try adding a food expense for $10
2. **Check categories** - Should show different colored categories
3. **View analytics** - Should display spending summaries
4. **Filter by date** - Test the date filtering

### Understanding the Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Browser)     │    │   (Node.js)     │    │   (MySQL)       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • HTML/CSS/JS   │◄──►│ • Express.js    │◄──►│ • expense_tracker│
│ • User Interface│    │ • REST API      │    │ • Tables        │
│ • Forms & Charts│    │ • Business Logic│    │ • Data Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure Explained

```
d:\Expense Tracker\
├── public/                 # Frontend files
│   ├── index.html         # Main webpage
│   ├── styles.css         # Styling
│   └── script.js          # Client-side JavaScript
├── database/              # Database connection
│   └── connection.js      # MySQL connection logic
├── routes/                # API endpoints
│   └── expenses.js        # Expense CRUD operations
├── scripts/               # Utility scripts
│   └── init-database.js   # Database setup
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
└── .env                   # Environment configuration
```

### Common Issues & Solutions

#### "ECONNREFUSED" Error
- MySQL is not running
- **XAMPP**: Start MySQL in XAMPP Control Panel
- **MySQL Community**: Check Windows Services

#### "Access Denied" Error
- Wrong password in `.env` file
- Test manually: `mysql -u root -p`

#### "Cannot find module" Error
- Dependencies not installed
- Run: `npm install`

#### Port 3000 Already in Use
- Change port in `.env`: `PORT=3001`
- Or stop other applications using port 3000

### Development Workflow

#### Daily Development
```bash
# Start development mode (auto-restart)
npm run dev

# Make changes to files
# Browser auto-refreshes
# Server auto-restarts
```

#### Database Management
```bash
# Reset database (clears all data)
npm run init-db

# Connect to MySQL directly
mysql -u root -p
use expense_tracker;
show tables;
```

#### Production Ready
```bash
# Start in production mode
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start server.js --name expense-tracker
```

### What You've Built

This expense tracker teaches:

**Frontend Skills:**
- Responsive web design
- JavaScript DOM manipulation
- REST API consumption
- User experience design

**Backend Skills:**
- Express.js server setup
- RESTful API design
- Database connections
- Error handling

**Database Skills:**
- MySQL table design
- CRUD operations
- Data relationships
- Query optimization

**DevOps Skills:**
- Environment configuration
- Process management
- Dependency management
- Debugging techniques

### Next Steps

1. **Customize Categories**: Add your own expense categories
2. **Add Features**: Budget limits, recurring expenses
3. **Improve UI**: Better charts, mobile responsiveness
4. **Deploy**: Host on cloud platforms
5. **Scale**: Add user authentication, multiple users

You now have a complete full-stack application running locally with proper database integration!

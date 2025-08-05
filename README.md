# 💰 Expense Tracker Application

A full-stack web application for tracking personal expenses with real-time analytics and category-wise summaries.

![Expense Tracker](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Features

### Core Functionality
- ✅ **Add/Edit/Delete Expenses** - Complete CRUD operations
- ✅ **Category Management** - Pre-defined categories with custom colors
- ✅ **Real-time Analytics** - Total, monthly expenses and transaction counts
- ✅ **Date Filtering** - Filter expenses by date ranges
- ✅ **Indian Currency** - Formatted in Indian Rupees (₹) with proper localization
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices

### User Interface
- Modern gradient design with smooth animations
- Interactive forms with real-time validation
- Category-wise expense summaries with visual indicators
- Clean, intuitive user experience

## 🏗️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid, animations
- **JavaScript (ES6+)** - Async/await, DOM manipulation, API integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with promise support

### Database
- **MySQL 8.0** - Relational database for data persistence

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (v8.0 or higher)
- [Git](https://git-scm.com/)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
1. **Start MySQL Service**
   ```bash
   # Windows
   net start mysql80
   
   # macOS/Linux
   sudo systemctl start mysql
   ```

2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   
   Execute the following SQL commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS expense_tracker;
   USE expense_tracker;
   
   CREATE TABLE IF NOT EXISTS expenses (
       id INT AUTO_INCREMENT PRIMARY KEY,
       amount DECIMAL(10,2) NOT NULL,
       category VARCHAR(100) NOT NULL,
       description TEXT,
       date DATE NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   
   CREATE TABLE IF NOT EXISTS categories (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL UNIQUE,
       color VARCHAR(7) DEFAULT '#007bff',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   INSERT IGNORE INTO categories (name, color) VALUES
   ('Food & Dining', '#ff6b6b'),
   ('Transportation', '#4ecdc4'),
   ('Shopping', '#45b7d1'),
   ('Entertainment', '#96ceb4'),
   ('Bills & Utilities', '#ffeaa7'),
   ('Healthcare', '#dda0dd'),
   ('Education', '#98d8c8'),
   ('Travel', '#f7dc6f'),
   ('Other', '#aaa');
   ```

### Step 4: Environment Configuration
1. **Copy Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update Database Credentials**
   ```env
   # Environment Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=expense_tracker
   DB_PORT=3306
   PORT=3000
   ```

### Step 5: Start Application
```bash
npm start
```

🎉 **Your application is now running at** http://localhost:3000
   npm run docker:up
   ```
3. **Access**: http://localhost:3000

### 💻 Local Development Setup

1. **Prerequisites**: Node.js (v14+) and MySQL
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```
4. **Initialize database**:
   ```bash
   npm run init-db
   ```
5. **Start application**:
   ```bash
   npm start
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run init-db` | Initialize database and tables |
| `npm run docker:up` | Start with Docker Compose |
| `npm run docker:dev` | Start development environment with Docker |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:logs` | View application logs |

## Environment Configuration

## Project Structure

```
expense-tracker/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js
├── database/
│   └── connection.js
├── routes/
│   └── expenses.js
├── scripts/
│   └── init-database.js
└── package.json
```

## Usage

1. **Adding Expenses**: Use the form to add new expenses with amount, category, and description
2. **Viewing History**: Check the expense list to see all recorded transactions
3. **Analytics**: View spending summaries by category and time period
4. **Budget Management**: Track your spending against set budgets

## Benefits

- Better understanding of spending patterns
- Improved budget planning
- Financial awareness and control
- Data-driven financial decisions

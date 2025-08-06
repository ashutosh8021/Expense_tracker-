# 💰 Expense Tracker Application

A full-stack web application for tracking personal expenses with user authentication, real-time analytics and category-wise summaries.

![Expense Tracker](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Live Demo
**Application URL:** [https://expense-tracker-rho-eight-39.vercel.app/](https://expense-tracker-rho-eight-39.vercel.app/)

## 🎯 Features

### Core Functionality
- ✅ **User Authentication** - Secure signup/login with JWT tokens
- ✅ **Personal Data Security** - Each user only sees their own expenses
- ✅ **Add/Edit/Delete Expenses** - Complete CRUD operations
- ✅ **Category Management** - Pre-defined categories with custom colors
- ✅ **Real-time Analytics** - Total, monthly expenses and transaction counts
- ✅ **Date Filtering** - Filter expenses by date ranges
- ✅ **Indian Currency** - Formatted in Indian Rupees (₹) with proper localization
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices

### Security Features
- 🔐 **Password Hashing** - bcrypt for secure password storage
- 🔑 **JWT Authentication** - Secure token-based authentication
- 👤 **User Session Management** - Automatic logout and session handling
- 🛡️ **Protected Routes** - All expense operations require authentication

### User Interface
- Modern gradient design with smooth animations
- Interactive forms with real-time validation
- Category-wise expense summaries with visual indicators
- Clean, intuitive user experience
- User-friendly login/signup interface

## 🏗️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid, animations
- **JavaScript (ES6+)** - Async/await, DOM manipulation, API integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database with connection pooling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation and verification

### Database
- **PostgreSQL** - Relational database hosted on Supabase

### Deployment
- **Vercel** - Frontend and serverless API hosting
- **Supabase** - PostgreSQL database hosting

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher) OR [Supabase Account](https://supabase.com/)
- [Git](https://git-scm.com/)

### Step 1: Clone Repository
```bash
git clone https://github.com/ashutosh8021/Expense_tracker-.git
cd expense-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker

# JWT Secret for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 4: Database Setup

#### Option A: Local PostgreSQL
1. **Install and start PostgreSQL**
2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE expense_tracker;
   \c expense_tracker
   ```

3. **Setup Tables**
   ```bash
   # Tables are created automatically when the server starts
   # Or run the setup file manually:
   psql -U postgres -d expense_tracker -f database-setup.sql
   ```

#### Option B: Supabase (Recommended)
1. Create account at [Supabase](https://supabase.com/)
2. Create new project
3. Get connection string from project settings
4. Update `DATABASE_URL` in `.env` file
5. Tables will be created automatically on first run

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
├── api/
│   └── server.js          # Main server file with authentication
├── public/
│   ├── index.html         # Main application dashboard
│   ├── login.html         # Authentication page
│   ├── styles.css         # Styling and responsive design
│   └── script.js          # Frontend logic and API calls
├── database-setup.sql     # Database schema and setup
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
└── README.md             # Documentation
```

## 🔐 Authentication System

### User Management
- **Signup**: Create new user account with name, email, and password
- **Login**: Authenticate with email and password
- **Password Security**: Passwords are hashed using bcrypt
- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **Session Management**: Automatic logout on token expiration

### API Endpoints

#### Authentication Routes
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securePassword123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Protected Expense Routes
All expense routes require `Authorization: Bearer <jwt_token>` header:

```http
GET /api/expenses
POST /api/expenses
PUT /api/expenses/:id
DELETE /api/expenses/:id
```

### Frontend Authentication Flow
1. User lands on main page
2. If no valid token, redirect to `/login.html`
3. After successful login, token stored in localStorage
4. All API calls include authentication header
5. On logout, token is removed and user redirected to login

## Usage

1. **Create Account**: Visit the application and sign up with your name, email, and password
2. **Login**: Use your credentials to access your personal expense dashboard
3. **Adding Expenses**: Use the form to add new expenses with amount, category, and description
4. **Viewing History**: Check the expense list to see all your recorded transactions
5. **Analytics**: View your personal spending summaries by category and time period
6. **Data Security**: Your data is completely private - only you can see your expenses
7. **Logout**: Use the logout button to securely end your session

## Benefits

- Better understanding of spending patterns
- Improved budget planning
- Financial awareness and control
- Data-driven financial decisions

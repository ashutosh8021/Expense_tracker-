# 💰 Expense Tracker - Smart Personal Finance Manager

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-blue?style=for-the-badge)](https://expense-tracker-rho-eight-39.vercel.app/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()

A modern, full-stack expense tracking application featuring **interactive charts**, **real-time analytics**, and **secure user authentication**. Built with vanilla JavaScript for optimal performance and beautiful CSS visualizations.

![Expense Tracker Preview](https://img.shields.io/badge/🎨_Modern_UI-Glassmorphism_Design-purple?style=flat-square)
![Charts](https://img.shields.io/badge/📊_Visual_Analytics-CSS_Charts-orange?style=flat-square)
![Performance](https://img.shields.io/badge/⚡_Performance-Lightweight-green?style=flat-square)

---

## ✨ Key Features

### 📊 **Visual Analytics Dashboard**
- **Interactive Pie Charts** - Category-wise expense breakdown with hover effects
- **Weekly Trends** - Bar chart visualization of spending patterns
- **Real-time Updates** - Charts update instantly as you add expenses
- **Percentage Insights** - Automatic calculation of category spending distribution

### 🎯 **Smart Expense Management**
- **Quick Amount Buttons** - One-click entry for common amounts (₹50, ₹100, ₹500, ₹1000)
- **Category Color Coding** - Visual category identification with custom colors
- **Instant Totals** - Real-time calculation of totals and monthly summaries
- **Transaction Counter** - Track number of expenses automatically

### 🔐 **Enterprise-Grade Security**
- **JWT Authentication** - Secure token-based user sessions
- **Password Encryption** - bcrypt hashing for password security
- **Private Data** - Each user sees only their own expenses
- **Session Management** - Automatic logout and secure token handling

### � **Modern User Experience**
- **Glassmorphism Design** - Beautiful modern UI with backdrop blur effects
- **Responsive Layout** - Perfect on desktop, tablet, and mobile devices
- **Smooth Animations** - 60fps CSS animations for seamless interactions
- **Loading States** - Visual feedback for all user actions

---

## 🛠️ Technology Stack

### **Frontend Excellence**
```
📱 Modern Vanilla JavaScript (ES6+)
🎨 CSS3 with Advanced Features (Grid, Flexbox, Backdrop Filters)
📊 Pure CSS Charts (No External Libraries)
📐 Responsive Design (Mobile-First Approach)
```

### **Backend Architecture**
```
⚡ Node.js + Express.js
🗄️ PostgreSQL with Connection Pooling
🔐 JWT + bcrypt Security
☁️ Serverless Functions (Vercel)
```

### **Deployment & Hosting**
```
🚀 Vercel (Frontend + API)
🗄️ Supabase (PostgreSQL Database)
📡 CDN-Powered Global Distribution
```

---

## � Quick Start

### **1. Clone & Install**
```bash
# Clone the repository
git clone https://github.com/ashutosh8021/Expense_tracker-.git
cd Expense_tracker-

# Install dependencies
npm install
```

### **2. Environment Setup**
Create `.env` file:
```env
# Database (Get from Supabase.com)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key

# Optional: Server Configuration
PORT=3000
NODE_ENV=development
```

### **3. Database Setup**
**Option A: Supabase (Recommended)**
1. Create free account at [Supabase](https://supabase.com/)
2. Create new project → Get connection string
3. Update `DATABASE_URL` in `.env`
4. Tables auto-created on first run ✨

**Option B: Local PostgreSQL**
```bash
# Create database
createdb expense_tracker

# Tables will be created automatically
npm start
```

### **4. Launch Application**
```bash
# Start the server
npm start

# Visit your app
open http://localhost:3000
```

🎉 **That's it! Your expense tracker is ready to use.**

---

## 📊 Feature Showcase

### **Interactive Pie Chart**
```javascript
// Automatic category breakdown with beautiful CSS gradients
const categories = {
  food: { color: '#FF6B6B', amount: 2500 },
  transport: { color: '#4ECDC4', amount: 1200 },
  entertainment: { color: '#45B7D1', amount: 800 }
};
// Generates: conic-gradient(#FF6B6B 0% 45%, #4ECDC4 45% 72%, ...)
```

### **Weekly Trends Visualization**
```css
.weekly-bar {
  height: calc(var(--amount) / var(--max-amount) * 100%);
  background: linear-gradient(45deg, var(--category-color), transparent);
  animation: growUp 0.8s ease-out;
}
```

### **Quick Amount Entry**
```html
<!-- One-click common amounts -->
<div class="quick-amounts">
  <button onclick="setQuickAmount(50)">₹50</button>
  <button onclick="setQuickAmount(100)">₹100</button>
  <button onclick="setQuickAmount(500)">₹500</button>
  <button onclick="setQuickAmount(1000)">₹1000</button>
</div>
```

---

## 📁 Project Structure

```
📦 Expense Tracker
├── 🔧 api/
│   └── server.js              # Express.js API with authentication
├── 🎨 public/
│   ├── index.html             # Main dashboard with charts
│   ├── login.html             # Authentication page
│   ├── styles.css             # Modern CSS with charts & animations
│   └── script.js              # Frontend logic & chart generation
├── 🗄️ database-setup.sql      # PostgreSQL schema
├── ⚙️ package.json            # Dependencies & scripts
├── 🚀 vercel.json             # Deployment configuration
└── 📖 README.md               # This documentation
```

---

## 🔐 API Documentation

### **Authentication Endpoints**

#### Sign Up New User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: { "token": "jwt_token_here", "user": { "id": 1, "name": "John Doe" } }
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: { "token": "jwt_token_here", "user": { "id": 1, "name": "John Doe" } }
```

### **Expense Management**
All endpoints require: `Authorization: Bearer <jwt_token>`

```http
GET    /api/expenses           # Get user's expenses
POST   /api/expenses           # Create new expense
PUT    /api/expenses/:id       # Update existing expense
DELETE /api/expenses/:id       # Delete expense
```

---

## 🎨 Visual Features

### **Chart Types**
- 🥧 **Pie Charts** - Category distribution with interactive legends
- 📊 **Bar Charts** - Weekly spending trends
- 📈 **Real-time Updates** - Charts update as you add expenses

### **UI Highlights**
- 🌟 **Glassmorphism** - Modern frosted glass effects
- 🎭 **Smooth Animations** - CSS transitions and transforms
- 📱 **Mobile Responsive** - Adaptive layout for all screen sizes
- 🎨 **Color Coded** - Categories with distinct visual identities

---

## 💡 Usage Guide

### **Getting Started**
1. **📝 Sign Up** - Create your account with name, email, and password
2. **🔐 Login** - Access your personal dashboard securely
3. **💰 Add Expenses** - Use the form or quick amount buttons
4. **📊 View Analytics** - Check your pie chart and weekly trends
5. **📱 Stay Organized** - All your data syncs across devices

### **Pro Tips**
- 🚀 **Use Quick Buttons** - Faster entry for common amounts
- 📊 **Check Charts Daily** - Visual feedback improves spending awareness
- 🏷️ **Categorize Properly** - Better insights with accurate categorization
- 📅 **Review Weekly Trends** - Identify spending patterns and habits

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy in one command
vercel

# Set environment variables in Vercel dashboard
```

### **Environment Variables**
Set these in your deployment platform:
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_super_secure_secret_key
```

---

## 🎯 Performance Features

- ⚡ **Lightweight** - No external chart libraries, pure CSS visualizations
- 🚀 **Fast Loading** - Optimized assets and serverless functions
- 📱 **Mobile Optimized** - Responsive design with touch-friendly interfaces
- 🔄 **Real-time Updates** - Instant chart updates without page refreshes

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **📤 Push** to the branch (`git push origin feature/AmazingFeature`)
5. **🔄 Open** a Pull Request

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run with file watching
npm run start:dev
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🎨 **Design Inspiration** - Modern glassmorphism and neumorphism trends
- 📊 **Chart Implementation** - Pure CSS chart techniques and animations
- 🔐 **Security Best Practices** - JWT and bcrypt implementation patterns
- 🚀 **Performance Optimization** - Lighthouse and Core Web Vitals guidelines

---

<div align="center">

### 🌟 **Ready to take control of your finances?**

[![Launch App](https://img.shields.io/badge/🚀_Launch_App-Start_Tracking-blue?style=for-the-badge&logo=rocket)](https://expense-tracker-rho-eight-39.vercel.app/)
[![View Code](https://img.shields.io/badge/📋_View_Code-GitHub-black?style=for-the-badge&logo=github)](https://github.com/ashutosh8021/Expense_tracker-)

**Built with ❤️ for better financial management**

</div>

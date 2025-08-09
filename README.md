# 💰 My Personal Expense Tracker

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_It_Out-blue?style=for-the-badge)](https://expense-tracker-1801.vercel.app/)
[![Analytics](https://img.shields.io/badge/📊_Admin_Panel-Check_It_Out-purple?style=for-the-badge)](https://expense-tracker-1801.vercel.app/analytics.html)

**Okay, so here's the deal...** I got completely tired of tracking my expenses in Excel spreadsheets. Like seriously, who has time to open Excel every time you buy a coffee? 🙄

So I decided to build my own expense tracker that's actually fun to use. This is what came out of a week of coding and way too much coffee.

 **🎯 Try it here:** [expense-tracker-1801.vercel.app](https://expense-tracker-1801.vercel.app/)  
> **📊 Admin stuff:** [Analytics Dashboard](https://expense-tracker-1801.vercel.app/analytics.html) *(I made this to see how people use the app)*

---

## 🤔 Why I Built This

**The Excel Problem:** I used to track expenses in spreadsheets, but it was painful:
- Had to open Excel every time I spent money
- Formatting was always messed up  
- No cool charts or visual feedback
- Couldn't access it on my phone easily

**My Solution:** Build something that's actually enjoyable to use with:
- Quick-add buttons for common amounts (₹50, ₹100, ₹200, ₹500)
- Instant visual feedback with colorful charts
- Works perfectly on phone and laptop
- Password reset via OTP (because I always forget passwords 😅)

---

## ✨ What It Does

### **💸 The Main App**
- Add expenses super quickly with preset buttons or custom amounts
- Organize by categories (Food, Transport, Entertainment, etc.)
- See your spending in real-time with pretty pie charts
- Set monthly budgets and get warnings when you're overspending
- Weekly spending trends (I love seeing the weekend spikes 📈)

### **� Admin Dashboard** *(The Nerdy Part)*
- See how many people are using the app
- Track which features people use most
- User analytics and spending patterns
- Built this mainly because I was curious about user behavior

---

## 🛠️ How I Built It

**Tech Choices:**
- **Frontend:** Just HTML, CSS, and JavaScript (no fancy frameworks!)
- **Backend:** Node.js with Express because it's simple and works
- **Database:** PostgreSQL on Supabase (free tier is awesome)
- **Hosting:** Vercel (deploys automatically from GitHub)

**Why No React/Vue?** Honestly, I wanted to prove I could build something cool with just vanilla JavaScript. Plus, it's faster and I understand exactly what's happening.

---

## 🎨 Cool Technical Stuff I'm Proud Of

- **CSS Pie Charts:** Used conic-gradient and some math to make those colorful pie charts without any charting library
- **OTP Password Reset:** Got tired of email links not working, so I built SMS-style OTP verification
- **Mobile-First Design:** Works great on phones because that's where I track most expenses
- **JWT Authentication:** Secure login without storing passwords in plain text
- **Real-time Updates:** Everything updates instantly when you add/edit expenses

The gradient background took me like 20+ tries to get right, but totally worth it! 😅

---

## � My Week of Coding

Built this whole thing in one intense week during summer break:

**Day 1-2:** Started with basic HTML structure and that purple gradient background (took forever to get right)  
**Day 3-4:** Added expense tracking logic and those CSS pie charts (lots of math involved!)  
**Day 5-6:** Built the backend, database, and authentication system  
**Day 7:** Admin dashboard and deployed everything to production

**Total:** ~60 hours of coding, debugging, and learning. Worth every minute!

---

## 🎯 Try It Yourself

**Just visit:** [expense-tracker-1801.vercel.app](https://expense-tracker-1801.vercel.app/)

1. **Sign up** with your email (don't worry, I don't spam)
2. **Add some expenses** using the quick buttons or custom amounts  
3. **Watch the charts** update in real-time (it's oddly satisfying)
4. **Set a budget** and see if you can stick to it (spoiler: you probably won't 😄)

**Forgot your password?** The OTP reset actually works - I tested it like 50 times!

---

## � Want to Run It Locally?

```bash
# Get the code
git clone https://github.com/ashutosh8021/Expense_tracker-.git
cd Expense_tracker-

# Install stuff
npm install

# Set up environment (you'll need your own database)
cp .env.example .env
# Add your DATABASE_URL and JWT_SECRET

# Start it up
npm start
```

---

## �‍♂️ About Me

Hey! I'm **Ashutosh Kumar**, a 3rd-year CS student at IIT Patna. I built this because:
1. I needed it for my own expense tracking
2. Wanted to prove vanilla JavaScript can do cool things
3. Love building stuff that people actually use

**Contact me:**
- **Email:** ashutosh_2312res778@iitp.ac.in
- **LinkedIn:** [linkedin.com/in/ashutosh80](https://www.linkedin.com/in/ashutosh80)
- **GitHub:** [ashutosh8021](https://github.com/ashutosh8021)

If you use this and find bugs, let me know! I'm always fixing things and adding features.

---

## � License

MIT License - Use it, modify it, learn from it. Just don't sell it as your own 😉

---

*Built with lots of ☕ and determination | August 2025*

**P.S.** If you're still using Excel for expense tracking, just try this once. I promise it's way more fun!

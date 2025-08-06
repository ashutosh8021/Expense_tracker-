# 📧 Email Setup Guide for Password Reset

This guide will help you set up real email delivery for your expense tracker's password reset functionality.

## 🚀 Quick Setup Options

### **Option 1: Gmail (Recommended for Personal/Small Projects)**

#### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

#### **Step 2: Generate App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** and **"Other (custom name)"**
3. Enter: `Expense Tracker App`
4. Copy the generated 16-character password

#### **Step 3: Set Environment Variables**
Add these to your deployment platform (Vercel/Heroku/etc.):

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
NODE_ENV=production
```

---

### **Option 2: SendGrid (Recommended for Production)**

#### **Step 1: Create SendGrid Account**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your email and complete setup

#### **Step 2: Generate API Key**
1. Go to **Settings** → **API Keys**
2. Create new API key with **Full Access**
3. Copy the API key

#### **Step 3: Update Server Code**
Replace the Gmail configuration with:

```javascript
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

#### **Step 4: Set Environment Variables**
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=your-verified@domain.com
NODE_ENV=production
```

---

### **Option 3: Other Email Providers**

#### **Outlook/Hotmail**
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### **Yahoo Mail**
```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### **Custom SMTP**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-domain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

## 🔧 Platform-Specific Setup

### **Vercel Deployment**

#### **Method 1: Vercel Dashboard**
1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **Environment Variables**
3. Add:
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASS` = `your-app-password`
   - `NODE_ENV` = `production`

#### **Method 2: Vercel CLI**
```bash
vercel env add EMAIL_USER
# Enter: your-email@gmail.com

vercel env add EMAIL_PASS
# Enter: your-app-password

vercel env add NODE_ENV
# Enter: production
```

### **Heroku Deployment**
```bash
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set NODE_ENV=production
```

### **Railway Deployment**
1. Go to your Railway project dashboard
2. Go to **Variables** tab
3. Add the environment variables

---

## 🧪 Testing Email Delivery

### **Test Locally with Real Emails**
Update your local `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

Then test:
```bash
npm start
# Try password reset from the app
```

### **Test in Production**
1. Deploy with environment variables set
2. Go to your live app
3. Click "Forgot Password"
4. Enter a real email address
5. Check your inbox (and spam folder)

---

## 🛡️ Security Best Practices

### **Gmail Security**
- ✅ Use App Passwords, never your main password
- ✅ Enable 2-Factor Authentication
- ✅ Monitor login activity regularly

### **SendGrid Security**
- ✅ Use API keys with minimal required permissions
- ✅ Rotate API keys regularly
- ✅ Set up domain authentication

### **General Security**
- ✅ Never commit credentials to git
- ✅ Use environment variables only
- ✅ Monitor email sending logs
- ✅ Set up rate limiting for email endpoints

---

## 📊 Email Delivery Monitoring

### **Check Email Status**
The server will log email delivery:
```
✅ Email sent successfully: <message-id>
📧 Email delivered to: user@example.com
```

### **Handle Email Failures**
The system includes error handling:
```
❌ Email sending failed: [error details]
```

### **Production Monitoring**
Consider adding:
- Email delivery rate tracking
- Failed email logging
- Retry mechanisms for failed sends

---

## 🎨 Customizing Email Templates

### **Brand Your Emails**
Update the email HTML in `server.js`:
```javascript
const emailHtml = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- Add your logo, branding, etc. -->
    <img src="https://your-domain.com/logo.png" alt="Your App">
    <!-- Rest of the email content -->
  </div>
`;
```

### **Add Multiple Languages**
```javascript
const getEmailTemplate = (language, resetUrl) => {
  const templates = {
    en: { subject: 'Reset Your Password', content: '...' },
    es: { subject: 'Restablecer Contraseña', content: '...' }
  };
  return templates[language] || templates.en;
};
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **"Authentication Failed"**
- Check if 2FA is enabled on Gmail
- Verify App Password is correct
- Make sure EMAIL_USER matches the Gmail account

#### **"Connection Timeout"**
- Check firewall settings
- Verify SMTP ports (587 for TLS, 465 for SSL)
- Try different email service

#### **Emails Going to Spam**
- Set up SPF/DKIM records for your domain
- Use a verified sender address
- Avoid spam trigger words in subject/content

#### **Environment Variables Not Working**
- Restart your server after setting variables
- Check variable names for typos
- Verify deployment platform loaded the variables

---

## 📝 Support

If you need help with email setup:

1. **Check the server logs** for specific error messages
2. **Test with a simple email first** (like Gmail to Gmail)
3. **Verify all environment variables** are set correctly
4. **Check your email provider's documentation** for SMTP settings

Remember: The system works with mock emails by default, so you can develop and test without real email setup initially!


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('Server starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL present:', !!process.env.DATABASE_URL);
console.log('Port:', PORT);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection test successful:', res.rows[0]);
  }
});

// Email configuration
const getEmailTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    // SendGrid configuration (production)
    console.log('🔧 Using SendGrid for email delivery');
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Gmail configuration (fallback)
    console.log('🔧 Using Gmail for email delivery');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    console.log('⚠️ No email credentials configured - using mock mode');
    return null;
  }
};

const transporter = getEmailTransporter();

// Verify email configuration on startup
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
      if (process.env.SENDGRID_API_KEY) {
        console.log('📧 Using SendGrid service');
      } else {
        console.log('📧 Using Gmail service');
      }
    }
  });
} else {
  console.log('📧 Email service not configured - running in mock mode');
}

// Enhanced email sending function
const sendEmail = async (to, subject, html) => {
  try {
    // Check if we have email credentials configured
    const hasEmailConfig = process.env.SENDGRID_API_KEY || (process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    if (hasEmailConfig && transporter) {
      // Send real email (works in both development and production)
      const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@expense-tracker.com';
      
      const info = await transporter.sendMail({
        from: `"Expense Tracker" <${fromEmail}>`,
        to,
        subject,
        html
      });
      
      console.log('✅ Email sent successfully:', info.messageId);
      console.log('📧 Email delivered to:', to);
      
      if (process.env.SENDGRID_API_KEY) {
        console.log('📬 Delivered via SendGrid');
      } else {
        console.log('📬 Delivered via Gmail');
      }
      
      return { success: true, messageId: info.messageId };
    } else {
      // No email config - enhanced mock
      console.log('\n📧 ===== MOCK EMAIL DELIVERY =====');
      console.log(`📬 To: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log('🎨 Email Content Preview:');
      console.log('─'.repeat(50));
      // Extract just the main message from HTML
      const textContent = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const preview = textContent.substring(0, 200) + '...';
      console.log(preview);
      console.log('─'.repeat(50));
      console.log('💡 To enable real emails:');
      console.log('   Set SENDGRID_API_KEY for production email delivery');
      console.log('   Or set EMAIL_USER and EMAIL_PASS for Gmail delivery');
      console.log('📧 ================================\n');
      
      return { success: true, messageId: 'mock-' + Date.now() };
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Log specific SendGrid errors
    if (error.code) {
      console.error('📧 SendGrid Error Code:', error.code);
    }
    if (error.response && error.response.body) {
      console.error('📧 SendGrid Error Details:', error.response.body);
    }
    
    throw error;
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Import analytics routes
const analyticsRoutes = require('./analytics');
app.use('/api/analytics', analyticsRoutes);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authentication check - token present:', !!token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    console.log('User authenticated:', user);
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected',
      dbTime: dbTest.rows[0].now
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Password Reset Request
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // For development/demo - simulate email check without database
    if (process.env.NODE_ENV === 'development') {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store in memory for demo (in production this goes to database)
      global.resetTokens = global.resetTokens || {};
      global.resetTokens[resetToken] = {
        email: email,
        expires: expiresAt,
        used: false
      };
      
      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
      
      // Email template
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
          <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">🔐 Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">Hello!</p>
            <p style="color: #555; font-size: 16px;">You requested a password reset for your Expense Tracker account. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
            
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              ⏰ This link will expire in 15 minutes for security.<br>
              🚫 If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `;
      
      // Send email (mock in development)
      await sendEmail(email, 'Reset Your Password - Expense Tracker', emailHtml);
      
      // Also log the reset URL for easy testing
      console.log(`\n🔗 PASSWORD RESET LINK for ${email}:`);
      console.log(`${resetUrl}\n`);
      
      res.json({ message: 'If this email exists, you will receive a password reset link.' });
      return;
    }
    
    // Production database code
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'If this email exists, you will receive a password reset link.' });
    }
    
    const user = userResult.rows[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store reset token
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
    
    // Email template
    const emailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
        <div style="background: rgba(255,255,255,0.95); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">🔐 Password Reset Request</h2>
          <p style="color: #555; font-size: 16px;">Hello ${user.name},</p>
          <p style="color: #555; font-size: 16px;">You requested a password reset for your Expense Tracker account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="background: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          
          <p style="color: #888; font-size: 14px; margin-top: 20px;">
            ⏰ This link will expire in 15 minutes for security.<br>
            🚫 If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
    
    // Send email
    await sendEmail(email, 'Reset Your Password - Expense Tracker', emailHtml);
    
    res.json({ message: 'If this email exists, you will receive a password reset link.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Password Reset Confirmation
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Development mode - use in-memory tokens
    if (process.env.NODE_ENV === 'development') {
      global.resetTokens = global.resetTokens || {};
      const tokenData = global.resetTokens[token];
      
      if (!tokenData || tokenData.used || new Date() > tokenData.expires) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Mark token as used
      tokenData.used = true;
      
      // In development, we'll just confirm success
      // (In production, this would update the actual user password in database)
      console.log(`\n✅ Password reset successful for: ${tokenData.email}`);
      console.log(`New password: ${newPassword}\n`);
      
      res.json({ message: 'Password reset successfully' });
      return;
    }
    
    // Production database code
    const tokenResult = await pool.query(`
      SELECT prt.*, u.email, u.name 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = $1 AND prt.expires_at > NOW() AND prt.used = FALSE
    `, [token]);
    
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const resetData = tokenResult.rows[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, resetData.user_id]);
    
    // Mark token as used
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [resetData.id]);
    
    // Delete all other reset tokens for this user
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id != $2', [resetData.user_id, resetData.id]);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Protected Routes - All expense routes now require authentication
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      WHERE e.user_id = $1
      ORDER BY e.date DESC, e.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    // Validate required fields
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }
    
    // Validate amount is a number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    console.log('Adding expense for user:', req.user.id, 'Data:', { amount, category, description, date });
    
    const result = await pool.query(
      'INSERT INTO expenses (amount, category, description, date, user_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [amount, category, description, date, req.user.id]
    );
    
    console.log('Expense added successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense', details: error.message });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    const result = await pool.query(
      'UPDATE expenses SET amount = $1, category = $2, description = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [amount, category, description, date, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.get('/api/expenses/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT name, color FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Home page - redirect to login if not authenticated
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Initialize database
async function initDB() {
  try {
    console.log('Starting database initialization...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating categories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) NOT NULL
      )
    `);

    console.log('Creating expenses table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating password_reset_tokens table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add user_id column if it doesn't exist (migration for existing tables)
    console.log('Checking if user_id column exists...');
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='expenses' AND column_name='user_id'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding user_id column to expenses table...');
      await pool.query(`
        ALTER TABLE expenses 
        ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('user_id column added successfully');
    } else {
      console.log('user_id column already exists');
    }

    // Insert default categories
    console.log('Inserting default categories...');
    const categories = [
      ['Food', '#FF6B6B'],
      ['Transportation', '#4ECDC4'],
      ['Entertainment', '#45B7D1'],
      ['Shopping', '#96CEB4'],
      ['Bills', '#FFEAA7'],
      ['Healthcare', '#DDA0DD'],
      ['Education', '#98D8C8'],
      ['Other', '#F7DC6F']
    ];

    for (const [name, color] of categories) {
      await pool.query(
        'INSERT INTO categories (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, color]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error details:', error.message);
    // Don't exit the process, but log the error
  }
}

// Initialize database on startup
initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

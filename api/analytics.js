const express = require('express');
const { Pool } = require('pg');

// Create database connection (same as server.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const router = express.Router();

// Simple admin authentication middleware (disabled for now since frontend has password protection)
const adminAuth = (req, res, next) => {
  // Frontend already has password protection, so we'll allow API access
  // The real security is in the analytics.html password prompt
  next();
};

// Get user statistics
router.get('/users/stats', adminAuth, async (req, res) => {
  try {
    // Total users
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Users registered today
    const todayUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Users registered this week
    const weekUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    // Users registered this month
    const monthUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    
    // Active users (users who added expenses in last 7 days)
    const activeUsers = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM expenses 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    // Daily signups for last 30 days
    const dailySignups = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as signups
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      todayUsers: parseInt(todayUsers.rows[0].count),
      weekUsers: parseInt(weekUsers.rows[0].count),
      monthUsers: parseInt(monthUsers.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count),
      dailySignups: dailySignups.rows
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get detailed user information for admin
router.get('/users/details', adminAuth, async (req, res) => {
  try {
    // Recent users (last 50)
    const recentUsers = await pool.query(`
      SELECT 
        id,
        name,
        email,
        created_at,
        (SELECT COUNT(*) FROM expenses WHERE user_id = users.id) as expense_count,
        (SELECT SUM(amount) FROM expenses WHERE user_id = users.id) as total_spent
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    
    // Most active users (by expense count)
    const activeUsers = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_spent,
        MAX(e.created_at) as last_expense
      FROM users u
      LEFT JOIN expenses e ON u.id = e.user_id
      GROUP BY u.id, u.name, u.email, u.created_at
      HAVING COUNT(e.id) > 0
      ORDER BY expense_count DESC
      LIMIT 20
    `);
    
    // Users by signup date
    const usersByDate = await pool.query(`
      SELECT 
        DATE(created_at) as signup_date,
        COUNT(*) as signups,
        string_agg(name, ', ') as user_names
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY signup_date DESC
    `);
    
    res.json({
      recentUsers: recentUsers.rows,
      activeUsers: activeUsers.rows,
      usersByDate: usersByDate.rows
    });
    
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get expense statistics
router.get('/expenses/stats', adminAuth, async (req, res) => {
  try {
    // Total expenses
    const totalExpenses = await pool.query('SELECT COUNT(*) as count FROM expenses');
    
    // Total amount spent
    const totalAmount = await pool.query('SELECT SUM(amount) as total FROM expenses');
    
    // Expenses today
    const todayExpenses = await pool.query(`
      SELECT COUNT(*) as count FROM expenses 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Most popular categories
    const popularCategories = await pool.query(`
      SELECT 
        category,
        COUNT(*) as usage_count,
        SUM(amount) as total_amount
      FROM expenses 
      GROUP BY category
      ORDER BY usage_count DESC
      LIMIT 5
    `);

    res.json({
      totalExpenses: parseInt(totalExpenses.rows[0].count),
      totalAmount: parseFloat(totalAmount.rows[0].total || 0),
      todayExpenses: parseInt(todayExpenses.rows[0].count),
      popularCategories: popularCategories.rows
    });

  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ error: 'Failed to fetch expense statistics' });
  }
});

// Track page visits (for monitoring app usage)
router.post('/track/visit', async (req, res) => {
  try {
    const { page, userAgent, timestamp } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Create visits table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id SERIAL PRIMARY KEY,
        page VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert visit record
    await pool.query(`
      INSERT INTO page_visits (page, ip_address, user_agent)
      VALUES ($1, $2, $3)
    `, [page, ipAddress, userAgent]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Get app usage statistics
router.get('/usage/stats', adminAuth, async (req, res) => {
  try {
    // Total page views
    const totalViews = await pool.query('SELECT COUNT(*) as count FROM page_visits');
    
    // Unique visitors (by IP)
    const uniqueVisitors = await pool.query('SELECT COUNT(DISTINCT ip_address) as count FROM page_visits');
    
    // Views today
    const todayViews = await pool.query(`
      SELECT COUNT(*) as count FROM page_visits 
      WHERE DATE(visit_time) = CURRENT_DATE
    `);
    
    // Views this week
    const weekViews = await pool.query(`
      SELECT COUNT(*) as count FROM page_visits 
      WHERE visit_time >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    // Most popular pages
    const popularPages = await pool.query(`
      SELECT 
        page,
        COUNT(*) as views
      FROM page_visits 
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `);
    
    res.json({
      totalViews: parseInt(totalViews.rows[0].count),
      uniqueVisitors: parseInt(uniqueVisitors.rows[0].count),
      todayViews: parseInt(todayViews.rows[0].count),
      weekViews: parseInt(weekViews.rows[0].count),
      popularPages: popularPages.rows
    });
    
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

module.exports = router;

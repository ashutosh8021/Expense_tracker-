const express = require('express');
const { pool } = require('../database/connection');

const router = express.Router();

// Get user statistics
router.get('/users/stats', async (req, res) => {
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

// Get expense statistics
router.get('/expenses/stats', async (req, res) => {
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

module.exports = router;

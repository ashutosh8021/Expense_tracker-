const express = require('express');
const { getConnection } = require('../database/connection');

const router = express.Router();

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      ORDER BY e.date DESC, e.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expenses by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const connection = await getConnection();
    
    let query = `
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY e.date DESC, e.created_at DESC';

    const [rows] = await connection.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching expenses by range:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense summary by category
router.get('/summary/category', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const connection = await getConnection();
    
    let query = `
      SELECT 
        e.category,
        c.color as category_color,
        SUM(e.amount) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND e.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY e.category, c.color ORDER BY total_amount DESC';

    const [rows] = await connection.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching category summary:', error);
    res.status(500).json({ error: 'Failed to fetch category summary' });
  }
});

// Get monthly summary
router.get('/summary/monthly', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        YEAR(date) as year,
        MONTH(date) as month,
        MONTHNAME(date) as month_name,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses 
      GROUP BY YEAR(date), MONTH(date)
      ORDER BY YEAR(date) DESC, MONTH(date) DESC
      LIMIT 12
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

// Add new expense
router.post('/', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
      [amount, category, description || '', date]
    );

    // Fetch the created expense with category color
    const [expense] = await connection.execute(`
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      WHERE e.id = ?
    `, [result.insertId]);

    res.status(201).json(expense[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    
    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }

    const connection = await getConnection();
    await connection.execute(
      'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
      [amount, category, description || '', date, id]
    );

    // Fetch the updated expense with category color
    const [expense] = await connection.execute(`
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      WHERE e.id = ?
    `, [id]);

    if (expense.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    
    const [result] = await connection.execute('DELETE FROM expenses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;

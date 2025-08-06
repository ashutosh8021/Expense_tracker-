const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.color as category_color 
      FROM expenses e 
      LEFT JOIN categories c ON e.category = c.name 
      ORDER BY e.date DESC, e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const result = await pool.query(
      'INSERT INTO expenses (amount, category, description, date, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [amount, category, description, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    const result = await pool.query(
      'UPDATE expenses SET amount = $1, category = $2, description = $3, date = $4 WHERE id = $5 RETURNING *',
      [amount, category, description, date, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get categories
app.get('/api/expenses/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT name, color FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Initialize database
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) NOT NULL
      )
    `);

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

    // Insert default categories
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
  }
}

// Initialize database on startup
initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

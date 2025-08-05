const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const databaseName = process.env.DB_NAME || 'expense_tracker';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    console.log(`Database '${databaseName}' created or already exists`);

    // Use the database
    await connection.execute(`USE ${databaseName}`);

    // Create expenses table
    const createExpensesTable = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createExpensesTable);
    console.log('Expenses table created successfully');

    // Create categories table for predefined categories
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#007bff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createCategoriesTable);
    console.log('Categories table created successfully');

    // Insert default categories
    const defaultCategories = [
      ['Food & Dining', '#ff6b6b'],
      ['Transportation', '#4ecdc4'],
      ['Shopping', '#45b7d1'],
      ['Entertainment', '#96ceb4'],
      ['Bills & Utilities', '#ffeaa7'],
      ['Healthcare', '#dda0dd'],
      ['Education', '#98d8c8'],
      ['Travel', '#f7dc6f'],
      ['Other', '#aaa']
    ];

    for (const [name, color] of defaultCategories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, color) VALUES (?, ?)',
        [name, color]
      );
    }

    console.log('Default categories inserted successfully');
    console.log('Database initialization completed!');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

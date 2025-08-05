const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  port: process.env.DB_PORT || 3306
};

let connection;

async function connectToDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database successfully');
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

async function getConnection() {
  if (!connection) {
    await connectToDatabase();
  }
  return connection;
}

module.exports = {
  connectToDatabase,
  getConnection,
  dbConfig
};

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  port: process.env.DB_PORT || 3306,
  // Railway-specific connection options
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  pool: {
    min: 0,
    max: 10
  }
};

let connection;

async function connectToDatabase() {
  try {
    // Close existing connection if any
    if (connection) {
      await connection.end();
    }
    
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database successfully');
    console.log('Database host:', process.env.DB_HOST);
    return connection;
  } catch (error) {
    console.error('Error connecting to database:', error);
    console.error('Database config:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    throw error;
  }
}

async function getConnection() {
  if (!connection) {
    await connectToDatabase();
  }
  
  // Test connection and reconnect if needed
  try {
    await connection.ping();
  } catch (error) {
    console.log('Connection lost, reconnecting...');
    await connectToDatabase();
  }
  
  return connection;
}

module.exports = {
  connectToDatabase,
  getConnection,
  dbConfig
};

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const expenseRoutes = require('./routes/expenses');
const { connectToDatabase } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/expenses', expenseRoutes);

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Don't connect to database immediately on Railway
    // Let it connect on first request instead
    if (process.env.NODE_ENV !== 'production') {
      await connectToDatabase();
    }
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Expense Tracker server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('Database host:', process.env.DB_HOST || 'localhost');
      if (process.env.NODE_ENV !== 'production') {
        console.log('Make sure to run "npm run init-db" if this is your first time running the app');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    // In production, don't exit immediately - Railway might be starting DB
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying server start in 5 seconds...');
      setTimeout(startServer, 5000);
    } else {
      process.exit(1);
    }
  }
}

startServer();

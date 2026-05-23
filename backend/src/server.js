const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');

// Import database config and generic query
const { query, pool, usePostgres } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading unsplash images on local frontend
}));
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    
    let isConfiguredFront = false;
    if (process.env.FRONTEND_URL) {
      const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const cleanFrontendUrl = process.env.FRONTEND_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
      isConfiguredFront = (cleanOrigin === cleanFrontendUrl);
    }
    
    if (isLocalhost || isConfiguredFront || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Amazon Clone API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database-agnostic test connection query
const testDbQuery = usePostgres ? 'SELECT NOW() as time' : "SELECT datetime('now') as time";

query(testDbQuery)
  .then(async (res) => {
    console.log('✅ Database connected at:', res.rows[0].time);
    
    // Auto-initialize schema and seed data if tables do not exist
    try {
      if (usePostgres) {
        // Check if users table exists in PostgreSQL public schema
        const checkResult = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        const tablesExist = checkResult.rows[0].exists;
        
        if (!tablesExist) {
          console.log('🌱 PostgreSQL tables not found. Initializing database schema...');
          const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await query(schemaSql);
          console.log('✅ PostgreSQL schema initialized successfully.');
          
          console.log('🌱 Seeding database with default products and demo user...');
          const { seedDatabase } = require('./seeders/seedProducts');
          await seedDatabase();
        } else {
          console.log('ℹ️ PostgreSQL tables already exist. Skipping schema initialization.');
        }
      } else {
        // Check if users table exists in SQLite
        const checkResult = await query("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='users'");
        const tablesExist = checkResult.rows[0].count > 0;
        
        if (!tablesExist) {
          // Schema is created automatically in database.js for SQLite, so we just seed
          console.log('🌱 SQLite database is empty. Seeding default products and demo user...');
          const { seedDatabase } = require('./seeders/seedProducts');
          await seedDatabase();
        } else {
          // Double check if products table has rows
          const productsCount = await query("SELECT count(*) as count FROM products");
          if (productsCount.rows[0].count === 0) {
            console.log('🌱 SQLite products table is empty. Seeding default products...');
            const { seedDatabase } = require('./seeders/seedProducts');
            await seedDatabase();
          }
        }
      }
    } catch (dbInitErr) {
      console.error('⚠️ Database auto-initialization/seeding failed:', dbInitErr);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  if (usePostgres) {
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;

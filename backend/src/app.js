const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { seedData } = require('./config/seeder');
const { errorHandler } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customer');
const sellerRoutes = require('./routes/seller');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Health check / Swagger doc dummy
app.get('/api/health', (req, res) => res.json({ status: 'UP', timestamp: new Date() }));
app.get('/swagger-ui.html', (req, res) => res.send('<h1>Swagger UI Placeholder</h1><p>Express server is running in place of Spring Boot.</p>'));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
app.use(errorHandler);

// Seed database and start server
const startServer = async () => {
  try {
    await seedData();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`  Express backend server listening on port ${PORT} `);
      console.log(`  Targeting environment matches Spring Boot configuration.`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting Express server:', err);
    process.exit(1);
  }
};

startServer();

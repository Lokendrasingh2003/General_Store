const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const authRoutes = require('./routes/authRoutesSimple');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'General Store backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'General Store API',
    endpoints: [
      'GET /api/products',
      'GET /api/products/categories',
      'GET /api/products/category/:category',
      'GET /api/products/:id',
      'POST /api/orders',
      'GET /api/orders',
    ],
  });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow React dev server or local network devices (waiter tablets)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Restaurant Billing System API',
    qualityGoal: 'Q01 - Improve Reliability'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/backup', backupRoutes);

// Centralized Error Recovery Middleware
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Restaurant Billing Server running on port ${PORT}`);
    console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🛡️  TQM Reliability Features Active (Audit & Error Logs)`);
    console.log(`====================================================`);
  });
}

module.exports = app;

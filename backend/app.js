const express = require('express');
const app = express();

app.use(express.json());
app.use(express.text({ type: ['text/xml', 'application/xml'], limit: '1mb' }));

// Enable CORS for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
const userRoutes = require('./routes/user.routes');
const catalogRoutes = require('./routes/catalog.routes');

app.use('/api/users', userRoutes);
app.use('/api/catalog', catalogRoutes);

// Simple healthcheck
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// Serve static frontend build if available
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist/frontend/browser');
const altDistPath = path.join(__dirname, '../frontend/dist/browser');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else if (fs.existsSync(altDistPath)) {
  app.use(express.static(altDistPath));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;

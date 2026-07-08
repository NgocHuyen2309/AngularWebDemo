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
const soapRoutes = require('./routes/soap.routes');

app.use('/api/users', userRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/soap', soapRoutes);

// Simple healthcheck
app.get('/health', (req, res) => res.json({ status: 'UP' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;

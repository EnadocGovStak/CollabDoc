require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
// const { auth } = require('./middleware/auth');

// Import routes
const documentsRouter = require('./routes/documents');
const recordsRouter = require('./routes/records');
const templatesRouter = require('./routes/templates');
const fieldsRouter = require('./routes/fields');

// Create Express app  
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Temporarily disable authentication for testing
// app.use('/api', auth());

// Routes
app.use('/api/documents', documentsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/fields', fieldsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid token or missing authentication'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
}); 
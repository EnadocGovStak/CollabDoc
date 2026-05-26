require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
// const { auth } = require('./middleware/auth');

// Import routes
const documentsRouter = require('./routes/documents');
const recordsRouter = require('./routes/records');
const templatesRouter = require('./routes/templates');
const fieldsRouter = require('./routes/fields');
const collaborationRouter = require('./routes/collaboration');
const sflowAuthRouter = require('./routes/sflowAuth');

// Create Express app  
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:3000',
  'https://collabdocweb-fresh.azurewebsites.net',
  process.env.CORS_ORIGIN
].filter(Boolean);

// Middleware
const corsOptions = {
  origin(origin, callback) {
    const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');

    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../public')));

// Temporarily disable authentication for testing
// app.use('/api', auth());

// Routes
app.use('/api/documents', documentsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/fields', fieldsRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/auth/sflow', sflowAuthRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(404).json({ error: 'Not found' });
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
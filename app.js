const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Import routes
const carRoutes = require('./routes/carRoutes');
const contactRoutes = require('./routes/contactRoutes');
const blogRoutes = require('./routes/blogRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Create required directories
const directories = [
  'uploads',
  'uploads/cars',
  'uploads/blogs',
  'uploads/reviews',
  'uploads/reviews/profiles',
  'uploads/homepage',
  'uploads/about',
  'uploads/about/services',
  'uploads/about/trust',
  'uploads/about/cars'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/cars', carRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/chats', chatRoutes);

// 404 handler - comes after routes
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: 'API route not found',
      path: req.url,
      method: req.method
    });
  } else {
    next();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE'
        ? 'File size is too large'
        : 'File upload error',
      error: err.message
    });
  }

  // Clean up uploaded files if there's an error
  if (req.file) {
    fs.unlink(req.file.path, (unlinkError) => {
      if (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    });
  }

  if (req.files) {
    Object.values(req.files).flat().forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, (unlinkError) => {
          if (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        });
      }
    });
  }

  // Log error details
  console.error('Error details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    files: req.files ? Object.keys(req.files) : req.file,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      ...err
    } : {}
  });
});

// Global error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app;
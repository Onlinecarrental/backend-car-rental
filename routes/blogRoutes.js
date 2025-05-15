const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blogController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose destination based on file type
    const dest = file.fieldname === 'authorImage' 
      ? 'uploads/authors' 
      : 'uploads/blogs';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 }
]);
router.get('/:id', blogController.getBlogById);
router.get('/', blogController.getAllBlogs);

// Blog routes
router.post('/', uploadFields, blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.put('/:id', uploadFields, blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
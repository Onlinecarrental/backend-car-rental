const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const homepageController = require('../controllers/homepageController');

// Create uploads directory
const uploadDir = 'uploads/homepage';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Update the storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/homepage';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.params.sectionType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Validation middleware
const validateSection = (req, res, next) => {
  const validSections = ['hero', 'services', 'howItWorks', 'whyChoose', 'faqs'];
  if (!validSections.includes(req.params.sectionType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid section type'
    });
  }
  next();
};

// Routes
router.get('/', homepageController.getAllSections);
router.get('/:sectionType', validateSection, homepageController.getSection);
router.patch('/:sectionType', validateSection, upload.single('image'), homepageController.updateSection);

// Add default route handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Homepage section not found'
  });
});

module.exports = router;
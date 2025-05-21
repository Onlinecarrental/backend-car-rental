const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const aboutController = require('../controllers/aboutController');

// Create uploads directory
const uploadDir = 'uploads/aboutus';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Update the storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/about';
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
  const validSections = ['hero', 'services', 'howItWorks', 'whyChoose', 'faqs', 'trust', 'carCollection'];
  if (!validSections.includes(req.params.sectionType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid section type'
    });
  }
  next();
};

// Routes
router.get('/', aboutController.getAllSections);
router.get('/:sectionType', validateSection, aboutController.getSection);
router.patch('/:sectionType', validateSection, upload.single('image'), aboutController.updateSection);

// Add default route handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'about us section not found'
  });
});

module.exports = router;
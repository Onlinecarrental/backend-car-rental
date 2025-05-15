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

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
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
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
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

module.exports = router;
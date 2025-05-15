const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const reviewController = require('../controllers/reviewController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews/profiles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'), false);
      return;
    }
    cb(null, true);
  }
});

// Routes
router.get('/', reviewController.getApprovedReviews);
router.post('/', upload.single('profileImage'), reviewController.createReview);
router.get('/all', reviewController.getAllReviews);
router.patch('/:id/status', reviewController.updateReviewStatus);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
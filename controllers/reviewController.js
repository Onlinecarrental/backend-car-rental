const Review = require('../models/Review');
const fs = require('fs').promises;
const path = require('path');

const reviewController = {
  // Get approved reviews for public view
  getApprovedReviews: async (req, res) => {
    try {
      const reviews = await Review.find({ status: 'approved' })
        .sort('-createdAt')
        .select('-__v');

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Create new review
  createReview: async (req, res) => {
    try {
      const { name, rating, text } = req.body;
      
      const review = new Review({
        name,
        rating: parseInt(rating),
        text,
        image: req.file 
          ? `/uploads/reviews/profiles/${req.file.filename}`
          : '/images/default-avatar.jpg',
        status: 'pending'
      });

      await review.save();

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully and pending approval',
        data: review
      });
    } catch (error) {
      // Clean up uploaded file if there's an error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Admin: Get all reviews
  getAllReviews: async (req, res) => {
    try {
      const reviews = await Review.find()
        .sort('-createdAt')
        .select('-__v');

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Admin: Update review status
  updateReviewStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status value');
      }

      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        message: 'Review status updated successfully',
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Admin: Delete review
  deleteReview: async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Delete associated image if it exists
      if (review.image && !review.image.includes('default-avatar')) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'reviews', 'profiles', 
          path.basename(review.image));
        await fs.unlink(imagePath).catch(console.error);
      }

      await review.deleteOne();

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = reviewController;
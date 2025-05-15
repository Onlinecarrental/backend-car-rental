const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minLength: [5, 'Title must be at least 5 characters long']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minLength: [100, 'Content must be at least 100 characters long']
  },
  excerpt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  image: {
    type: String,
    required: [true, 'Blog image is required']
  },
  author: {
    name: {
      type: String,
      required: [true, 'Author name is required']
    },
    image: {
      type: String,
      default: 'default-avatar.jpg'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    required: true,
    enum: ['hero', 'services', 'howItWorks', 'whyChoose', 'faqs']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Homepage', homepageSchema);
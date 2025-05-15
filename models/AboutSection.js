const mongoose = require('mongoose');

const aboutSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    required: true,
    enum: ['hero', 'trust', 'services', 'whyChoose', 'carCollection', 'faqs']
  },
  content: {
    title: String,
    description: String,
    tagline: String,
    image: String,
    items: [{
      title: String,
      description: String,
      icon: String,
      features: [String]
    }],
    questions: [{
      question: String,
      answer: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AboutSection', aboutSectionSchema);
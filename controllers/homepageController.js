const Homepage = require('../models/Homepage');
const fs = require('fs').promises;
const path = require('path');

const defaultSections = {
  hero: {
    title: 'Welcome to Car Rental',
    description: 'Find your perfect ride',
    image: ''
  },
  services: {
    header: {
      title: 'Our Services & Benefits',
      description: 'We provide various services and advantages'
    },
    items: []
  },
  howItWorks: {
    header: {
      title: 'How It Works',
      description: 'Easy steps to rent a car'
    },
    steps: []
  },
  whyChoose: {
    header: {
      title: 'Why Choose Us',
      description: 'Best car rental service'
    },
    reasons: []
  },
  faqs: {
    header: {
      title: 'Frequently Asked Questions',
      description: 'Common questions answered'
    },
    items: []
  }
};

const homepageController = {
  getAllSections: async (req, res) => {
    try {
      const sections = await Homepage.find();
      
      // Transform data to match frontend structure
      const formattedData = sections.reduce((acc, section) => {
        acc[section.sectionType] = section.content;
        return acc;
      }, {});

      res.json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getSection: async (req, res) => {
    try {
      const { sectionType } = req.params;
      
      let section = await Homepage.findOne({ sectionType });
      
      // If section doesn't exist, create it with defaults
      if (!section) {
        section = await Homepage.create({
          sectionType,
          content: defaultSections[sectionType]
        });
      }

      res.json({
        success: true,
        data: {
          content: section.content
        }
      });
    } catch (error) {
      console.error('Error fetching section:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateSection: async (req, res) => {
    try {
      const { sectionType } = req.params;
      let content;

      if (req.file) {
        // Parse the content from form data
        content = JSON.parse(req.body.content);
        
        // Create image path relative to uploads directory
        const imagePath = `uploads/homepage/${req.file.filename}`;
        
        // Update content with new image path
        content = {
          ...content,
          image: imagePath
        };

        console.log('Updating with image:', {
          sectionType,
          imagePath,
          content
        });
      } else {
        content = req.body.content;
      }

      const section = await Homepage.findOneAndUpdate(
        { sectionType },
        { content },
        { new: true, upsert: true }
      );

      // Return the full content including image path
      res.json({
        success: true,
        data: {
          content: section.content
        }
      });
    } catch (error) {
      console.error('Error updating section:', error);
      // Cleanup uploaded file if there's an error
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads/homepage', req.file.filename);
        fs.unlink(filePath).catch(err => console.error('File cleanup failed:', err));
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = homepageController;
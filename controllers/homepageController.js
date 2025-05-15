const Homepage = require('../models/Homepage');
const fs = require('fs').promises;
const path = require('path');

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
      const section = await Homepage.findOne({ 
        sectionType: req.params.sectionType 
      });
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }

      res.json({
        success: true,
        data: section.content
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateSection: async (req, res) => {
    try {
      const { sectionType } = req.params;
      let content = {};

      if (req.file) {
        // Handle file upload case
        const parsedContent = JSON.parse(req.body.content || '{}');
        content = {
          ...parsedContent,
          image: `uploads/homepage/${req.file.filename}`
        };
      } else {
        // Handle JSON content case
        content = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      }

      // Validate content
      if (!content) {
        throw new Error('Content is required');
      }

      const updatedSection = await Homepage.findOneAndUpdate(
        { sectionType },
        { content },
        { 
          new: true,
          upsert: true,
          runValidators: true 
        }
      );

      // Clean up old image if new one was uploaded
      if (req.file && updatedSection.content.image && updatedSection.content.image !== content.image) {
        await fs.unlink(path.join(__dirname, '..', updatedSection.content.image))
          .catch(console.error);
      }

      res.json({
        success: true,
        message: 'Section updated successfully',
        data: updatedSection
      });

    } catch (error) {
      // Clean up uploaded file if save fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = homepageController;
const AboutSection = require('../models/AboutSection');
const uploadFile = require('../utils/uploadFile');

const aboutController = {
  getAllSections: async (req, res) => {
    try {
      const sections = await AboutSection.find();
      res.json({
        success: true,
        data: sections
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
      let content = JSON.parse(req.body.content);

      // Handle file upload if present
      if (req.file) {
        const imagePath = await uploadFile(req.file);
        content.image = imagePath;
      }

      const section = await AboutSection.findOneAndUpdate(
        { sectionType },
        { content },
        { new: true }
      );

      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }

      res.json({
        success: true,
        data: section
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = aboutController;
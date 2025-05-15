const Category = require('../models/Category');

const categoryController = {
  createCategory: async (req, res) => {
    try {
      const category = new Category({
        name: req.body.name
      });
      
      const savedCategory = await category.save();
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: savedCategory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.code === 11000 ? 'Category already exists' : error.message
      });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find().sort('name');
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = categoryController;
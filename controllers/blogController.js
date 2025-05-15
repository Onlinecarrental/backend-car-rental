const Blog = require('../models/Blog');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const blogController = {
  createBlog: async (req, res) => {
    try {
      // Validate required fields
      if (!req.files?.image) {
        return res.status(400).json({
          success: false,
          message: 'Blog image is required'
        });
      }

      const blogData = {
        ...req.body,
        image: req.files.image[0].path.replace(/\\/g, '/'),
        author: JSON.parse(req.body.author || '{}')
      };

      if (req.files.authorImage) {
        blogData.author.image = req.files.authorImage[0].path.replace(/\\/g, '/');
      }

      const blog = new Blog(blogData);
      const savedBlog = await blog.save();

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: savedBlog
      });
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files) {
        await Promise.all(
          Object.values(req.files)
            .flat()
            .map(file => fs.unlink(file.path).catch(console.error))
        );
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getAllBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find().sort('-createdAt');
      res.json({
        success: true,
        count: blogs.length,
        data: blogs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getBlogById: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid blog ID format'
        });
      }

      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }

      res.json({
        success: true,
        data: blog
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateBlog: async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }

      const updateData = {
        ...req.body,
        author: JSON.parse(req.body.author || '{}')
      };

      // Handle image updates
      if (req.files?.image) {
        // Delete old image
        if (blog.image) {
          await fs.unlink(blog.image).catch(console.error);
        }
        updateData.image = req.files.image[0].path.replace(/\\/g, '/');
      }

      if (req.files?.authorImage) {
        // Delete old author image
        if (blog.author?.image) {
          await fs.unlink(blog.author.image).catch(console.error);
        }
        updateData.author.image = req.files.authorImage[0].path.replace(/\\/g, '/');
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Blog updated successfully',
        data: updatedBlog
      });
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files) {
        await Promise.all(
          Object.values(req.files)
            .flat()
            .map(file => fs.unlink(file.path).catch(console.error))
        );
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog not found'
        });
      }

      // Delete associated images
      if (blog.image) {
        await fs.unlink(blog.image).catch(console.error);
      }
      if (blog.author?.image) {
        await fs.unlink(blog.author.image).catch(console.error);
      }

      await blog.deleteOne();

      res.json({
        success: true,
        message: 'Blog deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = blogController;
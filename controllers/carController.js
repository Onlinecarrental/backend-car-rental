const Car = require('../models/Car');
const fs = require('fs');
const path = require('path');

const carController = {
  addCar: async (req, res) => {
    try {
      if (!req.files?.coverImage) {
        return res.status(400).json({
          success: false,
          message: 'Cover image is required'
        });
      }

      // Get agentId from any of the possible field names
      const agentId = req.body.agentId || req.body.agent_id || req.body.agent || req.body.userId || req.body.user_id;
      
      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'Agent ID is required'
        });
      }

      const carData = {
        ...req.body,
        agentId, // Add agentId to car data
        features: JSON.parse(req.body.features || '{}'),
        coverImage: req.files['coverImage'][0].path.replace(/\\/g, '/'),
        ...(req.files['image1'] && { image1: req.files['image1'][0].path.replace(/\\/g, '/') }),
        ...(req.files['image2'] && { image2: req.files['image2'][0].path.replace(/\\/g, '/') }),
        ...(req.files['image3'] && { image3: req.files['image3'][0].path.replace(/\\/g, '/') }),
        ...(req.files['image4'] && { image4: req.files['image4'][0].path.replace(/\\/g, '/') })
      };

      const car = new Car(carData);
      const savedCar = await car.save();
      
      res.status(201).json({
        success: true,
        message: 'Car added successfully',
        data: savedCar
      });
    } catch (error) {
      // Clean up uploaded files if save fails
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      console.error('Error adding car:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getAllCars: async (req, res) => {
    try {
      const cars = await Car.find().sort('-createdAt');
      res.json({
        success: true,
        count: cars.length,
        data: cars
      });
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getCarById: async (req, res) => {
    try {
      const car = await Car.findById(req.params.id);
      
      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }
      
      res.json({
        success: true,
        data: car
      });
    } catch (error) {
      console.error('Error fetching car:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateCar: async (req, res) => {
    try {
      const existingCar = await Car.findById(req.params.id);
      if (!existingCar) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      const updateData = {
        ...req.body,
        features: JSON.parse(req.body.features || '{}')
      };

      if (req.files) {
        if (req.files.coverImage) {
          if (existingCar.coverImage) {
            const oldPath = path.join(__dirname, '..', existingCar.coverImage);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData.coverImage = req.files.coverImage[0].path.replace(/\\/g, '/');
        }

        ['image1', 'image2', 'image3', 'image4'].forEach(imageKey => {
          if (req.files[imageKey]) {
            if (existingCar[imageKey]) {
              const oldPath = path.join(__dirname, '..', existingCar[imageKey]);
              if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData[imageKey] = req.files[imageKey][0].path.replace(/\\/g, '/');
          }
        });
      }

      const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Car updated successfully',
        data: updatedCar
      });
    } catch (error) {
      console.error('Error updating car:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  deleteCar: async (req, res) => {
    try {
      const car = await Car.findById(req.params.id);
      
      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }

      // Delete associated images
      const imagePaths = [
        car.coverImage,
        car.image1,
        car.image2,
        car.image3,
        car.image4
      ].filter(Boolean);

      imagePaths.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

      await Car.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Car deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting car:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = carController;
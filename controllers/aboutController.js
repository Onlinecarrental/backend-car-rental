const about = require('../models/AboutUs');
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
  },
  trust: {
    title: 'YOUR Trusted Partner is in a',
    subtitle: 'A Car Rental Company',
    features: [
      {
        icon: '../src/assets/Tp-1.svg',
        description: 'Lorem pretium fermentum quam, sit amet cursus ante sollicitudin velen morbi consesua.'
      },
      {
        icon: '../src/assets/Tp-2.svg',
        description: 'Lorem pretium fermentum quam sit amet cursus ante sollicitudin velen fermen.'
      },
      {
        icon: '../src/assets/Tp-1.svg',
        description: 'Lorem pretium fermentum quam sit amet cursus ante sollicitudin velen fermen.'
      },
      {
        icon: '../src/assets/Tp-2.svg',
        description: 'Lorem pretium fermentum quam sit amet cursus ante sollicitudin velen fermen.'
      }
    ],
    image: '../src/assets/AUcar.svg'
  },
  carCollection: {
    header: {
      title: 'Our Impressive Collection of Car',
      description: 'Find the perfect car for any journey—from luxurious rides to rugged off-roaders.'
    },
    categories: [
      { title: "Popular Car", path: "/popular-cars" },
      { title: "Luxury Car", path: "/luxury-cars" },
      { title: "Vintage Car", path: "/vintage-cars" },
      { title: "Family Car", path: "/family-cars" },
      { title: "Off-Road Car", path: "/offroad-cars" }
    ],
    content: {
      title: 'We Are More Than',
      description: [
        'Lorem pretium fermentum quam, sit amet cursus ante sollicitudin velen morbi consesua the miss sustion consation porttitor orci sit amet iaculis nisan.',
        'Lorem pretium fermentum quam sit amet cursus ante sollicitudin velen fermen morbinetion consesua the risus consequation the porttito',
        'Lorem pretium fermentum quam sit amet cursus ante sollicitudin velen fermen morbinetion consesua the risus consequation the porttito'
      ],
      features: [
        '24/7 Roadside Assistance',
        'Free Cancellation & Return',
        'Rent Now Pay When You Arrive'
      ],
      image: '../src/assets/AUcar.svg'
    }
  }
};

const aboutController = {
  getAllSections: async (req, res) => {
    try {
      const sections = await about.find();

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

      let section = await about.findOne({ sectionType });

      // If section doesn't exist, create it with defaults
      if (!section) {
        section = await about.create({
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
        try {
          content = JSON.parse(req.body.content);
        } catch (error) {
          console.error('Error parsing content:', error);
          return res.status(400).json({
            success: false,
            message: 'Invalid content format'
          });
        }

        // Create image path relative to uploads directory
        const imagePath = `uploads/about/${req.file.filename}`;

        // Update content with new image path
        // For different section types, handle image path differently
        if (sectionType === 'hero') {
          content.image = imagePath;
        } else if (sectionType === 'trust') {
          // Check if we're updating banner image or regular image
          if (req.body.bannerImage === 'true') {
            content.bannerImage = imagePath;
          } else {
            content.image = imagePath;
          }
        } else if (sectionType === 'carCollection') {
          // Handle different types of images for car collection
          if (req.body.bannerSvg === 'true') {
            content.bannerSvg = imagePath;
          } else if (content.decoration && req.body.decorationImage === 'true') {
            content.decoration.image = imagePath;
          } else if (content.content) {
            content.content.image = imagePath;
          } else if (req.body.carIndex) {
            // Handle updating a specific car's image
            const carIndex = parseInt(req.body.carIndex);
            if (content.cars && Array.isArray(content.cars) && carIndex >= 0 && carIndex < content.cars.length) {
              content.cars[carIndex].image = imagePath;
            }
          } else {
            // Default to updating decoration image if no specific target
            if (content.decoration) {
              content.decoration.image = imagePath;
            }
          }
        }

        console.log('Updating with image:', {
          sectionType,
          imagePath,
          content
        });
      } else {
        // If no file is uploaded, content can be a string or an object
        try {
          content = typeof req.body.content === 'string'
            ? JSON.parse(req.body.content)
            : req.body.content;
        } catch (error) {
          console.error('Error handling content:', error);
          return res.status(400).json({
            success: false,
            message: 'Invalid content format'
          });
        }
      }

      // Update database
      const section = await about.findOneAndUpdate(
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
        const filePath = path.join(__dirname, '..', 'uploads/about', req.file.filename);
        fs.unlink(filePath).catch(err => console.error('File cleanup failed:', err));
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = aboutController;
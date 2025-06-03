const mongoose = require('mongoose');
const Car = require('../models/Car');
require('dotenv').config();

const DEFAULT_AGENT_ID = 'pNaLNZTSchXBd6OQVHz7EnrJYPU2'; // The agent ID from the logs

async function migrateCars() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Update all cars that don't have an agentId
    const result = await Car.updateMany(
      { agentId: { $exists: false } },
      { $set: { agentId: DEFAULT_AGENT_ID } }
    );

    console.log(`Updated ${result.modifiedCount} cars with agent ID`);
    
    // Verify the update
    const cars = await Car.find();
    console.log(`Total cars in database: ${cars.length}`);
    console.log('Sample car:', cars[0]);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateCars(); 
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  licenseNo: { type: String, required: true },
  color: { type: String, required: true },
  seats: { type: String, required: true },
  categories: { type: String, required: true },
  transmission: { type: String, required: true },
  fuelType: { type: String, required: true },
  offRoader: { type: String },
  dailyRate: { type: String, required: true },
  weeklyRate: { type: String, required: true },
  features: { type: Object, required: true },
  coverImage: { type: String, required: true },
  image1: { type: String },
  image2: { type: String },
  image3: { type: String },
  image4: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', carSchema);
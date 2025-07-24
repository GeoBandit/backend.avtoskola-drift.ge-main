// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Vehicle name is required'],
    unique: true,
     
  },  photo: { type: String, required: true }, // URL or file path
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
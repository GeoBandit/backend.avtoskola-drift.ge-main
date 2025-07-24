const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  photo: { type: String },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  topic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Topic',  // Reference to Topic model
    required: true 
  },
  vehicles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle',  // Reference to Vehicle model
    required: true 
  }],
});

module.exports = mongoose.model('Question', questionSchema);
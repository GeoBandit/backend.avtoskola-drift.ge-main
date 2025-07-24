// models/Topic.js
const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }], // Array of vehicle IDs
});

module.exports = mongoose.model('Topic', topicSchema);
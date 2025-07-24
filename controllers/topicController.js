const Topic = require('../models/Topic');
const Vehicle = require('../models/Vehicle');

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { name, vehicleIds } = req.body;

    // Validate input
    if (!name || !vehicleIds || !Array.isArray(vehicleIds)) {
      return res.status(400).json({
        success: false,
        error: 'Name and vehicleIds (array) are required'
      });
    }

    // Check if topic with same name already exists
    const existingTopic = await Topic.findOne({ name });
    if (existingTopic) {
      return res.status(409).json({
        success: false,
        error: `Topic with name '${name}' already exists`
      });
    }

    // Validate all vehicle IDs exist
    const validVehicles = await Vehicle.find({ 
      _id: { $in: vehicleIds } 
    }).select('_id');

    if (validVehicles.length !== vehicleIds.length) {
      const invalidIds = vehicleIds.filter(
        id => !validVehicles.some(v => v._id.equals(id))
      );
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle IDs',
        invalidIds
      });
    }

    // Create and save topic
    const topic = new Topic({ 
      name, 
      vehicles: vehicleIds 
    });
    
    await topic.save();

    // Populate vehicles in response if needed
    const createdTopic = await Topic.findById(topic._id).populate('vehicles', 'name');

    res.status(201).json({
      success: true,
      data: createdTopic
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message)
      });
    }

    // Handle cast errors (invalid ObjectId format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get all topics
exports.getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate('vehicles');
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single topic by ID
exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id).populate('vehicles');
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get topics by vehicle ID
exports.getTopicsByVehicle = async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const topics = await Topic.find({ vehicles: vehicleId });
      res.status(200).json(topics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Update a topic by ID
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, vehicleIds } = req.body;

    // Validate vehicle IDs
    const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
    if (vehicles.length !== vehicleIds.length) {
      return res.status(400).json({ error: 'Invalid vehicle IDs' });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      { name, vehicles: vehicleIds },
      { new: true }
    );
    if (!updatedTopic) return res.status(404).json({ error: 'Topic not found' });
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a topic by ID
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTopic = await Topic.findByIdAndDelete(id);
    if (!deletedTopic) return res.status(404).json({ error: 'Topic not found' });
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
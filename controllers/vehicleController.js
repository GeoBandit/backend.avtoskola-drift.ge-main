const Vehicle = require('../models/Vehicle');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { name, photo } = req.body;

    // Check if vehicle with this name already exists
    const existingVehicle = await Vehicle.findOne({ name });
    if (existingVehicle) {
      return res.status(400).json({ 
        success: false,
        error: `Vehicle with name '${name}' already exists` 
      });
    }

    const vehicle = new Vehicle({ name, photo });
    await vehicle.save();
    
    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    // Handle other potential errors (like validation errors)
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(val => val.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
};
// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a vehicle by ID
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, photo } = req.body;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { name, photo },
      { new: true }
    );
    if (!updatedVehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a vehicle by ID
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    if (!deletedVehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
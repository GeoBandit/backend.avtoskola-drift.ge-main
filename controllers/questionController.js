const mongoose = require('mongoose');
const Question = require('../models/Question');
const Topic = require('../models/Topic');
const Vehicle = require('../models/Vehicle');

// Create a new question
// controllers/questionController.js
exports.createQuestion = async (req, res) => {
    try {
      const { title, photo, options, correctAnswer, topicId, vehicleIds } = req.body;
  
      // Validate topic ID
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(400).json({ error: 'Invalid topic ID' });
      }
  
      // Validate vehicle IDs
      const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } });
      if (vehicles.length !== vehicleIds.length) {
        return res.status(400).json({ error: 'Invalid vehicle IDs' });
      }
  
      const question = new Question({
        title,
        photo,
        options,
        correctAnswer,
        topic: topicId,
        vehicles: vehicleIds,
      });
  
      await question.save();
      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Get all questions
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('topic') // Correct field name (singular)
      .populate('vehicles'); // Correct field name (plural)
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single question by ID
// Get single question with populated topic and vehicles
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('topic')  // Correct field name (singular)
      .populate('vehicles'); // Plural for the array
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });

  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update a question by ID
// exports.updateQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, photo, options, correctAnswer, topicIds, vehicleId } = req.body;

//     // Validate vehicle ID
//     const vehicle = await Vehicle.findById(vehicleId);
//     if (!vehicle) {
//       return res.status(400).json({ error: 'Invalid vehicle ID' });
//     }

//     // Validate topic IDs
//     const topics = await Topic.find({ _id: { $in: topicIds } });
//     if (topics.length !== topicIds.length) {
//       return res.status(400).json({ error: 'Invalid topic IDs' });
//     }

//     const updatedQuestion = await Question.findByIdAndUpdate(
//       id,
//       { title, photo, options, correctAnswer, topics: topicIds, vehicle: vehicleId },
//       { new: true }
//     );
//     if (!updatedQuestion) return res.status(404).json({ error: 'Question not found' });
//     res.status(200).json(updatedQuestion);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, photo, options, correctAnswer, topic, vehicles } = req.body;

    // Validate topic exists
    const topicExists = await Topic.exists({ _id: topic });
    if (!topicExists) {
      return res.status(400).json({ error: 'Invalid topic ID' });
    }

    // Validate all vehicles exist
    const vehiclesCount = await Vehicle.countDocuments({ _id: { $in: vehicles } });
    if (vehiclesCount !== vehicles.length) {
      return res.status(400).json({ error: 'Invalid vehicle IDs' });
    }

    // Validate correctAnswer is in options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({ error: 'Correct answer must match one of the options' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { title, photo, options, correctAnswer, topic, vehicles },
      { new: true }
    ).populate('topic').populate('vehicles');

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete a question by ID
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get questions by vehicle ID and topic IDs
// controllers/questionController.js
// exports.getQuestionsByVehicleAndTopics = async (req, res) => {
//     try {
//       const { topics, vehicleId } = req.query;
  
//       // Validate input
//       if (!topics || !vehicleId) {
//         return res.status(400).json({ error: "Topics and vehicle ID are required." });
//       }
  
//       const topicIds = topics.split(","); // Convert comma-separated string to array
  
//       // Fetch questions matching any of the provided topics AND the vehicle ID
//       const questions = await Question.find({
//         $and: [
//           { topic: { $in: topicIds } }, // Match any of the provided topic IDs
//           { vehicles: vehicleId }, // Match the specific vehicle ID
//         ],
//       });
  
//       res.status(200).json({ questions });
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       res.status(500).json({ error: "Failed to fetch questions." });
//     }
//   };

// exports.getQuestionsForExam = async (req, res) => {
//   try {
//     const { topics, vehicleId } = req.query;

//     // Validate required parameters
//     if (!vehicleId || !topics) {
//       return res.status(400).json({
//         success: false,
//         error: 'Both vehicleId and topics parameters are required'
//       });
//     }

//     // Convert comma-separated topics to array
//     const topicIds = topics.split(',');

//     // Convert to ObjectId
//     const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
//     const topicObjectIds = topicIds.map(id => new mongoose.Types.ObjectId(id));

//     // Find matching questions
//     const questions = await Question.aggregate([
//       {
//         $match: {
//           "vehicles._id": vehicleObjectId,
//           "topic._id": { $in: topicObjectIds }
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           photo: 1,
//           options: 1,
//           correctAnswer: 1,
//           topic: 1,
//           vehicles: {
//             $filter: {
//               input: "$vehicles",
//               as: "vehicle",
//               cond: { $eq: ["$$vehicle._id", vehicleObjectId] }
//             }
//           }
//         }
//       }
//     ]);

//     if (questions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: 'No questions found matching the criteria'
//       });
//     }

//     res.json({
//       success: true,
//       data: questions,
//       count: questions.length
//     });

//   } catch (err) {
//     console.error('Error fetching questions:', err);
//     res.status(500).json({
//       success: false,
//       error: 'Server error',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };
exports.getAllQuestions = async (req, res) => {
  try {
    const { topics, vehicleId } = req.query;

    // Validate required parameters
    if (!vehicleId || !topics) {
      return res.status(400).json({
        success: false,
        error: 'Both vehicleId and topics parameters are required'
      });
    }

    // Convert comma-separated topics to array
    const topicIds = topics.split(',');

    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicleId format'
      });
    }

    for (const topicId of topicIds) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid topicId format: ${topicId}`
        });
      }
    }

    // Convert to ObjectId
    const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
    const topicObjectIds = topicIds.map(id => new mongoose.Types.ObjectId(id));

    // Find matching questions
    const questions = await Question.aggregate([
      {
        $match: {
          "vehicles._id": vehicleObjectId,
          "topic._id": { $in: topicObjectIds }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          photo: 1,
          options: 1,
          correctAnswer: 1,
          topic: 1,
          vehicles: {
            $filter: {
              input: "$vehicles",
              as: "vehicle",
              cond: { $eq: ["$$vehicle._id", vehicleObjectId] }
            }
          }
        }
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No questions found matching the criteria',
        diagnostic: {
          vehicleId: vehicleId,
          topicIds: topicIds,
          suggestion: 'Verify these IDs exist in your database'
        }
      });
    }

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });

  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

//get questions by topics

exports.getQuestionsByTopics = async (req, res) => {
  try {
    const { topics } = req.query;

    // Validate required parameter
    if (!topics) {
      return res.status(400).json({
        success: false,
        error: 'Topics parameter is required'
      });
    }

    // Convert comma-separated topics to array
    const topicIds = topics.split(',');

    // Validate MongoDB IDs
    const invalidTopics = topicIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidTopics.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid topic ID format',
        invalidTopics: invalidTopics
      });
    }

    // Convert to ObjectId
    const topicObjectIds = topicIds.map(id => new mongoose.Types.ObjectId(id));

    // Find matching questions
    const questions = await Question.aggregate([
      {
        $match: {
          "topic._id": { $in: topicObjectIds }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          photo: 1,
          options: 1,
          correctAnswer: 1,
          topic: 1,
          vehicles: 1
        }
      },
      {
        $sort: { title: 1 } // Optional: sort by title
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No questions found for the specified topics',
        diagnostic: {
          topicIds: topicIds,
          suggestion: 'Verify these topic IDs exist in your database'
        }
      });
    }

    res.json({
      success: true,
      data: questions,
      count: questions.length
    });

  } catch (err) {
    console.error('Error fetching questions by topics:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get questions by vehicle ID
exports.getQuestionsByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    // Validate vehicleId
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle ID format'
      });
    }

    // Find questions that include this vehicle ID
    const questions = await Question.find({
      'vehicles._id': vehicleId
    }).select('_id title photo options correctAnswer topic vehicles');

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No questions found for this vehicle',
        vehicleId: vehicleId,
        suggestion: 'Verify the vehicle exists and is associated with questions'
      });
    }

    // Filter vehicles array to only include the requested vehicle
    const filteredQuestions = questions.map(question => ({
      ...question._doc,
      vehicles: question.vehicles.filter(v => v._id.toString() === vehicleId)
    }));

    res.json({
      success: true,
      data: filteredQuestions,
      count: filteredQuestions.length
    });

  } catch (err) {
    console.error('Error fetching questions by vehicle:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.post('/', questionController.createQuestion);
router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
// router.get('/all-questions', questionController.getQuestionsByVehicleAndTopics);
router.get('/all-questions', questionController.getAllQuestions);
router.get('/by-topics', questionController.getQuestionsByTopics);
router.get('/by-vehicle/:vehicleId', questionController.getQuestionsByVehicle);
module.exports = router;
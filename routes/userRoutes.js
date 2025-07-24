const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken } = require('../utils/jwt');


// Create a new user
router.post('/register', UserController.createUser);

//get all users
router.get('/', UserController.getAllUsers);

// Login a user
router.post('/login', UserController.loginUser);

// Update a user
router.put('/:id', UserController.updateUser);

// Delete a user
router.delete('/:id', UserController.deleteUser);

module.exports = router;
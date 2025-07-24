const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin, verifySuperAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);

// Protected routes
router.post('/create',  adminController.createAdmin);
router.get('/all', verifyAdmin, adminController.getAllAdmins);
router.delete('/delete/:id', verifyAdmin, verifySuperAdmin, adminController.deleteAdmin);
router.put('/update-password', verifyAdmin, adminController.updatePassword);

module.exports = router;
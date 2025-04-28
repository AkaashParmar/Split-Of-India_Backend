const express = require('express');
const { registerUser, authUser, getUserProfile, forgotPassword, resetPassword, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile (protected route)
router.put('/profile', protect, updateUserProfile);

// Forgot password (send OTP)
router.post('/forgotPassword', forgotPassword);

// Reset password (verify OTP and update password)
router.post('/resetPassword', resetPassword);


module.exports = router;

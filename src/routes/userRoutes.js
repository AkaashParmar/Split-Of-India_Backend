const express = require('express');
const { registerUser, authUser, getUserProfile, forgotPassword, resetPassword, updateUserProfile, getallUsers, deleteaUsers,addToWishlist,removeFromWishlist,getWishlist, verifyOTP, sendOtp,} = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

router.put('/profile', protect, updateUserProfile);

router.get('/all-users',getallUsers);

//delete a user
router.delete("/:id",deleteaUsers);

router.post('/send-otp', sendOtp);

// Forgot password (send OTP)
router.post('/forgotPassword', forgotPassword);

// Reset password (verify OTP and update password)
router.post('/resetPassword', resetPassword);
router.post('/verify-otp', verifyOTP);

router.post('/wishlist/:productId', protect, addToWishlist);  // for adding to wishlist
router.delete('/wishlist/:productId', protect, removeFromWishlist);  // for removing from wishlist
router.get('/wishlist', protect, getWishlist);  // for getting wishlist



//check is admin
router.get('/admin-route', protect, isAdmin, (req, res) => {
        res.send('Welcome Admin!');
    });

    
module.exports = router;

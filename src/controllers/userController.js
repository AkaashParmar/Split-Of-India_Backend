const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/otpGenerator');   
const sendEmail = require('../utils/sendEmail');       
const bcrypt = require('bcryptjs'); 
const { isAdmin } = require('../middlewares/authMiddleware');



// @desc    Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password,isAdmin  } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        isAdmin: isAdmin || false,  
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
exports.authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get a single user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Update fields that can be modified
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password ? await user.setPassword(req.body.password) : user.password;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id), // Returning token after profile update
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//get all user

exports.getallUsers = asyncHandler(async (req, res) => {
    const users = await User.find(); // You can filter if needed
    res.status(200).json(users);
});

//delete a user
exports.deleteaUsers = asyncHandler(async (req, res) => {
    console.log(req.params);
    const {id} = req.params;

    try{
        const deleteaUsers = await User.findByIdAndDelete(id);
        res.json({
            deleteaUsers
        })
    }
    catch(error)
    {
        throw new Error(error);
    }
});
















// @desc    Forgot password (send OTP to email)
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP temporarily in the database (you can use a separate OTP model or session)
    user.otp = otp;
    user.otpExpire = Date.now() + 15 * 60 * 1000;  // OTP valid for 15 minutes
    await user.save();

    // Send OTP to the user's email
    const message = `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`;
    await sendEmail(email, 'Password Reset OTP', message);

    res.status(200).json({ message: 'OTP sent to your email' });
});
// Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      res.status(404);
      throw new Error('Invalid request'); // Do not reveal whether user exists
    }
  
    // Check if OTP is valid and not expired
    if (user.otp !== otp || Date.now() > user.otpExpire) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }
  
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpire = undefined;
  
    await user.save();
  
    res.status(200).json({ message: 'Password updated successfully' });
  });

//add to wishlist

  exports.addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const productId = req.params.productId;

    if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save();
        res.status(200).json({ message: 'Product added to wishlist' });
    } else {
        res.status(400);
        throw new Error('Product already in wishlist');
    }
});
//remove form wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    // Ensure the productId from URL is valid
    const productId = req.params.productId;

    user.wishlist = user.wishlist.filter(
        (item) => item.toString() !== productId // Ensure correct comparison
    );

    await user.save();

    res.status(200).json({ message: 'Product removed from wishlist' });
});

// @desc Get user's wishlist
// @route GET /api/users/wishlist
// @access Private
exports.getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(user.wishlist);
});


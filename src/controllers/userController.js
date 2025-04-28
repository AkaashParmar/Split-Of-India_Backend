const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/otpGenerator');   // Correct import for OTP generation
const sendEmail = require('../utils/sendEmail');       // Correct import for sending emails


// @desc    Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

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

// @desc    Get user profile
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


exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate OTP for password reset
    const otp = generateOTP();

    // Send OTP to user email
    await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

    // You can store the OTP in the database or use a temporary storage system for validation
    user.resetOTP = otp;
    await user.save();

    res.json({ message: 'OTP sent to email' });
});

// @desc    Reset password (verify OTP and update password)
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp || Date.now() > user.otpExpire) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Update the user's password
    user.password = newPassword;
    user.otp = undefined;  // Clear OTP
    user.otpExpire = undefined;  // Clear OTP expiration

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
});

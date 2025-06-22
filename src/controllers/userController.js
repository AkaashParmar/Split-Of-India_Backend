const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/otpGenerator");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { isAdmin } = require("../middlewares/authMiddleware");
const GoogleUser = require("../models/GoogleUser");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, phone, password, isAdmin } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username, // ✅ Add this line
    email,
    phone,
    password,
    isAdmin: isAdmin || false,
  });

  if (user) {
    const otp = generateOTP();
    console.log("Generated OTP:", otp); // add this debug to check OTP value

    user.otp = otp;
    user.otpExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const message = `Your OTP is: ${otp}. It is valid for 15 minutes.`;
    await sendEmail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP",
      text: message,
    });

    // Respond with the user info and the token
    res.status(201).json({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Authenticate user & get token
exports.authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password); // ✅ Use schema method

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ✅ (Optional) Check for verified user if using OTP verification
  // if (!user.isVerified) {
  //   res.status(403);
  //   throw new Error("Please verify your account via OTP.");
  // }

  // ✅ Success
  res.status(200).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// Get a single user profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields that can be modified
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password
      ? await user.setPassword(req.body.password)
      : user.password;

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
    throw new Error("User not found");
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
  const { id } = req.params;

  try {
    const deleteaUsers = await User.findByIdAndDelete(id);
    res.json({
      deleteaUsers,
    });
  } catch (error) {
    throw new Error(error);
  }
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const otp = generateOTP();
  console.log("Generated OTP:", otp); // add this debug to check OTP value

  user.otp = otp;
  user.otpExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const message = `Your OTP is: ${otp}. It is valid for 15 minutes.`;
  await sendEmail(user.email, "Your OTP", message);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.otp !== otp || Date.now() > user.otpExpire) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // ✅ DO NOT manually hash
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpire = undefined;

  await user.save(); // triggers pre('save') which hashes it

  res.status(200).json({ message: "Password updated successfully" });
});


//add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const productId = req.params.productId;

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
    res.status(200).json({ message: "Product added to wishlist" });
  } else {
    res.status(400);
    throw new Error("Product already in wishlist");
  }
});

//remove form wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  user.wishlist = user.wishlist.filter(
    (item) => item.toString() !== productId // Ensure correct comparison
  );
  await user.save();
  res.status(200).json({ message: "Product removed from wishlist" });
});

// Get user's wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.wishlist); // Return populated product details
});

// Verify OTP for user registration
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.otp !== otp || Date.now() > user.otpExpire) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  res.status(200).json({ message: "OTP verified successfully" });
});

// Send OTP to user email (standalone)
exports.sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const message = `Your OTP is: ${otp}. It will expire in 15 minutes.`;
  await sendEmail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}. It will expire in 15 minutes.`,
  });

  res.status(200).json({ message: "OTP sent to your email" });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId: sub,
        avatar: picture,
        password: "", // you can generate a random string
      });
    }

    const authToken = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: authToken,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
});

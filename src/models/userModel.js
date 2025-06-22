const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  isVerified: { type: Boolean, default: false }, // ✅ NEW FIELD
  otp: { type: String },
  otpExpire: { type: Date }, // ✅ NEW FIELD
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
}, {
  timestamps: true,
});

// Password encryption
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next(); // ✅ make sure to call next()
});

// ✅ Password matching for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Method to set password (will trigger pre-save hashing)
userSchema.methods.setPassword = async function (newPassword) {
  this.password = newPassword; // let pre('save') handle hashing
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// models/GoogleUser.js
const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
  googleId: { type: String }, // optional
  avatar: String,
  isAdmin: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
}, { timestamps: true });

const GoogleUser = mongoose.models.GoogleUser || mongoose.model('GoogleUser', googleUserSchema);

module.exports = GoogleUser;

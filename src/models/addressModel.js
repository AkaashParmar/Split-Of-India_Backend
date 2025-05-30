// models/Address.js
const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: String,
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        size: { type: String },   // ✅ add size
        color: { type: String },  // ✅ add color
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      enum: ['In Transit', 'Delivered', 'Processing'],
      default: 'In Transit', // ✅ default status
    },
    expectedDeliveryDate: { type: Date }, // ✅ delivery ETA
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

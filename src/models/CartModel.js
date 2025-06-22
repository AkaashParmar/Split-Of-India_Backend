const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      size: {
        type: String,
        required: false, // Or true if mandatory
      },
      color: {
        type: String,
        required: false, // Or true if mandatory
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);

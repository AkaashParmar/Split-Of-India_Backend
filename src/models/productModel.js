const mongoose = require("mongoose");
require("./categoryModel");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, required: false },
    description: { type: String, required: true },
    brand: { type: String, required: true },

    color: { type: String },
    region: { type: String },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true, min: 0 },
    countInStock: {
      type: Number,
      min: 0,
      max: 255,
      required: true,
      default: 0,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    
    isDealOfTheDay: {
      type: Boolean,
      default: false,
    },

    ratings: [
      {
        star: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

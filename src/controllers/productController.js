require('dotenv').config();
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const {Category} = require("../models/categoryModel");
const ProductSuggestion = require('../models/suggestions');
const State = require("../models/stateModel.js");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary-config.js");
const nodemailer = require('nodemailer');
const fs = require('fs');
const {google} = require('googleapis');

exports.createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      title,
      description,
      brand,
      category,
      price,
      currentPrice,
      originalPrice,
      discount,
      countInStock,
      state,
      color,
      size,         // enum validated by schema
      region,
      isDealOfTheDay,
    } = req.body;

    if (!title || !description || !brand || !price || !state) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const slug = slugify(title);
    const localImagePath = req.file.path;

    const resultCloud = await cloudinary.uploader.upload(localImagePath, {
      folder: "products",
    });

    fs.unlinkSync(localImagePath); // delete local file after upload

    const product = await Product.create({
      title,
      slug,
      description,
      brand,
      category,
      price: Number(price),
      currentPrice,
      originalPrice,
      discount,
      countInStock: Number(countInStock),
      state,
      color,
      size: typeof size === "string" ? size.split(",").map((s) => s.trim()) : [],
      region,
      availablePincodes: req.body.availablePincodes?.split(",").map(p => p.trim()) || [],
      isDealOfTheDay: isDealOfTheDay === "true", // handle checkbox/boolean
      image: resultCloud.secure_url,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message });
  }
};


// GET: Get all products with optional category filter and populated category
exports.getProducts = async (req, res) => {
  try {
    const queryObj = {};

    // 1. Filtering
    if (req.query.category) {
      queryObj.category = new mongoose.Types.ObjectId(req.query.category);
    }
    if (req.query.brand) queryObj.brand = req.query.brand;
    if (req.query.price_gte)
      queryObj.price = { ...queryObj.price, $gte: req.query.price_gte };
    if (req.query.price_lte)
      queryObj.price = { ...queryObj.price, $lte: req.query.price_lte };
    if (req.query.inStock) queryObj.countInStock = { $gt: 0 };

    // 2. Sorting
    const sortBy = req.query.sort
      ? req.query.sort.split(",").join(" ")
      : "-createdAt"; // Default sorting by createdAt in descending order

    // 3. Field Limiting (Selecting Specific Fields to Return)
    const fields = req.query.fields
      ? req.query.fields.split(",").join(" ")
      : ""; // Default to returning all fields

    // 4. Pagination
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10 products per page
    const skip = (page - 1) * limit; // Skip products for pagination

    // 5. Fetching data from the database
    const products = await Product.find(queryObj)
      .select(fields) // Apply field limiting (select only required fields)
      .sort(sortBy) // Apply sorting
      .skip(skip) // Skip products based on pagination
      .limit(limit) // Limit the number of products per page
      .populate("category", "name"); // Optional: Populate the category field with category name

    // Send the response back
    res.status(200).json({
      success: true,
      page, // Current page number
      results: products.length, // Number of products in this page
      data: products, // The products data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Single product with populated category
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Update product

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;

    const updatedData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(price && { price }),
      ...(category && { category }),
      ...(image && { image }),
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Product count
exports.getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Products by StateId
exports.getProductsByState = async (req, res) => {
  const products = await Product.find({ state: req.params.stateId }).populate(
    "state"
  );
  res.json(products);
};


// POST /api/products/:id/review
exports.addOrUpdateReview = async (req, res) => {
  const { star, comment } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  const existingReviewIndex = product.ratings.findIndex(
    (r) => r.postedby.toString() === userId.toString()
  );

  if (existingReviewIndex !== -1) {
    // Update existing review
    product.ratings[existingReviewIndex].star = star;
    product.ratings[existingReviewIndex].comment = comment;
  } else {
    // Add new review
    product.ratings.push({
      star,
      comment,
      postedby: userId,
    });
  }

  // Recalculate average rating and number of reviews
  const totalStars = product.ratings.reduce((acc, r) => acc + r.star, 0);
  const averageRating = totalStars / product.ratings.length;

  product.rating = averageRating;
  product.numReviews = product.ratings.length;

  await product.save();

  res.status(200).json({
    message: existingReviewIndex !== -1 ? 'Review updated' : 'Review added',
    product,
  });
};


// Get products by state slug
exports.getProductsByStateSlug = async (req, res) => {
  try {
    const state = await State.findOne({ slug: req.params.slug });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    const products = await Product.find({ state: state._id }).populate("state");
    res.json(products);
  } catch (error) {
    console.error("Get products by state slug error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getFilteredProducts = async (req, res) => {
  const { category, color, size, region, state, minPrice, maxPrice } = req.query;

  const filter = {};

  if (category) filter.category = { $in: category.split(",") };
  if (color) filter.color = { $in: color.split(",") };
  if (size) filter.size = { $in: size.split(",") };
  if (region) filter.region = region;
  if (state) filter.state = state;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};


exports.setDealOfTheDay = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isDealOfTheDay = true;
    await product.save();

    res.status(200).json({ message: "Product added to Deals of the Day", product });
  } catch (error) {
    console.error("Set deal error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeDealOfTheDay = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isDealOfTheDay = false;
    await product.save();

    res.status(200).json({ message: "Product removed from Deals of the Day" });
  } catch (error) {
    console.error("Remove deal error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDealsOfTheDay = async (req, res) => {
  try {
    const deals = await Product.find({ isDealOfTheDay: true });
    res.status(200).json(deals);
  } catch (error) {
    console.error("Get deals error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.handleSuggestionForm = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.accessToken) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productName, categoryName, productDescription } = req.body;

    // Send email...
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user.emails[0].value,
        accessToken: user.accessToken,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    });

    const mailOptions = {
      from: `"${user.displayName}" <${user.emails[0].value}>`,
      to: process.env.EMAIL_USER,
      subject: 'Product Suggestion',
      text: `Product: ${productName}\nCategory: ${categoryName}\nDescription: ${productDescription}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent from logged-in user!' });
  } catch (err) {
    console.error('❌ Error in handleSuggestionForm:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.checkPincodeAvailability = async (req, res) => {
  const { productId, pincode } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const available = product.availablePincodes.includes(pincode);
    res.json({ available });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
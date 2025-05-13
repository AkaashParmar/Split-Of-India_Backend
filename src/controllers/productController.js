const Product = require('../models/productModel');
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Category = require('../models/categoryModel');
const mongoose = require("mongoose");

// POST: Create product
exports.createProduct = async (req, res) => {
  try {
    if(req.body.title){
      req.body.slug=slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    if (req.query.price_gte) queryObj.price = { ...queryObj.price, $gte: req.query.price_gte };
    if (req.query.price_lte) queryObj.price = { ...queryObj.price, $lte: req.query.price_lte };
    if (req.query.inStock) queryObj.countInStock = { $gt: 0 };

    // 2. Sorting
    const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : "-createdAt"; // Default sorting by createdAt in descending order

    // 3. Field Limiting (Selecting Specific Fields to Return)
    const fields = req.query.fields ? req.query.fields.split(',').join(' ') : ""; // Default to returning all fields

    // 4. Pagination
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10 products per page
    const skip = (page - 1) * limit; // Skip products for pagination

    // 5. Fetching data from the database
    const products = await Product.find(queryObj)
      .select(fields) // Apply field limiting (select only required fields)
      .sort(sortBy)   // Apply sorting
      .skip(skip)     // Skip products based on pagination
      .limit(limit)   // Limit the number of products per page
      .populate("category", "name"); // Optional: Populate the category field with category name

    // Send the response back
    res.status(200).json({
      success: true,
      page,             // Current page number
      results: products.length, // Number of products in this page
      data: products    // The products data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// GET: Single product with populated category
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
      ...(image && { image })
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
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


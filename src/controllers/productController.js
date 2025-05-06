const Product = require('../models/productModel');
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

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
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    // Find products and populate the category field
    const products = await Product.find(filter).populate('category');

    res.json(products);
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
    const { name, description, price, category, image } = req.body;

    const updatedData = {
      ...(name && { name }),
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


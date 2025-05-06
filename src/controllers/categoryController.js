const Category = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Create and save the category
    const newCategory = new Category({ name, description });
    const savedCategory = await newCategory.save();

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: Fetch all categories
exports.getAllCategories = async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };



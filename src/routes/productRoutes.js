// const express = require("express");
// const router = express.Router();
// const {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
//   getProductsByState,
//   getProductCount,
//   addOrUpdateReview,
// } = require("../controllers/productController");
// const upload = require("../middlewares/uploadMiddleware.js");

// const { protect, isAdmin } = require("../middlewares/authMiddleware");

// // Create a product (admin only)
// router.post("/", upload.single("image"), createProduct);

// // Get all products
// // router.get("/get-products", getProducts);

// // Get product count
// router.get("/count", getProductCount);

// // Get products by state
// router.get("/state/:stateId", getProductsByState);

// // Get a single product
// router.get("/:id", getProductById);

// // Update a product (admin only)
// router.put("/:id", protect, isAdmin, updateProduct);

// // Delete a product (admin only)
// router.delete("/:id", protect, isAdmin, deleteProduct);

// // Review
// router.post('/:id/review', protect, addOrUpdateReview);

// module.exports = router;

const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

router.get('/', async (req, res) => {
  const { category, color, size, region, state, minPrice, maxPrice } = req.query;
  const filter = {};
  if (category) filter.category = { $in: category.split(',') };
  if (color) filter.color = { $in: color.split(',') };
  if (size) filter.size = { $in: size.split(',') };
  if (region) filter.region = region;
  if (state) filter.state = state;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err });
  }
});


module.exports = router;


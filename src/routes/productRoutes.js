const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByState,
  getProductCount,
  addOrUpdateReview,
} = require("../controllers/productController");
const upload = require("../middlewares/uploadMiddleware.js");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Create a product (admin only)
router.post("/", upload.single("image"), createProduct);

// Get all products
// router.get("/get-products", getProducts);

// Get product count
router.get("/count", getProductCount);

// Get products by state
router.get("/state/:stateId", getProductsByState);

// Get a single product
router.get("/:id", getProductById);

// Update a product (admin only)
router.put("/:id", protect, isAdmin, updateProduct);

// Delete a product (admin only)
router.delete("/:id", protect, isAdmin, deleteProduct);

// Review
router.post('/:id/review', protect, addOrUpdateReview);

module.exports = router;

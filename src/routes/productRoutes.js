const express = require("express");
const router = express.Router();
const {
  createProduct,
  // getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByState,
  getProductCount,
  addOrUpdateReview,
  getFilteredProducts,
  getProductsByStateSlug,
  setDealOfTheDay,
  removeDealOfTheDay,
  getDealsOfTheDay,
  checkPincodeAvailability
} = require("../controllers/productController");
const upload = require("../middlewares/uploadMiddleware.js");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Create a product (admin only)
router.post("/", upload.single("image"), createProduct);

// Get filtered products (make sure it's before "/:id" route)
router.get("/", getFilteredProducts);

// Get product count
router.get("/count", getProductCount);

// Get a single product
router.get("/:id", getProductById);

// Update a product (admin only)
router.put("/:id", protect, isAdmin, updateProduct);

// Delete a product (admin only)
router.delete("/:id", protect, isAdmin, deleteProduct);
router.post('/:id/review', protect, addOrUpdateReview);

// Get products by state
router.get("/state/:stateId", getProductsByState);
router.get("/state/slug/:slug", getProductsByStateSlug);

router.put('/deals/add/:productId', protect, isAdmin, setDealOfTheDay);
router.put('/deals/remove/:productId', protect, isAdmin, removeDealOfTheDay);
router.get('/deals', getDealsOfTheDay);

// GET /api/products/:productId/check-pincode/:pincode
router.get("/:productId/check-pincode/:pincode", checkPincodeAvailability);



module.exports = router;




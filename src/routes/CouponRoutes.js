const express = require('express');
const router = express.Router();
const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  applyCoupon,
} = require('../controllers/CouponController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Admin routes
router.post('/', protect, isAdmin, createCoupon);
router.put('/:id', protect, isAdmin, updateCoupon);
router.delete('/:id', protect, isAdmin, deleteCoupon);

// User routes
router.get('/', getAllCoupons);              // Get all valid coupons
router.post('/apply', protect, applyCoupon); // Apply coupon (needs login)

module.exports = router;

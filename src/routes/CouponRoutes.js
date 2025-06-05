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

// Admin
router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.delete("/:id", deleteCoupon);

// User
router.post("/apply", applyCoupon);


module.exports = router;

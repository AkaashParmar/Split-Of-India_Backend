const Coupon = require("../models/CouponModel");

exports.createCoupon = async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code || totalAmount == null) {
      return res.status(400).json({ message: "Coupon code and amount are required" });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    // Check expiry date
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (totalAmount < coupon.minCartValue) {
      return res.status(400).json({ message: `Minimum cart value should be ₹${coupon.minCartValue}` });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (coupon.discountValue / 100) * totalAmount;
      // Cap discount to maxDiscount if specified
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    }

    // Make sure discount does not exceed totalAmount
    discount = Math.min(discount, totalAmount);

    return res.json({ discount });
  } catch (error) {
    console.error("Server error in applyCoupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

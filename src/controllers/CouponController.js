const Coupon = require('../models/CouponModel');

// ADMIN: Create coupon
exports.createCoupon = async (req, res) => {
  const { code, discount, expiresAt } = req.body;

  const existing = await Coupon.findOne({ code });
  if (existing) return res.status(400).json({ message: 'Coupon already exists' });

  const coupon = await Coupon.create({ code, discount, expiresAt });
  res.status(201).json(coupon);
};

// ADMIN: Update coupon
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

  const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// ADMIN: Delete coupon
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

  await coupon.deleteOne();
  res.json({ message: 'Coupon deleted' });
};

// USER: View all available coupons (not expired)
exports.getAllCoupons = async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({ expiresAt: { $gt: now } });
  res.json(coupons);
};

// USER: Apply a coupon code
exports.applyCoupon = async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    return res.status(404).json({ message: 'Invalid coupon code' });
  }

  const now = new Date();
  if (coupon.expiresAt < now) {
    return res.status(400).json({ message: 'Coupon has expired' });
  }

  res.json({ message: 'Coupon applied', discount: coupon.discount });
};

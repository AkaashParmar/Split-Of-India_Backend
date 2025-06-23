const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
require("dotenv").config();

// ✅ Correct way to import `protect`
const { protect } = require("../middlewares/authMiddleware");

// ✅ Make sure to import your models
const Order = require("../models/paymentModel");
const Cart = require("../models/CartModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;
 console.log("Creating Razorpay order with amount:", amount);
  try {
    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `order_rcptid_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);
    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay error details:", err);
    res
      .status(500)
      .json({ error: "Something went wrong while creating Razorpay order" });
  }
});

router.post("/order", protect, async (req, res) => {
  try {
    console.log("Incoming Order Payload:", req.body); // ✅ Already logging

    const order = new Order({
      user: req.user._id,
      orderItems: req.body.items,
      totalAmount: req.body.totalAmount,
      totalPrice: req.body.totalPrice,
      shippingAddress: req.body.shippingAddress,
      paymentInfo: req.body.paymentInfo,
    });

    console.log("totalPrice:", req.body.totalPrice);
    console.log("shippingAddress:", req.body.shippingAddress);

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product");
    console.log("Fetched Orders:", orders); // ✅
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err); // ✅
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;

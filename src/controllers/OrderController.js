const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/productModel');

// @desc Place a new order from the cart
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate cart items with product info
    const cart = await Cart.findOne({ user: userId }).populate('cartItems.product');

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Prepare orderItems and calculate total price
    const orderItems = cart.cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const totalPrice = cart.cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const newOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'COD',
      totalPrice,
    });

    await newOrder.save();

    // Optional: Reduce product stock
    for (const item of cart.cartItems) {
      item.product.countInStock -= item.quantity;
      await item.product.save();
    }

    // Clear cart after order placement
    cart.cartItems = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all orders of the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/productModel');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate('cartItems.product');

    if (!cart || cart.cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price and prepare order items with size & color
    const orderItems = cart.cartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const totalPrice = cart.cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5); // 5 days delivery estimate

    const newOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod || 'COD',
      totalPrice,
      expectedDeliveryDate,
      orderStatus: 'In Transit',
    });

    await newOrder.save();

    // Reduce stock
    for (const item of cart.cartItems) {
      item.product.countInStock -= item.quantity;
      await item.product.save();
    }

    // Clear cart
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

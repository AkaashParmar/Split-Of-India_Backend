const Cart = require("../models/CartModel");
const Product = require("../models/productModel");

// Add to cart
const addToCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  const { size, color, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ user: userId });

  if (cart) {
    // Check if item with same productId + size + color already exists
    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      // If exists, increase quantity
      cart.cartItems[itemIndex].quantity += quantity || 1;
    } else {
      // Else, add new item
      cart.cartItems.push({ product: productId, size, color, quantity: quantity || 1 });
    }
  } else {
    // New cart for user
    cart = new Cart({
      user: userId,
      cartItems: [{ product: productId, size, color, quantity: quantity || 1 }],
    });
  }

  await cart.save();
  res.status(200).json(cart);
};


// Get cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "cartItems.product"
  );
  res.status(200).json(cart || { cartItems: [] });
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.cartItems = cart.cartItems.filter((item) => item.product != productId);
  await cart.save();

  res.status(200).json(cart);
};

// Update quantity
const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const itemIndex = cart.cartItems.findIndex((p) => p.product == productId);

  if (itemIndex === -1)
    return res.status(404).json({ message: "Item not in cart" });

  cart.cartItems[itemIndex].quantity = quantity;
  await cart.save();

  res.status(200).json(cart);
};

module.exports = { addToCart, getCart, removeFromCart, updateCartItem };

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} = require('../controllers/cartController');

const router = express.Router();

router.post('/:productId', protect, addToCart);
router.get('/', protect, getCart);
router.delete('/:productId', protect, removeFromCart);
router.put('/:productId', protect, updateCartItem);

module.exports = router;

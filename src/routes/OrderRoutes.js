const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { placeOrder, getUserOrders } = require('../controllers/OrderController');

const router = express.Router();

router.post('/', protect, placeOrder);       // Place order
router.get('/', protect, getUserOrders);     // View order history

module.exports = router;

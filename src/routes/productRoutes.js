const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCount
} = require('../controllers/productController');

const {protect,isAdmin,authMiddleware} = require("../middlewares/authMiddleware");

router.post('/',protect,isAdmin, createProduct);
//get all product
router.get('/', getProducts);
router.get('/count', getProductCount);
//get a single product
router.get('/:id', getProductById);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;

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

router.post('/', createProduct);
//get all product
router.get('/', getProducts);
router.get('/count', getProductCount);
//get a single product
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

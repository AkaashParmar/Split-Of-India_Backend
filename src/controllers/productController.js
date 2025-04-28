const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Fetch all products
exports.getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

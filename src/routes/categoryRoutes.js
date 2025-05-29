const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getProductsByCategory,
} = require("../controllers/categoryController");

router.post("/", createCategory);
router.get("/", getAllCategories);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory);

//get products by their category Id
router.get('/products/category/:category', getProductsByCategory);


module.exports = router;

const express = require('express');
const router = express.Router();
const { createCategory,getAllCategories,deleteCategory,updateCategory  } = require('../controllers/categoryController');

router.post('/', createCategory);
router.get('/', getAllCategories); 
router.delete('/:id', deleteCategory);
router.put('/:id', updateCategory); 

module.exports = router;

const express = require('express');
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } = require('../controllers/BlogController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // for image

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), createBlog); // Admin create
router.put('/:id', protect, isAdmin, upload.single('image'), updateBlog); // Admin update
router.delete('/:id', protect, isAdmin, deleteBlog); // Admin delete

router.get('/', getAllBlogs); // public
router.get('/:id', getBlogById); // public

module.exports = router;

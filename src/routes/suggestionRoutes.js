const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { handleSuggestionForm } = require('../controllers/productController');

// Setup multer to store files in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '')),
});

const upload = multer({ storage });

// Route for product suggestions
router.post('/', ensureAuthenticated, upload.array('images', 5), handleSuggestionForm);
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Unauthorized' });
}

module.exports = router;

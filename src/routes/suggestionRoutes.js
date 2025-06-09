const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/sendEmail');
const { protect } = require("../middlewares/authMiddleware")  // adjust path if needed

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/suggestions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ dest: 'uploads/' });

// Add protect middleware here
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { productName, categoryName, productDescription } = req.body;
    const files = req.files || [];

    if (!productName || !categoryName || !productDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: 'Unauthorized: user email not found' });
    }

    const imageFiles = files.map((f) => f.originalname).join(', ');

    const emailText = `
New Product Suggestion:

From: ${req.user.email}

Product Name: ${productName}
Category: ${categoryName}
Description: ${productDescription}
Image Files: ${imageFiles || 'No images uploaded'}
    `;

    const attachments = files.map(file => ({
      filename: file.originalname,
      path: file.path,
    }));

    await sendEmail({
      from: req.user.email ,
      to: process.env.EMAIL_USER,
      subject: 'New Product Suggestion Received',
      text: emailText,
      attachments,
      replyTo: req.user.email,
    });

    res.status(200).json({ message: 'Suggestion received and email sent with attachments' });
  } catch (error) {
    console.error('Error in suggestion route:', error);
    res.status(500).json({ error: 'Failed to process suggestion', details: error.message });
  }
});

module.exports = router;

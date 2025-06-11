// ✅ jobApplicationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const JobApplication = require('../models/JobApplication');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/jobs/apply
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const {
      firstName, lastName, email, mobile,
      currentCTC, expectedCTC, noticePeriod, linkedinProfile
    } = req.body;

    const newApplication = new JobApplication({
      firstName, lastName, email, mobile,
      currentCTC, expectedCTC, noticePeriod,
      resume: req.file?.path,
      linkedinProfile
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving job application', error: err.message });
  }
});

module.exports = router; // ✅ this is crucial

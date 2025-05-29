const express = require('express');
const { createRegion, getRegions } = require('../controllers/regionController');
const router = express.Router();

router.post('/', createRegion);
router.get('/get-region', getRegions);

module.exports = router;
